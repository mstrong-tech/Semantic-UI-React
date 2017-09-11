import cx from 'classnames'
import _ from 'lodash'
import Popper from 'popper.js'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import {
  childrenUtils,
  customPropTypes,
  eventStack,
  getElementType,
  getUnhandledProps,
  isBrowser,
  isStyleInViewport,
  makeDebugger,
  META,
  SUI,
  useKeyOnly,
  useKeyOrValueAndKey,
} from '../../lib'
import Portal from '../../addons/Portal'
import PopupContent from './PopupContent'
import PopupHeader from './PopupHeader'

const debug = makeDebugger('popup')

export const POSITIONS = [
  'top left',
  'top right',
  'bottom right',
  'bottom left',
  'right center',
  'left center',
  'top center',
  'bottom center',
]

/**
 * A Popup displays additional information on top of a page.
 */
export default class Popup extends Component {
  static propTypes = {
    /** Display the popup without the pointing arrow. */
    basic: PropTypes.bool,

    /** Primary content. */
    children: PropTypes.node,

    /** Additional classes. */
    className: PropTypes.string,

    /** Simple text content for the popover. */
    content: customPropTypes.itemShorthand,

    /** A flowing Popup has no maximum width and continues to flow to fit its content. */
    flowing: PropTypes.bool,

    /** Takes up the entire width of its offset container. */
    // TODO: implement the Popup fluid layout
    // fluid: PropTypes.bool,

    /** Header displayed above the content in bold. */
    header: customPropTypes.itemShorthand,

    /** Hide the Popup when scrolling the window. */
    hideOnScroll: PropTypes.bool,

    /** Whether the popup should not close on hover. */
    hoverable: PropTypes.bool,

    /** Invert the colors of the Popup. */
    inverted: PropTypes.bool,

    /** Horizontal offset in pixels to be applied to the Popup. */
    offset: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.number),
      PropTypes.number,
    ]),

    /** Events triggering the popup. */
    on: PropTypes.oneOfType([
      PropTypes.oneOf(['hover', 'click', 'focus']),
      PropTypes.arrayOf(PropTypes.oneOf(['hover', 'click', 'focus'])),
    ]),

    /**
     * Called when a close event happens.
     *
     * @param {SyntheticEvent} event - React's original SyntheticEvent.
     * @param {object} data - All props.
     */
    onClose: PropTypes.func,

    /**
     * Called when the portal is mounted on the DOM.
     *
     * @param {null}
     * @param {object} data - All props.
     */
    onMount: PropTypes.func,

    /**
     * Called when an open event happens.
     *
     * @param {SyntheticEvent} event - React's original SyntheticEvent.
     * @param {object} data - All props.
     */
    onOpen: PropTypes.func,

    /**
     * Called when the portal is unmounted from the DOM.
     *
     * @param {null}
     * @param {object} data - All props.
     */
    onUnmount: PropTypes.func,

    /** Position for the popover. */
    position: PropTypes.oneOf(POSITIONS),

    /** Popup size. */
    size: PropTypes.oneOf(_.without(SUI.SIZES, 'medium', 'big', 'massive')),

    /** Custom Popup style. */
    style: PropTypes.object,

    /** Element to be rendered in-place where the popup is defined. */
    trigger: PropTypes.node,

    /** Popup width. */
    wide: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf(['very']),
    ]),
  }

  static defaultProps = {
    position: 'top left',
    offset: '0,0',
    on: 'hover',
    boundariesElement: 'viewport',
    autoFlip: true,
  }

  static _meta = {
    name: 'Popup',
    type: META.TYPES.MODULE,
  }

  static Content = PopupContent
  static Header = PopupHeader

  state = {}

  computeHorizontalOffset = ({ left, right }, offset) => {
    if (_.isNumber(right)) return { left, right: right - offset }
    return { right, left: left - offset }
  }

  computeVerticalOffset = ({ bottom, top }, offset) => {
    if (_.isNumber(top)) return { bottom, top: top + offset }
    return { top, bottom: bottom + offset }
  }

  computeOffset = (style) => {
    const { offset } = this.props
    const [horizontal, vertical] = _.isNumber(offset) ? [offset, 0] : offset

    return {
      ...this.computeHorizontalOffset(style, horizontal),
      ...this.computeVerticalOffset(style, vertical),
    }
  }

  computePopupStyle(positions) {
    const style = { position: 'absolute' }

    // Do not access window/document when server side rendering
    if (!isBrowser) return style

    const { pageYOffset, pageXOffset } = window
    const { clientWidth, clientHeight } = document.documentElement

    if (_.includes(positions, 'right')) {
      style.right = Math.round(clientWidth - (this.coords.right + pageXOffset))
      style.left = 'auto'
    } else if (_.includes(positions, 'left')) {
      style.left = Math.round(this.coords.left + pageXOffset)
      style.right = 'auto'
    } else { // if not left nor right, we are horizontally centering the element
      const xOffset = (this.coords.width - this.popupCoords.width) / 2
      style.left = Math.round(this.coords.left + xOffset + pageXOffset)
      style.right = 'auto'
    }

    if (_.includes(positions, 'top')) {
      style.bottom = Math.round(clientHeight - (this.coords.top + pageYOffset))
      style.top = 'auto'
    } else if (_.includes(positions, 'bottom')) {
      style.top = Math.round(this.coords.bottom + pageYOffset)
      style.bottom = 'auto'
    } else { // if not top nor bottom, we are vertically centering the element
      const yOffset = (this.coords.height + this.popupCoords.height) / 2
      style.top = Math.round((this.coords.bottom + pageYOffset) - yOffset)
      style.bottom = 'auto'

      const xOffset = this.popupCoords.width + 8
      if (_.includes(positions, 'right')) {
        style.right -= xOffset
      } else {
        style.left -= xOffset
      }
    }

    return { ...style, ...this.computeOffset(style) }
  }

  setPopupStyle() {
    if (!this.coords || !this.popupCoords) return
    let position = this.props.position
    let style = this.computePopupStyle(position)

    // Lets detect if the popup is out of the viewport and adjust
    // the position accordingly
    const positions = _.without(POSITIONS, position).concat([position])
    for (let i = 0; !isStyleInViewport(this.popupCoords, style) && i < positions.length; i += 1) {
      style = this.computePopupStyle(positions[i])
      position = positions[i]
    }

    // Append 'px' to every numerical values in the style
    style = _.mapValues(style, value => (_.isNumber(value) ? `${value}px` : value))
    this.setState({ style, position })
  }

  getPortalProps() {
    const portalProps = {}

    const { on, hoverable } = this.props
    const normalizedOn = _.isArray(on) ? on : [on]

    if (hoverable) {
      portalProps.closeOnPortalMouseLeave = true
      portalProps.mouseLeaveDelay = 300
    }
    if (_.includes(normalizedOn, 'click')) {
      portalProps.openOnTriggerClick = true
      portalProps.closeOnTriggerClick = true
      portalProps.closeOnDocumentClick = true
    }
    if (_.includes(normalizedOn, 'focus')) {
      portalProps.openOnTriggerFocus = true
      portalProps.closeOnTriggerBlur = true
    }
    if (_.includes(normalizedOn, 'hover')) {
      portalProps.openOnTriggerMouseEnter = true
      portalProps.closeOnTriggerMouseLeave = false
      // Taken from SUI: https://git.io/vPmCm
      portalProps.mouseLeaveDelay = 70
      portalProps.mouseEnterDelay = 50
    }

    return portalProps
  }

  constructor(props) {
    super(props);
    this.state = {
      position: null,
      transform: null,
      flipped: false,
      actualPosition: null,
      // We set these default offsets to prevent a flash of popper content in the wrong position
      // which can cause incorrect height calculations. Popper will calculate these values
      offsets: {
        popper: {
          left: -9999,
          top: -9999,
        },
      },
      originalPosition: null,
      // fix Safari parent width: https://product-fabric.atlassian.net/browse/ED-1784
      cssPosition: 'absolute',
    };
  }

  componentWillReceiveProps(nextProps) {
    this.applyPopper(nextProps)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.flipped !== this.state.flipped) {
      this.props.onFlippedChange({
        flipped: this.state.flipped,
        actualPosition: this.state.actualPosition,
        originalPosition: this.state.originalPosition,
      });
    }
  }

  componentWillUnmount() {
    if (this.popper) this.popper.destroy()
  }

  extractStyles = (state) => {
    if (state) {
//       const left = Math.round(state.offsets.popper.left);
//       const top = Math.round(state.offsets.popper.top);
// console.log(state.offsets)
//       this.setState({
//         // position: fixed or absolute
//         cssPosition: state.offsets.popper.position,
//         transform: `translate3d(${left}px, ${top}px, 0px)`,
//         // state.flipped is either true or undefined
//         flipped: !!state.flipped,
//         actualPosition: state.position,
//         originalPosition: state.originalPosition,
//       });

      const left = Math.round(state.offsets.reference.left)
      const top = Math.round(state.offsets.popper.top)
      const transform = `translate3d(${left}px, ${top}px, 0)`

      this.setState({ styled : {
        position: state.offsets.popper.position,
        transform,
        WebkitTransform: transform,
      }})
    }
  };

  applyPopper = (props) => {
    //if (!this.props.targetRef || !this.props.contentRef) return
    if (this.popper) this.popper.destroy()
    console.log(this.triggerRef)
if(!this.popupRef) return
    // we wrap our target in a div so that we can safely get a reference to it, but we pass the
    // actual target to popper
    // const actualTarget = this.targetRef;
    // const triggerRef = ReactDOM.findDOMNode(this.props.trigger)
    //
    const popperOpts = {
      placement: 'top-right',
      onCreate: this.extractStyles,
      onUpdate: this.extractStyles,
      modifiers: {
        applyStyle: {
          enabled: false,
        },
        hide: {
          enabled: false,
        },
        // offset: {
        //   enabled: true,
        //   offset: this.props.offset,
        // },
        // flip: {
        //   enabled: !!this.props.autoFlip,
        //   flipVariations: true,
        //   boundariesElement: this.props.boundariesElement,
        //   padding: 0, // leave 0 pixels between popper and the boundariesElement
        // },
        // preventOverflow: {
        //   enabled: !!this.props.autoFlip,
        //   escapeWithReference: true,
        // },
      },
    };
    //
    // // const flipBehavior = getFlipBehavior(props);
    // // if (flipBehavior) {
    // //   popperOpts.modifiers.flip.behavior = flipBehavior;
    // // }
    // console.log(triggerRef, actualTarget)
    this.popper = new Popper(this.triggerRef, this.popupRef, popperOpts);
  }

  // ----------------------------------------
  // Event handlers
  // ----------------------------------------

  handleClose = (e) => {
    debug('handleClose()')

    _.invoke(this.props, 'onClose', e, this.props)
  }

  handleOpen = (e) => {
    debug('handleOpen()')

    this.coords = e.currentTarget.getBoundingClientRect()
    _.invoke(this.props, 'onOpen', e, this.props)
  }

  handlePortalMount = (e) => {
    debug('handlePortalMount()')
    const { hideOnScroll } = this.props

    if (hideOnScroll) eventStack.sub('scroll', this.handleScroll)
    _.invoke(this.props, 'onMount', e, this.props)
  }

  handlePortalUnmount = (e) => {
    debug('handlePortalUnmount()')
    const { hideOnScroll } = this.props

    if (hideOnScroll) eventStack.unsub('scroll', this.handleScroll)
    _.invoke(this.props, 'onUnmount', e, this.props)
  }

  handlePopupRef = (popupRef) => {
    debug('popupMounted()')
// console.log(popupRef)
    this.popupCoords = popupRef ? popupRef.getBoundingClientRect() : null
    this.popupRef = popupRef
    this.setPopupStyle()
    this.applyPopper(this.props)
  }

  handleScroll = () => {
    this.setState({ closed: true })

    eventStack.unsub('scroll', this.handleScroll)
    setTimeout(() => this.setState({ closed: false }), 50)
  }

  // ----------------------------------------
  // Render
  // ----------------------------------------

  render() {
    let {
      basic,
      children,
      className,
      content,
      flowing,
      header,
      inverted,
      size,
      trigger,
      wide,
    } = this.props

    const { position, closed } = this.state
    const style = { ...this.state.style, ...this.props.style }
    const classes = cx(
      'ui',
      position,
      size,
      useKeyOrValueAndKey(wide, 'wide'),
      useKeyOnly(basic, 'basic'),
      useKeyOnly(flowing, 'flowing'),
      useKeyOnly(inverted, 'inverted'),
      'popup transition visible',
      className,
    )

    if (closed) return trigger

    const unhandled = getUnhandledProps(Popup, this.props)
    const portalPropNames = Portal.handledProps

    const rest = _.omit(unhandled, portalPropNames)
    const portalProps = _.pick(unhandled, portalPropNames)
    const ElementType = getElementType(Popup, this.props)
    const { cssPosition, transform } = this.state;
    // console.log(cssPosition, transform)
    const popupJSX = (
      <ElementType {...rest} className={classes} ref={this.handlePopupRef}
                   style={{ top: 0, left: 0, ...this.state.styled }}>
        {children}
        {childrenUtils.isNil(children) && PopupHeader.create(header)}
        {childrenUtils.isNil(children) && PopupContent.create(content)}
      </ElementType>
    )

    const mergedPortalProps = { ...this.getPortalProps(), ...portalProps }
    debug('portal props:', mergedPortalProps)

    return (
      <Portal
        {...mergedPortalProps}
        trigger={trigger}
        triggerRef={c => (this.triggerRef = c)}
        onClose={this.handleClose}
        onMount={this.handlePortalMount}
        onOpen={this.handleOpen}
        onUnmount={this.handlePortalUnmount}
      >
        {popupJSX}
      </Portal>
    )
  }
}

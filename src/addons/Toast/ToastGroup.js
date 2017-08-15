import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import {
  customPropTypes,
  getElementType,
  getUnhandledProps,
  META,
  SUI,
} from '../../lib'
import Transition from '../../modules/Transition'
import Portal from '../Portal'
import Toast from './Toast'

/**
 * A Toast can be used for notifications.
 */
class ToastGroup extends Component {
  static _meta = {
    name: 'ToastGroup',
    parent: 'Toast',
    type: META.TYPES.ADDON,
  }

  static propTypes = {
    /** An element type to render as (string or function). */
    as: customPropTypes.as,

    /* TODO */
    dismissible: PropTypes.bool,

    /* TODO */
    items: customPropTypes.collection,

    /* TODO */
    offset: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),

    /* TODO */
    position: PropTypes.oneOf([
      'top left', 'top center', 'top right',
      'bottom left', 'bottom center', 'bottom right',
    ]),

    /* TODO */
    size: PropTypes.oneOf(_.without(SUI.SIZES, 'medium')),

    /* TODO */
    style: PropTypes.object,
  }

  static defaultProps = {
    offset: 10,
    position: 'top right',
  }

  computeOffset = () => {
    const { offset } = this.props

    return _.isArray(offset) ? offset : [offset, offset]
  }

  computeStyle = () => {
    const { position, style } = this.props
    const [horizontal, vertical] = this.computeOffset()

    const base = {
      position: 'fixed',
      width: 500,
    }

    if (position === 'top right') {
      return {
        ...base,
        ...style,
        top: horizontal,
        right: vertical,
      }
    }
  }

  render() {
    const { dismissible, items, size } = this.props
    const rest = getUnhandledProps(ToastGroup, this.props)
    const ElementType = getElementType(ToastGroup, this.props)

    return (
      <Portal open>
        <ElementType {...rest} style={this.computeStyle()}>
          <Transition.Group>
            {_.map(items, item => Toast.create(item, {
              defaultProps: { dismissible, size },
            }))}
          </Transition.Group>
        </ElementType>
      </Portal>
    )
  }
}

export default ToastGroup

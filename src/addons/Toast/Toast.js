import PropTypes from 'prop-types'
import React, { Component } from 'react'

import Message from '../../collections/Message'
import {
  createShorthandFactory,
  customPropTypes,
  getElementType,
  getUnhandledProps,
  META,
} from '../../lib'
import ToastGroup from './ToastGroup'

/**
 * A Toast can be used for notifications.
 */
class Toast extends Component {
  static _meta = {
    name: 'Toast',
    type: META.TYPES.ADDON,
  }

  static propTypes = {
    /** An element type to render as (string or function). */
    as: customPropTypes.as,

    /* TODO */
    floating: PropTypes.bool,

    /* TODO */
    dismissible: PropTypes.bool,
  }

  static defaultProps = {
    as: Message,
    floating: true,
  }

  static Group = ToastGroup

  handleDismiss = () => {

  }

  render() {
    const { dismissible, floating } = this.props
    const rest = getUnhandledProps(Toast, this.props)
    const ElementType = getElementType(Toast, this.props)

    return (
      <ElementType
        {...rest}
        floating={floating}
        onDismiss={dismissible && this.handleDismiss}
      />
    )
  }
}

Toast.create = createShorthandFactory(Toast, content => ({ content }))

export default Toast

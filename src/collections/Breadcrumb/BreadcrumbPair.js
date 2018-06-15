import PropTypes from 'prop-types'
import { Component } from 'react'

import { createShorthandFactory, customPropTypes } from '../../lib'
import BreadcrumbDivider from './BreadcrumbDivider'
import BreadcrumbSection from './BreadcrumbSection'

class BreadcrumbPair extends Component {
  static propTypes = {
    /** A shorthand for BreadcrumbDivider. */
    divider: customPropTypes.itemShorthand,

    /** A shorthand for Icon. */
    icon: customPropTypes.itemShorthand,

    trailing: PropTypes.bool,
  }

  render() {
    const { divider, icon, trailing, ...rest } = this.props

    return [
      BreadcrumbSection.create(rest, {
        autoGenerateKey: false,
        defaultProps: { key: 'section' },
      }),
      trailing
        ? null
        : BreadcrumbDivider.create(
          { divider, icon },
          {
            autoGenerateKey: false,
            defaultProps: { key: 'divider' },
          },
        ),
    ]
  }
}

BreadcrumbPair.create = createShorthandFactory(BreadcrumbPair, content => ({ content }))

export default BreadcrumbPair

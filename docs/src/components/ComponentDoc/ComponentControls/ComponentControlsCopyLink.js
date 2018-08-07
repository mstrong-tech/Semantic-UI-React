import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Icon, Menu } from 'semantic-ui-react'

export default class ComponentControlsCopyLink extends Component {
  state = {}

  static propTypes = {
    anchorName: PropTypes.string,
    onClick: PropTypes.func,
  }

  componentWillUnmount() {
    clearTimeout(this.timerId)
  }

  handleClick = (e) => {
    const { onClick } = this.props

    e.preventDefault()
    onClick()

    this.setState({ active: true })
    this.timerId = setTimeout(this.resetActive, 3000)
  }

  resetActive = () => this.setState({ active: false })

  render() {
    const { anchorName } = this.props
    const { active } = this.state

    return (
      <Menu.Item href={`#${anchorName}`} onClick={this.handleClick}>
        <Icon color={active ? 'green' : 'grey'} fitted name='linkify' size='large' />
        {active ? ' Copied!' : 'Permalink'}
      </Menu.Item>
    )
  }
}

import faker from 'faker'
import React, { Component } from 'react'
import { Button, Toast } from 'semantic-ui-react'

const makeToast = () => {
  const header = faker.hacker.phrase()
  const success = faker.random.boolean()

  return {
    header,
    success,
    content: faker.hacker.phrase(),
    error: !success,
    key: header,
  }
}

export default class ToastAreaExampleToast extends Component {
  state = { items: [] }

  handleAdd = () => this.setState({ items: [...this.state.items, makeToast()] })

  handleClear = () => this.setState({ items: [] })

  render() {
    const { items } = this.state

    return (
      <div>
        <Button content='Clear toasts' onClick={this.handleClear} />
        <Button content='Add toast' onClick={this.handleAdd} />

        <Toast.Group items={items} />
      </div>
    )
  }
}

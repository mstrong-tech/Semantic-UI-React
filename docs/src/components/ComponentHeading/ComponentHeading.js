import PropTypes from 'prop-types'
import React, { Fragment, PureComponent } from 'react'
import { Header } from 'semantic-ui-react'

import { docTypes } from 'docs/src/utils'
import ComponentHeadingLinks from './ComponentHeadingLinks'
import ComponentHeadingSee from './ComponentHeadingSee'

export default class ComponentDoc extends PureComponent {
  static propTypes = {
    description: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    parentDisplayName: PropTypes.string.isRequired,
    seeTags: docTypes.seeTags.isRequired,
    repoPath: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }

  render() {
    const { description, displayName, parentDisplayName, seeTags, repoPath, type } = this.props

    return (
      <Fragment>
        <Header as='h1' content={displayName} subheader={description} />
        <ComponentHeadingSee seeTags={seeTags} />
        <ComponentHeadingLinks
          displayName={displayName}
          parentDisplayName={parentDisplayName}
          repoPath={repoPath}
          type={type}
        />
      </Fragment>
    )
  }
}

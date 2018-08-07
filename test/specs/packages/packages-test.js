const assert = require('assert')
const fs = require('fs')

const config = require('../../../config')
const { paths } = config

const packages = fs.readdirSync(paths.packages())

describe('packages', () => {
  it('each package should have kebab cased name', () => {
    packages.forEach((packageName) => {
      assert.ok(
        /^[a-z-]+$/.test(packageName),
        `"${packageName}" doesn't match kebab case`,
      )
    })
  })

  it('each package should have "src" and "test" directory', () => {
    packages.forEach((packageName) => {
      assert.ok(
        fs.existsSync(paths.packages(packageName, "src")),
        `"${packageName}" doesn't contains "src" directory`,
      )
      assert.ok(
        fs.existsSync(paths.packages(packageName, "test")),
        `"${packageName}" doesn't contains "src" directory`,
      )
    })
  })

  it('each package should have "package.json"', () => {
    packages.forEach((packageName) => {
      assert.ok(
        fs.existsSync(paths.packages(packageName, "package.json")),
        `"${packageName}" doesn't contains "package.json" file`,
      )
    })
  })

  it('each package should have matched name in "package.json"', () => {
    packages.forEach((packageName) => {
      const packageJson = require(paths.packages(packageName, "package.json"))

      assert.equal(
        packageJson.name,
        `semantic-ui-react-${packageName}`,
        `"${packageName}/package.json" contains an invalid name`,
      )
    })
  })
})

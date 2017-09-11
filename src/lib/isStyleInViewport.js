import _ from 'lodash'

/**
 * Checks if the style would display the element outside of the view port.
 * @param {Object} coordinates A component coordinates.
 * @param {number} [coordinates.height]
 * @param {number} [coordinates.width]
 * @param {Object} style A component style.
 * @param {number} [coordinates.left]
 * @param {number} [coordinates.top]
 */
const isStyleInViewport = (coordinates, style) => {
  const { height, width } = coordinates
  const { left, top } = style
  const { clientHeight, clientWidth } = document.documentElement
  const { pageXOffset, pageYOffset } = window

  const element = { height, left, top, width }

  if (_.isNumber(style.right)) element.left = clientWidth - style.right - element.width
  if (_.isNumber(style.bottom)) element.top = clientHeight - style.bottom - element.height

  // hidden on top
  if (element.top < pageYOffset) return false
  // hidden on the bottom
  if (element.top + element.height > pageYOffset + clientHeight) return false
  // hidden the left
  if (element.left < pageXOffset) return false
  // hidden on the right
  if (element.left + element.width > pageXOffset + clientWidth) return false

  return true
}

export default isStyleInViewport

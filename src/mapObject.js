// inspired by ramda and rambda
/* eslint-disable */

const mapObject = (fn, obj) => {
  const willReturn = {}

  for (const prop in obj) {
    willReturn[prop] = fn(obj[prop], prop)
  }

  return willReturn
}

export default mapObject

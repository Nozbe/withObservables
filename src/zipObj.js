// inspired by ramda and rambda
/* eslint-disable */

const zipObj = (keys, values) => {
  if (values === undefined) {
    return function(values) {
      return zipObj(keys, values)
    }
  }

  const result = {}

  for (var i = 0, l = Math.min(keys.length, values.length); i < l; i++) {
    result[keys[i]] = values[i]
  }

  return result
}

export default zipObj

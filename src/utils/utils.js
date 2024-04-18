export function getKeyByValueAttribute(object, attribute, value) {
  return Object.keys(object).find(key => object[key][attribute] === value);
}
/**
 * Searches for the key with a certain value in a certain attribute.
 * It returns the first found key. If it does not find any key, returns
 * undefined.
 * 
 * The object structured to work with this function must be something like
 * the following example:
 * 
 * ```
 * {
 *   "upperKey1": [
 *     {"attr1": val1, "attr2": val2, "attr3": val3},
 *     {"attr1": val4, "attr2": val5, "attr3": val6},
 *     ...
 *  ],
 *   "upperKey2": [
 *     {"attr1": val7, "attr2": val8, "attr3": val9},
 *     {"attr1": val10, "attr2": val11, "attr3": val12},
 *     ...
 *  ],
 *  
 * }
 * ```
 *
 * TODO: Check if each object in the array is a string, if it is,
 * use the function JSON.parse(objectString).
 *  
 * @param {Object} object 
 * @param {string} attribute 
 * @param {*} value 
 * @returns string | undefined
 */
export function getKeyByValueAttribute(object, attribute, value) {
  const upperKeys = Object.keys(object);
  for(const upperKeyIdx in upperKeys) {
    const upperKey = upperKeys[upperKeyIdx];
    for(const keyIdx in object[upperKey]) {
      let objData = object[upperKey][keyIdx];
      if (objData instanceof String)
        objData = JSON.parse(objData);
      if (objData[attribute] === value)
        return upperKey;
    }
  }
  return undefined;
}

/**
 * @function
 * @description Deep clone a class instance.
 * @param {object} instance The class instance you want to clone.
 * @returns {object} A new cloned instance.
 */
export function clone(instance) {
  return Object.assign(
    Object.create(
      // Set the prototype of the new object to the prototype of the instance.
      // Used to allow new object behave like class instance.
      Object.getPrototypeOf(instance),
    ),
    // Prevent shallow copies of nested structures like arrays, etc
    JSON.parse(JSON.stringify(instance)),
  );
}
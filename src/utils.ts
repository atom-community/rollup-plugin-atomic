// function to check if the first array has any of the second array
// first array can have `[string, object]` as their input
export function includesAny(arr1: Array<string | [string, Object]>, arr2: Array<string>): null | number {
  for (let index = 0; index < arr1.length; index++) {
    const elm = arr1[index]
    let name: string
    if (typeof elm === "string") {
      // plugin name only
      name = elm
    } else {
      // plugin with options
      name = elm[0]
    }
    if (arr2.includes(name)) {
      return index
    }
  }
  return null
}

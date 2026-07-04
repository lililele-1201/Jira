import { useEffect, useState } from "react"

export const isFalsy = (value: unknown) => value === 0 ? false : !value

export const cleanObject = (object: object) => {
  const result = {...object}
  Object.keys(result).forEach(key => {
    //@ts-ignore
    const value = result[key]
    if(isFalsy(value)) {
      //@ts-ignore
      delete result[key]
    }
  })
  return result
}

//使用custom Hook代替index.jsx中useEffct中的[]
export const useMount = (callback: ()=> void) => {
  useEffect(() => {
    callback()
  },[])
}

export const useDebounce = <V>(value: V,delay?: number) => {
  const [debounceValue,setDebounceValue] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounceValue(value),delay)
    return () => clearTimeout(timeout)
  },[value,delay])
  return debounceValue
}
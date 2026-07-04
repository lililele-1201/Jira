// 导入 React 的 useEffect 和 useState Hook
import { useEffect, useRef, useState } from "react";

/**
 * 判断值是否为"假值"（falsy）
 * @param value - 需要判断的值
 * @returns - 如果是 0 返回 false（0 是有效数字），否则返回 !value
 * 
 * 注意：JavaScript 中的假值包括：null, undefined, '', false, NaN
 * 但 0 是特殊情况，我们认为 0 是有效值，所以单独处理
 */
export const isFalsy = (value: unknown) => value === 0 ? false : !value

export const isVoid = (value: unknown) =>
  value === undefined || value === null || value === "";
/**
 * 清理对象中的假值属性
 * @param object - 需要清理的对象
 * @returns - 移除假值属性后的新对象
 * 
 * 用途：用于生成 API 查询参数时，移除空值、undefined 等无效参数
 */
export const cleanObject = (object?: { [key: string]: unknown }) => {
  // 先创建对象的浅拷贝，避免修改原对象
  const result = {...object}
  
  // 遍历对象的所有键
  Object.keys(result).forEach(key => {
    const value = result[key]
    
    // 如果值是假值，删除该属性
    if(isFalsy(value)) {
      // @ts-ignore 忽略类型检查
      delete result[key]
    }
  })
  
  // 返回清理后的对象
  return result
}

/**
 * 自定义 Hook：组件挂载时执行一次回调函数
 * @param callback - 要执行的回调函数
 * 
 * 用途：替代 useEffect(() => { ... }, [])，语义更清晰
 */
export const useMount = (callback: ()=> void) => {
  useEffect(() => {
    // 执行传入的回调函数
    callback()
  },[])  // 空数组表示只在组件挂载时执行一次
}

/**
 * 自定义 Hook：防抖函数
 * @template V - 值的类型（泛型）
 * @param value - 需要防抖的值
 * @param delay - 延迟时间（毫秒），默认 300ms
 * @returns - 防抖后的值
 * 
 * 用途：用于搜索框等需要延迟更新的场景，避免频繁触发 API 请求
 * 
 * 工作原理：
 * 1. 当 value 改变时，设置一个定时器
 * 2. 如果在 delay 时间内 value 再次改变，清除之前的定时器，重新计时
 * 3. 只有当 delay 时间内没有新的变化，才更新 debounceValue
 */
export const useDebounce = <V>(value: V, delay?: number) => {
  // 初始化状态，将传入的 value 作为初始值
  const [debounceValue, setDebounceValue] = useState(value)

  useEffect(() => {
    // 设置定时器，delay 毫秒后更新 debounceValue
    const timeout = setTimeout(() => {
      setDebounceValue(value)
    }, delay)

    // 清理函数：在下次 effect 执行前或组件卸载时清除定时器
    return () => clearTimeout(timeout)
  }, [value, delay])  // 依赖项：value 或 delay 改变时重新执行

  // 返回防抖后的值
  return debounceValue
}

export const useDocumentTitle = (title: string, keepOnUnmount = true) => {
  const oldTitle = useRef(document.title).current;
  useEffect(() => {
    document.title = title;
  }, [title]);
  useEffect(() => {
    return () => {
      if (!keepOnUnmount) {
         // 如果不指定依赖，读到的就是旧title
        document.title = oldTitle;
      }
    };
  }, [keepOnUnmount, oldTitle]);
};

export const resetRoute = () => (window.location.href = window.location.origin);

/**
 * 传入一个对象，和键集合，返回对应的对象中的键值对
 * @param obj
 * @param keys
 */
export const subset = <
  O extends { [key in string]: unknown },
  K extends keyof O
>(
  obj: O,
  keys: K[]
) => {
  const filteredEntries = Object.entries(obj).filter(([key]) =>
    keys.includes(key as K)
  );
  return Object.fromEntries(filteredEntries) as Pick<O, K>;
};
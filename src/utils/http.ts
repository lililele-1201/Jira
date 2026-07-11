import qs from 'qs'
import * as auth from 'auth-provider'
import { useAuth } from 'context/auth-context'
import { useCallback } from 'react'

const apiUrl = process.env.REACT_APP_API_URL

interface Config extends RequestInit {
  token?: string,
  data?: object
}

export const http = async (
  endpoint: string, 
  {data, token, headers, ...customConfig}:Config = {}) => {
  const config = {
    method: 'GET',
    headers : {
      Authorization: token ? `Bearer ${token}` : ``,
      'Content-Type': data ? 'application/json' : '',
    },
    ...customConfig
  }
  if(config.method.toUpperCase()==='GET'){
    endpoint += `?${qs.stringify(data)}`
  }else {
    config.body = JSON.stringify(data || {})
  }
  //axios 和 fetch 的表现不一样，axios可以直接在返回状态不为2xx的时候抛出异常
  return window.fetch(`${apiUrl}/${endpoint}`, config)
  .then(async response => {
    if (response.status === 401) {
      await auth.logout()
      window.location.reload()
      return Promise.reject({message: '请重新登录'})
    }
    const data = await response.json()
    if (response.ok) {
      return data
    } else {
      return Promise.reject(data)
    }
  })
}
 
export const useHttp = () => {
  const {user} = useAuth()
  //utility type的用法：用泛型给它传入一个其他类型，然后utility type对这个类型进行某种操作
  return useCallback(
    (...[endpoint,config]: Parameters<typeof http>) => 
    http(endpoint, {...config, token: user?.token}),
    [user?.token]
  );
};

//联合类型
//let myFavoritNumber: string | number
//myFavoritNumber = 7

//类型别名
//type FavoritNumber = string | number
//let roseFavoritNumber: FavoritNumber = '6'

//类型别名在很多情况下可以和interface互换
//interface Person {
//  name: string
//}
//type Person = { name: string }
//const xiaoMing: Person = { name: string } 

//interface 也没办法实现Utility type
//type Person = {
    //name: string
    //age: number
//}
//const xiaoMing:Partial<Person> = {} 
//const shenMiRen: Omit<Person,any | name> = {} 
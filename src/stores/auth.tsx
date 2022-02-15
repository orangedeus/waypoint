import {
    atom, AtomEffect, RecoilRootProps
} from 'recoil'

import { Auth } from '../types/Auth'

// const persist = (key: string) => ({ setSelf, onSet }: AtomEffect<Auth>) => {
//     const prevAuth = localStorage.getItem(key)
//     if (prevAuth !== null) {
//         setSelf(JSON.parse(prevAuth))
//     }

//     onSet((newValue: Auth, _, isReset: boolean) => {
//         isReset ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(newValue))
//     })
// }

export const loggingInState = atom({
    key: 'loggingInState',
    default: false
})


export const authState = atom<Auth>({
    key: 'authState',
    default: {
        user: 0,
        admin: 0,
        surveyed: 0,
        code: ''
    }
})
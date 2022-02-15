import React, { useEffect, useState } from 'react'
import Modal from '../../components/Modal'
import s from './login.module.scss'

import bust from '../../assets/bust.svg'

import {
    loggingInState,
    authState
} from '../../stores/auth'

import { useRecoilState } from 'recoil'
import InputBox from '../../components/InputBox'
import { service } from '../../utils/api/AuthService'

import x from '../../assets/x.svg'
import check from '../../assets/check.svg'

type ValidType = 'yes' | 'no' | 'default'

const Login = (): JSX.Element => {
    const [, setAuth] = useRecoilState(authState)
    const [loggingIn, setLoggingIn] = useRecoilState(loggingInState)
    const [valid, setValid] = useState<ValidType>('default')
    const [inputCode, setInputCode] = useState<string | undefined>()
    const [fail, setFail] = useState(false)

    const toggleLoggingIn = () => {
        setLoggingIn(!loggingIn)
    }

    const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setInputCode(value)

        if (value === undefined) {
            setValid('default')
            return
        }
        if (value === '') {
            setValid('no')
            return
        }
        if (value.length < 10 || value.length > 21) {
            setValid('no')
            return
        }
        setValid('yes')
    }

    const handleButtonClick = () => {
        if (valid === 'no') {
            setInputCode('')
            setValid('default')
        }
        if (valid === 'yes') {
            service.postLoginCode(String(inputCode)).then((data) => {
                console.log(data)
                if (data.user) {
                    localStorage.setItem('auth', JSON.stringify(data))
                    setAuth(data)
                    setLoggingIn(false)
                } else {
                    setFail(true)
                }
            })
        }
    }

    useEffect(() => {
        if (fail) {
            setValid('no')
        }
    }, [fail])


    useEffect(() => {
        setFail(false)
    }, [inputCode])

    const getBgColor = () => {
        if (valid === 'no') {
            return `red`
        }
        if (valid === 'yes') {
            return `#62A2CC`
        }
        if (valid === 'default') {
            return `#ccc`
        }
    }

    return (
        <Modal className={s.container} onBlanketClick={toggleLoggingIn} >
            <div className={s.form}>
                <InputBox className={s.codeInput} onEnter={handleButtonClick} type='password' id='code' label='Code' value={inputCode} onChange={handleChangeInput} fail={fail} number={false} />
                <button className={s.loginBtn} onClick={handleButtonClick} disabled={Boolean(valid === 'default')} style={{
                    backgroundColor: getBgColor()
                }}>
                    {valid === 'no' ? <img src={x} alt="Clear" width={30} height={30} /> : <img src={check} alt="Submit" />}
                </button>
            </div>
            <div className={s.label}>
                <img src={bust} alt="bust icon" />
            </div>
        </Modal>
    )
}

export default Login
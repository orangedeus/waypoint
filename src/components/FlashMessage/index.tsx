import React, { ReactNode } from 'react'
import s from './flash.module.scss'


export type FlashMessageProps = {
    message?: ReactNode
    type?: '+' | '-' | 'none'
}

const FlashMessage = ({message, type = "none"}: FlashMessageProps) => {

    const getSymbol = () => {
        switch (type) {
            case '+':
                return <img src="/assets/check.png" alt="Success" />
            case '-':
                return <img src="/assets/delete.png" alt="Fail" />
            case 'none':
                return null
        }
    }

    return <div className={s.container}>
        <div className={s.symbol}>
            {getSymbol()}
        </div>
        <div className={s.message}>
            {message}
        </div>
    </div>
}


export default FlashMessage
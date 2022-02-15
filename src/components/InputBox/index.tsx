import React, {useEffect, useRef, useState} from 'react'
import s from './text.module.scss'
import cx from 'classnames'

type InputBoxProps = {
    id: string
    label: string
    value: string | undefined
    number?: boolean
    type?: string
    fail?: boolean
    className?: string
    onEnter?: () => void
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const INVALID_VALUE = [
    'Hindi numero',
    'Negatibong numero',
    'Walang laman',
    '10 - 21 characters',
    'Empty',
    'Wrong code',
    ''
]

const InputBox = ({id, label, value, number = true, type = 'text', fail = false, className, onEnter, onChange}: InputBoxProps): JSX.Element => {

    const [error, setError] = useState(-1)

    const typeRef = useRef<any>()

    const validateValue = () => {
        if (number) {
            if (value === undefined) {
                setError(6)
                return
            }
            
            if (value === '') {
                setError(2)
                return
            }
    
            const num = Number(value)
    
            if (!Number.isInteger(num)) {
                setError(0)
                return
            }
            if (num < 0) {
                setError(1)
                return
            }
            setError(-1)
        } else {
            if (value === undefined) {
                setError(6)
                return
            }
            if (value === '') {
                setError(4)
                return
            }
            if (value.length < 10 || value.length > 21) {
                setError(3)
                return
            }
            setError(-1)
        }
    }

    const startErrorMessage = () => {

        clearTimeout(typeRef.current)

        const typeError = (i = 0) => {
            labelRef.current.innerHTML += ` (${INVALID_VALUE[error]})`.charAt(i)
            i++
            typeRef.current = setTimeout(() => typeError(i), 50)
        }

        if (labelRef.current) {
            typeError()
        }

        
    }

    useEffect(() => {
        if (fail) {
            setError(5)
        }
    }, [fail])

    useEffect(() => {
        if (error !== -1) {
            if (labelRef.current) {
                clearTimeout(typeRef.current)
                labelRef.current.innerHTML = label
            }
            startErrorMessage()
        } else {
            if (labelRef.current) {
                clearTimeout(typeRef.current)
                labelRef.current.innerHTML = label
            }
        }
    }, [error])

    useEffect(() => {
        if (value !== undefined) {
            validateValue()
        }
    }, [value])

    const labelRef = useRef<any>()
    
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            onChange(event)
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && onEnter) {
            onEnter()
        }
    }

    const getBorderStyle = () => {
        if (error !== -1) {
            return { border: `solid 3px red` }
        } else {
            return undefined
        }
    }

    return <div className={`${s.container}${` ${className && className}`}`}>
        <input id={id} value={value} type={type} min={0} className={s.container} style={getBorderStyle()} onKeyDown={handleKeyDown} onChange={handleChange} />
        <label ref={labelRef} htmlFor={id} style={{
            color: error !== -1 ? 'red' : 'black'
        }}>
            {label}
        </label>
    </div>
}

export default InputBox
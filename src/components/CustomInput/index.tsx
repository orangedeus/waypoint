import React, {useEffect, useRef, useState} from 'react'
import s from './input.module.scss'
import cx from 'classnames'

type ErrorHandler = {
    onError: (value: string, errorSetter: React.Dispatch<React.SetStateAction<number>>) => void
    errorMessages: string[]
}

interface CustomInputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    label: string
    errorHandler: ErrorHandler
    containerClass?: string
}

const CustomInput = ({id, value, label, errorHandler, containerClass, onChange, ...props}: CustomInputProps): JSX.Element => {

    const [error, setError] = useState(-1)
    const typeRef = useRef<any>()
    
    const startErrorMessage = () => {

        clearTimeout(typeRef.current)

        const typeError = (i = 0) => {
            labelRef.current.innerHTML += ` (${errorHandler.errorMessages[error]})`.charAt(i)
            i++
            typeRef.current = setTimeout(() => typeError(i), 50)
        }

        if (labelRef.current) {
            typeError()
        }

        
    }

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

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        errorHandler.onError(event.target.value, setError)
        if (onChange) {
            onChange(event)
        }
    }

    const getBorderStyle = () => {
        if (error !== -1) {
            return { border: `solid 3px red` }
        } else {
            return undefined
        }
    }

    const labelRef = useRef<any>()


    return <div className={cx(s.container, {
        [String(containerClass)]: containerClass
    })}>
        <input id={id} {...props} style={getBorderStyle()} onChange={handleChange} />
        <label ref={labelRef} htmlFor={id} style={{
            color: error !== -1 ? 'red' : 'black'
        }}>
            {label}
        </label>
    </div>
}

export default CustomInput
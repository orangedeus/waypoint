import React, { useState, useEffect, ReactNode, DetailedHTMLProps, HTMLAttributes } from "react"

import s from './modal.module.scss'

type ModalProps = {
    children?: ReactNode
    className?: string
    onBlanketClick?: () => void
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

const Modal = ({children, className = "", onBlanketClick, ...props}: ModalProps): JSX.Element => {

    useEffect(() => {
        document.body.style.overflow = `hidden`

        return () => {
            document.body.style.overflow = ''
        }
    }, [])

    const handleBlanketClick = () => {
        if (onBlanketClick) {
            onBlanketClick()
        }
    }

    return (
        <>
            <div className={`${s.container} ${className}`} {...props}>
                {children}
            </div>
            <div className={s.blanket} onClick={handleBlanketClick} />
        </>
    )
}

export default Modal
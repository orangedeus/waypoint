import React, { useState, useEffect, ReactNode } from "react"

import s from './modal.module.scss'

type ModalProps = {
    children?: ReactNode
    className?: string
    onBlanketClick?: () => void
}

const Modal = ({children, className = "", onBlanketClick}: ModalProps): JSX.Element => {

    const handleBlanketClick = () => {
        if (onBlanketClick) {
            onBlanketClick()
        }
    }

    return (
        <>
            <div className={s.blanket} onClick={handleBlanketClick} />
            <div className={`${s.container} ${className}`}>
                {children}
            </div>
        </>
    )
}

export default Modal
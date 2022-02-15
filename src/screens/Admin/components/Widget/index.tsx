import React, { ReactNode } from 'react'
import s from './widget.module.scss'

type WidgetProps = {
    children?: ReactNode
}

const Widget = ({children}: WidgetProps): JSX.Element => {
    return <div className={s.container}>
        <div className={s.image} />
        <div className={s.arrow} />
        <div className={s.dropdown}>
            {children}
        </div>
    </div>
}

export default Widget
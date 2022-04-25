import React, { DetailedHTMLProps, HTMLAttributes, ReactNode, useState } from 'react'
import s from './tooltip.module.scss'
import cx from 'classnames'

type TooltipProps = {
    children?: ReactNode
    className?: string
    iClass?: string
    label?: ReactNode
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

const Tooltip = ({children, label, className, iClass, ...props}: TooltipProps): JSX.Element => {

    const [hovering, setHovering] = useState(false)

    const handleMouseEnter = () => {
        setHovering(true)
    }

    const handleMouseLeave = () => {
        setHovering(false)
    }

    return <div className={cx(s.container, {
        [String(iClass)]: iClass
    })}
    >
        {label ?? `ⓘ` }
        <div className={s.tail} />
        <div className={cx(s.tooltip, {
            [String(className)]: className
        })} {...props}>
            {children}
        </div>
    </div>
}

export default Tooltip
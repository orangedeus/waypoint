import React from 'react'
import cx from 'classnames'
import s from './widgetBtn.module.scss'


type WidgetButtonProps = {
    children?: React.ReactNode
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

const WidgetButton = ({className, children, ...props}: WidgetButtonProps): JSX.Element => {
    return <div className={cx(s.nav, {
        [String(className)]: className
    })} {...props}>
        {children}
    </div>
}

export default WidgetButton
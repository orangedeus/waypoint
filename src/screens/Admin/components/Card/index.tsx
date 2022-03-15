import React, {ReactNode} from 'react'
import s from './card.module.scss'
import cx from 'classnames'


interface CardProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    children?: ReactNode
    header?: ReactNode | JSX.Element
    className?: string
}

const Card = ({ children, header, className, ...props }: CardProps): JSX.Element => {

    return <div className={cx(s.card, {
        [String(className)]: className
    })} {...props} >
        {header && 
        <>
            <div className={s.header}>
                {header}
            </div>
            <div className={s.divider} />
        </>}
        <div className={s.body}>
            {children}
        </div>
    </div>
}

export default Card
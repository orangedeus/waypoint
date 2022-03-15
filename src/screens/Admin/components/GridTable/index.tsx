import React, {DetailedHTMLProps, HTMLAttributes, ReactNode} from 'react'
import s from './grid.module.scss'

type Column<T> = {
    key: keyof T
    display: (data: any) => string
}

type GridProps<T> = {
    children: ReactNode
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>

const GridTable = <T,>({children, ...props}: GridProps<T>): JSX.Element => {
    return <div className={s.container} {...props}>
        {children}
    </div>
}

export default GridTable
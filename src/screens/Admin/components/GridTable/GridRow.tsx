import React, {DetailedHTMLProps, HTMLAttributes, ReactNode} from 'react'
import s from './grid.module.scss'

type RowProps<T> = {
    children?: ReactNode
    columns: number
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>


const GridRow = <T,>({columns, children, ...props}: RowProps<T>): JSX.Element => {

    return <div className={s.rowContainer} style={{
        display: `grid`,
        gridTemplateColumns: `repeat(${columns}, 1fr)`
    }} {...props}>
        {children}
    </div>
}

export default GridRow
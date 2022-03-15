import React, {DetailedHTMLProps, HTMLAttributes, ReactNode} from 'react'
import s from './grid.module.scss'

type CellProps<T> = {
    children?: ReactNode
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>


const GridCell = <T,>({children, ...props}: CellProps<T>): JSX.Element => {

    return <div className={s.cell} {...props}>
        {children}
    </div>
}

export default GridCell
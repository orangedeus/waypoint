import React, {DetailedHTMLProps, TableHTMLAttributes} from 'react'
import s from './table.module.scss'

type Column<T> = {
    key: keyof T
    display: (data: any) => string
}

type TableProps<T> = {
    data: T[]
    columns: Column<T>[]
} & DetailedHTMLProps<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>

const Table = <T,>({columns, data, ...props}: TableProps<T>): JSX.Element => {
    return <table {...props}>
        <thead className={s.thead}>
            <tr>
                {columns.map((column) =>
                    <th key={String(column.key)}>{String(column.key).charAt(0).toUpperCase() + String(column.key).slice(1)}</th>
                )}
            </tr>
        </thead>
        <tbody>
            {data.map((item: T, i: number) => 
                <tr key={`table-row-${i}`}>
                    {columns.map((column) =>
                        <td key={`cell-${column.key}-${i}`}>
                            {column.display(item[column.key])}
                        </td>
                    )}
                </tr>
            )}
        </tbody>
    </table>
}

export default Table
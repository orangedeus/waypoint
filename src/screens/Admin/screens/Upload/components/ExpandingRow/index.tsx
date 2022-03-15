import React, { useState, ReactNode, DetailedHTMLProps, HTMLAttributes, useEffect } from 'react'
import GridRow from '../../../../components/GridTable/GridRow'
import s from './expanding.module.scss'
import cx from 'classnames'
import { service } from '../../../../../../utils/api/AdminService'
import { BACKEND_API } from '../../../../../../utils/api/endpoints'
import { FileStops } from '../../../../../../types/Admin'

type RowProps<T> = {
    children?: ReactNode
    className?: string
    expanding?: ReactNode
    columns: number
    filename?: string
    route?: string
    batch?: string | number
    expandable?: boolean
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>


const ExpandingRow = <T,>({columns, expandable, className, filename, route, batch, expanding, children, ...props}: RowProps<T>): JSX.Element => {

    const [expanded, setExpanded] = useState(false)

    const [stops, setStops] = useState<FileStops[]>([])

    const handleClick = () => {
        if (!stops.length) {
            service.getFileData(String(filename), String(route), String(batch)).then((data) => {
                console.log(data)
                setStops(data)
            })
        }
        setExpanded(e => !e)
    }

    useEffect(() => {
        console.log(stops)
    }, [stops])

    return <>
        <GridRow columns={columns} onClick={handleClick} className={cx(s.row, className)} style={{
        display: `grid`,
        gridTemplateColumns: `repeat(${columns}, 1fr)`
    }} {...props}>
        {children}
    </GridRow>
    <div className={cx(s.expanding, {
        [s.collapsed]: !expanded || !expandable
    })}> 
        <div className={s.dataContainer}>
            <div className={s.dataHeader}>
                {`Total duration: ${stops.reduce((sum, stop) => sum + Number(stop.duration), 0)}, Total stops: ${stops.length}`}
            </div>
            <div className={s.links}>
            {stops.map((stop, i) => <div key={`${stop.url}-${i}`} className={s.dataRow}>
                {stop.time !== null && <span className={s.time}>{`${new Date(stop.time).toLocaleDateString()} ${new Date(stop.time).toLocaleTimeString()}`}</span>}
                <div className={s.circle}>
                    <div className={s.location}>
                        <div className={s.tail} />
                        <div className={s.coordinates}>{`(${stop.location.x}, ${stop.location.y})`}</div>
                    </div>
                </div>
                <a href={`${BACKEND_API}/videos/${stop.url}`} className={s.data} target="popup" onClick={() => {
                    window.open(`${BACKEND_API}/videos/${stop.url}`, 'popup', 'width=800,height=450')
                }}>{stop.url}</a>
            </div>)}
            </div>
        </div>
    </div>
    </>
}

export default ExpandingRow
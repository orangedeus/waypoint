import React, { useEffect, useState } from 'react'
import { SingleValue } from 'react-select'
import { getBatchOptions, getRoutesOptions } from '../../../../utils/api'
import Card from '../../components/Card'
import Uploader from './components/Uploader'

import { service } from '../../../../utils/api/AdminService'

import GridTable from '../../components/GridTable'
import GridRow from '../../components/GridTable/GridRow'
import GridCell from '../../components/GridTable/GridCell'
import s from './upload.module.scss'

import cx from 'classnames'

import Select from 'react-select'
import ExpandingRow from './components/ExpandingRow'

const Upload = (): JSX.Element => {

    const [route, setRoute] = useState<string>('')
    const [routes, setRoutes] = useState<string[]>([])
    const [batch, setBatch] = useState<string | number>('')
    const [batches, setBatches] = useState<any[]>([])

    const [tracking, setTracking] = useState<any>([])

    const [trackigRoute, setTrackingRoute] = useState<string>('')
    const [trackingBatch, setTrackingBatch] = useState<string | number>('')
    const [trackingBatches, setTrackingBatches] = useState<any[]>([])

    useEffect(() => {
        console.log(tracking)
    }, [tracking])

    const handleRouteOpen = () => {
        getRoutesOptions().then((data) => {
            setRoutes(data)
        })
    }

    const handleRouteSelect = (event: SingleValue<any>) => {
        if (event && event.value) {
            setRoute(event.label)
        }
    }

    const handleBatchOpen = () => {
        getBatchOptions(route).then((data) => {
            setBatches(data.map((batch: any) => ({value: batch.batch, label: batch.batch})))
        })
    }

    const handleBatchSelect = (event: SingleValue<{value: string, label: string}>) => {
        if (event && event.value) {
            setBatch(event.value)
        }
    }
    
    useEffect(() => {
        service.getTrackingData(route, batch).then((data) => {
            setTracking(data)
        })
    }, [route, batch])

    return <div className={s.container}>
        <Card header="Upload and process" className={s.upload}>
            <Uploader />
        </Card>
        <Card header={
            <div className={s.trackingHeader}>
                <span>
                    Upload and process tracking
                </span>
                <div className={s.selectContainer}>
                    <Select menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} placeholder="Select route..." className={s.select} options={routes} onMenuOpen={handleRouteOpen} onChange={handleRouteSelect} />
                    <Select menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} placeholder="Select batch..." className={s.select} options={batches} onMenuOpen={handleBatchOpen} onChange={handleBatchSelect} />
                </div>   
                <div />
            </div>
        } className={s.upload}>
            <div className={s.tableContainer}>
            {Boolean(tracking.length) && <GridTable className={s.table}>
                <GridRow className={s.stickyRow} columns={6}>
                    <GridCell className={s.tableHeader}>
                        ID
                    </GridCell>
                    <GridCell className={s.tableHeader}>
                        Filename
                    </GridCell>
                    <GridCell className={s.tableHeader}>
                        Status
                    </GridCell>
                    <GridCell className={s.tableHeader}>
                        Route
                    </GridCell>
                    <GridCell className={s.tableHeader}>
                        Batch
                    </GridCell>
                    <GridCell className={s.tableHeader}>
                        Action
                    </GridCell>
                </GridRow>
                {tracking.map((item: any) => {
                    const {duration, resulting, splices, ...unomitted} = item
                    return <ExpandingRow expandable={item.status === 'Done!'} filename={item.filename} route={item.route} batch={item.batch} expanding={
                        item.status === 'Done!' &&
                        <div className={s.tableData}>
                            'Processing data here!'
                            'Processing data here!'
                            'Processing data here!'
                            'Processing data here!'
                            'Processing data here!'
                        </div>
                    } columns={6}>
                        {Object.keys(unomitted).map((column, i) => {
                                return <GridCell key={`upload-grid-cell-${i}-${unomitted['filename']}`} className={cx(s.tableItem, {
                                    [s.done]: ((unomitted['status'] === 'Done!') && (column === 'id'))
                                })}>
                                    {item[column]}
                                </GridCell>
                            })}
                            <GridCell className={s.tableItem}>
                                <button className={s.deleteButton}>
                                    Delete
                                </button>
                            </GridCell>
                    </ExpandingRow>
                })}
            </GridTable>}
            </div>
        </Card>
    </div>
}

export default Upload
import React, { useEffect, useMemo, useState } from 'react'
import Select, { SingleValue } from 'react-select'
import Card from '../../components/Card'
import { BACKEND_API } from '../../../../utils/api/endpoints'

import s from './data.module.scss'

import { CSVLink } from 'react-csv'

import { getRoutesOptions, getBatchOptions } from '../../../../utils/api/index'
import { service } from '../../../../utils/api/AdminService'

type Data = 'videos' | 'stops' | 'survey' | 'total'

type DataOption = {
    value: Data
    label: string
}

type RouteOption = {
    value: string
    label: string
}

type BatchOption = {
    value: number
    label: string
}

const dataOptions: DataOption[] = [
    {value: "videos", label: "Videos" },
    {value: "stops", label: "Stops"},
    {value: "survey", label: "Survey" },
    {value: "total", label: "Total"}
]

const Data = (): JSX.Element => {

    const [data, setData] = useState<Data | undefined>()
    const [route, setRoute] = useState<undefined | string>()
    const [routes, setRoutes] = useState<RouteOption[]>([])

    const [batch, setBatch] = useState<number | undefined>()
    const [batches, setBatches] = useState<BatchOption[]>([])

    const [csvData, setCSVData] = useState<any[]>([])

    const handleDataSelectChange = (e: SingleValue<DataOption>) => {
        setData(e?.value)
    }

    const handleRouteOpen = () => {
        getRoutesOptions().then((data) => {
            setRoutes(data)
        })
    }

    const handleRouteSelectChange = (e: SingleValue<RouteOption>) => {
        if (e === null) {
            setRoute(undefined)
        }
        setRoute(String(e?.label))
    }

    const handleBatchOpen = () => {
        getBatchOptions(String(route)).then((data) => {
            setBatches(data.map((batch: any) => ({value: Number(batch.batch), label: batch.batch})))
        })
    }

    const handleBatchSelectChange = (e: SingleValue<BatchOption>) => {
        if (e === null) {
            setBatch(undefined)
        }
        setBatch(Number(e?.value))
    }

    const [dataSrc, filename] = useMemo(() => {
        console.log(data, route, data === undefined)
        if (data === undefined) {
            return [null, undefined]
        }

        if (route === undefined) {
            return [`${BACKEND_API}/data/${data}`, `${data}.csv`]
        }

        if (batch === undefined) {
            return [`${BACKEND_API}/data/${data}/${route}`, `${data}-${route}.csv`]
        }

        return [`${BACKEND_API}/data/${data}/${route}/${batch}`, `${data}-${route}-${batch}.csv`]
    }, [route, data, batch])

    useEffect(() => {
        console.log(route, route === undefined, typeof route)
    }, [route])

    useEffect(() => {
        if (dataSrc === null) return

        service.getCSVData(dataSrc).then((data) => {
            const parseForDownload = (data: any[]) => {
                let tempData = []
        
                let header = Object.keys(data[0]).map(key => {
                    return key
                })
        
                let body = data.map(entry => {
                    let newEntry = []
                    for (const key of Object.keys(entry)) {
                        if (typeof entry[key] == "boolean") {
                            if (entry[key]) {
                                newEntry.push("true")
                            } else {
                                newEntry.push("false")
                            }
                        } else {
                            newEntry.push(entry[key])
                        }
                    }
                    return newEntry
                })
        
                tempData.push(header)
                for (const i of body) {
                    tempData.push(i)
                }
                return (tempData)
            }

            setCSVData(parseForDownload(data))
        })
    }, [dataSrc])

    return <div className={s.container}>
        <Card header={`Download data`} className={s.dataCard}>
            <div className={s.selectContainer}>
                <Select isClearable menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} placeholder="Select data..." key={`select-data-csv`} options={dataOptions} className={s.select} isSearchable={false} onChange={handleDataSelectChange} />
                <Select menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} placeholder="Select route..." key={`select-route-csv`} options={routes} className={s.select} isSearchable={false} onMenuOpen={handleRouteOpen} onChange={handleRouteSelectChange} />
                <Select menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} placeholder="Select batch..." key={`select-batch-csv`} options={batches} className={s.select} isSearchable={false} onMenuOpen={handleBatchOpen} onChange={handleBatchSelectChange} />
                {dataSrc !== null && <CSVLink filename={filename} data={csvData} className={s.csvLink} >Download</CSVLink>}
            </div>
        </Card>
    </div>
}

export default Data
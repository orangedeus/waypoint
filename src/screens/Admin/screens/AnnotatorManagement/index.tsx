import React, { useEffect, useMemo, useState } from 'react'
import CustomInput from '../../../../components/CustomInput'
import Card from '../../components/Card'
import Select, { Options, SingleValue } from 'react-select'

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'

import s from './annotator.module.scss'
import cx from 'classnames'
import { service } from '../../../../utils/api/AdminService'
import { getRoutesOptions, getBatchOptions } from '../../../../utils/api'
import { useRecoilState } from 'recoil'
import { authState } from '../../../../stores/auth'


import {Bar} from 'react-chartjs-2'

import Table from '../../components/Table'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    BarElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

const NUMBER_ERRORS = [
    'Empty',
    'Numbers only',
    'No negative numbers',
]

type CodeData = {
    code: string
    accessed: Date
    surveyed: boolean
}

// Constants for bar chart

const defaultBCD = {
    labels: [],
    backgroundColor: 'white',
    datasets: [
        {
            label: '# of POIs',
            data: [],
            fill: false,
            backgroundColor: '#62A2CC',
            borderColor: 'transparent'
        }
    ]
}

const barChartOptions = {
    scales: {
        x: {
            ticks: {
                display: false
            }
        }
    },
    indexAxis: 'y'
}

const AnnotatorManagement = (): JSX.Element => {
    const [{ code }, setAuth] = useRecoilState(authState)

    const [fail, setFail] = useState(false)

    const [noOfCodes, setNoOfCodes] = useState<number | undefined>()
    const [threshold, setThreshold] = useState<number | undefined>()
    const [routes, setRoutes] = useState<any[]>([])
    const [route, setRoute] = useState<any>('')
    const [batches, setBatches] = useState<any[]>([])
    const [batch, setBatch] = useState<any>('')

    // Annotator management states

    const [inst, setInst] = useState<CodeData[]>([])

    const [histogram, setHistogram] = useState({
        labels: [],
        backgroundColor: 'white',
        datasets: [
            {
                label: '# of POIs',
                data: [],
                fill: false,
                backgroundColor: '#62A2CC',
                borderColor: 'transparent'
            }
        ]
    })

    const [histogramRoute, setHistogramRoute] = useState<string | undefined>('')
    const [histogramBatch, setHistogramBatch] = useState<string | undefined>('')

    useEffect(() => {
        service.getCodesInstrumentation().then((data) => {
            setInst(data)
        })
    }, [])

    useEffect(() => {
        service.getHistogramData(String(histogramRoute), String(histogramBatch)).then((data) => {
            setHistogram(() => {
                let tempData = JSON.parse(JSON.stringify(defaultBCD))
                for (const entry of data) {
                    tempData.labels.push(entry.annotation_count)
                    tempData.datasets[0].data.push(entry.number)
                }
                return tempData
            })
        })
    }, [histogramRoute, histogramBatch])

    useEffect(() => { console.log(histogram) }, [histogram])

    const [generatedCodes, setGeneratedCodes] = useState<any[]>([])

    useEffect(() => {
        if (fail === true) {
            setTimeout(() => {
                setFail(e => !e)
            }, 1000)
        }
    }, [fail])

    

    const handleRouteOpen = () => {
        getRoutesOptions().then((data) => {
            setRoutes(data)
        })
    }

    const handleRouteSelect = (event: SingleValue<{value: number; label: string; }>) => {
        setRoute(event?.label)
    }

    const handleHistogramRouteSelect = (event: SingleValue<{value: number; label: string; }>) => {
        setHistogramRoute(event?.label)
    }

    const handleBatchOpen = () => {
        getBatchOptions(route).then((data) => {
            setBatches(data.map((batch: any) => ({value: batch.batch, label: batch.batch})))
        })
    }

    const handleBatchSelect = (event: SingleValue<{value: string; label: string; }>) => {
        setBatch(event?.label)
    }

    const handleHistogramBatchOpen = () => {
        getBatchOptions(String(histogramRoute)).then((data) => {
            setBatches(data.map((batch: any) => ({value: batch.batch, label: batch.batch})))
        })
    }

    const handleHistogramBatchSelect = (event: SingleValue<{value: string; label: string; }>) => {
        setHistogramBatch(event?.label)
    }

    const handleNumberError = (value: string, errorSetter: React.Dispatch<React.SetStateAction<number>>) => {
        if (value === '') {
            errorSetter(0)
            return
        }

        if (Number.isNaN(Number(value))) {
            console.log('went here')
            errorSetter(1)
            return
        }

        if (Number(value) < 0) {
            errorSetter(2)
            return
        }
        errorSetter(-1)
    }

    const validateForm = () => {
        if (noOfCodes === undefined || threshold === undefined || route === '' || batch === '') {
            return false
        }

        if (Number.isNaN(Number(noOfCodes)) || Number.isNaN(Number(threshold))) {
            return false
        }

        return true
    }

    const handleSubmit = () => {
        if (!validateForm()) {
            setFail(true)
        }
        service.postGenerateCodes(String(code), Number(noOfCodes), Number(threshold), route, batch).then(data => {
            setGeneratedCodes(e => [...e, ...data.inserted_codes])
        })
    }

    return <div className={s.container}>
        <Card header="Generate codes" className={s.generate}>
            <div className={s.form}>
                <Select className={s.select} placeholder="Select route..." options={routes} onMenuOpen={handleRouteOpen} onChange={handleRouteSelect} />
                <Select className={s.select} placeholder="Select batch..." options={batches} onMenuOpen={handleBatchOpen} onChange={handleBatchSelect} />
                <CustomInput containerClass={s.numberInput} id="number" value={noOfCodes} min={0} label='Number of codes' errorHandler={{onError: handleNumberError, errorMessages: NUMBER_ERRORS}} onChange={(event) => setNoOfCodes(Number(event.target.value))} />
                <CustomInput containerClass={s.numberInput} id="threshold" value={threshold} min={0} label='Threshold' errorHandler={{onError: handleNumberError, errorMessages: NUMBER_ERRORS}} onChange={(event) => setThreshold(Number(event.target.value))} />
                <button className={cx(s.submit, {
                    [s.submitFail]: fail
                })} onClick={handleSubmit}>Generate</button>
            </div>
        </Card>
        <Card header="Generated codes" className={s.generated}>
            {generatedCodes.length ? <div className={s.codesContainer}>
                {generatedCodes.map((code) => {
                    return <div className={s.code}>{code}</div>
                })}
            </div>: <div className={s.codesPlaceholder}>
                Nothing to display.
            </div>}
            
        </Card>
        <Card header="Annotator code monitoring" className={s.management}>
            {inst.length && <Table<CodeData> className={s.table} columns={[
                {
                    key: 'code',
                    display: (data) => data
                },
                {
                    key: 'accessed',
                    display: (data) => data === null ? "" : new Date(data).toDateString()
                },
                {
                    key: 'surveyed',
                    display: (data) => data === true ? "Yes" : "No"
                }
            ]} data={inst} />}
        </Card>
        <Card header="Batch and route annotation histogram" className={s.histogram}>
            <div className={s.histogramContainer}>
                <Select placeholder="Select route..." className={s.histogramSelect} options={routes} onMenuOpen={handleRouteOpen} onChange={handleHistogramRouteSelect} />
                <Select placeholder="Select batch..." className={`${s.histogramSelect} ${s.lastSelect}`} options={batches} onMenuOpen={handleHistogramBatchOpen} onChange={handleHistogramBatchSelect} />
                <Bar data={histogram} />
            </div>
        </Card>
    </div>
}

export default AnnotatorManagement
import React, { useEffect, useState } from 'react'
import CustomInput from '../../../../components/CustomInput'
import Card from '../../components/Card'
import Select, { Options, SingleValue } from 'react-select'

import s from './annotator.module.scss'
import cx from 'classnames'
import { service } from '../../../../utils/api/AdminService'
import { useRecoilState } from 'recoil'
import { authState } from '../../../../stores/auth'

const NUMBER_ERRORS = [
    'Empty',
    'Numbers only',
    'No negative numbers',
]

const AnnotatorManagement = (): JSX.Element => {
    const [{ code }, setAuth] = useRecoilState(authState)

    const [fail, setFail] = useState(false)

    const [noOfCodes, setNoOfCodes] = useState<number | undefined>()
    const [threshold, setThreshold] = useState<number | undefined>()
    const [routes, setRoutes] = useState<any[]>([])
    const [route, setRoute] = useState<any>('')
    const [batches, setBatches] = useState<any[]>([])
    const [batch, setBatch] = useState<any>('')

    const [generatedCodes, setGeneratedCodes] = useState<any[]>([])

    useEffect(() => {
        if (fail === true) {
            setTimeout(() => {
                setFail(e => !e)
            }, 1000)
        }
    }, [fail])

    const handleRouteOpen = () => {
        service.getRoutesOptions().then((data) => {
            setRoutes(data)
        })
    }

    const handleRouteSelect = (event: SingleValue<{value: number; label: string; }>) => {
        setRoute(event?.label)
    }

    const handleBatchOpen = () => {
        service.getBatchOptions(route).then((data) => {
            setBatches(data.map((batch: any) => ({value: batch.batch, label: batch.batch})))
        })
    }

    const handleBatchSelect = (event: SingleValue<{value: string; label: string; }>) => {
        setBatch(event?.label)
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

    useEffect(() => {
        console.log(generatedCodes)
    }, [generatedCodes])

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
    </div>
}

export default AnnotatorManagement
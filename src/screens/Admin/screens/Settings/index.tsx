import React, { useState } from 'react'
import Card from '../../components/Card'
import s from './settings.module.scss'

import { getRoutesOptions, getBatchOptions } from '../../../../utils/api'
import Select, { SingleValue } from 'react-select'
import Tooltip from '../../components/Tooltip'
import { service } from '../../../../utils/api/AdminService'
import CustomInput from '../../../../components/CustomInput'

type RouteOption = {
    value: string
    label: string
}

type BatchOption = {
    value: number
    label: string
}

const backupError = [
    'Empty',
    'Start with letters'
]

const Settings = (): JSX.Element => {

    const [route, setRoute] = useState<string | undefined>()
    const [routes, setRoutes] = useState<RouteOption[]>([])

    const [batch, setBatch] = useState<number | undefined>()
    const [batches, setBatches] = useState<BatchOption[]>([])

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
            setBatches(data.map((batch: any) => ({ value: Number(batch.batch), label: batch.batch })))
        })
    }

    const handleBatchSelectChange = (e: SingleValue<BatchOption>) => {
        if (e === null) {
            setBatch(undefined)
        }
        setBatch(Number(e?.value))
    }

    const handleRetire = () => {
        if (route === undefined || batch === undefined) {
            return
        }

        service.postRetirement(route, batch).then(() => {
            setRoute(undefined)
            setBatch(undefined)
        })
    }

    const handleDelete = () => {
        if (!route || !batch) {
            return
        }


        service.postBatchDelete(route, batch).then(() => {
            setRoute(undefined)
            setBatch(undefined)
        })
    }

    const handleBackupError = (value: string, errorSetter: React.Dispatch<React.SetStateAction<number>>) => {
        errorSetter(0)
    }

    return <div className={s.container}>
        <Card className={s.batchControl} header={`Batch control`}>
            <div className={s.selectContainer}>
                <Select menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} placeholder="Select route..." key={`select-route-csv`} options={routes} className={s.select} isSearchable={false} onMenuOpen={handleRouteOpen} onChange={handleRouteSelectChange} />
                <Select menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} placeholder="Select batch..." key={`select-batch-csv`} options={batches} className={s.select} isSearchable={false} onMenuOpen={handleBatchOpen} onChange={handleBatchSelectChange} />
            </div>
            <div className={s.buttonContainer}>
                <div className={s.button} onClick={handleRetire}>
                    Retire
                    <Tooltip className={s.tooltip}>Removes videos of POIs with no COVID violations. Batch number is removed from any future selections.</Tooltip>
                </div>
                <div className={s.button} onClick={handleDelete}>
                    Delete
                    <Tooltip className={s.tooltip}>
                        Completely removes POI and annotations (including videos).
                    </Tooltip>
                </div>
            </div>
        </Card>
        <Card className={s.backup} header={`Create backup`}>
            <div className={s.backupForm}>
                <CustomInput containerClass={s.backupEnter} label='Backup name' errorHandler={{
                    errorMessages: backupError,
                    onError: handleBackupError
                }} />
                <div className={s.button}>
                    Backup
                </div>
            </div>
        </Card>
        <Card className={s.backupControl} header={`Backup control`}>
            <div className={s.selectContainer}>
                <Select menuPortalTarget={document.body} styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }} placeholder="Select backup..." key={`select-backup-settings`} options={[{ value: 'auto1', label: 'auto1' }, { value: 'auto2', label: 'auto2' }, { value: 'auto3', label: 'auto3' }]} className={s.backupSelect} isSearchable={false} />
            </div>

            <div className={s.buttonsContainer}>
                <div className={s.button}>
                    Restore
                </div>
                <div className={s.button}>
                    Download
                </div>
                <div className={s.button}>
                    Delete
                </div>
            </div>
        </Card>
        <Card className={s.nukes} header={`Nukes`}>
            <div className={s.nukesContainer}>
                <div className={s.button}>
                    Small Nuke
                    <Tooltip className={s.tooltip}>
                        Deletes all annotations.
                    </Tooltip>
                </div>
                <div className={s.button}>
                    Greater Nuke
                    <Tooltip className={s.tooltip}>
                        Deletes stops and annotations.
                    </Tooltip >
                </div>
            </div>
        </Card>
    </div>
}


export default Settings
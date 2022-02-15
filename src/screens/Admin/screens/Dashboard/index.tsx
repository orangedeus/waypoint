import React, { useState, useEffect } from 'react'

import s from './dashboard.module.scss'

import { service } from '../../../../utils/api/AdminService'
import { DashboardStats } from '../../../../types/Admin'

const Dashboard = (): JSX.Element => {
    const [{stops, codes, annotations, uploaded_videos}, setStats] = useState<DashboardStats>({
        stops: '0',
        codes: '0',
        annotations: '0',
        uploaded_videos: '0'
    })

    useEffect(() => {
        service.getDashboardStats().then(data => {
            setStats(data)
        })
    }, [])

    return <div className={s.container}>
        <div className={s.card}>
            <div className={s.cardText}>
                <div className={s.header}>
                    {annotations}
                </div>
                <div className={s.text}>
                    Annotations
                </div>
            </div>
            <div className={s.cardImage}>
                <img src='/assets/annotations.svg' alt="annotations" />
            </div>
        </div>
        <div className={s.card}>
            <div className={s.cardText}>
                <div className={s.header}>
                    {codes}
                </div>
                <div className={s.text}>
                    Codes
                </div>
            </div>
            <div className={s.cardImage}>
                <img src='/assets/code.svg' alt="codes" />
            </div>
        </div>
        <div className={s.card}>
            <div className={s.cardText}>
                <div className={s.header}>
                    {stops}
                </div>
                <div className={s.text}>
                    Stops
                </div>
            </div>
            <div className={s.cardImage}>
                <img src='/assets/stops.svg' alt="stops" />
            </div>
        </div>
        <div className={s.card}>
            <div className={s.cardText}>
                <div className={s.header}>
                    {uploaded_videos}
                </div>
                <div className={s.text}>
                    Videos
                </div>
            </div>
            <div className={s.cardImage}>
                <img src='/assets/uploaded.svg' alt="videos" />
            </div>
        </div>
    </div>
}

export default Dashboard
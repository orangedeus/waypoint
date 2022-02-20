import axios from 'axios'
import { DashboardStats } from '../../types/Admin'

import {BACKEND_API} from './endpoints'



async function getDashboardStats(): Promise<DashboardStats> {
    const response = await axios.get(`${BACKEND_API}/dashboard`)
    return response.data
}

async function postGenerateCodes(code: string, number: number, threshold: number, route: string, batch: string) {
    const req = {
        code,
        number,
        threshold,
        route,
        batch
    }

    const response = await axios.post(`${BACKEND_API}/generate`, req)

    return response.data
}

async function getCodesInstrumentation() {
    const response = await axios.get(`${BACKEND_API}/instrumentation/codes`)
    return response.data
}

async function getHistogramData(route: string, batch: number | string) {
    const response = await axios.get(`${BACKEND_API}/data/histogram?route=${route}&batch=${batch}`)
    return response.data
}

export const service = { getDashboardStats, getCodesInstrumentation, getHistogramData, postGenerateCodes }
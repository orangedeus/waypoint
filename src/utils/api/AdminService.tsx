import axios from 'axios'
import { DashboardStats, FileStops } from '../../types/Admin'

import { BACKEND_API } from './endpoints'



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

async function getTrackingData(route: string, batch: string | number) {
    const response = await axios.get(`${BACKEND_API}/process/tracking?route=${route}&batch=${batch}`)

    return response.data
}

async function getFileData(filename: string, route: string, batch: number | string): Promise<FileStops[]> {
    const response = await axios.get(`${BACKEND_API}/stops/file/${filename}/?route=${route}&batch=${batch}`)

    return response.data
}

async function getCSVData(src: string) {
    const response = await axios.get(src)

    return response.data
}

async function postRetirement(route: string, batch: number) {
    const req = {
        route: route,
        batch: batch
    }

    const response = await axios.post(`${BACKEND_API}/batch/retire`, req)

    return response.data
}

async function postBatchDelete(route: string, batch: number) {
    const req = {
        route: route,
        batch: batch
    }

    const response = await axios.post(`${BACKEND_API}/batch/delete`, req)

    return response.data
}

async function postDelete(source_file: string, route: string, batch: number, tracking: string | number) {
    const req = { source_file, route, batch, tracking }

    const response = await axios.post(`${BACKEND_API}/stops/delete`, req)

    return response.data
}

export const service = { getDashboardStats, getCodesInstrumentation, getHistogramData, getTrackingData, getFileData, postGenerateCodes, postRetirement, postDelete, postBatchDelete, getCSVData }
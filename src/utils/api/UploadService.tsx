import axios, { AxiosRequestConfig } from 'axios'

import {BACKEND_API, PROCESSING_API} from './endpoints'

type TrackingUpdate = {
    stage?: 'initial' | 'update'
    status: string
    route: string
    batch: number
    fileName: string
    tracking: number
}

async function getUploadStatus(filename: string, route: string, batch: number) {
    const response = await axios.get(`${PROCESSING_API}/v2/process/upload_status?filename=${filename}&route=${route}&batch=${batch}`)

    return response.data
}

async function getProcessTracking(tracking: number | string) {
    const response = await axios.get(`${BACKEND_API}/process/tracking_process?tracking=${tracking}`)

    return response.data
}

async function postTrackingUpdate (trackingUpdate: TrackingUpdate) {

    const req = {...trackingUpdate, stage: 'update'}

    const response = await axios.post(`${BACKEND_API}/process/tracking`, req)

    return response.data
}

async function postUploadChunk(formData: FormData, config: AxiosRequestConfig) {
    const response = await axios.post(`${PROCESSING_API}/v2/process/chunk`, formData, config)
    return response.data
}

export const service = {
    getProcessTracking,
    getUploadStatus,
    postTrackingUpdate,
    postUploadChunk
}
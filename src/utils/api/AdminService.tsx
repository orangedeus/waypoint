import axios from 'axios'
import { DashboardStats } from '../../types/Admin'


const BACKEND_API = process.env.REACT_APP_BACKEND_API || ""
const PROCESSING_API = process.env.REACT_APP_PROCESSING_API || ""



async function getDashboardStats(): Promise<DashboardStats> {
    const response = await axios.get(`${BACKEND_API}/dashboard`)
    return response.data
}

async function getRoutesOptions() {
    const response = await axios.get(`${BACKEND_API}/routes`)
    return response.data
}

async function getBatchOptions(route: string) {
    const req = {
        route: route
    }

    const response = await axios.post(`${BACKEND_API}/batch/route`, req)

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

export const service = { getDashboardStats, getRoutesOptions, getBatchOptions, postGenerateCodes }
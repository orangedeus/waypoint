import axios from 'axios';
import { AnnotationMeta } from '../../types/Annotation';

import {BACKEND_API} from './endpoints'

async function getStopsForAnnotation(code: string) {
    const req = {
        code: code
    }

    const prevStops = localStorage.getItem('stops')

    if (prevStops !== null) {
        return JSON.parse(prevStops)
    } else {
        const response = await axios.post(`${BACKEND_API}/stops/reduced`, req)
        localStorage.setItem('stops', JSON.stringify(response.data))
        return response.data
    }
}

async function getAdminStops() {
    const prevStops = localStorage.getItem('stops')

    if (prevStops !== null) {
        return JSON.parse(prevStops)
    } else {
        const response = await axios.get(`${BACKEND_API}/stops`)
        console.log(response)
        localStorage.setItem('stops', JSON.stringify(response.data))
        return response.data
    }
}

async function postAnnotationData(annotation: AnnotationMeta) {
    const req = annotation

    const response = await axios.post(`${BACKEND_API}/stops/annotate`, req)

    return response.data
}

export const service = {
    getStopsForAnnotation,
    getAdminStops,
    postAnnotationData
}
import axios from 'axios';

import {BACKEND_API} from './endpoints'

export type FilterType = {
    people: boolean
    boarding: boolean
    alighting: boolean
    annotated: boolean
    following: boolean
}


async function getFilteredStops(route: string, filter: FilterType) {
    const request = {
        route: route,
        filter: filter
    }
    const response = await axios.post(`${BACKEND_API}/stops/filtered`, request)
    return response.data
}

export const service = {
    getFilteredStops
}
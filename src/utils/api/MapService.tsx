import axios from 'axios';

import {BACKEND_API} from './endpoints'

export type TimeType = 'none' | 'morning' | 'noon' | 'evening'

export type FilterType = {
    people: boolean
    boarding: boolean
    alighting: boolean
    annotated: boolean
    following: boolean
    time?: TimeType
}


async function getFilteredStops(route: string, filter: FilterType, time: TimeType) {
    const request = {
        route: route,
        filter: filter,
        time: time
    }
    const response = await axios.post(`${BACKEND_API}/stops/filtered`, request)
    return response.data
}

export const service = {
    getFilteredStops
}
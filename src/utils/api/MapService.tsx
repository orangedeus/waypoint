import axios from 'axios';

const BACKEND_API = process.env.REACT_APP_BACKEND_API || ""
const PROCESSING_API = process.env.REACT_APP_PROCESSING_API || ""

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

async function getRoutes() {
    const response = await axios.get(`${BACKEND_API}/routes`)
    return response.data
}

export const service = {
    getFilteredStops,
    getRoutes
}
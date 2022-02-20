
import axios from "axios"
import { BACKEND_API } from "./endpoints"

export async function getRoutesOptions() {
    const response = await axios.get(`${BACKEND_API}/routes`)
    return response.data
}

export async function getBatchOptions(route: string) {
    const req = {
        route: route
    }

    const response = await axios.post(`${BACKEND_API}/batch/route`, req)

    return response.data
}
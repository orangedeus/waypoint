import axios from 'axios';

import { BACKEND_API } from './endpoints';


async function getRoutes() {
    const response = await axios.get(`${BACKEND_API}/routes`)
    return response.data;
}

async function postNewRoute(route: String) {
    const req = {
        route: route
    }
    const response = await axios.post(`${BACKEND_API}/routes/insert`, req)

    return response.data
}

async function getRouteBatches(route: String) {
    const req = {
        route: route
    }
    const response = await axios.post(`${BACKEND_API}/batch/route2`, req);

    return response.data
}

async function getLatestBatch(route: String) {
    const req = {
        route: route
    }
    const response = await axios.post(`${BACKEND_API}/batch/max`, req)

    return response.data;
}

async function postNewBatch(route: String, batch: number) {
    const req = {
        route,
        batch
    }

    const response = await axios.post(`${BACKEND_API}/batch/insert`, req)
    return response.data
}

export const service = {
    getRoutes,
    getRouteBatches,
    postNewBatch,
    postNewRoute,
    getLatestBatch
}
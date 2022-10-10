import axios from 'axios';

import { BACKEND_API } from './endpoints';

async function startInstance() {
    await axios.get(`${BACKEND_API}/instance/start`)
}

async function checkInstance() {
    const response = await axios.get(`${BACKEND_API}/instance/check`)

    return response.data
}

async function stopInstance() {
    await axios.get(`${BACKEND_API}/instance/stop`)
}

export const service = {
    startInstance,
    checkInstance,
    stopInstance
}
import axios from 'axios';

import { PROCESSING_API } from './endpoints';



async function postDeleteFile(fileNames: any[]) {
    const response = await axios.post(`${PROCESSING_API}/v2/process/delete`, fileNames)
    return response.data
}

async function postProcessFile(fileNames: any[]) {
    const response = await axios.post(`${PROCESSING_API}/v2/process/process`, fileNames);
    return response.data
}

export const service = {
    postDeleteFile,
    postProcessFile
}
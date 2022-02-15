import axios from 'axios';
import { AnnotationMeta } from '../../types/Annotation';

import { Auth } from '../../types/Auth'

const BACKEND_API = process.env.REACT_APP_BACKEND_API || ""
const PROCESSING_API = process.env.REACT_APP_PROCESSING_API || ""

async function postLoginCode(code: string): Promise<Auth> {
    const req = {
        code: code
    }
    const response = await axios.post(`${BACKEND_API}/login`, req)
    return response.data
}

export const service = {
    postLoginCode
}
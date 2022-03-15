import axios from 'axios';
import { AnnotationMeta } from '../../types/Annotation';

import { Auth } from '../../types/Auth'

import {BACKEND_API} from './endpoints'

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
import crypto from 'crypto'
import { Buffer } from 'buffer/'

import { service } from '../../api/UploadService'
import { AxiosRequestConfig } from 'axios'

export const CHUNK_SIZE = 52428800

type BuiltChunk = {
    chunk: File
    checksum: string
    chunkSize: number
}

type UploadRequest = {
    formData: FormData
    config: AxiosRequestConfig
}

type FileData = {
    size: number
    name: string
    batch: number
    route: string
    tracking: number
}

export const generateChecksum = (file: Buffer) => {

    return crypto.createHash('md5').update(file).digest('hex')
}

export const buildChunk = async (chunkStart: number, file: File): Promise<BuiltChunk> => {
    let nextByte = Math.min(file.size, chunkStart + CHUNK_SIZE)
    let chunkSlice = file.slice(chunkStart, nextByte);
    let chunk = new File([chunkSlice], file.name, { lastModified: file.lastModified })
    let chunkBuffer = await chunk.arrayBuffer();
    console.log(chunkBuffer)
    let checksum = generateChecksum(Buffer.from(chunkBuffer))
    return { chunk, checksum, chunkSize: nextByte - chunkStart }
}

export const buildRequest = (currChunk: File, currChecksum: string, chunkStart: number, currChunkSize: number, totalBytesSent: number, file: FileData, progressCallback: (event: ProgressEvent) => void): UploadRequest => {
    const formData = new FormData()

    formData.append('file', currChunk)

    const config = {
        headers: {
            "Content-Type": "multipart/form-data",
            "x-file-name": file.name,
            "x-file-size": file.size,
            "x-file-checksum": currChecksum,
            "x-chunk-size": currChunkSize,
            "x-chunk-start": chunkStart,
            "x-route": file.route,
            "x-batch": file.batch,
            "x-tracking": file.tracking
        },
        onUploadProgress: progressCallback
    }

    return { formData, config }
}

export const uploadChunk = async ({ formData, config }: UploadRequest) => {
    try {
        const data = await service.postUploadChunk(formData, config)
        if (data.status == 0) {
            await uploadChunk({ formData, config })
        }
        return
    } catch (e) {
        await uploadChunk({ formData, config })
        return
    }
}
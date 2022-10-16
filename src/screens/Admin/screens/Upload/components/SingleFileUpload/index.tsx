import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

import s from './single.module.scss'

import Select from 'react-select'
import Loader from '../Uploader/Loader'

import { service } from '../../../../../../utils/api/UploadService'
import { getRoutesOptions, getBatchOptions } from '../../../../../../utils/api'
import {
    CHUNK_SIZE,
    buildChunk,
    buildRequest,
    uploadChunk
} from '../../../../../../utils/methods/upload'
import { PROCESSING_API } from '../../../../../../utils/api/endpoints'

type SingleFileUploadProps = {
    file: any
    checked: boolean
    status: Status
    route: string
    onClose: (filename: string) => void
}

export type Status = 'uploading' | 'processing' | 'upload-problem' | 'uploaded' | 'ready' | 'no-route' | 'processed' | 'failed'

const SingleFileUpload = ({ file: fileProp, checked: checkedProp, status: statusProp, onClose }: SingleFileUploadProps, ref: React.ForwardedRef<any>) => {

    const [progress, setProgress] = useState(0)
    const [file, setFile] = useState(fileProp)
    const [route, setRoute] = useState('')
    const [routes, setRoutes] = useState([])
    const [checked, setChecked] = useState(checkedProp)
    const [status, setStatus] = useState<Status>(statusProp)
    const [status2, setStatus2] = useState('')
    const [batch, setBatch] = useState(0)
    const [batches, setBatches] = useState([])
    const [tracking, setTracking] = useState(0)

    const selectRef = useRef<any>()
    const selectBatchRef = useRef<any>()


    useEffect(() => {
        let updateProcess: any
        if (status == 'processing') {
            updateProcess = setInterval(() => {
                service.getProcessTracking(tracking).then((data) => {
                    setStatus2(data.status)
                })
            }, 3000)
        } else {
            clearInterval(updateProcess)
        }

        if (status == 'upload-problem') {
            upload()
        }

        return () => {
            clearInterval(updateProcess)
        }
    }, [status])

    useEffect(() => {
        if (status == 'processing' && status2 == 'Done!') {
            setStatus('processed')
        }
    }, [status2])

    useEffect(() => {
        if (status == 'no-route') {
            if (route != '') {
                setStatus('ready')
            }
        }
        if (route == '') {
            setStatus('no-route')
        }
    }, [route])

    useEffect(() => {
        console.log(tracking)
    }, [tracking])


    // Forwarded refs, for controlling each single file
    useImperativeHandle(ref, () => ({
        check: (bool: any) => {
            setChecked(Boolean(bool))
        },
        upload: () => {
            upload()
        },
        uploaded: () => {
            setStatus("uploaded")
        },
        close: () => {
            handleClose()
        },
        process: () => {
            setStatus("processing")
        },
        processed: () => {
            setStatus("processed")
        },
        failed: () => {
            setStatus("failed")
        },
        changeRoute: (e: any) => {
            console.log(selectRef.current.state.value)
            if (e.value == 'nothing') {
                console.log('should remove selection')
                selectRef.current.state.value = null
                setRoute('')
                setBatch(0)
                return
            }
            handleSelectChange(e)
            setBatch(0)
            console.log(selectRef.current)
            // selectRef.current.state.value = e
        },
        changeBatch: (e: any) => {
            handleBatchSelectChange(e)
            // selectRef.current.state.value = e
        },
        name: file.name,
        route: route,
        batch: batch,
        tracking: tracking,
        status: status,
        checked: checked
    }))

    const tracking_update = (status: any) => {
        return new Promise((resolve, reject) => {
            let req = {
                status: status,
                route: route,
                batch: batch,
                fileName: String(file.name),
                tracking: tracking
            }
            service.postTrackingUpdate(req).then((data) => {
                resolve(data.tracking)
            }).catch(e => {
                reject(e)
            })
        })
    }

    const upload = async () => {
        if (status == 'uploading') {
            return;
        }

        let bytes, totalBytesSent: number
        service.getUploadStatus(file.name, route, batch).then(async (data) => {
            setStatus('uploading')
            setTracking(parseInt(data.tracking))
            bytes = data.bytes
            totalBytesSent = bytes
            const fileData = {
                size: file.size,
                name: file.name,
                route: route,
                batch: batch,
                tracking: tracking
            }

            for (let i = bytes; i < file.size; i += CHUNK_SIZE) {
                let { chunk: currChunk, checksum: currChecksum, chunkSize: currChunkSize } = await buildChunk(i, file)
                let { formData, config } = buildRequest(currChunk, currChecksum, i, currChunkSize, totalBytesSent, fileData, (event: ProgressEvent) => {
                    let tempProgress = Math.round((totalBytesSent + event.loaded) / (file.size) * 100)
                    setProgress(tempProgress)
                })
                await uploadChunk({ formData, config })
                totalBytesSent += currChunkSize
            }
            setStatus('uploaded')
            tracking_update('Uploaded')
        }).catch((e) => {
            console.log(e)
            setStatus('upload-problem')
            return
        })

    }



    const getStatusDisplay = () => {
        if (status == 'no-route') {
            return (
                <div className="ReadyStatusDisplay">
                    <img src="/assets/no-route.png" className="StatusImages" />
                    <p className="ReadyLabel">No route selected!</p>
                </div>
            )
        }
        if (status == 'ready') {
            return (
                <div className="ReadyStatusDisplay">
                    <img src="/assets/ready.png" className="StatusImages" />
                    <p className="ReadyLabel">Ready</p>
                </div>
            )
        }
        if (status == 'uploading') {
            return (
                <div className="UploadingStatusDisplay">
                    <Loader />
                    <p className="UploadLabel">Uploading... {`${progress}%`}</p>
                </div>
            )
        }
        if (status == 'uploaded') {
            return (
                <div className="ReadyStatusDisplay">
                    <a href={`${PROCESSING_API}/watch/${file.name}`} target="_blank" type="video/mp4"><img src="/assets/uploaded.png" className="StatusImages" /></a>
                    <p className="ReadyLabel">Uploaded</p>
                </div>
            )
        }
        if (status == 'processing') {
            return (
                <div className="UploadingStatusDisplay">
                    <Loader />
                    <p className="UploadLabel">Processing... {status2}</p>
                </div>
            )
        }
        if (status == 'processed') {
            return (
                <div className="ReadyStatusDisplay">
                    <img src="/assets/processed.png" className="StatusImages" />
                    <p className="ReadyLabel">Processed!</p>
                </div>
            )
        }
        if (status == 'failed') {
            return (
                <div className="ReadyStatusDisplay">
                    <img src="/assets/process-failed.png" className="StatusImages" />
                    <p className="ReadyLabel">Failed! :(</p>
                </div>
            )
        }
        if (status == 'upload-problem') {
            return (
                <div className="ReadyStatusDisplay">
                    <img src="/assets/network-problem.png" className="StatusImages" />
                    <p className="ReadyLabel">Network Problem.</p>
                </div>
            )
        }
    }

    const handleSelect = () => {
        getRoutesOptions().then((data) => {
            setRoutes(data)
        })
    }

    const handleSelectChange = (e: any) => {
        setRoute(e.label)
        console.log(e.label)
    }

    const handleBatchSelect = () => {
        getBatchOptions(route).then((data) => {
            setBatches(data.map((batch: any) => ({ value: batch.batch, label: batch.batch })))
        })
    }

    const handleBatchSelectChange = (e: any) => {
        setBatch(e.value)
    }

    const handleClose = () => {
        onClose(file.name)
    }

    return (
        <div className={s.singleFileUpload}>
            <button onClick={handleClose} className={s.close}>
                ✕
            </button>
            <div className={s.uploadLabel}>
                <input type="checkbox" id={`checkbox-${file.name}`} checked={checked} onChange={() => { setChecked((curr) => { return !curr }) }} />
                <label htmlFor={`checkbox-${file.name}`}>
                    {file.name}
                </label>
                <Select className={s.select} key={`select-route-${file.name}`} placeholder="Select route" ref={selectRef} value={route == "" ? null : { value: -1, label: route }} options={routes} isSearchable={false} onMenuOpen={handleSelect} onChange={handleSelectChange} />
                <Select className={s.select} key={`select-batch-${file.name}`} placeholder="Select batch" ref={selectBatchRef} value={batch == 0 ? null : { value: -1, label: batch }} options={batches} isSearchable={false} onMenuOpen={handleBatchSelect} onChange={handleBatchSelectChange} />
            </div>
            <div className="StatusDisplay">
                {getStatusDisplay()}
            </div>
        </div>
    )
}

export default forwardRef(SingleFileUpload)
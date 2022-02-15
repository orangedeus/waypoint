import React, { ReactNode, forwardRef, useEffect, useRef, useState, useCallback, useImperativeHandle } from 'react';
import Select from 'react-select';
import Creatable from 'react-select/creatable';
import {useDropzone} from 'react-dropzone';
import axios from 'axios';

import noRoute from 'assets/no-route.png';
import ready from 'assets/ready.png';
import uploaded from 'assets/uploaded.png';
import processed from 'assets/processed.png';
import failed from 'assets/process-failed.png';
import problem from 'assets/network-problem.png';
import crypto from 'crypto';
import { Buffer } from 'buffer';

import s from './uploader.module.scss'
import Loader from './Loader';

function useStateCallback(initialState: any) {
    const [state, setState] = useState(initialState)
    const cbRef = useRef<any>(null)

    const setStateCallback = useCallback((state, cb) => {
        cbRef.current = cb
        setState(state)
    }, [])

    useEffect(() => {
        if (cbRef.current) {
            cbRef.current(state)
            cbRef.current = null
        }
    }, [state])

    return [state, setStateCallback]
}

type DropzoneProps = {
    passFiles: (files: any) => void
    passInstance: (state: boolean) => void
    files: any
    instance_url: string
    instance: any
}

function Dropzone({ files, passFiles, passInstance, instance_url, instance }: DropzoneProps) {
    /* const [files, setFiles] = useState(props.files)
    useEffect(() => {
        console.log(files)
        props.passFiles(files)
    }, [files]) */

    const onDrop = useCallback(acceptedFiles => {
        let tempPropFiles = files
        if (!instance) {
            axios.get(instance_url + '/instance/start').then(() => {
                passInstance(true)
            }).catch(e => {console.log(e)})
        }
        passFiles(tempPropFiles.concat(acceptedFiles))

        /* setFiles((curr) => {
            return [...curr].concat(acceptedFiles)
        }) */
    }, [files])
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    return (
        <div className={s.dropzone} {...getRootProps()}>
            <input {...getInputProps()} />
            <ul>
            {isDragActive ?
                <li>Drop the files here ...</li> :
                <li>Drag and drop files here, or click here to select files.</li>
            }
            <li>When uploading separate GPS data (XLS, CSV and GPX accepted), make sure they share the same filename with the video file.</li>
            <li>Interact with the selected files by <b style={{color: 'black'}}>checking</b> them and clicking the corresponding button.</li>
            <li>Select a route for the files individually or use the dropdown to select a route for all checked files.</li>
            <li>We can now proceed to upload the files.</li>
            <li>We can tag the files for processing after the upload.</li>
            <li>Ideally, after files have been processed, delete the files to save space.</li>
            <li>The close button on each file only removes the respective file from the interface.</li>
            <li>Make sure to click <b style={{color: 'black'}}>Finish</b> when done uploading and processing.</li>
            </ul>
        </div>
    )
}

type SingleFileUploadProps = {
    file: any
    checked: boolean
    status: string
    route: string
    onClose: (filename: string) => void
}

const SingleFileUpload = forwardRef(({file: fileProp, checked: checkedProp, status: statusProp, onClose}: SingleFileUploadProps, ref) => {

    const url = "http://13.251.37.189:3001"
    const instance_url = "http://18.136.217.164:3001"

    const CHUNK_SIZE = 52428800

    const [progress, setProgress] = useState(0)
    const [file, setFile] = useState(fileProp)
    const [route, setRoute] = useState('')
    const [routes, setRoutes] = useState([])
    const [checked, setChecked] = useState(checkedProp)
    const [status, setStatus] = useState(statusProp)
    const [status2, setStatus2] = useState('')
    const [batch, setBatch] = useState(0)
    const [batches, setBatches] = useState([])
    const [tracking, setTracking] = useState(0)

    const [currChecksum, setCurrChecksum] = useState('')
    const [currChunk, setCurrChunk] = useState(0)



    const selectRef = useRef<any>()
    const selectBatchRef = useRef<any>()

    const generateChecksum = (file: any) => {
        return crypto.createHash('md5').update(file).digest('hex')
    }


    useEffect(() => {
        let updateProcess: any
        if (status == 'processing') {
            updateProcess = setInterval(() => {
                axios.get(instance_url + `/process/tracking_process?tracking=${tracking}`).then((res) => {
                    setStatus2(res.data.status)
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
        if (status == 'noRoute') {
            if (route != '') {
                setStatus('ready')
            }
        }
        if (route == '') {
            setStatus('noRoute')
        }
    }, [route])

    useEffect(() => {
        console.log(tracking)
    }, [tracking])

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
                stage: 'update',
                status: status,
                route: route,
                batch: batch,
                fileName: file.name,
                tracking: tracking
            }
            axios.post(instance_url + '/process/tracking', req).then((res) => {
                resolve(res.data.tracking)
            }).catch(e => {
                reject(e)
            })
        })
    }

    const upload = async () => {
        if (status == 'uploading') {
            return;
        }
    
        let bytes, totalBytesSent
        axios.get(url + `/v2/process/upload_status?filename=${file.name}&route=${route}&batch=${batch}`).then(async (res) => {
            setStatus('uploading')
            setTracking(parseInt(res.data.tracking))
            bytes = res.data.bytes
            totalBytesSent = bytes
    
            for (let i = bytes; i < file.size; i += CHUNK_SIZE) {
                let [currChunk, currChecksum, currChunkSize] = await buildChunk(i)
                let [formData, config] = await buildRequest(currChunk, currChecksum, i, currChunkSize, totalBytesSent)
                await uploadChunk(formData, config)
                totalBytesSent += currChunkSize
            }
            setStatus('uploaded')
            tracking_update('Uploaded')
        }).catch((e) => {
            console.log(e)
            setStatus('upload-problem')
            return
        })
    
        async function buildChunk(chunkStart: any) {
            let nextByte = Math.min(file.size, chunkStart + CHUNK_SIZE)
            let chunkSlice = file.slice(chunkStart, nextByte);
            let chunk = new File([chunkSlice], file.name, {lastModified: file.lastModified})
            let chunkBuffer = await chunk.arrayBuffer();
            console.log(chunkBuffer)
            let checksum = generateChecksum(Buffer.from(chunkBuffer))
            return [chunk, checksum, nextByte - chunkStart]
        }
    
        async function buildRequest(currChunk: any, currChecksum: any, chunkStart: any, currChunkSize: any, totalBytesSent: any) {
            let formData = new FormData()
            formData.append('file', currChunk)
            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "x-file-name": file.name,
                    "x-file-size": file.size,
                    "x-file-checksum": currChecksum,
                    "x-chunk-size": currChunkSize,
                    "x-chunk-start": chunkStart,
                    "x-route": route,
                    "x-batch": batch,
                    "x-tracking": tracking
                },
                onUploadProgress: (ProgressEvent: any) => {
                    let tempProgress = Math.round((totalBytesSent + ProgressEvent.loaded) / (file.size) * 100)
                    setProgress(tempProgress)
                }
            }
            return [formData, config]
        }
    
        async function uploadChunk(formData: any, config: any) {
            try {
                const res = await axios.post(url + '/v2/process/chunk', formData, config)
                const { data } = await res
                console.log(data)
                if (data.status == 0) {
                    await uploadChunk(formData, config)
                }
                return
            } catch (e) {
                await uploadChunk(formData, config)
                return
            }
        }
    }



    const getStatusDisplay = () => {
        if (status == 'noRoute') {
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
        if (status =='uploading') {
            return (
                <div className="UploadingStatusDisplay">
                    <Loader />
                    <p className="UploadLabel">Uploading... {`${progress}%`}</p>
                </div>
            )
        }
        if (status =='uploaded') {
            return (
                <div className="ReadyStatusDisplay">
                    <a href={`${url}/watch/${file.name}`} target="_blank" type="video/mp4"><img src="/assets/uploaded.png" className="StatusImages" /></a>
                    <p className="ReadyLabel">Uploaded</p>
                </div>
            )
        }
        if (status == 'processing') {
            return (
                <div className="UploadingStatusDisplay">
                    <div className="Loader" />
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
        axios.get(instance_url + '/routes').then((res) => {
            setRoutes(res.data)
        })
    }

    const handleSelectChange = (e: any) => {
        setRoute(e.label)
        console.log(e.label)
    }

    const handleBatchSelect = () => {
        axios.post(instance_url + '/batch/route', {route: route}).then((res) => {
            setBatches(res.data.map((batch: any) => ({value: batch.batch, label: batch.batch})))
        })
    }

    const handleBatchSelectChange = (e: any) => {
        setBatch(e.value)
    }

    const handleClose= () => {
        onClose(file.name)
    }

    return(
        <div className={s.singleFileUpload}>
            <button onClick={handleClose} className={s.close}>
                ✕
            </button>
            <div className={s.uploadLabel}>
                <input type="checkbox" id={`checkbox-${file.name}`} checked={checked} onChange={() => {setChecked((curr) => {return !curr})}} />
                <label htmlFor={`checkbox-${file.name}`}>
                    {file.name}
                </label>
                <Select className={s.select} key={`select-route-${file.name}`} placeholder="Select route" ref={selectRef} value={route == "" ? null : {value: -1, label: route}} options={routes} isSearchable={false} onMenuOpen={handleSelect} onChange={handleSelectChange} />
                <Select className={s.select} key={`select-batch-${file.name}`} placeholder="Select batch" ref={selectBatchRef} value={batch == 0 ? null : {value: -1, label: batch}} options={batches} isSearchable={false} onMenuOpen={handleBatchSelect} onChange={handleBatchSelectChange} />
            </div>
            <div className="StatusDisplay">
                {getStatusDisplay()}
            </div>
        </div>
    )
})

export default function Uploader() {
    const url = "http://13.251.37.189:3001"
    const instance_url = "http://18.136.217.164:3001"

    const [files, setFiles] = useStateCallback([])
    const [route, setRoute] = useState<any>('')
    const [batch, setBatch] = useState(0)
    const [batches, setBatches] = useState<any>([])
    const [routes, setRoutes] = useState<any>([])
    const [statusControl, setStatusControl] = useState('ready')
    const [Uploads, setUploads] = useState<any>([])
    const [all, setAll] = useState(false)
    const [instance, setInstance] = useState(false)
    const [toggleDropdown, toggle] = useState(false)
    const [max, setMax] = useState(null)

    useEffect(() => {
        axios.get(instance_url + "/instance/check").then(res => {
            let instanceStatus = res.data.State.Name
            if (instanceStatus == "running") {
                setInstance(true)
            } else {
                setInstance(false)
            }
        })
    }, [])

    useEffect(() => {
        setBatch(0)
    }, [route])

    useEffect(() => {
        axios.get(instance_url + "/instance/check").then(res => {
            let instanceStatus = res.data.State.Name
            if (instanceStatus == "running") {
                setInstance(true)
            } else {
                setInstance(false)
            }
        })
    }, [instance])

    useEffect(() => {
        for (let i = 0; i < Uploads.length; i++) {
            Uploads[i].jsx.ref.current.check(all)
        }
    }, [all])

    useEffect(() => {
        setUploads((curr: any) => {
            return files.map((file: any) => {
                return {
                    jsx: <SingleFileUpload key={file.name} ref={React.createRef()} file={file} route={route} status='noRoute' onClose={handleClose} checked={all} />
                }
            })
            /* let FileUploads = []
            for (let i = 0; i < files.length; i++) {
                FileUploads.push(
                    {
                        file: files[i],
                        jsx: <SingleFileUpload ref={React.createRef()} file={files[i]} route={route} status={statusControl} checked={all} />
                    }
                )
            }
            console.log(FileUploads)
            return FileUploads */
        })
    }, [files])

    const handleSelectAll = (e: any) => {
        console.log('all selected')
        setAll((curr) => {
            return !curr
        })
    }

    const handleUpload = () => {
        for (let i = 0; i < Uploads.length; i++) {
            if (!Uploads[i].jsx.ref.current.checked) {
                continue
            }
            Uploads[i].jsx.ref.current.upload()
        }
    }

    const handleDelete = () => {
        let req = Uploads.filter((upload: any) => {
            let uploadState = upload.jsx.ref.current
            return (uploadState.checked)
        }).map((upload: any) => {
            return {filename: upload.jsx.ref.current.name}
        })
        axios.post(url + "/v2/process/delete", req).then(res => {
            console.log(res)
        }).catch(e => {
            console.log(e)
        })
        setFiles((curr: any) => {
            return curr.filter((element: any) => {
                let index = Uploads.findIndex((i: any) => {
                    return i.jsx.ref.current.name == element.name
                })
                return !Uploads[index].jsx.ref.current.checked
            })
        })
    }

    const handleClose = (filename: any) => {
        setFiles((curr: any) => {
            return curr.filter((element: any) => {
                return (filename !== element.name)
            })
        })
    }

    const handleProcess = () => {
        let req = Uploads.filter((upload: any) => {
            let uploadState = upload.jsx.ref.current
            return ((uploadState.checked) && (uploadState.status == 'uploaded') && (uploadState.process() || 1))
        }).map((upload: any) => {
            return {filename: upload.jsx.ref.current.name, route: upload.jsx.ref.current.route, batch: upload.jsx.ref.current.batch, tracking: upload.jsx.ref.current.tracking}
        })
        if (req.length) {
            axios.post(url + "/v2/process/process", req).then(res => {
                let result = res.data
                for (let upload of Uploads) {
                    let uploadState = upload.jsx.ref.current;
                    if ((uploadState.status == 'processing') && (uploadState.checked)) {
                        if (result[uploadState.name] != 'ok') {
                            uploadState.failed()
                        } else {
                            uploadState.processed()
                        }
                    }
                }
            }).catch(e => {
                console.log(e)
            })
        }
    }

    const handleFinish = () => {
        axios.get(instance_url +"/instance/stop").then(() => {
            setInstance(false)
            setFiles([])
        }).catch((e) => {
            console.log(e)
        })
        // axios.get(url + "/v2/process/finish").then(() => {
        //     axios.get(instance_url +"/instance/stop").then(() => {
        //         setInstance(false)
        //         setFiles([])
        //     }).catch((e) => {
        //         console.log(e)
        //     })
        // }).catch((e) => {
        //     console.log(e)
        // })
    }

    const getFiles = (files: any) => {
        console.log(files)
        setFiles(files)
    }

    const handleSelect = () => {
        axios.get(instance_url + '/routes').then((res) => {
            setRoutes([{value: 'nothing', label: 'Select individually'}].concat(res.data))
        })
    }

    const handleSelectChange = (e: any) => {
        setRoute(e.label)
        for (let upload of Uploads) {
            let uploadState = upload.jsx.ref.current
            if (uploadState.checked) {
                uploadState.changeRoute(e)
            }
        }
    }

    const handleCreateRoute = (e: any) => {
        let req = {
            route: e
        }
        console.log('inserting route:', e)
        axios.post(instance_url + '/routes/insert', req).then(res => {
            console.log(res.data)
            if (res.data == 'Success!') {
                handleSelectChange({value: 'creation', label: e})
                setRoute(e)
            }
        }).catch(e => {console.log(e)})
    }

    const handleDropdown = () => {
        console.log(toggleDropdown)
        toggle((curr) => (!curr))
    }

    useEffect(() => {
        axios.post(instance_url + '/batch/route2', {route: route}).then((res) => {
            if (route != "" && max !== null) {
                setBatches(([{value: 'creation', label: `+ New batch (${max + 1})`}]).concat(res.data.map((batch: any) => ({value: batch.batch, label: batch.batch}))))
            } else {
                setBatches([])
            }
        }).catch((e => {
            console.log(e)
        }))
    }, [max])

    const handleBatchSelect = () => {
        if (route != "") {
            axios.post(instance_url + '/batch/max', {route: route}).then((res) => {
                setMax(res.data.max)
            }).catch(e => {
                console.log(e)
            })
        }
    }

    const handleBatchSelectChange = (e: any) => {
        if (e.value == 'creation' && max !== null) {
            handleCreateBatch(max + 1)
            return
        }
        setBatch(e.value)
        for (let upload of Uploads) {
            let uploadState = upload.jsx.ref.current
            if (uploadState.checked) {
                uploadState.changeBatch(e)
            }
        }
    }

    const handleCreateBatch = (e: any) => {
        let req = {
            route: route,
            batch: e
        }
        axios.post(instance_url + '/batch/insert', req).then(res => {
            console.log(res.data)
            if (res.data == 'ok') {
                setBatch(e)
                for (let upload of Uploads) {
                    let uploadState = upload.jsx.ref.current
                    if (uploadState.checked) {
                        uploadState.changeBatch({value: e, label: e})
                    }
                }
            }
        }).catch(e => {console.log(e)})
    }

    const batchCheck = (input: any) => {
        const isNormalInteger = (str: any) => {
            var n = Math.floor(Number(str));
            return n !== Infinity && String(n) === str && n >= 0;
        }
        console.log(isNormalInteger(input))
        return isNormalInteger(input)
    }

    const handleConvert = () => {
        let files = Uploads.filter((upload: any) => {
            let uploadState = upload.jsx.ref.current
            return ((uploadState.checked) && (uploadState.status == 'uploaded') && (uploadState.process() || 1))
        }).map((upload: any) => {
            return {name: upload.jsx.ref.current.name}
        })

        let req = {
            files: files
        }
        if (files.length) {
            axios.post(url + "/v2/process/convert", req).then(res => {
                let result = res.data
                for (let upload of Uploads) {
                    let uploadState = upload.jsx.ref.current;
                    if ((uploadState.status == 'processing') && (uploadState.checked)) {
                        if (result[uploadState.name] != 'ok') {
                            uploadState.failed()
                        } else {
                            uploadState.uploaded()
                            setFiles((curr: any) => {
                                return curr.map((element: any) => {
                                    let tempElement = JSON.parse(JSON.stringify(element))
                                    if (uploadState.name == element.name) {
                                        tempElement.name = `${uploadState.name.split(".")[0]}.mp4`
                                    }
                                    return tempElement
                                })
                            })
                        }
                    }
                }
            }).catch(e => {
                console.log(e)
            })
        }
    }

    return(
        <div className={s.container}>
            <Dropzone files={files} instance_url={instance_url} instance={instance} passFiles={getFiles} passInstance={(bool) => {setInstance(bool)}} />
            <div className={s.uploadInterface}>
                <div className={s.uploadControl}>
                    <span className={s.button} onClick={(e) => handleSelectAll(e)} >
                        <input type="checkbox" id="all" checked={all} />
                        <label style={{cursor: 'pointer'}}>Select All</label>
                    </span>
                    <button className={s.button} onClick={handleUpload} disabled={!instance}>Upload</button>
                    {/* <button className="btn3" onClick={handleConvert} disabled={!instance}>Convert</button> */}
                    <button className={s.button} onClick={handleProcess} disabled={!instance}>Process</button>
                    <button className={s.button} onClick={handleFinish} disabled={!instance}>Finish</button>
                    <button className={s.button} onClick={handleDelete} disabled={!instance}>Delete</button>
                    <Dropdown isOpen={toggleDropdown} onClick={handleDropdown}>
                        <Creatable className={s.creatable} placeholder="Select or type to create new route..." key={`select-all`} value={route == "" ? null : {value: -1, label: route}} options={routes} isSearchable={true} onMenuOpen={handleSelect} onChange={handleSelectChange} onCreateOption={handleCreateRoute} />
                        <Select className={s.select} placeholder="Select or add new batch..." key={`select-batch-all`} value={batch == 0 ? null : {value: -1, label: batch}} options={batches} isSearchable={true} onMenuOpen={handleBatchSelect} onChange={handleBatchSelectChange} />
                    </Dropdown>
                    {/* <Creatable placeholder="Select or insert route for checked" key={`select-all`} value={route == "" ? null : {value: -1, label: route}} options={routes} className="RouteSelect3" isSearchable={true} onMenuOpen={handleSelect} onChange={handleSelectChange} onCreateOption={handleCreateRoute} /> */}
                    {/* <Select placeholder="Select for checked" key={`select-all`} options={routes} className="RouteSelect2" isSearchable={false} onMenuOpen={handleSelect} onChange={handleSelectChange} /> */}
                </div>
                <div className={s.uploadDisplay}>
                    {Uploads.length ? Uploads.map((upload: any) => {return upload.jsx}) : <div className={s.noFiles}>
                        No files yet.    
                    </div>}
                </div>
            </div>
        </div>
    )
}

type DropdownProps = {
    children?: ReactNode
    isOpen: boolean
    onClick: () => void
    batch?: string
    route?: string
}

const Dropdown = ({children, isOpen, onClick, batch, route}: DropdownProps): JSX.Element => (
    <div className={s.forChecked}>
        <div className={isOpen ? "DropdownButton clicked" : "DropdownButton"} onClick={onClick}>
            {'For checked:'}&nbsp;&nbsp;<span className={Boolean(isOpen) ? `${s.arrowDown}` : `${s.arrowRight}`} />
        </div>
        {isOpen ?
            <div
            className={s.dropdownContent} 
            style={{
                backgroundColor: 'white',
                borderRadius: 4,
                boxShadow: `0 0 0 1px hsla(218, 50%, 10%, 0.1), 0 4px 11px hsla(218, 50%, 10%, 0.1)`,
                marginTop: 8,
                position: 'absolute',
                zIndex: 2,
              }}>
                {children}
            </div>
            :
            null
        }
        {isOpen ? 
        <div
            style={{
                inset: 0,
                position: 'fixed',
                zIndex: 1,
            }}
            onClick={onClick}
        /> : null}
    </div>
)
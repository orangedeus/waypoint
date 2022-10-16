import React, { ReactNode, forwardRef, useEffect, useRef, useState, useCallback, useImperativeHandle, ReactChild, ReactElement, ReactComponentElement } from 'react';
import Select from 'react-select';
import Creatable from 'react-select/creatable';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

import crypto from 'crypto';
import { Buffer } from 'buffer';

import s from './uploader.module.scss'
import Loader from './Loader';

import { service as instanceService } from '../../../../../../utils/api/InstanceService';
import { service as routeService } from '../../../../../../utils/api/RouteService';
import { service as processService } from '../../../../../../utils/api/ProcessService';


import SingleFileUpload, { Status } from '../SingleFileUpload'
import { BACKEND_API } from '../../../../../../utils/api/endpoints';

function useStateCallback(initialState: any) {
    const [state, setState] = useState(initialState)
    const cbRef = useRef<any>(null)

    const setStateCallback = useCallback((state: any, cb: any) => {
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
            instanceService.startInstance().then(() => {
                passInstance(true)
            }).catch(e => { console.log(e) })
        }
        passFiles(tempPropFiles.concat(acceptedFiles))

        /* setFiles((curr) => {
            return [...curr].concat(acceptedFiles)
        }) */
    }, [files])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    return (
        <div className={s.dropzone} {...getRootProps()}>
            <input {...getInputProps()} />
            <ul>
                {isDragActive ?
                    <li>Drop the files here ...</li> :
                    <li>Drag and drop files here, or click here to select files.</li>
                }
                <li>When uploading separate GPS data (XLS, CSV and GPX accepted), make sure they share the same filename with the video file.</li>
                <li>Interact with the selected files by <b style={{ color: 'black' }}>checking</b> them and clicking the corresponding button.</li>
                <li>Select a route for the files individually or use the dropdown to select a route for all checked files.</li>
                <li>We can now proceed to upload the files.</li>
                <li>We can tag the files for processing after the upload.</li>
                <li>Ideally, after files have been processed, delete the files to save space.</li>
                <li>The close button on each file only removes the respective file from the interface.</li>
                <li>Make sure to click <b style={{ color: 'black' }}>Finish</b> when done uploading and processing.</li>
            </ul>
        </div>
    )
}

type UploadElement = {
    jsx: JSX.Element | any
}

export default function Uploader() {

    const [files, setFiles] = useStateCallback([])
    const [route, setRoute] = useState<string>('')
    const [batch, setBatch] = useState<number>(0)
    const [batches, setBatches] = useState<any>([])
    const [routes, setRoutes] = useState<any>([])
    const [Uploads, setUploads] = useState<UploadElement[]>([])
    const [all, setAll] = useState(false)
    const [instance, setInstance] = useState(false)
    const [toggleDropdown, toggle] = useState(false)
    const [max, setMax] = useState(null)

    useEffect(() => {
        instanceService.checkInstance().then(data => {
            let instanceStatus = data.State.Name
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
        instanceService.checkInstance().then(data => {
            let instanceStatus = data.State.Name
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
                    jsx: <SingleFileUpload key={file.name} ref={React.createRef()} file={file} route={route} status='no-route' onClose={handleClose} checked={all} />
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
            return { filename: upload.jsx.ref.current.name }
        })
        processService.postDeleteFile(req).then(data => {
            console.log(data)
        }).catch(e => {
            console.log(e)
        })
        setFiles((curr: File[]) => {
            return curr.filter((element: File) => {
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
            return { filename: upload.jsx.ref.current.name, route: upload.jsx.ref.current.route, batch: upload.jsx.ref.current.batch, tracking: upload.jsx.ref.current.tracking }
        })
        if (req.length) {
            processService.postProcessFile(req).then(data => {
                let result = data
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
        instanceService.stopInstance().then(() => {
            setInstance(false)
            setFiles([])
        }).catch((e) => {
            console.log(e)
        })
    }

    const getFiles = (files: any) => {
        console.log(files)
        setFiles(files)
    }

    const handleSelect = () => {
        routeService.getRoutes().then((data) => {
            setRoutes([{ value: 'nothing', label: 'Select individually' }].concat(data))
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
        console.log('inserting route:', e)
        routeService.postNewRoute(e).then(data => {
            if (data == 'Success!') {
                handleSelectChange({ value: 'creation', label: e })
                setRoute(e)
            }
        }).catch(e => { console.log(e) })
    }

    const handleDropdown = () => {
        console.log(toggleDropdown)
        toggle((curr) => (!curr))
    }

    useEffect(() => {

        routeService.getRouteBatches(route).then((data) => {
            if (route != "" && max !== null) {
                setBatches(([{ value: 'creation', label: `+ New batch (${max + 1})` }]).concat(data.map((batch: any) => ({ value: batch.batch, label: batch.batch }))))
            } else {
                setBatches([])
            }
        }).catch((e => {
            console.log(e)
        }))
    }, [max])

    const handleBatchSelect = () => {
        if (route != "") {
            routeService.getLatestBatch(route).then((data) => {
                setMax(data.max)
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
        routeService.postNewBatch(route, e).then(data => {
            if (data == 'ok') {
                setBatch(e)
                for (let upload of Uploads) {
                    let uploadState = upload.jsx.ref.current
                    if (uploadState.checked) {
                        uploadState.changeBatch({ value: e, label: e })
                    }
                }
            }
        }).catch(e => { console.log(e) })
    }

    const batchCheck = (input: any) => {
        const isNormalInteger = (str: any) => {
            var n = Math.floor(Number(str));
            return n !== Infinity && String(n) === str && n >= 0;
        }
        console.log(isNormalInteger(input))
        return isNormalInteger(input)
    }

    return (
        <div className={s.container}>
            <Dropzone files={files} instance_url={BACKEND_API} instance={instance} passFiles={getFiles} passInstance={(bool) => { setInstance(bool) }} />
            <div className={s.uploadInterface}>
                <div className={s.uploadControl}>
                    <span className={s.button} onClick={(e) => handleSelectAll(e)} >
                        <input type="checkbox" id="all" checked={all} />
                        <label style={{ cursor: 'pointer' }}>Select All</label>
                    </span>
                    <button className={s.button} onClick={handleUpload} disabled={!instance}>Upload</button>
                    {/* <button className="btn3" onClick={handleConvert} disabled={!instance}>Convert</button> */}
                    <button className={s.button} onClick={handleProcess} disabled={!instance}>Process</button>
                    <button className={s.button} onClick={handleFinish} disabled={!instance}>Finish</button>
                    <button className={s.button} onClick={handleDelete} disabled={!instance}>Delete</button>
                    <Dropdown isOpen={toggleDropdown} onClick={handleDropdown}>
                        <Creatable className={s.creatable} placeholder="Select or type to create new route..." key={`select-all`} value={route == "" ? null : { value: -1, label: route }} options={routes} isSearchable={true} onMenuOpen={handleSelect} onChange={handleSelectChange} onCreateOption={handleCreateRoute} />
                        <Select className={s.select} placeholder="Select or add new batch..." key={`select-batch-all`} value={batch == 0 ? null : { value: -1, label: batch }} options={batches} isSearchable={true} onMenuOpen={handleBatchSelect} onChange={handleBatchSelectChange} />
                    </Dropdown>
                    {/* <Creatable placeholder="Select or insert route for checked" key={`select-all`} value={route == "" ? null : {value: -1, label: route}} options={routes} className="RouteSelect3" isSearchable={true} onMenuOpen={handleSelect} onChange={handleSelectChange} onCreateOption={handleCreateRoute} /> */}
                    {/* <Select placeholder="Select for checked" key={`select-all`} options={routes} className="RouteSelect2" isSearchable={false} onMenuOpen={handleSelect} onChange={handleSelectChange} /> */}
                </div>
                <div className={s.uploadDisplay}>
                    {Uploads.length ? Uploads.map((upload: any) => { return upload.jsx }) : <div className={s.noFiles}>
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

const Dropdown = ({ children, isOpen, onClick, batch, route }: DropdownProps): JSX.Element => (
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
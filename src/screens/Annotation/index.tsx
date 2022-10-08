import React, { useEffect, useRef, useState } from 'react'
import s from './annotation.module.scss'
import { service } from '../../utils/api/AnnotationService'

import Flicking, { MOVE_TYPE, ChangedEvent } from '@egjs/react-flicking'
import "@egjs/react-flicking/dist/flicking.css"
import ReactPlayer from 'react-player'
import Select, { SingleValue } from 'react-select'
import { useRecoilState } from 'recoil'

import InputBox from '../../components/InputBox'
import { Stops } from '../../types/Stops'
import { authState } from '../../stores/auth'
import Landing from './Landing'

import Loader from '../../components/Loader'
import { BACKEND_API } from '../../utils/api/endpoints';

type Video = {
    url: string
}

const ERROR_MESSAGES = [
    `Kailangan muna ito sagutan.`,
    `May walang laman.`,
    `May mali sa mga ibinigay.`
]

const Annotation = (): JSX.Element => {

    const [currentIndex, setCurrentIndex] = useState(0)
    const [error, setError] = useState(-1)

    const [submitting, setSubmitting] = useState(false)


    const [finishedIndex, setFinishedIndex] = useState(0)

    const [following, setFollowing] = useState<boolean | undefined | null>()
    const [annotated, setAnnotated] = useState<string | undefined>()
    const [boarding, setBoarding] = useState<string | undefined>()
    const [alighting, setAlighting] = useState<string | undefined>()

    const [{ code, admin, surveyed },] = useRecoilState(authState)

    const [videos, setVideos] = useState<Video[]>([])

    useEffect(() => {
        const prevFinishedIndex = localStorage.getItem('finishedIndex')
        if (prevFinishedIndex !== null) {
            setFinishedIndex(Number(prevFinishedIndex))
        }
    }, [])

    useEffect(() => {
        service.getStopsForAnnotation(String(code)).then((data) => {
            setVideos(data.map((stop: Stops) => {
                return { url: stop.url }
            }))
        })
    }, [code])


    const validateForm = () => {
        if (following === null || following === undefined || annotated === undefined || boarding === undefined || alighting === undefined) {
            setError(1)
            return false
        }

        if (annotated === '' || boarding === '' || alighting === '') {
            setError(1)
            return false
        }

        if (!validateNumber(annotated) || !validateNumber(boarding) || !validateNumber(alighting)) {
            setError(2)
            return false
        }
        return true
    }

    const validateNumber = (value: string) => {
        if (value === undefined) {
            return false
        }

        if (value === '') {
            return false
        }

        const num = Number(value)

        if (!Number.isInteger(num)) {
            return false
        }

        if (num < 0) {
            return false
        }

        return true
    }

    const flickingRef = useRef<any>()

    const handleNext = () => {
        if (flickingRef.current && currentIndex + 1 < videos.length + 1) {
            flickingRef.current.moveTo(currentIndex + 1)
        }
    }

    const handlePrev = () => {
        if (flickingRef.current && currentIndex - 1 >= 0) {
            flickingRef.current.moveTo(currentIndex - 1)
        }
    }

    useEffect(() => {
        if (currentIndex > finishedIndex) {
            setError(0)
            setCurrentIndex(finishedIndex)
            flickingRef.current.moveTo(finishedIndex)
        }
    }, [currentIndex])

    useEffect(() => {
        setTimeout(() => flickingRef.current.moveTo(finishedIndex), 500)
        localStorage.setItem('finishedIndex', String(finishedIndex))
    }, [finishedIndex])

    const handleChangeFollowing = (event: SingleValue<{
        value: boolean;
        label: string;
    }>) => {
        setFollowing(event?.value)
    }

    const handleChangeAnnotated = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAnnotated(event.target.value)
    }

    const handleChangeBoarding = (event: React.ChangeEvent<HTMLInputElement>) => {
        setBoarding(event.target.value)
    }

    const handleChangeAlighting = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAlighting(event.target.value)
    }

    const timeoutRef = useRef<any>()

    useEffect(() => {
        clearTimeout(timeoutRef.current)
        if (error !== -1) {
            timeoutRef.current = setTimeout(() => {
                setError(-1)
            }, 2000)
        }
    }, [error])

    const getProgressBg = () => {
        const percentage = ((finishedIndex / videos.length) * 100)
        return `${percentage}%`
    }

    const handleAnnotate = () => {
        console.log(following, annotated, boarding, alighting)
        if (!validateForm()) {
            return false
        }
        setSubmitting(true)
        service.postAnnotationData({
            following: Boolean(following),
            annotated: Number(annotated),
            alighting: Number(alighting),
            boarding: Number(boarding),
            url: videos[currentIndex].url,
            code: String(code)
        }).then(() => {
            setSubmitting(false)
            if (currentIndex + 1 > finishedIndex) {
                setFinishedIndex(currentIndex + 1)
            } else {
                if (flickingRef.current) {
                    flickingRef.current.moveTo(currentIndex + 1)
                }
            }
        }).catch(() => {
            setSubmitting(false)
        })
    }

    useEffect(() => {
        setFollowing(null)
        setAnnotated(undefined)
        setAlighting(undefined)
        setBoarding(undefined)
    }, [submitting])

    const handleProgressClick = () => {
        if (flickingRef.current) {
            flickingRef.current.moveTo(finishedIndex)
        }
    }

    return (
        <>
            {(!admin && !surveyed) && <Landing />}
            <div className={s.container}>
                <div className={s.videosContainer}>
                    {videos.length > 0 && <Flicking
                        ref={flickingRef}
                        moveType={[MOVE_TYPE.SNAP, { count: videos.length }]}
                        horizontal={false}
                        renderOnlyVisible={true}
                        onChanged={(event: ChangedEvent<Flicking>) => {
                            setCurrentIndex(event.index)
                        }}
                    >
                        {videos.map((video, i) => {
                            return (
                                <div className={s.videoContainer} key={`video-container-${i}`}>
                                    {((i < currentIndex + 2) && (i > currentIndex - 2)) && <ReactPlayer key={`video-${i}`} width={800} height={450} controls url={`${BACKEND_API}/videos/${video.url}`} />}
                                </div>
                            )
                        })}
                        <div className={s.finish}>
                            <div className={s.finishHeader}>
                                Done!
                            </div>
                        </div>
                    </Flicking>}
                </div>
                <div className={s.formContainer}>
                    <div className={s.scrollbar}>
                        <div className={s.arrowUp} onClick={handlePrev} style={{
                            borderTop: error === 0 ? `solid 4px red` : `solid 4px black`,
                            borderLeft: error === 0 ? `solid 4px red` : `solid 4px black`
                        }} />
                        <div className={s.progressBar} onClick={handleProgressClick} style={{
                            border: error === 0 ? `solid 1px red` : (finishedIndex === videos.length ? `none` : `solid 1px black`)
                        }}>
                            <div className={s.progress} style={{
                                minHeight: getProgressBg(),
                                backgroundColor: error === 0 ? `red` : (finishedIndex === videos.length ? `#62A2CC` : `black`)
                            }} />
                        </div>
                        <div className={s.arrowDown} onClick={handleNext} style={{
                            borderTop: error === 0 ? `solid 4px red` : `solid 4px black`,
                            borderLeft: error === 0 ? `solid 4px red` : `solid 4px black`
                        }} />
                    </div>
                    <div className={s.formContent}>
                        <div className={s.progressCount}>
                            {`${currentIndex < videos.length ? currentIndex + 1 : currentIndex} / ${videos.length}`}
                        </div>
                        <div className={s.errorDisplay} style={{
                            minHeight: error === -1 ? `0px` : `30px`
                        }}>
                            {error !== -1 && <span className={s.errorMessage}>
                                <span className={s.errorSymbol}>!</span>
                                {`${ERROR_MESSAGES[error]}`}
                            </span>}
                        </div>
                        <div className={s.form}>
                            <Select className={s.select} options={[{ value: true, label: 'Oo' }, { value: false, label: 'Hindi' }]} placeholder={'Sumusunod sa COVID Guidelines?'} value={following !== null ? { value: Boolean(following), label: following ? 'Oo' : 'Hindi' } : null} onChange={handleChangeFollowing} />
                            <InputBox className={s.input} value={annotated} onChange={handleChangeAnnotated} id='annotated' label='Bilang ng tao sa dulo ng bidyo' />
                            <InputBox className={s.input} value={boarding} onChange={handleChangeBoarding} id='boarding' label='Sumakay' />
                            <InputBox className={s.input} value={alighting} onChange={handleChangeAlighting} id='alighting' label='Bumaba' />
                            <div className={s.submit} onClick={handleAnnotate} >{submitting ? <Loader /> : `Annotate`}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Annotation
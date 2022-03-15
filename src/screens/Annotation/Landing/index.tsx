import React, { useRef, useState } from 'react'
import s from './landing.module.scss'
import Modal from '../../../components/Modal'
import Survey from '../Survey'
import { useRecoilState } from 'recoil'
import { authState } from '../../../stores/auth'
import { service } from '../../../utils/api/AuthService'

const Landing = (): JSX.Element => {

    const [{code}, setAuth] = useRecoilState(authState)

    const [page, setPage] = useState(0)


    const handleSurveySubmit = () => {
        setPage(1)
    }

    const handleContinue = () => {
        service.postLoginCode(String(code)).then((data) => {
            setAuth(data)
        })
    }

    return <Modal className={s.modal}>
        <div className={s.container}>
            <div className={s.header}>
                {page === 0 ? `Welcome to the annotation page!` : `Guidelines`}
            </div>
            <div className={s.body}>
                <div className={s.bodyCamera} style={{
                    transform: `translateX(${page * -100}%)`
                }}>
                    <div className={s.bodyPanel}>
                        <Survey onSubmit={handleSurveySubmit} />
                    </div>
                    <div className={s.bodyPanel}>
                        <div className={s.guidelinesContainer}>
                            <ul>
                                <li>
                                    Bilangin ang rami ng tao sa dulo ng video - kasama ang driver.
                                </li>
                                <li>
                                    Sa pagtukoy ng paglabag sa COVID guidelines, isama lamang ang mga mali o hindi nagsusuot ng facemask.
                                </li>
                                <li>
                                    Sa pagbilang ng bumababa at sumasakay, bilangin kahit ang mga taong nasa akto pa lamang.
                                </li>
                                <li>
                                    Manatiling naka-login kung sakaling titigil muna sandali. Wag mag-logout hanggang hindi tapos.
                                </li>
                            </ul>
                            <div className={s.button} onClick={handleContinue}>
                                CONTINUE
                            </div>
                        </div>
                    </div>
                </div>    
            </div>
        </div>
        <div className={s.banner} />
    </Modal>
}

export default Landing
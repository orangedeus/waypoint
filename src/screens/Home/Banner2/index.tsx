import { ReactNode } from "react"
import s from './banner2.module.scss'
import trafficLight from '../../../assets/traffic-light.svg'

type Banner2Props = {
    children?: ReactNode
}

const Banner2 = ({ children }: Banner2Props) => {
    return (
        <div className={s.container}>
            {children}
            <img className={s.image} src={trafficLight} alt="traffic light" />
        </div>
    )
}

export default Banner2
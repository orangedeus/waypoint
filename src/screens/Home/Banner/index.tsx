import { ReactNode } from "react"
import s from './banner.module.scss'

type BannerProps = {
    children?: ReactNode;
}

const Banner = ({ children }: BannerProps): JSX.Element => {
    return (
        <div className={s.container}>
            {children}
            <div className={s.image}>
                <svg
                    className={s.marker}
                    xmlns="http://www.w3.org/2000/svg"
                    xmlSpace="preserve"
                >
                    <g>
                        <path fill="#62A2CC" d="M26.86 13.43C26.86 6.01 20.84 0 13.43 0S0 6.01 0 13.43c0 2.4.63 4.64 1.73 6.59h-.01L13.43 41.9l11.81-21.89h-.12a13.32 13.32 0 0 0 1.74-6.58zM13.43 9.2c2.34 0 4.23 1.89 4.23 4.23s-1.89 4.23-4.23 4.23-4.23-1.9-4.23-4.23 1.89-4.23 4.23-4.23z" />
                    </g>
                </svg>
            </div>
        </div>
    )
}

export default Banner
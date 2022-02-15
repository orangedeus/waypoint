import s from './footer.module.scss'

import logo from '../../assets/logo.svg';
import arangkadata from '../../assets/arangkadata.svg';

export default function Footer () {
    return (
        <div className={s.container}>
            <div className={s.logosContainer}>
                <a href="/"><img src={logo} alt="Waypoint" /></a>
                <div className={s.divider}/>
                <a href="https://arangkadata.com/"><img src={arangkadata} alt="Arangkadata" /></a>
            </div>
            <div className={s.copyright}>
                {'©2022 ArangkaData'}
            </div>
        </div>
    )
}
import s from './navigation.module.scss'
import { useLocation } from 'react-router-dom'
import AuthButton from '../AuthButton'
import { useRecoilState } from 'recoil'
import { authState, loggingInState } from '../../../stores/auth'
const Navigation = () => {

    const [, setLoggingIn] = useRecoilState(loggingInState)
    const [auth, setAuth] = useRecoilState(authState)

    const location = useLocation()

    const handleAuthClick = () => {
        if (auth.user) {
            setAuth({user: 0, admin: 0})
            localStorage.removeItem('auth')
            localStorage.removeItem('stops')
            localStorage.removeItem('finishedIndex')
        } else {
            setLoggingIn(true)
        }
    }

    return (
        <div className={s.container}>
            <ul>
                <li className={location.pathname === '/' ? s.activeLink : ''}>
                    <a href="/">
                        Home
                    </a>
                </li>
                <li className={location.pathname === '/map' ? s.activeLink : ''}>
                    <a href="/map">
                        Map
                    </a>
                </li>
                {Boolean(auth.user) && <li className={location.pathname === '/annotation' ? s.activeLink : ''}>
                    <a href="/annotation">
                        Annotation
                    </a>
                </li>}
                {Boolean(auth.admin) && <li className={location.pathname.startsWith('/admin') ? s.activeLink : ''}>
                    <a href="/admin">
                        Admin
                    </a>
                </li>}
            </ul>
            <AuthButton onClick={handleAuthClick} />
        </div>
    )
}

export default Navigation
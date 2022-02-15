import s from './authButton.module.scss'

import { useRecoilState } from 'recoil'
import { authState } from '../../../stores/auth'

type AuthButtonProps = {
    onClick?: () => void
}

const AuthButton = ({ onClick }: AuthButtonProps) => {

    const [{ user },] = useRecoilState(authState)
    
    const handleClick = () => {
        if (onClick) {
            onClick()
        }
    }
    
    return (
        <button onClick={handleClick} className={s.container}>
            {Boolean(user) ? `Logout` : `Login`}
        </button>
    )
}

export default AuthButton
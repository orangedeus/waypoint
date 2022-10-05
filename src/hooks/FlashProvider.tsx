import { createContext, ReactNode, useEffect, useState } from 'react'
import FlashMessage, { FlashMessageProps } from '../components/FlashMessage'

type FlashContextType = {
    flash: Partial<FlashMessageProps> | null
    setFlash: ((flash?: Partial<FlashMessageProps>) => void)
}

export const FlashContext = createContext<FlashContextType>({
    flash: null,
    setFlash: (() => true)
})

type FlashProviderProps = {
    children: ReactNode
    timeout?: number
}

const FlashProvider = ({ children, timeout = 4000 }: FlashProviderProps): JSX.Element => {

    const [flash, setFlash] = useState<Partial<FlashMessageProps> | null>(null)

    const handleFlash = (flash?: Partial<FlashMessageProps>) => {
        setFlash(flash ?? null)
    }

    useEffect(() => {
        if (flash) {
            setTimeout(() => {
                setFlash(null)
            }, timeout)
        }
    }, [flash])

    return <FlashContext.Provider value={{
        flash: flash,
        setFlash: handleFlash
    }}>
        {children}
        {flash !== null && <FlashMessage {...flash} />}
    </FlashContext.Provider>

}

export default FlashProvider
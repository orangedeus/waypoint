import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Logo from './Logo'
import Navigation from './Navigation'
import s from './header.module.scss'



export default function Header () {
    const [scrollPosition, setScrollPosition] = useState(0);
    const handleScroll = () => {
        const position = window.pageYOffset;
        setScrollPosition(position);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className={s.container} onScroll={handleScroll} style={{
            boxShadow: scrollPosition > 100 ? `0px -4px 12px 0px rgba(0,0,0,0.75)` : `none`
        }}>
            <Logo />
            <Navigation />
        </div>
    )
}
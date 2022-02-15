import React, { useState, ReactNode } from 'react'
import s from './tabs.module.scss'

type TabsProps = {
    children?: ReactNode,
    className?: string
}

const Tabs = ({ children, className }: TabsProps) => {

    const [activeTab, setActiveTab] = useState(0)

    return (
        <div className={`${s.container} ${className}`}>
            <div className={s.tabButtonsContainer}>
                {React.Children.map(children, (child, key) => {
                    if (child && typeof child === 'object' && 'props' in child) {
                        return(
                            <div className={`${s.tabButton} ${activeTab === key ? s.activeTab : ''}`} onClick={() => {setActiveTab(key)}} key={`${key}-button`}>
                                {child.props.id}
                            </div>
                        )
                    } else {
                        return null
                    }
                })}
            </div>
            <div className={s.tabPanelsContainer}>
                <div className={s.tabPanelsCamera} style={{
                transform: activeTab ? `translateX(-${activeTab}00%)` : `none`
            }}>
                    {React.Children.map(children, (child, key) => {
                        if (child && typeof child === 'object' && 'props' in child) {
                            return(
                                <div className={s.tabPanel} key={`${key}-panel`}>
                                    {child}
                                </div>
                            )
                        } else {
                            return null
                        }
                    })}
                </div>
            </div>
        </div>
    )
}

export default Tabs
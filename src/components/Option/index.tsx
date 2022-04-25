import React, { ReactNode, useState } from 'react'
import s from './option.module.scss'
import cx from 'classnames'

export type Option<T> = {
    label: ReactNode
    value: T
    color?: string
}

type OptionsProps<T> = {
    options: Option<T>[]
    color?: string
    circleSize?: number
    className?: string 
    onSelect?: ((time: T) => void)
    defaultOption?: Option<T>
}

const Options = <T,>({options, onSelect, defaultOption, color = "#62A2CC", className = s.default, circleSize = 16}: OptionsProps<T>): JSX.Element => {

    const [selected, setSelected] = useState<Option<T> | undefined>(defaultOption)

    const handleOptionSelect = (option: Option<T>) => {
        if (onSelect) {
            onSelect(option.value)
        }
        setSelected(option)
    }

    return <div className={cx(s.container, {
        [className]: !!className
    })}>
        {options.map((option, i) => {
            return <div key={`circle-option-${i}`} className={cx(s.circle, {
                [s.selected]: selected?.value === option.value
            })} style={{
                    width: circleSize,
                    height: circleSize,
                    backgroundColor: selected?.color ?? color
                }}
                onClick={() => handleOptionSelect(option)}
            >
                <span style={{
                    color: selected?.color ?? color
                }}>{option.label}</span>
            </div>
        })}
        <div className={s.line} style={{
            backgroundColor: selected?.color ?? color,
            left: `${circleSize}px`,
            width: `calc(100% - ${circleSize * 2}px)`
        }} />
    </div>
}

export default Options
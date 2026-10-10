import './KSlider.css'
import React from 'react'
import { Slider, ConfigProvider } from 'antd'

const KSlider = ({ style = {}, min, max, step, value, defaultValue, onChange, onChangeComplete }) => {
    return (
        <ConfigProvider
            theme={{
                components: {
                    Slider: {
                        handleSize: 14,
                    },
                },
            }}
        >
            <Slider
                className='kslider'
                onChange={onChange}
                onChangeComplete={onChangeComplete}
                defaultValue={defaultValue}
                value={value}
                min={min}
                max={max}
                step={step ?? 1}
                tooltip={{ open: false }}
                style={{ ...style }}
                styles={{
                    rail: {
                        background: 'var(--color-stroke)',
                    },
                    track: {
                        background: 'var(--color-primary)',
                    }
                }}

            />
        </ConfigProvider>
    )
}

export default KSlider
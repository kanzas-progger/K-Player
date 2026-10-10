import { useEffect, useRef } from 'react'
import React from 'react'

const AudioVisualizer = ({ audioAnalyzer, isPlaying }) => {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || !audioAnalyzer) return

        const canvasContext = canvas.getContext('2d')
        let animationFrameId = null

        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight

        const frequencyBufferLength = audioAnalyzer.frequencyBinCount
        const frequencyData = new Uint8Array(frequencyBufferLength)
        const barWidth = canvas.width / frequencyBufferLength

        const barColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim()

        const topPadding = 20

        const maxBarHeight = Math.max(0, canvas.height - topPadding)

        const draw = () => {
            animationFrameId = requestAnimationFrame(draw)

            canvasContext.clearRect(0, 0, canvas.width, canvas.height)

            audioAnalyzer.getByteFrequencyData(frequencyData)
            
            canvasContext.fillStyle = barColor

            for (let i = 0; i < frequencyBufferLength; i++) {
                const rawValue = frequencyData[i]
                const barHeight = (rawValue / 255) * maxBarHeight
                
                canvasContext.fillRect(
                    i * barWidth,
                    canvas.height - barHeight,
                    barWidth - 1,
                    barHeight
                )
            }
        }

        if (isPlaying) {
            draw()
        }
        else {
            draw()
            cancelAnimationFrame(animationFrameId)
        }

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId)
            }
        }
    }, [audioAnalyzer, isPlaying])

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: '100%',
                height: '100px',
                display: 'block',
                borderRadius: '8px'
            }}
        />
    )
}

export default React.memo(AudioVisualizer)

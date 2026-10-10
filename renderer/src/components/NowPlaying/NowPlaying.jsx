import { useKPlayer } from '../contexts/KPlayerContext'
import EmptyImage from '../EmptyImage/EmptyImage'
import AudioVisualizer from '../AudioVisualizer/AudioVisualizer'

const NowPlaying = () => {

    const { track, audioAnalyzer, isPlaying } = useKPlayer()

    return (
        <>
            <div>
                <div style={{
                    display: 'flex',
                    //alignItems: 'start',
                    alignItems: 'stretch',
                    gap: '40px',
                    backgroundColor: 'var(--color-surface)',
                    padding: '20px',
                    margin: '0px',
                    borderRadius: '10px',
                    cursor: 'pointer'
                }}>
                    {track.cover !== null ?
                        <img src={`k-image://track/${track?.cover}`} style={{ width: '192px', height: '192px', borderRadius: '10px', flexShrink: 0 }} />
                        : <EmptyImage
                            isNowPlaying={true}
                            style={{ width: '192px', height: '192px', borderRadius: '10px', flexShrink: 0 }} />
                    }

                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
                        <p style={{
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            color: 'var(--color-text-default)',
                            fontSize: '36px',
                            fontWeight: 700,
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{track?.name}</p>
                        <p style={{
                            fontFamily: 'Hanken Grotesk, sans-serif',
                            color: 'var(--color-primary)',
                            fontSize: '16px',
                            fontWeight: 400,
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{track?.author}</p>

                        <div style={{ width: '100%', marginTop: 'auto', display: 'flex', alignItems: 'flex-end' }}>
                            <AudioVisualizer audioAnalyzer={audioAnalyzer} isPlaying={isPlaying} />
                        </div>
                    </div>

                </div>

            </div>
        </>
    )
}

export default NowPlaying
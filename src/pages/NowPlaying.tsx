import { ArrowLeftIcon, HeartFillIcon, HeartIcon } from '@primer/octicons-react'
import { ChangeEvent, useEffect, useState, WheelEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { JellyImg } from '../components/JellyImg'
import { Progressbar } from '../components/Main'
import { DownloadIndicators } from '../components/MediaList'
import { Squircle } from '../components/Squircle'
import { LyricsIcon, MoreIcon, QueueIcon, TracksIcon } from '../components/SvgIcons'
import { TrackBitrate } from '../components/TrackBitrate'
import { TrackCodec } from '../components/TrackCodec'
import { useDropdownContext } from '../context/DropdownContext/DropdownContext'
import { useHistoryContext } from '../context/HistoryContext/HistoryContext'
import { usePlaybackContext } from '../context/PlaybackContext/PlaybackContext'
import { useScrollContext } from '../context/ScrollContext/ScrollContext'
import { useDuration } from '../hooks/useDuration'
import { useFavorites } from '../hooks/useFavorites'
import './NowPlayingLyrics.css'

export const NowPlaying = () => {
    const { goBack: previousPage } = useHistoryContext()
    const { playlistTitle, playlistUrl, currentTrack, bitrate } = usePlaybackContext()
    const location = useLocation()

    const playback = usePlaybackContext()
    const duration = useDuration()
    const { isOpen, selectedItem, onContextMenu } = useDropdownContext()
    const { addToFavorites, removeFromFavorites } = useFavorites()
    const { setDisabled } = useScrollContext()

    // State for dynamic codec and bitrate from HLS URLs
    const [dynamicCodec, setDynamicCodec] = useState<string | null>(null)
    const [dynamicBitrate, setDynamicBitrate] = useState<number | null>(null)

    // Parse HLS URL to extract codec and calculate actual bitrate from hls.js fragment data
    const parseHlsUrlAndGetBitrate = (url: string, eventDetail: any) => {
        // Check if this is an HLS segment URL
        if (url.includes('/hls1/')) {
            const urlParams = new URLSearchParams(url.split('?')[1] || '')

            // Extract AudioCodec from URL parameters
            const audioCodec = urlParams.get('AudioCodec')

            // Try to get actual bitrate from hls.js fragment data
            let actualBitrate = null

            // Check if we have hls.js fragment data with size and duration
            if (eventDetail.frag) {
                const frag = eventDetail.frag

                // Calculate bitrate using fragment size and duration
                if (frag.stats && frag.stats.total && frag.duration) {
                    // loaded is in bytes, duration is in seconds
                    actualBitrate = Math.round((frag.stats.total * 8) / frag.duration)
                }
            }

            // Fallback to MaxStreamingBitrate from URL if hls.js data not available
            if (!actualBitrate) {
                const maxBitrate = urlParams.get('MaxStreamingBitrate')
                actualBitrate = maxBitrate ? parseInt(maxBitrate, 10) : null
            }

            return {
                codec: audioCodec || null,
                bitrate: actualBitrate
            }
        }

        return { codec: null, bitrate: null }
    }

    // Listen for audio load events
    useEffect(() => {
        const handleAudioLoad = (event: CustomEvent) => {
            const { url, type, ...eventDetail } = event.detail
            if (type === 'hls-segment' && url.includes('/hls1/')) {
                const { codec, bitrate } = parseHlsUrlAndGetBitrate(url, eventDetail)

                if (codec) {
                    setDynamicCodec(codec)
                }

                if (bitrate) {
                    setDynamicBitrate(bitrate)
                }
            } else if (type === 'audio-source') {
                // Reset to default values for direct audio sources
                setDynamicCodec(null)
                setDynamicBitrate(null)
            }
        }

        window.addEventListener('audioLoad', handleAudioLoad as EventListener)

        return () => {
            window.removeEventListener('audioLoad', handleAudioLoad as EventListener)
        }
    }, [])

    const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value)
        playback.setVolume(newVolume)
    }

    const handleVolumeScroll = (e: WheelEvent<HTMLInputElement>) => {
        e.stopPropagation()
        const step = e.deltaY > 0 ? -0.02 : 0.02
        const newVolume = Math.max(0, Math.min(1, playback.volume + step))
        playback.setVolume(newVolume)
    }

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
    }, [location.pathname])

    const handleMoreClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!currentTrack) {
            return
        }

        e.stopPropagation()
        onContextMenu(e, { item: currentTrack }, true, { add_to_favorite: true, remove_from_favorite: true })
    }

    return (
        <>
            <div className="now-playing-dimmer noSelect" />
            <div
                className={
                    playback.isPlaying
                        ? 'now-playing playing'
                        : playback.currentTrack
                        ? 'now-playing paused'
                        : 'now-playing'
                }
            >
                <div className="ui">
                    <div className="playing-header">
                        <div className="primary">
                            <div onClick={previousPage} className="return_icon" title="Back">
                                <ArrowLeftIcon size={16}></ArrowLeftIcon>
                            </div>
                        </div>
                        <div className="secondary">
                            <div className="title">Playing From</div>
                            <div className="desc" title={playlistTitle || 'No Playlist'}>
                                {playlistUrl ? (
                                    <Link to={playlistUrl} className="textlink">
                                        {playlistTitle}
                                    </Link>
                                ) : (
                                    <>{playlistTitle || 'No Playlist'}</>
                                )}
                            </div>
                        </div>
                        <div className="tertiary">
                            <div
                                className="favorite-state"
                                title={
                                    currentTrack?.UserData?.IsFavorite ? 'Remove from favorites' : 'Add to favorites'
                                }
                                onClick={async () => {
                                    if (currentTrack?.Id) {
                                        try {
                                            if (currentTrack?.UserData?.IsFavorite) {
                                                await removeFromFavorites(currentTrack)
                                            } else {
                                                await addToFavorites(currentTrack)
                                            }
                                        } catch (error) {
                                            console.error('Failed to update favorite status:', error)
                                        }
                                    }
                                }}
                            >
                                {currentTrack?.UserData?.IsFavorite ? (
                                    <HeartFillIcon size={16} />
                                ) : (
                                    <HeartIcon size={16} />
                                )}
                            </div>
                            <div
                                className={`more ${isOpen && selectedItem?.Id === currentTrack?.Id ? 'active' : ''}`}
                                onClick={handleMoreClick}
                                title="More"
                            >
                                <MoreIcon width={14} height={14} />
                            </div>
                        </div>
                    </div>
                    <div className="playing-content">
                        <div className="playing-artwork noSelect">
                            <Squircle
                                width={360}
                                height={360}
                                cornerRadius={14}
                                isResponsive={true}
                                className="thumbnail"
                            >
                                {currentTrack && (
                                    <JellyImg item={currentTrack} type={'Primary'} width={360} height={360} />
                                )}
                                {!currentTrack && (
                                    <div className="fallback-thumbnail">
                                        <TracksIcon width="50%" height="50%" />
                                    </div>
                                )}
                                <div className="shadow-border" />
                            </Squircle>
                        </div>
                        <div className="playing-info">
                            <div className="song-name" title={currentTrack?.Name || 'No Track Played'}>
                                {currentTrack?.Name || 'No Track Played'}
                            </div>
                            <div
                                className="artist"
                                title={
                                    currentTrack?.Artists && currentTrack.Artists.length > 0
                                        ? currentTrack.Artists.join(', ')
                                        : 'No Artist'
                                }
                            >
                                {currentTrack?.Artists && currentTrack.Artists.length > 0
                                    ? currentTrack.Artists.join(', ')
                                    : 'No Artist'}
                            </div>
                        </div>
                        <div className="playing-progress noSelect">
                            <div className="info">
                                <div className="duration">{playback.formatTime(duration.progress)}</div>
                                <div className="quality">
                                    {/* Use dynamic values from HLS URL when available, otherwise fallback to default logic */}
                                    {dynamicBitrate && dynamicCodec ? (
                                        // Show dynamic values from HLS URL
                                        <>
                                            <div className="codec">
                                                {dynamicCodec.toUpperCase()}
                                            </div>
                                            <div className="divider" />
                                            <div className="bitrate">
                                                <span className="number">
                                                    {Math.round(dynamicBitrate / 1000)}
                                                </span>{' '}
                                                Kbps
                                            </div>
                                        </>
                                    ) : bitrate === 320000 || bitrate === 256000 || bitrate === 192000 || bitrate === 128000 ? (
                                        // Show quality name when not Source (fallback to original logic)
                                        <>
                                            <div className="text">
                                                {bitrate === 320000
                                                    ? 'High'
                                                    : bitrate === 256000
                                                    ? 'Medium'
                                                    : bitrate === 192000
                                                    ? 'Low'
                                                    : 'Minimal'}
                                            </div>
                                            <div className="divider" />
                                            <div className="bitrate">
                                                <span className="number">
                                                    {bitrate === 320000 ? '320'
                                                        : bitrate === 256000 ? '256'
                                                        : bitrate === 192000 ? '192'
                                                        : '128'}
                                                </span>{' '}
                                                Kbps
                                            </div>
                                        </>
                                    ) : (
                                        // Show codec when Source (fallback to original logic)
                                        <>
                                            <div className="codec">
                                                <TrackCodec currentTrack={currentTrack} bitrate={bitrate} />
                                            </div>
                                            <div className="divider" />
                                            <div className="bitrate">
                                                <span className="number">
                                                    <TrackBitrate currentTrack={currentTrack} />
                                                </span>{' '}
                                                Kbps
                                            </div>
                                        </>
                                    )}

                                    <DownloadIndicators
                                        offlineState={currentTrack?.offlineState}
                                        size={12}
                                        itemId={currentTrack?.Id}
                                    />
                                </div>
                                <div className="duration">{playback.formatTime(duration.duration)}</div>
                            </div>
                            <Progressbar />
                        </div>
                        <div className="playing-controls">
                            <div
                                className={`shuffle ${playback.shuffle ? 'active' : ''}`}
                                onClick={playback.toggleShuffle}
                                title="Shuffle"
                            >
                                <div className="shuffle-icon"></div>
                            </div>
                            <div className="primary">
                                <div className="previous" onClick={playback.previousTrack} title="Previous">
                                    <div className="previous-icon"></div>
                                </div>
                                <div className="container">
                                    <div className="play" onClick={playback.togglePlayPause} title="Play">
                                        <div className="play-icon"></div>
                                    </div>
                                    <div className="pause" onClick={playback.togglePlayPause} title="Pause">
                                        <div className="pause-icon"></div>
                                    </div>
                                </div>
                                <div className="next" onClick={playback.nextTrack} title="Next">
                                    <div className="next-icon"></div>
                                </div>
                            </div>
                            <div
                                className={`repeat ${playback.repeat === 'off' ? '' : 'active'}`}
                                onClick={playback.toggleRepeat}
                                title="Repeat"
                            >
                                <div className={`repeat-icon${playback.repeat === 'one' ? '-one' : ''}`}></div>
                            </div>
                        </div>
                    </div>
                    <div className="playing-footer">
                        <div className="actions">
                            <Link to="/nowplaying/lyrics" className="action" title="Lyrics">
                                <LyricsIcon width={20} height={20} />
                            </Link>
                            <Link to="/queue" className="action" title="Queue">
                                <QueueIcon width={20} height={20} />
                            </Link>
                        </div>
                        <div className="playing-volume">
                            <div className="indicator">Volume: {(playback.volume * 100).toFixed(0)}%</div>
                            <div className="control">
                                <input
                                    type="range"
                                    id="volume"
                                    name="volume"
                                    min="0"
                                    max="1"
                                    step="0.02"
                                    value={playback.volume}
                                    onChange={handleVolumeChange}
                                    onWheel={handleVolumeScroll}
                                    onMouseEnter={() => setDisabled(true)}
                                    onMouseLeave={() => setDisabled(false)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="background-artwork noSelect">
                    {currentTrack && <JellyImg item={currentTrack} type={'Primary'} width={360} height={360} />}
                </div>
            </div>
        </>
    )
}

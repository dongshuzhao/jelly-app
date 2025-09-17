import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MediaList } from '../components/MediaList'
import { Squircle } from '../components/Squircle'
import { MoreIcon } from '../components/SvgIcons'
import { useDropdownContext } from '../context/DropdownContext/DropdownContext'
import { usePageTitle } from '../context/PageTitleContext/PageTitleContext'
import { usePlaybackContext } from '../context/PlaybackContext/PlaybackContext'
import { useJellyfinGenreTracks } from '../hooks/Jellyfin/Infinite/useJellyfinGenreTracks'
import { useJellyfinCustomContainerItem } from '../hooks/Jellyfin/useJellyfinCustomContainerItem'
import { formatDurationReadable } from '../utils/formatDurationReadable'
import './Genre.css'

export const Genre = () => {
    const { genre } = useParams<{ genre: string }>()
    const { items, infiniteData, isLoading, error, reviver, loadMore, totalTrackCount, totalPlaytime, totalPlays } =
        useJellyfinGenreTracks(genre!)
    const { setPageTitle } = usePageTitle()
    const playback = usePlaybackContext()
    const { isOpen, onContextMenu } = useDropdownContext()
    const { customItem: genreCustomItem } = useJellyfinCustomContainerItem(genre ? `genre_${genre}` : '')

    useEffect(() => {
        if (genre) {
            setPageTitle(decodeURIComponent(genre))
        }
        return () => {
            setPageTitle('')
        }
    }, [genre, setPageTitle])

    const handleMoreClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()

        if (!genreCustomItem) {
            console.warn('Genre custom item not ready yet')
            return
        }

        onContextMenu(e, { item: genreCustomItem, customContainer: `genre_${genre}` }, true, {
            instant_mix: true,
            add_to_favorite: true,
            remove_from_favorite: true,
        })
    }

    return (
        <div className="genre-page">
            {error && <div className="error">{error}</div>}

            {totalTrackCount > 0 && (
                <div className="genre-header">
                    <Squircle width={100} height={100} cornerRadius={8} className="thumbnail">
                        <div className="fallback-thumbnail">
                            <svg viewBox="0 0 24 24" width={32} height={32} fill="currentColor">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                        </div>
                    </Squircle>
                    <div className="genre-details">
                        <div className="title">{genre ? decodeURIComponent(genre) : 'Genre'}</div>
                        <div className="stats">
                            <div className="track-amount">
                                <span className="number">{totalTrackCount}</span>{' '}
                                <span>{totalTrackCount === 1 ? 'Track' : 'Tracks'}</span>
                            </div>
                            {totalPlaytime > 0 && (
                                <>
                                    <div className="divider"></div>
                                    <div className="length">
                                        <span className="number">{formatDurationReadable(totalPlaytime)}</span>{' '}
                                        <span>Total</span>
                                    </div>
                                </>
                            )}
                            {totalPlays > 0 && (
                                <>
                                    <div className="divider"></div>
                                    <div className="plays">
                                        <span className="number">{totalPlays}</span>{' '}
                                        {totalPlays === 1 ? 'Play' : 'Plays'}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="actions noSelect">
                            <div className="primary">
                                <div
                                    className="play-playlist"
                                    onClick={() => {
                                        if (
                                            playback.setCurrentPlaylistSimple({
                                                playlist: items,
                                                title: genre ? `Genre: ${decodeURIComponent(genre)}` : 'Genre',
                                            })
                                        ) {
                                            playback.playTrack(0)
                                        }
                                    }}
                                >
                                    <div className="play-icon" />
                                    <div className="text">Play</div>
                                </div>
                            </div>
                            <div className={`more ${isOpen ? 'active' : ''}`} onClick={handleMoreClick} title="More">
                                <MoreIcon width={14} height={14} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <MediaList
                items={items}
                infiniteData={infiniteData}
                isLoading={isLoading}
                type="song"
                title={genre ? `Genre: ${decodeURIComponent(genre)}` : 'Genres'}
                reviver={reviver}
                loadMore={loadMore}
            />
        </div>
    )
}

import { HeartFillIcon } from '@primer/octicons-react'
import { useMemo } from 'react'
import { MediaList } from '../components/MediaList'
import { Squircle } from '../components/Squircle'
import { MoreIcon } from '../components/SvgIcons'
import { useDropdownContext } from '../context/DropdownContext/DropdownContext'
import { useFilterContext } from '../context/FilterContext/FilterContext'
import { usePlaybackContext } from '../context/PlaybackContext/PlaybackContext'
import { useJellyfinFavoritesData } from '../hooks/Jellyfin/Infinite/useJellyfinFavoritesData'
import { useJellyfinCustomContainerItem } from '../hooks/Jellyfin/useJellyfinCustomContainerItem'
import { formatDurationReadable } from '../utils/formatDurationReadable'
import './Favorites.css'

export const Favorites = () => {
    const { items, infiniteData, isLoading, error, reviver, loadMore } = useJellyfinFavoritesData()
    const { jellyItemKind } = useFilterContext()
    const playback = usePlaybackContext()
    const { isOpen, onContextMenu } = useDropdownContext()
    const { customItem: favoritesCustomItem } = useJellyfinCustomContainerItem('favorites')

    const totalStats = useMemo(() => {
        if (jellyItemKind !== 'Audio') return null

        const totalTrackCount = items.length
        const totalPlaytime = items.reduce((total, track) => total + (track.RunTimeTicks || 0), 0)

        return { totalTrackCount, totalPlaytime }
    }, [items, jellyItemKind])

    const handleMoreClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()

        if (!favoritesCustomItem) {
            console.warn('Favorites custom item not ready yet')
            return
        }

        onContextMenu(e, { item: favoritesCustomItem, customContainer: 'favorites' }, true, {
            instant_mix: true,
            add_to_favorite: true,
            remove_from_favorite: true,
        })
    }

    return (
        <div className="favorites-page">
            {error && <div className="error">{error}</div>}

            {jellyItemKind === 'Audio' && totalStats && (
                <div className="favorites-header">
                    <Squircle width={100} height={100} cornerRadius={8} className="thumbnail">
                        <div className="fallback-thumbnail">
                            <HeartFillIcon size={32} />
                        </div>
                    </Squircle>
                    <div className="favorites-details">
                        <div className="title">Favorite Songs</div>
                        <div className="stats">
                            <div className="track-amount">
                                <span className="number">{totalStats.totalTrackCount}</span>{' '}
                                <span>{totalStats.totalTrackCount === 1 ? 'Track' : 'Tracks'}</span>
                            </div>
                            {totalStats.totalPlaytime > 0 && (
                                <>
                                    <div className="divider"></div>
                                    <div className="length">
                                        <span className="number">
                                            {formatDurationReadable(totalStats.totalPlaytime)}
                                        </span>{' '}
                                        <span>Total</span>
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
                                                title: 'Favorite Songs',
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
                type={jellyItemKind === 'Audio' ? 'song' : jellyItemKind === 'MusicAlbum' ? 'album' : 'artist'}
                reviver={reviver}
                loadMore={loadMore}
                title={'Favorites'}
            />
        </div>
    )
}

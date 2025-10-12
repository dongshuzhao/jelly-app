import { XIcon } from '@primer/octicons-react'
import { MediaList } from '../components/MediaList'
import { useDownloadContext } from '../context/DownloadContext/DownloadContext'
import { useFilterContext } from '../context/FilterContext/FilterContext'
import { useIndexedDbDownloadsData } from '../hooks/useIndexedDbDownloadsData'
import './Downloads.css'

export const Downloads = () => {
    const { items, isLoading, error, loadMore } = useIndexedDbDownloadsData()
    const { jellyItemKind } = useFilterContext()
    const { queue, removeFromQueue } = useDownloadContext()

    const queueItems = queue.map(task => ({
        ...task.mediaItem,
        offlineState: (task.action === 'remove' ? 'deleting' : 'downloading') as 'downloading' | 'deleting',
    }))

    return (
        <div className="favorites-page downloads-page">
            {error && <div className="error">{error}</div>}

            {queueItems.length > 0 && (
                <MediaList
                    items={queueItems}
                    infiniteData={{ pageParams: [], pages: [] }}
                    isLoading={false}
                    type="song"
                    title="Queue"
                    disableActions={true}
                    disableEvents={true}
                    preferItemType={true}
                    removeButton={item => (
                        <button
                            className="remove-queue-button"
                            onClick={() => removeFromQueue(item.Id)}
                            title="Remove from queue"
                            aria-label="Remove from queue"
                        >
                            <XIcon size={16} />
                        </button>
                    )}
                />
            )}

            <MediaList
                items={items}
                infiniteData={{ pageParams: [1], pages: [items] }}
                isLoading={isLoading}
                type={jellyItemKind === 'Audio' ? 'song' : jellyItemKind === 'MusicAlbum' ? 'album' : 'artist'}
                loadMore={loadMore}
                title={'Synced'}
                disableActions={true}
            />
        </div>
    )
}

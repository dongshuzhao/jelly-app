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

    return (
        <div className="favorites-page downloads-page">
            {error && <div className="error">{error}</div>}

            {queue.length > 0 && (
                <div className="queue-section">
                    <div className="queue-list">
                        {queue.map(task => {
                            const item = task.mediaItem

                            return (
                                <div key={item.Id} className="queue-item">
                                    <div className="queue-item-content">
                                        <MediaList
                                            items={[
                                                {
                                                    ...item,
                                                    offlineState: task.action === 'remove' ? 'deleting' : 'downloading',
                                                },
                                            ]}
                                            infiniteData={{ pageParams: [], pages: [] }}
                                            isLoading={false}
                                            type={
                                                item.Type === 'Audio'
                                                    ? 'song'
                                                    : item.Type === 'MusicAlbum'
                                                    ? 'album'
                                                    : 'artist'
                                            }
                                            title="Queue Item"
                                            disableActions={true}
                                        />
                                    </div>
                                    <button
                                        className="remove-queue-button"
                                        onClick={() => removeFromQueue(item.Id)}
                                        title="Remove from queue"
                                        aria-label="Remove from queue"
                                    >
                                        <XIcon size={16} />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
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

import { MediaList } from '../components/MediaList'
import { useJellyfinGenresData } from '../hooks/Jellyfin/Infinite/useJellyfinGenresData'

export const Genres = () => {
    const { items, infiniteData, isLoading, error, reviver, loadMore } = useJellyfinGenresData()

    return (
        <div className="genres-page">
            <MediaList
                items={items}
                infiniteData={infiniteData}
                isLoading={isLoading}
                type="genre"
                title={'Genres'}
                reviver={reviver}
                loadMore={loadMore}
            />
            {error && <div className="error">{error}</div>}
        </div>
    )
}

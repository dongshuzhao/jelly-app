import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { MediaItem } from '../../api/jellyfin'
import { useAudioStorageContext } from '../../context/AudioStorageContext/AudioStorageContext'
import { useJellyfinContext } from '../../context/JellyfinContext/JellyfinContext'

export const useJellyfinSearch = (searchQuery: string) => {
    const api = useJellyfinContext()
    const audioStorage = useAudioStorageContext()
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery)

    // Debounce the search query
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery)
        }, 200)

        return () => clearTimeout(debounceTimer)
    }, [searchQuery])

    const { data, isFetching, error } = useQuery<MediaItem[], Error>({
        queryKey: ['search', debouncedSearchQuery],
        queryFn: async () => {
            if (!debouncedSearchQuery || !api.auth.serverUrl || !api.auth.token || !api.auth.userId) {
                return []
            }

            if (navigator.onLine) {
                // Fetch artists from /Artists endpoint
                const [artistResponse, itemsResponse, genreResponse] = await Promise.all([
                    api.searchArtists(debouncedSearchQuery, 20),
                    api.searchItems(debouncedSearchQuery, 40),
                    api.searchGenres(debouncedSearchQuery, 20),
                ])

                // Fetch songs, albums, and playlists from /Items endpoint
                const artists = artistResponse.slice(0, 4)
                const songs = itemsResponse.filter(item => item.Type === 'Audio').slice(0, 6)
                const albums = itemsResponse.filter(item => item.Type === 'MusicAlbum').slice(0, 4)
                const playlists = itemsResponse.filter(item => item.Type === 'Playlist').slice(0, 4)
                const genres = genreResponse.slice(0, 4)

                const limitedResults = [...songs, ...artists, ...albums, ...playlists, ...genres]
                return limitedResults
            } else {
                // Use offline search when no network
                const offlineResults = await audioStorage.searchOfflineItems(debouncedSearchQuery, 10)
                return offlineResults
            }
        },
    })

    return {
        searchResults: data || [],
        searchLoading: isFetching,
        searchError: error ? error.message : null,
        searchAttempted: searchQuery.length > 0,
    }
}

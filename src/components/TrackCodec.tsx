import { MediaItem } from '../api/jellyfin'
import { useJellyfinTrackInfo } from '../hooks/Jellyfin/useJellyfinTrackInfo'

export const TrackCodec = ({ currentTrack, bitrate }: { currentTrack: MediaItem | undefined; bitrate: number }) => {
    // Show quality name when not Source, show codec when Source
    if (bitrate === 320000) {
        return <>High</>
    } else if (bitrate === 256000) {
        return <>Medium</>
    } else if (bitrate === 192000) {
        return <>Low</>
    } else if (bitrate === 128000) {
        return <>Minimal</>
    }

    // For Source quality, show the actual codec
    // Get original codec information
    const mediaSourceCodec = currentTrack?.MediaSources?.[0]?.MediaStreams?.find(stream => stream.Type === 'Audio')?.Codec
    const trackInfo = useJellyfinTrackInfo(typeof mediaSourceCodec === 'string' ? '' : currentTrack?.Id || '')
    const audioStream = trackInfo.MediaSources?.[0]?.MediaStreams?.find(stream => stream.Type === 'Audio')
    const codec = mediaSourceCodec || audioStream?.Codec || ''

    // Convert codec to more friendly display format
    const formatCodec = (codec: string) => {
        const codecMap: Record<string, string> = {
            'aac': 'AAC',
            'mp3': 'MP3',
            'flac': 'FLAC',
            'opus': 'Opus',
            'vorbis': 'Vorbis',
            'wav': 'WAV',
            'alac': 'ALAC',
            'ac3': 'AC3',
            'eac3': 'E-AC3',
            'dts': 'DTS',
            'truehd': 'TrueHD',
            'mp2': 'MP2',
            'wma': 'WMA'
        }
        
        // If codec contains underscores, replace them with spaces
        const formattedCodec = codecMap[codec.toLowerCase()] || codec.toUpperCase()
        return formattedCodec.replace(/_/g, ' ')
    }

    return <>{formatCodec(codec)}</>
}
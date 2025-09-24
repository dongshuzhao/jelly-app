import { useEffect, useRef, useState } from 'react'
import type { VirtuosoProps } from 'react-virtuoso'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import { MediaItem } from '../api/jellyfin.ts'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IVirtuosoProps = VirtuosoProps<MediaItem | { isPlaceholder: true }, any>

export const VirtuosoWindow = (virtuosoProps: IVirtuosoProps) => {
    const virtuosoRef = useRef<VirtuosoHandle>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)

    const [initialOffset, setInitialOffset] = useState(0)

    useEffect(() => {
        setInitialOffset(wrapperRef.current?.getBoundingClientRect().top || 0)
    }, [wrapperRef])

    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY
            const current = history.state || {}

            if (current.virtuosoOffset !== y) {
                history.replaceState({ ...current, virtuosoOffset: y - initialOffset }, '')
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [initialOffset])

    return (
        <div ref={wrapperRef}>
            <Virtuoso
                {...virtuosoProps}
                ref={virtuosoRef}
                initialScrollTop={history.state?.virtuosoOffset || 0}
                useWindowScroll
            />
        </div>
    )
}

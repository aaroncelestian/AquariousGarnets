import { useEffect, useState } from 'react'

/** Discrete talk beats for sequenced interactive scenes. */
export function useTalkBeats<T>(beats: readonly T[], active: boolean) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (active) setIndex(0)
  }, [active])

  return {
    index,
    beat: beats[index]!,
    total: beats.length,
    next: () => setIndex((i) => (i >= beats.length - 1 ? 0 : i + 1)),
    prev: () => setIndex((i) => Math.max(0, i - 1)),
    go: setIndex,
  }
}

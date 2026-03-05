import { useEffect, useState } from 'react'
import type { RoadmapContent } from '../../types'

const DEFAULT: RoadmapContent = { items: [] }

export function useRoadmapContent(baseUrl: string): RoadmapContent {
  const [content, setContent] = useState<RoadmapContent>(DEFAULT)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${baseUrl}content/roadmap.json`)
        if (!response.ok) return
        const payload = (await response.json()) as RoadmapContent
        setContent({
          items: Array.isArray(payload.items) ? payload.items : [],
        })
      } catch {}
    }
    void load()
  }, [baseUrl])

  return content
}

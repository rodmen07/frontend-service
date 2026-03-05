import { useEffect, useState } from 'react'
import type { ChangelogContent } from '../../types'

const DEFAULT: ChangelogContent = { entries: [] }

export function useChangelogContent(baseUrl: string): ChangelogContent {
  const [content, setContent] = useState<ChangelogContent>(DEFAULT)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${baseUrl}content/changelog.json`)
        if (!response.ok) return
        const payload = (await response.json()) as ChangelogContent
        setContent({
          entries: Array.isArray(payload.entries) ? payload.entries : [],
        })
      } catch {}
    }
    void load()
  }, [baseUrl])

  return content
}

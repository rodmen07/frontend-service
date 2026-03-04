import { useEffect, useState } from 'react'
import type { FaqContent } from '../../types'

const DEFAULT_FAQ: FaqContent = {
  title: 'Frequently asked questions',
  items: [],
}

export function useFaqContent(baseUrl: string): FaqContent {
  const [content, setContent] = useState<FaqContent>(DEFAULT_FAQ)

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch(`${baseUrl}content/faq.json`)
        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as FaqContent
        setContent({
          title: payload.title || DEFAULT_FAQ.title,
          items: Array.isArray(payload.items)
            ? payload.items.filter((item) => item && item.question && item.answer)
            : [],
        })
      } catch {
      }
    }

    void loadContent()
  }, [baseUrl])

  return content
}

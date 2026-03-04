import { useEffect, useState } from 'react'
import type { HomeSectionsContent } from '../../types'

const DEFAULT_HOME_SECTIONS: HomeSectionsContent = {
  title: 'Why teams use TaskForge',
  cards: [
    {
      heading: 'AI-assisted planning',
      body: 'Generate practical short-term task plans from your goals in seconds.',
    },
  ],
}

export function useHomeSectionsContent(baseUrl: string): HomeSectionsContent {
  const [content, setContent] = useState<HomeSectionsContent>(DEFAULT_HOME_SECTIONS)

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch(`${baseUrl}content/home_sections.json`)
        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as HomeSectionsContent
        setContent({
          title: payload.title || DEFAULT_HOME_SECTIONS.title,
          cards: Array.isArray(payload.cards)
            ? payload.cards
                .filter((card) => card && card.heading && card.body)
                .map((card) => ({
                  heading: card.heading,
                  body: card.body,
                  image: card.image,
                }))
            : DEFAULT_HOME_SECTIONS.cards,
        })
      } catch {
      }
    }

    void loadContent()
  }, [baseUrl])

  return content
}

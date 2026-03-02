import { useEffect, useState } from 'react'
import './App.css'
import { API_BASE_URL } from './config'

function toBaseAwareHref(href, baseUrl) {
  if (!href) {
    return `${baseUrl}admin/`
  }

  if (/^https?:\/\//.test(href)) {
    return href
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const normalizedHref = href.startsWith('/') ? href.slice(1) : href
  return `${normalizedBase}${normalizedHref}`
}

function App() {
  const baseUrl = import.meta.env.BASE_URL

  const [content, setContent] = useState({
    title: 'Frontend Service',
    subtitle: 'Loading content from CMS…',
    ctaLabel: 'Open CMS',
    ctaHref: `${baseUrl}admin/`,
  })

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch(`${baseUrl}content/site.json`)
        if (!response.ok) {
          return
        }
        const payload = await response.json()
        setContent({
          ...payload,
          ctaHref: toBaseAwareHref(payload.ctaHref, baseUrl),
        })
      } catch {
      }
    }

    loadContent()
  }, [])

  return (
    <main className="container">
      <h1>{content.title}</h1>
      <p>{content.subtitle}</p>
      <a className="cta" href={content.ctaHref}>{content.ctaLabel}</a>
      <p className="hint">Edit this content in Decap CMS at <code>{`${baseUrl}admin/`}</code>.</p>
      <p className="hint">API base URL: <code>{API_BASE_URL}</code></p>
    </main>
  )
}

export default App

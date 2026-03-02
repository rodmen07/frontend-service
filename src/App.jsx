import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [content, setContent] = useState({
    title: 'Frontend Service',
    subtitle: 'Loading content from CMS…',
    ctaLabel: 'Open CMS',
    ctaHref: '/admin/',
  })

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch('/content/site.json')
        if (!response.ok) {
          return
        }
        const payload = await response.json()
        setContent(payload)
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
      <p className="hint">Edit this content in Decap CMS at <code>/admin</code>.</p>
    </main>
  )
}

export default App

import { PageLayout } from './PageLayout'
import { FocusCard } from '../features/layout/FocusCard'
import { AboutHero } from '../features/site/AboutHero'
import { AboutSection } from '../features/site/AboutSection'
import { HomeSections } from '../features/site/HomeSections'
import { HowItWorksSection } from '../features/site/HowItWorksSection'
import { ContactCTA } from '../features/site/ContactCTA'
import { useHomeSectionsContent } from '../features/site/useHomeSectionsContent'

export function AboutPage() {
  const baseUrl = import.meta.env.BASE_URL
  const homeSections = useHomeSectionsContent(baseUrl)

  return (
    <PageLayout>
      <FocusCard>
        <AboutHero />
      </FocusCard>
      <FocusCard>
        <AboutSection />
      </FocusCard>
      <FocusCard>
        <HomeSections content={homeSections} />
      </FocusCard>
      <FocusCard>
        <HowItWorksSection />
      </FocusCard>
      <FocusCard>
        <ContactCTA />
      </FocusCard>
    </PageLayout>
  )
}

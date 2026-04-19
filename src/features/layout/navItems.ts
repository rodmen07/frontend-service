export type NavItem = {
  label: string
  href: string
  scrollTo?: string
  section: 'primary' | 'workspace' | 'admin'
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '#/', section: 'primary' },
  { label: 'About', href: '#/about', section: 'primary' },
  { label: 'Services', href: '#/services', section: 'primary' },
  { label: 'Case Studies', href: '#/case-studies', section: 'primary' },
  { label: 'Pricing', href: '#/pricing', section: 'primary' },
  { label: 'Patch Notes', href: '#/patch-notes', section: 'primary' },
  { label: 'Status', href: '#/', scrollTo: 'build-status', section: 'primary' },
  { label: 'Contact', href: '#/contact', section: 'primary' },
  { label: 'Search', href: '#/search', section: 'workspace' },
  { label: 'Portal', href: '#/portal', section: 'workspace' },
  { label: 'Dashboard', href: '#/crm/dashboard', section: 'workspace' },
  { label: 'Reports', href: '#/crm/reports', section: 'workspace' },
  { label: 'Observaboard', href: '#/observaboard', section: 'admin' },
]

export const PRIMARY_NAV_ITEMS = NAV_ITEMS.filter((item) => item.section === 'primary')
export const WORKSPACE_NAV_ITEMS = NAV_ITEMS.filter((item) => item.section === 'workspace')
export const ADMIN_NAV_ITEMS = NAV_ITEMS.filter((item) => item.section === 'admin')

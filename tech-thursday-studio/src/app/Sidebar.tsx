export type ViewKey = 'episodes' | 'videos' | 'banners' | 'cards' | 'brand'

interface SidebarProps {
  view: ViewKey
  onNavigate: (v: ViewKey) => void
}

const NAV: { key: ViewKey; label: string; icon: React.JSX.Element }[] = [
  {
    key: 'episodes',
    label: 'Episodes',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <rect x="3" y="4" width="14" height="13" rx="2" />
        <path d="M3 8h14M7 2.5v3M13 2.5v3" />
      </svg>
    ),
  },
  {
    key: 'videos',
    label: 'Intro & Outro',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
        <path d="M8.5 8l4 2-4 2z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'banners',
    label: 'SharePoint banners',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <rect x="2.5" y="6.5" width="15" height="7" rx="1.5" />
        <path d="M5.5 10h5" />
      </svg>
    ),
  },
  {
    key: 'cards',
    label: 'Cards & thumbnails',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <rect x="2.5" y="3.5" width="8" height="6" rx="1.2" />
        <rect x="12.5" y="3.5" width="5" height="6" rx="1.2" />
        <rect x="2.5" y="11.5" width="5" height="5" rx="1.2" />
        <rect x="9.5" y="11.5" width="8" height="5" rx="1.2" />
      </svg>
    ),
  },
  {
    key: 'brand',
    label: 'Brand kit',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2.5l2.1 4.6 4.9.6-3.6 3.4.9 4.9-4.3-2.4-4.3 2.4.9-4.9L3 7.7l4.9-.6z" />
      </svg>
    ),
  },
]

export function Sidebar({ view, onNavigate }: SidebarProps) {
  return (
    <aside className="studio-sidebar">
      <div className="brand">
        <img src="/assets/logo-icon-white.png" alt="Ground Control" />
        <div>
          <div className="name">Tech Thursday<span>.</span></div>
          <div className="sub">Studio</div>
        </div>
      </div>
      <nav className="studio-nav" aria-label="Main">
        {NAV.map(item => (
          <button
            key={item.key}
            className={view === item.key ? 'active' : ''}
            onClick={() => onNavigate(item.key)}
            aria-current={view === item.key ? 'page' : undefined}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <img src="/assets/logo-icon-white.png" alt="" />
        Ground Control
      </div>
    </aside>
  )
}

// tt-sharepoint.jsx — SharePoint banner set for Tech Thursday.
// Three items (main identity, this-week episode, previous episodes), each in
// two directions: "dark" (Dark Green inverse) and "light" (Warm Grey daylight).
//
// All banners are 4:1 and use container units (cqh) so they stay
// resolution-independent on the canvas and in full-screen. The LEFT ~40% of
// each banner is kept visually calm — that's the SharePoint title safe-zone,
// where SP overlays its own hero title. Baked content sits on the right.
//
// Depends on tt-shared.jsx globals: TT_CAT, TT_GLYPH.

const SP = {
  dark:  '#294238',
  light: '#E6EBE3',
  acc:   '#B2D235',  // light green
  mid:   '#50B748',  // mid green
  white: '#FFFFFF',
  font:  "'Cera Pro', system-ui, sans-serif",
};

// --- The flowing-line motif, tucked into two corners (top-left + bottom-right).
// Subtle: the Dark-Green whisper swaps to White 15% on dark fields. Bleeds off.
function FlowLines({ theme }) {
  const whisper = theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(41,66,56,0.28)';
  const common = { position: 'absolute', width: '22%', height: 'auto', pointerEvents: 'none' };
  // Three clean, roughly-parallel open curves that sweep through the corner
  // and bleed off BOTH edges — whisper (back) → support → hero (front).
  return (
    <React.Fragment>
      <svg viewBox="0 0 800 600" preserveAspectRatio="xMinYMin meet" aria-hidden="true"
        style={{ ...common, top: 0, left: 0 }}>
        <g fill="none" strokeLinecap="round">
          <path d="M 270 -20 C 232 132, 132 232, -20 282" stroke={whisper} strokeWidth="2.5" />
          <path d="M 462 -20 C 384 196, 240 326, -20 446" stroke={SP.mid} strokeWidth="3.5" opacity="0.9" />
          <path d="M 360 -20 C 300 162, 168 282, -20 340" stroke={SP.acc} strokeWidth="5" />
        </g>
      </svg>
      <svg viewBox="0 0 800 600" preserveAspectRatio="xMaxYMax meet" aria-hidden="true"
        style={{ ...common, bottom: 0, right: 0 }}>
        <g fill="none" strokeLinecap="round">
          <path d="M 820 320 C 668 368, 568 468, 518 620" stroke={whisper} strokeWidth="2.5" />
          <path d="M 820 158 C 604 246, 460 410, 354 620" stroke={SP.mid} strokeWidth="3.5" opacity="0.9" />
          <path d="M 820 262 C 638 322, 518 442, 460 620" stroke={SP.acc} strokeWidth="5" />
        </g>
      </svg>
    </React.Fragment>
  );
}

function BannerShell({ theme, children }) {
  const bg = theme === 'dark' ? SP.dark : SP.light;
  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: bg, containerType: 'size', fontFamily: SP.font,
      display: 'flex', alignItems: 'center',
    }}>
      <FlowLines theme={theme} />
      {children}
    </div>
  );
}

// GC roundel, parked in the top-right corner.
function GCMark({ theme }) {
  const src = theme === 'dark' ? 'assets/logo-icon-white.png' : 'assets/logo-icon-dark.png';
  return (
    <img src={src} alt="Ground Control" style={{
      position: 'absolute', top: '8cqh', right: '4cqh', height: '11cqh', width: 'auto',
      zIndex: 3, opacity: 0.95,
    }} />
  );
}

// --- Item 1 — Main series identity ---------------------------------------
function MainBanner({ theme }) {
  const ink = theme === 'dark' ? SP.white : SP.dark;
  const sec = theme === 'dark' ? 'rgba(255,255,255,0.72)' : 'rgba(41,66,56,0.70)';
  const overInk = theme === 'dark' ? SP.acc : SP.mid;
  const cats = [
    { name: 'Microsoft Stack', c: SP.acc },
    { name: 'AI · Copilot',    c: SP.mid },
    { name: 'General tips',    c: ink },
  ];
  return (
    <BannerShell theme={theme}>
      <GCMark theme={theme} />
      <div style={{ marginLeft: 'auto', width: '60%', paddingRight: '7cqh', position: 'relative', zIndex: 2 }}>
        <div style={{
          fontSize: '4cqh', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: overInk, marginBottom: '3.5cqh',
        }}>A fortnightly tech tip · Ground Control</div>
        <div style={{
          fontWeight: 900, fontSize: '21cqh', lineHeight: 0.95, letterSpacing: '-0.02em', color: ink,
        }}>Tech Thursday<span style={{ color: SP.acc }}>.</span></div>
        <div style={{ fontSize: '6.2cqh', lineHeight: 1.15, color: sec, marginTop: '4cqh', fontWeight: 500 }}>
          Two minutes. One tip. Every other Thursday.
        </div>
        <div style={{ display: 'flex', gap: '5cqh', marginTop: '6cqh', flexWrap: 'wrap' }}>
          {cats.map(c => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '1.8cqh' }}>
              <span style={{ width: '3cqh', height: '3cqh', borderRadius: '50%', background: c.c, flex: '0 0 auto' }}></span>
              <span style={{ fontSize: '4.2cqh', fontWeight: 600, color: ink }}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </BannerShell>
  );
}

// --- shared category chip + glyph ----------------------------------------
function CatChip({ catKey, theme }) {
  const cat = TT_CAT[catKey];
  const Glyph = TT_GLYPH[catKey];
  // mid-green substitute for the light-green category so small text reads.
  const c = cat.color === SP.acc ? SP.mid : cat.color;
  const chipText = theme === 'dark' ? SP.white : SP.dark;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '2cqh',
      padding: '1.6cqh 3.2cqh', borderRadius: '999px',
      background: theme === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(41,66,56,0.06)',
      border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(41,66,56,0.14)'}`,
    }}>
      <span style={{ width: '4.4cqh', height: '4.4cqh', color: c, display: 'flex' }}><Glyph size="100%" /></span>
      <span style={{
        fontSize: '3.8cqh', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: chipText,
      }}>{cat.name}</span>
    </div>
  );
}

// --- Item 2 — This week's episode ----------------------------------------
function EpisodeBanner({ theme, ep }) {
  const episode = ep;
  const ink = theme === 'dark' ? SP.white : SP.dark;
  const sec = theme === 'dark' ? 'rgba(255,255,255,0.74)' : 'rgba(41,66,56,0.72)';
  const overInk = theme === 'dark' ? SP.acc : SP.mid;
  const pillBg = theme === 'dark' ? SP.acc : SP.dark;
  const pillInk = theme === 'dark' ? SP.dark : SP.white;
  return (
    <BannerShell theme={theme}>
      <GCMark theme={theme} />
      <div style={{ marginLeft: 'auto', width: '62%', paddingRight: '7cqh', position: 'relative', zIndex: 2 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '2.4cqh', marginBottom: '3cqh',
          fontSize: '4cqh', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: overInk,
        }}>
          <span style={{ width: '2.6cqh', height: '2.6cqh', borderRadius: '50%', background: overInk }}></span>
          This week · Episode {String(episode.ep ?? episode.week).padStart(2, '0')}
        </div>
        <div style={{ marginBottom: '3.5cqh' }}><CatChip catKey={episode.cat} theme={theme} /></div>
        <div style={{ fontWeight: 900, fontSize: '17cqh', lineHeight: 0.95, letterSpacing: '-0.02em', color: ink }}>
          {episode.title}<span style={{ color: SP.acc }}>.</span>
        </div>
        <div style={{ fontSize: '5.6cqh', lineHeight: 1.15, color: sec, marginTop: '3.5cqh', fontWeight: 500 }}>
          {episode.sub}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4cqh', marginTop: '5.5cqh' }}>
          <span style={{ fontSize: '4.4cqh', fontWeight: 600, color: ink }}>{episode.date.replace('Thu', 'Thursday')}</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '1.6cqh',
            padding: '2cqh 4cqh', borderRadius: '999px', background: pillBg, color: pillInk,
            fontSize: '4cqh', fontWeight: 700,
          }}>Watch now <span aria-hidden="true">→</span></span>
        </div>
      </div>
    </BannerShell>
  );
}

// --- Item 3 — Previous episodes (illustrative example cards) --------------
function PrevCard({ theme, cat, label, title, teaser }) {
  const c = cat === SP.acc ? SP.mid : cat;
  const cardBg = theme === 'dark' ? 'rgba(255,255,255,0.05)' : SP.white;
  const border = theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(41,66,56,0.10)';
  const ink = theme === 'dark' ? SP.white : SP.dark;
  const sub = theme === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(41,66,56,0.55)';
  const teaserInk = theme === 'dark' ? 'rgba(255,255,255,0.66)' : 'rgba(41,66,56,0.62)';
  const divider = theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(41,66,56,0.10)';
  return (
    <div style={{
      flex: 1, minHeight: '66cqh', background: cardBg, border: `1px solid ${border}`, borderRadius: '5cqh',
      padding: '5cqh 4.4cqh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      boxShadow: theme === 'dark' ? 'none' : '0 2cqh 5cqh rgba(41,66,56,0.10)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.8cqh' }}>
        <span style={{ width: '2.8cqh', height: '2.8cqh', borderRadius: '50%', background: c, flex: '0 0 auto' }}></span>
        <span style={{ fontSize: '3.2cqh', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: sub }}>{label}</span>
      </div>
      <div style={{ fontSize: '6cqh', fontWeight: 800, lineHeight: 1.0, color: ink, letterSpacing: '-0.01em' }}>{title}</div>
      <div style={{ borderTop: `1px solid ${divider}`, paddingTop: '3cqh', fontSize: '3.6cqh', lineHeight: 1.2, color: teaserInk, fontWeight: 500 }}>{teaser}</div>
    </div>
  );
}

function PreviousBanner({ theme }) {
  const ink = theme === 'dark' ? SP.white : SP.dark;
  const sec = theme === 'dark' ? 'rgba(255,255,255,0.72)' : 'rgba(41,66,56,0.70)';
  const overInk = theme === 'dark' ? SP.acc : SP.mid;
  const examples = [
    { cat: SP.acc, label: 'Microsoft Stack', title: 'Schedule send',   teaser: 'Send any email later from Outlook.' },
    { cat: SP.mid, label: 'AI · Copilot',    title: 'Summarise a page', teaser: 'Ask Copilot for the gist in seconds.' },
    { cat: SP.dark, label: 'General tip',    title: 'Snap layouts',     teaser: 'Win + Z to arrange your windows.' },
  ];
  return (
    <BannerShell theme={theme}>
      <div style={{
        width: '31%', paddingLeft: '7cqh', paddingRight: '3cqh', position: 'relative', zIndex: 2, flex: '0 0 auto',
      }}>
        <div style={{
          fontSize: '4cqh', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
          color: overInk, marginBottom: '3cqh',
        }}>Catch up</div>
        <div style={{ fontWeight: 900, fontSize: '12.5cqh', lineHeight: 0.92, letterSpacing: '-0.02em', color: ink }}>
          Previous<br />episodes<span style={{ color: SP.acc }}>.</span>
        </div>
        <div style={{ fontSize: '4.4cqh', lineHeight: 1.2, color: sec, marginTop: '3.5cqh', fontWeight: 500 }}>
          Every tip, in one place.
        </div>
      </div>
      <div style={{
        flex: 1, display: 'flex', gap: '3.5cqh', alignItems: 'stretch',
        paddingRight: '7cqh', paddingLeft: '2cqh', position: 'relative', zIndex: 2,
      }}>
        {examples.map((e, i) => (
          <PrevCard key={i} theme={theme} cat={e.cat} label={e.label} title={e.title} teaser={e.teaser} />
        ))}
      </div>
    </BannerShell>
  );
}

Object.assign(window, {
  FlowLines, BannerShell, GCMark, CatChip, PrevCard,
  MainBanner, EpisodeBanner, PreviousBanner,
});

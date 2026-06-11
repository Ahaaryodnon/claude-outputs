// Tech Thursday — shared building blocks for all four directions.
// Category palette + glyphs + sample episode data + a tiny "now playing" loop helper.

const TT_CAT = {
  ms:  { key: 'ms',  name: 'Microsoft Stack',   short: 'Microsoft',  color: '#B2D235', ink: '#294238' },
  ai:  { key: 'ai',  name: 'AI · Copilot Free', short: 'AI',         color: '#F57821', ink: '#FFFFFF' },
  gen: { key: 'gen', name: 'General Tip',       short: 'General',    color: '#50B748', ink: '#FFFFFF' },
};

// All three glyphs share a 100×100 viewBox and use currentColor so the
// host element can recolor them. Stroke-based and rounded — they match the
// rounded geometric feel of Cera Pro.
function GlyphMS({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <rect x="14" y="14" width="32" height="32" rx="5" stroke="currentColor" strokeWidth="6" fill="currentColor" />
      <rect x="54" y="14" width="32" height="32" rx="5" stroke="currentColor" strokeWidth="6" />
      <rect x="14" y="54" width="32" height="32" rx="5" stroke="currentColor" strokeWidth="6" />
      <rect x="54" y="54" width="32" height="32" rx="5" stroke="currentColor" strokeWidth="6" fill="currentColor" />
    </svg>
  );
}

function GlyphAI({ size = 100 }) {
  // Four-point sparkle — the Copilot/AI tradition.
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path d="M50 6 C 52 30, 60 38, 94 50 C 60 62, 52 70, 50 94 C 48 70, 40 62, 6 50 C 40 38, 48 30, 50 6 Z"
        fill="currentColor" />
    </svg>
  );
}

function GlyphGen({ size = 100 }) {
  // Lightbulb — universal "tip" icon. Filled bulb, two filaments lines.
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path d="M50 12 C 32 12, 20 26, 22 44 C 23 55, 30 62, 36 68 L 36 76 L 64 76 L 64 68 C 70 62, 77 55, 78 44 C 80 26, 68 12, 50 12 Z"
        fill="currentColor" />
      <rect x="38" y="80" width="24" height="6" rx="3" fill="currentColor" />
      <rect x="42" y="89" width="16" height="6" rx="3" fill="currentColor" />
    </svg>
  );
}

const TT_GLYPH = { ms: GlyphMS, ai: GlyphAI, gen: GlyphGen };

// Sample episodes — drawn straight from the user's 12-week plan.
const TT_EP = [
  { week: 1,  date: 'Thu 28 May', cat: 'ms',  title: 'Schedule send',         sub: 'Write tonight, deliver at 9am.' },
  { week: 2,  date: 'Thu 11 Jun', cat: 'ai',  title: 'Summarise a webpage',   sub: 'Five bullets, sixty seconds.' },
  { week: 3,  date: 'Thu 4 Jun', cat: 'gen', title: 'Clipboard history',     sub: 'Win + V. Never lose a snippet.', ep: 1 },
  { week: 4,  date: 'Thu 9 Jul',  cat: 'ms',  title: 'Teams meeting recap',   sub: 'Transcribe. The notes write themselves.' },
  { week: 5,  date: 'Thu 23 Jul', cat: 'ai',  title: 'Image for slides',      sub: 'Ask Copilot. Drop into deck.' },
  { week: 6,  date: 'Thu 6 Aug',  cat: 'gen', title: 'Snap Layouts',          sub: 'Win + Z. Tile windows.' },
];

// Lookup helpers
function epColor(cat) { return TT_CAT[cat].color; }
function epShort(cat) { return TT_CAT[cat].short; }
function epName(cat)  { return TT_CAT[cat].name; }

// useLoop — restarts a 'tick' counter every `ms` milliseconds. Components
// can use this to remount an animated subtree (`key={tick}`) so CSS
// keyframes replay cleanly without manual JS animation.
function useLoop(ms = 5000) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return tick;
}

// PlayButton — small overlay that lets the user replay an animation manually
// in addition to the auto-loop.
function PlayBadge({ label = 'Loops every 5s' }) {
  return (
    <div className="tt-play-badge" style={{
      position: 'absolute', bottom: 8, right: 8,
      padding: '4px 8px', borderRadius: 999,
      background: 'rgba(0,0,0,0.4)', color: '#fff',
      fontSize: 10, fontWeight: 500, letterSpacing: 0.4,
      fontFamily: "'Cera Pro', system-ui, sans-serif",
      pointerEvents: 'none', zIndex: 5,
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#B2D235' }}></span>
      {label}
    </div>
  );
}

Object.assign(window, {
  TT_CAT, TT_GLYPH, TT_EP,
  GlyphMS, GlyphAI, GlyphGen,
  epColor, epShort, epName,
  useLoop, PlayBadge,
});

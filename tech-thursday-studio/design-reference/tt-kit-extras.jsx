// tt-kit-extras.jsx — additional Direction-D variants for the brand kit file.
// Wordmark-only logo (no calendar), mark-only mini calendar (favicon-style),
// dark-on-green logo, and an "all 12 episodes" poster grid.

const dStylesKit = {
  bg: '#E6EBE3',
  page: '#FBFAF6',
  ink: '#294238',
  fg: '#FFFFFF',
  acc: '#B2D235',
  mid: '#50B748',
  amber: '#F57821',
  font: "'Cera Pro', system-ui, sans-serif",
};

// --- Wordmark only (no calendar) ---
// For places where the calendar page is too tall / too literal.
function WordmarkD({ dark = false }) {
  const bg = dark ? dStylesKit.ink : dStylesKit.bg;
  const fg = dark ? dStylesKit.fg : dStylesKit.ink;
  const accent = dark ? dStylesKit.acc : dStylesKit.mid;
  return (
    <div style={{
      width: '100%', height: '100%', background: bg, color: fg,
      padding: '7% 8%', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      fontFamily: dStylesKit.font,
    }}>
      <div style={{
        fontSize: 14, fontWeight: 500, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: accent, marginBottom: 10,
      }}>· Every other Thursday ·</div>
      <div style={{
        fontWeight: 900, fontSize: 78, lineHeight: 0.88,
        letterSpacing: '-0.025em',
      }}>Tech<br/>Thursday<span style={{ color: accent }}>.</span></div>
      <div style={{
        marginTop: 28, paddingTop: 14,
        borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.15)' : 'rgba(41,66,56,0.15)'}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <img src={dark ? 'assets/logo-icon-white.png' : 'assets/logo-icon-dark.png'}
             alt="" style={{ width: 22, opacity: dark ? 0.9 : 1 }} />
        <span style={{ fontSize: 12, opacity: 0.6, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Ground Control
        </span>
      </div>
    </div>
  );
}

// --- Mark only — a "favicon" version. Calendar page with no text columns. ---
function MarkD({ ep, dark = false }) {
  const _ep = ep || TT_EP[0];
  return (
    <div style={{
      width: '100%', height: '100%', background: dark ? dStylesKit.ink : dStylesKit.bg,
      padding: '8%', boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: '70%', aspectRatio: '0.78' }}>
        <CalendarPage ep={_ep} withStamp={true} />
      </div>
    </div>
  );
}

// --- Dark variant logo: on Dark-Green surface. Useful for footers, headers. ---
function LogoDDark() {
  return (
    <div style={{
      width: '100%', height: '100%', background: dStylesKit.ink,
      padding: '6%', boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '6%', position: 'relative',
    }}>
      <div style={{ flex: '0 0 36%', aspectRatio: '0.78' }}>
        <CalendarPage ep={TT_EP[0]} withStamp={true} />
      </div>
      <div style={{ flex: '1 1 auto', minWidth: 0, color: dStylesKit.fg }}>
        <div style={{
          fontFamily: dStylesKit.font, fontSize: 13, fontWeight: 500,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: dStylesKit.acc, marginBottom: 10,
        }}>Every other Thursday</div>
        <div style={{
          fontFamily: dStylesKit.font, fontWeight: 900, fontSize: 46, lineHeight: 0.9,
          letterSpacing: '-0.02em',
        }}>Tech<br/>Thursday<span style={{ color: dStylesKit.acc }}>.</span></div>
        <div style={{
          marginTop: 22, paddingTop: 14,
          borderTop: '1px solid rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <img src="assets/logo-icon-white.png" alt="" style={{ width: 20 }} />
          <span style={{
            fontSize: 11, opacity: 0.7, letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>Ground Control</span>
        </div>
      </div>
    </div>
  );
}

// --- All 12 episodes — a poster grid, useful as a SharePoint header or
// a "binge the back catalogue" graphic. ---
const TT_EP_FULL = [
  { week: 1,  date: 'Thu 28 May', cat: 'ms',  title: 'Schedule send',          sub: 'Write tonight, deliver at 9am.' },
  { week: 2,  date: 'Thu 11 Jun', cat: 'ai',  title: 'Summarise a webpage',    sub: 'Five bullets, sixty seconds.' },
  { week: 3,  date: 'Thu 25 Jun', cat: 'gen', title: 'Clipboard history',      sub: 'Win + V. Never lose a snippet.' },
  { week: 4,  date: 'Thu 9 Jul',  cat: 'ms',  title: 'Teams meeting recap',    sub: 'Transcribe. Notes write themselves.' },
  { week: 5,  date: 'Thu 23 Jul', cat: 'ai',  title: 'Image for slides',       sub: 'Ask Copilot. Drop into deck.' },
  { week: 6,  date: 'Thu 6 Aug',  cat: 'gen', title: 'Snap Layouts',           sub: 'Win + Z. Tile windows.' },
  { week: 7,  date: 'Thu 20 Aug', cat: 'ms',  title: 'XLOOKUP in 60 seconds',  sub: 'The one Excel formula worth learning.' },
  { week: 8,  date: 'Thu 3 Sep',  cat: 'ai',  title: 'Sharper prompts',        sub: 'Persona, Task, Context, Format.' },
  { week: 9,  date: 'Thu 17 Sep', cat: 'gen', title: 'Spot a phishing link',   sub: 'Hover. Read the domain.' },
  { week: 10, date: 'Thu 1 Oct',  cat: 'ms',  title: 'Loop components',        sub: 'Live checklists in chat.' },
  { week: 11, date: 'Thu 15 Oct', cat: 'ai',  title: 'Compare options',        sub: 'Side-by-side trade-off tables.' },
  { week: 12, date: 'Thu 29 Oct', cat: 'gen', title: 'Focus time',             sub: 'Two hours of quiet, booked in.' },
];

function PosterD() {
  return (
    <div style={{
      width: '100%', height: '100%', background: dStylesKit.bg,
      padding: '4%', boxSizing: 'border-box',
      display: 'grid', gridTemplateRows: 'auto 1fr',
      gap: '2.4cqh', fontFamily: dStylesKit.font,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2cqh' }}>
        <div>
          <div style={{
            fontSize: '2cqh', fontWeight: 500, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: dStylesKit.mid, marginBottom: '0.6cqh',
          }}>· The 2026 season ·</div>
          <div style={{
            fontWeight: 900, fontSize: '7cqh', lineHeight: 0.9,
            letterSpacing: '-0.02em', color: dStylesKit.ink,
          }}>Tech Thursday<span style={{ color: dStylesKit.acc }}>.</span></div>
          <div style={{
            marginTop: '0.6cqh', fontSize: '2.2cqh', opacity: 0.65, maxWidth: '60ch',
          }}>Twelve fortnightly tips. One quiet Thursday morning at a time.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2cqh' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6cqh' }}>
            <span style={{ width: '1.4cqh', height: '1.4cqh', background: dStylesKit.acc, borderRadius: 4 }}></span>
            <span style={{ fontSize: '1.6cqh', fontWeight: 600, opacity: 0.7 }}>Microsoft</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6cqh' }}>
            <span style={{ width: '1.4cqh', height: '1.4cqh', background: dStylesKit.amber, borderRadius: 4 }}></span>
            <span style={{ fontSize: '1.6cqh', fontWeight: 600, opacity: 0.7 }}>AI · Copilot</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6cqh' }}>
            <span style={{ width: '1.4cqh', height: '1.4cqh', background: dStylesKit.mid, borderRadius: 4 }}></span>
            <span style={{ fontSize: '1.6cqh', fontWeight: 600, opacity: 0.7 }}>General</span>
          </div>
        </div>
      </div>

      {/* Grid of 12 mini calendar pages, with topic below each */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '2.4cqh 2.2cqh',
      }}>
        {TT_EP_FULL.map(ep => (
          <div key={ep.week} style={{ display: 'flex', flexDirection: 'column', gap: '1cqh' }}>
            <div style={{ aspectRatio: '0.78' }}>
              <CalendarPage ep={ep} withStamp={false} mini={true} />
            </div>
            <div style={{ paddingLeft: '0.3cqh' }}>
              <div style={{
                fontSize: '1.7cqh', fontWeight: 700, lineHeight: 1.15,
                color: dStylesKit.ink, textWrap: 'balance',
              }}>{ep.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Colour & type reference card. A small, scannable spec. ---
function SpecD() {
  return (
    <div style={{
      width: '100%', height: '100%', background: dStylesKit.page,
      padding: '5% 5%', boxSizing: 'border-box',
      fontFamily: dStylesKit.font, color: dStylesKit.ink,
      display: 'flex', flexDirection: 'column', gap: '2.6cqh',
    }}>
      <div>
        <div style={{
          fontSize: '1.8cqh', fontWeight: 500, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: dStylesKit.mid, marginBottom: '0.4cqh',
        }}>Tech Thursday · brand kit</div>
        <div style={{
          fontWeight: 900, fontSize: '6cqh', lineHeight: 1, letterSpacing: '-0.02em',
        }}>Colour, type, voice.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3cqh', flex: 1 }}>
        {/* Colour */}
        <div>
          <div style={{
            fontSize: '1.6cqh', fontWeight: 600, letterSpacing: '0.14em',
            textTransform: 'uppercase', opacity: 0.5, marginBottom: '1.2cqh',
          }}>Colour</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1cqh 1.6cqh', alignItems: 'center' }}>
            {[
              ['#294238', 'Dark Green', 'Wordmark, body ink'],
              ['#B2D235', 'Light Green', 'Stamps, accents'],
              ['#50B748', 'Mid Green',   'General tips, success'],
              ['#F57821', 'Orange',      'AI tips (used sparingly)'],
              ['#FBFAF6', 'Paper white', 'Calendar surface'],
              ['#E6EBE3', 'Warm grey',   'Page background'],
            ].map(([hex, name, use]) => (
              <React.Fragment key={hex}>
                <div style={{
                  width: '4cqh', height: '4cqh', borderRadius: '0.8cqh',
                  background: hex, border: '1px solid rgba(41,66,56,0.12)',
                }}></div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8cqh', fontSize: '1.7cqh' }}>
                  <span style={{ fontWeight: 700 }}>{name}</span>
                  <span style={{ opacity: 0.5, fontVariantNumeric: 'tabular-nums' }}>{hex}</span>
                  <span style={{ opacity: 0.55, marginLeft: '0.8cqh' }}>{use}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Type + voice */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6cqh' }}>
          <div>
            <div style={{
              fontSize: '1.6cqh', fontWeight: 600, letterSpacing: '0.14em',
              textTransform: 'uppercase', opacity: 0.5, marginBottom: '0.6cqh',
            }}>Type</div>
            <div style={{ fontFamily: dStylesKit.font, fontSize: '4cqh', fontWeight: 900, letterSpacing: '-0.02em' }}>Cera Pro Black</div>
            <div style={{ fontSize: '1.6cqh', opacity: 0.55 }}>For dates, titles, stamps</div>
            <div style={{ marginTop: '0.6cqh', fontFamily: dStylesKit.font, fontSize: '2.2cqh', fontWeight: 400 }}>Cera Pro Regular · 500 · 700</div>
            <div style={{ fontSize: '1.6cqh', opacity: 0.55 }}>Body, captions, overlines</div>
          </div>

          <div>
            <div style={{
              fontSize: '1.6cqh', fontWeight: 600, letterSpacing: '0.14em',
              textTransform: 'uppercase', opacity: 0.5, marginBottom: '0.6cqh',
            }}>Voice</div>
            <div style={{ fontSize: '2cqh', lineHeight: 1.35, maxWidth: '40ch' }}>
              One short tip. One thing you can use the same day. Confident, warm, plainspoken — never breathless.
            </div>
          </div>

          <div>
            <div style={{
              fontSize: '1.6cqh', fontWeight: 600, letterSpacing: '0.14em',
              textTransform: 'uppercase', opacity: 0.5, marginBottom: '0.6cqh',
            }}>Cadence</div>
            <div style={{ fontSize: '2cqh' }}>Every other Thursday · 9am · 30–60 seconds.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  WordmarkD, MarkD, LogoDDark, PosterD, SpecD, TT_EP_FULL,
});

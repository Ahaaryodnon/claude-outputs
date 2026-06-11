// Direction D — "Desk Calendar"
// A torn-off desk calendar page. Big "THU" + date, a soft "Tech Thursday"
// stamp below. Reads instantly because the whole brand IS a Thursday. Pages
// flip on the intro bumper. Warmest and most accessible of the four.

const dStyles = {
  bg: '#E6EBE3',       // page bg
  page: '#FBFAF6',     // warm paper white
  ink: '#294238',
  fg: '#FFFFFF',
  acc: '#B2D235',
  mid: '#50B748',
  amber: '#F57821',
  shadow: '0 4cqh 8cqh rgba(41,66,56,0.18), 0 0.4cqh 1cqh rgba(41,66,56,0.10)',
  font: "'Cera Pro', system-ui, sans-serif",
};

(function injectDKeyframes() {
  if (document.getElementById('tt-d-kf')) return;
  const s = document.createElement('style');
  s.id = 'tt-d-kf';
  s.textContent = `
    /* Each preceding day-page tears upward off the pad in turn, revealing
       Thursday underneath. Pages share the same position; z-index makes the
       top one fly off cleanly without an edge-on rotateX moment. */
    @keyframes d-tear-1 {
      0%      { transform: translateY(0) rotate(0); opacity: 1; }
      6%      { transform: translateY(0) rotate(0); opacity: 1; }
      11%     { transform: translateY(-105%) rotate(-4deg); opacity: 0; }
      100%    { transform: translateY(-105%) rotate(-4deg); opacity: 0; }
    }
    @keyframes d-tear-2 {
      0%, 11%   { transform: translateY(0); opacity: 1; }
      17%       { transform: translateY(-105%) rotate(3deg); opacity: 0; }
      100%      { transform: translateY(-105%) rotate(3deg); opacity: 0; }
    }
    @keyframes d-tear-3 {
      0%, 17%   { transform: translateY(0); opacity: 1; }
      23%       { transform: translateY(-105%) rotate(-3deg); opacity: 0; }
      100%      { transform: translateY(-105%) rotate(-3deg); opacity: 0; }
    }
    /* The final Thursday page slides up subtly when it lands, then holds. */
    @keyframes d-land {
      0%, 22%   { transform: translateY(2%); opacity: 0.9; }
      30%       { transform: translateY(-1%); opacity: 1; }
      36%       { transform: translateY(0); opacity: 1; }
      92%       { transform: translateY(0); opacity: 1; }
      100%      { transform: translateY(-2%); opacity: 0; }
    }
    /* Tech Thursday stamp slams down once the Thursday page has settled. */
    @keyframes d-stamp-in {
      0%, 36%   { transform: scale(0.4) rotate(-14deg); opacity: 0; }
      46%       { transform: scale(1.18) rotate(-5deg); opacity: 0.95; }
      54%       { transform: scale(1) rotate(-3deg); opacity: 1; }
      92%       { transform: scale(1) rotate(-3deg); opacity: 1; }
      100%      { transform: scale(1) rotate(-3deg); opacity: 0; }
    }
    @keyframes d-text-in {
      0%, 30%   { opacity: 0; transform: translateY(6%); }
      42%       { opacity: 1; transform: translateY(0); }
      92%       { opacity: 1; }
      100%      { opacity: 0; }
    }
    /* Aaron — the host — peeks up from the bottom edge once Thursday has
       landed, waves, then ducks back down with the rest of the scene. */
    @keyframes d-aaron-in {
      0%, 48%   { transform: translateY(120%); opacity: 0; }
      57%       { transform: translateY(-3%);  opacity: 1; }
      62%       { transform: translateY(0%);   opacity: 1; }
      90%       { transform: translateY(0%);   opacity: 1; }
      100%      { transform: translateY(120%); opacity: 0; }
    }
    /* The wave itself — a gentle rock around the base, a few cycles. */
    @keyframes d-aaron-wave {
      0%, 58%   { transform: rotate(0deg); }
      64%       { transform: rotate(8deg); }
      70%       { transform: rotate(-6deg); }
      76%       { transform: rotate(7deg); }
      82%       { transform: rotate(-4deg); }
      88%, 100% { transform: rotate(0deg); }
    }
    /* Little "Hi." pill that pops by his hand. */
    @keyframes d-aaron-hi {
      0%, 60%   { transform: scale(0.4) translateY(20%); opacity: 0; }
      67%       { transform: scale(1.12) translateY(0);  opacity: 1; }
      72%       { transform: scale(1) translateY(0);     opacity: 1; }
      88%       { transform: scale(1) translateY(0);     opacity: 1; }
      94%, 100% { transform: scale(0.85) translateY(10%); opacity: 0; }
    }
  `;
  document.head.appendChild(s);
})();

// CalendarPage — the building block. Used as logo, in title cards, etc.
// `ep` provides the date + category. `mini` toggles a thumbnail-grid layout.
function CalendarPage({ ep, withStamp = true, withTopic = false, mini = false }) {
  const cat = TT_CAT[ep.cat];
  const Glyph = TT_GLYPH[ep.cat];
  // Parse the date for "21 May" — split on space.
  const parts = ep.date.replace('Thu ', '').split(' ');
  const day = parts[0];
  const month = parts[1] || '';

  return (
    <div style={{
      width: '100%', height: '100%', background: dStyles.page,
      borderRadius: '2.2cqh',
      boxShadow: dStyles.shadow,
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      fontFamily: dStyles.font, color: dStyles.ink,
      border: '1px solid rgba(41,66,56,0.08)',
    }}>
      {/* Top bar — DAY NAME makes the calendar metaphor obvious immediately. */}
      <div style={{
        background: cat.color, color: cat.ink, padding: '2.2cqh 3cqh',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flex: '0 0 auto',
      }}>
        <span style={{
          fontWeight: 800, fontSize: mini ? '5cqh' : '4cqh',
          letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>Thursday</span>
        <span style={{
          fontSize: mini ? '3.6cqh' : '2.6cqh', fontWeight: 500,
          letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.85,
        }}>Ep {String(ep.ep ?? ep.week).padStart(2, '0')}</span>
      </div>

      {/* Binder hole strip */}
      <div style={{
        background: 'rgba(41,66,56,0.04)', padding: '0.6cqh 3cqh',
        display: 'flex', gap: '1.6cqh', justifyContent: 'flex-start',
        borderBottom: '1px dashed rgba(41,66,56,0.18)',
        flex: '0 0 auto',
      }}>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{
            width: '1.2cqh', height: '1.2cqh', borderRadius: '50%',
            background: '#fff', boxShadow: 'inset 0 1px 2px rgba(41,66,56,0.25)',
          }}></div>
        ))}
      </div>

      {/* Main body — day number paired tight with month so it unambiguously reads as a date. */}
      <div style={{
        flex: 1, padding: '2.4cqh 3cqh 2.4cqh',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', position: 'relative', textAlign: 'center',
      }}>
        <div style={{
          display: 'flex', alignItems: 'baseline',
          gap: mini ? '2cqh' : '1.4cqh', justifyContent: 'center',
        }}>
          <div style={{
            fontSize: mini ? '46cqh' : '32cqh', fontWeight: 900, lineHeight: 0.85,
            letterSpacing: '-0.06em', color: dStyles.ink,
          }}>{day}</div>
          <div style={{
            fontSize: mini ? '12cqh' : '8cqh', fontWeight: 800, lineHeight: 0.9,
            letterSpacing: '0.04em', textTransform: 'uppercase', color: cat.color,
          }}>{month}</div>
        </div>
        <div style={{
          marginTop: mini ? '1cqh' : '0.4cqh',
          fontSize: mini ? '3cqh' : '2.2cqh', fontWeight: 500,
          letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.5,
        }}>2026</div>

        {withStamp && !mini && (
          <div style={{
            marginTop: '1.6cqh',
            padding: '0.8cqh 1.6cqh',
            border: `0.3cqh solid ${dStyles.ink}`,
            borderRadius: '0.6cqh',
            transform: 'rotate(-3deg)',
            fontSize: '2.2cqh', fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: dStyles.ink,
            background: 'rgba(255,255,255,0.4)',
          }}>Tech Thursday</div>
        )}

        {/* Category glyph in corner */}
        <div style={{
          position: 'absolute', bottom: '2cqh', right: '2.4cqh',
          width: mini ? '11cqh' : '6cqh', height: mini ? '11cqh' : '6cqh',
          color: cat.color, display: 'flex', opacity: 0.85,
        }}>
          <Glyph size="100%" />
        </div>
      </div>

      {withTopic && (
        <div style={{
          flex: '0 0 auto', padding: '2cqh 3cqh',
          borderTop: '1px dashed rgba(41,66,56,0.2)',
          background: 'rgba(178,210,53,0.10)',
          fontSize: '2.2cqh',
        }}>
          <span style={{
            fontSize: '1.6cqh', fontWeight: 600, letterSpacing: '0.14em',
            textTransform: 'uppercase', opacity: 0.6, marginRight: '0.8cqh',
          }}>This week:</span>
          {ep.title}
        </div>
      )}
    </div>
  );
}

// --- Logo ---
function LogoD() {
  return (
    <div style={{
      width: '100%', height: '100%', background: dStyles.bg,
      padding: '6% 6%', boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '6%', position: 'relative',
    }}>
      <div style={{ flex: '0 0 36%', aspectRatio: '0.78' }}>
        <CalendarPage ep={TT_EP[0]} withStamp={true} />
      </div>
      <div style={{ flex: '1 1 auto', minWidth: 0 }}>
        <div style={{
          fontFamily: dStyles.font, fontSize: 13, fontWeight: 500,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: dStyles.mid, marginBottom: 10,
        }}>Every other Thursday</div>
        <div style={{
          fontFamily: dStyles.font, fontWeight: 900, fontSize: 46, lineHeight: 0.9,
          letterSpacing: '-0.02em', color: dStyles.ink,
        }}>Tech<br/>Thursday</div>
        <div style={{
          marginTop: 22, paddingTop: 14,
          borderTop: '1px solid rgba(41,66,56,0.15)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <img src="assets/logo-icon-dark.png" alt="" style={{ width: 20 }} />
          <span style={{ fontSize: 11, color: dStyles.ink, opacity: 0.7, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Ground Control
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Intro Bumper ---
// Tear-off desk calendar: Monday 25 → Tuesday 26 → Wednesday 27 → Thursday 28
// peels off the pad in quick succession until Thursday lands and the
// Tech Thursday stamp slams down. Animations are CSS-infinite so the loop
// drives itself — no React remount, which keeps the bumper recordable
// frame-by-frame.
function IntroBumperD() {
  const fillerDays = [
    { name: 'Monday',    num: '25' },
    { name: 'Tuesday',   num: '26' },
    { name: 'Wednesday', num: '27' },
  ];

  return (
    <div style={{
      width: '100%', height: '100%', background: dStyles.bg,
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '6% 4%', boxSizing: 'border-box', gap: '5%',
    }}>
      {/* The calendar pad — stack of pages, same width/height, absolute. */}
      <div style={{
        position: 'relative', width: '30%', aspectRatio: '0.78',
        animation: 'd-land 5.2s cubic-bezier(0.2,0.7,0.3,1) infinite',
      }}>
        {/* Z-order: Monday is on top (z 4), Tuesday under (3), Wednesday (2),
            Thursday at the bottom (1). Each tears off and reveals the next. */}
        {fillerDays.map((d, i) => (
          <div key={d.num} style={{
            position: 'absolute', inset: 0,
            zIndex: 4 - i,
            transformOrigin: 'top center',
            animation: `d-tear-${i + 1} 5.2s cubic-bezier(0.5, 0, 0.7, 1) infinite`,
          }}>
            <FillerDayPage dayName={d.name} dayNumber={d.num} />
          </div>
        ))}
        {/* Thursday — sits at the bottom of the stack, never tears. */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <CalendarPage ep={TT_EP[0]} withStamp={false} />
        </div>

        {/* Tech Thursday stamp slams in after Thursday is revealed. */}
        <div style={{
          position: 'absolute', bottom: '-4%', right: '-8%', zIndex: 10,
          padding: '1.2cqh 2cqh',
          border: `0.5cqh solid ${dStyles.ink}`,
          borderRadius: '0.8cqh',
          background: dStyles.acc, color: dStyles.ink,
          fontSize: '2.4cqh', fontWeight: 800,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          animation: 'd-stamp-in 5.2s ease-out infinite',
          opacity: 0,
          boxShadow: '0 0.6cqh 1.4cqh rgba(41,66,56,0.20)',
        }}>Tech Thursday</div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{
          fontSize: '3cqh', fontWeight: 500, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: dStyles.mid, marginBottom: '1.4cqh',
          animation: 'd-text-in 5.2s ease-out infinite', opacity: 0,
        }}>· Every other Thursday ·</div>
        <div style={{
          fontFamily: dStyles.font, fontWeight: 900, fontSize: '15cqh', lineHeight: 0.9,
          letterSpacing: '-0.025em', color: dStyles.ink,
          animation: 'd-text-in 5.2s ease-out 0.15s infinite', opacity: 0,
        }}>Tech<br/>Thursday<span style={{ color: dStyles.acc }}>.</span></div>

        <div style={{
          marginTop: '4cqh', display: 'flex', alignItems: 'center', gap: '1.4cqh',
          animation: 'd-text-in 5.2s ease-out 0.3s infinite', opacity: 0,
        }}>
          <img src="assets/logo-icon-dark.png" alt="" style={{ width: '5cqh' }} />
          <span style={{
            fontSize: '2.4cqh', color: dStyles.ink, opacity: 0.7, letterSpacing: '0.08em',
          }}>Ground Control</span>
        </div>
      </div>

      {/* Aaron — our host — pops up from the bottom-right and waves hello. */}
      <div style={{
        position: 'absolute', right: '5%', bottom: 0, zIndex: 30,
        width: '46cqh',
        animation: 'd-aaron-in 5.2s cubic-bezier(0.22,0.9,0.3,1.1) infinite',
        opacity: 0, willChange: 'transform',
        filter: 'drop-shadow(0 1.6cqh 2.4cqh rgba(41,66,56,0.28))',
      }}>
        <div style={{
          transformOrigin: 'bottom center',
          animation: 'd-aaron-wave 5.2s ease-in-out infinite',
        }}>
          {/* Greeting pill, by the raised hand. */}
          <div style={{
            position: 'absolute', top: '4%', left: '-10%',
            transformOrigin: 'bottom right',
            animation: 'd-aaron-hi 5.2s ease-out infinite', opacity: 0,
            background: dStyles.fg, color: dStyles.ink,
            padding: '1.2cqh 2.4cqh', borderRadius: '999px',
            fontFamily: dStyles.font, fontWeight: 800, fontSize: '3.2cqh',
            letterSpacing: '-0.01em', whiteSpace: 'nowrap',
            boxShadow: '0 1cqh 2cqh rgba(41,66,56,0.22)',
          }}>
            Hi<span style={{ color: dStyles.acc }}> — I'm Aaron</span>
          </div>
          <img src="assets/aaron-memoji.png" alt="Aaron waving hello"
            style={{ width: '100%', display: 'block' }} />
        </div>
      </div>
    </div>
  );
}

// FillerDayPage — neutral-coloured calendar page used only for the intro's
// pre-Thursday "tear-off" days. Same shape as CalendarPage so the tear feels
// like one continuous pad.
function FillerDayPage({ dayName, dayNumber, month = 'May' }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: dStyles.page,
      borderRadius: '2.2cqh',
      boxShadow: dStyles.shadow,
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      fontFamily: dStyles.font, color: dStyles.ink,
      border: '1px solid rgba(41,66,56,0.08)',
    }}>
      {/* Neutral grey-green top bar so it reads as 'just another weekday' */}
      <div style={{
        background: 'rgba(41,66,56,0.10)', color: dStyles.ink, padding: '2.2cqh 3cqh',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flex: '0 0 auto', borderBottom: '1px solid rgba(41,66,56,0.10)',
      }}>
        <span style={{
          fontWeight: 800, fontSize: '4cqh',
          letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.7,
        }}>{dayName}</span>
        <span style={{
          fontSize: '2.6cqh', fontWeight: 500,
          letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4,
        }}>2026</span>
      </div>

      {/* Binder hole strip */}
      <div style={{
        background: 'rgba(41,66,56,0.04)', padding: '0.6cqh 3cqh',
        display: 'flex', gap: '1.6cqh', justifyContent: 'flex-start',
        borderBottom: '1px dashed rgba(41,66,56,0.18)',
        flex: '0 0 auto',
      }}>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{
            width: '1.2cqh', height: '1.2cqh', borderRadius: '50%',
            background: '#fff', boxShadow: 'inset 0 1px 2px rgba(41,66,56,0.25)',
          }}></div>
        ))}
      </div>

      <div style={{
        flex: 1, padding: '2.4cqh 3cqh',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center',
      }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: '1.4cqh',
        }}>
          <div style={{
            fontSize: '32cqh', fontWeight: 900, lineHeight: 0.85,
            letterSpacing: '-0.06em', color: 'rgba(41,66,56,0.85)',
          }}>{dayNumber}</div>
          <div style={{
            fontSize: '8cqh', fontWeight: 800, lineHeight: 0.9,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            color: 'rgba(41,66,56,0.45)',
          }}>{month}</div>
        </div>
        <div style={{
          marginTop: '0.4cqh',
          fontSize: '2.2cqh', fontWeight: 500,
          letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.4,
        }}>2026</div>
      </div>
    </div>
  );
}

// --- Outro ---
function OutroD({ nextEp }) {
  const next = nextEp || TT_EP[3];
  const tick = useLoop(5200);
  return (
    <div key={tick} style={{
      width: '100%', height: '100%', background: dStyles.bg,
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '6% 4%', boxSizing: 'border-box', gap: '5%',
    }}>
      <div style={{ width: '32%', aspectRatio: '0.78', animation: 'tt-fade-in 0.6s 0.2s both' }}>
        <CalendarPage ep={next} withStamp={true} />
      </div>

      <div style={{ flex: 1, animation: 'tt-fade-in 0.5s 0.5s both' }}>
        <div style={{
          fontSize: '2.6cqh', fontWeight: 500, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: dStyles.mid, marginBottom: '1.2cqh',
        }}>Next Thursday · in two weeks</div>
        <div style={{
          fontFamily: dStyles.font, fontWeight: 900, fontSize: '9cqh', lineHeight: 0.95,
          letterSpacing: '-0.02em', color: dStyles.ink, textWrap: 'balance',
        }}>{next.title}.</div>
        <div style={{
          marginTop: '1.4cqh', fontSize: '3cqh', opacity: 0.75, maxWidth: '90%',
        }}>{next.sub}</div>

        <div style={{
          marginTop: '4cqh', padding: '1.4cqh 2.2cqh',
          background: dStyles.ink, color: dStyles.fg,
          borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: '1cqh',
          fontSize: '2.2cqh', fontWeight: 600,
        }}>
          Try this week's tip
          <span style={{ color: dStyles.acc }}>→</span>
        </div>
      </div>
    </div>
  );
}

// --- Title Card ---
function TitleCardD({ ep }) {
  const cat = TT_CAT[ep.cat];
  const Glyph = TT_GLYPH[ep.cat];
  return (
    <div style={{
      width: '100%', height: '100%', background: dStyles.bg,
      padding: '4% 5%', boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', gap: '5%',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ width: '28%', aspectRatio: '0.78' }}>
        <CalendarPage ep={ep} withStamp={true} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '2.2cqh', fontWeight: 600, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: cat.color === '#B2D235' ? dStyles.mid : cat.color,
          marginBottom: '0.8cqh', display: 'inline-flex', alignItems: 'center', gap: '0.8cqh',
        }}>
          <span style={{ width: '2cqh', height: '2cqh', color: cat.color, display: 'flex' }}>
            <Glyph size="100%" />
          </span>
          {cat.name}
        </div>
        <div style={{
          fontFamily: dStyles.font, fontWeight: 900, fontSize: '8.5cqh', lineHeight: 0.95,
          letterSpacing: '-0.02em', color: dStyles.ink, textWrap: 'balance',
        }}>{ep.title}</div>
        <div style={{
          marginTop: '1.6cqh', fontSize: '2.8cqh', opacity: 0.72, maxWidth: '92%',
        }}>{ep.sub}</div>

        <div style={{
          marginTop: '3cqh', display: 'flex', alignItems: 'center', gap: '1.4cqh',
          paddingTop: '2cqh', borderTop: '1px solid rgba(41,66,56,0.15)',
        }}>
          <img src="assets/logo-icon-dark.png" alt="" style={{ width: '4cqh' }} />
          <span style={{ fontSize: '1.9cqh', color: dStyles.ink, opacity: 0.7, letterSpacing: '0.08em' }}>
            Tech Thursday · Ground Control
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Thumbnail ---
function ThumbD({ ep }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: dStyles.bg,
      padding: '4%', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', gap: '3cqh',
    }}>
      <div style={{ flex: 1, aspectRatio: '0.78', alignSelf: 'center', height: '60%' }}>
        <CalendarPage ep={ep} withStamp={false} mini={false} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: dStyles.font, fontWeight: 900, fontSize: '7cqh', lineHeight: 1,
          letterSpacing: '-0.01em', color: dStyles.ink, textWrap: 'balance',
        }}>{ep.title}</div>
      </div>
    </div>
  );
}

// --- Teams banner: a row of upcoming Thursdays. ---
function BannerD() {
  return (
    <div style={{
      width: '100%', height: '100%', background: dStyles.bg,
      padding: '3% 4%', boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', gap: '3%',
      position: 'relative',
    }}>
      <div style={{ flex: '0 0 32%' }}>
        <div style={{
          fontSize: '3cqh', fontWeight: 500, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: dStyles.mid, marginBottom: '1cqh',
        }}>· Every other Thu ·</div>
        <div style={{
          fontFamily: dStyles.font, fontWeight: 900, fontSize: '24cqh', lineHeight: 0.85,
          letterSpacing: '-0.03em', color: dStyles.ink,
        }}>Tech<br/>Thursday.</div>
        <div style={{
          marginTop: '2cqh', display: 'flex', alignItems: 'center', gap: '1cqh',
        }}>
          <img src="assets/logo-icon-dark.png" alt="" style={{ width: '4.5cqh' }} />
          <span style={{ fontSize: '2.6cqh', color: dStyles.ink, opacity: 0.7 }}>Ground Control</span>
        </div>
      </div>

      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)', gap: '1.6cqh', alignItems: 'center',
      }}>
        {TT_EP.map(ep => (
          <div key={ep.week} style={{ aspectRatio: '0.78' }}>
            <CalendarPage ep={ep} withStamp={false} mini={true} />
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { LogoD, IntroBumperD, OutroD, TitleCardD, ThumbD, BannerD, CalendarPage, FillerDayPage });

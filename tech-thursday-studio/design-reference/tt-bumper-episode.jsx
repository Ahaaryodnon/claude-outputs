// Episode intro bumper — Direction D ("Desk Calendar"), episode-aware.
//
// Same desk-calendar tear-off as the brand bumper, but it resolves to the
// EPISODE: the pad tears down to the episode's actual Thursday date, and the
// right column makes the episode title the hero — "Tech Thursday" is now just
// the kicker. Pass any TT_EP entry; the calendar date, category colour, glyph,
// title and sub all follow it.
//
// Reuses CalendarPage / FillerDayPage and the d-tear / d-land / d-stamp
// keyframes injected by tt-direction-d.jsx, so load this AFTER that file.

const epStyles = {
  bg: '#E6EBE3',
  ink: '#294238',
  fg: '#FFFFFF',
  acc: '#B2D235',
  mid: '#50B748',
  font: "'Cera Pro', system-ui, sans-serif",
};

(function injectEpKeyframes() {
  if (document.getElementById('tt-ep-kf')) return;
  const s = document.createElement('style');
  s.id = 'tt-ep-kf';
  s.textContent = `
    /* Text rises + fades in once Thursday has landed, holds, then clears for
       the loop. Stagger is applied per-line via animation-delay. */
    @keyframes ep-rise {
      0%, 30%  { opacity: 0; transform: translateY(14%); }
      44%      { opacity: 1; transform: translateY(0); }
      92%      { opacity: 1; transform: translateY(0); }
      100%     { opacity: 0; transform: translateY(-3%); }
    }
  `;
  document.head.appendChild(s);
})();

// Derive the three weekday pages that tear off to reveal the episode's
// Thursday. e.g. "Thu 25 Jun" → Mon 22 / Tue 23 / Wed 24 (Jun).
function fillerDaysFor(ep) {
  const parts = ep.date.replace('Thu ', '').split(' ');
  const dayNum = parseInt(parts[0], 10);
  const month = parts[1] || 'May';
  return [
    { name: 'Monday',    num: String(dayNum - 3), month },
    { name: 'Tuesday',   num: String(dayNum - 2), month },
    { name: 'Wednesday', num: String(dayNum - 1), month },
  ];
}

function IntroBumperEpisode({ ep }) {
  const episode = ep || TT_EP[2];
  const cat = TT_CAT[episode.cat];
  const Glyph = TT_GLYPH[episode.cat];
  const fillerDays = fillerDaysFor(episode);
  // Overline colour: mid-green substitute for the light-green category so it
  // stays legible as small text (mirrors TitleCardD).
  const catText = cat.color === '#B2D235' ? epStyles.mid : cat.color;

  return (
    <div style={{
      width: '100%', height: '100%', background: epStyles.bg,
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '6% 4%', boxSizing: 'border-box', gap: '5%',
      fontFamily: epStyles.font,
    }}>
      {/* The calendar pad — tears down to the episode's Thursday. */}
      <div style={{
        position: 'relative', width: '30%', aspectRatio: '0.78',
        animation: 'd-land 5.2s cubic-bezier(0.2,0.7,0.3,1) infinite',
      }}>
        {fillerDays.map((d, i) => (
          <div key={d.num} style={{
            position: 'absolute', inset: 0,
            zIndex: 4 - i,
            transformOrigin: 'top center',
            animation: `d-tear-${i + 1} 5.2s cubic-bezier(0.5, 0, 0.7, 1) infinite`,
          }}>
            <FillerDayPage dayName={d.name} dayNumber={d.num} month={d.month} />
          </div>
        ))}
        {/* The episode's Thursday — bottom of the stack, never tears. */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <CalendarPage ep={episode} withStamp={false} />
        </div>

        {/* Tech Thursday stamp slams in once Thursday is revealed. */}
        <div style={{
          position: 'absolute', bottom: '-6%', right: '-10%', zIndex: 10,
          padding: '1.8cqh 3cqh',
          border: `0.7cqh solid ${epStyles.ink}`,
          borderRadius: '1.2cqh',
          background: epStyles.acc, color: epStyles.ink,
          fontSize: '3.6cqh', fontWeight: 800,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          animation: 'd-stamp-in 5.2s ease-out infinite',
          opacity: 0,
          boxShadow: '0 0.9cqh 2cqh rgba(41,66,56,0.22)',
        }}>Tech Thursday</div>
      </div>

      {/* Right column — episode is the hero, brand is the kicker. */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Kicker: brand + episode number */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1.4cqh',
          marginBottom: '2.6cqh',
          animation: 'ep-rise 5.2s ease-out 0.05s infinite', opacity: 0,
        }}>
          <span style={{
            fontSize: '2.4cqh', fontWeight: 700, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: epStyles.mid,
          }}>Tech Thursday</span>
          <span style={{ width: '0.8cqh', height: '0.8cqh', borderRadius: '50%', background: 'rgba(41,66,56,0.3)' }}></span>
          <span style={{
            fontSize: '2.4cqh', fontWeight: 600, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'rgba(41,66,56,0.55)',
          }}>Ep {String(episode.ep ?? episode.week).padStart(2, '0')}</span>
        </div>

        {/* Category overline */}
        <div style={{
          fontSize: '2.4cqh', fontWeight: 600, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: catText,
          marginBottom: '2cqh', display: 'inline-flex', alignItems: 'center', gap: '1cqh',
          animation: 'ep-rise 5.2s ease-out 0.15s infinite', opacity: 0,
        }}>
          <span style={{ width: '2.4cqh', height: '2.4cqh', color: cat.color, display: 'flex' }}>
            <Glyph size="100%" />
          </span>
          {cat.name}
        </div>

        {/* Hero: episode title */}
        <div style={{
          fontFamily: epStyles.font, fontWeight: 900, fontSize: '11.5cqh', lineHeight: 0.92,
          letterSpacing: '-0.025em', color: epStyles.ink, textWrap: 'balance',
          animation: 'ep-rise 5.2s ease-out 0.25s infinite', opacity: 0,
        }}>{episode.title}<span style={{ color: epStyles.acc }}>.</span></div>

        {/* Sub */}
        <div style={{
          marginTop: '3cqh', fontSize: '3.2cqh', lineHeight: 1.4,
          color: 'rgba(41,66,56,0.72)', maxWidth: '92%',
          animation: 'ep-rise 5.2s ease-out 0.35s infinite', opacity: 0,
        }}>{episode.sub}</div>

        {/* Footer */}
        <div style={{
          marginTop: '6cqh', paddingTop: '3cqh',
          borderTop: '1px solid rgba(41,66,56,0.15)',
          display: 'flex', alignItems: 'center', gap: '1.4cqh',
          animation: 'ep-rise 5.2s ease-out 0.45s infinite', opacity: 0,
        }}>
          <img src="assets/logo-icon-dark.png" alt="" style={{ width: '4.5cqh' }} />
          <span style={{
            fontSize: '2.2cqh', color: 'rgba(41,66,56,0.7)', letterSpacing: '0.08em',
          }}>Ground Control</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { IntroBumperEpisode, fillerDaysFor });

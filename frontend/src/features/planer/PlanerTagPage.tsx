import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { useReveal } from '../../components/ui';
import { useOverlay } from '../../app/OverlayContext';
import { PL_TODAY, PL_WDLONG, usePlaner } from './store';
import { PlRow } from './PlanerScreen';

/** Tagesplan (Port `PlanerTagScreen`): alle Posts eines Tages + KI-Tipp. */
export function PlanerTagPage(): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  const { day: dayParam = '12' } = useParams<{ day: string }>();
  const day = Number(dayParam);
  const navigate = useNavigate();
  const { open } = useOverlay();
  const { posts } = usePlaner();
  const dayPosts = posts.filter((p) => p.day === day).sort((a, b) => (a.hhmm > b.hhmm ? 1 : -1));

  return (
    <div className="screen" ref={ref}>
      <div className="card smp-day-hero">
        <div className="smp-day-hero-n">{day}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{PL_WDLONG[day] ?? 'Tag'}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>
            {dayPosts.length} {dayPosts.length === 1 ? 'Post' : 'Posts'} geplant{day === PL_TODAY ? ' · Launch-Tag' : ''}
          </div>
        </div>
        <span style={{ color: 'var(--accent-fg)', display: 'flex' }}><Icon name="calendar" size={22} /></span>
      </div>

      <div className="stack" style={{ gap: 11, marginTop: 13 }}>
        {dayPosts.length ? (
          dayPosts.map((p) => <PlRow key={p.id} p={p} onOpen={(pid) => navigate(`/projekte/planer/post/${pid}`)} />)
        ) : (
          <div className="empty">Für diesen Tag ist nichts geplant.</div>
        )}
      </div>

      <div className="card smp-kitip">
        <div className="smp-kitip-head">
          <div className="ai-ava" style={{ width: 28, height: 28 }}><Icon name="sparkle" size={15} /></div>
          <span>KI-Tipp</span>
        </div>
        <div className="smp-kitip-body">Zwischen 12:00 und 18:00 ist eine Lücke. Eine Story um 15:00 würde die Reichweite am Launch-Tag um ~14 % erhöhen.</div>
        <button className="btn btn-primary btn-block" style={{ height: 44, marginTop: 12 }} onClick={() => open('compose')}><Icon name="plus" size={15} />Story um 15:00 hinzufügen</button>
      </div>
    </div>
  );
}

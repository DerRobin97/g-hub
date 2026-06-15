import type { ProjectMemberDto } from '@g-hub/shared';
import { initial } from './projectUtils';

/** Überlappende Mitglieder-Avatare (Initialen) mit „+N"-Überlauf. */
export function MemberAvatars({
  members,
  size = 24,
  max = 4,
}: {
  members: ProjectMemberDto[];
  size?: number;
  max?: number;
}): React.JSX.Element {
  const shown = members.slice(0, max);
  const rest = members.length - shown.length;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {shown.map((m, i) => (
        <div
          key={m.userId}
          className="avatar"
          title={m.name}
          style={{
            width: size,
            height: size,
            fontSize: size * 0.42,
            marginLeft: i ? -size * 0.32 : 0,
            border: '2px solid var(--surface)',
          }}
        >
          {initial(m.name)}
        </div>
      ))}
      {rest > 0 && (
        <div
          className="avatar"
          style={{
            width: size,
            height: size,
            fontSize: size * 0.36,
            marginLeft: -size * 0.32,
            border: '2px solid var(--surface)',
            background: 'var(--surface-3)',
            color: 'var(--text-2)',
          }}
        >
          +{rest}
        </div>
      )}
    </div>
  );
}

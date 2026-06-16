import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/Icon';
import { Sheet } from '../../components/Sheet';
import { aiChat, type AiChatMessage } from '../../lib/api';

/** KI-Assistent (Port `ai-assistant.jsx`): Chat-Logik + Thread + Composer + Dock/FAB/Sheet. */
const AI_PROMPTS = [
  { label: 'Meine Aufgaben heute', q: 'Was sind meine Aufgaben heute?' },
  { label: 'Tagesüberblick geben', q: 'Gib mir einen Überblick über meinen Tag.' },
  { label: 'Was steht als Nächstes an?', q: 'Was ist als Nächstes geplant?' },
  { label: 'Kampagnen-Performance', q: 'Wie lief unsere letzte Kampagne?' },
  { label: 'Post-Idee entwerfen', q: 'Gib mir eine Post-Idee.' },
];

function nowTime(): string {
  return new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

interface ChatMsg {
  who: 'ai' | 'me';
  text: string;
  t: string;
}

interface AIChat {
  msgs: ChatMsg[];
  draft: string;
  setDraft: (s: string) => void;
  typing: boolean;
  bodyRef: React.RefObject<HTMLDivElement>;
  send: (raw?: string) => void;
  onKey: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  showPrompts: boolean;
}

function useAIChat(): AIChat {
  const [msgs, setMsgs] = useState<ChatMsg[]>([{ who: 'ai', text: 'Hi Robin 👋 Womit kann ich helfen?', t: nowTime() }]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing]);

  const send = (raw?: string): void => {
    const text = (raw ?? draft).trim();
    if (!text || typing) return;
    setDraft('');
    setInteracted(true);
    const history = [...msgs, { who: 'me', text, t: nowTime() } as ChatMsg];
    setMsgs(history);
    setTyping(true);
    // Verlauf für die API; führende KI-Begrüßung weglassen (muss mit 'user' starten).
    const apiMsgs: AiChatMessage[] = history.map((m) => ({
      role: m.who === 'me' ? 'user' : 'assistant',
      content: m.text,
    }));
    while (apiMsgs.length && apiMsgs[0].role === 'assistant') apiMsgs.shift();
    aiChat(apiMsgs)
      .then((res) => setMsgs((m) => [...m, { who: 'ai', text: res.reply, t: nowTime() }]))
      .catch(() =>
        setMsgs((m) => [
          ...m,
          { who: 'ai', text: 'Entschuldige, die KI ist gerade nicht erreichbar. Bitte versuch es gleich noch einmal.', t: nowTime() },
        ]),
      )
      .finally(() => setTyping(false));
  };
  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return { msgs, draft, setDraft, typing, bodyRef, send, onKey, showPrompts: !interacted && !typing };
}

function renderMarkup(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');
}

function AIThread({ chat }: { chat: AIChat }): React.JSX.Element {
  const { msgs, typing, showPrompts, send, bodyRef } = chat;
  return (
    <div className="ai-thread" ref={bodyRef}>
      {msgs.map((m, i) => (
        <div key={i} className={'ai-row ' + (m.who === 'me' ? 'me' : '')}>
          {m.who === 'ai' && <span className="ai-ava"><Icon name="bot" size={17} /></span>}
          {/* statischer, kontrollierter Markup-String (fett/Zeilenumbruch) */}
          <div className="ai-bubble" dangerouslySetInnerHTML={{ __html: renderMarkup(m.text) }} />
        </div>
      ))}
      {typing && (
        <div className="ai-row">
          <span className="ai-ava"><Icon name="bot" size={17} /></span>
          <div className="ai-bubble" style={{ padding: 0 }}><div className="ai-typing"><span /><span /><span /></div></div>
        </div>
      )}
      {showPrompts && !typing && (
        <div className="ai-prompts">
          {AI_PROMPTS.map((p) => (
            <button key={p.label} className="ai-prompt" onClick={() => send(p.q)}>
              <span className="ai-dot" />
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AIComposer({ chat }: { chat: AIChat }): React.JSX.Element {
  const { draft, setDraft, send, onKey } = chat;
  return (
    <div className="ai-input-row">
      <textarea className="ai-input" rows={1} value={draft} placeholder="Frag deinen Assistenten…" onChange={(e) => setDraft(e.target.value)} onKeyDown={onKey} />
      <button className="ai-send" disabled={!draft.trim()} onClick={() => send()} aria-label="Senden">
        <Icon name="send" size={20} stroke={2} />
      </button>
    </div>
  );
}

/** Gedocktes KI-Panel (Desktop-Spalte). */
export function AIDock({ onClose }: { onClose?: () => void }): React.JSX.Element {
  const chat = useAIChat();
  return (
    <div className="ai-dock">
      <div className="ai-dock-head">
        <span className="ai-ava" style={{ width: 30, height: 30, borderRadius: 10 }}><Icon name="bot" size={18} /></span>
        <span className="ai-dock-name">KI-Assistent<span className="ai-dock-status"><b /></span></span>
        {onClose && (
          <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={onClose} aria-label="Einklappen"><Icon name="chevronR" size={16} /></button>
        )}
      </div>
      <AIThread chat={chat} />
      <div className="ai-dock-foot"><AIComposer chat={chat} /></div>
    </div>
  );
}

/** Schwebender KI-Starter (mobil). */
export function AIFab({ onClick }: { onClick: () => void }): React.JSX.Element {
  return (
    <button className="ai-fab" onClick={onClick} aria-label="KI-Assistent öffnen">
      <span className="ai-fab-badge">KI</span>
      <span className="ai-fab-spark"><Icon name="bot" size={26} stroke={1.8} /></span>
    </button>
  );
}

/** KI-Assistent als Bottom-Sheet (mobil). */
export function AIAssistantSheet({ close }: { close: () => void }): React.JSX.Element {
  const chat = useAIChat();
  const title = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <span className="ai-ava" style={{ width: 26, height: 26, borderRadius: 8 }}><Icon name="bot" size={16} /></span>
      KI-Assistent
    </span>
  );
  return (
    <Sheet title={title} onClose={close} variant="sheet-ai" foot={<AIComposer chat={chat} />}>
      <AIThread chat={chat} />
    </Sheet>
  );
}

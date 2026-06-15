import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/Icon';
import { Sheet } from '../../components/Sheet';

/** KI-Assistent (Port `ai-assistant.jsx`): Chat-Logik + Thread + Composer + Dock/FAB/Sheet. */
const AI_PROMPTS = [
  { label: 'Meine Aufgaben heute', q: 'Was sind meine Aufgaben heute?' },
  { label: 'Tagesüberblick geben', q: 'Gib mir einen Überblick über meinen Tag.' },
  { label: 'Was steht als Nächstes an?', q: 'Was ist als Nächstes geplant?' },
  { label: 'Kampagnen-Performance', q: 'Wie lief unsere letzte Kampagne?' },
  { label: 'Post-Idee entwerfen', q: 'Gib mir eine Post-Idee.' },
];

function aiReply(text: string): string {
  const t = text.toLowerCase();
  if (/aufgabe|to-?do|todo|task|erledig|was muss ich/.test(t))
    return 'Für **heute** stehen 2 eigene Aufgaben an:\n**14:00** · Reel-Skript Sommer-Launch finalisieren *(hohe Prio)*\n**17:00** · LinkedIn-Captions Korrektur lesen\nIm Team ist außerdem bei **Jonas** die TikTok-Ad-Freigabe offen. Soll ich dir das Reel-Skript als Erstes öffnen?';
  if (/überblick|tagesüberblick|agenda|tagesplan|mein tag|meinen tag|tag im überblick|zusammenfass|briefing/.test(t))
    return 'Dein Tag im Überblick:\n• **2 Aufgaben** fällig (1 mit hoher Priorität)\n• **18:00** geht „Produkt-Drop Reveal" automatisch auf Instagram live\n• **4 Beiträge** warten auf deine Freigabe\n• „Sommer-Launch" liegt **+18,4 % über Ziel**\nWomit möchtest du starten?';
  if (/nächste|naechste|geplant|ansteht|steht an|als nächstes|kommende|demnächst/.test(t))
    return 'Als Nächstes geplant:\n**Heute 18:00** · Produkt-Drop Reveal (Instagram, Auto-Post)\n**Mi 12:00** · 3 Styling-Tipps Karussell — wartet auf Freigabe\n**Do 09:00** · Event-Reminder „Late-Night-Shopping"\nSoll ich die offene Freigabe für Mittwoch jetzt vorbereiten?';
  if (/team|wer arbeitet|auslastung|kolleg|verteil|zuständig/.test(t))
    return 'Gerade aktiv im Team: **Lena** (Reel-Skript), **Jonas** (TikTok-Creatives) und **Mira** (Influencer-Briefing). Lena hat heute die meisten offenen Punkte — soll ich Aufgaben neu verteilen?';
  if (/instagram|post|idee|caption|text/.test(t))
    return 'Wie wäre es mit einem **Behind-the-Scenes-Reel** zum Sommer-Launch? Hook: „3 Dinge, die niemand übers Launchen verrät." Carousel-Alternative liegt auch bereit — soll ich einen Entwurf in „Erstellen" anlegen?';
  if (/zeit|wann|posting|uhr/.test(t))
    return 'Deine beste Resonanz war zuletzt **Di & Do, 09:00–10:00** sowie **18:30**. Für Instagram empfehle ich diese Woche **Donnerstag 09:00** — da ist deine Zielgruppe am aktivsten.';
  if (/kampagne|performance|lief|analyse|report/.test(t))
    return 'Die Kampagne „Sommer-Launch" liegt **+18,4 % über Ziel**: 142K Reach, 4,2 % Engagement, CPC 0,38 €. Stärkster Kanal: LinkedIn. Schwächster: X — dort würde ich das Budget umverteilen.';
  if (/hashtag|tag/.test(t))
    return 'Vorschlag für deine Nische:\n**#Sommer2026 · #MarketingHub · #GrowthHacks · #BehindTheScenes · #ContentStrategie**\nMix aus 2 Reichweiten- und 3 Nischen-Tags — das hält die Relevanz hoch.';
  return 'Verstanden! Ich kann dir bei deinen **Aufgaben** und deinem **Tagesplan** helfen, **Kampagnen analysieren** oder **Content-Ideen** entwerfen. Womit soll ich starten?';
}

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
    if (!text) return;
    setDraft('');
    setInteracted(true);
    setMsgs((m) => [...m, { who: 'me', text, t: nowTime() }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { who: 'ai', text: aiReply(text), t: nowTime() }]);
    }, 850 + Math.random() * 500);
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

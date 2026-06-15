import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Overlay-/Sheet-System (Port des `open(name,data)`/`close()`-Musters aus `main-web.jsx`).
 * Sheets werden über eine Registry registriert und als Overlay über der App gerendert.
 * Bis ein Provider gesetzt ist, ist `open` ein No-op (Buttons bleiben funktionslos,
 * aber die App kompiliert) — die Registry wird in späteren Milestones gefüllt.
 */
export type SheetName = string;

export interface SheetProps {
  data: unknown;
  close: () => void;
}

export type SheetRegistry = Record<SheetName, (props: SheetProps) => React.JSX.Element>;

interface OverlayApi {
  open: (name: SheetName, data?: unknown) => void;
  close: () => void;
  current: { name: SheetName | null; data: unknown };
}

const OverlayCtx = createContext<OverlayApi>({
  open: () => {},
  close: () => {},
  current: { name: null, data: undefined },
});

export function OverlayProvider({
  registry,
  children,
}: {
  registry: SheetRegistry;
  children: ReactNode;
}): React.JSX.Element {
  const [current, setCurrent] = useState<{ name: SheetName | null; data: unknown }>({ name: null, data: undefined });
  const open = useCallback((name: SheetName, data?: unknown) => setCurrent({ name, data }), []);
  const close = useCallback(() => setCurrent({ name: null, data: undefined }), []);
  const api = useMemo<OverlayApi>(() => ({ open, close, current }), [open, close, current]);

  const Active = current.name ? registry[current.name] : null;

  return (
    <OverlayCtx.Provider value={api}>
      {children}
      {Active && <Active data={current.data} close={close} />}
    </OverlayCtx.Provider>
  );
}

export function useOverlay(): OverlayApi {
  return useContext(OverlayCtx);
}

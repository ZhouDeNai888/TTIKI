"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import ApiService from "../utils/ApiService";

type NotifyPayload = Record<string, any>;
export type NotifyEntry = {
  id: string;
  type: string | null;
  payload: NotifyPayload;
};

type NotifyContextValue = {
  list: NotifyEntry[];
  unreadCount: number;
  pushRaw: (raw: any) => void;
  markAllRead: () => Promise<void>;
  markRead: (notification_id?: string | number) => Promise<void>;
  clear: () => void;
};

const NotifyContext = createContext<NotifyContextValue | null>(null);

export function useNotify() {
  const ctx = useContext(NotifyContext);
  if (!ctx) throw new Error("useNotify must be used within NotifyProvider");
  return ctx;
}

export function NotifyProvider({ children }: { children: React.ReactNode }) {
  // initialize to empty on server to keep SSR deterministic
  const [list, setList] = useState<NotifyEntry[]>([]);

  const seen = useRef(new Set<string>());

  // helper: compute a stable key from raw/event/payload for dedupe
  const computeEventKey = (raw: any, payloadObj?: any) => {
    try {
      const payload = payloadObj ?? raw.data ?? raw.order ?? raw;
      const maybeEventId =
        raw?.event_id ||
        raw?.data?.event_id ||
        raw?.order?.event_id ||
        payload?.event_id ||
        "";
      const notifId =
        raw?.notification_id ??
        raw?.id ??
        payload?._meta_notification_id ??
        payload?.id ??
        "";
      const created = raw?.created_at ?? payload?.created_at ?? "";
      const eventKey = maybeEventId || (notifId ? `${notifId}_${created}` : "");
      return eventKey || `${notifId || "anon"}_${created || "t"}`;
    } catch {
      return String(Date.now()) + Math.random().toString(36).slice(2, 8);
    }
  };

  // persist list to sessionStorage on the client only
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem("notify_list", JSON.stringify(list));
    } catch {}
  }, [list]);

  // Rehydrate list from sessionStorage on client mount and seed seen set
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("notify_list");
      if (raw) {
        const parsed = JSON.parse(raw) as NotifyEntry[];
        setList(parsed);
        const s = new Set<string>();
        for (const e of parsed) {
          try {
            const key = computeEventKey({}, e.payload ?? {});
            if (key) s.add(key);
          } catch {}
        }
        seen.current = s;
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushRaw = (raw: any) => {
    try {
      const payloadObj = raw.data ?? raw.order ?? raw;
      const payloadType = raw.type ?? null;
      const payloadNormalized = {
        ...payloadObj,
        _meta_user_id: raw.user_id ?? undefined,
        _meta_message: raw.message ?? undefined,
        _meta_notification_id: raw.notification_id ?? raw.id ?? undefined,
        _meta_status: raw.status ?? undefined,
        _meta_created_at: raw.created_at ?? undefined,
      };
      // compute a stable dedupe key
      const eventKey = computeEventKey(raw, payloadNormalized);

      setList((prev) => {
        // if seen by eventKey and no notification id, skip
        const newNotifId = String(
          payloadNormalized._meta_notification_id ?? payloadNormalized.id ?? ""
        );
        if (!newNotifId && eventKey && seen.current.has(eventKey)) return prev;

        // if we have a notification id, try to find existing entry and update it
        if (newNotifId) {
          const idx = prev.findIndex((it) => {
            const existingId = String(
              it.payload?._meta_notification_id ?? it.payload?.id ?? ""
            );
            return existingId && existingId === newNotifId;
          });
          if (idx !== -1) {
            const updated = [...prev];
            // merge payload into existing entry
            updated[idx] = {
              ...updated[idx],
              payload: {
                ...updated[idx].payload,
                ...payloadNormalized,
              },
            };
            if (eventKey) seen.current.add(eventKey);
            return updated;
          }
        }

        // otherwise insert new at the top
        const id =
          eventKey || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const entry: NotifyEntry = {
          id,
          type: payloadType,
          payload: payloadNormalized,
        };
        if (eventKey) seen.current.add(eventKey);
        return [entry, ...prev];
      });
    } catch {}
  };

  // Helper to check login by presence of refresh token
  const hasRefreshToken = () => {
    if (typeof document === "undefined") return false;
    return !!document.cookie.match(/urft=([^;]+)/);
  };

  const [isLoggedIn, setIsLoggedIn] = useState(hasRefreshToken());

  useEffect(() => {
    const handleLogin = () => {
      setIsLoggedIn(hasRefreshToken());
    };
    window.addEventListener("userUpdated", handleLogin);
    return () => {
      window.removeEventListener("userUpdated", handleLogin);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isLoggedIn) return;

    const es = new EventSource("/api/sse/user/notify", {
      withCredentials: true,
    });

    const handler = (e: MessageEvent) => {
      try {
        const raw = JSON.parse(e.data);
        pushRaw(raw);
      } catch (err) {
        // ignore
      }
    };
    es.addEventListener("order", handler as EventListener);
    es.addEventListener("notify", handler as EventListener);
    window.dispatchEvent(new Event("userUpdated"));
    es.onerror = () => {
      // rely on browser retry
    };

    return () => {
      try {
        es.removeEventListener("order", handler as EventListener);
        es.removeEventListener("notify", handler as EventListener);
        es.close();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const unreadCount = list.filter((it) => {
    try {
      const s = String(
        it.payload?._meta_status ?? it.payload?.status ?? ""
      ).toLowerCase();
      return s === "unread";
    } catch {
      return false;
    }
  }).length;

  const markAllRead = async () => {
    // Intentionally no-op: do not mark all notifications as read automatically.
    // The user requested "ไม่ทำ all read" so we avoid calling server-wide mark-all.
    return Promise.resolve();
  };

  const markRead = async (notification_id?: string | number) => {
    try {
      await ApiService.markNotificationsRead(notification_id as any);
      setList((prev) =>
        prev.map((it) => {
          const nid =
            it.payload?._meta_notification_id ?? it.payload?.id ?? undefined;
          // update only _meta_status so we don't overwrite any existing payload.status that
          // may represent a domain state (e.g., "pending")
          if (notification_id == null)
            return {
              ...it,
              payload: { ...it.payload, _meta_status: "read" },
            };
          if (String(nid) === String(notification_id))
            return {
              ...it,
              payload: { ...it.payload, _meta_status: "read" },
            };
          return it;
        })
      );
    } catch {}
  };

  const clear = () => {
    setList([]);
    try {
      sessionStorage.removeItem("notify_list");
    } catch {}
  };

  return (
    <NotifyContext.Provider
      value={{ list, unreadCount, pushRaw, markAllRead, markRead, clear }}
    >
      {children}
    </NotifyContext.Provider>
  );
}

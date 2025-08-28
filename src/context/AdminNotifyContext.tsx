"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import ApiService from "../utils/ApiService";

export type AdminNotifyEntry = {
  id: string;
  type: string | null;
  payload: Record<string, any>;
};

type AdminNotifyContextValue = {
  list: AdminNotifyEntry[];
  unreadCount: number;
  pushRaw: (raw: any) => void;
  markAllRead: () => Promise<void>;
  markRead: (notification_id?: string | number) => Promise<void>;
  clear: () => void;
};

const AdminNotifyContext = createContext<AdminNotifyContextValue | null>(null);

export function useAdminNotify() {
  const ctx = useContext(AdminNotifyContext);
  if (!ctx)
    throw new Error("useAdminNotify must be used within AdminNotifyProvider");
  return ctx;
}

export function AdminNotifyProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  console.log("AdminNotifyProvider rendered");
  const [list, setList] = useState<AdminNotifyEntry[]>([]);
  const seen = useRef(new Set<string>());

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem("admin_notify_list", JSON.stringify(list));
    } catch {}
  }, [list]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("admin_notify_list");
      if (raw) {
        const parsed = JSON.parse(raw) as AdminNotifyEntry[];
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

      const eventKey = computeEventKey(raw, payloadNormalized);

      setList((prev) => {
        const newNotifId = String(
          payloadNormalized._meta_notification_id ?? payloadNormalized.id ?? ""
        );
        if (!newNotifId && eventKey && seen.current.has(eventKey)) return prev;

        if (newNotifId) {
          const idx = prev.findIndex((it) => {
            const existingId = String(
              it.payload?._meta_notification_id ?? it.payload?.id ?? ""
            );
            return existingId && existingId === newNotifId;
          });
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              payload: { ...updated[idx].payload, ...payloadNormalized },
            };
            if (eventKey) seen.current.add(eventKey);
            return updated;
          }
        }

        const id =
          eventKey || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const entry: AdminNotifyEntry = {
          id,
          type: payloadType,
          payload: payloadNormalized,
        };
        if (eventKey) seen.current.add(eventKey);
        return [entry, ...prev];
      });
    } catch {}
  };

  // Manage EventSource lifecycle and react to login/logout via a window event.
  const esRef = useRef<EventSource | null>(null);
  const pathname = usePathname();

  const startEventSource = () => {
    try {
      if (typeof window === "undefined") return;
      if (esRef.current) return; // already started

      const es = new EventSource("/api/sse/admin/notify", {
        withCredentials: true,
      } as any);
      const handler = (e: MessageEvent) => {
        try {
          const raw = JSON.parse(e.data);
          pushRaw(raw);
        } catch {}
      };
      es.addEventListener("order", handler as EventListener);
      es.addEventListener("notify", handler as EventListener);
      es.onopen = () => {
        try {
          // eslint-disable-next-line no-console
          console.info("AdminNotify: EventSource open");
        } catch {}
      };
      es.onerror = (err) => {
        try {
          // eslint-disable-next-line no-console
          console.warn("AdminNotify: EventSource error", err);
        } catch {}
        try {
          es.close();
        } catch {}
        try {
          esRef.current = null;
        } catch {}
      };
      (es as any)._notify_handler = handler;
      esRef.current = es;

      try {
        window.dispatchEvent(new Event("adminUpdated"));
      } catch {}
    } catch {}
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // initial attempt
    startEventSource();

    const onAdminUpdated = () => {
      try {
        startEventSource();
      } catch {}
    };
    window.addEventListener("adminUpdated", onAdminUpdated);

    return () => {
      try {
        window.removeEventListener("adminUpdated", onAdminUpdated);
      } catch {}
      try {
        if (esRef.current) {
          const handler = (esRef.current as any)._notify_handler as
            | EventListener
            | undefined;
          if (handler) {
            esRef.current.removeEventListener(
              "order",
              handler as EventListener
            );
            esRef.current.removeEventListener(
              "notify",
              handler as EventListener
            );
          }
          esRef.current.close();
        }
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Try reconnecting after route changes (login -> dashboard redirect)
  useEffect(() => {
    try {
      startEventSource();
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
    return Promise.resolve();
  };

  const markRead = async (notification_id?: string | number) => {
    try {
      await ApiService.markAdminNotificationsRead(notification_id as any);
      setList((prev) =>
        prev.map((it) => {
          const nid =
            it.payload?._meta_notification_id ?? it.payload?.id ?? undefined;
          if (notification_id == null)
            return { ...it, payload: { ...it.payload, _meta_status: "read" } };
          if (String(nid) === String(notification_id))
            return { ...it, payload: { ...it.payload, _meta_status: "read" } };
          return it;
        })
      );
    } catch {}
  };

  const clear = () => {
    setList([]);
    try {
      sessionStorage.removeItem("admin_notify_list");
    } catch {}
  };

  return (
    <AdminNotifyContext.Provider
      value={{ list, unreadCount, pushRaw, markAllRead, markRead, clear }}
    >
      {children}
    </AdminNotifyContext.Provider>
  );
}

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DiyorIcon } from "@/components/diyor-icon";

type Notice = { id: number; title: string; detail?: string };
type FeedbackContext = { notify: (title: string, detail?: string) => void };
const Feedback = createContext<FeedbackContext | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const notify = (title: string, detail?: string) => setNotice({ id: Date.now(), title, detail });
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);
  return <Feedback.Provider value={{ notify }}>{children}{notice && <aside className="action-toast" role="status" aria-live="polite" key={notice.id}><span><DiyorIcon name="check-circle" /></span><div><b>{notice.title}</b>{notice.detail && <small>{notice.detail}</small>}</div><button type="button" onClick={() => setNotice(null)} aria-label="Закрыть уведомление"><DiyorIcon name="close-x" /></button></aside>}</Feedback.Provider>;
}

export function useFeedback() {
  const value = useContext(Feedback);
  if (!value) throw new Error("FeedbackProvider missing");
  return value;
}

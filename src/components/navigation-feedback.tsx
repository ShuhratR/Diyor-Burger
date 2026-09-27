"use client";

import { useEffect, useState } from "react";

export function NavigationFeedback() {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const link = target?.closest<HTMLAnchorElement>('a[href]');
      if (!link || link.target || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      setLoading(true);
      window.setTimeout(() => setLoading(false), 1800);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return <div className={`route-progress ${loading ? "is-loading" : ""}`} aria-hidden="true"><i /></div>;
}

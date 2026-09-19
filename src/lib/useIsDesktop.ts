"use client";

import { useEffect, useState } from "react";

export function useIsDesktop(query = "(min-width: 768px)") {
  const [match, setMatch] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatch(mq.matches);
    const fn = (e: MediaQueryListEvent) => setMatch(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [query]);
  return match;
}

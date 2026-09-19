"use client";

import { useEffect } from "react";
import { clearDraft } from "@/lib/draft";

export function ClearDraft() {
  useEffect(() => {
    clearDraft();
    try {
      sessionStorage.removeItem("ecodriver:contact");
    } catch {}
  }, []);
  return null;
}

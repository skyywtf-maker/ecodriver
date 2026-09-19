"use client";

import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";

/** three.js et le modèle ne sont téléchargés qu'à l'approche de la section. */
const CarScene = lazy(() => import("./CarScene"));

export function Car3D() {
  const holder = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // Le visiteur qui a demandé moins d'animations ne subit pas la rotation ;
  // il peut toujours faire tourner la voiture au doigt.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAutoRotate(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    // Sans IntersectionObserver (navigateur ancien), on charge directement.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onReady = useCallback(() => setReady(true), []);

  return (
    <div
      ref={holder}
      className="relative h-[320px] w-full overflow-hidden rounded-4xl border border-white/[0.08] bg-graphite md:h-[520px]"
    >
      {visible && (
        <Suspense fallback={null}>
          <CarScene autoRotate={autoRotate} onReady={onReady} />
        </Suspense>
      )}

      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-[13px] font-medium text-label">Chargement du véhicule…</span>
        </div>
      )}

      {ready && (
        <span className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[12px] font-medium text-label">
          Faites glisser pour tourner
        </span>
      )}
    </div>
  );
}

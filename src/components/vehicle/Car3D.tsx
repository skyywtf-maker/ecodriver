"use client";

import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";

/** three.js et le modèle ne sont téléchargés qu'à l'approche de la section. */
const CarScene = lazy(() => import("./CarScene"));

export function Car3D({ src, yaw = 0 }: { src: string; yaw?: number }) {
  const holder = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [scrollDriven, setScrollDriven] = useState(true);

  // Le visiteur qui a demandé moins d'animations ne subit ni la rotation au
  // défilement ni la rotation automatique ; il peut toujours faire tourner la
  // voiture au doigt.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setScrollDriven(!mq.matches);
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

  // Avancée du bloc dans la fenêtre, de 0 (il entre par le bas) à 1 (il sort
  // par le haut). Écrite dans un ref : React ne redessine pas, seule la boucle
  // de rendu three lit la valeur.
  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const span = window.innerHeight + r.height;
      if (span <= 0) return;
      const raw = (window.innerHeight - r.top) / span;
      progress.current = Math.min(1, Math.max(0, raw));
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const onReady = useCallback(() => setReady(true), []);

  // Changer de véhicule recharge un autre fichier : on réaffiche l'attente.
  // Pas au montage : les effets de l'enfant s'exécutent avant ceux du parent,
  // ce qui annulerait le signal de fin de chargement déjà reçu.
  const known = useRef(src);
  useEffect(() => {
    if (known.current === src) return;
    known.current = src;
    setReady(false);
  }, [src]);

  return (
    <div
      ref={holder}
      className="relative h-[270px] w-full overflow-hidden rounded-3xl border border-white/[0.08] bg-graphite sm:h-[380px] md:h-[520px]"
    >
      {visible && (
        <Suspense fallback={null}>
          <CarScene
            src={src}
            yaw={yaw}
            progress={progress}
            scrollDriven={scrollDriven}
            onReady={onReady}
          />
        </Suspense>
      )}

      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-[13px] font-medium text-label">Chargement du véhicule…</span>
        </div>
      )}

      {ready && (
        <span className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[12px] font-medium text-label">
          Modèle 3D d&apos;illustration, non contractuel
        </span>
      )}
    </div>
  );
}

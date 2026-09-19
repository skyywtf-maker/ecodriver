import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[720px] px-4 pb-10 pt-32 md:pt-40">
        <h1 className="font-display text-4xl font-bold tracking-[-0.04em] md:text-5xl">{title}</h1>
        <div className="mt-10 flex flex-col gap-5 text-[15px] leading-relaxed text-white/75 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}

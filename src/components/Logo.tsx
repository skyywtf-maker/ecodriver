import Link from "next/link";

export function Logo({ className = "text-xl" }: { className?: string }) {
  return (
    <Link href="/" className={`font-display font-bold tracking-[-0.02em] ${className}`}>
      Eco <span className="serif-accent">Driver</span>
    </Link>
  );
}

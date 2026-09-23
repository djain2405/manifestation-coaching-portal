export function AuthOrnament() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        viewBox="0 0 800 360"
        className="absolute left-[-10%] top-8 h-[18rem] w-[90%] max-w-4xl text-accent/12"
        fill="none"
      >
        <path
          d="M40 260q360-200 720 0"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeLinecap="round"
        />
        <circle cx="400" cy="68" r="4.5" fill="currentColor" />
      </svg>
    </div>
  );
}

export function HeroOrnament() {
  return (
    <svg
      viewBox="0 0 280 180"
      className="pointer-events-none absolute -right-4 top-6 h-40 w-56 text-white/20 sm:h-48 sm:w-72"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 150q128-110 256 0"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
      <circle cx="140" cy="42" r="4" fill="currentColor" />
    </svg>
  );
}

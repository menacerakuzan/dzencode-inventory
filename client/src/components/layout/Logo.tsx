export default function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.12} viewBox="0 0 40 45" aria-hidden className="logo">
      <path d="M20 1 38 7v14c0 11.5-7.6 19.6-18 23C9.6 40.6 2 32.5 2 21V7L20 1Z" fill="#6ea832" />
      <path d="M20 1 38 7v14c0 11.5-7.6 19.6-18 23V1Z" fill="#83bf45" />
      <circle cx="20" cy="17" r="5.5" fill="#fff" />
      <path d="M10.5 32c1.4-5.2 5-8 9.5-8s8.1 2.8 9.5 8" fill="#fff" />
    </svg>
  );
}

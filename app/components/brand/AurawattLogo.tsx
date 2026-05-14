"use client";

export default function AurawattLogo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <polygon points="24,4 38,20 24,16" fill="#f59e0b" />
      <polygon points="24,4 10,20 24,16" fill="#06b6d4" />
      <polygon points="10,20 24,44 24,28" fill="#10b981" />
      <polygon points="38,20 24,44 24,28" fill="#f97316" />
    </svg>
  );
}


"use client";

export default function AurawattLogo({ size = 48 }: { size?: number }) {
  return (
    <img
      src="/aurawatt_logo.webp"
      alt="Aurawatt"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain", display: "block" }}
    />
  );
}


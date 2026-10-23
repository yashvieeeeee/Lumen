import React from "react";

export default function LumenLogo({ className }: { className?: string }) {
  return (
    <a className={className ?? "brand"} href="/" aria-label="Lumen home">
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
        focusable="false"
        style={{ flexShrink: 0 }}
      >
        <circle cx="14" cy="14" r="13.5" stroke="var(--iris)" strokeWidth="1" />
        <circle cx="10" cy="14" r="9" stroke="var(--iris)" strokeWidth="1" />
        <circle cx="18" cy="14" r="9" stroke="var(--iris)" strokeWidth="1" />
      </svg>
      <span>Lumen</span>
    </a>
  );
}

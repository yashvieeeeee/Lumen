"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const themes = [
  { id: "cloud", name: "Cloud", description: "Clear & calm" },
  { id: "midnight", name: "Midnight", description: "Bold & focused" },
  { id: "bloom", name: "Bloom", description: "Soft & playful" },
  { id: "grove", name: "Grove", description: "Grounded & warm" },
] as const;
const fonts = [
  { id: "clean", name: "Clean" },
  { id: "book", name: "Book" },
  { id: "handwritten", name: "Handwritten" },
] as const;
type Appearance = {
  theme: (typeof themes)[number]["id"];
  font: (typeof fonts)[number]["id"];
  size: number;
};
const defaults: Appearance = { theme: "cloud", font: "book", size: 18 };
const storageKey = "lumen-appearance";

export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>(defaults);
  useEffect(() => {
    try {
      const value: unknown = JSON.parse(
        localStorage.getItem(storageKey) ?? "null",
      );
      if (!value || typeof value !== "object") return;
      const saved = value as Record<string, unknown>;
      setAppearance({
        theme:
          themes.find((theme) => theme.id === saved.theme)?.id ??
          defaults.theme,
        font: fonts.find((font) => font.id === saved.font)?.id ?? defaults.font,
        size:
          typeof saved.size === "number" &&
          Number.isInteger(saved.size) &&
          saved.size >= 16 &&
          saved.size <= 24
            ? saved.size
            : defaults.size,
      });
    } catch {
      /* Appearance still works when browser storage is unavailable. */
    }
  }, []);
  useEffect(() => {
    document.body.dataset.theme = appearance.theme;
    document.body.dataset.font = appearance.font;
    document.body.style.setProperty("--writing-size", `${appearance.size}px`);
    return () => {
      delete document.body.dataset.theme;
      delete document.body.dataset.font;
      document.body.style.removeProperty("--writing-size");
    };
  }, [appearance]);
  function change(next: Partial<Appearance>) {
    const updated = { ...appearance, ...next };
    setAppearance(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      /* Keep the in-memory choice. */
    }
  }
  return { appearance, change };
}

export function AppearanceControls({
  appearance,
  change,
}: ReturnType<typeof useAppearance>) {
  const controls = useRef<HTMLDetailsElement>(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        gsap.fromTo(
          ".appearance-current",
          { opacity: 0, y: 5 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: "power3.out",
            clearProps: "transform,opacity",
          },
        );
        gsap.fromTo(
          '.theme-option[aria-pressed="true"] .theme-preview i',
          {
            y: 7,
            rotation: -8,
            scale: 0.9,
          },
          {
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.06,
            ease: "back.out(1.6)",
            clearProps: "transform",
          },
        );
      },
      controls,
    );
    return () => media.revert();
  }, [appearance.theme, appearance.font]);
  return (
    <details ref={controls} className="appearance-controls">
      <summary>
        <span className="palette-mark" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span>
          <strong>Make it yours</strong>
          <span className="appearance-current">
            {themes.find((theme) => theme.id === appearance.theme)?.name} theme
            · {fonts.find((font) => font.id === appearance.font)?.name} text
          </span>
        </span>
        <span className="appearance-chevron" aria-hidden="true">
          ⌄
        </span>
      </summary>
      <div className="appearance-content">
        <fieldset className="theme-picker">
          <legend>A space that feels like you</legend>
          <div className="theme-options">
            {themes.map((theme) => (
              <button
                type="button"
                key={theme.id}
                className={`theme-option theme-${theme.id}`}
                aria-pressed={appearance.theme === theme.id}
                onClick={() => change({ theme: theme.id })}
              >
                <span className="theme-preview" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <strong>{theme.name}</strong>
                <span>{theme.description}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <div className="writing-preferences">
          <fieldset className="font-picker">
            <legend>Writing font</legend>
            <div className="font-options">
              {fonts.map((font) => (
                <button
                  type="button"
                  key={font.id}
                  data-font-choice={font.id}
                  aria-pressed={appearance.font === font.id}
                  onClick={() => change({ font: font.id })}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="writing-size">
            Text size <span>{appearance.size}px</span>
            <input
              type="range"
              min="16"
              max="24"
              step="1"
              value={appearance.size}
              onChange={(event) => change({ size: Number(event.target.value) })}
            />
          </label>
        </div>
        <p className="appearance-note">
          Your look, on this browser. Writing and mood ratings follow your
          saving choices.
        </p>
      </div>
    </details>
  );
}

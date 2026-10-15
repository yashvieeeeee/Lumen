import { useId, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

export const moodLabels = ["Very low", "Low", "Okay", "Good", "Great"];

export function MoodFace({ rating }: { rating: number | null }) {
  const mouths = [
    "M8 16Q12 11 16 16",
    "M8 15Q12 12 16 15",
    "M8 14H16",
    "M8 13Q12 18 16 13",
    "M7 13Q12 21 17 13Z",
  ];
  return (
    <svg
      className="mood-face"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        strokeDasharray={rating ? undefined : "2 3"}
      />
      {rating ? (
        <>
          <path d="M8 9h.01M16 9h.01" strokeWidth="2.5" />
          <path d={mouths[rating - 1]} />
        </>
      ) : (
        <path d="M9 12h6" />
      )}
    </svg>
  );
}

export function MoodPicker({
  value,
  onChange,
  disabled,
  label = "Your mood (optional)",
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  label?: string;
}) {
  const id = useId();
  const picker = useRef<HTMLFieldSetElement>(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        gsap.fromTo(
          ".mood-preview",
          { scale: 0.74, rotation: -12, opacity: 0.3 },
          {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 0.65,
            ease: "back.out(1.8)",
            clearProps: "transform,opacity",
          },
        );
        gsap.fromTo(
          ".mood-selected, .mood-hint",
          { y: 7, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: "power3.out",
            clearProps: "transform,opacity",
          },
        );
      },
      picker,
    );
    return () => media.revert();
  }, [value]);
  return (
    <fieldset
      ref={picker}
      className="mood-picker"
      disabled={disabled}
      data-mood={value ?? ""}
    >
      <legend>{label}</legend>
      <div className="mood-picker-heading">
        <span className="mood-preview" key={value ?? "none"}>
          <MoodFace rating={value} />
        </span>
        <div>
          <p className="mood-selected" aria-live="polite">
            {value ? moodLabels[value - 1] : "How does today feel?"}
          </p>
          <p className="mood-hint">
            {value
              ? "A little check-in, just for you."
              : "Slide or tap a face. It’s okay to skip."}
          </p>
        </div>
      </div>
      <input
        id={id}
        type="range"
        className="mood-slider"
        min="1"
        max="5"
        step="1"
        value={value ?? 3}
        aria-label={label}
        aria-valuetext={value ? moodLabels[value - 1] : "No rating selected"}
        onChange={(event) => onChange(Number(event.target.value))}
        onPointerUp={(event) => onChange(Number(event.currentTarget.value))}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onChange(Number(event.currentTarget.value));
          }
        }}
      />
      <div className="mood-options" role="group" aria-label="Choose a mood">
        {moodLabels.map((name, index) => (
          <button
            type="button"
            key={name}
            className="mood-option"
            data-mood={index + 1}
            aria-label={`Set mood to ${name}`}
            aria-pressed={value === index + 1}
            onClick={() => onChange(index + 1)}
          >
            <MoodFace rating={index + 1} />
            <span>{name}</span>
          </button>
        ))}
      </div>
      <div className="mood-picker-footer">
        <span>
          {value ? "Your rating is selected." : "No rating selected."}
        </span>
        <button
          type="button"
          className="text-button"
          disabled={!value || disabled}
          onClick={() => onChange(null)}
        >
          Clear rating
        </button>
      </div>
    </fieldset>
  );
}

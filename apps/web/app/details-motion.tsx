"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function DetailsMotion() {
  const pathname = usePathname();
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const active = new Map<
        HTMLDetailsElement,
        {
          open: boolean;
          height: string;
          overflow: string;
          tween?: gsap.core.Tween;
        }
      >();
      const finish = (details: HTMLDetailsElement) => {
        const state = active.get(details);
        if (!state) return;
        state.tween?.kill();
        details.open = state.open;
        details.style.height = state.height;
        details.style.overflow = state.overflow;
        active.delete(details);
        ScrollTrigger.refresh();
      };
      const toggle = (event: MouseEvent) => {
        if (event.defaultPrevented || !(event.target instanceof Element))
          return;
        const summary = event.target.closest("summary");
        const details = summary?.parentElement;
        if (!(details instanceof HTMLDetailsElement)) return;
        if (event.target.closest("a, button, input, select, textarea")) return;
        event.preventDefault();
        const previous = active.get(details);
        const open = !(previous?.open ?? details.open);
        const height = details.getBoundingClientRect().height;
        previous?.tween?.kill();
        const state = previous ?? {
          open,
          height: details.style.height,
          overflow: details.style.overflow,
        };
        state.open = open;
        active.set(details, state);
        details.open = true;
        details.style.height = "auto";
        const style = getComputedStyle(details);
        const closedHeight =
          summary!.offsetHeight +
          parseFloat(style.paddingTop) +
          parseFloat(style.paddingBottom) +
          parseFloat(style.borderTopWidth) +
          parseFloat(style.borderBottomWidth);
        const target = open
          ? details.getBoundingClientRect().height
          : closedHeight;
        details.style.height = `${height}px`;
        details.style.overflow = "clip";
        state.tween = gsap.to(details, {
          height: target,
          duration: open ? 0.58 : 0.38,
          ease: "power3.inOut",
          onComplete: () => finish(details),
        });
      };
      document.addEventListener("click", toggle);
      return () => {
        document.removeEventListener("click", toggle);
        // A preference change must leave each disclosure at the user's last choice.
        active.forEach((_, details) => finish(details));
      };
    });
    return () => media.revert();
  }, [pathname]);
  return null;
}

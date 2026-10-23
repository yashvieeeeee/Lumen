"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Motion() {
  const pathname = usePathname();
  useEffect(() => {
    const revealed = new WeakSet<Element>();
    const media = gsap.matchMedia();
    let heroPlayed = false;
    document.body.dataset.motionReady = "true";

    media.add("(prefers-reduced-motion: no-preference)", (context) => {
      const finePointer = window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      );
      const active = new Set<gsap.core.Tween>();
      const original = new WeakMap<HTMLElement, Map<string, string>>();
      const scheduled = new WeakSet<Element>();
      const controls = "button:not(:disabled), a[href]:not(.skip), summary";
      const fields =
        'input:not([type="range"]):not([type="checkbox"]):not([type="radio"]), textarea, select';
      let pressedControl: HTMLElement | null = null;

      function remember(target: HTMLElement, properties: string[]) {
        let values = original.get(target);
        if (!values) {
          values = new Map();
          original.set(target, values);
        }
        properties.forEach((property) => {
          if (!values.has(property))
            values.set(property, target.style.getPropertyValue(property));
        });
        target.dataset.motionInteraction = "true";
      }

      function restore(target: HTMLElement) {
        original.get(target)?.forEach((value, property) => {
          if (value) target.style.setProperty(property, value);
          else target.style.removeProperty(property);
        });
        original.delete(target);
        delete target.dataset.motionInteraction;
      }

      // Completed event tweens never retain dynamically removed controls in a context.
      function tween(target: HTMLElement, values: gsap.TweenVars) {
        const animation = gsap.to(target, {
          duration: 0.32,
          ease: "power3.out",
          overwrite: "auto",
          ...values,
          onComplete() {
            active.delete(animation);
            values.onComplete?.();
          },
          onInterrupt() {
            active.delete(animation);
          },
        });
        active.add(animation);
      }

      const hero = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (!heroPlayed) {
        heroPlayed = true;
        const header = document.querySelector("[data-motion-header]");
        const copy = gsap.utils.toArray<HTMLElement>("[data-motion-hero-item]");
        const art = document.querySelector("[data-motion-hero-art]");
        if (header)
          hero.fromTo(
            header,
            { y: -14, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              clearProps: "transform,opacity",
            },
          );
        if (copy.length)
          hero.fromTo(
            copy,
            { y: 38, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.05,
              stagger: 0.09,
              clearProps: "transform,opacity",
            },
            0.12,
          );
        if (art)
          hero.fromTo(
            art,
            { y: 48, rotation: -3, scale: 0.94, opacity: 0 },
            {
              y: 0,
              rotation: 0,
              scale: 1,
              opacity: 1,
              duration: 1.35,
              clearProps: "transform,opacity",
            },
            0.26,
          );
      }

      function reveal(element: HTMLElement) {
        if (
          revealed.has(element) ||
          scheduled.has(element) ||
          element.parentElement?.closest("details:not([open])")
        )
          return;
        scheduled.add(element);
        const targets =
          element.dataset.reveal === "stagger"
            ? Array.from(element.children)
            : [element];
        gsap.fromTo(
          targets,
          { y: 34, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.95,
            stagger: 0.1,
            ease: "power3.out",
            clearProps: "transform,opacity",
            onStart: () => {
              revealed.add(element);
            },
            scrollTrigger: { trigger: element, start: "top 90%", once: true },
          },
        );
      }
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(reveal);
      const revealDisclosure = context.add(
        "revealDisclosure",
        (event: Event) => {
          const details = event.target;
          if (!(details instanceof HTMLDetailsElement) || !details.open) return;
          details
            .querySelectorAll<HTMLElement>("[data-reveal]")
            .forEach(reveal);
          ScrollTrigger.refresh();
        },
      ) as EventListener;
      document.addEventListener("toggle", revealDisclosure, true);

      document
        .querySelectorAll<HTMLElement>("[data-motion-orbit]")
        .forEach((orbit) => {
          gsap.set(orbit, { animation: "none" });
          gsap.fromTo(
            orbit,
            { rotation: -12, y: 15 },
            {
              rotation: 28,
              y: -28,
              ease: "none",
              scrollTrigger: {
                trigger: orbit.closest("section"),
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
              },
            },
          );
        });
      const journal = document.querySelector("[data-motion-journal]");
      if (journal)
        gsap.to(journal, {
          y: -24,
          rotation: 0,
          ease: "none",
          scrollTrigger: {
            trigger: journal.closest("section"),
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      const rings = document.querySelector("[data-motion-rings]");
      if (rings)
        gsap.fromTo(
          rings,
          { rotation: -12, scale: 0.88 },
          {
            rotation: 14,
            scale: 1.05,
            ease: "none",
            scrollTrigger: {
              trigger: rings.closest("section"),
              scrub: 0.8,
              start: "top bottom",
              end: "bottom top",
            },
          },
        );

      function control(event: Event) {
        return event.target instanceof Element
          ? event.target.closest<HTMLElement>(controls)
          : null;
      }

      function moveControl(
        target: HTMLElement,
        scale: number,
        y: string,
        resting = false,
        duration = 0.32,
      ) {
        remember(target, ["--motion-control-scale", "--motion-control-y"]);
        if (!target.style.getPropertyValue("--motion-control-scale")) {
          gsap.set(target, {
            "--motion-control-scale": 1,
            "--motion-control-y": "0px",
          });
        }
        tween(target, {
          "--motion-control-scale": scale,
          "--motion-control-y": y,
          duration,
          onComplete: resting ? () => restore(target) : undefined,
        });
      }

      function hover(event: PointerEvent) {
        if (!finePointer.matches || event.pointerType !== "mouse") return;
        const target = control(event);
        if (
          !target ||
          (event.relatedTarget instanceof Node &&
            target.contains(event.relatedTarget))
        )
          return;
        if (target === pressedControl) return;
        const entering = event.type === "pointerover";
        moveControl(
          target,
          entering ? 1.025 : 1,
          entering ? "-2px" : "0px",
          !entering,
        );
      }

      function press(event: PointerEvent) {
        const pressing = event.type === "pointerdown";
        const target = pressing ? control(event) : pressedControl;
        if (!target) return;
        pressedControl = pressing ? target : null;
        const hovered =
          !pressing &&
          event.type !== "pointercancel" &&
          finePointer.matches &&
          target.matches(":hover");
        moveControl(
          target,
          pressing ? 0.97 : hovered ? 1.025 : 1,
          pressing ? "1px" : hovered ? "-2px" : "0px",
          !pressing && !hovered,
          pressing ? 0.16 : 0.4,
        );
      }

      function releasePressed() {
        if (pressedControl) moveControl(pressedControl, 1, "0px", true);
        pressedControl = null;
      }

      function keypress(event: KeyboardEvent) {
        if (event.repeat || (event.key !== "Enter" && event.key !== " "))
          return;
        if (event.type === "keyup") {
          releasePressed();
          return;
        }
        const target = control(event);
        if (!target || (event.key === " " && target.matches("a"))) return;
        pressedControl = target;
        moveControl(target, 0.97, "1px", false, 0.16);
      }

      function focus(event: FocusEvent) {
        const target = event.target;
        if (!(target instanceof HTMLElement) || !target.matches(fields)) return;
        const focused = event.type === "focusin";
        remember(target, ["--motion-focus-glow"]);
        tween(target, {
          "--motion-focus-glow": focused ? 1 : 0,
          onComplete: focused ? undefined : () => restore(target),
        });
      }

      document.addEventListener("pointerover", hover);
      document.addEventListener("pointerout", hover);
      document.addEventListener("pointerdown", press);
      document.addEventListener("pointerup", press);
      document.addEventListener("pointercancel", press);
      document.addEventListener("focusin", focus);
      document.addEventListener("focusout", focus);
      document.addEventListener("keydown", keypress);
      document.addEventListener("keyup", keypress);
      window.addEventListener("blur", releasePressed);
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);

      return () => {
        document.removeEventListener("pointerover", hover);
        document.removeEventListener("pointerout", hover);
        document.removeEventListener("pointerdown", press);
        document.removeEventListener("pointerup", press);
        document.removeEventListener("pointercancel", press);
        document.removeEventListener("focusin", focus);
        document.removeEventListener("focusout", focus);
        document.removeEventListener("keydown", keypress);
        document.removeEventListener("keyup", keypress);
        window.removeEventListener("blur", releasePressed);
        window.removeEventListener("load", refresh);
        document.removeEventListener("toggle", revealDisclosure, true);
        pressedControl = null;
        active.forEach((animation) => animation.kill());
        active.clear();
        document
          .querySelectorAll<HTMLElement>("[data-motion-interaction]")
          .forEach(restore);
      };
    });

    return () => {
      media.revert();
      delete document.body.dataset.motionReady;
    };
  }, [pathname]);
  return null;
}

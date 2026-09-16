"use client";

import { useState, useEffect, useMemo } from "react";

export default function BoxAnimation({
  onComplete,
}: {
  onComplete: () => void;
}) {
  // Starts directly in "closed" state — stable from frame 1 with zero glitch
  const [phase, setPhase] = useState<
    "closed" | "open" | "rise" | "showcase" | "dissolve" | "done"
  >("closed");

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-computed sparkle particles
  const sparks = useMemo(
    () => {
      if (!mounted) return [];
      return Array.from({ length: 36 }, (_, i) => ({
        id: i,
        x: 32 + Math.random() * 36, // cluster around box center
        delay: Math.random() * 1.8,
        dur: 2.2 + Math.random() * 2.2,
        size: 3 + Math.random() * 6,
        hue: 200 + Math.random() * 55,
      }));
    },
    [mounted]
  );

  // Pre-computed rising background bubbles
  const bgBubbles = useMemo(
    () => {
      if (!mounted) return [];
      return Array.from({ length: 25 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        dur: 4 + Math.random() * 4,
        size: 10 + Math.random() * 25,
      }));
    },
    [mounted]
  );



  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("open"), 900),
      setTimeout(() => setPhase("rise"), 2300),
      setTimeout(() => setPhase("showcase"), 4900),
      setTimeout(() => setPhase("dissolve"), 6400),
      setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 7700),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const handleSkip = () => {
    setPhase("dissolve");
    setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 600);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Space" || e.key === "Escape") {
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkip]);

  if (phase === "done") return null;

  const isOpen = phase !== "closed";
  const isRising = phase === "rise" || phase === "showcase" || phase === "dissolve";
  const isGlowing = isOpen;

  return (
    <div
      className={`ub-overlay transition-colors duration-300 bg-gradient-to-br from-[var(--color-bg-page)] to-[var(--color-light-blue)] dark:from-[#0F172A] dark:to-[#1E293B] text-[var(--color-dark-blue)] dark:text-[#E2E8F0] ${phase === "dissolve" ? "ub-overlay--out" : ""}`}
    >
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="ub-skip-btn text-[var(--color-dark-blue)] dark:text-white"
        aria-label="Skip intro animation"
      >
        Skip ✕
      </button>

      {/* Background Rising Bubbles */}
      <div className="ub-bg-bubbles">
        {bgBubbles.map((b) => (
          <div
            key={b.id}
            className="ub-bg-bubble"
            style={{
              left: `${b.x}%`,
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.dur}s`,
              width: b.size,
              height: b.size,
            }}
          />
        ))}
      </div>

      {/* Sparkle particles floating from open box */}
      <div className="ub-sparks">
        {sparks.map((s) => (
          <span
            key={s.id}
            className={`ub-spark ${isGlowing ? "ub-spark--on" : ""}`}
            style={{
              left: `${s.x}%`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.dur}s`,
              width: s.size,
              height: s.size,
              background: `radial-gradient(circle, hsla(${s.hue}, 95%, 85%, 1), hsla(${s.hue}, 85%, 65%, 0) 70%)`,
            }}
          />
        ))}
      </div>

      {/* Ground shadow beneath the box — always steady */}
      <div className="ub-ground" />

      {/* ─── 3D PERSPECTIVE SCENE ─── */}
      <div className="ub-persp">
        <div className="ub-stage">
          {/* Product (Logo + Title) emerges slowly from center */}
          <div className={`ub-prod ${isRising ? "ub-prod--up" : ""}`}>
            <img
              src="/logo.png"
              alt="NavDrishti"
              className="ub-prod__logo drop-shadow-[0_0_25px_rgba(255,255,255,1)] dark:drop-shadow-[0_0_35px_rgba(255,255,255,0.9)]"
            />
            <span className="ub-prod__name text-[var(--color-primary-blue)] drop-shadow-[0_0_30px_rgba(255,255,255,1)] dark:drop-shadow-[0_0_45px_rgba(255,255,255,1)]">NavDrishti</span>
          </div>

          {/* ─── 3D Box ─── */}
          <div className="ub-cube">
            {/* 5 Main Box Faces */}
            <div className="ub-face ub-face--front">
              <div className="ub-face-inner" />
            </div>
            <div className="ub-face ub-face--back" />
            <div className="ub-face ub-face--left" />
            <div className="ub-face ub-face--right" />
            <div className="ub-face ub-face--bottom" />

            {/* 4 Flaps (Closed stably from frame 1, then open smoothly in sequence) */}
            <div className="ub-fwrap ub-fwrap--back">
              <div
                className={`ub-flap ub-flap--back ${isOpen ? "ub-flap--open" : ""
                  }`}
              />
            </div>
            <div className="ub-fwrap ub-fwrap--left">
              <div
                className={`ub-flap ub-flap--left ${isOpen ? "ub-flap--open" : ""
                  }`}
              />
            </div>
            <div className="ub-fwrap ub-fwrap--right">
              <div
                className={`ub-flap ub-flap--right ${isOpen ? "ub-flap--open" : ""
                  }`}
              />
            </div>
            <div className="ub-fwrap ub-fwrap--front">
              <div
                className={`ub-flap ub-flap--front ${isOpen ? "ub-flap--open" : ""
                  }`}
              >
                {/* Seam tape line visible when box is closed */}
                <div className="ub-flap-tape" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tagline reveals as product hovers */}
      <p className={`ub-tag text-[var(--color-primary-blue)] dark:text-white drop-shadow-md ${isRising ? "ub-tag--on" : ""}`}>
        Ensuring Compliance, One Scan at a Time
      </p>
    </div>
  );
}

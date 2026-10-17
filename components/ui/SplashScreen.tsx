"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Check if splash has already been shown in this tab session
    const hasShown = sessionStorage.getItem("arvello_splash_shown");
    if (hasShown) {
      setShow(false);
      return;
    }

    // Trigger smooth fade out after initial app mount
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setShow(false);
        sessionStorage.setItem("arvello_splash_shown", "true");
      }, 350);
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center transition-opacity duration-350 ease-out ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/20">
          <Image
            src="/icons/icon-512x512.png"
            alt="Arvello's Hub"
            fill
            priority
            sizes="112px"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}

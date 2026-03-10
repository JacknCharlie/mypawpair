"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      setIsMobile(mobile);
      return mobile;
    };

    if (!checkMobile()) return;

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;

    // Don't show if already installed
    if (isStandalone) return;

    // iOS: show manual instructions
    if (isIOS) {
      setTimeout(() => setShowIOSPrompt(true), 2000);
      return;
    }

    // Android/Desktop Chrome: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowAndroidPrompt(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowAndroidPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (!isMobile || (!showAndroidPrompt && !showIOSPrompt)) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="bg-white shadow-2xl border-t-2 border-[#5F7E9D]">
        {/* Header - Always visible */}
        <div 
          className="bg-[#5F7E9D] px-4 py-3 flex items-center justify-between cursor-pointer"
          onClick={toggleCollapse}
        >
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/android-chrome-192x192.png"
              alt="PawPair"
              className="w-10 h-10 rounded-lg"
            />
            <div>
              <span className="text-white font-semibold text-base block">
                Install PawPair
              </span>
              <span className="text-white/80 text-xs">
                {showAndroidPrompt ? "Tap to install" : "Add to home screen"}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse();
            }}
            className="text-white/90 hover:text-white p-1"
            aria-label={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? (
              <ChevronUp className="w-6 h-6" />
            ) : (
              <ChevronDown className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Content - Collapsible */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isCollapsed ? "max-h-0" : "max-h-[500px]"
          }`}
        >
          <div className="px-4 py-4 bg-white">
            {showAndroidPrompt && (
              <>
                <p className="text-[#2F3E4E] font-semibold text-base mb-2">
                  Get the Best Experience
                </p>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Install our app for faster access, offline support, and a seamless experience tailored to your dog's needs.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleInstall}
                    className="w-full py-3.5 bg-[#5F7E9D] text-white rounded-xl text-base font-semibold hover:bg-[#4e6b87] transition-all shadow-md active:scale-95"
                  >
                    🐾 Install PawPair App
                  </button>
                  <button
                    onClick={toggleCollapse}
                    className="w-full py-2.5 text-gray-500 text-sm font-medium hover:text-gray-700 transition"
                  >
                    Maybe Later
                  </button>
                </div>
              </>
            )}

            {showIOSPrompt && (
              <>
                <p className="text-[#2F3E4E] font-semibold text-base mb-2">
                  Add to Home Screen
                </p>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Install PawPair on your iPhone for quick access and a native app experience.
                </p>
                <ol className="text-sm text-gray-700 space-y-3 mb-5 bg-gray-50 rounded-xl p-4">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#5F7E9D] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      Tap the <strong>Share button</strong>{" "}
                      <span className="inline-block text-blue-600 text-xl align-middle">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="inline">
                          <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
                        </svg>
                      </span>{" "}
                      at the bottom of Safari
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#5F7E9D] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      Scroll down and select{" "}
                      <strong>"Add to Home Screen"</strong>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#5F7E9D] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      Tap <strong>"Add"</strong> in the top right to confirm
                    </div>
                  </li>
                </ol>
                <button
                  onClick={toggleCollapse}
                  className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all active:scale-95"
                >
                  Got it, thanks!
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

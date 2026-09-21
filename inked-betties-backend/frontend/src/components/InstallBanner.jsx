// ============================================================
// INKED BETTIES — INSTALL APP BANNER
// Shows a friendly prompt encouraging visitors to install the PWA,
// once they're actually using the app (not on the Shopify storefront).
// - Never shows if already running installed (standalone mode).
// - On Android/Chrome: uses the real beforeinstallprompt flow.
// - On iOS Safari (no beforeinstallprompt support): shows manual
//   "Share → Add to Home Screen" instructions instead.
// - Dismissing hides it for 7 days (stored in localStorage).
// ============================================================

import { useState, useEffect } from "react";

const DISMISS_KEY = "ib-install-banner-dismissed-until";
const DISMISS_DAYS = 7;

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    // Already installed — never show.
    if (isStandalone()) return;

    // Respect a recent dismissal.
    let dismissedUntil = 0;
    try {
      dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) || 0);
    } catch (e) {
      /* localStorage unavailable — just proceed */
    }
    if (Date.now() < dismissedUntil) return;

    if (isIos()) {
      // iOS Safari never fires beforeinstallprompt, so show the
      // manual-instructions version right away.
      setVisible(true);
      return;
    }

    function handleBeforeInstallPrompt(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    }

    function handleAppInstalled() {
      setVisible(false);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(DISMISS_KEY, String(until));
    } catch (e) {
      /* ignore — worst case it shows again next visit */
    }
  }

  async function handleInstallClick() {
    if (isIos()) {
      setShowIosHelp(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="ink-install-banner">
      {!showIosHelp ? (
        <>
          <span className="ink-install-banner-text">
            📲 Install the Inked Betties app for faster ordering
          </span>
          <div className="ink-install-banner-actions">
            <button
              type="button"
              className="ink-install-banner-button"
              onClick={handleInstallClick}
            >
              Install
            </button>
            <button
              type="button"
              className="ink-install-banner-dismiss"
              onClick={dismiss}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </>
      ) : (
        <>
          <span className="ink-install-banner-text">
            To install: tap the Share icon, then "Add to Home Screen".
          </span>
          <div className="ink-install-banner-actions">
            <button
              type="button"
              className="ink-install-banner-dismiss"
              onClick={dismiss}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * edYOUcate Notification Management System
 * Fetches and displays:
 * 1. Navbar Announcement (content/navbar-announcement.json) - displayed ABOVE main navbar
 * 2. Popup Notification (content/popup-notification.json) - modal popup with countdown & notice link
 */

(function () {
  "use strict";

  // Category visual styles & icons
  const CATEGORY_MAP = {
    Admission: {
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      iconClass: "fa-graduation-cap",
    },
    Exam: {
      badgeClass: "bg-red-50 text-brand-red border-red-200",
      iconClass: "fa-file-lines",
    },
    TMA: {
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
      iconClass: "fa-book-open",
    },
    Practical: {
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      iconClass: "fa-flask",
    },
    PCP: {
      badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
      iconClass: "fa-chalkboard-user",
    },
    Result: {
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconClass: "fa-award",
    },
  };

  let countdownInterval = null;
  let activePopupTitle = "";

  // Base directory for reliable relative fetch across Live Server / root / subpath
  function getBaseContentUrl(filename) {
    const p = window.location.pathname;
    const dir = p.substring(0, p.lastIndexOf("/") + 1);
    return dir + "content/" + filename + "?_t=" + Date.now();
  }

  /**
   * Safely validate and sanitize a URL string
   */
  function sanitizeUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") return null;
    const trimmed = rawUrl.trim();
    if (!trimmed) return null;

    // Disallow dangerous URI schemes
    if (/^(javascript|data|vbscript):/i.test(trimmed)) {
      return null;
    }

    // Allow in-page anchor or relative paths
    if (trimmed.startsWith("#") || trimmed.startsWith("/")) {
      return trimmed;
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.href;
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  /**
   * Format a date string into readable text (e.g. "20 Nov 2026")
   */
  function formatDate(dateStr) {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return "";
    }
  }

  /**
   * 1. NAVBAR ANNOUNCEMENT
   */
    async function loadAnnouncement() {
      const bar = document.getElementById("announcement-bar");
      const textEl = document.getElementById("announcement-text");
      const btnEl = document.getElementById("announcement-btn");
      const btnTextEl = document.getElementById("announcement-btn-text");
      const closeBtn = document.getElementById("announcement-close-btn");
      const siteHeader = document.getElementById("site-header");

      if (!bar || !textEl) return;

        try {
          const url = getBaseContentUrl("navbar-announcement.json");
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) {
            bar.style.display = "none";
            return;
          }

          const data = await res.json();

          // Check display toggle and non-empty message
          if (!data || data.display !== true || !data.message || !data.message.trim()) {
            bar.style.display = "none";
            return;
          }

          // Populate text
          textEl.textContent = data.message.trim();

            // Configure button if enabled and valid URL exists
            const validUrl = sanitizeUrl(data.button_url);
            if (data.display_button === true && validUrl && data.button_text?.trim() && btnEl && btnTextEl) {
              btnEl.href = validUrl;
              btnTextEl.textContent = data.button_text.trim();

            if (validUrl.startsWith("http://") || validUrl.startsWith("https://")) {
              btnEl.target = "_blank";
              btnEl.rel = "noopener noreferrer";
            } else {
              btnEl.removeAttribute("target");
              btnEl.removeAttribute("rel");
            }
            btnEl.style.display = "inline-flex";
          } else if (btnEl) {
            btnEl.style.display = "none";
          }

          // Close button handler (dismisses the bar for current view)
          if (closeBtn) {
            closeBtn.onclick = function () {
              bar.style.display = "none";
              if (siteHeader) {
                document.documentElement.style.scrollPaddingTop =
                  siteHeader.offsetHeight + 15 + "px";
              }
          };
        }

      // Show announcement bar above navbar
      bar.style.display = "block";

        // Dynamically adjust scroll padding for in-page anchors
        if (siteHeader) {
          document.documentElement.style.scrollPaddingTop =
            siteHeader.offsetHeight + 15 + "px";
        }
      } catch (err) {
        console.warn("edYOUcate: announcement fetch failed:", err);
        bar.style.display = "none";
      }
    }

    /**
     * 2. POPUP NOTIFICATION
     */
      async function loadPopup() {
        const modal = document.getElementById("notification-modal");
        const titleEl = document.getElementById("popup-title");
        const descEl = document.getElementById("popup-description");
        const catBadge = document.getElementById("popup-category-badge");
        const dateContainer = document.getElementById("popup-date");
        const dateText = document.getElementById("popup-date-text");
        const officialBtn = document.getElementById("popup-official-btn");
        const officialBtnText = document.getElementById("popup-official-btn-text");
        const closeBtn = document.getElementById("popup-close-btn");
        const dismissBtn = document.getElementById("popup-dismiss-btn");

        if (!modal || !titleEl) return;

          try {
            const url = getBaseContentUrl("popup-notification.json");
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) {
              closePopupModal();
              return;
            }

            const data = await res.json();

            // Check display toggle and required title
            if (!data || data.display !== true || !data.title || !data.title.trim()) {
              closePopupModal();
              return;
            }

            activePopupTitle = data.title.trim();

            // Set Title
            titleEl.textContent = activePopupTitle;

            // Set Short Description
            if (data.short_description && data.short_description.trim()) {
              descEl.textContent = data.short_description.trim();
              descEl.style.display = "block";
            } else {
              descEl.textContent = "";
              descEl.style.display = "none";
            }

            // Category badge styling & icon
            const catName = data.category || "Admission";
            const catConfig = CATEGORY_MAP[catName] || {
              badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
              iconClass: "fa-bullhorn",
            };

            if (catBadge) {
              catBadge.className =
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border " +
                catConfig.badgeClass;
              catBadge.innerHTML = `<i class="fa-solid ${catConfig.iconClass} text-[11px]"></i><span>${catName}</span>`;
            }

            // Published Date
            const formattedDate = formatDate(data.published_date);
            if (dateContainer && dateText) {
              if (formattedDate) {
                dateText.textContent = formattedDate;
                dateContainer.style.display = "flex";
              } else {
                dateContainer.style.display = "none";
              }
            }

            // Official Notice Button (Only if enabled and URL valid)
            const validNoticeUrl = sanitizeUrl(data.official_notice_url);
            if (data.display_official_notice_button === true && validNoticeUrl && officialBtn && officialBtnText) {
              officialBtn.href = validNoticeUrl;
              officialBtn.target = "_blank";
              officialBtn.rel = "noopener noreferrer";
              officialBtnText.textContent =
                data.official_notice_button_text?.trim() || "View Official Notice";
              officialBtn.style.display = "inline-flex";
            } else if (officialBtn) {
              officialBtn.style.display = "none";
            }

            // Countdown Timer
            setupCountdown(data.enable_countdown === true, data.countdown_deadline);

            // Dismiss Handlers
            function dismissPopup() {
              closePopupModal();
            }

            if (closeBtn) closeBtn.onclick = dismissPopup;
            if (dismissBtn) dismissBtn.onclick = dismissPopup;

            // Close on backdrop click (outside card)
            modal.onclick = function (e) {
              if (e.target === modal) {
                dismissPopup();
              }
            };

            // Close on Escape key
            document.addEventListener("keydown", function (e) {
              if (e.key === "Escape" && modal.style.display === "flex") {
                dismissPopup();
              }
            });

            // Open centered modal smoothly after small delay
            setTimeout(openPopupModal, 400);
          } catch (err) {
            console.warn("edYOUcate: popup notification fetch failed:", err);
            closePopupModal();
          }
        }

    /**
     * Setup and run the countdown timer
     */
    function setupCountdown(isEnabled, deadlineStr) {
      const container = document.getElementById("popup-countdown-container");
      const grid = document.getElementById("popup-countdown-grid");
      const expiredMsg = document.getElementById("popup-countdown-expired");
      const deadlineLabel = document.getElementById("popup-deadline-display");
      const daysEl = document.getElementById("popup-cd-days");
      const hoursEl = document.getElementById("popup-cd-hours");
      const minsEl = document.getElementById("popup-cd-minutes");
      const secsEl = document.getElementById("popup-cd-seconds");

        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }

        if (!container) return;

        if (!isEnabled || !deadlineStr) {
          container.style.display = "none";
          return;
        }

        const deadlineTime = new Date(deadlineStr).getTime();
        if (isNaN(deadlineTime)) {
          container.style.display = "none";
          return;
        }

        // Display formatted deadline label if element exists
        if (deadlineLabel) {
          try {
            const d = new Date(deadlineStr);
            deadlineLabel.textContent = d.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          } catch (e) {
            deadlineLabel.textContent = "";
          }
        }

        container.style.display = "block";

        function renderTimer() {
          const now = new Date().getTime();
          const distance = deadlineTime - now;

            // When deadline has passed
            if (distance <= 0) {
              if (grid) grid.style.display = "none";
              if (expiredMsg) expiredMsg.style.display = "flex";
              if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null;
              }
              return;
            }

            // When countdown is active
            if (grid) grid.style.display = "grid";
            if (expiredMsg) expiredMsg.style.display = "none";

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
            if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
            if (minsEl) minsEl.textContent = String(minutes).padStart(2, "0");
            if (secsEl) secsEl.textContent = String(seconds).padStart(2, "0");
          }

        // Run first tick immediately to avoid flicker
        renderTimer();

        // Only start interval if deadline is in the future
        if (deadlineTime > new Date().getTime()) {
          countdownInterval = setInterval(renderTimer, 1000);
        }
      }

    function openPopupModal() {
      const modal = document.getElementById("notification-modal");
      const card = document.getElementById("notification-modal-card");
      if (!modal || !card) return;

        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";

        // Trigger reflow so transition works
        void modal.offsetWidth;

        modal.style.opacity = "1";
        card.style.transform = "scale(1)";

        // Lock background scroll only while modal is open
        document.body.style.overflow = "hidden";
      }

    function closePopupModal() {
      const modal = document.getElementById("notification-modal");
      const card = document.getElementById("notification-modal-card");
      if (!modal) return;

        modal.style.opacity = "0";
        if (card) card.style.transform = "scale(0.95)";

        // ALWAYS restore scroll immediately
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";

        setTimeout(() => {
          modal.style.display = "none";
          if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
          }
        }, 250);
      }

    // Global helper API for testing and verification
    window.edYOUcateNotifications = {
      openPopup: openPopupModal,
      closePopup: closePopupModal,
      reload: function () {
        document.body.style.overflow = "";
        loadAnnouncement();
        loadPopup();
      },
    };

  // Run on DOM load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      loadAnnouncement();
      loadPopup();
    });
  } else {
    loadAnnouncement();
    loadPopup();
  }
})();

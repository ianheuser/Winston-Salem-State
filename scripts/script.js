const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");

const neonScrollSelectors = [
  "h1","h2",".flicker"
].join(",");

// Neon text flickers on once, as soon as it first enters the viewport.
const neonTargets = document.querySelectorAll(neonScrollSelectors);
let neonObserver;
const getNeonViewport = () => ({
  top: window.scrollY,
  bottom: window.scrollY + window.innerHeight,
});
let lastNeonViewport = getNeonViewport();

neonTargets.forEach((target) => {
  target.classList.add("neon-on-scroll");
});

const lightNeonTarget = (target) => {
  target.classList.add("neon-lit");

  if (neonObserver) {
    neonObserver.unobserve(target);
  }
};

// The scroll fallback catches fast scrolls that pass over short neon elements between observer checks.
const revealNeonTargetsInRange = (rangeTop, rangeBottom) => {
  const viewportBuffer = 12;

  neonTargets.forEach((target) => {
    if (target.classList.contains("neon-lit")) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const targetTop = rect.top + window.scrollY;
    const targetBottom = targetTop + rect.height;

    if (targetBottom >= rangeTop - viewportBuffer && targetTop <= rangeBottom + viewportBuffer) {
      lightNeonTarget(target);
    }
  });
};

const checkNeonViewport = () => {
  const currentViewport = getNeonViewport();
  const rangeTop = Math.min(lastNeonViewport.top, currentViewport.top);
  const rangeBottom = Math.max(lastNeonViewport.bottom, currentViewport.bottom);

  revealNeonTargetsInRange(rangeTop, rangeBottom);
  lastNeonViewport = currentViewport;
};

let neonScrollFrame;
const scheduleNeonViewportCheck = () => {
  if (neonScrollFrame) {
    return;
  }

  neonScrollFrame = window.requestAnimationFrame(() => {
    neonScrollFrame = null;
    checkNeonViewport();
  });
};

let neonResizeTimer;
const restartAllNeonFlickers = () => {
  neonTargets.forEach((target) => {
    lightNeonTarget(target);
    target.style.animation = "none";
  });

  // Force the browser to commit the cleared animation before restoring it.
  void document.body.offsetHeight;

  neonTargets.forEach((target) => {
    target.style.animation = "";
  });
};

const scheduleNeonResizeFlicker = () => {
  window.clearTimeout(neonResizeTimer);

  neonResizeTimer = window.setTimeout(() => {
    neonResizeTimer = null;
    window.requestAnimationFrame(restartAllNeonFlickers);
  }, 160);
};

if ("IntersectionObserver" in window) {
  neonObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          lightNeonTarget(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px",
      threshold: 0,
    },
  );

  neonTargets.forEach((target) => neonObserver.observe(target));
} else {
  // Older browsers still get the finished glow, just without the scroll-triggered timing.
  neonTargets.forEach((target) => {
    lightNeonTarget(target);
  });
}

window.addEventListener("scroll", scheduleNeonViewportCheck, { passive: true });
window.addEventListener("resize", scheduleNeonResizeFlicker);
window.addEventListener("orientationchange", scheduleNeonViewportCheck);
window.addEventListener("load", scheduleNeonViewportCheck);
window.addEventListener("pageshow", scheduleNeonViewportCheck);
window.requestAnimationFrame(checkNeonViewport);

// Font, image, and layout shifts can move neon items after the first paint, so recheck when those settle.
if ("fonts" in document) {
  document.fonts.ready.then(scheduleNeonViewportCheck);
}

document.querySelectorAll("img").forEach((image) => {
  if (!image.complete) {
    image.addEventListener("load", scheduleNeonViewportCheck, { once: true });
  }
});
/*
if ("ResizeObserver" in window) {
  const neonLayoutObserver = new ResizeObserver(scheduleNeonViewportCheck);
  neonLayoutObserver.observe(document.body);
}
*/
// Only wire up the mobile menu if the current page includes both menu elements.
if (menuButton && mobileNav) {
  // Keep this breakpoint in sync with the CSS rule that hides the burger menu.
  const mobileBreakpoint = window.matchMedia("(max-width: 980px)");
  const menuAnimationDuration = 380;
  const menuOpenDelay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 260;
  let menuCloseTimer;
  let menuOpenTimer;

  // This keeps the button label, expanded state, and animated menu state in sync.
  const setMenuButtonState = (isOpen) => {
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  };

  // Opening starts from the hidden state, then adds the class on the next frame so CSS can animate it.
  const openMobileMenu = () => {
    window.clearTimeout(menuCloseTimer);
    window.clearTimeout(menuOpenTimer);
    mobileNav.hidden = false;
    mobileNav.classList.remove("is-closing");
    // The body class fades in the page-dimming backdrop behind the mobile dropdown.
    document.body.classList.add("mobile-menu-backdrop-visible");
    setMenuButtonState(true);

    const showOpenMenu = () => {
      if (mobileNav.hidden || menuButton.getAttribute("aria-expanded") !== "true") {
        return;
      }

      mobileNav.classList.add("is-open");
    };

    // Let the backdrop darken first, then slide the dropdown out a beat later.
    menuOpenTimer = window.setTimeout(() => {
      menuOpenTimer = null;
      window.requestAnimationFrame(showOpenMenu);
      window.setTimeout(showOpenMenu, 32);
    }, menuOpenDelay);
  };

  // Closing removes the open class first, then hides the menu after the CSS transition finishes.
  const closeMobileMenu = ({ immediate = false } = {}) => {
    window.clearTimeout(menuCloseTimer);
    window.clearTimeout(menuOpenTimer);
    setMenuButtonState(false);
    mobileNav.classList.remove("is-open");
    // Removing the backdrop class lets the dimmed page fade back to normal as the menu closes.
    document.body.classList.remove("mobile-menu-backdrop-visible");

    if (immediate || mobileNav.hidden) {
      mobileNav.classList.remove("is-closing");
      mobileNav.hidden = true;
      return;
    }

    mobileNav.classList.add("is-closing");
    menuCloseTimer = window.setTimeout(() => {
      mobileNav.classList.remove("is-closing");
      mobileNav.hidden = true;
    }, menuAnimationDuration);
  };

  // Start every page load from a closed menu, even if the browser restores old state.
  const resetMobileMenu = () => {
    window.clearTimeout(menuOpenTimer);
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
    mobileNav.classList.remove("is-open", "is-closing");
    document.body.classList.remove("mobile-menu-backdrop-visible");
    mobileNav.hidden = true;
  };

  // Toggle the dropdown when the burger button is tapped.
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";

    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Close the menu after choosing a link so the page content is visible again.
  mobileNav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      closeMobileMenu();
    }
  });

  // Close the mobile menu when the user clicks back into the page outside the dropdown.
  document.addEventListener("click", (event) => {
    if (mobileNav.hidden) {
      return;
    }

    const clickedElement = event.target;

    if (mobileNav.contains(clickedElement) || menuButton.contains(clickedElement)) {
      return;
    }

    closeMobileMenu();
  });

  // If the viewport grows past mobile size, close the menu because the burger disappears.
  mobileBreakpoint.addEventListener("change", (event) => {
    if (!event.matches) {
      closeMobileMenu({ immediate: true });
    }
  });

  // Any window resize can move the dropdown out of alignment, so close it and let the user reopen cleanly.
  window.addEventListener("resize", () => {
    if (!mobileNav.hidden) {
      closeMobileMenu({ immediate: !mobileBreakpoint.matches });
    }
  });

  resetMobileMenu();
}

// Demo form behavior: prevent a page reload and show a simple confirmation message.
document.querySelectorAll(".lead-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Each form can provide its own success message through a data attribute.
    const status = form.querySelector(".form-status");
    const message = form.dataset.successMessage || "Thanks. We will be in touch soon.";

    if (status) {
      status.textContent = message;
    }

    // Clear the fields after a successful mock submission.
    form.reset();
  });
});

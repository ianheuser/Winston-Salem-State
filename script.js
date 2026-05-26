const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");

// Only wire up the mobile menu if the current page includes both menu elements.
if (menuButton && mobileNav) {
  // Keep this breakpoint in sync with the CSS rule that hides the burger menu.
  const mobileBreakpoint = window.matchMedia("(max-width: 980px)");

  // Shared close helper keeps the visual state and accessibility state together.
  const closeMobileMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    mobileNav.hidden = true;
  };

  // Toggle the dropdown when the burger button is tapped.
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    mobileNav.hidden = isOpen;
  });

  // Close the menu after choosing a link so the page content is visible again.
  mobileNav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      closeMobileMenu();
    }
  });

  // If the viewport grows past mobile size, close the menu because the burger disappears.
  mobileBreakpoint.addEventListener("change", (event) => {
    if (!event.matches) {
      closeMobileMenu();
    }
  });
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

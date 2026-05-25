const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");

if (menuButton && mobileNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    mobileNav.hidden = isOpen;
  });

  mobileNav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      menuButton.setAttribute("aria-expanded", "false");
      mobileNav.hidden = true;
    }
  });
}

document.querySelectorAll(".lead-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const status = form.querySelector(".form-status");
    const message = form.dataset.successMessage || "Thanks. We will be in touch soon.";

    if (status) {
      status.textContent = message;
    }

    form.reset();
  });
});

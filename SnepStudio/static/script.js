/**
 * SnepStudio Client-side JavaScript
 * Mobile Navigation, Validation, Flash Dismissal, and UI Helpers
 */

document.addEventListener("DOMContentLoaded", () => {
  // Mobile Nav Toggle
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  // Alert dismiss
  const alertCloseBtns = document.querySelectorAll(".alert-close");
  alertCloseBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const alert = btn.closest(".alert");
      if (alert) {
        alert.style.opacity = "0";
        setTimeout(() => alert.remove(), 250);
      }
    });
  });

  // Auto-dismiss alerts after 5 seconds
  setTimeout(() => {
    document.querySelectorAll(".alert").forEach(alert => {
      alert.style.transition = "opacity 0.5s ease";
      alert.style.opacity = "0";
      setTimeout(() => alert.remove(), 500);
    });
  }, 5000);

  // File Upload Size & Type Validation
  const fileInput = document.querySelector('input[type="file"]');
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        // 50 MB limit
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
          alert("Selected file is too large! Maximum allowed size is 50MB.");
          fileInput.value = "";
          return;
        }

        const validExtensions = ["jpg", "jpeg", "png", "webp", "mp4", "mov"];
        const ext = file.name.split(".").pop().toLowerCase();
        if (!validExtensions.includes(ext)) {
          alert("Invalid file format. Please upload JPG, PNG, WEBP, MP4, or MOV.");
          fileInput.value = "";
          return;
        }
      }
    });
  }

  // Generic confirmation for critical actions
  const confirmActions = document.querySelectorAll("[data-confirm]");
  confirmActions.forEach(element => {
    element.addEventListener("click", (e) => {
      const message = element.getAttribute("data-confirm") || "Are you sure you want to proceed?";
      if (!confirm(message)) {
        e.preventDefault();
      }
    });
  });

  // Search input live filtering for tables
  const liveSearch = document.querySelector("#tableSearchInput");
  if (liveSearch) {
    liveSearch.addEventListener("keyup", () => {
      const filter = liveSearch.value.toLowerCase();
      const rows = document.querySelectorAll(".filter-table tbody tr");
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
      });
    });
  }
});

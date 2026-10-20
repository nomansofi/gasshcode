(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const drawer = document.getElementById("mobile-drawer");
  const openBtn = document.getElementById("menu-toggle");
  const closeBtn = document.getElementById("drawer-close");
  const openDrawer = () => {
    if (!drawer) return;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    openBtn?.setAttribute("aria-expanded", "true");
  };
  const closeDrawer = () => {
    if (!drawer) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    openBtn?.setAttribute("aria-expanded", "false");
  };
  openBtn?.addEventListener("click", openDrawer);
  closeBtn?.addEventListener("click", closeDrawer);
  drawer?.addEventListener("click", (e) => {
    if (e.target === drawer) closeDrawer();
  });

  const themeBtn = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("gassh-theme");
  if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);
  themeBtn?.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("gassh-theme", next);
  });

  document.querySelectorAll(".tabs").forEach((tablist) => {
    tablist.addEventListener("click", (e) => {
      const tab = e.target.closest(".tab");
      if (!tab) return;
      const group = tablist.dataset.group;
      tablist.querySelectorAll(".tab").forEach((t) => t.setAttribute("aria-selected", "false"));
      tab.setAttribute("aria-selected", "true");
      document.querySelectorAll(`[data-panel-group="${group}"]`).forEach((panel) => {
        panel.classList.toggle("active", panel.id === tab.getAttribute("aria-controls"));
      });
    });
  });

  const modal = document.getElementById("lead-modal");
  const closeModalBtn = document.getElementById("modal-close");
  const leadCaptured = localStorage.getItem("gassh-lead") === "1";

  function openModal() {
    if (!modal || leadCaptured) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.getElementById("lead-name")?.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  closeModalBtn?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeDrawer();
    }
  });

  document.querySelectorAll("[data-open-lead]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (leadCaptured) return;
      e.preventDefault();
      openModal();
    });
  });

  if (!leadCaptured) {
    window.setTimeout(openModal, 15000);
  }

  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const phoneOk = (v) => /^(\+91[\s-]?)?[6-9]\d{9}$/.test(v.replace(/\s+/g, ""));

  function validateForm(form) {
    let valid = true;
    form.querySelectorAll("[data-validate]").forEach((field) => {
      const type = field.dataset.validate;
      const err = form.querySelector(`[data-error-for="${field.id}"]`);
      let msg = "";
      const value = (field.value || "").trim();
      if (!value) msg = "This field is required.";
      else if (type === "email" && !emailOk(value)) msg = "Enter a valid email address.";
      else if (type === "phone" && !phoneOk(value)) msg = "Enter a valid 10-digit Indian mobile number.";
      if (err) err.textContent = msg;
      if (msg) valid = false;
    });
    return valid;
  }

  /* ---- Where enquiries go ----
     WHATSAPP_NUMBER: every enquiry opens a ready-typed WhatsApp message to this number.
     FORM_ENDPOINT:   Web3Forms. Every enquiry (admission form and free-guide pop-up) is also emailed
                      to you and stored under Submissions in your Web3Forms dashboard. */
  const WHATSAPP_NUMBER = "919622519005";
  const FORM_ENDPOINT = "https://api.web3forms.com/submit";
  const WEB3FORMS_KEY = "f5a277eb-7300-4082-8f8b-4e11ad8082ea"; // public key, safe in client code

  function collect(form) {
    const get = (id) => (form.querySelector("#" + id)?.value || "").trim();
    const pick = (a, b) => get(a) || get(b);
    return {
      name: pick("name", "lead-name"),
      phone: pick("phone", "lead-phone"),
      email: pick("email", "lead-email"),
      program: get("program"),
      mode: get("mode"),
      message: get("message"),
      page: location.pathname.split("/").pop() || "index.html",
      time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    };
  }

  function whatsappUrl(d, isLead) {
    const lines = [
      isLead ? "New study-guide request (GasshCode website)" : "New admission enquiry (GasshCode website)",
      "",
      "Name: " + d.name,
      "Phone/WhatsApp: " + d.phone,
      "Email: " + d.email,
    ];
    if (d.program) lines.push("Programme: " + d.program);
    if (d.mode) lines.push("Mode: " + d.mode);
    if (d.message) lines.push("Message: " + d.message);
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
  }

  function saveRemotely(d) {
    if (!FORM_ENDPOINT) return;
    try {
      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: (d.page === "contact.html" ? "New admission enquiry" : "New study-guide request") + " - " + d.name,
          from_name: "GasshCode Website",
          ...d,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch (_) { /* never block the student */ }
  }

  document.querySelectorAll("form[data-validate-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;
      const isLead = form.id === "lead-form";
      const data = collect(form);
      saveRemotely(data);

      const success = form.querySelector(".success-msg");
      success?.classList.add("show");
      form.querySelectorAll("input, select, textarea, button[type='submit']").forEach((el) => {
        if (el.type !== "button") el.disabled = true;
      });

      if (isLead) {
        localStorage.setItem("gassh-lead", "1");
        window.setTimeout(() => {
          closeModal();
          const href = document.querySelector("[data-syllabus-href]")?.getAttribute("href");
          if (href) window.location.href = href;
        }, 900);
      } else {
        // Contact / admission form: hand the details to WhatsApp (opened by the student's own tap).
        const url = whatsappUrl(data, false);
        if (success) success.innerHTML = 'Thank you! WhatsApp should open with your details. If it did not, <a href="' + url + '" target="_blank" rel="noopener noreferrer">tap here to send them</a>.';
        window.open(url, "_blank", "noopener");
      }
    });
  });

  /* YouTube click-to-load facade: keeps the page light until someone presses play */
  document.querySelectorAll(".yt-facade").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.ytId;
      if (!id) return;
      const frame = document.createElement("iframe");
      frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      frame.title = "GasshCode demo class";
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      frame.setAttribute("allowfullscreen", "");
      btn.replaceChildren(frame);
      btn.style.cursor = "default";
    }, { once: true });
  });

  /* Gentle reveal on scroll */
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const targets = document.querySelectorAll("main .card, main .pattern-tile, main .stat, main .section-head, main .yt-facade, main .video-grid > div");
    document.documentElement.classList.add("js-reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.08 });
    targets.forEach((el) => { el.classList.add("reveal"); io.observe(el); });
  }
})();

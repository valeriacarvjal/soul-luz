"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const siteNavigation = document.querySelector(".site-nav");
const contactForm = document.querySelector(".contact-form");
const contactStatus = document.querySelector(".contact-form__status");
const whatsappLink = document.querySelector(".contact__whatsapp-link");
const productWhatsAppLinks = document.querySelectorAll(".product-card__image");
const currentYear = document.querySelector("#current-year");

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

if (whatsappLink) {
  const whatsappNumber = (whatsappLink.dataset.whatsappNumber || "").replace(/\D/g, "");

  if (/^\d{8,15}$/.test(whatsappNumber)) {
    const configureWhatsAppLink = (link, message) => {
      link.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.removeAttribute("aria-disabled");
      link.removeAttribute("tabindex");
    };

    configureWhatsAppLink(
      whatsappLink,
      "Hola, me gustaría obtener más información sobre sus velas."
    );

    productWhatsAppLinks.forEach((productLink) => {
      const productName = productLink.closest(".product-card").querySelector("h3").textContent.trim();
      productLink.setAttribute("aria-label", `Consultar ${productName} por WhatsApp`);
      configureWhatsAppLink(
        productLink,
        `Hola, estoy interesada/o en el producto «${productName}». Me gustaría recibir más información.`
      );
    });
  }
}

if (menuToggle && siteNavigation) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
    siteNavigation.classList.toggle("is-open", !isOpen);
  });

  siteNavigation.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menú");
      siteNavigation.classList.remove("is-open");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menú");
      siteNavigation.classList.remove("is-open");
      menuToggle.focus();
    }
  });
}

const revealElements = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element) => revealObserver.observe(element));
}

if (contactForm && contactStatus) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) {
      return;
    }

    const endpoint = contactForm.action;
    const submitButton = contactForm.querySelector('button[type="submit"]');

    if (!/^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(endpoint)) {
      contactStatus.textContent = "Añade el identificador de tu formulario de Formspree para activar el envío.";
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }
    contactForm.setAttribute("aria-busy", "true");
    contactStatus.textContent = "Enviando tu mensaje…";

    let response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" }
      });
    } catch (error) {
      contactStatus.textContent = "No se pudo conectar para enviar el mensaje. Comprueba tu conexión e inténtalo de nuevo.";
      if (submitButton) {
        submitButton.disabled = false;
      }
      contactForm.removeAttribute("aria-busy");
      return;
    }

    if (submitButton) {
      submitButton.disabled = false;
    }
    contactForm.removeAttribute("aria-busy");

    if (!response.ok) {
      contactStatus.textContent = "No se pudo enviar el mensaje. Revisa la configuración del formulario de Formspree e inténtalo de nuevo.";
      return;
    }

    contactForm.reset();
    contactStatus.textContent = "Gracias, tu mensaje se ha enviado correctamente. Te responderemos pronto.";
  });
}

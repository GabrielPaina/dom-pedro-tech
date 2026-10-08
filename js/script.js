// ==========================================
// DOM PEDRO TECH — efeitos visuais
// Carregar no <head>, SEM defer:
//   <script src="js/script.js"></script>
// ==========================================

(function () {
  "use strict";

  const root = document.documentElement;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const canObserve = "IntersectionObserver" in window;

  const finePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  // Só esconde o conteúdo (via CSS) se as animações vão mesmo rodar.
  // Se o JS falhar ou o usuário preferir menos movimento, tudo fica visível.
  const animate = !reduceMotion && canObserve;

  if (animate) {
    root.classList.add("js-ready");
  }

  document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. REVELAÇÃO DAS SEÇÕES AO ROLAR
    // ==========================================

    if (animate) {

      const targets = document.querySelectorAll(
        "section, .svc div, .steps li, .panel, .hero p, .cta, .stage"
      );

      targets.forEach((el) => el.classList.add("reveal"));

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );

      targets.forEach((el) => observer.observe(el));
    }


    // ==========================================
    // 2. PROFUNDIDADE NO LOGO (inclina o .crest)
    // ==========================================

    const stage = document.querySelector(".stage");
    const crest = document.querySelector(".stage .crest");

    if (stage && crest && finePointer && !reduceMotion) {

      stage.addEventListener("mouseenter", () => {
        crest.style.transition = "transform .15s ease";
      });

      stage.addEventListener("mousemove", (event) => {
        const rect = stage.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        crest.style.transform =
          "perspective(900px) rotateY(" + (x * 8) + "deg) rotateX(" + (y * -8) + "deg)";
      });

      stage.addEventListener("mouseleave", () => {
        crest.style.transition = "transform .6s ease";
        crest.style.transform =
          "perspective(900px) rotateY(0deg) rotateX(0deg)";
      });
    }


    // ==========================================
    // 3. BRILHO INTERATIVO NOS SERVIÇOS
    // ==========================================

    if (finePointer) {

      document.querySelectorAll(".svc div").forEach((card) => {

        card.addEventListener("mousemove", (event) => {
          const rect = card.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          card.style.background =
            "radial-gradient(circle at " + x + "px " + y + "px, rgba(47, 209, 183, .12), #0A1424 45%)";
        });

        card.addEventListener("mouseleave", () => {
          card.style.background = "";
        });
      });
    }


    // ==========================================
    // 4. DIGITAÇÃO NO TÍTULO (letra por letra)
    // ==========================================

    const title = document.querySelector(".hero h1");

    if (title && !reduceMotion) {

      // Guarda o texto completo para leitores de tela
      title.setAttribute("aria-label", title.textContent.replace(/\s+/g, " ").trim());

      // Reserva a altura final para a página não "pular" durante a digitação
      title.style.minHeight = title.offsetHeight + "px";

      // Coleta os nós de texto (mantém o <span class="gold"> intacto)
      const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
      const parts = [];

      while (walker.nextNode()) {
        const node = walker.currentNode;
        parts.push({ node: node, text: node.textContent });
        node.textContent = "";
      }

      let partIndex = 0;
      let charIndex = 0;

      const type = () => {
        if (partIndex >= parts.length) {
          return;
        }

        const part = parts[partIndex];
        charIndex++;
        part.node.textContent = part.text.slice(0, charIndex);

        if (charIndex >= part.text.length) {
          partIndex++;
          charIndex = 0;
        }

        setTimeout(type, 45);
      };

      type();
    }


    // ==========================================
    // 5. HEADER COM EFEITO AO ROLAR
    // ==========================================

    const header = document.querySelector("header");

    if (header) {

      let scrolled = null;

      const updateHeader = () => {
        const isScrolled = window.scrollY > 40;

        if (isScrolled === scrolled) {
          return;
        }

        scrolled = isScrolled;

        header.style.background = isScrolled
          ? "rgba(5, 11, 21, .94)"
          : "rgba(5, 11, 21, .82)";

        header.style.boxShadow = isScrolled
          ? "0 10px 40px rgba(0, 0, 0, .25)"
          : "none";
      };

      window.addEventListener("scroll", updateHeader, { passive: true });
      updateHeader();
    }


    // ==========================================
    // 6. LUZ SEGUINDO O MOUSE
    // ==========================================

    if (finePointer && !reduceMotion) {

      const light = document.createElement("div");

      light.setAttribute("aria-hidden", "true");
      light.style.position = "fixed";
      light.style.left = "0";
      light.style.top = "0";
      light.style.width = "220px";
      light.style.height = "220px";
      light.style.borderRadius = "50%";
      light.style.pointerEvents = "none";
      light.style.zIndex = "0";
      light.style.background =
        "radial-gradient(circle, rgba(47,209,183,.08), transparent 70%)";
      light.style.willChange = "transform";

      document.body.appendChild(light);

      let mouseX = 0;
      let mouseY = 0;
      let queued = false;

      document.addEventListener("mousemove", (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;

        if (!queued) {
          queued = true;
          requestAnimationFrame(() => {
            light.style.transform =
              "translate(" + (mouseX - 110) + "px, " + (mouseY - 110) + "px)";
            queued = false;
          });
        }
      });
    }

    // 7. ANO AUTOMÁTICO NO RODAPÉ (sem innerHTML)
    const footerText = document.querySelector("footer span");

    if (footerText) {
      footerText.textContent = footerText.textContent.replace(
        /©\s*\d{4}/,
        "© " + new Date().getFullYear()
      );
    }
    
// ==========================================
// 8. FORMULÁRIO DE CONTATO
// ==========================================

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm && formStatus) {

  contactForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    formStatus.textContent = "Enviando...";

    const formData = new FormData(contactForm);

    const dados = {
      nome: formData.get("nome"),
      email: formData.get("email"),
      mensagem: formData.get("mensagem")
    };

    try {

      const resposta = await fetch("/api/contato", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
      });

      const resultado = await resposta.json();

      if (resultado.sucesso) {

        formStatus.textContent = resultado.mensagem;
        contactForm.reset();

      } else {

        formStatus.textContent =
          "Não foi possível enviar a mensagem.";

      }

    } catch (erro) {

      console.error(erro);

      formStatus.textContent =
        "Erro ao conectar com o servidor.";

    }

  });

}
  });
})();







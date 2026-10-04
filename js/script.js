// ==========================================
// DOM PEDRO TECH
// Efeitos tecnológicos e sofisticados
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // 1. REVELAÇÃO DAS SEÇÕES AO ROLAR
  // ==========================================

  const elements = document.querySelectorAll(
    "section, .svc div, .steps li, .panel, .hero h1, .hero p, .cta, .stage"
  );

  elements.forEach((element) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(30px)";
    element.style.transition =
      "opacity .8s ease, transform .8s ease";
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {

        if (entry.isIntersecting) {

          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";

          observer.unobserve(entry.target);
        }

      });
    },
    {
      threshold: 0.12
    }
  );

  elements.forEach((element) => {
    observer.observe(element);
  });


  // ==========================================
  // 2. EFEITO DE PROFUNDIDADE NO LOGO
  // ==========================================

  const stage = document.querySelector(".stage");

  if (stage) {

    stage.addEventListener("mousemove", (event) => {

      const rect = stage.getBoundingClientRect();

      const x =
        (event.clientX - rect.left) / rect.width - 0.5;

      const y =
        (event.clientY - rect.top) / rect.height - 0.5;

      const rotateY = x * 8;
      const rotateX = y * -8;

      stage.style.transform =
        "perspective(900px) rotateY(" + rotateY + "deg) rotateX(" + rotateX + "deg)";

    });

    stage.addEventListener("mouseleave", () => {

      stage.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";

      stage.style.transition =
        "transform .6s ease";

    });

    stage.addEventListener("mouseenter", () => {

      stage.style.transition =
        "transform .15s ease";

    });

  }


  // ==========================================
  // 3. BRILHO INTERATIVO NOS SERVIÇOS
  // ==========================================

  const cards = document.querySelectorAll(".svc div");

  cards.forEach((card) => {

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


  // ==========================================
  // 4. EFEITO DE DIGITAÇÃO NO TÍTULO
  // ==========================================

  const title = document.querySelector(".hero h1");

  if (title) {

    title.style.opacity = "1";
    title.style.transform = "translateY(0)";

    const originalHTML = title.innerHTML;

    title.innerHTML = "";

    const temporary = document.createElement("span");

    temporary.innerHTML = originalHTML;

    const nodes = Array.from(temporary.childNodes);

    let index = 0;

    function typeTitle() {

      if (index >= nodes.length) {
        return;
      }

      const node = nodes[index];

      title.appendChild(node.cloneNode(true));

      index++;

      setTimeout(typeTitle, 180);
    }

    typeTitle();

  }


  // ==========================================
  // 5. HEADER COM EFEITO AO ROLAR
  // ==========================================

  const header = document.querySelector("header");

  if (header) {

    window.addEventListener("scroll", () => {

      if (window.scrollY > 40) {

        header.style.background =
          "rgba(5, 11, 21, .94)";

        header.style.boxShadow =
          "0 10px 40px rgba(0, 0, 0, .25)";

      } else {

        header.style.background =
          "rgba(5, 11, 21, .82)";

        header.style.boxShadow =
          "none";

      }

    });

  }


  // ==========================================
  // 6. EFEITO DE LUZ SEGUINDO O MOUSE
  // ==========================================

  const light = document.createElement("div");

  light.style.position = "fixed";
  light.style.width = "220px";
  light.style.height = "220px";
  light.style.borderRadius = "50%";
  light.style.pointerEvents = "none";
  light.style.zIndex = "0";
  light.style.background =
    "radial-gradient(circle, rgba(47,209,183,.08), transparent 70%)";
  light.style.transform = "translate(-50%, -50%)";
  light.style.transition = "left .15s ease, top .15s ease";

  if (document.body) {
    document.body.appendChild(light);
  }

  document.addEventListener("mousemove", (event) => {
    light.style.left = event.clientX + "px";
    light.style.top = event.clientY + "px";
  });

  // 7. ANO AUTOMÁTICO NO RODAPÉ
  const footer = document.querySelector("footer");

  if (footer) {
    const year = new Date().getFullYear();
    footer.innerHTML = footer.innerHTML.replace(/©\s*\d{4}/, "© " + year);
  }
});
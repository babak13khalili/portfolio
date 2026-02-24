document.addEventListener("DOMContentLoaded", () => {
  const PAGE_IDS = ["home", "about", "projects", "log", "contact"];

  const projectData = {
    "Data Shredder": {
      title: "Data Shredder",
      description:
        "An interactive installation about digital footprints and the illusion of deletion.",
      body: `
      <div class="p-block p-text">
        <p>Data Shredder is an interactive installation that explores the concept of digital footprints and the illusion of deletion.</p>
      </div>
      <div class="p-block p-media">
        <img src="assets/images/ds1.jpg" loading="lazy">
      </div>
      <div class="p-block p-text">
        <p>By transforming personal archives into abstract patterns, the work questions what remains of our identity in the digital void.</p>
      </div>
    `,
    },
    Disruption: {
      title: "Disruption",
      description:
        "Interactive installation research focused on interruption, behavior, and response.",
      body: `
      <div class="p-block p-media">
        <img src="assets/images/dis1.jpg" loading="lazy">
      </div>
      <div class="p-block p-text">
        <p>Disruption installation details and the artistic process involved in creating this piece.</p>
      </div>
    `,
    },
    "Birthday Projects": {
      title: "Birthday Projects",
      description:
        "A recurring series of yearly experiments tied to specific dates and memories.",
      body: `
      <div class="p-block p-text">
        <p>A collection of annual experiments performed on specific dates.</p>
      </div>
      <div class="p-block p-media">
        <img src="assets/images/bp1.jpg" loading="lazy">
      </div>
    `,
    },
    "Short Moving Images": {
      title: "Short Moving Images",
      description:
        "A motion study series exploring rhythm, texture, and short-form visual narratives.",
      body: `
      <div class="p-block p-text">
        <p>A series of motion design studies exploring rhythm and digital textures.</p>
      </div>
      <div class="p-block p-media">
        <video controls loop muted playsinline>
          <source src="assets/video/v1.mp4" type="video/mp4">
        </video>
      </div>
    `,
    },
  };

  const layoutRoot = document.getElementById("layout-root");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const pages = Array.from(document.querySelectorAll(".page"));
  const aboutImg = document.getElementById("about-img");
  const projectsPage = document.getElementById("projects");
  const projectDetails = document.getElementById("project-details");
  const pTitles = Array.from(document.querySelectorAll(".p-title"));
  const mobileQuery = window.matchMedia("(max-width: 900px)");

  const state = {
    activeSection: PAGE_IDS.includes(window.location.hash.slice(1))
      ? window.location.hash.slice(1)
      : "home",
    activeProject: null,
    isMobile: mobileQuery.matches,
  };

  function setState(patch) {
    Object.assign(state, patch);
    render();
  }

  function isProjectsLayoutActive() {
    if (state.activeSection !== "projects") return false;
    return state.isMobile ? Boolean(state.activeProject) : true;
  }

  function renderNav() {
    navLinks.forEach((btn) => {
      const isActive = btn.dataset.section === state.activeSection;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-current", isActive ? "page" : "false");
    });
  }

  function renderPages() {
    pages.forEach((page) => {
      page.classList.toggle("active", page.id === state.activeSection);
    });
  }

  function renderSidebar() {
    aboutImg.classList.toggle("visible", state.activeSection === "about");

    const hasProject = Boolean(state.activeProject && projectData[state.activeProject]);

    projectDetails.classList.toggle("visible", hasProject);
    projectsPage.classList.toggle(
      "project-open",
      state.isMobile && state.activeSection === "projects" && hasProject,
    );
    layoutRoot.classList.toggle("projects-active", isProjectsLayoutActive());

    if (!hasProject) {
      projectDetails.innerHTML = "";
      return;
    }

    const content = projectData[state.activeProject];
    if (state.isMobile) {
      projectDetails.innerHTML = `
        <div class="project-detail-shell">
          <button class="project-back txt-nav" data-project-back type="button">Back</button>
          <h2 class="project-detail-title txt-h1">${content.title}</h2>
          <p class="project-detail-description txt-body">${content.description}</p>
          <div class="project-detail-layout">${content.body}</div>
        </div>
      `;
    } else {
      projectDetails.innerHTML = `<div class="project-detail-layout">${content.body}</div>`;
    }

    projectDetails.scrollTop = 0;
  }

  function renderProjectsListState() {
    pTitles.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.project === state.activeProject);
    });
  }

  function syncHash() {
    const nextHash = `#${state.activeSection}`;
    if (window.location.hash !== nextHash) {
      history.replaceState(null, "", nextHash);
    }
  }

  function render() {
    renderNav();
    renderPages();
    renderProjectsListState();
    renderSidebar();
    syncHash();
  }

  navLinks.forEach((btn) => {
    btn.addEventListener("click", () => {
      setState({ activeSection: btn.dataset.section, activeProject: null });
    });
  });

  pTitles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextProject =
        state.activeProject === btn.dataset.project ? null : btn.dataset.project;
      setState({ activeSection: "projects", activeProject: nextProject });
    });
  });

  projectDetails.addEventListener("click", (e) => {
    if (e.target.closest("[data-project-back]")) {
      setState({ activeProject: null });
    }
  });

  mobileQuery.addEventListener("change", (e) => {
    setState({ isMobile: e.matches });
  });

  window.addEventListener("hashchange", () => {
    const hashSection = window.location.hash.slice(1);
    if (!PAGE_IDS.includes(hashSection)) return;
    setState({ activeSection: hashSection, activeProject: null });
  });

  render();

  /* -------- Optimized Scratch -------- */
  const canvas = document.getElementById("scratch-canvas");
  const container = document.getElementById("scratch-container");
  if (!canvas || !container) return;

  const ctx = canvas.getContext("2d");

  function initCanvas() {
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "destination-out";
  }

  let isScratching = false;
  let lastPos = null;

  function scratch(x, y) {
    ctx.fillRect(x - 40, y - 5, 80, 15);
  }

  function loop() {
    if (isScratching && lastPos) scratch(lastPos.x, lastPos.y);
    requestAnimationFrame(loop);
  }

  function getCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches[0].clientX;
    const clientY = e.clientY ?? e.touches[0].clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  container.addEventListener("mousemove", (e) => {
    isScratching = true;
    lastPos = getCoords(e);
  });

  container.addEventListener("mouseleave", () => {
    isScratching = false;
  });

  container.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      isScratching = true;
      lastPos = getCoords(e);
    },
    { passive: false },
  );

  window.addEventListener("resize", initCanvas);
  initCanvas();
  loop();
});

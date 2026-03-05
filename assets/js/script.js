// ============================================================
//  BABAK KHALILI — Main Script
//  Reads from content/manifest.js and builds the UI dynamically.
//  To add content, edit content/manifest.js only.
// ============================================================

import { reflections, projects } from "../../content/manifest.js";

// ── Scratch Canvas ──────────────────────────────────────────
// (keep your existing scratch canvas code here, untouched)
// ── End Scratch Canvas ─────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const layoutRoot     = document.getElementById("layout-root");
  const navLinks       = document.querySelectorAll(".nav-link");
  const pages          = document.querySelectorAll(".page");
  const aboutImg       = document.getElementById("about-img");
  const projectDetails = document.getElementById("project-details");

  const state = {
    activeSection:   "home",
    activeProject:   null,
    activeReflection: null,
  };

  // ── Build lists from manifest ─────────────────────────────

  const reflectionContainer = document.querySelector(".reflection-container");
  if (reflectionContainer) {
    reflectionContainer.innerHTML = reflections
      .map(
        (r) => `
        <article class="reflection-item">
          <time class="txt-tiny">${r.displayDate}</time>
          <button
            class="reflection-title txt-h3"
            data-id="${r.id}"
            data-file="${r.file}"
            data-title="${r.title}"
            data-date="${r.displayDate}"
            data-meta="${r.meta ?? ""}">
            ${r.title}
          </button>
        </article>`
      )
      .join("");
  }

  const projectList = document.querySelector(".project-list");
  if (projectList) {
    projectList.innerHTML = projects
      .map(
        (p) => `
        <li>
          <button
            class="p-title txt-h2"
            data-id="${p.id}"
            data-file="${p.file}"
            data-title="${p.title}">
            ${p.title}
          </button>
        </li>`
      )
      .join("");
  }

  // ── State & render ────────────────────────────────────────

  function setState(patch) {
    Object.assign(state, patch);
    render();
  }

  function render() {
    pages.forEach((page) => {
      page.classList.toggle("active", page.id === state.activeSection);
    });
    navLinks.forEach((btn) => {
      btn.classList.toggle(
        "active",
        btn.dataset.section === state.activeSection
      );
    });
    if (aboutImg) {
      aboutImg.classList.toggle("visible", state.activeSection === "about");
    }
  }

  // ── Navigation ────────────────────────────────────────────

  navLinks.forEach((btn) => {
    btn.addEventListener("click", () => {
      closeDetail();
      setState({
        activeSection:    btn.dataset.section,
        activeProject:    null,
        activeReflection: null,
      });
    });
  });

  // ── Open detail (shared by projects + reflections) ────────

  async function openDetail({ file, title, date, meta, type, sidebarMedia = [] }) {
    if (!projectDetails) return;

    // Show loading state
    projectDetails.innerHTML = `<p class="txt-tiny">Loading…</p>`;
    projectDetails.classList.add("visible");

    let markdown;
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(res.statusText);
      markdown = await res.text();
    } catch {
      projectDetails.innerHTML = `<p class="txt-tiny">Could not load "${file}".</p>`;
      return;
    }

    marked.setOptions({ breaks: true, gfm: true });
    const html = marked.parse(markdown);

    const backSection = type === "project" ? "projects" : "reflections";
    const bodyClass   = type === "reflection" ? "reflection-body" : "project-detail-description";

    projectDetails.innerHTML = `
      <div class="project-detail-shell">
        <button class="project-back txt-tiny" data-back="${backSection}">← Back</button>
        <div class="project-detail-layout">
          ${date ? `<p class="txt-tiny">${date}</p>` : ""}
          <h1 class="project-detail-title">${title}</h1>
          <div class="${bodyClass}">${html}</div>
          ${meta ? `<p class="txt-tiny">${meta}</p>` : ""}
        </div>
      </div>
    `;

    // Sidebar media for projects
    if (sidebarMedia.length) {
      projectDetails.innerHTML += sidebarMedia
        .map(
          (m) => `
          <figure class="p-block p-media">
            <img src="${m.src}" alt="${m.alt ?? ""}">
            ${m.caption ? `<figcaption class="p-media-caption">${m.caption}</figcaption>` : ""}
          </figure>`
        )
        .join("");
    }

    // Back button handler
    projectDetails
      .querySelector(".project-back")
      ?.addEventListener("click", (e) => {
        const section = e.currentTarget.dataset.back;
        closeDetail();
        setState({
          activeSection:    section,
          activeProject:    null,
          activeReflection: null,
        });
      });

    if (type === "project") {
      layoutRoot?.classList.add("projects-active");
      document.getElementById("projects")?.classList.add("project-open");
    } else {
      document.getElementById("reflections")?.classList.add("reflection-open");
    }
  }

  function closeDetail() {
    if (projectDetails) {
      projectDetails.innerHTML = "";
      projectDetails.classList.remove("visible");
    }
    layoutRoot?.classList.remove("projects-active");
    document.getElementById("projects")?.classList.remove("project-open");
    document.getElementById("reflections")?.classList.remove("reflection-open");
  }

  // ── Projects (delegated click) ────────────────────────────

  document.querySelector(".project-list")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".p-title");
    if (!btn) return;

    const project = projects.find((p) => p.id === btn.dataset.id);

    openDetail({
      file:         btn.dataset.file,
      title:        btn.dataset.title,
      type:         "project",
      sidebarMedia: project?.sidebarMedia ?? [],
    });

    setState({ activeSection: "projects", activeProject: btn.dataset.id });
  });

  // ── Reflections (delegated click) ────────────────────────

  document.querySelector(".reflection-container")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".reflection-title");
    if (!btn) return;

    openDetail({
      file:  btn.dataset.file,
      title: btn.dataset.title,
      date:  btn.dataset.date,
      meta:  btn.dataset.meta,
      type:  "reflection",
    });

    setState({ activeSection: "reflections", activeReflection: btn.dataset.id });
  });

  render();
});

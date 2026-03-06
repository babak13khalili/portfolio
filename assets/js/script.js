// ============================================================
//  BABAK KHALILI — Main Script
//  Content is driven by content/manifest.js (window.SITE_MANIFEST).
//  To add content, only edit that file + add a .md file.
// ============================================================

// ── Scratch Canvas ───────────────────────────────────────────
(function initScratch() {
  const canvas = document.getElementById("scratch-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let painting = false;

  function resize() {
    const container = canvas.parentElement;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  }

  function scratch(e) {
    if (!painting) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 32, 0, Math.PI * 2);
    ctx.fill();
  }

  canvas.addEventListener("mousedown", function (e) {
    painting = true;
    scratch(e);
  });
  canvas.addEventListener("mousemove", scratch);
  canvas.addEventListener("mouseup", function () {
    painting = false;
  });
  canvas.addEventListener("mouseleave", function () {
    painting = false;
  });
  canvas.addEventListener(
    "touchstart",
    function (e) {
      painting = true;
      scratch(e);
    },
    { passive: false },
  );
  canvas.addEventListener("touchmove", scratch, { passive: false });
  canvas.addEventListener("touchend", function () {
    painting = false;
  });

  window.addEventListener("resize", resize);
  resize();
})();

// ── Main App ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  var manifest = window.SITE_MANIFEST || { reflections: [], projects: [] };
  var reflections = manifest.reflections;
  var projects = manifest.projects;

  var layoutRoot = document.getElementById("layout-root");
  var navLinks = document.querySelectorAll(".nav-link");
  var pages = document.querySelectorAll(".page");
  var aboutImg = document.getElementById("about-img");
  var projectDetails = document.getElementById("project-details");

  var state = {
    activeSection: "home",
    activeProject: null,
    activeReflection: null,
  };

  // ── Build lists from manifest ───────────────────────────────

  var reflectionContainer = document.querySelector(".reflection-container");
  if (reflectionContainer) {
    reflectionContainer.innerHTML = reflections
      .map(function (r) {
        return (
          '<article class="reflection-item">' +
          '<time class="txt-tiny">' +
          r.displayDate +
          "</time>" +
          '<button class="reflection-title txt-h3"' +
          ' data-id="' +
          r.id +
          '"' +
          ' data-file="' +
          r.file +
          '"' +
          ' data-title="' +
          r.title +
          '"' +
          ' data-date="' +
          r.displayDate +
          '"' +
          ' data-meta="' +
          (r.meta || "") +
          '">' +
          r.title +
          "</button>" +
          "</article>"
        );
      })
      .join("");
  }

  var projectList = document.querySelector(".project-list");
  if (projectList) {
    projectList.innerHTML = projects
      .map(function (p) {
        return (
          "<li>" +
          '<button class="p-title txt-h2"' +
          ' data-id="' +
          p.id +
          '"' +
          ' data-file="' +
          p.file +
          '"' +
          ' data-title="' +
          p.title +
          '">' +
          p.title +
          "</button>" +
          "</li>"
        );
      })
      .join("");
  }

  // ── State & render ──────────────────────────────────────────

  function setState(patch) {
    Object.assign(state, patch);
    render();
  }

  function render() {
    pages.forEach(function (page) {
      page.classList.toggle("active", page.id === state.activeSection);
    });
    navLinks.forEach(function (btn) {
      btn.classList.toggle(
        "active",
        btn.dataset.section === state.activeSection,
      );
    });
    if (aboutImg) {
      aboutImg.classList.toggle("visible", state.activeSection === "about");
    }
  }

  // ── Navigation ──────────────────────────────────────────────

  navLinks.forEach(function (btn) {
    btn.addEventListener("click", function () {
      closeDetail();
      setState({
        activeSection: btn.dataset.section,
        activeProject: null,
        activeReflection: null,
      });
    });
  });

  // ── Back button HTML helper ─────────────────────────────────
  // btn-back is a self-contained component — use it anywhere by
  // passing the data-back target section name.

  function backButtonHTML(section) {
    return (
      '<button class="btn-back txt-tiny" data-back="' +
      section +
      '">' +
      '<span class="btn-back-arrow" aria-hidden="true">&larr;</span>' +
      '<span class="btn-back-label">Back</span>' +
      "</button>"
    );
  }

  function normalizeHeadingText(value) {
    return (value || "").trim().replace(/\s+/g, " ").toLowerCase();
  }

  function stripDuplicateTopHeading(markdown, title) {
    if (!markdown) return markdown;

    var lines = markdown.replace(/^\uFEFF/, "").split(/\r?\n/);
    var i = 0;

    while (i < lines.length && lines[i].trim() === "") i++;
    if (i >= lines.length) return markdown;

    var normalizedTitle = normalizeHeadingText(title);
    var firstLine = lines[i];
    var atxMatch = firstLine.match(/^#\s+(.+?)\s*#*\s*$/);

    if (atxMatch && normalizeHeadingText(atxMatch[1]) === normalizedTitle) {
      lines.splice(i, 1);
      if (i < lines.length && lines[i].trim() === "") lines.splice(i, 1);
      return lines.join("\n");
    }

    if (
      i + 1 < lines.length &&
      /^[-=]{3,}\s*$/.test(lines[i + 1]) &&
      normalizeHeadingText(firstLine) === normalizedTitle
    ) {
      lines.splice(i, 2);
      if (i < lines.length && lines[i].trim() === "") lines.splice(i, 1);
      return lines.join("\n");
    }

    return markdown;
  }

  // ── Open detail (projects + reflections) ────────────────────

  function openDetail(opts) {
    if (!projectDetails) return;

    projectDetails.innerHTML = '<p class="txt-tiny">Loading…</p>';
    projectDetails.classList.add("visible");

    fetch(opts.file)
      .then(function (res) {
        if (!res.ok) throw new Error(res.statusText);
        return res.text();
      })
      .then(function (markdown) {
        markdown = stripDuplicateTopHeading(markdown, opts.title);
        var html = marked.parse(markdown, { breaks: true, gfm: true });
        var backSection = opts.type === "project" ? "projects" : "reflections";
        var bodyClass =
          opts.type === "reflection"
            ? "reflection-body"
            : "project-detail-description";

        var mediaHtml = "";
        if (opts.sidebarMedia && opts.sidebarMedia.length) {
          mediaHtml = opts.sidebarMedia
            .map(function (m) {
              return (
                '<figure class="p-block p-media">' +
                '<img src="' +
                m.src +
                '" alt="' +
                (m.alt || "") +
                '">' +
                (m.caption
                  ? '<figcaption class="p-media-caption">' +
                    m.caption +
                    "</figcaption>"
                  : "") +
                "</figure>"
              );
            })
            .join("");
        }

        projectDetails.innerHTML =
          '<div class="project-detail-shell">' +
          backButtonHTML(backSection) +
          '<div class="project-detail-layout">' +
          (opts.date ? '<p class="txt-tiny">' + opts.date + "</p>" : "") +
          '<h1 class="project-detail-title">' +
          opts.title +
          "</h1>" +
          '<div class="' +
          bodyClass +
          '">' +
          html +
          "</div>" +
          (opts.meta ? '<p class="txt-tiny">' + opts.meta + "</p>" : "") +
          "</div>" +
          "</div>" +
          mediaHtml;

        // Attach back button click
        var backBtn = projectDetails.querySelector(".btn-back");
        if (backBtn) {
          backBtn.addEventListener("click", function () {
            var section = backBtn.dataset.back;
            closeDetail();
            setState({
              activeSection: section,
              activeProject: null,
              activeReflection: null,
            });
          });
        }

        if (opts.type === "project") {
          if (layoutRoot) layoutRoot.classList.add("projects-active");
          var pSection = document.getElementById("projects");
          if (pSection) pSection.classList.add("project-open");
        } else {
          var rSection = document.getElementById("reflections");
          if (rSection) rSection.classList.add("reflection-open");
        }
      })
      .catch(function (err) {
        var detail = err && err.message ? " (" + err.message + ")" : "";
        projectDetails.innerHTML =
          '<p class="txt-tiny">Could not load "' +
          opts.file +
          '"' +
          detail +
          ".</p>";
        console.error("Detail load failed:", opts.file, err);
      });
  }

  function closeDetail() {
    if (projectDetails) {
      projectDetails.innerHTML = "";
      projectDetails.classList.remove("visible");
    }
    if (layoutRoot) layoutRoot.classList.remove("projects-active");
    var pSection = document.getElementById("projects");
    if (pSection) pSection.classList.remove("project-open");
    var rSection = document.getElementById("reflections");
    if (rSection) rSection.classList.remove("reflection-open");
  }

  // ── Project clicks (delegated) ──────────────────────────────

  if (projectList) {
    projectList.addEventListener("click", function (e) {
      var btn = e.target.closest(".p-title");
      if (!btn) return;
      var project = projects.find(function (p) {
        return p.id === btn.dataset.id;
      });
      openDetail({
        file: btn.dataset.file,
        title: btn.dataset.title,
        type: "project",
        sidebarMedia: project ? project.sidebarMedia : [],
      });
      setState({ activeSection: "projects", activeProject: btn.dataset.id });
    });
  }

  // ── Reflection clicks (delegated) ───────────────────────────

  if (reflectionContainer) {
    reflectionContainer.addEventListener("click", function (e) {
      var btn = e.target.closest(".reflection-title");
      if (!btn) return;
      openDetail({
        file: btn.dataset.file,
        title: btn.dataset.title,
        date: btn.dataset.date,
        meta: btn.dataset.meta,
        type: "reflection",
      });
      setState({
        activeSection: "reflections",
        activeReflection: btn.dataset.id,
      });
    });
  }

  render();
});

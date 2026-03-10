// ============================================================
//  BABAK KHALILI — Main Script
//  Content is driven by content/manifest.js (window.SITE_MANIFEST).
//  To add content, only edit that file + add a .md file.
// ============================================================

// ── Cursor FX ────────────────────────────────────────────────
(function initCursorFX() {
  var cursor = document.getElementById("cursor-square");
  if (!cursor) return;

  if (
    window.matchMedia &&
    window.matchMedia("(pointer: coarse)").matches
  ) {
    return;
  }

  document.documentElement.classList.add("cursor-fx-enabled");

  function moveCursor(x, y) {
    cursor.style.transform =
      "translate(" + (x - 4) + "px," + (y - 4) + "px)";
  }

  document.addEventListener("pointermove", function (e) {
    moveCursor(e.clientX, e.clientY);
  });

  document.addEventListener("pointerdown", function (e) {
    moveCursor(e.clientX, e.clientY);
  });
})();

// ── Text Glitch FX ───────────────────────────────────────────
(function initTextGlitchFX() {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  var selector = [
    ".nav-link",
    ".p-title",
    ".reflection-title",
    ".txt-h1",
    ".txt-sub",
    ".project-detail-title",
    ".project-detail-description h2",
    ".project-detail-description h3",
    ".reflection-body h1",
    ".reflection-body h2",
    ".reflection-body h3",
    ".contact-links a",
  ].join(", ");

  var pulsing = false;
  var pointerRaf = null;
  var pendingPointerTarget = null;
  var displacementRaf = null;
  var pendingDisplacementTarget = null;
  var activeDisplacementTarget = null;

  function triggerGlitch(el, duration) {
    if (!el) return;

    var now = performance.now();
    var cooldown = Number(el.dataset.glitchCooldown || 0);
    if (cooldown > now) return;

    el.dataset.glitchCooldown = String(now + 90);
    clearTimeout(el._glitchTimer);
    el.classList.add("glitch-trigger");
    el._glitchTimer = setTimeout(function () {
      el.classList.remove("glitch-trigger");
    }, duration || 140);
  }

  function setDisplacement(el, clientX, clientY) {
    if (!el) return;

    var rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    var relX = (clientX - rect.left) / rect.width;
    var relY = (clientY - rect.top) / rect.height;
    var offsetX = (relX - 0.5) * 6;
    var offsetY = (relY - 0.5) * 4;

    el.style.setProperty("--cursor-dx", offsetX.toFixed(2) + "px");
    el.style.setProperty("--cursor-dy", offsetY.toFixed(2) + "px");
    el.classList.add("glitch-displace");
    activeDisplacementTarget = el;
  }

  function clearDisplacement(el) {
    if (!el) return;
    el.style.setProperty("--cursor-dx", "0px");
    el.style.setProperty("--cursor-dy", "0px");
    el.classList.remove("glitch-displace");
    if (activeDisplacementTarget === el) activeDisplacementTarget = null;
  }

  function buildMasks(text) {
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < 5; i++) {
      var mask = document.createElement("span");
      var inner = document.createElement("span");
      mask.className = "glitch-mask";
      inner.textContent = text;
      mask.appendChild(inner);
      fragment.appendChild(mask);
    }

    return fragment;
  }

  function enhanceElement(el) {
    if (!el || el.dataset.glitchReady === "1") return;

    var text = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) return;

    el.dataset.glitchReady = "1";
    el.dataset.text = text;
    el.classList.add("glitch-text");

    var label = document.createElement("span");
    label.className = "glitch-label";
    label.textContent = text;

    el.textContent = "";
    el.appendChild(label);
    el.appendChild(buildMasks(text));
  }

  function collect() {
    Array.prototype.slice
      .call(document.querySelectorAll(selector))
      .forEach(enhanceElement);
  }

  function pulseRandomElement() {
    if (pulsing) return;

    var items = Array.prototype.slice.call(document.querySelectorAll(".glitch-text"));
    if (!items.length) return;

    var target = items[Math.floor(Math.random() * items.length)];
    pulsing = true;
    triggerGlitch(target, 180);

    setTimeout(function () {
      pulsing = false;
    }, 220);
  }

  document.addEventListener("content:changed", collect);
  document.addEventListener("DOMContentLoaded", collect);
  document.addEventListener("pointermove", function (e) {
    pendingPointerTarget = e.target.closest(".glitch-text");
    if (pointerRaf) return;

    pointerRaf = requestAnimationFrame(function () {
      pointerRaf = null;
      if (!pendingPointerTarget) return;
      triggerGlitch(pendingPointerTarget, 120);
      pendingPointerTarget = null;
    });

    pendingDisplacementTarget = {
      el: e.target.closest(".glitch-text"),
      x: e.clientX,
      y: e.clientY,
    };
    if (displacementRaf) return;

    displacementRaf = requestAnimationFrame(function () {
      displacementRaf = null;

      if (!pendingDisplacementTarget || !pendingDisplacementTarget.el) {
        if (activeDisplacementTarget) clearDisplacement(activeDisplacementTarget);
        pendingDisplacementTarget = null;
        return;
      }

      if (
        activeDisplacementTarget &&
        activeDisplacementTarget !== pendingDisplacementTarget.el
      ) {
        clearDisplacement(activeDisplacementTarget);
      }

      setDisplacement(
        pendingDisplacementTarget.el,
        pendingDisplacementTarget.x,
        pendingDisplacementTarget.y,
      );
      pendingDisplacementTarget = null;
    });
  });
  document.addEventListener("pointerleave", function () {
    if (activeDisplacementTarget) clearDisplacement(activeDisplacementTarget);
  });
  collect();
  setInterval(pulseRandomElement, 1800);
})();

// ── Main App ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  var manifest = window.SITE_MANIFEST || { reflections: [], projects: [] };
  var reflections = Array.isArray(manifest.reflections)
    ? manifest.reflections
    : [];
  var projects = Array.isArray(manifest.projects) ? manifest.projects : [];

  var layoutRoot = document.getElementById("layout-root");
  var navLinks = document.querySelectorAll(".nav-link");
  var pages = document.querySelectorAll(".page");
  var aboutImg = document.getElementById("about-img");
  var projectDetails = document.getElementById("project-details");

  var reflectionContainer = document.querySelector(".reflection-container");
  var projectList = document.querySelector(".project-list");
  var projectsSection = document.getElementById("projects");
  var reflectionsSection = document.getElementById("reflections");

  var state = {
    activeSection: "home",
    activeProject: null,
    activeReflection: null,
  };

  var markdownCache = Object.create(null);

  // ── Build lists from manifest ───────────────────────────────
  if (reflectionContainer) {
    reflectionContainer.innerHTML = reflections
      .map(function (r) {
        return (
          '<article class="reflection-item">' +
          '<time class="txt-tiny">' +
          r.displayDate +
          "</time>" +
          '<button class="reflection-title txt-h3" type="button"' +
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

  if (projectList) {
    projectList.innerHTML = projects
      .map(function (p) {
        return (
          "<li>" +
          '<button class="p-title txt-h2" type="button"' +
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

  // ── Shared UI helpers ───────────────────────────────────────
  function backButtonHTML(section) {
    return (
      '<button class="btn-back txt-tiny" data-back="' +
      section +
      '" type="button">' +
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

  function fetchMarkdown(file) {
    var cached = markdownCache[file];

    if (typeof cached === "string") return Promise.resolve(cached);
    if (cached && typeof cached.then === "function") return cached;

    var request = fetch(file).then(function (res) {
      if (!res.ok) throw new Error(res.statusText);
      return res.text();
    });

    markdownCache[file] = request
      .then(function (text) {
        markdownCache[file] = text;
        return text;
      })
      .catch(function (err) {
        delete markdownCache[file];
        throw err;
      });

    return markdownCache[file];
  }

  function warmMarkdownCache() {
    var files = reflections
      .concat(projects)
      .map(function (item) {
        return item.file;
      })
      .filter(Boolean)
      .filter(function (file, index, list) {
        return list.indexOf(file) === index;
      });

    files.forEach(function (file, index) {
      var delay = index * 120;

      setTimeout(function () {
        fetchMarkdown(file).catch(function () {
          /* no-op */
        });
      }, delay);
    });
  }

  function renderSidebarMedia(items) {
    if (!items || !items.length) return "";

    return items
      .map(function (item) {
        if (item.type === "video") {
          return (
            '<figure class="p-block p-media">' +
            '<video controls playsinline preload="metadata"' +
            (item.poster ? ' poster="' + item.poster + '"' : "") +
            ">" +
            '<source src="' +
            item.src +
            '" type="video/mp4">' +
            "</video>" +
            (item.caption
              ? '<figcaption class="p-media-caption">' +
                item.caption +
                "</figcaption>"
              : "") +
            "</figure>"
          );
        }

        return (
          '<figure class="p-block p-media">' +
          '<img src="' +
          item.src +
          '" alt="' +
          (item.alt || "") +
          '">' +
          (item.caption
            ? '<figcaption class="p-media-caption">' +
              item.caption +
              "</figcaption>"
            : "") +
          "</figure>"
        );
      })
      .join("");
  }

  function openDetail(opts) {
    if (!projectDetails) return;

    projectDetails.innerHTML = '<p class="txt-tiny">Loading…</p>';
    projectDetails.classList.add("visible");

    fetchMarkdown(opts.file)
      .then(function (markdown) {
        markdown = stripDuplicateTopHeading(markdown, opts.title);
        var html = marked.parse(markdown, { breaks: true, gfm: true });

        var backSection = opts.type === "project" ? "projects" : "reflections";
        var bodyClass =
          opts.type === "reflection"
            ? "reflection-body"
            : "project-detail-description";

        var mediaHtml = renderSidebarMedia(opts.sidebarMedia);

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

        if (opts.type === "project") {
          if (layoutRoot) layoutRoot.classList.add("projects-active");
          if (projectsSection) projectsSection.classList.add("project-open");
        } else {
          if (reflectionsSection) {
            reflectionsSection.classList.add("reflection-open");
          }
        }

        document.dispatchEvent(new Event("content:changed"));
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
    if (projectList) {
      projectList.querySelectorAll(".p-title").forEach(function (btn) {
        btn.classList.remove("active");
      });
    }

    if (reflectionContainer) {
      reflectionContainer
        .querySelectorAll(".reflection-title")
        .forEach(function (btn) {
          btn.classList.remove("active");
        });
    }

    if (projectDetails) {
      projectDetails.innerHTML = "";
      projectDetails.classList.remove("visible");
    }

    if (layoutRoot) layoutRoot.classList.remove("projects-active");
    if (projectsSection) projectsSection.classList.remove("project-open");
    if (reflectionsSection) {
      reflectionsSection.classList.remove("reflection-open");
    }

    document.dispatchEvent(new Event("content:changed"));
  }

  // ── Project clicks (delegated) ──────────────────────────────
  if (projectList) {
    projectList.addEventListener("click", function (e) {
      var btn = e.target.closest(".p-title");
      if (!btn) return;

      projectList.querySelectorAll(".p-title").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");

      var project = projects.find(function (p) {
        return p.id === btn.dataset.id;
      });

      openDetail({
        file: btn.dataset.file,
        title: btn.dataset.title,
        type: "project",
        sidebarMedia: project ? project.sidebarMedia : [],
      });

      setState({
        activeSection: "projects",
        activeProject: btn.dataset.id,
        activeReflection: null,
      });
    });
  }

  // ── Reflection clicks (delegated) ───────────────────────────
  if (reflectionContainer) {
    reflectionContainer.addEventListener("click", function (e) {
      var btn = e.target.closest(".reflection-title");
      if (!btn) return;

      reflectionContainer
        .querySelectorAll(".reflection-title")
        .forEach(function (b) {
          b.classList.remove("active");
        });
      btn.classList.add("active");

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
        activeProject: null,
      });
    });
  }

  // ── Back button (delegated) ─────────────────────────────────
  if (projectDetails) {
    projectDetails.addEventListener("click", function (e) {
      var backBtn = e.target.closest(".btn-back");
      if (!backBtn) return;

      var section = backBtn.dataset.back || "projects";
      closeDetail();

      setState({
        activeSection: section,
        activeProject: null,
        activeReflection: null,
      });
    });
  }

  document.dispatchEvent(new Event("content:changed"));
  warmMarkdownCache();
  render();
});

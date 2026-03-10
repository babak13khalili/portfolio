// ============================================================
//  BABAK KHALILI — Main Script
//  Content is driven by content/manifest.js (window.SITE_MANIFEST).
//  To add content, only edit that file + add a .md file.
// ============================================================

// ── Cursor FX ────────────────────────────────────────────────
(function initCursorFX() {
  var cursor = document.getElementById("cursor-square");
  if (!cursor) return;

  document.documentElement.classList.add("cursor-fx-enabled");

  var idleTimer = null;
  var rafId = null;
  var pointerX = -1000;
  var pointerY = -1000;
  var radius = 12;
  var targets = [];

  var textRootSelector = [
    "main p",
    "main h1",
    "main h2",
    "main h3",
    "main li",
    "main a",
    "main button",
    "main time",
    "#project-details p",
    "#project-details h1",
    "#project-details h2",
    "#project-details h3",
    "#project-details li",
    "#project-details figcaption",
  ].join(", ");

  function wrapTextFragments(root) {
    if (!root || root.dataset.cursorGlitchWrapped === "1") return;

    var nodes = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        var parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest(".cursor-glitch-frag")) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    });

    var current;
    while ((current = walker.nextNode())) {
      nodes.push(current);
    }

    nodes.forEach(function (node) {
      var text = node.nodeValue;
      var frag = document.createDocumentFragment();

      Array.from(text).forEach(function (part) {
        if (/\s/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          var span = document.createElement("span");
          span.className = "cursor-glitch-frag";
          span.textContent = part;
          frag.appendChild(span);
        }
      });

      node.parentNode.replaceChild(frag, node);
    });

    root.dataset.cursorGlitchWrapped = "1";
  }

  function clearTarget(el) {
    el.classList.remove("cursor-glitch-active");
    el.style.removeProperty("--glitch-x");
    el.style.removeProperty("--glitch-y");
    el.style.removeProperty("--glitch-rgb");
    el.style.removeProperty("--glitch-amt");
    el.style.removeProperty("--glitch-skew");
    el.style.removeProperty("--glitch-rot");
  }

  function collectTargets() {
    targets.forEach(clearTarget);

    Array.prototype.slice
      .call(document.querySelectorAll(textRootSelector))
      .filter(function (root) {
        return !root.closest("#home");
      })
      .forEach(function (root) {
        wrapTextFragments(root);
      });

    targets = Array.prototype.slice
      .call(document.querySelectorAll(".cursor-glitch-frag"))
      .filter(function (el) {
        return !el.closest("#home");
      });
  }

  function distanceToRect(x, y, rect) {
    var dx = Math.max(rect.left - x, 0, x - rect.right);
    var dy = Math.max(rect.top - y, 0, y - rect.bottom);
    return Math.sqrt(dx * dx + dy * dy);
  }

  function isVisible(el) {
    var rect = el.getBoundingClientRect();
    return (
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.left < window.innerWidth &&
      rect.top < window.innerHeight
    );
  }

  function applyTarget(el, strength) {
    var jitterX = (Math.random() - 0.5) * 14 * strength;
    var jitterY = (Math.random() - 0.5) * 10 * strength;
    var rgb = 0.75 + strength * 1.8;
    var amt = 1.2 + strength * 1.1;
    var skew = (Math.random() - 0.5) * 12 * strength;
    var rot = (Math.random() - 0.5) * 6 * strength;

    el.classList.add("cursor-glitch-active");
    el.style.setProperty("--glitch-x", jitterX.toFixed(2) + "px");
    el.style.setProperty("--glitch-y", jitterY.toFixed(2) + "px");
    el.style.setProperty("--glitch-rgb", rgb.toFixed(2) + "px");
    el.style.setProperty("--glitch-amt", amt.toFixed(2));
    el.style.setProperty("--glitch-skew", skew.toFixed(2) + "deg");
    el.style.setProperty("--glitch-rot", rot.toFixed(2) + "deg");
  }

  function nearestTargets(maxCount) {
    var scored = [];

    targets.forEach(function (el) {
      if (!isVisible(el)) return;

      var rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      var dist = distanceToRect(pointerX, pointerY, rect);
      if (dist > radius) {
        clearTarget(el);
        return;
      }

      scored.push({ el: el, dist: dist });
    });

    scored.sort(function (a, b) {
      return a.dist - b.dist;
    });

    return scored.slice(0, maxCount);
  }

  function clearGlitch() {
    targets.forEach(clearTarget);
  }

  function renderGlitch() {
    rafId = null;

    var active = nearestTargets(8);
    active.forEach(function (item) {
      var t = 1 - item.dist / radius;
      applyTarget(item.el, t);
    });
  }

  function setIdle() {
    clearGlitch();

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function queueRender() {
    if (rafId) return;
    rafId = requestAnimationFrame(renderGlitch);
  }

  function updatePointer(x, y) {
    pointerX = x;
    pointerY = y;
    cursor.style.transform =
      "translate(" + (pointerX - 4) + "px," + (pointerY - 4) + "px)";
    queueRender();

    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(setIdle, 95);
  }

  document.addEventListener("pointermove", function (e) {
    updatePointer(e.clientX, e.clientY);
  });

  document.addEventListener("pointerdown", function (e) {
    updatePointer(e.clientX, e.clientY);
  });

  document.addEventListener("touchmove", function (e) {
    if (!e.touches || !e.touches.length) return;
    updatePointer(e.touches[0].clientX, e.touches[0].clientY);
  });

  document.addEventListener("mouseleave", setIdle);
  document.addEventListener("pointerup", setIdle);
  document.addEventListener("pointercancel", setIdle);
  document.addEventListener("content:changed", collectTargets);

  collectTargets();
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

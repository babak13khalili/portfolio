// ============================================================
//  BABAK KHALILI — Main Script
//  Content is driven by content/manifest.js (window.SITE_MANIFEST).
//  To add content, only edit that file + add a .md file.
// ============================================================

// ── Cursor FX ────────────────────────────────────────────────
(function initCursorFX() {
  var cursor = document.getElementById("cursor-square");
  if (!cursor) return;

  var isCoarse =
    window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  document.documentElement.classList.add("cursor-fx-enabled");

  function moveCursor(x, y) {
    cursor.style.transform =
      "translate(" + (x - 5) + "px," + (y - 5) + "px)";
  }

  function hideCursor() {
    cursor.style.transform = "translate(-100px, -100px)";
  }

  document.addEventListener("pointermove", function (e) {
    moveCursor(e.clientX, e.clientY);
  });

  document.addEventListener("pointerdown", function (e) {
    moveCursor(e.clientX, e.clientY);
  });

  if (isCoarse) {
    document.addEventListener("pointerup", function (e) {
      if (e.pointerType === "touch") hideCursor();
    });
    document.addEventListener("pointercancel", function (e) {
      if (e.pointerType === "touch") hideCursor();
    });
  }
})();

// ── Home Reticle FX ──────────────────────────────────────────
(function initHomeReticle() {
  var wrap = document.querySelector(".home-reticle");
  if (!wrap) return;

  var isCoarse =
    window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  var square = wrap.querySelector(".reticle-square");
  var coords = wrap.querySelector(".reticle-coords");
  var lineTL = wrap.querySelector('.reticle-line[data-corner="tl"]');
  var lineTR = wrap.querySelector('.reticle-line[data-corner="tr"]');
  var lineBL = wrap.querySelector('.reticle-line[data-corner="bl"]');
  var lineBR = wrap.querySelector('.reticle-line[data-corner="br"]');

  var raf = null;
  var pending = null;

  function squareSize() {
    var base = Math.min(window.innerWidth, window.innerHeight);
    return Math.max(19, Math.min(42, base * 0.0294));
  }

  function update(x, y) {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var size = squareSize();
    var sx = x - size / 2;
    var sy = y - size / 2;

    square.setAttribute("x", sx);
    square.setAttribute("y", sy);
    square.setAttribute("width", size);
    square.setAttribute("height", size);

    lineTL.setAttribute("x1", 0);
    lineTL.setAttribute("y1", 0);
    lineTL.setAttribute("x2", sx);
    lineTL.setAttribute("y2", sy);

    lineTR.setAttribute("x1", w);
    lineTR.setAttribute("y1", 0);
    lineTR.setAttribute("x2", sx + size);
    lineTR.setAttribute("y2", sy);

    lineBL.setAttribute("x1", 0);
    lineBL.setAttribute("y1", h);
    lineBL.setAttribute("x2", sx);
    lineBL.setAttribute("y2", sy + size);

    lineBR.setAttribute("x1", w);
    lineBR.setAttribute("y1", h);
    lineBR.setAttribute("x2", sx + size);
    lineBR.setAttribute("y2", sy + size);

    coords.style.transform =
      "translate(" + (sx + size + 10) + "px," + (sy + size + 6) + "px)";
    coords.textContent = Math.round(x) + "," + Math.round(y);
  }

  document.addEventListener("pointermove", function (e) {
    pending = { x: e.clientX, y: e.clientY };
    if (raf) return;

    raf = requestAnimationFrame(function () {
      raf = null;
      if (pending) update(pending.x, pending.y);
    });
  });

  if (isCoarse) {
    wrap.classList.add("reticle-touch");

    document.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "touch") return;
      update(e.clientX, e.clientY);
      wrap.classList.add("reticle-visible");
    });

    document.addEventListener("pointerup", function (e) {
      if (e.pointerType === "touch") wrap.classList.remove("reticle-visible");
    });

    document.addEventListener("pointercancel", function (e) {
      if (e.pointerType === "touch") wrap.classList.remove("reticle-visible");
    });
  } else {
    update(window.innerWidth / 2, window.innerHeight / 2);
  }
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
    ".txt-h1",
    ".txt-sub",
    ".project-detail-description h2",
    ".project-detail-description h3",
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
  var manifest = window.SITE_MANIFEST || { projects: [] };
  var projects = Array.isArray(manifest.projects) ? manifest.projects : [];

  var navLinks = document.querySelectorAll(".nav-link");
  var pages = document.querySelectorAll(".page");
  var aboutImg = document.getElementById("about-img");
  var projectList = document.querySelector(".project-list");

  // ── Landmark rail ────────────────────────────────────────────
  // Brackets mark content anchors. Drawn into a single <svg> shared by the
  // whole page (see CSS): the line paints first/below, the brackets paint
  // second/above.
  //   .landmark-chain — a group of sections chained together in DOM order
  //                      (About's photo + each CV section) — every member
  //                      gets its own opening bracket as the line passes
  //                      through it, and only the last member's own bottom
  //                      gets the closing (mirrored) bracket.
  //   .landmark-span  — a self-contained block (currently just the contact
  //                      block). Gets an opening bracket, a line down its
  //                      own height, and its own closing bracket —
  //                      independent of every other span/chain on the page.
  //   .landmark-point — a project list item. Closed: a lone opening
  //                      bracket, no line — titles aren't connected to
  //                      each other. Open: its drawer has expanded inline
  //                      (pushing later items down), so the <li> is treated
  //                      as a self-contained span — bracket at the title,
  //                      line down through the drawer, closing bracket at
  //                      its end.
  function measureCssLength(varName) {
    var probe = document.createElement("div");
    probe.style.cssText =
      "position:absolute;visibility:hidden;height:var(" + varName + ");";
    document.body.appendChild(probe);
    var px = probe.getBoundingClientRect().height;
    document.body.removeChild(probe);
    return px;
  }

  var landmarkSizePx, landmarkGapYPx, landmarkGapXPx, pageMarginPx;

  function measureLandmarkMetrics() {
    landmarkSizePx = measureCssLength("--landmark-size");
    landmarkGapYPx = measureCssLength("--landmark-gap-y");
    landmarkGapXPx = measureCssLength("--landmark-gap-x");
    pageMarginPx = measureCssLength("--page-margin");
  }

  measureLandmarkMetrics();

  function updateLandmarkRails() {
    var rail = document.querySelector(".landmark-rail");
    var linePath = rail ? rail.querySelector(".landmark-line") : null;
    var bracketsPath = rail ? rail.querySelector(".landmark-brackets") : null;
    var rootEl = rail ? rail.parentElement : null;
    var referenceEl = document.querySelector(".content-center");
    if (!rail || !linePath || !bracketsPath || !rootEl || !referenceEl) {
      return;
    }

    var rootRect = rootEl.getBoundingClientRect();
    var lineX = referenceEl.getBoundingClientRect().left - rootRect.left;
    var bracketRightX = lineX + pageMarginPx - landmarkGapXPx;
    var bracketLeftX = bracketRightX - landmarkSizePx;
    var halfSize = landmarkSizePx / 2;

    var lineD = "";
    var bracketsD = "";
    var firstBracketY = null;

    function isVisible(el) {
      return el.offsetParent !== null;
    }

    function centerOf(el) {
      var r = el.getBoundingClientRect();
      return r.top - rootRect.top - landmarkGapYPx + halfSize;
    }

    function bottomOf(el) {
      var r = el.getBoundingClientRect();
      return r.bottom - rootRect.top;
    }

    function drawOpeningBracket(y) {
      if (firstBracketY === null || y < firstBracketY) firstBracketY = y;
      bracketsD +=
        " M " + bracketRightX + " " + (y - halfSize) +
        " L " + bracketLeftX + " " + (y - halfSize) +
        " L " + bracketLeftX + " " + (y + halfSize);
    }

    function drawClosingBracket(y) {
      bracketsD +=
        " M " + bracketLeftX + " " + (y - halfSize) +
        " L " + bracketLeftX + " " + (y + halfSize) +
        " L " + bracketRightX + " " + (y + halfSize);
    }

    function drawSpan(elements) {
      var startY = centerOf(elements[0]);
      var endY = bottomOf(elements[elements.length - 1]) - halfSize;

      lineD +=
        " M " + lineX + " " + startY +
        " L " + bracketLeftX + " " + startY +
        " M " + lineX + " " + startY;
      drawOpeningBracket(startY);

      lineD += " L " + lineX + " " + endY + " L " + bracketLeftX + " " + endY;
      drawClosingBracket(endY);
    }

    function drawChain(elements) {
      var centers = elements.map(centerOf);
      var endY = bottomOf(elements[elements.length - 1]) - halfSize;

      lineD += " M " + lineX + " " + centers[0];
      centers.forEach(function (y) {
        lineD +=
          " L " + lineX + " " + y +
          " L " + bracketLeftX + " " + y +
          " M " + lineX + " " + y;
        drawOpeningBracket(y);
      });

      lineD += " L " + lineX + " " + endY + " L " + bracketLeftX + " " + endY;
      drawClosingBracket(endY);
    }

    // Chained sections (e.g. About's photo + CV sections): one continuous
    // line through every member, each getting its own opening bracket.
    var chainMembers = Array.prototype.filter.call(
      document.querySelectorAll(".landmark-chain"),
      isVisible,
    );
    if (chainMembers.length) drawChain(chainMembers);

    // Independent self-contained sections.
    Array.prototype.forEach.call(
      document.querySelectorAll(".landmark-span"),
      function (el) {
        if (isVisible(el)) drawSpan([el]);
      },
    );

    // Project list items: a closed item is a lone bracket (no line); an
    // open one is self-contained (its own <li> now includes the expanded
    // drawer, so it's treated the same as a single-element span).
    if (projectList) {
      Array.prototype.forEach.call(
        projectList.querySelectorAll(".landmark-point"),
        function (li) {
          if (!isVisible(li)) return;
          if (li === openLi) {
            drawSpan([li]);
          } else {
            drawOpeningBracket(centerOf(li));
          }
        },
      );
    }

    // Connect the active nav item down to the first bracket on this page.
    var activeNavBtn = document.querySelector(".navbar button.active");
    if (activeNavBtn && firstBracketY !== null) {
      var navRect = activeNavBtn.getBoundingClientRect();
      var navX = navRect.left + navRect.width / 2 - rootRect.left;
      var navY = navRect.bottom - rootRect.top;
      lineD +=
        " M " + navX + " " + navY +
        " L " + bracketLeftX + " " + (firstBracketY - halfSize);
    }

    linePath.setAttribute("d", lineD.trim());
    bracketsPath.setAttribute("d", bracketsD.trim());
  }

  document.addEventListener("content:changed", updateLandmarkRails);

  var landmarkResizeRaf = null;
  window.addEventListener("resize", function () {
    if (landmarkResizeRaf) return;
    landmarkResizeRaf = requestAnimationFrame(function () {
      landmarkResizeRaf = null;
      measureLandmarkMetrics();
      updateLandmarkRails();
    });
  });

  var aboutImgEl = aboutImg ? aboutImg.querySelector("img") : null;
  if (aboutImgEl) {
    aboutImgEl.addEventListener("load", updateLandmarkRails);
  }

  var state = {
    activeSection: "home",
  };

  var markdownCache = Object.create(null);

  // ── Build lists from manifest ───────────────────────────────
  // Each item is a drawer: .p-row holds the title (left) and close button
  // (right edge of the column); .p-drawer is empty until opened, then
  // expands in place, pushing later items down — see openDetail/closeDetail.
  if (projectList) {
    projectList.innerHTML = projects
      .map(function (p) {
        return (
          '<li class="landmark-point">' +
          '<div class="p-row">' +
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
          '<button class="p-close" type="button" aria-label="Close project">' +
          "&times;" +
          "</button>" +
          "</div>" +
          '<div class="p-drawer"></div>' +
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

    updateLandmarkRails();
  }

  // ── Navigation ──────────────────────────────────────────────
  navLinks.forEach(function (btn) {
    btn.addEventListener("click", function () {
      closeDetail();
      setState({ activeSection: btn.dataset.section });
    });
  });

  // ── Shared UI helpers ───────────────────────────────────────
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
    var files = projects
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

  function mediaCaptionHTML(caption) {
    return caption
      ? '<figcaption class="p-media-caption">' + caption + "</figcaption>"
      : "";
  }

  function renderSidebarMedia(items) {
    if (!items || !items.length) return "";

    return items
      .map(function (item) {
        var inner =
          item.type === "video"
            ? '<video controls playsinline preload="metadata"' +
              (item.poster ? ' poster="' + item.poster + '"' : "") +
              '><source src="' +
              item.src +
              '" type="video/mp4"></video>'
            : '<img src="' + item.src + '" alt="' + (item.alt || "") + '">';

        return (
          '<figure class="p-block p-media">' +
          inner +
          mediaCaptionHTML(item.caption) +
          "</figure>"
        );
      })
      .join("");
  }

  // Bumped on every open/close so a slow, superseded fetch can't clobber
  // whatever the user has since navigated to (rapid project switching).
  var detailRequestId = 0;

  // The single currently-open <li>, if any — drawers are exclusive, opening
  // one always closes whichever was open before.
  var openLi = null;

  function openDetail(li, opts) {
    var drawer = li.querySelector(".p-drawer");
    if (!drawer) return;

    var requestId = ++detailRequestId;

    drawer.classList.add("open");
    drawer.innerHTML = '<p class="txt-tiny">Loading…</p>';

    fetchMarkdown(opts.file)
      .then(function (markdown) {
        if (requestId !== detailRequestId) return;

        markdown = stripDuplicateTopHeading(markdown, opts.title);
        var html = marked.parse(markdown, { breaks: true, gfm: true });

        var mediaHtml = renderSidebarMedia(opts.sidebarMedia);

        drawer.innerHTML =
          '<div class="project-detail-shell">' +
          '<div class="project-detail-layout">' +
          (opts.date ? '<p class="txt-tiny">' + opts.date + "</p>" : "") +
          '<div class="project-detail-description">' +
          html +
          "</div>" +
          (opts.meta ? '<p class="txt-tiny">' + opts.meta + "</p>" : "") +
          "</div>" +
          "</div>" +
          mediaHtml;

        document.dispatchEvent(new Event("content:changed"));

        // Images/videos load asynchronously after the innerHTML swap above,
        // which changes the drawer's height after the rail has already been
        // measured — recompute once each one settles so brackets land on
        // the final layout instead of the pre-load one.
        var media = drawer.querySelectorAll("img, video");
        Array.prototype.forEach.call(media, function (el) {
          if (el.tagName === "IMG") {
            if (el.complete) return;
            el.addEventListener("load", updateLandmarkRails);
            el.addEventListener("error", updateLandmarkRails);
          } else {
            el.addEventListener("loadedmetadata", updateLandmarkRails);
          }
        });
      })
      .catch(function (err) {
        if (requestId !== detailRequestId) return;

        var detail = err && err.message ? " (" + err.message + ")" : "";
        drawer.innerHTML =
          '<p class="txt-tiny">Could not load "' +
          opts.file +
          '"' +
          detail +
          ".</p>";
        console.error("Detail load failed:", opts.file, err);
      });
  }

  function closeDetail() {
    detailRequestId++;

    if (openLi) {
      var btn = openLi.querySelector(".p-title");
      if (btn) btn.classList.remove("active");

      var drawer = openLi.querySelector(".p-drawer");
      if (drawer) {
        drawer.innerHTML = "";
        drawer.classList.remove("open");
      }

      openLi = null;
    }

    document.dispatchEvent(new Event("content:changed"));
  }

  // ── Project clicks (delegated) ──────────────────────────────
  if (projectList) {
    projectList.addEventListener("click", function (e) {
      if (e.target.closest(".p-close")) {
        closeDetail();
        setState({ activeSection: "projects" });
        return;
      }

      var btn = e.target.closest(".p-title");
      if (!btn) return;

      var li = btn.closest("li");
      var wasOpen = li === openLi;

      closeDetail();

      if (!wasOpen) {
        btn.classList.add("active");
        openLi = li;

        var project = projects.find(function (p) {
          return p.id === btn.dataset.id;
        });

        openDetail(li, {
          file: btn.dataset.file,
          title: btn.dataset.title,
          sidebarMedia: project ? project.sidebarMedia : [],
        });
      }

      setState({ activeSection: "projects" });
    });
  }

  document.dispatchEvent(new Event("content:changed"));
  warmMarkdownCache();
  render();
});

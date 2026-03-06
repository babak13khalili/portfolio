// ============================================================
//  CONTENT MANIFEST — your only editorial interface
//
//  To add a new reflection:
//    1. Create  content/reflections/your-slug.md
//    2. Add one object to the reflections array below
//
//  To add a new project:
//    1. Create  content/projects/your-slug.md
//    2. Add one object to the projects array below
// ============================================================

window.SITE_MANIFEST = {
  reflections: [
    // Most recent first
    {
      id: "perspective-shift",
      title: "Perspective Shift",
      file: "content/reflections/perspective-shift.md",
      displayDate: "9 Feb 26",
      meta: "10:35 — Upsilon, home",
    },

    // ── Add new reflections here ──────────────────────────
    // {
    //   id: "your-slug",
    //   title: "Your Title",
    //   file: "content/reflections/your-slug.md",
    //   displayDate: "5 Mar 26",
    //   meta: "14:00 — location",
    // },
  ],

  projects: [
    {
      id: "data-shredder",
      title: "Data Shredder",
      file: "content/projects/data-shredder.md",
      sidebarMedia: [
        // { src: "assets/images/data-shredder-1.jpg", alt: "Installation view", caption: "" },
      ],
    },
    {
      id: "disruption",
      title: "Disruption",
      file: "content/projects/disruption.md",
      sidebarMedia: [
        // { src: "assets/images/disruption-1.jpg", alt: "Disruption, Tehran 2025" },
      ],
    },

    // ── Add new projects here ─────────────────────────────
    // {
    //   id: "new-project",
    //   title: "New Project",
    //   file: "content/projects/new-project.md",
    //   sidebarMedia: [],
    // },
  ],
};

// ============================================================
//  CONTENT MANIFEST — your only editorial interface
//
//  To add a new project:
//    1. Create  content/projects/your-slug.md
//    2. Add one object to the projects array below
//
//  NOTE: sidebarMedia below is currently filled with placeholder
//  images/videos (assets/images/placeholder-*.svg) so the page layout
//  can be previewed before real photos/video are ready. Swap the src
//  (and poster, for video) for the real files when available, or clear
//  the array back to [] to show no media.
// ============================================================

window.SITE_MANIFEST = {
  projects: [
    {
      id: "date-of-performance",
      title: "Date of Performance",
      file: "content/projects/date-of-performance.md",
      sidebarMedia: [],
    },
    {
      id: "latency-of-memory",
      title: "Latency of Memory",
      file: "content/projects/latency-of-memory.md",
      sidebarMedia: [
        {
          type: "image",
          src: "assets/images/placeholder-16x9.svg",
          alt: "Latency of Memory, installation view",
          caption: "Installation view, 2025.",
        },
      ],
    },
    {
      id: "self-portraits",
      title: "Self Portraits",
      file: "content/projects/self-portraits.md",
      sidebarMedia: [
        {
          type: "image",
          src: "assets/images/placeholder-4x5.svg",
          alt: "Self Portraits, sitting one",
        },
        {
          type: "image",
          src: "assets/images/placeholder-4x5.svg",
          alt: "Self Portraits, sitting two",
          caption: "From the second sitting, 2024.",
        },
      ],
    },
    {
      id: "adam-collective",
      title: "Adam Collective",
      file: "content/projects/adam-collective.md",
      sidebarMedia: [
        {
          type: "image",
          src: "assets/images/placeholder-16x9.svg",
          alt: "Adam Collective, group session",
          caption: "Working session, Groningen.",
        },
      ],
    },
    {
      id: "wanderings",
      title: "Wanderings",
      file: "content/projects/wanderings.md",
      sidebarMedia: [
        {
          type: "image",
          src: "assets/images/placeholder-4x5.svg",
          alt: "Wanderings, still one",
        },
      ],
    },
    {
      id: "motion-design-projects",
      title: "Motion Design Projects",
      file: "content/projects/motion-design-projects.md",
      sidebarMedia: [],
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

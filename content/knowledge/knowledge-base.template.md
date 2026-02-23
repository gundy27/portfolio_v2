<!--
This file is the authoring template for Dan's RAG knowledge base.

How to use:
1) Copy this to `knowledge-base.md`
2) Fill out each section's frontmatter + content
3) Run the ingest script in `portfolio/api` to embed + store it

Frontmatter fields:
- reference (required): Plain-English source label shown in citations.
- image (optional): Local path under `public/` (e.g. /assets/knowledge/foo.png) or a full URL.
- tags (optional): Free-form tags to help filtering later.
-->

---
reference: "Work history: <Company> (<Role>, <Years>)"
image: ""
tags: "work-history"
---
# <Company>

- Role: <Role>
- Timeline: <YYYY–YYYY>
- Scope: <What you owned>

Key outcomes:
- <Outcome 1 (metric if possible)>
- <Outcome 2>

Notable projects:
- <Project A>: <one-liner>
- <Project B>: <one-liner>

---
reference: "Project: <Project name>"
image: "/assets/projects/<slug>/<image>.png"
tags: "project,pricing-packaging"
---
# <Project name>

What it was:
<2–4 sentences>

What I did:
- <bullet>
- <bullet>

Impact:
- <metric>

Nuance / tradeoffs:
- <constraint or decision>

---
reference: "FAQ: What Dan is looking for"
image: ""
tags: "faq"
---
# What I'm looking for

- Roles: <e.g. PM / Senior PM / Group PM>
- Themes: <platform, growth, experimentation, pricing, etc>
- What I enjoy: <...>


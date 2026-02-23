<!--
Dan's knowledge base (seeded into the portfolio chatbot).

Edit this file (or add more files under content/knowledge/), then run:

  cd /Users/dangunderson/dangunderson27/portfolio/api
  poetry run python scripts/ingest_knowledge_base.py --path ../content/knowledge/knowledge-base.md --user-id gundy_io_public

Each `--- frontmatter ---` block becomes its own ingested document, so citations can show the plain-English `reference`.
-->

---

reference: "Work history: DataRobot (PM→Sr PM, 2022–2024)"
image: ""
tags: "work-history"

---

# DataRobot

Replace this entire section with your canonical “work history” narrative for DataRobot.

Include:
- Your role(s) + timeline
- What you owned
- The 3–6 outcomes you want the chatbot to repeat consistently (with metrics where possible)
- A short “how I work” paragraph (your operating principles / approach)

Example (replace with your real details):

- Role: Product Manager → Senior Product Manager
- Timeline: 2022–2024
- Scope: Growth, onboarding, trials, and platform foundations for feature access and self-serve motions

Key outcomes:
- Shipped self-serve trials that reached ~2,400 MAU in CY24 (ahead of plan)
- Built share / invite / registration flows that increased average MAU per org by ~3%
- Delivered a credential management feature that helped grow a strategic customer by 200+ users and became a reusable platform capability
- Built/advocated entitlements management foundations to reduce support burden and enable scalable trials/upsells

How I work:
I focus on tight problem framing, crisp metrics, and shipping in slices. I like building durable platform primitives that unlock multiple growth levers, and I’m comfortable running cross-functional programs (Eng, Design, Support, Security, Analytics).

---

reference: "Project: Entitlements Management"
image: "/assets/projects/entitlements-management/pricing-plans.png"
tags: "project,pricing-packaging,platform"

---

# Entitlements Management

Replace this entire section with your canonical “project narrative” for Entitlements Management.

Keep it structured so the chatbot can answer consistently:

What it was (2–4 sentences):
Describe what entitlements management is in your domain, why it mattered, and what broke before.

Problem / why now:
- What failure modes existed (revenue leakage, wrong access, brittle flags/manual provisioning)?
- What scale/strategy made the existing approach unacceptable?

What I did:
- How you defined the model / schema (customers, phases, features, limits, time-bound access)
- How you aligned stakeholders and handled governance/security
- How you rolled out (trials → demos → paid SKUs)

Impact (quantified if possible):
- Leakage mitigated (rough $), ticket reduction, flags deprecated, # SKUs/prod rollouts

Tradeoffs / nuance:
- What you intentionally did not build
- Where you compromised (time, tech constraints, migration risk)

Example (replace with your real details):
Entitlements management centralized feature access control into an auditable, time-bound system. It replaced a fragile mix of feature flags, hard-coded logic, and manual provisioning so we could safely scale trials, demos, and monetization experiments.

---

reference: "FAQ: What Dan is looking for"
image: ""
tags: "faq"

---

# What I'm looking for

Replace this with your “top-of-funnel” answers so the chatbot is helpful for recruiters/hiring managers.

- Roles: PM / Senior PM / Group PM
- Themes: platform, growth, experimentation, pricing & packaging, lifecycle management
- Industries: (optional)
- What I’m best at: (1–2 sentences)
- What I’m excited about next: (1–2 sentences)

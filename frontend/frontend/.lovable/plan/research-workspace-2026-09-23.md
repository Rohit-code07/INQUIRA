# Research workspace

## What to build
Add a responsive, working `/research` experience in the current editorial research style without changing the landing page's existing layout. Connect the landing page's “Start research” action to this workspace.

The workspace will accept a research question and run a transparent, staged demonstration through Search, Reader, Analyst, Critic, and Writer. Show each stage's pending/working/completed status, progress, an animated but restrained handoff, activity timeline, and inspectable agent output. Present sample sources and evidence with clickable citations, plus a structured report containing findings, evidence, sources, and conclusion. Clearly identify that results are an interactive demonstration rather than a live research service.

## Experience and visual direction
- Reuse existing typography, monochrome tokens, thin rules, sharp editorial framing, and compact uppercase labels.
- Build the workspace as a dedicated responsive page; keep the landing page's content and existing navigation intact apart from the Start research destination.
- Keep the timeline collapsible and each agent's output inspectable. Reveal completed outputs progressively as stages finish.
- Use the existing UI controls and Lucide icons. Use CSS transitions and a restrained active-state pulse while respecting reduced-motion preferences; avoid introducing a new animation dependency.

## Technical details
- Add a standalone `/research` TanStack file route with unique page metadata.
- Keep demonstration data and stage progression modular and isolated from presentation, so mock behavior can later be replaced with a research service.
- Use client event handlers and React state for the local staged demonstration; add no database, credentials, or external API calls.
- Verify the preview renders, the question runs all five stages, agent details/report update, citation links work, and mobile widths do not overflow. Review build diagnostics afterward.

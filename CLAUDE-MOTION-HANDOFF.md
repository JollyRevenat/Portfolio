# Motion handoff for Claude Opus 5.5

Use this prompt after Charles approves the content and static design:

> Refine motion on my personal portfolio in this repository. Read DESIGN-AUDIT.md and inspect the current HTML, styles.css, and script.js first. Preserve the approved content, photography, light/dark colors, responsive layout, navigation semantics, and contact behavior. This is a site about me, not an Academy application microsite.
>
> Existing effects include drifting ambient blobs, canvas snowfall, scroll reveals, CSS view transitions, and hover transforms. Audit these before adding anything. Choose at most one restrained entrance moment if it improves the experience; simplify effects that compete with photos or reading. Do not add a loader, scroll hijacking, cursor effects, or parallax by default.
>
> Make motion progressively enhanced: text, links, and keyboard focus must remain usable if animation initialization fails. A hash-linked project must be visible immediately. Honor reduced-motion changes during a visit, not only on load. Reduced motion should stop continuous decorative animation, disable cross-document view transitions and transforms, and reveal all content. Stop canvas work while the tab is hidden, avoid duplicate animation loops, and check both light and dark appearances. Keep scroll-triggered content visible in print.
>
> Test keyboard navigation, no JavaScript, reduced motion before and after load, direct project anchors, mobile widths from 320px, desktop, and slow loading. Explain what you kept, removed, and changed, and provide a local preview. Do not change biography or project claims, and do not deploy.

No Claude task has been sent. This file is a ready-to-use handoff, not a claim that motion work has been completed.

Hero update: Home now uses `.identity-hero` (nameplate, summit photograph, introduction); About uses `.journal-hero` (heading, introduction, seasonal photographs). Preserve their static reading order and usable content if considering a restrained entrance. No animation was added in this redesign.

Latest direction supersedes the boxed Home layout: full-width photographic Home hero with name over the lower image, open introduction below; About uses static overlapping photographs. Preserve this composition rather than reintroducing cards. Verify text contrast and small-screen overlap before adding motion.

# Charles Blake portfolio design audit

Reviewed October 27, 2026 using [Apple Design Skill](https://github.com/dickwu/apple-design-skill/blob/main/SKILL.md).

The skill is now installed at `C:/Users/chuck/.codex/skills/apple-design/SKILL.md` for future Codex requests. The follow-up pass used the installed instructions plus the previously read foundation references and the entering-data reference.

## Follow-up after installation

The static design now rates **Good** within the tested scope. The personal photography, readable content, and familiar navigation remain the defining elements. Motion and factual review remain separate follow-ups.

- **Critical, fixed — large-text overflow:** At 200% root text size and 320px viewport width, About and Contact overflowed horizontally. `typography.md > Supporting Dynamic Type`: “Make sure your app’s layout adapts to all font sizes.” Added shrink-safe form tracks, wrapping for long headings and credential names, and wrapping button labels. All 28 enlarged-text combinations (seven pages, two widths, two appearances) now pass the overflow checks.
- **Medium, fixed — redundant data entry:** The email-draft form required an email address even though the visitor sends from their own mail app. `entering-data.md > Best practices`: “Get information from the system whenever possible.” Removed the redundant email field, made name optional, labeled the required message, and introduced the form with an accessible heading and instructions. The site does not read or infer the visitor's email address.
- **Medium, fixed — section hierarchy:** Outdoors and Resume used h3 headings for primary content sections. `typography.md > Conveying hierarchy` recommends maintaining hierarchy; HTML heading levels are the web implementation judgment. Changed these to h2 while preserving the intended visual sizes.
- **What works:** Keep the mountain photograph, existing snowflake identity, personal voice, comfortable control sizes, direct contact links, and system light/dark appearance. No additional visual effects are needed for this pass; animation remains reserved for Claude.

## Summary

Initial rating: **Needs work**. The site's purpose is to introduce Charles as a builder, student, athlete, and person. The distinctive element is his own mountain photography, paired with the snowflake identity and ice-blue accent. This is a personal portfolio, not an Academy application landing page.

Scope: the seven current top-level HTML pages, shared CSS/JavaScript, and linked résumé. Archived coursework and the separate `assess`, `ugly`, and `old_porfolio` experiments were not redesigned. The review applies Apple's web-relevant foundations, not native iOS/macOS navigation requirements. References read: accessibility, layout, typography, color, writing, buttons, branding, dark mode, cross-platform translation, and code-audit guidance.

## Findings and changes

### High: Broken and unsupported content

- **What:** The homepage contained duplicated HTML inside a paragraph. The PDF had placeholder contact details and an unconfirmed graduation year. Lacrosse captaincy lacked the junior-year context supplied by Charles.
- **Why:** `writing.md > Getting started`: “Be clear.” Accuracy is also an editorial requirement, independent of HIG.
- **Fix:** Repaired the paragraph, corrected captaincy on About and Resume, rebuilt the one-page PDF with the real contact links and existing project facts. Removed age and season-relative wording rather than guessing updates. Avoided a graduation year in the PDF pending confirmation.

### High: Navigation depends on JavaScript on small screens

- **What:** CSS hid mobile navigation even if its menu script failed to load.
- **Why:** `accessibility.md > Speech`: “Let people use the keyboard alone to navigate and interact with your app.” Progressive enhancement is the web implementation judgment here.
- **Fix:** Navigation remains visible by default. Only the initialized menu gains collapsed behavior. Escape closes an open menu and returns focus to its button; resizing resets its state. Active navigation now has an underline and weight as well as color.

### High: Project work is difficult to discover and verify

- **What:** The homepage linked to general About/contact pages first; project cards offered little evidence beyond descriptions.
- **Why:** `layout.md > Visual hierarchy`: “Order content by relative importance.” Which work belongs first is editorial judgment, not an Apple rule.
- **Fix:** Added selected project links on Home and stable anchors on Projects, retained all six existing projects and personal pages, and moved Projects earlier in navigation. No invented metrics, demo links, contributions, or outcomes. Adding actual project artifacts remains a content opportunity for Charles to decide.

### Medium: Appearance and control boundaries

- **What:** The site only supplied dark colors; form and secondary-button borders were very subdued.
- **Why:** `color.md > Best practices` recommends colors that work in light, dark, and increased contrast contexts; `dark-mode.md > Best practices` recommends respecting the system appearance.
- **Fix:** Added a light palette using the same mountain/ice identity, explicit control-border tokens, increased contrast, and reduced transparency handling. Kept dark appearance for visitors who prefer it.
- **Measured solid-color contrast:** light secondary text `#475a6e` on `#f5f7fa`: **6.62:1**; light caption `#53677b` on white: **5.84:1**; white on primary `#00658c`: **6.48:1**. Dark secondary text `#a9b6c8` on `#0b1322`: **9.03:1**; dark caption `#8391a6` on that surface: **5.81:1**. Control borders on page surfaces: light **3.68:1**, dark **4.33:1**. These are token calculations, not a complete pixel-level audit of translucent backgrounds.

### Medium: Contact action promises more than it does

- **What:** “Send message” only opened a mailto draft; no message was sent by the site.
- **Why:** `buttons.md > Content`: “Ensure that each button clearly communicates its purpose.”
- **Fix:** Renamed the action “Open email draft,” explained the next step, added accessible status feedback, and kept direct contact links available without JavaScript. No delivery success is claimed.

### Medium: Reading hierarchy and adaptation

- **What:** A single display face carried all text; small body text used fixed pixel sizing; Projects skipped directly from h1 to h3.
- **Why:** `typography.md > Conveying hierarchy` recommends weight, size, and color that maintain visual distinction; `layout.md > Adaptability` recommends accommodating text-size changes.
- **Fix:** Preserved Space Grotesk for headings, used system fonts for prose, switched body sizes to rem, added shrink-safe grid columns, repaired project heading hierarchy, and supplied print styles.

## Design plan and craft

Signature: Charles sitting on the summit rock, with surrounding interface kept quiet. Preserve existing personal photos rather than adding unrelated stock imagery or mock project screenshots. The palette is grounded in the existing snowflake and mountain identity; a generic warm editorial palette would lose that connection.

Core roles, light / dark:

| Role | Light | Dark |
| --- | --- | --- |
| Page | `#f5f7fa` | `#050a14` |
| Surface | `#ffffff` | `#0b1322` |
| Primary text | `#152638` | `#eef4fb` |
| Secondary text | `#475a6e` | `#a9b6c8` |
| Action | `#00658c` | `#7ddcff` |
| Control boundary | `#708296` | `#65778f` |

Type: system body 1.0625rem (1rem on compact screens), display h1 2.5–4.2rem, section headings 1.75–2.5rem; regular/medium/semibold weights. Layout follows available width:

```text
Wide:    name / navigation
         introduction + actions | summit photograph
         selected projects in three columns
         personal story | facts
         contact

Compact: name / menu
         introduction + actions
         summit photograph
         selected projects stacked
         personal story, facts, contact
```

Removed accessory: the homepage photo-links grid repeated destinations without adding project evidence. The summit photograph and dedicated Outdoors page remain; the new selected-work section uses the space to explain projects. `branding.md > Best practices` supports deferring to content and retaining familiar controls.

## Validation and limits

- Browser checks: all seven pages at 320, 390, 820, and 1280 CSS pixels, in light and dark mode (56 combinations), with reduced motion. No horizontal overflow, broken loaded images, empty links, missing/duplicate h1, or JavaScript errors detected.
- Tested menu opening, Escape focus return, and no-JavaScript navigation/contact fallback.
- Visually inspected desktop light and mobile dark Home, plus the rendered replacement PDF. PDF verified as one page.
- Existing motion was not redesigned; see `CLAUDE-MOTION-HANDOFF.md`.
- No claims of complete WCAG certification, full screen-reader coverage, external link availability, or factual verification of every existing achievement. Existing project statuses, school details, credentials, and future plans still need Charles's review. His new correction is incorporated.
- No deployment performed. Changes are local for review.

## Home and About hero redesign — October 27

### Summary

The previous openings used almost identical two-column text/portrait compositions. Rating for the prior hero craft: **Needs work** (design judgment). The new thesis is a personal introduction through Charles's own outdoor photographs, with different jobs for Home (identity and access to projects) and About (a more personal story). This is a web design, so HIG foundations apply rather than native Apple navigation conventions.

### Review and design direction

- **High, craft judgment:** The repeated split layout made the two openings interchangeable. Home now has a large nameplate and a wide summit photograph with a concise introduction; About has a headline and an asymmetric seasonal photo composition. The original summit photo was landscape, but the previous 5:6 crop sacrificed much of its setting.
- **Medium:** Reduce competing introductory actions. Home has one primary project action and one quieter About link. `buttons.md > Content`: “Ensure that each button clearly communicates its purpose.”
- **Medium:** Keep text independent of image brightness. All copy and captions sit on solid surfaces, with normal document flow. `accessibility.md > Vision`: “Strive to meet color contrast minimum standards.”
- **What works:** Keep personal photographs, familiar links, existing navigation, and light/dark appearance. `branding.md > Best practices`: “Ensure branding always defers to content.”

### Compact plan

Reuse the six existing semantic color roles and measured contrast values in this audit: page, surface, primary text, secondary text, action, and boundary. No extra accent palette. Space Grotesk carries display type; system UI carries prose and captions. Home name 3–8rem, About heading 2.6–5rem, introduction 1.25–2rem, body 1.0625rem, captions 0.875rem. Layout has no fixed text heights and retains wrapping and focus styles.

Wide Home: nameplate / [landscape photo | introduction + project action].
Compact Home: nameplate / photo / introduction + actions.
Wide About: headline / [personal introduction | larger winter photo | smaller summer photo].
Compact About: headline / introduction / two seasonal photos.

Signature: the actual summit photograph and seasonal contrast, rather than an abstract illustration or decorative dashboard. Critique: a giant name alone could be generic; pairing it with Charles's original landscape and giving About a distinct photo-journal composition grounds the direction in this person. Remove the redundant homepage location/name eyebrow and the second outlined button. No new motion, parallax, or hover effects.

### Validation limits

Source checks passed for both pages: one h1, unique IDs, local links and anchors, image availability, and intrinsic hero image dimensions. CSS block balance and git whitespace checks passed. Reviewed the original photographs to choose framing. Browser rendering checks were blocked by the browser tool's local file URL policy; responsive layout, large-text behavior, and appearance still need a visual pass. Earlier browser results in this document predate these hero changes and do not validate them.

### Hero revision: open photographic composition

Charles rejected the boxed hero direction. Removed the Home surface, enclosing border, and rounded corners. The summit photograph now spans the viewport with the name over a darkened lower region; supporting copy and actions sit in open page space below. About now uses overlapping winter/summer photographs alongside the story, with square image edges and no enclosing cards. Photo captions remain outside the overlap. Compact layouts preserve the text order and use a smaller photo overlap below the introduction. No motion added.

This supersedes the earlier solid-background-only hero decision. White text uses the dark lower image gradient; increased-contrast mode adds a solid text backing. Static whitespace checks passed. Rendered layout and image-overlay contrast still require visual verification because local browser previews remain blocked; do not treat earlier visual test results as covering this iteration.

### Personal hero photograph

Replaced the Home placeholder with `assets/img/canyon-2048.jpg`, copied unchanged from the user's Website email attachment IMG_4433.JPG. Charles confirmed he is the person lower down in the light shirt. Alt text reflects that confirmation. CSS framing favors that person and the central gradient is lighter to retain the warm canyon colors. Original JPEG is 2048 x 1536; no retouching or invented date/location. Local browser rendering remains unverified.

### Fold and hero hierarchy correction

Applied Apple skill `layout.md > Visual hierarchy`: “Order content by relative importance,” and `layout.md > Adaptability`: “Be prepared for text-size changes.” Removed the photo's intrinsic contribution to the hero grid height; the image now fills the text-defined area. The heading region uses a viewport-relative minimum (60svh desktop, 55svh compact) rather than a photo-driven height up to 850px. Text remains in normal flow and can expand the region for large type. Reduced the name's maximum size and the gap to the introduction so identity and opening context appear earlier. No hard clipping of text and no added motion. Whitespace check passed; browser verification remains blocked for local file URLs.

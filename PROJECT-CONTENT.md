# Adding depth to project pages

The current site stays static HTML, so project stories, links, figures, and native expandable sections work from GitHub Pages and local file previews without a build step.

- `projects.html`: overview; research first. Use a short description, truthful status, and a descriptive link to the full story.
- `project-ai-security.html`: research question, method, dated progress, limitations, and next steps.
- `project-ehr.html`: overview, expandable feature walkthroughs, and technology. Source application: `https://daviscatalystehr.com/`. Desktop screenshots captured October 27, 2026, using the newly created fictional Alex Demo patient (MRN 900001). Charles authorized demo records and public screenshots. Keep the portfolio preview accessible without requiring visitors to log in.

Copy an existing detail page to add a project. Update title, descriptions, canonical URL, Open Graph URL, headings, section navigation, and previous/next links. Keep Projects marked as the current navigation location. Do not put a second clickable link inside a whole-card link.

## Screenshots and walkthroughs

Store reviewed media in `assets/projects/<project>/`. Use real screenshots with demo records. Do not fabricate project screenshots or copy personal patient data. Include enough context to explain what the image demonstrates and Charles's contribution. Use a full-width figure for a detailed interface, or `case-gallery` for side-by-side images that stack on small screens.

```html
<figure class="case-figure">
  <a href="assets/projects/ehr/patient-overview.webp">
    <img src="assets/projects/ehr/patient-overview.webp"
         alt="Describe the actual visible screen and the important feature."
         width="1440" height="900" loading="lazy" decoding="async">
  </a>
  <figcaption>Explain the feature and what Charles built. Select the image to view it at full size.</figcaption>
</figure>
```

The example is an authoring pattern, not a shipped image. Add the actual file before adding the markup. For a recorded walkthrough use `<video controls preload="metadata">`, captions when speech is included, and a text explanation. No autoplay, carousel, or animation library is required.

Use native `<details><summary>` for optional implementation notes or individual EHR screens. Keep the main result and context visible outside disclosures. Attach papers, demos, repositories, and result files with explicit link labels only when real destinations exist.

## Research provenance for this pass

Read-only source: `C:/Users/chuck/OneDrive/Desktop/ai fingerprinting/` located through the chat **Review Spark and desktop websites**.

- `research.md`, sections 1–3: research question and proposed design. Proposed sample sizes/model lists are not represented as completed results.
- `docs/current-state.md`, October 27 entries: exploratory status and no new security findings for the recovered apps.
- `docs/calibration/weekend-recovery-20261027/final-report.md`: 60 preserved attempts; three Nemotron completions in a 15-attempt cohort; retained 27/27 component-check reports; no fresh canonical rerun/security evaluation at recovery.

The portfolio deliberately excludes local host addresses, internal credentials, raw logs, operational instructions, and unadjudicated vulnerability claims. Source files were read, not changed, and no research runs were started. Update the visible date and limitations when adding newer evidence. Candidate public signals remain a research direction, not a validated detector.

## EHR capture notes

Four original browser captures are stored as JPEG files in `assets/projects/ehr/`. Captured at a 1920 x 1080 desktop viewport, using full-page capture where the screen extends below the viewport. No UI content was retouched. Overview and vitals show the newly saved demo record. Order entry shows a partially filled, unsubmitted draft. Dashboard problems, labs, alerts, and appointments were already present on the new patient and are described as sample panels.

Observed EHR issues for a separate application pass: entering temperature 98.4 displayed 98.0 after save; free text displayed as 0 in the history. Verify field handling and storage before diagnosing the cause. The portfolio does not claim these are fixed.

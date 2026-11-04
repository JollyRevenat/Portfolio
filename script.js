// Charles Blake — personal site.
// Small, quiet interactions. Respects prefers-reduced-motion throughout.

// Where the contact form and "Email" links send mail.
const CONTACT_EMAIL = "charlesdavidblake@gmail.com";

(function () {
    const root = document.documentElement;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduced = motionQuery.matches;

    // ---------- Small things ----------
    document.querySelectorAll("[data-year]").forEach((el) => {
        el.textContent = new Date().getFullYear();
    });

    document.querySelectorAll("[data-email]").forEach((a) => {
        a.href = "mailto:" + CONTACT_EMAIL;
    });

    // ---------- Header: border once scrolled + mobile menu ----------
    const header = document.querySelector(".site-header");
    const menuBtn = document.querySelector(".menu-btn");

    if (header) {
        const heroPhoto = document.body.classList.contains("home-page")
            ? document.querySelector(".identity-hero__photo") : null;
        const updateHeader = () => {
            header.classList.toggle("is-scrolled", window.scrollY > 8);
            if (!heroPhoto) return;
            const remaining = heroPhoto.getBoundingClientRect().bottom - header.getBoundingClientRect().height;
            const progress = Math.max(0, Math.min(1, 1 - remaining / 180));
            header.style.setProperty("--hero-nav-fill", `${progress * 100}%`);
        };
        if (heroPhoto) {
            header.classList.add("hero-nav");
            const measureHeader = () => root.style.setProperty("--hero-header-height", `${header.getBoundingClientRect().height}px`);
            measureHeader();
            if ("ResizeObserver" in window) {
                const observer = new ResizeObserver(() => { measureHeader(); updateHeader(); });
                observer.observe(header);
                observer.observe(heroPhoto);
            }
            else window.addEventListener("resize", measureHeader);
        }
        let headerUpdatePending = false;
        const onScroll = () => {
            if (headerUpdatePending) return;
            headerUpdatePending = true;
            requestAnimationFrame(() => { headerUpdatePending = false; updateHeader(); });
        };
        updateHeader();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        window.addEventListener("pageshow", onScroll);
    }

    // ---------- Light / dark switch: follows the system until someone picks ----------
    // The choice is applied in each page's <head> before paint; this only adds the button.
    if (header) {
        const systemLight = window.matchMedia("(prefers-color-scheme: light)");
        const metas = document.querySelectorAll('meta[name="theme-color"]');
        const current = () => root.dataset.theme || (systemLight.matches ? "light" : "dark");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "theme-toggle";
        btn.innerHTML =
            '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></svg>' +
            '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
        const sync = () => {
            const theme = current();
            const next = theme === "dark" ? "light" : "dark";
            btn.dataset.current = theme;
            btn.setAttribute("aria-label", `Switch to ${next} mode`);
            btn.title = `Switch to ${next} mode`;
            if (root.dataset.theme) metas.forEach((m) => { m.content = theme === "light" ? "#f5f7fa" : "#050a14"; });
        };
        btn.addEventListener("click", () => {
            const next = current() === "dark" ? "light" : "dark";
            const apply = () => {
                root.dataset.theme = next;
                try { localStorage.setItem("theme", next); } catch { /* private mode: still switches for this page */ }
                sync();
            };
            if (document.startViewTransition && !motionQuery.matches) document.startViewTransition(apply);
            else apply();
        });
        systemLight.addEventListener("change", sync);
        header.querySelector(".wrap").append(btn);
        sync();
    }

    if (header && menuBtn) {
        root.classList.add("js-nav");
        const setMenu = (open) => {
            header.classList.toggle("menu-open", open);
            menuBtn.setAttribute("aria-expanded", String(open));
        };
        menuBtn.addEventListener("click", () => setMenu(!header.classList.contains("menu-open")));
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && header.classList.contains("menu-open")) {
                setMenu(false);
                menuBtn.focus();
            }
        });
        header.querySelectorAll(".nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
        window.matchMedia("(min-width: 821px)").addEventListener("change", () => setMenu(false));
        document.addEventListener("click", (e) => {
            if (!header.contains(e.target)) setMenu(false);
        });
    }

    // ---------- Project sidebar: mark the section currently being read ----------
    const sectionLinks = [...document.querySelectorAll('.case-nav a[href^="#"]')]
        .map((link) => ({ link, section: document.getElementById(link.hash.slice(1)) }))
        .filter(({ section }) => section);

    if (sectionLinks.length) {
        const caseNav = sectionLinks[0].link.closest(".case-nav");
        caseNav.classList.add("has-indicator");
        let pending = false;
        const updateSection = () => {
            pending = false;
            let current = sectionLinks[0];
            // An anchor jump lands at scroll-padding (on <html>) plus the section's scroll-margin.
            const padding = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
            for (const entry of sectionLinks) {
                const offset = padding + (parseFloat(getComputedStyle(entry.section).scrollMarginTop) || 0);
                if (entry.section.getBoundingClientRect().top <= offset + 1) current = entry;
            }
            // A short final section may never reach the top of the viewport.
            if (window.scrollY > 0 && window.scrollY + window.innerHeight >= root.scrollHeight - 2) {
                current = sectionLinks[sectionLinks.length - 1];
            }
            sectionLinks.forEach(({ link }) => {
                if (link === current.link) link.setAttribute("aria-current", "location");
                else link.removeAttribute("aria-current");
            });
            caseNav.style.setProperty("--ind-y", `${current.link.offsetTop}px`);
            caseNav.style.setProperty("--ind-h", `${current.link.offsetHeight}px`);
            // Place the marker first, then let later moves slide.
            if (!caseNav.classList.contains("is-ready")) {
                requestAnimationFrame(() => caseNav.classList.add("is-ready"));
            }
        };
        const scheduleSectionUpdate = () => {
            if (pending) return;
            pending = true;
            requestAnimationFrame(updateSection);
        };
        updateSection();
        window.addEventListener("scroll", scheduleSectionUpdate, { passive: true });
        window.addEventListener("resize", scheduleSectionUpdate);
        window.addEventListener("pageshow", scheduleSectionUpdate);
        window.addEventListener("hashchange", scheduleSectionUpdate);
        window.addEventListener("load", scheduleSectionUpdate);
    }

    // ---------- Contact form -> opens the visitor's mail app ----------
    const form = document.querySelector("[data-contact-form]");
    if (form) {
        form.hidden = false;
        const status = document.createElement("p");
        status.className = "form__status";
        status.setAttribute("role", "status");
        form.append(status);
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const data = new FormData(form);
            const subject = `Hi from ${data.get("name") || "your website"}`;
            const body = [data.get("message"), data.get("name")].filter(Boolean).join("\n\n");
            window.location.href =
                `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            status.textContent = "Email draft requested. If your email app did not open, use the email address on this page. Your message has not been sent by this website.";
        });
    }

    const snow = initSnow(!reduced);
    const tunnel = initTunnel(!reduced);
    const ridges = initRidges(!reduced);

    // ---------- Scroll reveals: a short fade on each block, staggered a little within groups ----------
    // Content is visible by default; hiding only happens once this script is running.
    let revealAll = () => {};
    motionQuery.addEventListener("change", (e) => {
        snow?.setAnimate(!e.matches);
        tunnel?.setLive(!e.matches);
        ridges?.setAnimate(!e.matches);
        if (e.matches) revealAll();
    });

    if (reduced || !("IntersectionObserver" in window)) return;

    // A linked project (projects.html#ehr) must be readable the moment the page lands on it.
    const hashTarget = () => {
        try { return location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null; }
        catch { return null; }
    };
    const linked = hashTarget();

    const targets = [];
    document.querySelectorAll("[data-reveal]").forEach((group) => {
        const kids = group.hasAttribute("data-reveal-self") ? [group] : [...group.children];
        kids.forEach((el, i) => {
            if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen: leave it
            if (linked && (el.contains(linked) || linked.contains(el))) return;
            el.classList.add("rv");
            el.style.setProperty("--d", Math.min(i * 70, 280) + "ms");
            targets.push(el);
        });
    });

    root.classList.add("js-motion");

    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("in");
                io.unobserve(entry.target);
            });
        },
        { rootMargin: "0px 0px -6% 0px", threshold: 0.1 }
    );

    targets.forEach((el) => io.observe(el));

    revealAll = () => {
        io.disconnect();
        targets.forEach((el) => el.classList.add("in"));
    };
    window.addEventListener("hashchange", () => {
        const el = hashTarget();
        targets.forEach((t) => { if (el && (t.contains(el) || el.contains(t))) t.classList.add("in"); });
    });
    window.addEventListener("beforeprint", revealAll);
})();

// ---------- Home: a run of photos, one at a time, coming forward out of the depth as you scroll ----------
// Each photo alternates a little left and right with its caption beside it, and the background takes its colour
// from whichever photo is nearest, so the mood shifts with the pictures. Without motion it's a plain grid.
// Depth 1 is rest size: nearer things grow out past the edges and fade, farther ones wait small near the middle.
function initTunnel(live) {
    const tunnel = document.querySelector("[data-tunnel]");
    if (!tunnel) return;
    const stage = tunnel.querySelector(".tunnel__stage");

    // In order: the photo (assets/img/tunnel/<name>.webp) and its caption, which can be empty.
    const PHOTOS = [
        ["ski-jump", "Freeride with the Snowbasin Ski Team"],
        ["lacrosse", "Lacrosse: close defense and LSM"],
        ["boulder-portrait", "Mountain biking, climbing, hiking"],
        ["rock-climbing", ""],
        ["wakesurf", ""],
        ["ai-security", "AI security research"],
        ["assess", "Designed and built assess.llc"],
        ["ehr", "EHR system, built at Davis Catalyst Center"]
    ];
    const FIRST = 1.6; // depth of the first photo when the section pins
    const GAP = 1.1;   // depth between photos
    const TRAVEL = FIRST + GAP * (PHOTOS.length - 1) - 1.1; // ends with the last photo at rest

    const clamp = (v) => Math.max(0, Math.min(1, v));
    const mood = document.createElement("div");
    mood.className = "tunnel__mood";
    mood.setAttribute("aria-hidden", "true");
    const field = document.createElement("div");
    field.className = "tunnel__field";
    const items = PHOTOS.map(([name, caption], i) => {
        const side = i % 2 ? 1 : -1;
        const figure = document.createElement("figure");
        figure.className = "tunnel__item";
        figure.dataset.side = side > 0 ? "right" : "left"; // which side of centre the photo sits; its caption faces in
        const img = document.createElement("img");
        img.className = "tunnel__photo";
        img.src = `assets/img/tunnel/${name}.webp`;
        img.dataset.photo = name;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        figure.append(img);
        if (caption) {
            const text = document.createElement("figcaption");
            text.className = "tunnel__caption";
            text.textContent = caption;
            figure.append(text);
        }
        field.append(figure);
        const item = { figure, side, depth: FIRST + i * GAP, colour: null };
        img.addEventListener("load", () => { item.colour = sample(img); onScroll(); }, { once: true });
        return item;
    });
    stage.append(field);

    // A photo's colour: the average of its more colourful pixels, so a snowfield reads as its blue sky, not grey.
    function sample(img) {
        try {
            const c = document.createElement("canvas");
            c.width = c.height = 24;
            const x = c.getContext("2d", { willReadFrequently: true });
            x.drawImage(img, 0, 0, 24, 24);
            const px = x.getImageData(0, 0, 24, 24).data;
            let r = 0, g = 0, b = 0, w = 0;
            for (let i = 0; i < px.length; i += 4) {
                const max = Math.max(px[i], px[i + 1], px[i + 2]);
                const min = Math.min(px[i], px[i + 1], px[i + 2]);
                const weight = 0.15 + (max - min) / 255; // saturation, with a floor so grey photos still count
                r += px[i] * weight; g += px[i + 1] * weight; b += px[i + 2] * weight; w += weight;
            }
            return [r / w, g / w, b / w];
        } catch { return null; }
    }

    // Photos are laid out larger than they rest at and scaled down, so they stay sharp as they grow past.
    const BASE = 0.85;
    const place = (el, depth, strength, dx) => {
        const opacity = clamp((depth - 0.75) / 0.35) * strength; // gone before it covers the next one
        el.style.opacity = opacity;
        el.style.visibility = opacity > 0.01 ? "" : "hidden";
        el.style.zIndex = Math.round(1000 - depth * 100); // nearer in front
        el.style.setProperty("--caption", clamp((1.75 - depth) / 0.4)); // a caption shows once its photo arrives
        if (opacity > 0.01) el.style.transform = `translate(${dx / depth}px, 0) scale(${BASE / depth})`;
    };

    let on = false;
    let pending = false;
    const update = () => {
        pending = false;
        if (!on) return;
        const rect = tunnel.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const halfW = stage.clientWidth / 2;
        const wide = halfW > stage.clientHeight / 2;
        const progress = clamp(-rect.top / (rect.height - window.innerHeight));
        const camera = TRAVEL * clamp((progress - 0.04) / 0.9);
        let r = 0, g = 0, b = 0, weight = 0;
        for (const item of items) {
            const rel = item.depth - camera;
            const shown = clamp((2.3 - rel) / 0.7); // the current photo, and the next one waiting behind it
            place(item.figure, rel, shown, wide ? 0.22 * item.side * halfW : 0);
            if (item.colour) {
                const w = Math.exp(-(((rel - 1.1) / 0.9) ** 2)); // the photo coming up to rest owns the colour
                r += item.colour[0] * w; g += item.colour[1] * w; b += item.colour[2] * w; weight += w;
            }
        }
        if (weight > 0) mood.style.setProperty("--mood", `${Math.round(r / weight)} ${Math.round(g / weight)} ${Math.round(b / weight)}`);
        mood.style.opacity = clamp(weight);
    };
    const onScroll = () => {
        if (pending || !on) return;
        pending = true;
        requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("pageshow", onScroll);

    function setLive(next) {
        on = next;
        tunnel.classList.toggle("tunnel--live", on);
        if (on) {
            stage.prepend(mood);
            update();
        } else {
            mood.remove();
            items.forEach(({ figure }) => figure.removeAttribute("style"));
        }
    }

    setLive(live);
    return { setLive };
}

// ---------- Footer: looking down a valley toward the mountains, in terrain lines ----------
// A low camera looking across a valley at a range: the ground drifts toward the viewer, the snowcaps
// catch the accent, and the river and the two ridges shift with the pointer. assets/img/ridges.svg is the still, no-script stand-in.
function initRidges(animate) {
    const footer = document.querySelector(".site-footer");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!footer || !ctx) return;
    canvas.className = "site-footer__ridges";
    canvas.setAttribute("aria-hidden", "true");
    footer.append(canvas);
    footer.classList.add("has-ridges");

    const STEP = 5;      // px between samples along a line
    const NEAR = 1.4;
    // Line depths: a few across the valley floor, then closely spaced through the mountains so each peak gets contours.
    const DEPTHS = [
        ...Array.from({ length: 18 }, (_, i) => NEAR * (8 / NEAR) ** (i / 18)),
        ...Array.from({ length: 44 }, (_, i) => 8 + i * 0.47)
    ];
    const RIVER = 0.8;   // river half-width, world units
    // Mountains on the horizon by screen angle: position, height, width.
    const PEAKS = [
        [-2.1, 0.5, 0.35], [-1.6, 0.78, 0.22], [-1.25, 0.6, 0.3], [-0.7, 0.95, 0.25], [-0.45, 0.7, 0.18], [0, 0.42, 0.35],
        [0.38, 0.8, 0.2], [0.64, 1, 0.3], [1.1, 0.55, 0.25], [1.45, 0.9, 0.22], [1.78, 0.62, 0.3], [2.2, 0.75, 0.3]
    ];
    const WAVES = [[4.1, 0.3, 2.7], [6.3, 2.1, 5.2], [3.4, 4.4, 3.9], [8.2, 1.2, 6.1], [5.6, 5.3, 2.2], [7.4, 3.6, 4.6]];
    const noise = (x, z) => {
        let n = 0;
        for (const [fx, px, fz] of WAVES) n += Math.sin(fx * x + px + fz * z);
        return n / WAVES.length;
    };
    const ramp = (v, a, b) => Math.max(0, Math.min(1, (v - a) / (b - a)));

    let cw = 0;
    let ch = 0;
    let focal = 0;
    let skyline = 0;
    let raf = 0;
    let visible = false;
    let bend = 0;    // px the near river is pushed sideways, eased toward the pointer
    let target = 0;
    let time = 0;
    let last = 0;
    let squeeze = 1;
    const waveSin = new Float64Array(WAVES.length);
    const waveCos = new Float64Array(WAVES.length);
    const stepSin = new Float64Array(WAVES.length);
    const stepCos = new Float64Array(WAVES.length);
    let colours = { line: "", ice: "" };
    // Theme colours, read when the theme changes rather than every frame.
    const readColours = () => {
        const style = getComputedStyle(canvas);
        colours = { line: style.color, ice: style.getPropertyValue("--ice").trim() || style.color };
        cachedLean = NaN;
    };
    let horizon = new Float32Array(0);
    let far = new Float32Array(0);
    let fronts = new Float32Array(0); // ridge heights per column: they depend only on screen angle and the pointer
    let backs = new Float32Array(0);
    // The far range only changes when the pointer moves it, so it's drawn once into a cache and reused.
    const cache = document.createElement("canvas");
    const cacheCtx = cache.getContext("2d");
    let cachedLean = NaN;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // thin lines stay crisp; full 2x costs more than it shows
        cw = canvas.clientWidth;
        ch = canvas.clientHeight;
        canvas.width = cache.width = cw * dpr;
        canvas.height = cache.height = ch * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        cacheCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        focal = ch * 1.15;
        skyline = ch * 0.62;
        squeeze = Math.max(1, 0.65 / (cw / 2 / focal)); // narrow screens still see several peaks, a little lower
        horizon = new Float32Array(Math.ceil(cw / STEP) + 1);
        far = new Float32Array(horizon.length);
        fronts = new Float32Array(horizon.length);
        cachedLean = NaN;
        backs = new Float32Array(horizon.length);
    }

    // The range by screen angle: 0..1. Front ridge is lower and offset; both slide a little with the pointer.
    function profile(angle, shift) {
        let p = 0;
        for (const [pa, ph, pw] of PEAKS) p = Math.max(p, ph * Math.exp(-((Math.abs(angle - pa - shift) / pw) ** 1.4) * 1.8));
        return p * (0.8 + 0.3 * noise((angle - shift) * 4.3, 0.2));
    }

    // One line of the scene at depth z, drawn onto c. Only what rises above everything nearer (edge) is seen.
    // Anything that depends only on depth is worked out once per line; mountain and snow strokes are batched.
    function slice(c, edge, z, t, peaks, snow) {
        const valley = z < 11;
        const zt = z + t;
        const centre = (0.8 * Math.sin(zt * 0.21) + 0.4 * Math.sin(zt * 0.5 + 2)) * (1 - ramp(z, 4, 10))
            + bend * (1 - ramp(z, NEAR, 10)) * z / focal; // the river winds, and its near end follows the pointer
        const rise = (0.6 + 0.4 * ramp(z, NEAR, 5)) * (1 - ramp(z, 7, 11));
        const scale = focal / z;
        // The valley's ripples are sine waves across the line. Each sample steps every wave by a fixed angle,
        // so they're rotated forward with two multiplies instead of a Math.sin per wave per sample.
        if (valley) {
            for (let w = 0; w < WAVES.length; w++) {
                const freq = WAVES[w][0] * 0.35 / scale;
                const start = -freq * cw / 2 + WAVES[w][1] + WAVES[w][2] * zt * 0.25;
                waveSin[w] = Math.sin(start);
                waveCos[w] = Math.cos(start);
                stepSin[w] = Math.sin(freq * STEP);
                stepCos[w] = Math.cos(freq * STEP);
            }
        }
        // Each ridge is a solid with its summit line at one depth, so nearer lines cut it lower down.
        const front = z < 6 ? 0 : Math.exp(-(((z - 11.5) / 2.2) ** 2));
        const back = z < 6 ? 0 : Math.exp(-(((z - 22) / 4.5) ** 2));
        const lift = 0.42 / Math.sqrt(squeeze) * z;
        const ground = new Path2D();
        let drawing = false;
        let prev = ground;
        let px = 0;
        let py = 0;
        for (let k = 0; k < edge.length; k++) {
            const sx = k * STEP;
            let hills = 0;
            if (valley) { // banks rising either side of a flat river floor
                const x = (sx - cw / 2) / scale;
                const side = Math.abs(x - centre);
                const d = (side / RIVER) ** 2;
                let n = 0;
                for (let w = 0; w < WAVES.length; w++) {
                    const sin = waveSin[w];
                    n += sin;
                    waveSin[w] = sin * stepCos[w] + waveCos[w] * stepSin[w];
                    waveCos[w] = waveCos[w] * stepCos[w] - sin * stepSin[w];
                }
                hills = (1 - Math.exp(-d * d)) * (0.5 + 0.5 * n / WAVES.length) * (0.3 + 0.14 * Math.min(side, 3)) * rise;
            }
            const peak = Math.max(fronts[k] * front, backs[k] * back);
            const mountain = peak * lift;
            const y = skyline + (1 - Math.max(hills, mountain)) * scale;
            const path = mountain > hills ? (peak > 0.6 ? snow : peaks) : ground;
            if (y < edge[k] - 0.4) {
                if (!drawing) path.moveTo(sx, y);
                else if (path === prev) path.lineTo(sx, y);
                else { path.moveTo(px, py); path.lineTo(sx, y); }
                drawing = true;
                edge[k] = y;
            } else drawing = false;
            prev = path;
            px = sx;
            py = y;
        }
        // The valley fades with distance; the mountains hold their weight so they stay the subject.
        c.globalAlpha = 0.65 - 0.5 * ramp(z, NEAR, 10);
        c.stroke(ground);
    }

    function strokeRange(c, peaks, snow) {
        c.globalAlpha = 0.8;
        c.strokeStyle = colours.line;
        c.stroke(peaks);
        c.globalAlpha = 0.9;
        c.strokeStyle = colours.ice;
        c.stroke(snow);
        c.globalAlpha = 1;
    }

    // The lines from the valley's far edge back: they move only with the pointer.
    function drawRange(lean) {
        for (let k = 0; k < fronts.length; k++) {
            const angle = (k * STEP - cw / 2) / focal * squeeze;
            fronts[k] = 0.6 * profile(angle + 0.33, lean * 0.25);
            backs[k] = profile(angle, lean * 0.1);
        }
        cacheCtx.clearRect(0, 0, cw, ch);
        cacheCtx.lineJoin = "round";
        cacheCtx.strokeStyle = colours.line;
        far.fill(ch + 10);
        const peaks = new Path2D();
        const snow = new Path2D();
        for (const z of DEPTHS) if (z >= 11) slice(cacheCtx, far, z, 0, peaks, snow);
        strokeRange(cacheCtx, peaks, snow);
        cachedLean = lean;
    }

    function draw(t) {
        const lean = bend / cw; // -0.35..0.35
        if (!(Math.abs(lean - cachedLean) < 0.0005)) drawRange(lean);
        ctx.clearRect(0, 0, cw, ch);
        ctx.lineJoin = "round";
        ctx.strokeStyle = colours.line;
        horizon.fill(ch + 10);
        const peaks = new Path2D();
        const snow = new Path2D();
        for (const z of DEPTHS) if (z < 11) slice(ctx, horizon, z, t, peaks, snow);
        strokeRange(ctx, peaks, snow);
        // The cached range shows only above the valley in front of it.
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cw, 0);
        ctx.lineTo(0, 0);
        for (let k = 0; k < horizon.length; k++) ctx.lineTo(k * STEP, horizon[k]);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(cache, 0, 0, cw, ch);
        ctx.restore();
    }

    // Timed by the clock, not the frame count, so it moves at the same pace at 60 or 120 fps.
    function frame(now) {
        const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
        last = now;
        bend += (target - bend) * (1 - Math.exp(-dt / 0.5));
        time += dt * 0.35;
        draw(time);
        raf = requestAnimationFrame(frame);
    }

    // Runs only while the footer is on screen and the tab is showing.
    function restart() {
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
        if (animate && visible && !document.hidden) raf = requestAnimationFrame(frame);
        else draw(time);
    }

    window.addEventListener("pointermove", (e) => {
        target = (e.clientX / window.innerWidth - 0.5) * cw * 0.7;
    }, { passive: true });
    window.addEventListener("resize", () => {
        resize();
        if (!raf) draw(time);
    }, { passive: true });
    document.addEventListener("visibilitychange", restart);
    // Still frames pick up a theme switch too.
    const redraw = () => {
        readColours();
        if (!raf) draw(time);
    };
    new MutationObserver(redraw).observe(document.documentElement, { attributeFilter: ["data-theme"] });
    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", redraw);
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            restart();
        }).observe(canvas);
    }

    resize();
    readColours();
    draw(0);

    return {
        setAnimate(on) {
            animate = on;
            restart();
        }
    };
}

// ---------- Background snowfall: small, sparse and slow ----------
function initSnow(animate) {
    const canvas = document.querySelector(".ambient__snow");
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let flakes = [];
    let raf = 0;

    const rand = (a, b) => a + Math.random() * (b - a);

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.round(Math.min(60, (w * h) / 26000));
        flakes = Array.from({ length: count }, () => {
            const depth = Math.random();
            return {
                x: rand(0, w),
                y: rand(0, h),
                r: 0.6 + depth * 1.4,
                vy: 0.1 + depth * 0.25,
                sway: rand(0.2, 0.6),
                phase: rand(0, Math.PI * 2),
                alpha: 0.12 + depth * 0.28
            };
        });
    }

    function frame(t) {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#d6f2ff";
        for (const f of flakes) {
            if (animate) {
                f.y += f.vy;
                f.x += Math.sin(t * 0.0004 * f.sway + f.phase) * 0.15;
                if (f.y > h + 4) {
                    f.y = -4;
                    f.x = rand(0, w);
                }
            }
            ctx.globalAlpha = f.alpha;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        raf = animate && !document.hidden ? requestAnimationFrame(frame) : 0;
    }

    // Exactly one loop at a time: every (re)start cancels whatever was scheduled.
    function restart() {
        cancelAnimationFrame(raf);
        raf = 0;
        if (animate && !document.hidden) raf = requestAnimationFrame(frame);
        else frame(0); // still flakes, no loop
    }

    resize();
    frame(0);

    window.addEventListener("resize", () => {
        resize();
        if (!animate) frame(0);
    }, { passive: true });

    document.addEventListener("visibilitychange", restart);

    return {
        setAnimate(on) {
            animate = on;
            restart();
        }
    };
}

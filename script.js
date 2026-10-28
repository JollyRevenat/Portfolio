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

    // ---------- Scroll reveals: a short fade on each block, staggered a little within groups ----------
    // Content is visible by default; hiding only happens once this script is running.
    let revealAll = () => {};
    motionQuery.addEventListener("change", (e) => {
        snow?.setAnimate(!e.matches);
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

// Charles Blake — personal site.
// Small, quiet interactions. Respects prefers-reduced-motion throughout.

// Where the contact form and "Email" links send mail.
const CONTACT_EMAIL = "charlesdavidblake@gmail.com";

(function () {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
        let pending = false;
        const updateSection = () => {
            pending = false;
            let current = sectionLinks[0];
            for (const entry of sectionLinks) {
                const offset = parseFloat(getComputedStyle(entry.section).scrollMarginTop) || 0;
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

    initSnow(!reduced);

    // ---------- Scroll reveals: a short fade on each block, staggered a little within groups ----------
    // Content is visible by default; hiding only happens once this script is running.
    if (reduced || !("IntersectionObserver" in window)) return;

    const targets = [];
    document.querySelectorAll("[data-reveal]").forEach((group) => {
        const kids = group.hasAttribute("data-reveal-self") ? [group] : [...group.children];
        kids.forEach((el, i) => {
            if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen: leave it
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
        if (animate) raf = requestAnimationFrame(frame);
    }

    resize();
    frame(0);

    window.addEventListener("resize", () => {
        resize();
        if (!animate) frame(0);
    }, { passive: true });

    if (animate) {
        document.addEventListener("visibilitychange", () => {
            cancelAnimationFrame(raf);
            if (!document.hidden) raf = requestAnimationFrame(frame);
        });
    }
}

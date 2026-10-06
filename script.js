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
        const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
    }

    if (header && menuBtn) {
        const setMenu = (open) => {
            header.classList.toggle("menu-open", open);
            menuBtn.setAttribute("aria-expanded", String(open));
        };
        menuBtn.addEventListener("click", () => setMenu(!header.classList.contains("menu-open")));
        document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
        document.addEventListener("click", (e) => {
            if (!header.contains(e.target)) setMenu(false);
        });
    }

    // ---------- Contact form -> opens the visitor's mail app ----------
    const form = document.querySelector("[data-contact-form]");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const data = new FormData(form);
            const subject = `Hi from ${data.get("name") || "your website"}`;
            const body = `${data.get("message") || ""}\n\n${data.get("name") || ""} (${data.get("email") || ""})`;
            window.location.href =
                `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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

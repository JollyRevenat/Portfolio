const root = document.documentElement;
const toggle = document.querySelector(".theme-toggle");
const toggleLabel = toggle?.querySelector("span");
const yearEl = document.getElementById("year");

const lightTheme = {
    "--bg": "#f2fbff",
    "--surface": "#ffffff",
    "--contrast": "#041025",
    "--muted": "rgba(4, 16, 37, 0.65)",
    "--accent": "#7ddcff",
    "--accent-2": "#0dd59b",
    "--shadow": "0 15px 35px rgba(0, 0, 0, 0.15)"
};

const darkTheme = {
    "--bg": "#01030a",
    "--surface": "#07101f",
    "--contrast": "#f2f8ff",
    "--muted": "rgba(242, 248, 255, 0.65)",
    "--accent": "#7ddcff",
    "--accent-2": "#64f5c3",
    "--shadow": "0 25px 60px rgba(0, 0, 0, 0.45)"
};

let theme = "dark";

function applyTheme(tokens) {
    Object.entries(tokens).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });
}

toggle?.addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    applyTheme(theme === "dark" ? darkTheme : lightTheme);
    if (toggleLabel) {
        toggleLabel.textContent = theme === "dark" ? "Dark" : "Light";
    }
});

if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

if (toggleLabel) {
    toggleLabel.textContent = "Dark";
}

const homeStory = document.querySelector(".home-story");

function initHomeStory(story) {
    const canvas = story.querySelector(".home-story__canvas");
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
        return;
    }

    const gsapLib = window.gsap;
    const scrollTrigger = window.ScrollTrigger;

    if (!gsapLib || !scrollTrigger) {
        story.classList.add("home-story--fallback");
        return;
    }

    const chapters = gsapLib.utils.toArray("[data-story-chapter]", story);
    const frameCount = Number(story.dataset.frameCount) || 1;
    const framePath = story.dataset.framePath || "assets/frames/";
    const framePrefix = story.dataset.framePrefix || "frame_";
    const frameExtension = story.dataset.frameExtension || "png";
    const framePadding = Number(story.dataset.framePadding) || 4;
    const mobileFrameStep = window.matchMedia("(max-width: 720px)").matches ? 3 : 1;
    const frameIndexes = Array.from({ length: frameCount }, (_, index) => index)
        .filter((index) => index % mobileFrameStep === 0 || index === frameCount - 1);
    const images = new Map();
    const playhead = { frame: 0 };

    let currentFrame = 0;
    let lastRenderedFrame = -1;
    let renderRequested = false;
    let resizeTimer = 0;
    let canvasWidth = 0;
    let canvasHeight = 0;

    function getFrameUrl(index) {
        const frameNumber = String(index).padStart(framePadding, "0");
        return `${framePath}${framePrefix}${frameNumber}.${frameExtension}`;
    }

    function clampFrame(frame) {
        return Math.min(frameIndexes.length - 1, Math.max(0, Math.round(frame)));
    }

    function drawCover(image) {
        const scale = Math.max(canvasWidth / image.naturalWidth, canvasHeight / image.naturalHeight);
        const drawWidth = image.naturalWidth * scale;
        const drawHeight = image.naturalHeight * scale;
        const offsetX = (canvasWidth - drawWidth) / 2;
        const offsetY = (canvasHeight - drawHeight) / 2;

        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    }

    function render() {
        renderRequested = false;
        currentFrame = clampFrame(playhead.frame);

        if (currentFrame === lastRenderedFrame) {
            return;
        }

        const image = images.get(currentFrame);

        if (image?.complete && image.naturalWidth) {
            drawCover(image);
            lastRenderedFrame = currentFrame;
        }
    }

    function requestRender() {
        if (!renderRequested) {
            renderRequested = true;
            window.requestAnimationFrame(render);
        }
    }

    function resizeCanvas() {
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const bounds = canvas.getBoundingClientRect();

        canvasWidth = Math.max(1, Math.round(bounds.width * pixelRatio));
        canvasHeight = Math.max(1, Math.round(bounds.height * pixelRatio));
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        lastRenderedFrame = -1;
        requestRender();
    }

    function queueResize() {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
            resizeCanvas();
            scrollTrigger.refresh();
        }, 120);
    }

    function loadFrame(sequenceIndex) {
        if (images.has(sequenceIndex)) {
            return Promise.resolve(images.get(sequenceIndex));
        }

        const image = new Image();
        image.decoding = "async";
        images.set(sequenceIndex, image);

        return new Promise((resolve, reject) => {
            image.onload = () => {
                if (sequenceIndex === currentFrame) {
                    lastRenderedFrame = -1;
                    requestRender();
                }

                resolve(image);
            };
            image.onerror = reject;
            image.src = getFrameUrl(frameIndexes[sequenceIndex]);
        });
    }

    function preloadFrames() {
        return Promise.all(frameIndexes.map((_, index) => loadFrame(index)));
    }

    function startStory() {
        gsapLib.registerPlugin(scrollTrigger);
        resizeCanvas();
        story.classList.add("home-story--ready");
        requestRender();

        gsapLib.set(chapters, { autoAlpha: 0, y: 44 });
        gsapLib.set(chapters[0], { autoAlpha: 1, y: 0 });
        gsapLib.set(".story-chapter--card .card", {
            autoAlpha: 0,
            y: 72,
            scale: 0.92,
            rotationX: 9,
            rotationZ: -1.5,
            transformPerspective: 1200
        });

        const timeline = gsapLib.timeline({
            scrollTrigger: {
                trigger: story,
                start: "top top",
                end: () => `+=${Math.max(4200, frameIndexes.length * 30, chapters.length * 620)}`,
                pin: true,
                scrub: 0.35,
                invalidateOnRefresh: true
            }
        });

        timeline.to(playhead, {
            frame: frameIndexes.length - 1,
            ease: "none",
            duration: 1,
            onUpdate: requestRender
        }, 0);

        chapters.forEach((chapter, index) => {
            const start = index / chapters.length;
            const hold = chapter.classList.contains("story-chapter--card") ? 0.09 : 0.12;
            const fade = 0.075;
            const card = chapter.querySelector(".card");

            if (index > 0) {
                timeline.to(chapter, {
                    autoAlpha: 1,
                    y: 0,
                    duration: fade,
                    ease: "power1.out"
                }, Math.max(0, start - fade));

                if (card) {
                    timeline.to(card, {
                        autoAlpha: 1,
                        y: 0,
                        scale: 1,
                        rotationX: 0,
                        rotationZ: 0,
                        duration: fade * 1.7,
                        ease: "back.out(1.15)"
                    }, Math.max(0, start - fade * 0.75));
                }
            }

            if (index < chapters.length - 1) {
                if (card) {
                    timeline.to(card, {
                        autoAlpha: 0,
                        y: -52,
                        scale: 0.96,
                        rotationX: -7,
                        rotationZ: 1.2,
                        duration: fade,
                        ease: "power1.in"
                    }, Math.min(0.94, start + hold - fade * 0.3));
                }

                timeline.to(chapter, {
                    autoAlpha: 0,
                    y: -34,
                    duration: fade,
                    ease: "power1.in"
                }, Math.min(0.94, start + hold));
            }
        });

        window.addEventListener("resize", queueResize, { passive: true });
    }

    loadFrame(0)
        .then((firstImage) => {
            resizeCanvas();
            drawCover(firstImage);
            return preloadFrames();
        })
        .then(startStory)
        .catch(() => {
            story.classList.add("home-story--fallback");
        });
}

if (homeStory) {
    initHomeStory(homeStory);
}

const root = document.documentElement;
const toggle = document.querySelector(".theme-toggle");
const yearEl = document.getElementById("year");

const lightTheme = {
    "--bg": "#f5f6f7",
    "--surface": "#ffffff",
    "--contrast": "#0c0f13",
    "--muted": "rgba(12, 15, 19, 0.65)",
    "--accent": "#265cff",
    "--accent-2": "#ff7a18",
    "--shadow": "0 20px 40px rgba(0, 0, 0, 0.15)"
};

const darkTheme = {
    "--bg": "#050608",
    "--surface": "#0c0f13",
    "--contrast": "#f5f6f7",
    "--muted": "rgba(245, 246, 247, 0.65)",
    "--accent": "#7ddcff",
    "--accent-2": "#ffb477",
    "--shadow": "0 20px 40px rgba(0, 0, 0, 0.35)"
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
    toggle.querySelector("span").textContent = theme === "dark" ? "Dark" : "Light";
});

if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

toggle?.querySelector("span").textContent = "Dark";

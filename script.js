const root = document.documentElement;
const toggle = document.querySelector(".theme-toggle");
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
    toggle.querySelector("span").textContent = theme === "dark" ? "Dark" : "Light";
});

if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
}

toggle?.querySelector("span").textContent = "Dark";

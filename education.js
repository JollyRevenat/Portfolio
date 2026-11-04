// The location links remain normal in-page navigation when JavaScript is unavailable.
(() => {
    const stories = [...document.querySelectorAll('.education-story')];
    const links = [...document.querySelectorAll('[data-place-link]')];
    if (!stories.length) return;
    const ids = new Set(stories.map(story => story.id));
    const compact = window.matchMedia('(max-width: 1000px)');

    function select(id) {
        if (!ids.has(id)) return;
        stories.forEach(story => { story.hidden = story.id !== id; });
        links.forEach(link => {
            if (link.dataset.placeLink === id) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    }

    function syncMapAccessibility() {
        // Scaled map labels get too small for reliable targets; the list has the same links.
        document.querySelectorAll('.education-pin').forEach(link => {
            if (compact.matches) {
                link.setAttribute('tabindex', '-1');
                link.setAttribute('aria-hidden', 'true');
            } else {
                link.removeAttribute('tabindex');
                link.removeAttribute('aria-hidden');
            }
        });
    }

    const initial = location.hash.slice(1);
    select(ids.has(initial) ? initial : 'guatemala');
    document.body.classList.add('education-enhanced');
    syncMapAccessibility();
    compact.addEventListener('change', syncMapAccessibility);
    links.forEach(link => link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        const id = link.dataset.placeLink;
        if (!ids.has(id)) return;
        event.preventDefault();
        select(id);
        history.pushState(null, '', '#' + id);
        const heading = document.getElementById(id + '-title');
        heading.focus({ preventScroll: true });
        const story = document.getElementById(id);
        const rect = story.getBoundingClientRect();
        if (rect.top < 80 || rect.bottom > innerHeight) {
            story.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
    }));
    window.addEventListener('hashchange', () => {
        select(ids.has(location.hash.slice(1)) ? location.hash.slice(1) : 'guatemala');
    });
})();

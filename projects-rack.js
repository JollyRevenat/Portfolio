// Keep existing links to individual projects useful inside the rack.
(() => {
    const units = [...document.querySelectorAll('.rack-unit')];
    function revealLinkedProject() {
        let id;
        try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
        const unit = units.find(item => item.id === id);
        if (!unit) return;
        unit.open = true;
        requestAnimationFrame(() => unit.scrollIntoView({ block: 'start', behavior: 'instant' }));
    }
    revealLinkedProject();
    window.addEventListener('hashchange', revealLinkedProject);

    let openBeforePrint = [];
    window.addEventListener('beforeprint', () => {
        openBeforePrint = units.filter(unit => unit.open);
        units.forEach(unit => { unit.removeAttribute('name'); unit.open = true; });
    });
    window.addEventListener('afterprint', () => {
        units.forEach(unit => { unit.open = openBeforePrint.includes(unit); unit.setAttribute('name', 'project-rack'); });
    });
})();

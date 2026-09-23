document.querySelectorAll(".mobile-menu").forEach((menu) => {
    const toggle = menu.querySelector(".mobile-menu__toggle");
    const panel = menu.querySelector(".mobile-menu__panel");

    if (!toggle || !panel) return;

    function setOpen(open, restoreFocus = false) {
        menu.classList.toggle("is-open", open);
        panel.hidden = !open;
        if (open) panel.scrollTop = 0;
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
        document.documentElement.classList.toggle("menu-open", open);
        document.body.classList.toggle("menu-open", open);

        if (restoreFocus) toggle.focus();
    }

    toggle.addEventListener("click", () => {
        const wasOpen = !panel.hidden;
        setOpen(!wasOpen, wasOpen);
    });

    document.addEventListener("keydown", (event) => {
        if (panel.hidden) return;

        if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false, true);
            return;
        }

        if (event.key !== "Tab") return;

        const focusable = [toggle, ...panel.querySelectorAll("a[href], button:not([disabled])")];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        } else if (!focusable.includes(document.activeElement)) {
            event.preventDefault();
            first.focus();
        }
    });

    addEventListener("resize", () => {
        if (matchMedia("(min-width: 850px)").matches && !panel.hidden) setOpen(false);
    });
});

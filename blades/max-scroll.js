export function blade_maxScrollStart() {
    if (window.lastTimeoutId > 0) {
        return;
    }

    window.prevY = 0;
    window.lastTimeoutId = 0;

    const next = () => {
        if (window.prevY <= window.scrollY) {
            window.prevY = window.scrollY;
            window.scrollTo(0, Number.MAX_SAFE_INTEGER);
            window.lastTimeoutId = setTimeout(next, 100);
        } else {
            window.lastTimeoutId = 0;
        };
    }

    next();
}

export function blade_maxScrollCancel() {
    clearTimeout(window.lastTimeoutId);
    window.lastTimeoutId = 0;
}

export function blade_maxScrollStartElement() {
    if (document.lastTimeoutId > 0) {
        return;
    }

    const next = (targetElement) => {
        targetElement.scrollTo(0, Number.MAX_SAFE_INTEGER);
        document.lastTimeoutId = setTimeout(next, 100, targetElement);
    }

    const cancel = () => {
        clearTimeout(document.lastTimeoutId);
        document.lastTimeoutId = 0;
    };

    document.initNodePicker((targetElement) => {
        targetElement.onwheel = cancel;
        window.onmousedown = cancel;
        next(targetElement);
    });
}

export function blade_maxScrollStartWindow() {
    if (document.lastTimeoutId > 0) {
        return;
    }

    const next = () => {
        window.scrollTo(0, Number.MAX_SAFE_INTEGER);
        document.lastTimeoutId = setTimeout(next, 100);
    }

    const cancel = () => {
        clearTimeout(document.lastTimeoutId);
        document.lastTimeoutId = 0;
    };

    window.onwheel = cancel;
    window.onmousedown = cancel;
    next();
}

export function blade_maxScrollCancel() {
    clearTimeout(document.lastTimeoutId);
    document.lastTimeoutId = 0;
}

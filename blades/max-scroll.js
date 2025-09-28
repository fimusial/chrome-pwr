'use strict';

export function blade_maxScrollStartElement() {
    const cancel = () => {
        clearTimeout(document.lastTimeoutId);
        document.lastTimeoutId = 0;
    };

    if (document.lastTimeoutId > 0) {
        cancel();
    }

    const scrollToY = document.blade_maxScrollStartElement_params.direction === 'up' ? 0 : Number.MAX_SAFE_INTEGER;

    const next = (targetElement) => {
        targetElement.scrollTo(0, scrollToY);
        document.lastTimeoutId = setTimeout(next, 100, targetElement);
    }

    document.initNodePicker((targetElement) => {
        targetElement.onwheel = cancel;
        window.onmousedown = cancel;
        next(targetElement);
    });
}

export function blade_maxScrollStartWindow() {
    const cancel = () => {
        clearTimeout(document.lastTimeoutId);
        document.lastTimeoutId = 0;
    };

    if (document.lastTimeoutId > 0) {
        cancel();
    }

    const scrollToY = document.blade_maxScrollStartWindow_params.direction === 'up' ? 0 : Number.MAX_SAFE_INTEGER;

    const next = () => {
        window.scrollTo(0, scrollToY);
        document.lastTimeoutId = setTimeout(next, 100);
    }

    window.onwheel = cancel;
    window.onmousedown = cancel;
    next();
}

export function blade_maxScrollCancel() {
    clearTimeout(document.lastTimeoutId);
    document.lastTimeoutId = 0;
}

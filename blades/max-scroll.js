export function blade_maxScrollStartElement() {
    if (document.lastTimeoutId > 0) {
        return;
    }

    document.lastTimeoutId = 0;

    const next = (targetElement) => {
        targetElement.scrollTo(0, Number.MAX_SAFE_INTEGER);
        document.lastTimeoutId = setTimeout(next, 100, targetElement);
    }

    document.initNodePicker((targetElement) => {
        let lastScrollHeight = 0;

        targetElement.onscroll = (event) => {
            const currentScrollHeight = event.target.scrollTop;
            if (currentScrollHeight < lastScrollHeight) {
                clearTimeout(document.lastTimeoutId);
                document.lastTimeoutId = 0;
            }

            lastScrollHeight = currentScrollHeight;
        };

        next(targetElement);
    });
}

export function blade_maxScrollStartWindow() {
    if (document.lastTimeoutId > 0) {
        return;
    }

    document.lastTimeoutId = 0;

    const next = () => {
        window.scrollTo(0, Number.MAX_SAFE_INTEGER);
        document.lastTimeoutId = setTimeout(next, 100);
    }

    let lastScrollHeight = 0;

    window.onscroll = () => {
        const currentScrollHeight = window.scrollY;
        if (currentScrollHeight < lastScrollHeight) {
            clearTimeout(document.lastTimeoutId);
            document.lastTimeoutId = 0;
        }

        lastScrollHeight = currentScrollHeight;
    };

    next();
}

export function blade_maxScrollCancel() {
    clearTimeout(document.lastTimeoutId);
    document.lastTimeoutId = 0;
}

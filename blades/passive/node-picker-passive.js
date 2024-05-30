document.initNodePicker = (callback) => {
    if (document.nodePickerActive) {
        return;
    }

    document.nodePickerActive = true;

    const attributeName = 'chrome-pwr-node-picker-highlight';
    const throttlingDelay = 50;

    let throttling = false;
    let lastNode = null;

    const onMouseMove = event => {
        if (throttling) {
            return;
        }

        throttling = true;
        setTimeout(() => { throttling = false; }, throttlingDelay);

        if (event.target !== lastNode) {
            if (lastNode && lastNode.hasAttribute(attributeName)) {
                lastNode.removeAttribute(attributeName);
            }

            event.target.setAttribute(attributeName, true);
            lastNode = event.target;
        }
    };

    document.addEventListener('mousemove', onMouseMove);

    const muteEvent = event => {
        event.stopPropagation();
        event.preventDefault();
    };

    document.addEventListener('mousedown', muteEvent, true);
    document.addEventListener('click', muteEvent, true);

    const picked = event => {
        muteEvent(event);

        setTimeout(() => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mousedown', muteEvent, true);
            document.removeEventListener('click', muteEvent, true);
            document.removeEventListener('mouseup', picked, true);
        }, 0);

        document.querySelectorAll(`[${attributeName}]`)
            .forEach((node) => node.removeAttribute(attributeName));

        document.nodePickerActive = false;

        callback(event.target);
    };

    document.addEventListener('mouseup', picked, true);
};

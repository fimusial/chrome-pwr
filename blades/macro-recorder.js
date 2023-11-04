export function blade_macroRecorderStart() {
    document.captureClick = (event) => {
        const capturedClick = {
            timestamp: new Date().valueOf(),
            clientX: event.clientX,
            clientY: event.clientY,
        };

        let recordedClicks = localStorage.getItem("chrome-pwr-macro");
        recordedClicks = recordedClicks ? JSON.parse(recordedClicks) : [];
        recordedClicks.push(capturedClick);
        localStorage.setItem("chrome-pwr-macro", JSON.stringify(recordedClicks));
    };

    document.macroNext = (index, clicks, loop) => {
        if (index >= clicks.length) {
            if (loop) {
                index = 0;
            }
            else {
                document.lastTimeoutId = 0;
                return;
            }
        }

        const event = clicks[index];
        const element = document.elementFromPoint(event.clientX, event.clientY);
        const parameters = { view: window, bubbles: true, cancelable: true, clientX: event.clientX, clientY: event.clientY, button: 0 };
        element.dispatchEvent(new MouseEvent('mousedown', parameters));
        element.dispatchEvent(new MouseEvent('mouseup', parameters));
        element.dispatchEvent(new MouseEvent('click', parameters));

        let delay = 200;
        if (index + 1 < clicks.length) {
            delay = clicks[index + 1].timestamp - clicks[index].timestamp;
        }

        document.lastTimeoutId = setTimeout(() => document.macroNext(index + 1, clicks, loop), delay);
    };

    document.playMacro = (loop) => {
        if (document.lastTimeoutId > 0) {
            return;
        }

        document.lastTimeoutId = 0;

        let recordedClicks = localStorage.getItem("chrome-pwr-macro");
        recordedClicks = recordedClicks ? JSON.parse(recordedClicks) : null;

        if (!recordedClicks) {
            return;
        }

        document.macroNext(0, recordedClicks, loop);
    };

    document.clearMacro = () => {
        localStorage.removeItem("chrome-pwr-macro");
    };

    document.clearMacro();
    document.addEventListener('mouseup', document.captureClick);
}

export function blade_macroRecorderStop() {
    if (!document.captureClick) {
        return;
    }

    document.removeEventListener('mouseup', document.captureClick);
}

export function blade_macroRecorderPlayOnce() {
    if (!document.playMacro) {
        return;
    }

    document.playMacro(false);
}

export function blade_macroRecorderPlayLoopStart() {
    if (!document.playMacro) {
        return;
    }

    document.playMacro(true);
}

export function blade_macroRecorderPlayLoopStop() {
    clearTimeout(document.lastTimeoutId);
    document.lastTimeoutId = 0;
}

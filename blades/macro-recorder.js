export function blade_macroRecorderStart() {
    document.macroRecorderEventTap = (event) => {
        const capturedEvent = {
            timestamp: new Date().valueOf(),
            clientX: event.clientX,
            clientY: event.clientY,
        };

        let recordedEvents = localStorage.getItem("chrome-pwr-macro");
        recordedEvents = recordedEvents ? JSON.parse(recordedEvents) : [];
        recordedEvents.push(capturedEvent);
        localStorage.setItem("chrome-pwr-macro", JSON.stringify(recordedEvents));
    };

    localStorage.removeItem("chrome-pwr-macro");
    document.addEventListener('mouseup', document.macroRecorderEventTap);
}

export function blade_macroRecorderStop() {
    document.removeEventListener('mouseup', document.macroRecorderEventTap);
}

export function blade_macroRecorderPlay() {
    let recordedEvents = localStorage.getItem("chrome-pwr-macro");
    recordedEvents = recordedEvents ? JSON.parse(recordedEvents) : null;

    if (!recordedEvents) {
        return;
    }
    
    const next = (index) => {
        if (index >= recordedEvents.length) {
            return;
        }

        const event = recordedEvents[index];
        const element = document.elementFromPoint(event.clientX, event.clientY);
        const parameters = { view: window, bubbles: true, cancelable: true, clientX: event.clientX, clientY: event.clientY, button: 0 };
        element.dispatchEvent(new MouseEvent('mousedown', parameters));
        element.dispatchEvent(new MouseEvent('mouseup', parameters));
        element.dispatchEvent(new MouseEvent('click', parameters));

        setTimeout(() => next(index + 1), 500);
    }

    setTimeout(() => next(0), 500);
}

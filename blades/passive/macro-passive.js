document.captureClick = (event) => {
    if (event.button !== 0 && event.button !== 2) {
        return;
    }

    const capturedClick = {
        timestamp: new Date().valueOf(),
        clientX: event.clientX,
        clientY: event.clientY,
        button: event.button,
        scrollX: window.scrollX,
        scrollY: window.scrollY
    };

    let recordedClicks = localStorage.getItem('chrome-pwr-macro');
    recordedClicks = recordedClicks ? JSON.parse(recordedClicks) : [];
    recordedClicks.push(capturedClick);
    localStorage.setItem('chrome-pwr-macro', JSON.stringify(recordedClicks));
};

document.stopMacro = () => {
    clearTimeout(document.lastTimeoutId);
    document.lastTimeoutId = 0;
    localStorage.removeItem('chrome-pwr-macro-playback-in-progress');
    localStorage.removeItem('chrome-pwr-macro');
    document.clearIndicator();
};

document.macroNext = (clicks, index, loop, initialDelay, macroName, iteration = 0) => {
    if (index >= clicks.length) {
        if (loop) {
            index = 0;
            iteration++;
        } else {
            document.stopMacro();
            return;
        }
    }

    localStorage.setItem('chrome-pwr-macro-playback-in-progress', JSON.stringify({ index, loop, initialDelay, macroName }));

    let delay = initialDelay ? initialDelay : console.error('chrome-pwr: macro initial delay not set or 0');
    if (index > 0) {
        delay = clicks[index].timestamp - clicks[index - 1].timestamp;
    }

    const blinkDuration = 200;
    if (delay > blinkDuration) {
        delay = delay - blinkDuration;
    }

    document.lastTimeoutId = setTimeout(() => {
        const click = clicks[index];

        const xOffset = click.xOffsetIterationMultiplier
            ? iteration * click.xOffsetIterationMultiplier
            : 0;
                
        const yOffset = click.yOffsetIterationMultiplier
            ? iteration * click.yOffsetIterationMultiplier
            : 0;

        const x = click.clientX + xOffset;
        const y = click.clientY + yOffset;

        window.scroll(click.scrollX, click.scrollY);

        const blink = document.createElement('div');
        blink.classList.add('chrome-pwr-blink');
        blink.style.left = `${x - 25}px`;
        blink.style.top = `${y - 25}px`;
        document.body.appendChild(blink);
        setTimeout(() => {
            blink.remove();
        }, blinkDuration / 2);

        document.lastTimeoutId = setTimeout(() => {
            try {
                const element = document.elementFromPoint(x, y);

                const parameters = {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX: x,
                    clientY: y,
                    button: click.button || 0,
                    buttons: click.button || 1,
                };

                element.dispatchEvent(new MouseEvent('mousedown', parameters));
                element.dispatchEvent(new FocusEvent('focus', parameters));
                element.dispatchEvent(new MouseEvent('mouseup', parameters));
                element.dispatchEvent(new MouseEvent(click.button === 2 ? 'contextmenu' : 'click', parameters));
            } catch {
                document.stopMacro();
                return;
            }

            document.macroNext(clicks, index + 1, loop, initialDelay, macroName, iteration);
        }, blinkDuration);
    }, delay);
};

document.playMacro = (startIndex, loop, initialDelay, macroName) => {
    if (document.lastTimeoutId > 0) {
        return;
    }

    document.lastTimeoutId = 0;

    const recordedClicks = JSON.parse(localStorage.getItem('chrome-pwr-macro'));
    if (!recordedClicks) {
        return;
    }

    document.setIndicator('playback', macroName, loop);
    document.macroNext(recordedClicks, startIndex, loop, initialDelay, macroName);
};

document.setIndicator = (type, macroName, loop = false) => {
    let indicatorElement = document.getElementById('chrome-pwr-macro-indicator');
    if (indicatorElement || (type !== 'playback' && type !== 'recording')) {
        return;
    }

    indicatorElement = document.createElement('div');
    indicatorElement.id = 'chrome-pwr-macro-indicator';

    if (type === 'playback') {
        indicatorElement.textContent = `\u25B6 Macro Playback${loop ? ' looped': ''}: ${macroName}`;
        indicatorElement.style.backgroundColor = 'green';
    } else {
        indicatorElement.textContent = `\u2B24 Macro Recording: ${macroName}`;
        indicatorElement.style.backgroundColor = 'red';
    }

    indicatorElement.classList.add(type);
    document.body.appendChild(indicatorElement);
};

document.clearIndicator = () => {
    const indicatorElement = document.getElementById('chrome-pwr-macro-indicator');
    if (indicatorElement) {
        indicatorElement.remove();
    }
};

const recording = localStorage.getItem('chrome-pwr-macro-recording-in-progress');
if (recording) {
    document.addEventListener('mouseup', document.captureClick);
    document.setIndicator('recording', `macro ${Number(recording) + 1}`);
}

const playback = JSON.parse(localStorage.getItem('chrome-pwr-macro-playback-in-progress'));
if (playback) {
    document.playMacro(playback.index, playback.loop, playback.initialDelay, playback.macroName);
}

window.navigation.onnavigate = (event) => {
    if (location.hostname !== new URL(event.destination.url).hostname) {
        clearTimeout(document.lastTimeoutId);
        document.lastTimeoutId = 0;

        localStorage.removeItem('chrome-pwr-macro-playback-in-progress');
        localStorage.removeItem('chrome-pwr-macro-recording-in-progress');

        document.removeEventListener('mouseup', document.captureClick);
        document.clearIndicator();
    }
};

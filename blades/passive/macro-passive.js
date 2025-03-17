document.captureClick = (event) => {
    const capturedClick = {
        timestamp: new Date().valueOf(),
        clientX: event.clientX,
        clientY: event.clientY,
        scrollX: window.scrollX,
        scrollY: window.scrollY
    };

    let recordedClicks = localStorage.getItem('chrome-pwr-macro');
    recordedClicks = recordedClicks ? JSON.parse(recordedClicks) : [];
    recordedClicks.push(capturedClick);
    localStorage.setItem('chrome-pwr-macro', JSON.stringify(recordedClicks));
};

document.macroNext = (clicks, index, loop, initialDelay) => {
    if (index >= clicks.length) {
        if (loop) {
            index = 0;
        } else {
            document.lastTimeoutId = 0;
            localStorage.removeItem('chrome-pwr-macro-playback-in-progress');
            document.clearIndicator('playback');
            return;
        }
    }

    localStorage.setItem('chrome-pwr-macro-playback-in-progress', JSON.stringify({ index, loop, initialDelay }));

    let delay = initialDelay ? initialDelay : console.error('chrome-pwr: macro initial delay not set or 0');
    if (index > 0) {
        delay = clicks[index].timestamp - clicks[index - 1].timestamp;
    }

    const blinkDuration = 200;
    if (delay > blinkDuration) {
        delay = delay - blinkDuration;
    }

    document.lastTimeoutId = setTimeout(() => {
        const capturedClick = clicks[index];
        window.scroll(capturedClick.scrollX, capturedClick.scrollY);

        const blink = document.createElement('div');
        blink.classList.add('chrome-pwr-blink');
        blink.style.left = `${capturedClick.clientX - 25}px`;
        blink.style.top = `${capturedClick.clientY - 25}px`;
        document.body.appendChild(blink);
        setTimeout(() => {
            blink.remove();
        }, blinkDuration / 2);

        document.lastTimeoutId = setTimeout(() => {
            const element = document.elementFromPoint(capturedClick.clientX, capturedClick.clientY);
            const parameters = { view: window, bubbles: true, cancelable: true, clientX: capturedClick.clientX, clientY: capturedClick.clientY, button: 0 };

            element.dispatchEvent(new MouseEvent('mousedown', parameters));
            element.dispatchEvent(new FocusEvent('focus', parameters));
            element.dispatchEvent(new MouseEvent('mouseup', parameters));
            element.dispatchEvent(new MouseEvent('click', parameters));

            document.macroNext(clicks, index + 1, loop, initialDelay);
        }, blinkDuration);
    }, delay);
};

document.playMacro = (startIndex, loop, initialDelay) => {
    if (document.lastTimeoutId > 0) {
        return;
    }

    document.lastTimeoutId = 0;

    const recordedClicks = JSON.parse(localStorage.getItem('chrome-pwr-macro'));
    if (!recordedClicks) {
        return;
    }

    document.setIndicator('playback');
    document.macroNext(recordedClicks, startIndex, loop, initialDelay);
};

document.setIndicator = (type) => {
    let indicatorElement = document.getElementById('chrome-pwr-macro-indicator');
    if (indicatorElement || (type !== 'playback' && type !== 'recording')) {
        return;
    }

    indicatorElement = document.createElement('div');
    indicatorElement.id = 'chrome-pwr-macro-indicator';

    if (type === 'playback') {
        indicatorElement.textContent = '\u25B6 Macro Playback';
        indicatorElement.style.backgroundColor = 'green';
    } else {
        indicatorElement.textContent = '\u2B24 Macro Recording';
        indicatorElement.style.backgroundColor = 'red';
    }

    indicatorElement.classList.add(type);
    document.body.appendChild(indicatorElement);
};

document.clearIndicator = (type) => {
    const indicatorElement = document.getElementById('chrome-pwr-macro-indicator');
    if (indicatorElement && indicatorElement.classList.contains(type)) {
        indicatorElement.remove();
    }
};

if (localStorage.getItem('chrome-pwr-macro-recording-in-progress')) {
    document.addEventListener('mouseup', document.captureClick);
    document.setIndicator('recording');
}

const playbackProgress = JSON.parse(localStorage.getItem('chrome-pwr-macro-playback-in-progress'));
if (playbackProgress) {
    document.playMacro(playbackProgress.index, playbackProgress.loop, playbackProgress.initialDelay);
}

window.navigation.onnavigate = (event) => {
    if (location.hostname !== new URL(event.destination.url).hostname) {
        clearTimeout(document.lastTimeoutId);
        document.lastTimeoutId = 0;

        localStorage.removeItem('chrome-pwr-macro-playback-in-progress');
        localStorage.removeItem('chrome-pwr-macro-recording-in-progress');

        document.removeEventListener('mouseup', document.captureClick);

        document.clearIndicator('playback');
        document.clearIndicator('recording');
    }
};

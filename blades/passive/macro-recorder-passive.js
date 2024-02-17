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
        }
        else {
            document.lastTimeoutId = 0;
            localStorage.removeItem('chrome-pwr-macro-playback-in-progress');
            document.clearIndicator('playback');
            return;
        }
    }

    let delay = initialDelay ? initialDelay : console.error('chrome-pwr: macro initial delay not set or 0');
    if (index > 0) {
        delay = clicks[index].timestamp - clicks[index - 1].timestamp;
    }

    localStorage.setItem('chrome-pwr-macro-playback-in-progress', JSON.stringify({ index, loop, initialDelay }));

    document.lastTimeoutId = setTimeout(() => {
        const capturedClick = clicks[index];
        window.scroll(capturedClick.scrollX, capturedClick.scrollY);

        const element = document.elementFromPoint(capturedClick.clientX, capturedClick.clientY);
        const parameters = { view: window, bubbles: true, cancelable: true, clientX: capturedClick.clientX, clientY: capturedClick.clientY, button: 0 };
        element.dispatchEvent(new MouseEvent('mousedown', parameters));
        element.dispatchEvent(new MouseEvent('mouseup', parameters));
        element.dispatchEvent(new MouseEvent('click', parameters));

        document.macroNext(clicks, index + 1, loop, initialDelay);
    }, delay);
};

document.playMacro = (startIndex, loop, initialDelay) => {
    if (document.lastTimeoutId > 0) {
        return;
    }

    document.lastTimeoutId = 0;

    let recordedClicks = localStorage.getItem('chrome-pwr-macro');
    recordedClicks = recordedClicks ? JSON.parse(recordedClicks) : null;

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

    indicatorElement = document.createElement("div");
    indicatorElement.id = 'chrome-pwr-macro-indicator';

    if (type === 'playback') {
        indicatorElement.innerText = '\u25B6 Macro Playback';
        indicatorElement.style.backgroundColor = 'green';
    } else {
        indicatorElement.innerText = '\u2B24 Macro Recording';
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

// runs immediately
const indicatorStyle = document.createElement('style');
indicatorStyle.innerHTML = `
    @import url('https://fonts.cdnfonts.com/css/8bit-wonder');
    #chrome-pwr-macro-indicator {
        position: fixed;
        z-index: 2147483647;
        pointer-events: none;
        top: 10px;
        left: 10px;
        padding: 5px 15px;
        border-radius: 20px;
        opacity: 0.71;
        font-family: '8BIT WONDER', sans-serif;
        color: white;
        text-align: center;
    }
`;

document.head.append(indicatorStyle);

if (localStorage.getItem('chrome-pwr-macro-recording-in-progress')) {
    document.addEventListener('mouseup', document.captureClick);
    document.setIndicator('recording');
}

const playbackProgressJson = localStorage.getItem('chrome-pwr-macro-playback-in-progress');
if (playbackProgressJson) {
    const playbackProgress = JSON.parse(playbackProgressJson);
    document.playMacro(playbackProgress.index, playbackProgress.loop, playbackProgress.initialDelay);
}

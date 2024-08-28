window.onload = () => {
    const maxScrollDirection = localStorage.getItem('max-scroll-direction');
    if (maxScrollDirection) {
        document.getElementById(`max-scroll-direction-${maxScrollDirection}`).checked = true;
    } else {
        document.getElementById('max-scroll-direction-down').checked = true;
    }

    const delaySliderValue = localStorage.getItem('macro-recorder-delay-slider');
    if (delaySliderValue) {
        document.getElementById('macro-recorder-delay-slider').value = delaySliderValue;
        document.getElementById('macro-recorder-delay-value').innerText = `${delaySliderValue / 1000}`;
    }

    const savedShowMisc = localStorage.getItem('show-misc');
    const showMisc = savedShowMisc === 'true' || savedShowMisc === null;
    document.getElementById('foldable-misc').classList.toggle('hidden', !showMisc);
    document.getElementById('foldable-misc-checkbox').checked = showMisc;

    const savedShowMacros = localStorage.getItem('show-macros');
    const showMacros = savedShowMacros === 'true' || savedShowMacros === null;
    document.getElementById('foldable-macros').classList.toggle('hidden', !showMacros);
    document.getElementById('foldable-macros-checkbox').checked = showMacros;

    const savedShowAudio = localStorage.getItem('show-audio');
    const showAudio = savedShowAudio === 'true' || savedShowAudio === null;
    document.getElementById('foldable-audio').classList.toggle('hidden', !showAudio);
    document.getElementById('foldable-audio-checkbox').checked = showAudio;
};

document.getElementById('foldable-misc-checkbox').onclick = (event) => {
    document.getElementById('foldable-misc').classList.toggle('hidden', !event.target.checked);
    localStorage.setItem('show-misc', event.target.checked);
};

document.getElementById('foldable-macros-checkbox').onclick = (event) => {
    document.getElementById('foldable-macros').classList.toggle('hidden', !event.target.checked);
    localStorage.setItem('show-macros', event.target.checked);
};

document.getElementById('foldable-audio-checkbox').onclick = (event) => {
    document.getElementById('foldable-audio').classList.toggle('hidden', !event.target.checked);
    localStorage.setItem('show-audio', event.target.checked);
};

document.getElementById('max-scroll-start-element').onclick = async () => {
    await chrome.runtime.sendMessage({
        triggerBlade: 'maxScrollStartElement',
        params: {
            direction: document.getElementById('max-scroll-direction-up').checked ? 'up' : 'down'
        }
    });
};

document.getElementById('max-scroll-start-window').onclick = async () => {
    await chrome.runtime.sendMessage({
        triggerBlade: 'maxScrollStartWindow',
        params: {
            direction: document.getElementById('max-scroll-direction-up').checked ? 'up' : 'down'
        }
    });
};

document.getElementById('max-scroll-cancel').onclick = async () => {
    await chrome.runtime.sendMessage({
        triggerBlade: 'maxScrollCancel'
    });
};

document.getElementById('forced-css-add').onclick = async () => {
    await chrome.runtime.sendMessage({
        triggerBlade: 'forcedCssAdd'
    });
};

document.getElementById('forced-css-clear').onclick = async () => {
    await chrome.runtime.sendMessage({
        triggerBlade: 'forcedCssClear'
    });
};

document.getElementById('content-edit-on').onclick = async () => {
    await chrome.runtime.sendMessage({
        triggerBlade: 'contentEditOn'
    });
};

document.getElementById('content-edit-off').onclick = async () => {
    await chrome.runtime.sendMessage({
        triggerBlade: 'contentEditOff'
    });
};

document.getElementById('macro-recorder-start').onclick = async () => {
    await chrome.runtime.sendMessage({
        triggerBlade: 'macroRecorderStart'
    });
};

document.getElementById('macro-recorder-stop').onclick = async () => {
    await chrome.runtime.sendMessage({
        triggerBlade: 'macroRecorderStop'
    });
};

document.getElementById('macro-recorder-play-once').onclick = async () => {
    await chrome.runtime.sendMessage({
        triggerBlade: 'macroRecorderPlayOnce',
        params: {
            initialDelay: document.getElementById('macro-recorder-delay-slider').value
        }
    });
};

document.getElementById('macro-recorder-play-loop-start').onclick = async () => {
    await chrome.runtime.sendMessage({
        triggerBlade: 'macroRecorderPlayLoopStart',
        params: {
            initialDelay: document.getElementById('macro-recorder-delay-slider').value
        }
    });
};

document.getElementById('macro-recorder-stop-playback').onclick = async () => {
    await chrome.runtime.sendMessage({
        triggerBlade: 'macroRecorderStopPlayback'
    });
};

document.querySelectorAll('[name=max-scroll-direction]').forEach((element) => {
    element.onchange = (event) => {
        localStorage.setItem('max-scroll-direction', event.target.value);
    }
});

document.getElementById('macro-recorder-delay-slider').oninput = (event) => {
    document.getElementById('macro-recorder-delay-value').innerText = `${event.target.value / 1000}`;
    localStorage.setItem('macro-recorder-delay-slider', event.target.value);
};

chrome.commands.onCommand.addListener(async (command) => {
    const supportedCommands = [
        'macroRecorderPlayOnce',
        'macroRecorderPlayLoopStart',
        'macroRecorderStopPlayback'
    ];

    if (!supportedCommands.includes(command)) {
        return;
    }

    await chrome.runtime.sendMessage({
        triggerBlade: command,
        params: {
            initialDelay: document.getElementById('macro-recorder-delay-slider').value
        }
    });
});

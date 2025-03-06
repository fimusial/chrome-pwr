import { scriptRequiresApis } from './script-requires-apis.js';

scriptRequiresApis(['runtime', 'commands']);

window.onload = () => {
    const maxScrollDirection = localStorage.getItem('max-scroll-direction');
    if (maxScrollDirection) {
        document.getElementById(`max-scroll-direction-${maxScrollDirection}`).checked = true;
    } else {
        document.getElementById('max-scroll-direction-down').checked = true;
    }

    const delaySliderValue = localStorage.getItem('macro-delay-slider');
    if (delaySliderValue) {
        document.getElementById('macro-delay-slider').value = delaySliderValue;
        document.getElementById('macro-delay-value').textContent = `${delaySliderValue / 1000}`;
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

window.onblur = () => {
    window.close();
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
        blade: 'maxScrollStartElement',
        params: {
            direction: document.getElementById('max-scroll-direction-up').checked ? 'up' : 'down'
        }
    });
};

document.getElementById('max-scroll-start-window').onclick = async () => {
    await chrome.runtime.sendMessage({
        blade: 'maxScrollStartWindow',
        params: {
            direction: document.getElementById('max-scroll-direction-up').checked ? 'up' : 'down'
        }
    });
};

document.getElementById('max-scroll-cancel').onclick = async () => {
    await chrome.runtime.sendMessage({
        blade: 'maxScrollCancel'
    });
};

document.getElementById('forced-css-download').onclick = async () => {
    await chrome.runtime.sendMessage({
        blade: 'forcedCssDownload'
    });
};

document.getElementById('forced-css-upload').onclick = async () => {
    await chrome.runtime.sendMessage({
        blade: 'forcedCssUpload'
    });
};

document.getElementById('forced-css-clear').onclick = async () => {
    await chrome.runtime.sendMessage({
        blade: 'forcedCssClear'
    });
};

document.getElementById('content-edit-on').onclick = async () => {
    await chrome.runtime.sendMessage({
        blade: 'contentEditOn'
    });
};

document.getElementById('content-edit-off').onclick = async () => {
    await chrome.runtime.sendMessage({
        blade: 'contentEditOff'
    });
};

document.getElementById('macro-start').onclick = async () => {
    await chrome.runtime.sendMessage({
        blade: 'macroStart'
    });
};

document.getElementById('macro-stop').onclick = async () => {
    await chrome.runtime.sendMessage({
        blade: 'macroStop'
    });
};

document.getElementById('macro-play-once').onclick = async () => {
    await chrome.runtime.sendMessage({
        blade: 'macroPlayOnce',
        params: {
            initialDelay: document.getElementById('macro-delay-slider').value
        }
    });
};

document.getElementById('macro-play-loop-start').onclick = async () => {
    await chrome.runtime.sendMessage({
        blade: 'macroPlayLoopStart',
        params: {
            initialDelay: document.getElementById('macro-delay-slider').value
        }
    });
};

document.getElementById('macro-stop-playback').onclick = async () => {
    await chrome.runtime.sendMessage({
        blade: 'macroStopPlayback'
    });
};

document.getElementById('volume-duck-button').onclick = () => {
    location.href = '/volume-duck/volume-duck.html';
};

document.querySelectorAll('[name=max-scroll-direction]').forEach((element) => {
    element.onchange = (event) => {
        localStorage.setItem('max-scroll-direction', event.target.value);
    };
});

document.getElementById('macro-delay-slider').oninput = (event) => {
    document.getElementById('macro-delay-value').textContent = `${event.target.value / 1000}`;
};

document.getElementById('macro-delay-slider').onchange = (event) => {
    localStorage.setItem('macro-delay-slider', event.target.value);
};

chrome.commands.onCommand.addListener(async (command) => {
    const supportedCommands = [
        'macroPlayOnce',
        'macroPlayLoopStart',
        'macroStopPlayback'
    ];

    if (!supportedCommands.includes(command)) {
        return;
    }

    await chrome.runtime.sendMessage({
        blade: command,
        params: {
            initialDelay: document.getElementById('macro-delay-slider').value
        }
    });
});

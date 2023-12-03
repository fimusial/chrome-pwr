document.getElementById('max-scroll-trigger').onclick = async () => {
    await chrome.runtime.sendMessage({
        triggerBlade: 'maxScrollStart'
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

document.getElementById('macro-recorder-play-loop-stop').onclick = async () => {
    await chrome.runtime.sendMessage({
        triggerBlade: 'macroRecorderPlayLoopStop'
    });
};

document.getElementById('macro-recorder-delay-slider').oninput = (event) => {
    document.getElementById('macro-recorder-delay-display').innerText = `initial / loop delay: ${event.target.value / 1000} sec`;
    localStorage.setItem('macro-recorder-delay-slider', event.target.value);
}

window.onload = () => {
    const value = localStorage.getItem('macro-recorder-delay-slider');
    if (value) {
        document.getElementById('macro-recorder-delay-slider').value = value;
        document.getElementById('macro-recorder-delay-display').innerText = `initial / loop delay: ${value / 1000} sec`;
    }
}

chrome.commands.onCommand.addListener(async (command) => {
    await chrome.runtime.sendMessage({
        triggerBlade: command,
        params: {
            initialDelay: document.getElementById('macro-recorder-delay-slider').value
        }
    });
});

import { scriptRequiresApis } from './script-requires-apis.js';
import { MacroStorage } from './macro-storage.js';

scriptRequiresApis(['tabs', 'runtime', 'commands']);

const macroStorage = new MacroStorage();
const macroSlotsSelect = document.getElementById('macro-slots');

const createMacroSlotOption = (macro) => {
    const option = document.createElement('option');
    option.textContent = macro.name;
    option.setAttribute('slotIndex', macro.slotIndex);
    return option;
};

const createNewMacroSlotOption = (slotIndex) => {
    const option = createMacroSlotOption({ name: 'new slot', slotIndex: slotIndex });
    option.setAttribute('newSlot', 'true');
    return option;
};

const renderMacroSlotOptions = (hostname) => {
    const { macros, maxSlotIndex } = macroStorage.getPageMacrosInfo(hostname);

    macroSlotsSelect.replaceChildren(
        ...macros.map(createMacroSlotOption),
        createNewMacroSlotOption(maxSlotIndex + 1));

    macroSlotsSelect.firstChild.selected = true;
};

const loadMacroSlots = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
        return;
    }

    const hostname = new URL(tab.url).hostname;
    renderMacroSlotOptions(hostname);

    macroSlotsSelect.ondblclick = () => {
        const promptResult = prompt('slot name:');
        if (!promptResult) {
            return;
        }

        const slotName = promptResult.slice(0, 16);
        const selectedOption = Array.from(macroSlotsSelect.children).find(x => x.selected);
        const slotIndex = Number(selectedOption.getAttribute('slotIndex'));

        selectedOption.textContent = slotName;
        macroStorage.setSlotName(hostname, slotIndex, slotName);
        renderMacroSlotOptions(hostname);
        Array.from(macroSlotsSelect.children)[slotIndex].selected = true;
    };
};

window.onload = async () => {
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

    await loadMacroSlots();
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

document.getElementById('macro-start-recording').onclick = async () => {
    await chrome.runtime.sendMessage({
        blade: 'macroStartRecording',
        params: {
            slotIndex: Number(document.querySelector('#macro-slots option:checked').getAttribute('slotIndex'))
        }
    });
};

document.getElementById('macro-stop-recording').onclick = async () => {
    const response = await chrome.runtime.sendMessage({
        blade: 'macroStopRecording'
    });

    console.log(`popup callback time: ${new Date().getTime()}, response: ${response}`);
};

document.getElementById('macro-play-once').onclick = async () => {
    await chrome.runtime.sendMessage({
        blade: 'macroPlayOnce',
        params: {
            initialDelay: document.getElementById('macro-delay-slider').value,
            slotIndex: Number(document.querySelector('#macro-slots option:checked').getAttribute('slotIndex'))
        }
    });
};

document.getElementById('macro-play-loop').onclick = async () => {
    await chrome.runtime.sendMessage({
        blade: 'macroPlayLoop',
        params: {
            initialDelay: document.getElementById('macro-delay-slider').value,
            slotIndex: Number(document.querySelector('#macro-slots option:checked').getAttribute('slotIndex'))
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
        'macroPlayLoop',
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

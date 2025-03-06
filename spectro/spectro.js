import { scriptRequiresApis } from '../script-requires-apis.js';
import { VisualizerHandler } from './visualizers/visualizer-handler.js';

scriptRequiresApis(['tabs', 'windows', 'runtime', 'tabCapture']);

const spectroCanvas = document.getElementById('spectro-canvas');
const visualizerHandler = new VisualizerHandler(spectroCanvas, 'spectro');
visualizerHandler.start();

const spectroCanvasPopOutButton = document.getElementById('spectro-canvas-pop-out-button');
spectroCanvasPopOutButton.onclick = async () => {
    const openTabs = await chrome.tabs.query({ title: 'chrome-extension://*/spectro/spectro-pop-out.html#chrome-pwr' });
    if (openTabs && openTabs.length) {
        return;
    }

    let windowBounds = localStorage.getItem('spectro-pop-out-window-bounds');
    windowBounds = windowBounds ? JSON.parse(windowBounds) : {};
    chrome.windows.create({
        url: 'spectro/spectro-pop-out.html#chrome-pwr',
        type: 'popup',
        left: windowBounds.left,
        top: windowBounds.top,
        width: windowBounds.width,
        height: windowBounds.height
    }).catch(() => {
        localStorage.setItem('spectro-pop-out-window-bounds', '{}');
        chrome.windows.create({
            url: 'spectro/spectro-pop-out.html#chrome-pwr',
            type: 'popup'
        });
    });
};

const hpSlider = document.getElementById('spectro-hp-slider');
const lpSlider = document.getElementById('spectro-lp-slider');
const hpSliderValueDisplay = document.getElementById('spectro-hp-value-display');
const lpSliderValueDisplay = document.getElementById('spectro-lp-value-display');
const savedHpValue = localStorage.getItem('spectro-hp-value');
const savedLpValue = localStorage.getItem('spectro-lp-value');

hpSlider.value = savedHpValue === null ? 0 : Number(savedHpValue);
lpSlider.value = savedLpValue === null ? 100 : Number(savedLpValue);

const filterSliderValueToFrequency = (value) => {
    const normalized = Number(value) / 100;
    let curvedValue = Math.pow(normalized, 2.5);
    return Math.min(Math.max(Math.round(curvedValue * 22000), 0), 22000);
};

const updateFilterSliderDisplayValues = () => {
    hpSliderValueDisplay.textContent = filterSliderValueToFrequency(hpSlider.value);
    lpSliderValueDisplay.textContent = filterSliderValueToFrequency(lpSlider.value);
};

updateFilterSliderDisplayValues();

const onFilterSliderInput = async (event) => {
    const isHpSlider = hpSlider == event.target;
    const isLpSlider = lpSlider == event.target;
    const rangeMin = 0;
    const rangeMax = 100;
    const space = 7;

    let x = Number(hpSlider.value);
    let y = Number(lpSlider.value);

    // repel sliders
    if (isHpSlider && x > y - space) {
        if (x > rangeMax - space) {
            x = rangeMax - space;
        } else {
            y = x + space;
        }
    } else if (isLpSlider && y < x + space) {
        if (y < rangeMin + space) {
            y = rangeMin + space;
        } else {
            x = y - space;
        }
    }

    hpSlider.value = x;
    lpSlider.value = y;
    localStorage.setItem('spectro-hp-value', x);
    localStorage.setItem('spectro-lp-value', y);

    updateFilterSliderDisplayValues();

    await chrome.runtime.sendMessage({
        hub: 'updateAudioFilters',
        params: {
            hp: filterSliderValueToFrequency(hpSlider.value),
            lp: filterSliderValueToFrequency(lpSlider.value)
        }
    });
};

hpSlider.oninput = onFilterSliderInput;
lpSlider.oninput = onFilterSliderInput;

const tabButton = document.getElementById('spectro-capture-button');
const tabNameSpan = document.getElementById('spectro-tab-name-span');
const recordingButton = document.getElementById('spectro-recording-button');
let capturedTabId = 0;

const setCaptureInfo = (tab) => {
    tabNameSpan.textContent = tab.title;
    capturedTabId = tab.id;
    tabButton.setAttribute('audioCaptureLive', 'true');
    recordingButton.setAttribute('audioCaptureLive', 'true');
    visualizerHandler.shortHubCircuit = false;
};

const clearCaptureInfo = () => {
    tabNameSpan.textContent = '';
    capturedTabId = 0;
    tabButton.removeAttribute('audioCaptureLive');
    recordingButton.removeAttribute('audioCaptureLive');
    visualizerHandler.shortHubCircuit = true;
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tabId === capturedTabId && changeInfo.title) {
        setCaptureInfo(tab);
    }
});

chrome.runtime.sendMessage({ hub: 'getCapturedTabId', params: {} }).then((response) => {
    if (!response || !response.capturedTabId) {
        clearCaptureInfo();
        return;
    }

    chrome.tabs.get(response.capturedTabId, (tab) => {
        if (tab) {
            // capture already started
            setCaptureInfo(tab);
        } else {
            // tab was closed while capturing
            chrome.runtime.sendMessage({
                hub: 'stopTabCapture',
                params: {}
            });

            clearCaptureInfo();
        }
    });
});

tabButton.onclick = async () => {
    const response = await chrome.runtime.sendMessage({ hub: 'getCapturedTabId', params: {} });
    if (response && response.capturedTabId > 0) {
        await chrome.runtime.sendMessage({
            hub: 'stopTabCapture',
            params: {}
        });

        clearCaptureInfo();
    } else {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
            return;
        }

        const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
        await chrome.runtime.sendMessage({
            hub: 'startTabCapture',
            params: {
                streamId: streamId,
                tabId: tab.id,
                hp: filterSliderValueToFrequency(hpSlider.value),
                lp: filterSliderValueToFrequency(lpSlider.value)
            }
        });

        setCaptureInfo(tab);
    }
};

const setRecordingInfo = (audioRecordingState) => {
    if (audioRecordingState === 'recording') {
        recordingButton.textContent = 'stop audio recording';
        recordingButton.setAttribute('audioRecordingLive', 'true');
    } else {
        recordingButton.textContent = 'start audio recording';
        recordingButton.removeAttribute('audioRecordingLive');
    }
};

chrome.runtime.sendMessage({ hub: 'getAudioRecordingState', params: {} }).then(setRecordingInfo);

recordingButton.onclick = async () => {
    const response = await chrome.runtime.sendMessage({
        hub: 'toggleAudioRecording',
        params: {}
    });

    setRecordingInfo(response);
};

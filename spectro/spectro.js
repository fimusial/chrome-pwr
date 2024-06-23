import { MovingSpectrogramVisualizer } from './visualizers/moving-spectrogram-visualizer.js';
import { WaveformGraphVisualizer } from './visualizers/waveform-graph-visualizer.js';
import { VolumeBarsVisualizer } from './visualizers/volume-bars-visualizer.js';

const spectroCanvas = document.getElementById('spectro-canvas');
const savedCurrentVisualizer = localStorage.getItem('spectro-current-visualizer');
const visualizers = [
    new MovingSpectrogramVisualizer(spectroCanvas),
    new WaveformGraphVisualizer(spectroCanvas),
    new VolumeBarsVisualizer(spectroCanvas)
];

let currentVisualizer = savedCurrentVisualizer === null ? 0 : Number(savedCurrentVisualizer);

spectroCanvas.onclick = () => {
    currentVisualizer = (currentVisualizer + 1) % visualizers.length;
    visualizers[currentVisualizer].reset();
    localStorage.setItem('spectro-current-visualizer', currentVisualizer);
};

const nextVisualizerDraw = () => {
    const visualizer = visualizers[currentVisualizer];
    setTimeout(nextVisualizerDraw, visualizer.nextDrawDelayMs);

    chrome.runtime.sendMessage({ audioHub: visualizer.audioHubMethod, params: {} }).then((response) => {
        if (response && response.data) {
            visualizer.pushData(response.data);
        } else {
            visualizer.pushPlaceholder();
        }

        visualizer.draw();
    });
};

nextVisualizerDraw();

const tabButton = document.getElementById('spectro-capture-button');
const tabNameSpan = document.getElementById('spectro-tab-name-span');
const recordingButton = document.getElementById('spectro-recording-button');
let capturedTabId = 0;

const setCaptureInfo = (tab) => {
    tabNameSpan.innerText = tab.title;
    capturedTabId = tab.id;
    tabButton.setAttribute('audioCaptureLive', 'true');
    recordingButton.setAttribute('audioCaptureLive', 'true');
};

const clearCaptureInfo = () => {
    tabNameSpan.innerText = '';
    capturedTabId = 0;
    tabButton.removeAttribute('audioCaptureLive');
    recordingButton.removeAttribute('audioCaptureLive');
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tabId === capturedTabId && changeInfo.title) {
        setCaptureInfo(tab);
    }
});

const toggleCaptureInfo = () => {
    if (capturedTabId !== 0) {
        clearCaptureInfo();
        return;
    }

    chrome.runtime.sendMessage({ audioHub: 'getCapturedTabId', params: {} }).then((response) => {
        if (!response || !response.capturedTabId) {
            // no tab id and no capture - all good
            return;
        }

        chrome.tabs.get(response.capturedTabId, (tab) => {
            if (tab) {
                // capture already started
                setCaptureInfo(tab);
            } else {
                // tab was closed while capturing
                chrome.offscreen.closeDocument();
                clearCaptureInfo();
            }
        });
    });
};

toggleCaptureInfo();

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
    return Math.round(curvedValue * 24000);
};

const updateFilterSliderDisplayValues = () => {
    hpSliderValueDisplay.innerText = filterSliderValueToFrequency(hpSlider.value);
    lpSliderValueDisplay.innerText = filterSliderValueToFrequency(lpSlider.value);
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
        audioHub: 'updateAudioFilters',
        params: {
            hp: filterSliderValueToFrequency(hpSlider.value),
            lp: filterSliderValueToFrequency(lpSlider.value)
        }
    });
};

hpSlider.oninput = onFilterSliderInput;
lpSlider.oninput = onFilterSliderInput;

tabButton.onclick = async () => {
    const existingContexts = await chrome.runtime.getContexts({});
    const offscreenDocumentExists = !!existingContexts.find((context) => context.contextType === 'OFFSCREEN_DOCUMENT');
    if (offscreenDocumentExists) {
        chrome.offscreen.closeDocument();
        toggleCaptureInfo();
        return;
    }

    await chrome.offscreen.createDocument({
        url: 'spectro/offscreen-audio-hub.html',
        reasons: ['USER_MEDIA'],
        justification: 'Chrome PWR tab audio capture'
    });

    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });

    await chrome.runtime.sendMessage({
        audioHub: 'startTabCapture',
        params: {
            streamId: streamId,
            tabId: tab.id,
            hp: filterSliderValueToFrequency(hpSlider.value),
            lp: filterSliderValueToFrequency(lpSlider.value)
        }
    });

    toggleCaptureInfo();
};

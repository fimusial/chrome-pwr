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

const tabButton = document.getElementById('spectro-tab-button');
const tabNameSpan = document.getElementById('spectro-tab-name-span');
let capturedTabId = 0;

const sePlaybackInfo = (tab) => {
    tabNameSpan.innerText = tab.title;
    capturedTabId = tab.id;
    tabButton.setAttribute('audioPlayback', 'true');
};

const removePlaybackInfo = () => {
    tabNameSpan.innerText = '';
    capturedTabId = 0;
    tabButton.removeAttribute('audioPlayback');
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tabId === capturedTabId && changeInfo.title) {
        sePlaybackInfo(tab);
    }
});

const toggleCapturedTabId = () => {
    if (capturedTabId !== 0) {
        removePlaybackInfo();
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
                sePlaybackInfo(tab);
            } else {
                // tab was closed while capturing
                chrome.offscreen.closeDocument();
                removePlaybackInfo();
            }
        });
    });
};

toggleCapturedTabId();

const hpSlider = document.getElementById('spectro-hp-slider');
const lpSlider = document.getElementById('spectro-lp-slider');
const hpSliderValueDisplay = document.getElementById('spectro-hp-value-display');
const lpSliderValueDisplay = document.getElementById('spectro-lp-value-display');
const savedHpValue = localStorage.getItem('spectro-hp-value');
const savedLpValue = localStorage.getItem('spectro-lp-value');

hpSlider.value = savedHpValue === null ? 0 : Number(savedHpValue);
lpSlider.value = savedLpValue === null ? 100 : Number(savedLpValue);

const sliderValueToCurvedFrequency = (value) => {
    const normalized = Number(value) / 100;
    let curvedValue = Math.pow(normalized, 2.5);
    return Math.round(curvedValue * 24000);
};

const updateSliderDisplayValues = () => {
    hpSliderValueDisplay.innerText = sliderValueToCurvedFrequency(hpSlider.value);
    lpSliderValueDisplay.innerText = sliderValueToCurvedFrequency(lpSlider.value);
};

updateSliderDisplayValues();

const onSliderInput = async (event) => {
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

    updateSliderDisplayValues();

    await chrome.runtime.sendMessage({
        audioHub: 'updateAudioFilters',
        params: {
            hp: sliderValueToCurvedFrequency(hpSlider.value),
            lp: sliderValueToCurvedFrequency(lpSlider.value)
        }
    });
};

hpSlider.oninput = onSliderInput;
lpSlider.oninput = onSliderInput;

tabButton.onclick = async () => {
    const existingContexts = await chrome.runtime.getContexts({});
    const offscreenDocumentExists = !!existingContexts.find((context) => context.contextType === 'OFFSCREEN_DOCUMENT');
    if (offscreenDocumentExists) {
        chrome.offscreen.closeDocument();
        toggleCapturedTabId();
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
            hp: sliderValueToCurvedFrequency(hpSlider.value),
            lp: sliderValueToCurvedFrequency(lpSlider.value)
        }
    });

    toggleCapturedTabId();
};

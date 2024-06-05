import { MovingSpectrogramVisualizer } from './visualizers/moving-spectrogram-visualizer.js';
import { WaveformGraphVisualizer } from './visualizers/waveform-graph-visualizer.js';
import { VolumeBarsVisualizer } from './visualizers/volume-bars-visualizer.js';

const spectroCanvas = document.getElementById('spectro-canvas');
const visualizers = [
    new MovingSpectrogramVisualizer(spectroCanvas),
    new WaveformGraphVisualizer(spectroCanvas),
    new VolumeBarsVisualizer(spectroCanvas)
];

let currentVisualizer = Number(localStorage.getItem('spectro-current-visualizer'));

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

const tabNameSpan = document.getElementById('spectro-tab-name-span');
let capturedTabId = 0;
const onTabUpdated = (tabId, changeInfo, tab) => {
    if (tabId === capturedTabId && changeInfo.title) {
        tabNameSpan.innerText = tab.title;
    }
};

chrome.tabs.onUpdated.addListener(onTabUpdated);

const toggleCapturedTabId = () => {
    if (capturedTabId !== 0) {
        tabNameSpan.innerText = '';
        capturedTabId = 0;
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
                tabNameSpan.innerText = tab.title;
                capturedTabId = tab.id;
            } else {
                // tab was closed while capturing
                chrome.offscreen.closeDocument();
                tabNameSpan.innerText = '';
                capturedTabId = 0;
            }
        });
    });
};

toggleCapturedTabId();

document.getElementById('spectro-tab-button').onclick = async () => {
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
    await chrome.runtime.sendMessage({ audioHub: 'startTabCapture', params: { streamId: streamId, tabId: tab.id } });
    toggleCapturedTabId();
};

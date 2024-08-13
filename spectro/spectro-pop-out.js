import { VisualizerHandler } from './visualizers/visualizer-handler.js';

const spectroCanvas = document.getElementById('spectro-canvas');
const visualizerHandler = new VisualizerHandler(spectroCanvas);
visualizerHandler.start();

document.getElementById('spectro-canvas-rotate').onclick = () => {
    visualizerHandler.toggleOrientation();
};

document.getElementById('spectro-canvas-allow-stretch').onclick = () => {
    spectroCanvas.classList.toggle('stretchable');
};

chrome.tabs.onRemoved.addListener((removedTabId, removeInfo) => {
    chrome.runtime.sendMessage({ audioHub: 'getCapturedTabId', params: {} }).then((response) => {
        if (response && response.capturedTabId && removedTabId === response.capturedTabId) {
            chrome.runtime.sendMessage({ audioHub: 'stopTabCapture', params: {} });
        }
    });
});

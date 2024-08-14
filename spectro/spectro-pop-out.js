import { VisualizerHandler } from './visualizers/visualizer-handler.js';

const spectroCanvas = document.getElementById('spectro-canvas');

const resizeCanvas = () => {
    spectroCanvas.width = document.body.clientWidth;
    spectroCanvas.height = document.body.clientHeight;
};

window.onresize = resizeCanvas;
window.onload = resizeCanvas;

const visualizerHandler = new VisualizerHandler(spectroCanvas);
visualizerHandler.start();

document.getElementById('spectro-canvas-rotate').onclick = () => {
    resizeCanvas();
    visualizerHandler.toggleOrientation();
};

chrome.tabs.onRemoved.addListener((removedTabId, removeInfo) => {
    chrome.runtime.sendMessage({ audioHub: 'getCapturedTabId', params: {} }).then((response) => {
        if (response && response.capturedTabId && removedTabId === response.capturedTabId) {
            chrome.runtime.sendMessage({ audioHub: 'stopTabCapture', params: {} });
        }
    });
});

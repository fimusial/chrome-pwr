import { scriptRequiresApis } from '../script-requires-apis.js';
import { VisualizerHandler } from './visualizers/visualizer-handler.js';

scriptRequiresApis(['tabs', 'runtime']);

const spectroCanvas = document.getElementById('spectro-canvas');

const resizeCanvas = () => {
    spectroCanvas.width = document.body.clientWidth;
    spectroCanvas.height = document.body.clientHeight;
};

window.onresize = resizeCanvas;
window.onload = resizeCanvas;

const visualizerHandler = new VisualizerHandler(spectroCanvas);
visualizerHandler.start();

document.getElementById('spectro-canvas-toggle-orientation-button').onclick = () => {
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

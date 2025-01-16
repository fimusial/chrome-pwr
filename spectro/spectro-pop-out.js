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

const hueSlider = document.getElementById('spectro-hue-slider');
const satSlider = document.getElementById('spectro-sat-slider');
const litSlider = document.getElementById('spectro-lit-slider');
const hueLabel = document.getElementById('spectro-hue-slider-label');
const satLabel = document.getElementById('spectro-sat-slider-label');
const litLabel = document.getElementById('spectro-lit-slider-label');

hueSlider.oninput = () => {
    const sliderValue = Number(hueSlider.value);
    visualizerHandler.setHue(sliderValue);
    hueLabel.style.left = sliderValue / 360 * 100 + 11;

    satSlider.style.background =
        `linear-gradient(90deg, hsl(0, 0%, 50%) 0%, hsl(${sliderValue}, 100%, 50%) 100%)`;

    litSlider.style.background =
        `linear-gradient(90deg, hsl(0, 0%, 0%) 0%, hsl(${sliderValue}, 100%, 50%) 50%, hsl(0, 100%, 100%) 100%)`;

    document.documentElement.style.setProperty('--spectro-hue-slider-thumb-color', `hsl(${sliderValue}, 100%, 50%)`);
};

satSlider.oninput = () => {
    const sliderValue = Number(satSlider.value);
    visualizerHandler.setSat(sliderValue);
    satLabel.style.left = sliderValue + 11;
};

litSlider.oninput = () => {
    const sliderValue = Number(litSlider.value);
    visualizerHandler.setLit(sliderValue);
    litLabel.style.left = sliderValue + 11;
};

hueSlider.oninput();
satSlider.oninput();
litSlider.oninput();

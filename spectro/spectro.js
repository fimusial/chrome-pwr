import { MovingSpectroGrid } from './moving-spectro-grid.js';

const spectroGrid = new MovingSpectroGrid(document.getElementById('spectro-canvas'));
const tabNameSpan = document.getElementById('spectro-tab-name-span');

setInterval(() => {
    chrome.runtime.sendMessage({ audioHub: 'getFrequencyData', params: {} }).then((response) => {
        if (response) {
            spectroGrid.pushFrequencyData(response.frequencyData);
            tabNameSpan.innerText = response.tabTitle;
        } else {
            spectroGrid.pushPlaceholder();
            tabNameSpan.innerText = '';
        }

        spectroGrid.draw();
    })
}, 10);

document.getElementById('spectro-tab-button').onclick = async () => {
    const existingContexts = await chrome.runtime.getContexts({});
    const offscreenDocumentExists = !!existingContexts.find((context) => context.contextType === 'OFFSCREEN_DOCUMENT');
    if (offscreenDocumentExists) {
        chrome.offscreen.closeDocument();
        return;
    }

    await chrome.offscreen.createDocument({
        url: 'spectro/offscreen-audio-hub.html',
        reasons: ['USER_MEDIA'],
        justification: 'Chrome PWR tab audio capture'
    });

    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
    chrome.runtime.sendMessage({ audioHub: 'startTabCapture', params: { streamId: streamId, tabTitle: tab.title } });
};

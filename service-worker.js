import * as blades from './blades.js';

const startOffscreenHub = async () => {
    const existingContexts = await chrome.runtime.getContexts({});
    if (!existingContexts.find((context) => context.contextType === 'OFFSCREEN_DOCUMENT')) {
        await chrome.offscreen.createDocument({
            url: 'offscreen-hub/offscreen-hub.html',
            reasons: ['USER_MEDIA'],
            justification: 'PWRToy background component'
        });
    }
};

chrome.runtime.onInstalled.addListener(startOffscreenHub);
chrome.runtime.onStartup.addListener(startOffscreenHub);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request.blade || typeof request.blade !== 'string') {
        return;
    }

    chrome.tabs.query({ active: true, currentWindow: true })
    .then((tabs) => {
        if (!tabs || !tabs[0]) {
            throw new Error('active tab could not be found');
        }

        return tabs[0];
    }).then((tab) => {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (bladeName, params) => {
                document[`blade_${bladeName}_params`] = params;
            },
            args: [request.blade, request.params ? request.params : null]
        }).then(() => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: blades[`blade_${request.blade}`]
            }).then(() => {
                sendResponse(`blade triggered ${request.blade}`);
            });
        });
    });

    return true;
});

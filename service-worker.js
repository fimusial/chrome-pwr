import * as blades from './blades.js';

chrome.runtime.onStartup.addListener(async details => {
    const existingContexts = await chrome.runtime.getContexts({});
    if (!existingContexts.find((context) => context.contextType === 'OFFSCREEN_DOCUMENT')) {
        await chrome.offscreen.createDocument({
            url: 'offscreen-audio-hub/offscreen-audio-hub.html',
            reasons: ['USER_MEDIA'],
            justification: 'Chrome PWR tab audio capture'
        });
    }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (!request.triggerBlade || typeof request.triggerBlade !== 'string') {
        return;
    }

    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (bladeName, params) => {
            document[`blade_${bladeName}_params`] = params;
        },
        args: [request.triggerBlade, request.params ? request.params : null]
    });

    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: blades[`blade_${request.triggerBlade}`]
    });

    sendResponse(`blade triggered: ${request.triggerBlade}`);
    return true;
});

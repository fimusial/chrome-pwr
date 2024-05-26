import * as blades from './blades.js';

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.triggerBlade && typeof request.triggerBlade === 'string') {
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
    }
});

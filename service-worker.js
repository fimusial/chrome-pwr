// https://developer.chrome.com/docs/extensions/mv3/messaging/#simple
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

    // https://developer.chrome.com/docs/extensions/mv3/content_scripts/#programmatic
    if (request.triggerBlade && typeof (request.triggerBlade) === 'string') {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: [`blades/${request.triggerBlade}.js`]
        });
    }

    sendResponse('request processed');
});

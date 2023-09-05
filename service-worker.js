// https://developer.chrome.com/docs/extensions/mv3/messaging/#simple
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.triggerBlade && typeof (request.triggerBlade) === 'string') {
        (async () => {
            const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

            // https://developer.chrome.com/docs/extensions/mv3/content_scripts/#programmatic
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: [`blades/${request.triggerBlade}.js`]
            });

            sendResponse(`blade triggered: ${request.triggerBlade}`);
        })();

        return true;
    }
});

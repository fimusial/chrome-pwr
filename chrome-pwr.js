document.getElementById('max-scroll-trigger').onclick = async () => {
    await chrome.runtime.sendMessage({
        triggerBlade: 'maxScrollStart'
    });
};

document.getElementById('max-scroll-cancel').onclick = async () => {
    await chrome.runtime.sendMessage({
        triggerBlade: 'maxScrollCancel'
    });
};

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

document.getElementById('forced-css-add').onclick = async () => {
    await chrome.runtime.sendMessage({
        triggerBlade: 'forcedCssAdd'
    });
};

document.getElementById('forced-css-clear').onclick = async () => {
    await chrome.runtime.sendMessage({
        triggerBlade: 'forcedCssClear'
    });
};

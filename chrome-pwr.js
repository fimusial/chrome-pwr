document.getElementById('max-scroll').onclick = async () => {
    await chrome.runtime.sendMessage({ triggerBlade: 'max-scroll' });
};

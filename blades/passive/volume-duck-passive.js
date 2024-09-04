const duckVolume = (volume) => {
    [...document.getElementsByTagName('audio'), ...document.getElementsByTagName('video')].forEach(element => element.volume = volume);
    console.log('ducking at ' + volume);
};

chrome.runtime.sendMessage({
    audioHub: 'getVolumeDuckSetting',
    params: {
        hostname: location.hostname
    }
}).then(website => {
    if (!website || !website.enabled) {
        return;
    }

    if (website.volume < 0 || 100 < website.volume) {
        return;
    }

    const volumeNormalized = website.volume / 100;

    const observer = new MutationObserver(mutations => {
        duckVolume(volumeNormalized);
    });

    duckVolume(volumeNormalized);
    observer.observe(document.documentElement, { childList: true, subtree: true });
});

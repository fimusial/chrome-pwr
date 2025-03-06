const duckVolume = (volume) => {
    [...document.getElementsByTagName('audio'), ...document.getElementsByTagName('video')].forEach(element => element.volume = volume);
};

chrome.runtime.sendMessage({
    hub: 'getVolumeDuckSetting',
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

    const stopDuckingButton = document.createElement('button');
    stopDuckingButton.id = 'volume-duck-stop-ducking-button';
    stopDuckingButton.textContent = 'stop ducking';

    stopDuckingButton.onclick = () => {
        observer.disconnect();
        stopDuckingButton.remove();
    };

    document.body.appendChild(stopDuckingButton);
});

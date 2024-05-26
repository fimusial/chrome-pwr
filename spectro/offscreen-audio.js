chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.spectro && typeof request.spectro === 'string') {
        switch (request.spectro) {
            case 'startCapture':
                await startCapture(request.params.streamId);
                break;
            case 'stopCapture':
                await stopCapture();
                break;
            default:
                throw new Error('unknown message', request);
        }

        sendResponse(`spectro action executed: ${request.spectro}`);
        return true;
    }
});

const startCapture = async (streamId) => {
    const audioMedia = await navigator.mediaDevices.getUserMedia({
        audio: {
            mandatory: {
                chromeMediaSource: 'tab',
                chromeMediaSourceId: streamId
            }
        }
    });

    const output = new AudioContext();
    const source = output.createMediaStreamSource(audioMedia);

    const lowpassFilter = output.createBiquadFilter();
    lowpassFilter.type = 'lowpass';
    lowpassFilter.frequency.setValueAtTime(500, output.currentTime);

    // source -> lowpass -> output
    source.connect(lowpassFilter);
    lowpassFilter.connect(output.destination);

    window.location.hash = 'capturing';
}

const stopCapture = async () => {
    window.location.hash = '';
}

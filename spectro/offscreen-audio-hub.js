chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (!request.audioHub || typeof request.audioHub !== 'string') {
        return;
    }

    switch (request.audioHub) {
        case 'startCapture':
            await startCapture(request.params.streamId);
            break;
        case 'stopCapture':
            await stopCapture();
            break;
        default:
            throw new Error('unknown message', request);
    }

    sendResponse(`audioHub action executed: ${request.audioHub}`);
    return true;
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

    // lowpass filter example
    //const lowpassFilter = output.createBiquadFilter();
    //lowpassFilter.type = 'lowpass';
    //lowpassFilter.frequency.setValueAtTime(500, output.currentTime);
    // source -> lowpass -> output
    //source.connect(lowpassFilter);
    //lowpassFilter.connect(output.destination);

    // tap example
    await output.audioWorklet.addModule('stereo-bypass-buffered-tap-processor.js');
    const tapNode = new AudioWorkletNode(output, 'stereo-bypass-buffered-tap-processor');
    tapNode.port.onmessage = (event) => { console.log('received', event.data.channelBuffers); };
    source.connect(tapNode);
    tapNode.connect(output.destination);

    // source.connect(output.destination);
    window.location.hash = 'capturing';
}

const stopCapture = async () => {
    window.location.hash = '';
}

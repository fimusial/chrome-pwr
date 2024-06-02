let capturedTabId = null;
let audioAnalyzer = null;
let lowpassFilter = null;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (!request.audioHub || typeof request.audioHub !== 'string') {
        return;
    }

    let response = null;
    switch (request.audioHub) {
        case 'startTabCapture': response = await startTabCapture(request.params); break;
        case 'getCapturedTabId': response = await getCapturedTabId(); break;
        case 'getTimeDomainData': response = await getTimeDomainData(); break;
        case 'getFrequencyData': response = await getFrequencyData(); break;
        default: throw new Error('unknown message', request);
    }

    sendResponse(response);
    return true;
});

const startTabCapture = async (params) => {
    capturedTabId = params.tabId;

    const audioMedia = await navigator.mediaDevices.getUserMedia({
        audio: {
            mandatory: {
                chromeMediaSource: 'tab',
                chromeMediaSourceId: params.streamId
            }
        }
    });

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(audioMedia);

    //lowpassFilter = audioContext.createBiquadFilter();
    //lowpassFilter.type = 'lowpass';
    //lowpassFilter.frequency.setValueAtTime(500, audioContext.currentTime);

    audioAnalyzer = audioContext.createAnalyser();
    audioAnalyzer.fftSize = 512; // todo: parameter?

    //source.connect(lowpassFilter);
    //lowpassFilter.connect(audioAnalyzer);
    source.connect(audioAnalyzer);
    audioAnalyzer.connect(audioContext.destination);

    return 'capture started';
};

const getCapturedTabId = async () => {
    return { capturedTabId: capturedTabId };
};

const getTimeDomainData = async () => {
    if (!audioAnalyzer) {
        throw new Error('capture not started');
    }

    const data = new Uint8Array(audioAnalyzer.frequencyBinCount);
    audioAnalyzer.getByteTimeDomainData(data);
    return { data: Array.from(data) };
};

const getFrequencyData = async () => {
    if (!audioAnalyzer) {
        throw new Error('capture not started');
    }

    const data = new Uint8Array(audioAnalyzer.frequencyBinCount);
    audioAnalyzer.getByteFrequencyData(data);
    return { data: Array.from(data) };
};

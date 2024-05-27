let currentTabTitle = '';
let audioAnalyzer = null;
let lowpassFilter = null;

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (!request.audioHub || typeof request.audioHub !== 'string') {
        return;
    }

    let response = null;
    switch (request.audioHub) {
        case 'startTabCapture': response = await startTabCapture(request.params); break;
        case 'getTimeDomainData': response = await getTimeDomainData(request.params); break;
        case 'getFrequencyData': response = await getFrequencyData(request.params); break;
        default: throw new Error('unknown message', request);
    }

    sendResponse(response);
    return true;
});

const startTabCapture = async (params) => {
    currentTabTitle = params.tabTitle;

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
    audioAnalyzer.fftSize = 256; // todo: parameter?

    //source.connect(lowpassFilter);
    //lowpassFilter.connect(audioAnalyzer);
    source.connect(audioAnalyzer);
    audioAnalyzer.connect(audioContext.destination);

    return 'capture started';
};

const getTimeDomainData = async (params) => {
    if (!audioAnalyzer) {
        throw new Error('capture not started');
    }

    const data = new Uint8Array(audioAnalyzer.frequencyBinCount);
    audioAnalyzer.getByteTimeDomainData(data);
    return { tabTitle: currentTabTitle, timeDomainData: Array.from(data) };
};

const getFrequencyData = async (params) => {
    if (!audioAnalyzer) {
        throw new Error('capture not started');
    }

    const data = new Uint8Array(audioAnalyzer.frequencyBinCount);
    audioAnalyzer.getByteFrequencyData(data);
    return { tabTitle: currentTabTitle, frequencyData: Array.from(data) };
};

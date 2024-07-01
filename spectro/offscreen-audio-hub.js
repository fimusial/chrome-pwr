let audioContext = null;
let capturedTabId = null;
let audioAnalyzer = null;
let highpassFilter = null;
let lowpassFilter = null;
let recorder = null;

const setAudioFiltersValues = (hp, lp) => {
    if (audioContext && lowpassFilter && highpassFilter) {
        if (typeof hp !== 'number' || hp < highpassFilter.frequency.minValue || hp > highpassFilter.frequency.maxValue) {
            throw new RangeError(`'hp' must be a number within filter allowed frequency values`);
        }

        if (typeof lp !== 'number' || lp < lowpassFilter.frequency.minValue || lp > lowpassFilter.frequency.maxValue) {
            throw new RangeError(`'lp' must be a number within filter allowed frequency values`);
        }

        highpassFilter.frequency.setValueAtTime(hp, audioContext.currentTime);
        lowpassFilter.frequency.setValueAtTime(lp, audioContext.currentTime);
    }
};

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (!request.audioHub || typeof request.audioHub !== 'string') {
        return;
    }

    let response = null;
    switch (request.audioHub) {
        case 'startTabCapture': response = await startTabCapture(request.params); break;
        case 'getCapturedTabId': response = await getCapturedTabId(); break;
        case 'getFloatTimeDomainData': response = await getFloatTimeDomainData(); break;
        case 'getByteFrequencyData': response = await getByteFrequencyData(); break;
        case 'updateAudioFilters': response = await updateAudioFilters(request.params); break;
        case 'toggleAudioRecording': response = await toggleAudioRecording(); break;
        case 'getAudioRecordingState': response = await getAudioRecordingState(); break;
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

    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(audioMedia);

    lowpassFilter = audioContext.createBiquadFilter();
    lowpassFilter.type = 'lowpass';
    highpassFilter = audioContext.createBiquadFilter();
    highpassFilter.type = 'highpass';

    audioAnalyzer = audioContext.createAnalyser();
    audioAnalyzer.fftSize = 512;

    source.connect(lowpassFilter);
    lowpassFilter.connect(highpassFilter);
    highpassFilter.connect(audioAnalyzer);
    audioAnalyzer.connect(audioContext.destination);

    setAudioFiltersValues(params.hp, params.lp);

    recorder = new MediaRecorder(audioMedia, { mimeType: 'audio/webm' });

    return 'capture started';
};

const getCapturedTabId = async () => {
    return { capturedTabId: capturedTabId };
};

const getFloatTimeDomainData = async () => {
    if (!audioAnalyzer) {
        return { data: null };
    }

    const data = new Float32Array(audioAnalyzer.frequencyBinCount);
    audioAnalyzer.getFloatTimeDomainData(data);
    return { data: Array.from(data) };
};

const getByteFrequencyData = async () => {
    if (!audioAnalyzer) {
        return { data: null };
    }

    const data = new Uint8Array(audioAnalyzer.frequencyBinCount);
    audioAnalyzer.getByteFrequencyData(data);
    return { data: Array.from(data) };
};

const updateAudioFilters = (params) => {
    setAudioFiltersValues(params.hp, params.lp);
    return 'audio filters updated';
};

const toggleAudioRecording = () => {
    if (!recorder) {
        return 'capture must be started first';
    }

    if (recorder.state === 'inactive') {
        const data = [];

        recorder.ondataavailable = (event) => {
            data.push(event.data);
        };

        recorder.onstop = () => {
            window.open(URL.createObjectURL(new Blob(data, { type: 'audio/webm' })), '_blank');
        };

        recorder.start();
    } else if (recorder.state === 'recording') {
        recorder.stop();
    } else {
        throw new Error('unexpected recorder state');
    }

    return recorder.state;
};

const getAudioRecordingState = () => {
    if (!recorder) {
        return 'no-capture';
    }

    return recorder.state;
};

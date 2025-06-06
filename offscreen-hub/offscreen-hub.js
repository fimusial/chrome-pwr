import webm2wav from './webm2wav.js';
import { MacroStorage } from '../macro-storage.js';

let audioContext = null;
let audioContextSource = null;
let audioMedia = null;
let capturedTabId = null;
let audioAnalyzer = null;
let highpassFilter = null;
let lowpassFilter = null;
let audioRecorder = null;

const setAudioFiltersValues = (hp, lp) => {
    if (!capturedTabId || !audioContext || !lowpassFilter || !highpassFilter) {
        return;
    }

    if (typeof hp !== 'number' || hp < highpassFilter.frequency.minValue || hp > highpassFilter.frequency.maxValue) {
        throw new RangeError(`'hp' must be a number within filter allowed frequency values`);
    }

    if (typeof lp !== 'number' || lp < lowpassFilter.frequency.minValue || lp > lowpassFilter.frequency.maxValue) {
        throw new RangeError(`'lp' must be a number within filter allowed frequency values`);
    }

    highpassFilter.frequency.setValueAtTime(hp, audioContext.currentTime);
    lowpassFilter.frequency.setValueAtTime(lp, audioContext.currentTime);
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request.hub || typeof request.hub !== 'string') {
        return;
    }

    let response = null;
    switch (request.hub) {
        case 'startTabCapture': response = startTabCapture(request.params); break;
        case 'stopTabCapture': response = stopTabCapture(); break;
        case 'getCapturedTabId': response = getCapturedTabId(); break;
        case 'getFloatTimeDomainAudioData': response = getFloatTimeDomainAudioData(); break;
        case 'getByteFrequencyAudioData': response = getByteFrequencyAudioData(); break;
        case 'updateAudioFilters': response = updateAudioFilters(request.params); break;
        case 'toggleAudioRecording': response = toggleAudioRecording(); break;
        case 'getAudioRecordingState': response = getAudioRecordingState(); break;
        case 'getVolumeDuckSetting': response = getVolumeDuckSetting(request.params); break;
        case 'setMacro': response = setMacro(request.params); break;
        case 'getMacro': response = getMacro(request.params); break;
        default: throw new Error('unknown message', request);
    }

    sendResponse(response);
    return true;
});

const startTabCapture = (params) => {
    if (!params || !params.tabId || !params.streamId) {
        return;
    }

    capturedTabId = params.tabId;

    navigator.mediaDevices.getUserMedia({
        audio: {
            mandatory: {
                chromeMediaSource: 'tab',
                chromeMediaSourceId: params.streamId
            }
        }
    }).then((result) => {
        audioMedia = result;
        audioContext = new AudioContext();
        audioContextSource = audioContext.createMediaStreamSource(audioMedia);

        lowpassFilter = audioContext.createBiquadFilter();
        lowpassFilter.type = 'lowpass';
        highpassFilter = audioContext.createBiquadFilter();
        highpassFilter.type = 'highpass';

        audioAnalyzer = audioContext.createAnalyser();
        audioAnalyzer.fftSize = 512;

        audioContextSource.connect(lowpassFilter);
        lowpassFilter.connect(highpassFilter);
        highpassFilter.connect(audioAnalyzer);
        audioAnalyzer.connect(audioContext.destination);

        setAudioFiltersValues(params.hp, params.lp);

        audioRecorder = new MediaRecorder(audioMedia, { mimeType: 'audio/webm' });

        audioRecorder.ondataavailable = (event) => {
            const webmBlob = new Blob([event.data], { type: 'audio/webm' });
            webm2wav(webmBlob, 32).then(wavBlob => {
                const wavBlobUrl = URL.createObjectURL(wavBlob);
                const anchor = document.createElement('a');
                anchor.href = wavBlobUrl;
                anchor.download = 'chrome-pwr-recording.wav';
                document.body.appendChild(anchor);
                anchor.click();
                document.body.removeChild(anchor);
                URL.revokeObjectURL(wavBlobUrl);
            });
        };

        return 'capture started';
    });
};

const stopTabCapture = () => {
    if (!capturedTabId || !audioMedia || !audioContext || !audioContextSource) {
        return 'capture must be started first';
    }

    audioMedia.getAudioTracks().forEach(track => {
        track.stop(); // also stops audio recording
        audioMedia.removeTrack(track);
    });

    audioContextSource.connect(audioContext.destination);
    capturedTabId = null;
    audioRecorder = null;

    return 'capture stopped';
};

const getCapturedTabId = () => {
    return { capturedTabId: capturedTabId };
};

const getFloatTimeDomainAudioData = () => {
    if (!capturedTabId || !audioAnalyzer) {
        return { data: null };
    }

    const data = new Float32Array(audioAnalyzer.frequencyBinCount);
    audioAnalyzer.getFloatTimeDomainData(data);
    return { data: Array.from(data) };
};

const getByteFrequencyAudioData = () => {
    if (!capturedTabId || !audioAnalyzer) {
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
    if (!audioRecorder) {
        return 'capture must be started first';
    }

    if (audioRecorder.state === 'inactive') {
        audioRecorder.start();
    } else if (audioRecorder.state === 'recording') {
        audioRecorder.stop();
    } else {
        throw new Error('unexpected audioRecorder state');
    }

    return audioRecorder.state;
};

const getAudioRecordingState = () => {
    if (!audioRecorder) {
        return 'no-capture';
    }

    return audioRecorder.state;
};

const getVolumeDuckSetting = (params) => {
    if (!params || !params.hostname) {
        return;
    }

    const settings = localStorage.getItem('volume-duck-settings');
    return (settings ? JSON.parse(settings) : []).find(x => x.hostname === params.hostname);
};

const setMacro = (params) => {
    new MacroStorage(params.hostname).setMacro(params.slotIndex, params.clicks);
    return 'macro saved';
};

const getMacro = (params) => {
    return new MacroStorage(params.hostname).getMacro(params.slotIndex);
};

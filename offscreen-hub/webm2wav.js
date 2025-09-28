'use strict';

export default async function webm2wav(webmBlob, wavBitDepth = 16) {
    if (wavBitDepth !== 32 && wavBitDepth !== 16) {
        throw new RangeError(`'wavBitDepth' must be either 16 or 32`);
    }

    const jsAudioBuffer = await getJsAudioBuffer(webmBlob);
    const inputSamples = getInputFloat32Array(jsAudioBuffer);

    const bytesPerWavSample = wavBitDepth / 8;
    const dataByteCount = inputSamples.length * bytesPerWavSample;
    const channelCount = jsAudioBuffer.numberOfChannels;
    const sampleRate = jsAudioBuffer.sampleRate;

    const outputArrayBuffer = new ArrayBuffer(44 + dataByteCount);
    const outputView = new DataView(outputArrayBuffer);

    writeASCIIText(outputView, 0, 'RIFF');
    outputView.setUint32(4, 36 + dataByteCount, true);
    writeASCIIText(outputView, 8, 'WAVEfmt ');
    outputView.setUint32(16, 16, true);
    outputView.setUint16(20, wavBitDepth === 32 ? 3 : 1, true);
    outputView.setUint16(22, channelCount, true);
    outputView.setUint32(24, sampleRate, true);
    outputView.setUint32(28, sampleRate * channelCount * bytesPerWavSample, true);
    outputView.setUint16(32, channelCount * bytesPerWavSample, true);
    outputView.setUint16(34, wavBitDepth, true);
    writeASCIIText(outputView, 36, 'data');
    outputView.setUint32(40, dataByteCount, true);

    if (wavBitDepth === 32) {
        for (let i = 0, offset = 44; i < inputSamples.length; i++, offset += 4) {
            outputView.setFloat32(offset, inputSamples[i], true);
        }
    } else {
        for (let i = 0, offset = 44; i < inputSamples.length; i++, offset += 2) {
            outputView.setInt16(offset, Math.round(Math.min(Math.max(inputSamples[i] * 32768, -32768), 32767)), true);
        }
    }

    return new Blob([new Uint8Array(outputArrayBuffer)], {
        type: 'audio/wave'
    });
}

async function getJsAudioBuffer(webmBlob) {
    if (!webmBlob || !(webmBlob instanceof Blob) || webmBlob.type !== 'audio/webm') {
        throw new TypeError(`'webmBlob' must be a Blob with MIME type 'audio/webm'`);
    }

    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioContext = new AudioContext();
    return await audioContext.decodeAudioData(arrayBuffer);
}

function getInputFloat32Array(jsAudioBuffer) {
    if (jsAudioBuffer.numberOfChannels === 1) {
        return jsAudioBuffer.getChannelData(0);
    }

    const leftChannel = jsAudioBuffer.getChannelData(0);
    const rightChannel = jsAudioBuffer.getChannelData(1);
    const output = new Float32Array(Math.min(leftChannel.length, rightChannel.length) * 2);

    for (let l = 0, r = 0, o = 0; l < leftChannel.length && r < rightChannel.length; l++, r++, o += 2) {
        output[o] = leftChannel[l];
        output[o + 1] = rightChannel[r];
    }

    return output;
}

function writeASCIIText(dataView, offset, text) {
    for (let i = 0; i < text.length; i++) {
        dataView.setUint8(offset + i, text.charCodeAt(i));
    }
}

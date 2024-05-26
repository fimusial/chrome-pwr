const bufferSize = 2048;

class StereoBypassBufferedTapProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferOffset = 0;
        this.channelBuffers = [new Float32Array(bufferSize), new Float32Array(bufferSize)];
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];
        const channelCount = Math.min(input.length, output.length, 2);

        if (this.bufferOffset >= bufferSize) {
            this.port.postMessage({ channelBuffers: this.channelBuffers });
            this.bufferOffset = 0;
            this.channelBuffers = [new Float32Array(bufferSize), new Float32Array(bufferSize)];
        }

        let maxSamplesBuffered = 0;
        for (let channelIndex = 0; channelIndex < channelCount; channelIndex++) {
            const samplesToBypass = Math.min(input[channelIndex].length, output[channelIndex].length);
            for (let sampleIndex = 0; sampleIndex < samplesToBypass; sampleIndex++) {
                output[channelIndex][sampleIndex] = input[channelIndex][sampleIndex];
            }

            const samplesToBuffer = Math.min(samplesToBypass, bufferSize - this.bufferOffset);
            for (let sampleIndex = 0; sampleIndex < samplesToBuffer; sampleIndex++) {
                this.channelBuffers[channelIndex][this.bufferOffset + sampleIndex] = output[channelIndex][sampleIndex];
            }

            if (samplesToBuffer > maxSamplesBuffered) {
                maxSamplesBuffered = samplesToBuffer;
            }
        }

        this.bufferOffset += maxSamplesBuffered;
        return true;
    }
}

registerProcessor('stereo-bypass-buffered-tap-processor', StereoBypassBufferedTapProcessor);

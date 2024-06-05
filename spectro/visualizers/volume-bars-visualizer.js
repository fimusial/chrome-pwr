export class VolumeBarsVisualizer {
    constructor(canvas, colorHue = 338, wRes = 64) {
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new TypeError(`'canvas' must be an HTMLCanvasElement`);
        }

        const context = canvas.getContext('2d');
        if (!context || !(context instanceof CanvasRenderingContext2D)) {
            throw new TypeError(`could not get 2d context from 'canvas'`);
        }

        if (!Number.isInteger(colorHue) || colorHue < 1) {
            throw new TypeError(`'colorHue' must be a positive integer`);
        }

        if (!Number.isInteger(wRes) || wRes < 1) {
            throw new TypeError(`'wRes' must be a positive integer`);
        }

        this.canvas = canvas;
        this.colorHue = colorHue;
        this.context = context;
        this.wRes = wRes;
        this.reset();
    }

    nextDrawDelayMs = 20;
    audioHubMethod = 'getByteFrequencyData';

    reset() {
        this.volumes = new Array(this.wRes).fill(0);
    }

    pushData(values) {
        if (!Array.isArray(values) || values.some((value => typeof value !== 'number'))) {
            throw new TypeError(`'values' must be an Array of Numbers`);
        }

        if (values.some((value => value < 0 || 255 < value))) {
            throw new RangeError(`'values' must only contain numbers within [0, 255] range`);
        }

        // the last few values are always zero anyway
        values = values.slice(0, values.length - 20);
        let result = values;

        const diff = this.wRes - values.length;
        if (diff < 0) {
            result = new Array(this.wRes);
            const fillFactor = Math.floor(values.length / this.wRes);
            for (let i = 0; i < this.wRes; i++) {
                const segment = values.slice(i * fillFactor, i * fillFactor + fillFactor);
                result[i] = segment.reduce((acc, value) => acc + value, 0) / fillFactor;
            }
        } else if (diff > 0) {
            result = values.concat(new Array(diff).fill(0));
        }

        this.volumes = result;
    }

    pushPlaceholder() {
        const time = new Date().getTime();
        this.volumes = Array.from({ length: this.wRes }, (_, i) => {
            return 255 * Math.sin(((i % 2 === 0 ? 1 : -1) * time / 256 + i / 8));
        });
    }

    draw() {
        this.context.fillStyle = 'hsl(0, 0%, 0%)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillStyle = `hsl(${this.colorHue}, 100%, 62%)`; // #ff3d84
        const xDelta = this.canvas.width / this.wRes;
        for (let i = 0; i < this.wRes; i++) {
            const barHeight = this.volumes[i] / 255 * this.canvas.height;
            this.context.fillRect(
                /* x */i * xDelta,
                /* y */this.canvas.height - barHeight,
                /* w */xDelta,
                /* h */barHeight
            );
        }
    }
}

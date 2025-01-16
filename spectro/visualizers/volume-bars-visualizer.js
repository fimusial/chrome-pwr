export class VolumeBarsVisualizer {
    constructor(canvas, hue = 338, sat = 100, lit = 50, freqRes = 64) {
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new TypeError(`'canvas' must be an HTMLCanvasElement`);
        }

        const context = canvas.getContext('2d');
        if (!context || !(context instanceof CanvasRenderingContext2D)) {
            throw new TypeError(`could not get 2d context from 'canvas'`);
        }

        if (!Number.isInteger(hue) || hue < 0) {
            throw new TypeError(`'hue' must be a nonnegative integer`);
        }

        if (!Number.isInteger(sat) || sat < 0 || 100 < sat) {
            throw new TypeError(`'sat' must be an integer between 0 and 100`);
        }

        if (!Number.isInteger(lit) || lit < 0 || 100 < lit) {
            throw new TypeError(`'lit' must be an integer between 0 and 100`);
        }

        if (!Number.isInteger(freqRes) || freqRes < 1) {
            throw new TypeError(`'freqRes' must be a positive integer`);
        }

        this.canvas = canvas;
        this.hue = hue;
        this.sat = sat;
        this.lit = lit;
        this.context = context;
        this.freqRes = freqRes;

        this.orientation = 'horizontal';
        this.reset();
    }

    nextDrawDelayMs = 20;
    audioHubMethod = 'getByteFrequencyData';

    setHue(hue) {
        if (!Number.isInteger(hue) || hue < 0) {
            throw new TypeError(`'hue' must be a nonnegative integer`);
        }

        this.hue = hue;
    }

    setSat(sat) {
        if (!Number.isInteger(sat) || sat < 0 || 100 < sat) {
            throw new TypeError(`'sat' must be an integer between 0 and 100`);
        }

        this.sat = sat;
    }

    setLit(lit) {
        if (!Number.isInteger(lit) || lit < 0 || 100 < lit) {
            throw new TypeError(`'lit' must be an integer between 0 and 100`);
        }

        this.lit = lit;
    }

    reset() {
        this.volumes = new Array(this.freqRes).fill(0);
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

        const diff = this.freqRes - values.length;
        if (diff < 0) {
            result = new Array(this.freqRes);
            const fillFactor = Math.floor(values.length / this.freqRes);
            for (let i = 0; i < this.freqRes; i++) {
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
        this.volumes = Array.from({ length: this.freqRes }, (_, i) => {
            const sign = i % 2 === 0 ? 1 : -1;
            return 255 * Math.sin(sign * time / (256 + sign * 32) + i / 8);
        });
    }

    setOrientation(orientation) {
        if (orientation !== 'horizontal' && orientation !== 'vertical') {
            throw new TypeError(`'orientation' must be 'horizontal' or 'vertical'`);
        }

        this.orientation = orientation;
    }

    draw() {
        if (this.orientation === 'horizontal') {
            this.drawHorizontal();
        } else if (this.orientation === 'vertical') {
            this.drawVertical();
        } else {
            throw new TypeError(`'orientation' must be 'horizontal' or 'vertical'`);
        }
    }

    // private
    drawHorizontal() {
        this.context.fillStyle = 'hsl(0, 0%, 0%)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = this.getHslString();

        const freqDelta = this.canvas.width / this.freqRes;
        for (let i = 0; i < this.freqRes; i++) {
            const barSize = this.volumes[i] / 255 * this.canvas.height;
            this.context.fillRect(
                /* x */i * freqDelta,
                /* y */this.canvas.height - barSize,
                /* w */freqDelta + 1,
                /* h */barSize
            );
        }
    }

    // private
    drawVertical() {
        this.context.fillStyle = 'hsl(0, 0%, 0%)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = this.getHslString();

        const freqDelta = this.canvas.height / this.freqRes;
        for (let i = 0; i < this.freqRes; i++) {
            const barSize = this.volumes[this.freqRes - i - 1] / 255 * this.canvas.width;
            this.context.fillRect(
                /* x */this.canvas.width - barSize,
                /* y */i * freqDelta,
                /* w */barSize,
                /* h */freqDelta + 1
            );
        }
    }

    // private
    getHslString() {
        return `hsl(${this.hue}, ${this.sat}%, ${this.lit}%)`;
    }
}

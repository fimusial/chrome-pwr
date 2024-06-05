export class MovingSpectrogramVisualizer {
    constructor(canvas, colorHue = 338, wRes = 100, hRes = 50) {
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

        if (!Number.isInteger(hRes) || hRes < 1) {
            throw new TypeError(`'hRes' must be a positive integer`);
        }

        this.canvas = canvas;
        this.colorHue = colorHue;
        this.context = context;
        this.wRes = wRes;
        this.hRes = hRes;
        this.reset();
    }

    nextDrawDelayMs = 10;
    audioHubMethod = 'getByteFrequencyData';

    reset() {
        this.grid = Array.from(Array(this.hRes), () => new Array(this.wRes).fill(0));
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

        this.grid.push(result);
        this.grid.shift();
    }

    pushPlaceholder() {
        const v = Array.from({ length: this.wRes }, () => Math.random() * 255 * 0.125);
        const time = new Date().getTime();
        const sines = [Math.sin(time / 256), Math.cos(time / 384), Math.sin(time / 512), Math.cos(time / 640)];
        const wResD2 = this.wRes / 2;

        for (let i = 0; i < sines.length; i++) {
            const a = Math.floor(sines[i] * wResD2 + wResD2);
            const b = Math.floor(-sines[i] * wResD2 + wResD2);
            v[a] = v[a + 1] = v[b - 1] = v[b] = 255 * 0.2 * i + 0.2;
        }

        this.grid.push(v);
        this.grid.shift();

        for (let y = 0; y < this.hRes - 1; y++) {
            for (let x = 0; x < this.wRes; x++) {
                this.grid[y][x] *= 0.90;
            }
        }
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const yDelta = this.canvas.height / this.hRes;
        const xDelta = this.canvas.width / this.wRes;
        for (let y = 0; y < this.hRes; y++) {
            for (let x = 0; x < this.wRes; x++) {
                const value = this.grid[y][x];
                this.context.fillStyle = `hsl(${this.colorHue}, 100%, ${(Math.abs(value) / 255) * 100}%)`;
                this.context.fillRect(
                    /* x */x * xDelta,
                    /* y */y * yDelta,
                    /* w */xDelta,
                    /* h */yDelta
                );
            }
        }
    }
}

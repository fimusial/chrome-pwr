export class MovingSpectrogramVisualizer {
    constructor(canvas, colorHue = 338, freqRes = 100, timeRes = 50) {
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

        if (!Number.isInteger(freqRes) || freqRes < 1) {
            throw new TypeError(`'freqRes' must be a positive integer`);
        }

        if (!Number.isInteger(timeRes) || timeRes < 1) {
            throw new TypeError(`'timeRes' must be a positive integer`);
        }

        this.canvas = canvas;
        this.colorHue = colorHue;
        this.context = context;
        this.freqRes = freqRes;
        this.timeRes = timeRes;

        this.orientation = 'horizontal';
        this.reset();
    }

    nextDrawDelayMs = 10;
    audioHubMethod = 'getByteFrequencyData';

    reset() {
        this.grid = Array.from(Array(this.timeRes), () => new Array(this.freqRes).fill(0));
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

        this.grid.push(result);
        this.grid.shift();
    }

    pushPlaceholder() {
        const v = Array.from({ length: this.freqRes }, () => Math.random() * 255 * 0.125);
        const time = new Date().getTime();
        const sines = [Math.sin(time / 256), Math.cos(time / 384), Math.sin(time / 512), Math.cos(time / 640)];
        const freqResD2 = this.freqRes / 2;

        for (let i = 0; i < sines.length; i++) {
            const a = Math.floor(sines[i] * freqResD2 + freqResD2);
            const b = Math.floor(-sines[i] * freqResD2 + freqResD2);
            v[a] = v[a + 1] = v[b - 1] = v[b] = 255 * 0.2 * i + 0.2;
        }

        this.grid.push(v);
        this.grid.shift();

        for (let y = 0; y < this.timeRes - 1; y++) {
            for (let x = 0; x < this.freqRes; x++) {
                this.grid[y][x] *= 0.90;
            }
        }
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
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const freqDelta = this.canvas.width / this.freqRes;
        const timeDelta = this.canvas.height / this.timeRes;
        for (let y = 0; y < this.timeRes; y++) {
            for (let x = 0; x < this.freqRes; x++) {
                const value = this.grid[y][x];
                this.context.fillStyle = `hsl(${this.colorHue}, 100%, ${(Math.abs(value) / 255) * 100}%)`;
                this.context.fillRect(
                    /* x */x * freqDelta,
                    /* y */y * timeDelta,
                    /* w */freqDelta,
                    /* h */timeDelta
                );
            }
        }
    }

    // private
    drawVertical() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const timeDelta = this.canvas.width / this.timeRes;
        const freqDelta = this.canvas.height / this.freqRes;
        for (let x = 0; x < this.timeRes; x++) {
            for (let y = 0; y < this.freqRes; y++) {
                const value = this.grid[x][y];
                this.context.fillStyle = `hsl(${this.colorHue}, 100%, ${(Math.abs(value) / 255) * 100}%)`;
                this.context.fillRect(
                    /* x */x * timeDelta,
                    /* y */y * freqDelta,
                    /* w */timeDelta,
                    /* h */freqDelta
                );
            }
        }
    }
}

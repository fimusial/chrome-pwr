export class MovingSpectroGrid {
    constructor(canvas, colorHue = 338, wRes = 100, hRes = 50, maxValue = 255) {
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

        if (typeof maxValue !== 'number' || (maxValue <= 0 && maxValue !== -1)) {
            throw new TypeError(`'maxValue' must be a positive number or -1 (for adaptive)`);
        }

        this.canvas = canvas;
        this.colorHue = colorHue;
        this.context = context;
        this.wRes = wRes;
        this.hRes = hRes;
        this.maxValue = maxValue;
        this.grid = Array.from(Array(this.hRes), () => new Array(this.wRes).fill(0));
    }

    pushFrequencyData(values) {
        if (!Array.isArray(values) || values.some((element => typeof element !== 'number'))) {
            throw new TypeError(`'values' must be an Array of Numbers`);
        }

        const diff = this.wRes - values.length;
        if (diff < 0) {
            values = values.slice(0, this.wRes);
        }
        else if (diff > 0) {
            values = values.concat(new Array(diff).fill(0));
        }

        this.grid.push(values);
        this.grid.shift();
    }

    pushPlaceholder() {
        const v = Array.from({ length: this.wRes }, () => Math.random() * this.maxValue * 0.125);
        const time = new Date().getTime();
        const sines = [Math.sin(time / 128), Math.cos(time / 256), Math.sin(time / 384), Math.cos(time / 512)];
        const wResD2 = this.wRes / 2;

        for (let i = 0; i < sines.length; i++) {
            const a = Math.floor(sines[i] * wResD2 + wResD2);
            const b = Math.floor(-sines[i] * wResD2 + wResD2);

            v[a] = v[a + 1] = v[a + 25] = v[a + 26] =
                v[b - 26] = v[b - 25] = v[b - 1] = v[b] =
                    this.maxValue * 0.2 * i + 0.2;
        }

        this.grid.push(v);
        this.grid.shift();
    }

    draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const yDelta = this.canvas.height / this.hRes;
        const xDelta = this.canvas.width / this.wRes;
        for (let h = 0; h < this.hRes; h++) {
            const rowMaxValue = this.maxValue === -1
                ? this.grid[h].reduce((max, current) => (Math.abs(current) > max ? Math.abs(current) : max), this.grid[h][0])
                : this.maxValue;

            for (let w = 0; w < this.wRes; w++) {
                const value = this.grid[h][w];
                this.context.fillStyle = `hsl(${this.colorHue}, 100%, ${(Math.abs(value) / rowMaxValue) * 100}%)`;
                this.context.fillRect(w * xDelta, h * yDelta, xDelta, yDelta);
            }
        }
    }
};

export class WaveformGraphVisualizer {
    constructor(canvas, colorHue = 338) {
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

        this.canvas = canvas;
        this.colorHue = colorHue;
        this.context = context;
        this.frame = [];

        this.context.lineWidth = 3;
        this.context.fillStyle = 'hsl(0, 0%, 0%)';
        this.context.strokeStyle = `hsl(${this.colorHue}, 100%, 62%)`; // #ff3d84
    }

    audioHubMethod = 'getTimeDomainData';

    pushData(values) {
        if (!Array.isArray(values) || values.some((value => typeof value !== 'number'))) {
            throw new TypeError(`'values' must be an Array of Numbers`);
        }

        this.frame = values;
    }

    // todo: create a placeholder
    pushPlaceholder() {
        this.frame = [0];
    }

    draw() {
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.frame.length === 0) {
            return;
        }

        let { frameMin, frameMax } = this.frame.reduce((acc, value) => ({
            frameMin: Math.min(acc.frameMin, value),
            frameMax: Math.max(acc.frameMax, value)
        }), {
            frameMin: Infinity,
            frameMax: -Infinity
        });

        const amplify = frameMin < 1 ? 1 : Math.min(4, frameMax / (frameMax - frameMin));
        frameMin *= amplify;
        frameMax *= amplify;

        const xDelta = this.canvas.width / this.frame.length;

        this.context.beginPath();
        for (let i = 0, x = 0; i < this.frame.length; i += 1, x += xDelta) {
            const center = (this.canvas.height - frameMax - frameMin) / 2;
            const y = this.frame[i] * amplify + center;

            if (i === 0) {
                this.context.moveTo(x, y);
            } else {
                this.context.lineTo(x, y);
            }
        }

        this.context.lineTo(this.canvas.width, this.canvas.height / 2);
        this.context.stroke();
    }
}

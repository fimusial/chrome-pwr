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

        this.orientation = 'horizontal';
        this.reset();
    }

    nextDrawDelayMs = 25;
    audioHubMethod = 'getFloatTimeDomainData';

    reset() {
        this.frame = [0];
    }

    pushData(values) {
        if (!Array.isArray(values) || values.some((value => typeof value !== 'number'))) {
            throw new TypeError(`'values' must be an Array of Numbers`);
        }

        if (values.some((value => value < -1 || 1 < value))) {
            throw new RangeError(`'values' must only contain numbers within [-1, 1] range`);
        }

        this.frame = values;
    }

    pushPlaceholder() {
        const time = new Date().getTime();
        this.frame = Array.from({ length: 1024 }, (_, i) => {
            return 0.125 * Math.cos((time + i) / 512)
                + 0.125 * Math.sin((time - i) / 128)
                + 0.125 * Math.cos((time + i) / 64)
                + 0.125 * Math.sin((time - i) / 4)
                ;
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
        this.context.lineWidth = 4;
        this.context.fillStyle = 'hsl(0, 0%, 0%)';
        this.context.strokeStyle = `hsl(${this.colorHue}, 100%, 62%)`; // #ff3d84
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.frame.length === 0) {
            return;
        }

        const pathDelta = this.canvas.width / this.frame.length;

        this.context.beginPath();
        this.context.moveTo(0, this.canvas.height / 2);
        for (let i = 0, x = 0; i < this.frame.length; i += 1, x += pathDelta) {
            const y = (this.frame[i] + 0.5) * this.canvas.height;
            this.context.lineTo(x, y);
        }

        this.context.lineTo(this.canvas.width, this.canvas.height / 2);
        this.context.stroke();
    }

    // private
    drawVertical() {
        this.context.lineWidth = 4;
        this.context.fillStyle = 'hsl(0, 0%, 0%)';
        this.context.strokeStyle = `hsl(${this.colorHue}, 100%, 62%)`; // #ff3d84
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.frame.length === 0) {
            return;
        }

        const pathDelta = this.canvas.height / this.frame.length;

        this.context.beginPath();
        this.context.moveTo(this.canvas.width / 2, 0);
        for (let i = 0, y = 0; i < this.frame.length; i += 1, y += pathDelta) {
            const x = (this.frame[i] + 0.5) * this.canvas.width;
            this.context.lineTo(x, y);
        }

        this.context.lineTo(this.canvas.width / 2, this.canvas.height);
        this.context.stroke();
    }
}

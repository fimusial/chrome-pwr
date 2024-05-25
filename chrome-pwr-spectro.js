class SpectrogramGrid {
    constructor(wRes, hRes, maxValue) {
        if(!Number.isInteger(wRes) || wRes < 1) {
            throw new TypeError(`'wRes' must be a positive integer`);
        }

        if(!Number.isInteger(hRes) || hRes < 1) {
            throw new TypeError(`'hRes' must be a positive integer`);
        }

        if (typeof maxValue !== 'number' || maxValue <= 0) {
            throw new TypeError(`'maxValue' must be a positive number`);
        }

        this.wRes = wRes;
        this.hRes = hRes;
        this.maxValue = maxValue;
        this.grid = Array.from(Array(this.hRes), () => new Array(this.wRes));
    }

    push(values) {
        if (!Array.isArray(values) || values.some((element => typeof element !== 'number'))) {
            throw new TypeError(`'values' must be an Array of Numbers`);
        }

        if (values.length !== this.wRes) {
            throw new RangeError(`'values.length' must be equal to w resolution`);
        }

        this.grid.push(values); // add as last
        this.grid.shift(); // remove first
    }

    draw(canvas) {
        if(!(canvas instanceof HTMLCanvasElement)) {
            throw new TypeError(`'canvas' must be an HTMLCanvasElement`);
        }

        const context = canvas.getContext('2d');

        if (!context || !(context instanceof CanvasRenderingContext2D)) {
            throw new TypeError(`could not get 2d context from 'canvas'`);
        }

        let value = 0;
        let y = 0;
        let x = 0;
        let yDelta = canvas.height / this.hRes;
        let xDelta = canvas.width / this.wRes;

        context.clearRect(0, 0, canvas.width, canvas.height);

        for (let h = 0; h < this.hRes; h++) {
            for (let w = 0; w < this.wRes; w++) {
                value = this.grid[h][w];

                if (!value) {
                    continue;
                }

                y = h * yDelta;
                x = w * xDelta;

                // #ff3d84
                context.fillStyle = `hsl(338, 76%, ${(Math.abs(value) / this.maxValue) * 100}%)`;
                context.fillRect(x, y, xDelta, yDelta);
            }
        }
    }
};

const randomVector = (count, minValue, maxValue) => {
    let vector = [];
    for (let i = 0; i < count; i++) {
        vector.push(minValue + Math.floor(Math.random() * maxValue));
    }

    return vector;
}

const canvas = document.getElementById('spectro-canvas');
const wRes = 60;
const hRes = 30;
const maxValue = 100;
const spectrogram = new SpectrogramGrid(wRes, hRes, maxValue);

const spectrogramNoiseInterval = setInterval(() => {
    spectrogram.push(randomVector(wRes, 0, maxValue));
    spectrogram.draw(canvas);
}, 25);

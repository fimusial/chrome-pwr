class MovingSpectroGrid {
    constructor(canvas, wRes = 100, hRes = 50, maxValue = 255) {
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new TypeError(`'canvas' must be an HTMLCanvasElement`);
        }

        const context = canvas.getContext('2d');
        if (!context || !(context instanceof CanvasRenderingContext2D)) {
            throw new TypeError(`could not get 2d context from 'canvas'`);
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
        this.context = context;
        this.wRes = wRes;
        this.hRes = hRes;
        this.maxValue = maxValue;
        this.grid = Array.from(Array(this.hRes), () => new Array(this.wRes));
    }

    pushRow(values) {
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
                this.context.fillStyle = `hsl(338, 76%, ${(Math.abs(value) / rowMaxValue) * 100}%)`; // #ff3d84
                this.context.fillRect(w * xDelta, h * yDelta, xDelta, yDelta);
            }
        }
    }
};

const spectroGrid = new MovingSpectroGrid(document.getElementById('spectro-canvas')); // 100, 50, 255
const tabNameSpan = document.getElementById('spectro-tab-name-span');

// todo: placeholder with sine wave graphs
setInterval(() => {
    chrome.runtime.sendMessage({ audioHub: 'getFrequencyData', params: {} }).then((response) => {
        if (!response) {
            tabNameSpan.innerText = '';
            return;
        }

        const frequencyDataArray = Object.values(response.data); // because javascript
        spectroGrid.pushRow(frequencyDataArray);
        spectroGrid.draw();

        tabNameSpan.innerText = response.tabTitle;
    })
}, 10);

document.getElementById('spectro-tab-button').onclick = async () => {
    const existingContexts = await chrome.runtime.getContexts({});
    const offscreenDocumentExists = !!existingContexts.find((context) => context.contextType === 'OFFSCREEN_DOCUMENT');
    if (offscreenDocumentExists) {
        chrome.offscreen.closeDocument();
        return;
    }

    await chrome.offscreen.createDocument({
        url: 'spectro/offscreen-audio-hub.html',
        reasons: ['USER_MEDIA'],
        justification: 'Chrome PWR tab audio capture'
    });

    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
    chrome.runtime.sendMessage({ audioHub: 'startTabCapture', params: { streamId: streamId, tabTitle: tab.title } });
};

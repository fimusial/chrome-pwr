import { MovingSpectrogramVisualizer } from './moving-spectrogram-visualizer.js';
import { WaveformGraphVisualizer } from './waveform-graph-visualizer.js';
import { VolumeBarsVisualizer } from './volume-bars-visualizer.js';

export class VisualizerHandler {
    constructor(canvas, orientation = 'horizontal') {
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new TypeError(`'canvas' must be an HTMLCanvasElement`);
        }

        if (orientation !== 'horizontal' && orientation !== 'vertical') {
            throw new TypeError(`'orientation' must be 'horizontal' or 'vertical'`);
        }

        this.canvas = canvas;
        this.orientation = orientation;
    }

    start() {
        this.visualizers = [
            new MovingSpectrogramVisualizer(this.canvas),
            new WaveformGraphVisualizer(this.canvas),
            new VolumeBarsVisualizer(this.canvas)
        ];

        const savedCurrentVisualizer = localStorage.getItem('spectro-current-visualizer');
        this.currentVisualizer = savedCurrentVisualizer === null ? 0 : Number(savedCurrentVisualizer) % this.visualizers.length;

        this.canvas.onclick = () => {
            this.currentVisualizer = (this.currentVisualizer + 1) % this.visualizers.length;
            this.visualizers[this.currentVisualizer].reset();
            localStorage.setItem('spectro-current-visualizer', this.currentVisualizer);
        };

        const nextVisualizerDraw = () => {
            const visualizer = this.visualizers[this.currentVisualizer];
            setTimeout(nextVisualizerDraw, visualizer.nextDrawDelayMs);

            chrome.runtime.sendMessage({ audioHub: visualizer.audioHubMethod, params: {} }).then((response) => {
                if (response && response.data) {
                    visualizer.pushData(response.data);
                } else {
                    visualizer.pushPlaceholder();
                }

                visualizer.draw();
            });
        };

        nextVisualizerDraw();
    }

    toggleOrientation() {
        if (this.orientation === 'horizontal') {
            this.orientation = 'vertical';
            this.canvas.width = 100;
            this.canvas.height = 300;
        } else {
            this.orientation = 'horizontal';
            this.canvas.width = 300;
            this.canvas.height = 100;
        }

        this.visualizers.forEach(visualizer => {
            visualizer.setOrientation(this.orientation);
        });
    }
}

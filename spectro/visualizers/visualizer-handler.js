import { MovingSpectrogramVisualizer } from './moving-spectrogram-visualizer.js';
import { WaveformGraphVisualizer } from './waveform-graph-visualizer.js';
import { VolumeBarsVisualizer } from './volume-bars-visualizer.js';

export class VisualizerHandler {
    constructor(canvas, localStorageKeyPrefix) {
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new TypeError(`'canvas' must be an HTMLCanvasElement`);
        }

        if (!localStorageKeyPrefix || typeof localStorageKeyPrefix !== 'string') {
            throw new TypeError(`'localStorageKeyPrefix' is a required string parameter`);
        }

        this.canvas = canvas;
        this.localStorageKeyPrefix = localStorageKeyPrefix;

        this.shortHubCircuit = false;
        this.orientation = 'horizontal';
        this.visualizers = [];
    }

    start() {
        this.visualizers = [
            new MovingSpectrogramVisualizer(this.canvas),
            new WaveformGraphVisualizer(this.canvas),
            new VolumeBarsVisualizer(this.canvas)
        ];

        this.initOrientation();
        this.initCurrentVisualizer();

        this.canvas.onclick = this.cycleCurrentVisualizer.bind(this);

        const nextVisualizerDraw = () => {
            const visualizer = this.visualizers[this.currentVisualizer];
            setTimeout(nextVisualizerDraw, visualizer.nextDrawDelayMs);

            if (this.shortHubCircuit) {
                visualizer.pushPlaceholder();
                visualizer.draw();
                return;
            }

            chrome.runtime.sendMessage({ hub: visualizer.hubAction, params: {} }).then((response) => {
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
        this.orientation = this.orientation === 'horizontal' ? 'vertical' : 'horizontal';
        this.visualizers.forEach(visualizer => {
            visualizer.setOrientation(this.orientation);
        });

        this.saveOrientation();
    }

    setHue(hue) {
        this.visualizers.forEach(visualizer => {
            visualizer.setHue(hue);
        });
    }

    setSat(sat) {
        this.visualizers.forEach(visualizer => {
            visualizer.setSat(sat);
        });
    }

    setLit(lit) {
        this.visualizers.forEach(visualizer => {
            visualizer.setLit(lit);
        });
    }

    saveVisualizerColor(hue, sat, lit) {
        localStorage.setItem(`${this.localStorageKeyPrefix}-visualizer-color`, JSON.stringify({ hue, sat, lit }));
    }

    getSavedVisualizerColor() {
        return JSON.parse(localStorage.getItem(`${this.localStorageKeyPrefix}-visualizer-color`));
    }

    // private
    initOrientation() {
        const orientation = localStorage.getItem(`${this.localStorageKeyPrefix}-visualizer-orientation`);
        this.orientation = orientation === null ? 'horizontal' : orientation;
        this.visualizers.forEach(visualizer => {
            visualizer.setOrientation(this.orientation);
        });
    }

    // private
    saveOrientation() {
        localStorage.setItem(`${this.localStorageKeyPrefix}-visualizer-orientation`, this.orientation);
    }

    // private
    initCurrentVisualizer() {
        const savedCurrentVisualizer = localStorage.getItem(`${this.localStorageKeyPrefix}-current-visualizer`);
        this.currentVisualizer = savedCurrentVisualizer === null ? 0 : Number(savedCurrentVisualizer) % this.visualizers.length;
    }

    // private
    cycleCurrentVisualizer() {
        this.currentVisualizer = (this.currentVisualizer + 1) % this.visualizers.length;
        this.visualizers[this.currentVisualizer].reset();
        localStorage.setItem(`${this.localStorageKeyPrefix}-current-visualizer`, this.currentVisualizer);
    }
}

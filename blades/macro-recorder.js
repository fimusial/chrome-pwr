export function blade_macroRecorderStart() {
    if (!document.captureClick) {
        console.error('chrome-pwr: macro functions not initialized');
        return;
    }

    if (localStorage.getItem("chrome-pwr-macro-playback-in-progress")) {
        console.warn('chrome-pwr: cannot record macro; playback in progress');
        return;
    }

    localStorage.removeItem("chrome-pwr-macro");
    localStorage.setItem("chrome-pwr-macro-recording-in-progress", true);
    document.addEventListener('mouseup', document.captureClick);
}

export function blade_macroRecorderStop() {
    if (!document.captureClick) {
        console.error('chrome-pwr: macro functions not initialized');
        return;
    }

    document.removeEventListener('mouseup', document.captureClick);
    localStorage.removeItem("chrome-pwr-macro-recording-in-progress");
}

export function blade_macroRecorderPlayOnce() {
    if (!document.playMacro) {
        console.error('chrome-pwr: macro functions not initialized');
        return;
    }

    if (localStorage.getItem("chrome-pwr-macro-recording-in-progress")) {
        console.warn('chrome-pwr: cannot play macro; recording in progress');
        return;
    }

    document.playMacro(0, false, document.blade_macroRecorderPlayOnce_params.initialDelay);
}

export function blade_macroRecorderPlayLoopStart() {
    if (!document.playMacro) {
        console.error('chrome-pwr: macro functions not initialized');
        return;
    }

    if (localStorage.getItem("chrome-pwr-macro-recording-in-progress")) {
        console.warn('chrome-pwr: cannot play macro; recording in progress');
        return;
    }

    document.playMacro(0, true, document.blade_macroRecorderPlayLoopStart_params.initialDelay);
}

export function blade_macroRecorderStopPlayback() {
    clearTimeout(document.lastTimeoutId);
    document.lastTimeoutId = 0;
    localStorage.removeItem("chrome-pwr-macro-playback-in-progress");
}

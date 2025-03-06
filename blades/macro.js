export function blade_macroStart() {
    if (!document.captureClick) {
        console.error('chrome-pwr: macro functions not initialized');
        return;
    }

    if (localStorage.getItem('chrome-pwr-macro-playback-in-progress')) {
        console.warn('chrome-pwr: cannot record macro; playback in progress');
        return;
    }

    localStorage.removeItem('chrome-pwr-macro');
    localStorage.setItem('chrome-pwr-macro-recording-in-progress', true);
    document.addEventListener('mouseup', document.captureClick);
    document.setIndicator('recording');
}

export function blade_macroStop() {
    if (!document.captureClick) {
        console.error('chrome-pwr: macro functions not initialized');
        return;
    }

    document.removeEventListener('mouseup', document.captureClick);
    localStorage.removeItem('chrome-pwr-macro-recording-in-progress');
    document.clearIndicator('recording');
}

export function blade_macroPlayOnce() {
    if (!document.playMacro) {
        console.error('chrome-pwr: macro functions not initialized');
        return;
    }

    if (localStorage.getItem('chrome-pwr-macro-recording-in-progress')) {
        console.warn('chrome-pwr: cannot play macro; recording in progress');
        return;
    }

    document.playMacro(0, false, document.blade_macroPlayOnce_params.initialDelay);
}

export function blade_macroPlayLoopStart() {
    if (!document.playMacro) {
        console.error('chrome-pwr: macro functions not initialized');
        return;
    }

    if (localStorage.getItem('chrome-pwr-macro-recording-in-progress')) {
        console.warn('chrome-pwr: cannot play macro; recording in progress');
        return;
    }

    document.playMacro(0, true, document.blade_macroPlayLoopStart_params.initialDelay);
}

export function blade_macroStopPlayback() {
    clearTimeout(document.lastTimeoutId);
    document.lastTimeoutId = 0;
    localStorage.removeItem('chrome-pwr-macro-playback-in-progress');
    document.clearIndicator('playback');
}

export function blade_macroStartRecording() {
    if (!document.captureClick) {
        console.error('chrome-pwr: macro functions not initialized');
        return;
    }

    if (localStorage.getItem('chrome-pwr-macro-playback-in-progress')) {
        console.warn('chrome-pwr: cannot record macro; playback in progress');
        return;
    }

    localStorage.removeItem('chrome-pwr-macro');
    localStorage.setItem('chrome-pwr-macro-recording-in-progress', document.blade_macroStartRecording_params.slotIndex);
    document.addEventListener('mouseup', document.captureClick);
    document.setIndicator('recording');
}

export async function blade_macroStopRecording() {
    if (!document.captureClick) {
        console.error('chrome-pwr: macro functions not initialized');
        return;
    }

    document.removeEventListener('mouseup', document.captureClick);
    const slotIndex = Number(localStorage.getItem('chrome-pwr-macro-recording-in-progress'));
    localStorage.removeItem('chrome-pwr-macro-recording-in-progress');
    document.clearIndicator('recording');

    const recordedClicks = JSON.parse(localStorage.getItem('chrome-pwr-macro'));
    if (!recordedClicks || recordedClicks.length === 0) {
        return;
    }

    await chrome.runtime.sendMessage({
        hub: 'setMacro', params: {
            hostname: location.hostname,
            slotIndex: slotIndex,
            clicks: recordedClicks,
        }
    });
}

export async function blade_macroPlayOnce() {
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

export async function blade_macroPlayLoop() {
    if (!document.playMacro) {
        console.error('chrome-pwr: macro functions not initialized');
        return;
    }

    if (localStorage.getItem('chrome-pwr-macro-recording-in-progress')) {
        console.warn('chrome-pwr: cannot play macro; recording in progress');
        return;
    }

    document.playMacro(0, true, document.blade_macroPlayLoop_params.initialDelay);
}

export function blade_macroStopPlayback() {
    clearTimeout(document.lastTimeoutId);
    document.lastTimeoutId = 0;
    localStorage.removeItem('chrome-pwr-macro-playback-in-progress');
    document.clearIndicator('playback');
}

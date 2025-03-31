export function blade_macroStartRecording() {
    if (!document.captureClick || !document.setIndicator) {
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
    if (!document.captureClick || !document.clearIndicator) {
        console.error('chrome-pwr: macro functions not initialized');
        return;
    }

    document.removeEventListener('mouseup', document.captureClick);
    const slotIndex = Number(localStorage.getItem('chrome-pwr-macro-recording-in-progress'));
    localStorage.removeItem('chrome-pwr-macro-recording-in-progress');
    document.clearIndicator();
    const recordedClicks = JSON.parse(localStorage.getItem('chrome-pwr-macro'));
    localStorage.removeItem('chrome-pwr-macro');

    if (!recordedClicks || !recordedClicks.length) {
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

    const macro = await chrome.runtime.sendMessage({
        hub: 'getMacro',
        params: {
            hostname: location.hostname,
            slotIndex: document.blade_macroPlayOnce_params.slotIndex
        }
    });

    if (!macro) {
        return;
    }

    localStorage.setItem('chrome-pwr-macro', JSON.stringify(macro.clicks));
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

    const macro = await chrome.runtime.sendMessage({
        hub: 'getMacro',
        params: {
            hostname: location.hostname,
            slotIndex: document.blade_macroPlayLoop_params.slotIndex
        }
    });

    if (!macro) {
        return;
    }

    localStorage.setItem('chrome-pwr-macro', JSON.stringify(macro.clicks));
    document.playMacro(0, true, document.blade_macroPlayLoop_params.initialDelay);
}

export function blade_macroStopPlayback() {
    document.stopMacro();
}

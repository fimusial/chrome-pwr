'use strict';

export function blade_forcedCssDownload() {
    const forcedCss = localStorage.getItem('chrome-pwr-forced-css');

    if (!forcedCss) {
        alert(`PWRToy: ${location.hostname} has no Page CSS yet.`);
        return;
    }

    const blob = new Blob([forcedCss], { type: 'text/css' });
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = `chrome-pwr-forced-css-${location.hostname}.css`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(blobUrl);
}

export async function blade_forcedCssUpload() {
    if (document.forcedCssUploadActive) {
        return;
    }

    let fileHandle = null;
    try {
        [fileHandle] = await window.showOpenFilePicker({
            excludeAcceptAllOption: false,
            multiple: false,
            types: [
                {
                    description: 'Cascading Style Sheets',
                    accept: {
                        'text/css': ['.css']
                    }
                }
            ]
        });
    } catch (error) {
        if (error.name === 'SecurityError') {
            alert(`PWRToy: Please interact with the website first, then try uploading Page CSS again!\n\n${error}`);
        } else {
            alert(`PWRToy: Could not upload Page CSS file.\n\n${error}`);
        }

        return;
    }

    document.forcedCssUploadActive = true;

    const reader = new FileReader();
    reader.onload = () => {
        console.info('chrome-pwr: css file loaded');
        const style = document.getElementById('chrome-pwr-forced-css');
        if (style) {
            style.innerHTML = reader.result;
        }

        localStorage.setItem('chrome-pwr-forced-css', reader.result);
    };

    let previousTimestamp = 0;
    const watchFile = () => {
        fileHandle.getFile().then(file => {
            if (previousTimestamp !== file.lastModified) {
                previousTimestamp = file.lastModified;
                reader.readAsText(file);
            }

            setTimeout(watchFile, 1000);
        }).catch(() => {
            console.error('chrome-pwr: could not load css file');
            document.forcedCssUploadActive = false;
        });
    }

    watchFile();
}

export function blade_forcedCssClear() {
    localStorage.removeItem('chrome-pwr-forced-css');
    const style = document.getElementById('chrome-pwr-forced-css');
    if (style) {
        style.innerHTML = '';
    }
}

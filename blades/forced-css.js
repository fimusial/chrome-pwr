export async function blade_forcedCssUpload() {
    if (document.forcedCssUploadActive) {
        return;
    }

    let fileHandle = null;
    try {
        [fileHandle] = await window.showOpenFilePicker({
            excludeAcceptAllOption: true,
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
            alert(`Please interact with the website first, then try uploading again!\n\n${error}`);
        } else {
            alert(`Could not upload file.\n\n${error}`);
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

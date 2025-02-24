export async function blade_forcedCssUpload() {
    if (document.forcedCssUploadActive) {
        return;
    }

    document.forcedCssUploadActive = true;

    const [fileHandle] = await window.showOpenFilePicker({
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

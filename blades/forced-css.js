export function blade_forcedCssAdd() {
    const result = prompt('CSS', '');
    if (result) {
        localStorage.setItem('chrome-pwr-forced-css', result);
    }
}

export function blade_forcedCssClear() {
    localStorage.removeItem('chrome-pwr-forced-css');
}

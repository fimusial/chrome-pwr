export function blade_forcedCssAdd() {
    let result = prompt('CSS', '');
    localStorage.setItem('chrome-pwr-forced-css', result);
}

export function blade_forcedCssClear() {
    localStorage.removeItem('chrome-pwr-forced-css');
}

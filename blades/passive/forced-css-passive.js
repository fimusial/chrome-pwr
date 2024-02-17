const forcedCss = localStorage.getItem('chrome-pwr-forced-css');
if (forcedCss) {
    const style = document.createElement('style');
    style.innerHTML = forcedCss;
    document.head.appendChild(style);
}

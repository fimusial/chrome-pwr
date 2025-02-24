const style = document.createElement('style');
style.id = 'chrome-pwr-forced-css';
document.head.appendChild(style);

const forcedCss = localStorage.getItem('chrome-pwr-forced-css');
if (forcedCss) {
    style.innerHTML = forcedCss;
}

const style = document.createElement('style');
style.innerHTML = localStorage.getItem('chrome-pwr-forced-css');
document.head.appendChild(style);

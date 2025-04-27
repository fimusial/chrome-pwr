document.addEventListener('mouseup', (event) => {
    const existingBox = document.querySelector('.chrome-pwr-url-grab-box');
    if (!event.altKey || existingBox) {
        if (existingBox && !existingBox.contains(event.target)) {
            existingBox.remove();
        }

        return;
    }

    let urls = null;

    try {
        const documentFragment = document.getSelection().getRangeAt(0).cloneContents();
        urls = [...documentFragment.querySelectorAll('a')].filter(a => a.href).map(a => a.href);
    } catch { }

    if (!urls || !urls.length) {
        return;
    }

    const div = document.createElement('div');
    div.classList.add('chrome-pwr-url-grab-box');

    const left = event.clientX + 400 >= window.innerWidth ? event.clientX - 400 : event.clientX;
    const top = event.clientY + 100 >= window.innerHeight ? event.clientY - 100 : event.clientY;
    div.style.top = `${top}px`;
    div.style.left = `${left}px`;

    const button = document.createElement('button');
    button.innerText = 'open all';

    button.onclick = () => {
        urls.forEach(url => {
            window.open(url, '_blank');
        });
    };

    div.appendChild(button);

    urls.forEach(url => {
        const anchor = document.createElement('a');
        anchor.href = anchor.text = url;
        div.appendChild(anchor);
        div.appendChild(document.createElement('br'));
    });

    document.body.appendChild(div);
});

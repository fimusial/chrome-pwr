import { scriptRequiresApis } from '../script-requires-apis.js';

scriptRequiresApis(['tabs']);

let settings = localStorage.getItem('volume-duck-settings');
settings = settings ? JSON.parse(settings) : [];

const saveSettings = () => {
    localStorage.setItem('volume-duck-settings', JSON.stringify(settings));
};

document.getElementById('volume-duck-exit-button').onclick = () => {
    location.href = '/chrome-pwr.html';
};

const createWebsiteHtmlElements = (website) => {
    const containerDiv = document.createElement('div');
    containerDiv.className = 'volume-duck-website-container';

    const removeButton = document.createElement('button');
    containerDiv.appendChild(removeButton);
    removeButton.className = 'volume-duck-website-remove-button';
    removeButton.setAttribute('hostname', website.hostname);
    removeButton.textContent = '\u{1f7ad}';

    removeButton.onclick = (event) => {
        const hostname = event.target.getAttribute('hostname');
        settings = settings.filter(x => x.hostname !== hostname);
        event.target.parentElement.remove();
        saveSettings();
    };

    const hostnameSpan = document.createElement('span');
    containerDiv.appendChild(hostnameSpan);
    hostnameSpan.textContent = website.hostname;

    const inputsContainerDiv = document.createElement('div');
    containerDiv.appendChild(inputsContainerDiv);
    inputsContainerDiv.className = 'flex-row';

    const enabledCheckboxLabel = document.createElement('label');
    inputsContainerDiv.appendChild(enabledCheckboxLabel);
    enabledCheckboxLabel.textContent = 'enabled';

    const enabledCheckbox = document.createElement('input');
    enabledCheckboxLabel.appendChild(enabledCheckbox);
    enabledCheckbox.setAttribute('hostname', website.hostname);
    enabledCheckbox.type = 'checkbox';
    enabledCheckbox.checked = website.enabled;

    enabledCheckbox.onchange = (event) => {
        const hostname = event.target.getAttribute('hostname');
        const foundWebsite = settings.find(x => x.hostname === hostname);
        foundWebsite.enabled = event.target.checked;
        saveSettings();
    };

    const volumeSlider = document.createElement('input');
    inputsContainerDiv.appendChild(volumeSlider);
    volumeSlider.className = 'volume-duck-website-volume-slider';
    volumeSlider.setAttribute('hostname', website.hostname);
    volumeSlider.type = 'range';
    volumeSlider.value = website.volume;
    volumeSlider.min = '0';
    volumeSlider.max = '100';

    volumeSlider.onchange = (event) => {
        const hostname = event.target.getAttribute('hostname');
        const foundWebsite = settings.find(x => x.hostname === hostname);
        foundWebsite.volume = event.target.value;
        saveSettings();
    };

    const volumeSpan = document.createElement('span');
    inputsContainerDiv.appendChild(volumeSpan);
    volumeSpan.className = 'volume-duck-website-volume-span';
    volumeSpan.textContent = `${website.volume}%`;

    volumeSlider.oninput = (event) => {
        event.target.nextSibling.textContent = `${event.target.value}%`;
    };

    return containerDiv;
};

document.getElementById('volume-duck-websites-list').replaceChildren(...settings.map(website => createWebsiteHtmlElements(website)));

document.getElementById('volume-duck-add-website-button').onclick = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
        return;
    }

    const hostname = new URL(tab.url).hostname;

    if (settings.some(x => x.hostname === hostname)) {
        return;
    }

    const newWebsite = {
        hostname: hostname,
        enabled: true,
        volume: 50
    };

    settings.push(newWebsite);
    document.getElementById('volume-duck-websites-list').appendChild(createWebsiteHtmlElements(newWebsite));
    saveSettings();
};

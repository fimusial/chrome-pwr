# Chrome PWR - a tiny browser pocketknife

<p align="center">
<img alt="Chrome PWR logo" src="https://github.com/fimusial/chrome-pwr/blob/131dc08dc207467d95659c52256fab827babc7a8/images/chrome-pwr-no-bg.png?raw=true" width="400">
</p>

**Chrome PWR** is a Chrome extension comprising a collection of JS scripts that contribute custom features to the browser.

## :zap: Features
<img alt="Chrome PWR UI" align="right" src="https://github.com/fimusial/chrome-pwr/blob/12cdb7ee58ce94a130a3f13891355d8404577822/images/chrome-pwr-ui.png?raw=true" width="200">

### Mouse Macros - easily automate mouse input on webpages

Start recording, capture a sequence of clicks, and hit 'stop recording'. The recorded clicks are saved as X and Y coordinates, with timing and scroll positions taken into account. Choose between single or looped playback. The delay before a single play or the next loop iteration is also adjustable. Recording and playback persist during page loads that occur inside a single domain (origin).

### Other features
- **Maxscroll** allows you to quickly traverse a page with lazily loaded content by forcing it to constantly scroll to the bottom as fast as possible.
- **Page CSS** injects any user-provided CSS code into a webpage during its load, applying the styles across the entire domain. It is useful for hiding unwanted elements or customizing the appearance of a website.
- **Content Edit** enables you to edit any text on a page. Simply place your cursor at the desired text location and start typing. In essence, it activates the `contenteditable` HTML attribute, setting it to `true` for the entire document body.

##  :electric_plug: Installation
*Only unpacked extension installations are currently available.*

1. Clone the repository or download a ZIP file and extract it at the desired location.
2. Navigate to [chrome://extensions](chrome://extensions).
3. Enable developer mode.
4. Click 'Load unpacked' and select the directory that directly contains `manifest.json`
5. Disable developer mode.
6. Pin the extension and access it by clicking its icon.
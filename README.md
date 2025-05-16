# PWRToy :heart:
<p align="center">
<img alt="logo" src="https://github.com/fimusial/chrome-pwr/blob/4c9bfe7e901e3f22889c5a308b29585e38c5ac87/images/logo-no-bg.png?raw=true" width="400">
</p>
<p align="right">
Browser's tiny Swiss Army knife
</p>

**PWRToy** is an extension comprising a collection of vanilla JS scripts which provide your browser with custom features. It utilizes only native Manifest V3 APIs and ships with no third-party code.

## Features
#### Audio
- **Recording** - PWRToy provides a simple way to record audio from one of the browser's tabs. Toggle recording on or off with a single button click and save it in `.wav` format.
- **Visualizers & Filters** - When capturing audio from a tab, you can choose between three different live visualizers: a spectrogram, a volume bar chart, and a waveform graph. These can be cycled through with a click. The visualizers can also be popped out to a separate window, where you can adjust their color and size. Additionally, the extension includes a high-pass and a low-pass filter, which can be controlled with two sliders to remove unwanted frequencies from the sound.
- **Volume Duck** - Have you ever encountered a website, which played annoyingly loud sounds with no way of turning them down, forcing you to lower the volume in your device's settings? PWRToy has got you covered! Use the Volume Duck feature to configure a volume multiplier for each pesky website.

#### Mouse Macros
This feature allows you to record a sequence of mouse clicks on a website and play it back - either once or in a loop. Keyboard shortcuts can be configured to trigger macro playback conveniently. Both the recording and the playback will be maintained across page loads within the same website.

New in v1.4: You can now keep a collection of macros for each website. Recording and playback occur with respect to the macro slot currently selected in the dropdown. Select the "empty" slot to create a new macro, use the pencil icon to name it, and the "X" icon to delete it - simple as that.

#### Miscellaneous features
- **Maxscroll** - This one enables you to quickly traverse a page with lazily loaded content by forcing it to constantly scroll up or down as fast as possible.
- **Page CSS** - The extension injects any user-provided CSS file into a webpage each time it loads, applying the styles across the entire domain. This can be used to hide unwanted elements or to customize the website's design. After you upload a stylesheet, PWRToy monitors the file for changes as long as the webpage remains open, making it easy to experiment with styles.
- **Content Edit** - This feature provides a quick way to edit any text on a page without using the developer tools. Simply click the "Content Edit On" button, place your cursor at the desired text location and start typing. Essentially, it activates the `contenteditable` HTML attribute for the entire document body.
- **URL Grab** - It helps with inspecting, opening, and copying links on web pages. To use it, hold down the Alt key and select any text that contains one or more hyperlinks. A small popup box will appear, containing all the URLs extracted from the selection.

## Get it from Chrome Web Store
[PWRToy](https://chromewebstore.google.com/detail/pwrtoy/bhnjkagdoajnhojbecjgjcimidlmogbo)

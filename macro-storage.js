export class MacroStorage {
    constructor() {
        this.storage = localStorage.getItem('macro-storage');
        this.storage = this.storage ? JSON.parse(this.storage) : [];

        if (!Array.isArray(this.storage) || this.storage.some((x => typeof x !== 'object'))) {
            throw new TypeError('macro storage must be an array of objects');
        }
    }

    getPageMacrosInfo(hostname) {
        const page = this.storage.find(x => x.hostname === hostname);
        const macros = page && page.macros ? page.macros.sort((a, b) => a - b) : [];
        const maxSlotIndex = macros.reduce((max, curr) => max > curr.slotIndex ? max : curr.slotIndex, -1);

        return {
            macros: macros.map(macro => { return { name: macro.name, slotIndex: macro.slotIndex }; }),
            maxSlotIndex
        };
    }

    setSlotName(hostname, slotIndex, name) {
        let page = this.storage.find(x => x.hostname === hostname);
        if (!page) {
            page = { hostname, macros: [] };
            this.storage.push(page);
        }

        let macro = page.macros.find(x => x.slotIndex === slotIndex);
        if (!macro) {
            macro = { slotIndex, name };
            page.macros.push(macro);
        } else {
            macro.name = name;
        }

        localStorage.setItem('macro-storage', JSON.stringify(this.storage));
    }

    saveMacro(hostname, slotIndex, clicks) {
        let page = this.storage.find(x => x.hostname === hostname);
        if (!page) {
            page = { hostname, macros: [] };
            this.storage.push(page);
        }

        let macro = page.macros.find(x => x.slotIndex === slotIndex);
        if (!macro) {
            macro = { slotIndex, name: `macro ${slotIndex}`, clicks };
            page.macros.push(macro);
        } else {
            macro.clicks = clicks;
        }

        localStorage.setItem('macro-storage', JSON.stringify(this.storage));
    }
}

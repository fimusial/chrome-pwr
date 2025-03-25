export class MacroStorage {
    constructor(hostname) {
        if (!hostname || typeof hostname !== 'string') {
            throw new TypeError(`'hostname' is a required string parameter`);
        }

        this.hostname = hostname;
        this.storage = localStorage.getItem('macro-storage');
        this.storage = this.storage ? JSON.parse(this.storage) : [];

        if (!Array.isArray(this.storage) || this.storage.some((x => typeof x !== 'object'))) {
            throw new TypeError('macro storage must be an array of objects');
        }
    }

    getNames() {
        const page = this.storage.find(x => x.hostname === this.hostname);
        return page && page.macros ? page.macros.map(x => x.name) : [];
    }

    setSlotName(slotIndex, name) {
        let page = this.storage.find(x => x.hostname === this.hostname);
        if (!page) {
            page = { hostname: this.hostname, macros: [] };
            this.storage.push(page);
        }

        let macro = page.macros[slotIndex];
        if (!macro) {
            page.macros.push({ name });
        } else {
            macro.name = name;
        }

        localStorage.setItem('macro-storage', JSON.stringify(this.storage));
    }

    setMacro(slotIndex, clicks) {
        let page = this.storage.find(x => x.hostname === this.hostname);
        if (!page) {
            page = { hostname: this.hostname, macros: [] };
            this.storage.push(page);
        }

        let macro = page.macros[slotIndex];
        if (!macro) {
            page.macros.push({ name: `macro ${page.macros.length + 1}`, clicks });
        } else {
            macro.clicks = clicks;
        }

        localStorage.setItem('macro-storage', JSON.stringify(this.storage));
    }

    deleteMacro(slotIndex) {
        let page = this.storage.find(x => x.hostname === this.hostname);
        if (!page) {
            return;
        }

        let macro = page.macros[slotIndex];
        if (!macro) {
            return;
        }

        page.macros.splice(slotIndex, 1);
        localStorage.setItem('macro-storage', JSON.stringify(this.storage));
    }
}

export class MetadataStore {
    constructor() {
        this.store = new Map();
        this.listeners = new Set();
    }

    set(key, value) {
        this.store.set(key, value);
        this.notify(key, value);
    }

    get(key) {
        return this.store.get(key);
    }

    has(key) {
        return this.store.has(key);
    }

    delete(key) {
        const result = this.store.delete(key);
        this.notify(key, null);
        return result;
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notify(key, value) {
        this.listeners.forEach(callback => callback(key, value, this.store));
    }
}
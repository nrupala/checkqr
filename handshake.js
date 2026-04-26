/**
 * Checkinfo Universal Handshake API
 * Version: 1.0.0
 * Inter-app communication for Checkinfo ecosystem
 */

class CheckinfoHandshake {
    constructor() {
        this.appName = null;
        this.appInfo = null;
        this.peers = new Map();
        this.listeners = new Map();
        this._loadPeers();
    }
    
    register(name, info) {
        this.appName = name;
        this.appInfo = { ...info, registered: Date.now() };
        this._savePeers();
        console.log(`[Handshake] Registered: ${name}`);
    }
    
    discover(appName) {
        return this.peers.get(appName);
    }
    
    listPeers() {
        return Array.from(this.peers.keys());
    }
    
    send(peer, message) {
        if(!peer) return false;
        const envelope = {
            from: this.appName,
            to: peer.name,
            message: message,
            timestamp: Date.now(),
            id: Math.random().toString(36).substring(2)
        };
        const queue = JSON.parse(localStorage.getItem('checkinfo_queue') || '[]');
        queue.push(envelope);
        if(queue.length > 100) queue.shift();
        localStorage.setItem('checkinfo_queue', JSON.stringify(queue));
        return true;
    }
    
    receive() {
        const queue = JSON.parse(localStorage.getItem('checkinfo_queue') || '[]');
        const pending = queue.filter(m => m.to === this.appName);
        const remaining = queue.filter(m => m.to !== this.appName);
        localStorage.setItem('checkinfo_queue', JSON.stringify(remaining));
        return pending;
    }
    
    on(event, callback) {
        if(!this.listeners.has(event)) this.listeners.set(event, []);
        this.listeners.get(event).push(callback);
    }
    
    emit(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(cb => cb(data));
    }
    
    _savePeers() {
        if(this.appName) {
            this.peers.set(this.appName, this.appInfo);
            localStorage.setItem('checkinfo_peers', JSON.stringify(Array.from(this.peers.entries())));
        }
    }
    
    _loadPeers() {
        try {
            const stored = JSON.parse(localStorage.getItem('checkinfo_peers') || '[]');
            this.peers = new Map(stored);
        } catch(e) {
            this.peers = new Map();
        }
    }
}

if(typeof module !== 'undefined' && module.exports) {
    module.exports = CheckinfoHandshake;
}
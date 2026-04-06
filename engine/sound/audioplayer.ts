export class SoundSystem {
    private ctx: AudioContext;
    private bufferCache = new Map<string, AudioBuffer>();
    private activeSources = new Set<AudioBufferSourceNode>();

    private masterGain: GainNode;

    constructor() {
        // 👉 zuerst globalen nehmen, sonst neuen erstellen
        this.ctx = (window as any).__audioCtx ?? new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 1;

        this.masterGain.connect(this.ctx.destination);
    }

    // ================= LOAD =================
    async load(url: string): Promise<AudioBuffer> {
        if (this.bufferCache.has(url)) {
            return this.bufferCache.get(url)!;
        }

        let arrayBuffer: ArrayBuffer;
        
        // Check if resource is embedded in single-file export
        const loadResource = (window as any).__loadResource;
        if (loadResource) {
            const dataUri = loadResource(url);
            if (dataUri) {
                // Convert data URI to ArrayBuffer
                const response = await fetch(dataUri);
                arrayBuffer = await response.arrayBuffer();
            } else {
                // Fallback to fetch if resource not found
                const res = await fetch(url);
                arrayBuffer = await res.arrayBuffer();
            }
        } else {
            // Normal fetch for multi-file export
            const res = await fetch(url);
            arrayBuffer = await res.arrayBuffer();
        }

        const buffer = await this.ctx.decodeAudioData(arrayBuffer);

        this.bufferCache.set(url, buffer);
        return buffer;
    }

    // ================= PLAY =================
    async play(
        url: string,
        options: {
            volume?: number;
            loop?: boolean;
            playbackRate?: number;
        } = {}
    ) {
        const buffer = await this.load(url);

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = options.loop ?? false;
        source.playbackRate.value = options.playbackRate ?? 1;

        const gain = this.ctx.createGain();
        gain.gain.value = options.volume ?? 1;

        source.connect(gain);
        gain.connect(this.masterGain);

        source.start(0);

        this.activeSources.add(source);

        source.onended = () => {
            this.activeSources.delete(source);
        };

        return source;
    }

    // ================= STOP =================
    stopAll() {
        for (const s of this.activeSources) {
            try {
                s.stop();
            } catch {}
        }
        this.activeSources.clear();
    }

    // ================= GLOBAL VOLUME =================
    setVolume(v: number) {
        this.masterGain.gain.value = v;
    }

    // ================= CONTEXT CONTROL =================
    async resume() {
        if (this.ctx.state === "suspended") {
            await this.ctx.resume();
        }
    }

    async pause() {
        if (this.ctx.state === "running") {
            await this.ctx.suspend();
        }
    }
}

/**
 * Web Audio based sound manager for short effects and looping music.
 *
 * Sounds are decoded once and cached by URL. In normal builds, audio files are
 * loaded with `fetch(url)`. Single-file exports can provide `window.__loadResource`
 * to resolve embedded resources before falling back to normal fetch.
 */
export class SoundSystem {
    private ctx: AudioContext;
    private bufferCache = new Map<string, AudioBuffer>();
    private activeSources = new Set<AudioBufferSourceNode>();

    private masterGain: GainNode;

    /**
     * Creates or reuses an `AudioContext` and connects a master gain node.
     *
     * Browsers often require user interaction before audio can play. If playback
     * is blocked or suspended, call `resume()` from a click/key handler.
     */
    constructor() {
        // 👉 zuerst globalen nehmen, sonst neuen erstellen
        this.ctx = (window as any).__audioCtx ?? new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 1;

        this.masterGain.connect(this.ctx.destination);
    }

    /**
     * Loads, decodes, and caches an audio file.
     *
     * @param url Audio URL or embedded resource key.
     * @returns Decoded `AudioBuffer`.
     */
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

    /**
     * Plays an audio file and returns the active source node.
     *
     * @param url Audio URL or embedded resource key.
     * @param options Per-playback settings such as volume, loop, and speed.
     */
    async play(
        url: string,
        options: {
            volume?: number;
            loop?: boolean;
            playbackRate?: number;
        } = {}
    ): Promise<AudioBufferSourceNode> {
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

    /**
     * Stops every source started through this `SoundSystem`.
     */
    stopAll(): void {
        for (const s of this.activeSources) {
            try {
                s.stop();
            } catch {}
        }
        this.activeSources.clear();
    }

    /**
     * Sets the master volume for all current and future sounds.
     *
     * `1` is full volume, `0` is silent. Values above `1` amplify.
     */
    setVolume(v: number): void {
        this.masterGain.gain.value = v;
    }

    /**
     * Resumes the underlying `AudioContext` if the browser suspended it.
     */
    async resume(): Promise<void> {
        if (this.ctx.state === "suspended") {
            await this.ctx.resume();
        }
    }

    /**
     * Suspends the underlying `AudioContext` without clearing loaded buffers.
     */
    async pause(): Promise<void> {
        if (this.ctx.state === "running") {
            await this.ctx.suspend();
        }
    }
}

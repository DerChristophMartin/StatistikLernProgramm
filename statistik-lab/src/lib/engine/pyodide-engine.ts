export type EngineStatus = 'idle' | 'loading' | 'ready' | 'running' | 'error';

export interface ExecutionResult {
    stdout: string;
    stderr: string;
    result: string | null;
    plots: string[];       // Base64-encoded PNG-Bilder
    error: string | null;
    executionTime: number; // Millisekunden
}

type MessageCallback = (response: any) => void;

export class PyodideEngine {
    private worker: Worker | null = null;
    private callbacks: Map<string, MessageCallback> = new Map();
    private plotBuffers: Map<string, string[]> = new Map();
    private _status: EngineStatus = 'idle';
    private statusListeners: Set<(status: EngineStatus) => void> = new Set();

    get status(): EngineStatus {
        return this._status;
    }

    private setStatus(status: EngineStatus) {
        this._status = status;
        this.statusListeners.forEach((fn) => fn(status));
    }

    onStatusChange(fn: (status: EngineStatus) => void): () => void {
        this.statusListeners.add(fn);
        return () => this.statusListeners.delete(fn);
    }

    private generateId(): string {
        return Math.random().toString(36).substring(2, 15);
    }

    async init(): Promise<void> {
        if (this._status === 'ready' || this._status === 'loading') return;

        this.setStatus('loading');

        return new Promise((resolve, reject) => {
            try {
                this.worker = new Worker(
                    new URL('./pyodide-worker.ts', import.meta.url),
                    { type: 'module' }
                );

                this.worker.onmessage = (event) => {
                    const { id, type, data, error } = event.data;

                    if (type === 'plot') {
                        if (!this.plotBuffers.has(id)) {
                            this.plotBuffers.set(id, []);
                        }
                        this.plotBuffers.get(id)!.push(data);
                        return;
                    }

                    const callback = this.callbacks.get(id);
                    if (callback) {
                        if (type === 'init-done' || type === 'result' || type === 'error') {
                            this.callbacks.delete(id);
                        }
                        callback(event.data);
                    }
                };

                this.worker.onerror = (error) => {
                    this.setStatus('error');
                    reject(error);
                };

                const id = this.generateId();
                this.callbacks.set(id, (response) => {
                    if (response.type === 'init-done') {
                        this.setStatus('ready');
                        resolve();
                    } else {
                        this.setStatus('error');
                        reject(new Error(response.error));
                    }
                });

                this.worker.postMessage({ id, type: 'init' });
            } catch (error) {
                this.setStatus('error');
                reject(error);
            }
        });
    }

    async runCode(code: string): Promise<ExecutionResult> {
        if (!this.worker || this._status !== 'ready') {
            try {
                await this.init();
            } catch (e) {
                throw new Error('Python Engine nicht bereit und konnte nicht initialisiert werden');
            }
        }

        this.setStatus('running');
        const startTime = performance.now();

        return new Promise((resolve) => {
            const id = this.generateId();
            this.plotBuffers.set(id, []);

            this.callbacks.set(id, (response) => {
                if (response.type === 'result' || response.type === 'error') {
                    const executionTime = performance.now() - startTime;
                    const plots = this.plotBuffers.get(id) || [];
                    this.plotBuffers.delete(id);

                    this.setStatus('ready');

                    if (response.type === 'error') {
                        resolve({
                            stdout: '',
                            stderr: '',
                            result: null,
                            plots: [],
                            error: response.error,
                            executionTime,
                        });
                    } else {
                        resolve({
                            stdout: response.data.stdout || '',
                            stderr: response.data.stderr || '',
                            result: response.data.result,
                            plots,
                            error: null,
                            executionTime,
                        });
                    }
                }
            });

            this.worker!.postMessage({ id, type: 'run', code });
        });
    }

    async loadPackage(packages: string[]): Promise<void> {
        if (!this.worker) throw new Error('Worker nicht initialisiert');

        return new Promise((resolve, reject) => {
            const id = this.generateId();
            this.callbacks.set(id, (response) => {
                if (response.type === 'error') reject(new Error(response.error));
                else resolve();
            });
            this.worker!.postMessage({ id, type: 'load-package', packages });
        });
    }

    async setVariable(name: string, value: any): Promise<void> {
        if (!this.worker) throw new Error('Worker nicht initialisiert');

        return new Promise((resolve, reject) => {
            const id = this.generateId();
            this.callbacks.set(id, (response) => {
                if (response.type === 'error') reject(new Error(response.error));
                else resolve();
            });
            this.worker!.postMessage({ id, type: 'set-variable', variable: { name, value } });
        });
    }

    async reset(): Promise<void> {
        if (!this.worker) return;

        return new Promise((resolve, reject) => {
            const id = this.generateId();
            this.callbacks.set(id, (response) => {
                if (response.type === 'error') reject(new Error(response.error));
                else resolve();
            });
            this.worker!.postMessage({ id, type: 'reset' });
        });
    }
}

// Singleton Instanz
export const pyodideEngine = new PyodideEngine();

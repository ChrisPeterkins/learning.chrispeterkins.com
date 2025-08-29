// WebAssembly module loader utility
export interface WasmModule {
  memory: WebAssembly.Memory;
  instance: WebAssembly.Instance;
  exports: any;
}

export class WasmLoader {
  private static cache: Map<string, WasmModule> = new Map();

  static async load(wasmPath: string, importObject?: WebAssembly.Imports): Promise<WasmModule> {
    // Check cache first
    if (this.cache.has(wasmPath)) {
      return this.cache.get(wasmPath)!;
    }

    try {
      const response = await fetch(wasmPath);
      const bytes = await response.arrayBuffer();
      
      // Create memory
      const memory = new WebAssembly.Memory({ initial: 256, maximum: 512 });
      
      // Default import object
      const imports = importObject || {
        env: {
          memory,
          abort: () => console.error('Abort called from WASM'),
          trace: (arg: number) => console.log('Trace:', arg),
        },
        js: {
          mem: memory,
        },
      };

      const module = await WebAssembly.instantiate(bytes, imports);
      
      const wasmModule: WasmModule = {
        memory,
        instance: module.instance,
        exports: module.instance.exports,
      };

      // Cache the module
      this.cache.set(wasmPath, wasmModule);
      
      return wasmModule;
    } catch (error) {
      console.error(`Failed to load WASM module from ${wasmPath}:`, error);
      throw error;
    }
  }

  static clearCache() {
    this.cache.clear();
  }
}

// Helper functions for working with WASM memory
export class WasmMemory {
  static copyToWasm(
    memory: WebAssembly.Memory,
    data: Uint8Array | Float32Array | Int32Array,
    offset: number
  ): void {
    const bytes = new Uint8Array(memory.buffer, offset, data.byteLength);
    if (data instanceof Uint8Array) {
      bytes.set(data);
    } else {
      bytes.set(new Uint8Array(data.buffer));
    }
  }

  static readString(memory: WebAssembly.Memory, ptr: number, len: number): string {
    const bytes = new Uint8Array(memory.buffer, ptr, len);
    return new TextDecoder().decode(bytes);
  }

  static writeString(memory: WebAssembly.Memory, str: string, ptr: number): number {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    const memBytes = new Uint8Array(memory.buffer, ptr, bytes.length);
    memBytes.set(bytes);
    return bytes.length;
  }

  static getFloat32Array(memory: WebAssembly.Memory, ptr: number, len: number): Float32Array {
    return new Float32Array(memory.buffer, ptr, len * 4);
  }

  static getInt32Array(memory: WebAssembly.Memory, ptr: number, len: number): Int32Array {
    return new Int32Array(memory.buffer, ptr, len * 4);
  }

  static getUint8Array(memory: WebAssembly.Memory, ptr: number, len: number): Uint8Array {
    return new Uint8Array(memory.buffer, ptr, len);
  }
}

// Performance measurement utilities
export class WasmPerformance {
  static measure(fn: () => void, iterations: number = 1): number {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    return performance.now() - start;
  }

  static async measureAsync(fn: () => Promise<void>, iterations: number = 1): Promise<number> {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      await fn();
    }
    return performance.now() - start;
  }

  static compare(jsTime: number, wasmTime: number): {
    speedup: number;
    percentage: number;
    faster: 'js' | 'wasm';
  } {
    const speedup = jsTime / wasmTime;
    const percentage = ((jsTime - wasmTime) / jsTime) * 100;
    return {
      speedup,
      percentage,
      faster: speedup > 1 ? 'wasm' : 'js',
    };
  }
}
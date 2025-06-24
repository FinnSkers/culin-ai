/// <reference types="node" />

declare module 'wav' {
  import { Transform } from 'stream';

  export class Writer extends Transform {
    constructor(options?: WriterOptions);
  }

  export interface WriterOptions {
    format?: number;
    channels?: number;
    sampleRate?: number;
    bitDepth?: number;
  }

  export class Reader extends Transform {
    constructor(options?: any);
    on(event: 'format', listener: (format: any) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this;
  }
}

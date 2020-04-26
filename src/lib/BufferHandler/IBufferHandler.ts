export interface IBufferHandler {
  readonly pageBytes: number;
  /**
   * @returns `AsyncIterator` that yields consecutive page buffers. Stops at
   * `end` or when the end of the buffer collection is reached.
   * @param start Which page to start iterating from. Default `0`
   * @param end Which page to stop iterating at, exclusive. Default
   * `Infinity`
   */
  readPages(start?: number, end?: number): AsyncGenerator<Uint8Array, void>;

  /**
   * Scans to end of buffer collection to determine how many page buffers are
   * stored.
   */
  getLength(): Promise<number>;

  /**
   * @returns `Promise<Uint8Array>` if pageNumber is within range
   * @returns `Promise<undefined>` if pageNumber is out of range
   */
  getPage(pageNumber: number): Promise<Uint8Array | undefined>;

  /**
   * overwrites an entire page
   * @param pageNumber page number
   * @param buffer buffer to write
   */
  writePage(pageNumber: number, buffer: Uint8Array): Promise<number>;
}

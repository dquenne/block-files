import { IBufferHandler } from "./IBufferHandler.ts";

/**
 * Simple file-based buffer handler. Read/write operations actually read from
 * or write to a file on disk.
 */
export class FileBufferHandler implements IBufferHandler {
  constructor(private file: Deno.File, readonly pageBytes: number) {}

  async *readPages(start = 0, end = Infinity) {
    for (let i = start; i < end; i++) {
      const p = await this.getPage(i);
      if (!p) {
        break;
      }
      yield p;
    }
  }

  async getLength() {
    return await this.scanToGetLength();
  }

  async getPage(pageNumber: number) {
    const outBuffer = new Uint8Array(this.pageBytes);
    await this.seekToPage(pageNumber);
    const numRead = await this.file.read(outBuffer);
    if (numRead === Deno.EOF) {
      return undefined;
    }
    return outBuffer;
  }

  async writePage(pageNumber: number, buffer: Uint8Array) {
    await this.seekToPage(pageNumber);
    return await this.file.write(buffer);
  }

  private async seekToPage(pageNumber: number) {
    const newIndex = await this.file.seek(
      pageNumber * this.pageBytes,
      Deno.SeekMode.SEEK_START
    );
    return newIndex;
  }

  private async scanToGetLength() {
    const endIndex = await this.file.seek(0, Deno.SeekMode.SEEK_END);
    return Math.ceil(endIndex / this.pageBytes);
  }
}

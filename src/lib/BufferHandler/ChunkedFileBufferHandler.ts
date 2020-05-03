import { IBufferHandler } from "./IBufferHandler.ts";
import { chunkedRead, isEOF, chunkedWrite } from "../util/file.ts";

/**
 * Simple file-based buffer handler. Read/write operations actually read from
 * or write to a file on disk.
 */
export class ChunkedFileBufferHandler implements IBufferHandler {
  constructor(
    private file: Deno.File,
    readonly pageBytes: number,
    readonly chunkPages: number
  ) {}

  async *readPages(start = 0, end = Infinity) {
    let current = start;
    while (current < end) {
      const numPages = Math.min(this.chunkPages, end - current);
      const { bytesRead, buffer } = await this.getPages(current, numPages);
      if (isEOF(bytesRead)) {
        break;
      }
      const receivedPages = Math.ceil(bytesRead / this.pageBytes);
      current += receivedPages;
      for (let actual = 0; actual < receivedPages; actual++) {
        yield buffer.slice(
          actual * this.pageBytes,
          (actual + 1) * this.pageBytes
        );
      }
    }
  }

  async getLength() {
    return await this.scanToGetLength();
  }

  async getPage(pageNumber: number) {
    return (await this.getPages(pageNumber, 1)).buffer;
  }

  async getPages(startPage: number, howMany: number) {
    const outBuffer = new Uint8Array(this.pageBytes * howMany);
    await this.seekToPage(startPage);
    const bytesRead = await chunkedRead(this.file, outBuffer);
    return { bytesRead: bytesRead, buffer: outBuffer };
  }

  async writePage(pageNumber: number, buffer: Uint8Array) {
    await this.seekToPage(pageNumber);
    return await chunkedWrite(this.file, buffer);
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

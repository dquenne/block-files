import { Page } from "./Page/index.ts";
import { IBufferHandler } from "./BufferHandler/IBufferHandler.ts";
import { FileBufferHandler } from "./BufferHandler/FileBufferHandler.ts";

export class PageManager {
  constructor(readonly bufferHandler: IBufferHandler, public length: number) {}

  /**
   * AsyncGenerator that yields consecutive `Page`s. Finishes when it reaches
   * `end` or the buffer manager is out of pages.
   * @param start Which page to start iterating from. Default `0`
   * @param end Which page to stop iterating at, exclusive. Default
   * `this.length`
   */
  async *readPages(start = 0, end = this.length) {
    const bufferIt = this.bufferHandler.readPages();
    for (let i = start; i < end; i++) {
      const buf = (await bufferIt.next()).value;
      if (!buf) {
        break;
      }
      yield Page.fromBuffer(buf);
    }
  }

  async getPage(pageNumber: number) {
    const buffer = await this.bufferHandler.getPage(pageNumber);
    return buffer && Page.fromBuffer(buffer);
  }

  async newPage() {
    const numPages = await this.bufferHandler.getLength();
    const newPage = Page.create(this.bufferHandler.pageBytes);
    await this.writePage(numPages, newPage);
    return newPage;
  }

  /**
   * overwrites an entire page
   * @param pageNumber 0-indexed page number
   * @param page Page instance to write
   */
  async writePage(pageNumber: number, page: Page) {
    await this.bufferHandler.writePage(pageNumber, page.buffer);
  }

  static fromFile(file: Deno.File, pageBytes: number) {
    return new PageManager(new FileBufferHandler(file, pageBytes), pageBytes);
  }

  static async fromPath(path: string, pageBytes: number) {
    const file = await Deno.open(path, { read: true, write: true });
    return this.fromFile(file, pageBytes);
  }
}

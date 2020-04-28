import { Page } from "./Page/index.ts";
import { IBufferHandler } from "./BufferHandler/IBufferHandler.ts";
import { FileBufferHandler } from "./BufferHandler/FileBufferHandler.ts";

/* TO DO: consider making PageManager stateful and having it keep track of a
  "current open page" and read/write to files only when opening & closing
  pages */
export class PageManager {
  constructor(readonly bufferHandler: IBufferHandler) {}

  /**
   * AsyncGenerator that yields consecutive `Page`s. Finishes when it reaches
   * `end` or the buffer manager is out of pages.
   * @param start Which page to start iterating from. Default `0`
   * @param end Which page to stop iterating at, exclusive. Default
   * `Infinity`
   */
  async *readPages(start = 0, end = Infinity) {
    for await (const pageBuffer of this.bufferHandler.readPages(start, end)) {
      yield Page.fromBuffer(pageBuffer);
    }
  }

  async getLength() {
    return await this.bufferHandler.getLength();
  }

  async getPage(pageNumber: number) {
    if (pageNumber < 0) {
      return undefined;
    }
    const buffer = await this.bufferHandler.getPage(pageNumber);
    return buffer && Page.fromBuffer(buffer);
  }

  /**
   * @returns new page's pageNumber
   */
  async newPage() {
    const numPages = await this.bufferHandler.getLength();
    const newPage = Page.create(this.bufferHandler.pageBytes);
    await this.writePage(numPages, newPage);
    return numPages;
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
    return new PageManager(new FileBufferHandler(file, pageBytes));
  }

  static async fromPath(path: string, pageBytes: number) {
    const file = await Deno.open(path, { read: true, write: true });
    return this.fromFile(file, pageBytes);
  }
}

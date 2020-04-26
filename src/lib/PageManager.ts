import { Page } from "./Page/index.ts";

export class PageManager {
  constructor(
    readonly f: Deno.File,
    readonly pageBytes: number,
    public length: number
  ) {}

  /**
   * AsyncGenerator that yields consecutive `Page`s
   * @param start Which page to start iterating from. Default `0`
   * @param end Which page to stop iterating at, exclusive. Default
   * `this.length`
   */
  async *readPages(start = 0, end = this.length) {
    for (let i = start; i < end; i++) {
      yield (await this.getPage(i))!;
    }
  }

  async getPage(pageNumber: number) {
    if (pageNumber >= this.length) {
      return undefined;
    }

    const outBuffer = new Uint8Array(this.pageBytes);
    const numRead = await this.f.read(outBuffer);
    if (numRead === Deno.EOF) {
      return undefined;
    }
    return Page.fromBuffer(outBuffer);
  }

  async newPage() {
    this.length++;
    const newPage = Page.create(this.pageBytes);
    await this.writePage(this.length - 1, newPage);
    return newPage;
  }

  /**
   * overwrites an entire page
   * @param pageNumber 0-indexed page number
   * @param page Page instance to write
   */
  async writePage(pageNumber: number, page: Page) {
    await this.writePageBuffer(pageNumber, page.buffer);
  }

  /**
   * overwrites an entire page
   * @param pageNumber 0-indexed page number
   * @param buffer buffer to overwrite page with
   */
  async writePageBuffer(pageNumber: number, buffer: Uint8Array) {
    await this.seekToPage(pageNumber);
    return await this.f.write(buffer);
  }

  private async seekToPage(pageNumber: number) {
    const newIndex = await this.f.seek(
      pageNumber * this.pageBytes,
      Deno.SeekMode.SEEK_START
    );
    if (newIndex !== pageNumber * this.pageBytes) {
      throw new Error("EOF");
    }
    return newIndex;
  }

  static fromFile(file: Deno.File, pageBytes: number, length: number) {
    return new PageManager(file, pageBytes, length);
  }

  static async fromPath(path: string, pageBytes: number, length: number) {
    const file = await Deno.open(path, { read: true, write: true });
    return new PageManager(file, pageBytes, length);
  }
}

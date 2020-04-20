import { Page } from "./Page.ts";

export class PageManager {
  currentPage = 0;
  // TODO: pageBytes and lastPage should be specified in the first page of the
  // file, not manually set
  constructor(
    readonly f: Deno.File,
    readonly pageBytes: number,
    public lastPage: number
  ) {}

  async getPage(pageNumber: number) {
    if (pageNumber > this.lastPage) {
      return undefined;
    }
    console.log(pageNumber);
    console.log(await this.seekToPage(pageNumber));

    const outBuffer = new Uint8Array(this.pageBytes);
    const numRead = await this.f.read(outBuffer);
    if (numRead === Deno.EOF) {
      return undefined;
    }
    return Page.fromBuffer(outBuffer);
  }

  async newPage() {
    this.lastPage++;
    const newPage = Page.create("foobar", this.pageBytes);
    await this.writePage(this.lastPage, newPage);
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

  static fromFile(file: Deno.File, pageBytes: number, lastPage: number) {
    return new PageManager(file, pageBytes, lastPage);
  }

  static async fromPath(path: string, pageBytes: number, lastPage: number) {
    const file = await Deno.open(path, { read: true, write: true });
    return new PageManager(file, pageBytes, lastPage);
  }
}

import { ITable } from "./ITable.ts";
import { IRowPointer } from "../RowPointer/IRowPointer.ts";
import { IBufferHandler } from "../BufferHandler/IBufferHandler.ts";
import { PageManager } from "../PageManager.ts";
import { FileBufferHandler } from "../BufferHandler/FileBufferHandler.ts";
import { RowPointer } from "../RowPointer/RowPointer.ts";

export type Serializer<T> = (row: T) => Uint8Array;
export type Deserializer<T> = (buf: Uint8Array) => T;

export class FileTable<T> implements ITable<T> {
  readonly pageManager: PageManager;

  constructor(
    bufferHandler: IBufferHandler,
    readonly rowDeserializer: Deserializer<T>,
    readonly rowSerializer: Serializer<T>
  ) {
    this.pageManager = new PageManager(bufferHandler);
  }

  async *readAllRows(beginPage = 0, endPage = Infinity) {
    for await (const page of this.pageManager.readPages()) {
      for await (const row of page.readRecords()) {
        yield this.rowDeserializer(row);
      }
    }
  }

  async *readPage(pageNumber: number) {
    const page = (await this.pageManager.getPage(pageNumber))!;
    for (const record of page.readRecords()) {
      yield this.rowDeserializer(record);
    }
  }

  async getRow(rowPointer: IRowPointer) {
    const page = await this.pageManager.getPage(rowPointer.pageNumber);
    if (!page) {
      return undefined;
    }
    const buf = page.getRecord(rowPointer.recordNumber);
    return buf && this.rowDeserializer(buf);
  }

  async addRow(row: T) {
    const [pointer] = await this.addRows([row]);
    return pointer;
  }

  async addRows(rows: Iterable<T> | AsyncIterable<T>): Promise<IRowPointer[]> {
    const pointers: IRowPointer[] = [];

    let currentPageNumber = (await this.pageManager.getLength()) - 1;
    let currentPage = await this.pageManager.getPage(currentPageNumber);

    for await (const row of rows) {
      const buf = this.rowSerializer(row);

      if (!currentPage?.recordFits(buf.byteLength)) {
        if (currentPage) {
          await this.pageManager.writePage(currentPageNumber, currentPage);
        }
        currentPageNumber = await this.pageManager.newPage();
        currentPage = (await this.pageManager.getPage(currentPageNumber))!;
      }

      const recordNumber = currentPage.addRecord(buf);
      pointers.push(new RowPointer(currentPageNumber, recordNumber));
    }

    if (currentPage) {
      await this.pageManager.writePage(currentPageNumber, currentPage);
    }

    return pointers;
  }

  static fromFile<T>(
    file: Deno.File,
    pageBytes: number,
    deserialize: Deserializer<T>,
    serialize: Serializer<T>
  ) {
    return new this(
      new FileBufferHandler(file, pageBytes),
      deserialize,
      serialize
    );
  }

  // to do: should expose some means of closing the file, maybe have this
  // return an object { table, file }
  static async fromPath<T>(
    path: string,
    pageBytes: number,
    deserialize: Deserializer<T>,
    serialize: Serializer<T>
  ) {
    const file = await Deno.open(path, { read: true, write: true });
    return this.fromFile(file, pageBytes, deserialize, serialize);
  }
}

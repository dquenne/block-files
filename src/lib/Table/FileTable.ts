import { ITable, IRowPointer } from "./ITable.ts";
import { IBufferHandler } from "../BufferHandler/IBufferHandler.ts";
import { PageManager } from "../PageManager.ts";
import { FileBufferHandler } from "../BufferHandler/FileBufferHandler.ts";

type Serializer<T> = (row: T) => Uint8Array;
type Deserializer<T> = (buf: Uint8Array) => T;

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

  async addRow(row: T): Promise<IRowPointer> {
    const buf = this.rowSerializer(row);

    const finalPageIndex = (await this.pageManager.getLength()) - 1;
    const finalPage =
      finalPageIndex >= 0
        ? await this.pageManager.getPage(finalPageIndex)
        : undefined;

    if (finalPage && finalPage.recordFits(buf.byteLength)) {
      const recordNumber = finalPage.addRecord(buf.buffer);
      await this.pageManager.writePage(finalPageIndex, finalPage);
      return { pageNumber: finalPageIndex, recordNumber };
    } else {
      console.log(
        `page ${finalPageIndex} is full, ${finalPage?.numRecords} stored`
      );
      const newPageIndex = await this.pageManager.newPage();
      const newPage = (await this.pageManager.getPage(newPageIndex))!;
      const recordNumber = newPage.addRecord(buf.buffer);
      await this.pageManager.writePage(newPageIndex, newPage);
      return { pageNumber: newPageIndex, recordNumber };
    }
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

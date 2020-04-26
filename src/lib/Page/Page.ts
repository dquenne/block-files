import { PageHeader } from "../PageHeader/index.ts";
import { IPage } from "./IPage.ts";
import {
  RecordPointerCollection,
  IRecordPointerCollection,
} from "../RecordPointerCollection/index.ts";

export class Page implements IPage {
  constructor(readonly buffer: Uint8Array) {}

  get numRecords() {
    return this.readRecordPointerCollection().pointers.length;
  }

  get byteLength() {
    return this.readHeader().pageByteLength;
  }

  get header() {
    return this.readHeader();
  }

  readRecords(start = 0, end = this.numRecords) {
    let i = start;
    const getRecordFunc = () => {
      return this.getRecord(i)!;
    };
    return {
      [Symbol.iterator]: function* () {
        while (i < end) {
          yield getRecordFunc();
          i++;
        }
      },
    };
  }

  recordFits(recordLength: number): boolean {
    const newRecordPointerCollection = this.readRecordPointerCollection();
    const newPointer = this.readRecordPointerCollection().getNextPointer(
      recordLength,
      newRecordPointerCollection.freeSpaceBeginPointer
    );
    newRecordPointerCollection.add(newPointer);
    const newHeaderEndOffset =
      PageHeader.BYTE_LENGTH + newRecordPointerCollection.byteLength;

    return newPointer.offset > newHeaderEndOffset;
  }

  /**
   * @param input ArrayBuffer to write to the page
   * @returns the index of the new record
   * @throws {RangeError} if the new ArrayBuffer does not fit
   *
   * Note: also updates PageHeader & RecordPointerCollection in buffer to
   * record new record's pointer and update region bounds
   */
  addRecord(input: ArrayBuffer): number {
    // validate it fits
    if (!this.recordFits(input.byteLength)) {
      throw new RangeError(
        `No room in page for new record of ${input.byteLength} bytes`
      );
    }

    // setup new record & header
    const newPointerCollection = this.readRecordPointerCollection();
    const newPointer = this.readRecordPointerCollection().getNextPointer(
      input.byteLength,
      newPointerCollection.freeSpaceBeginPointer
    );
    const newIndex = newPointerCollection.add(newPointer);

    newPointerCollection.freeSpaceBeginPointer = newPointer.offset;

    // write
    this.writeRecord(input, newPointer.offset);
    this.writeRecordPointerCollection(newPointerCollection);
    return newIndex;
  }

  getRecord(recordIndex: number) {
    const pointer = this.readRecordPointerCollection().get(recordIndex);
    if (!pointer) {
      return undefined;
    }
    return this.buffer.slice(
      pointer.offset,
      pointer.offset + pointer.byteLength
    );
  }

  private writeRecord(input: ArrayBuffer, offset: number) {
    this.buffer.set(new Uint8Array(input), offset);
  }

  readRecordPointerCollection() {
    return RecordPointerCollection.deserialize(
      this.buffer.slice(...this.recordPointersSpan).buffer
    );
  }

  /**
   * Note: also updates header buffer to record byte length of the new pointer
   * collection
   */
  writeRecordPointerCollection(collection: IRecordPointerCollection) {
    const buffer = collection.serialize();
    const newHeader = this.readHeader();
    newHeader.recordPointersByteLength = buffer.byteLength;

    this.writeHeader(newHeader);
    this.buffer.set(new Uint8Array(buffer), PageHeader.BYTE_LENGTH);
  }

  get recordPointersSpan() {
    return [
      PageHeader.BYTE_LENGTH,
      PageHeader.BYTE_LENGTH + this.readHeader().recordPointersByteLength,
    ];
  }

  writeHeader(input: PageHeader) {
    this.buffer.set(new Uint8Array(input.serialize()));
  }

  readHeader() {
    return PageHeader.deserialize(
      this.buffer.slice(0, PageHeader.BYTE_LENGTH).buffer
    );
  }

  /* static constructor methods */

  static create(pageBytes: number) {
    const page = new Page(new Uint8Array(pageBytes));
    const header = new PageHeader(pageBytes, 0);
    const pointerCollection = new RecordPointerCollection(
      [],
      pageBytes,
      pageBytes
    );
    page.writeHeader(header);
    page.writeRecordPointerCollection(pointerCollection);
    return page;
  }

  static fromBuffer(buffer: Uint8Array) {
    return new Page(buffer);
  }
}

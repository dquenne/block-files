import { toUint16, toUint8 } from "./buffer/convert.ts";
import { PageHeader } from "./gen-ts/PageHeader.ts";

/**
 * Number of bytes allocated to specify how many bytes the header spans
 */
const HEADER_LENGTH_FLAG_BYTES = 2;

export class Page {
  constructor(readonly buffer: Uint8Array) {}

  get numRecords() {
    return [...PageHeader.deserialize(this.headerBuffer).rowByteOffsets].length;
  }

  get length() {
    return PageHeader.deserialize(this.headerBuffer).pageBytes;
  }

  get headerLength() {
    return toUint16(this.buffer.slice(0, HEADER_LENGTH_FLAG_BYTES))[0];
  }

  set headerLength(length: number) {
    this.buffer.set(toUint8(new Uint16Array([length])));
  }

  recordFits(recordLength: number): boolean {
    const newOffset = this.getNewRecordOffset(recordLength);
    const newHeader = this.header;
    newHeader.rowByteOffsets = [...this.header.rowByteOffsets, newOffset];
    return newOffset > this.getHeaderEndIndex(newHeader);
  }

  addRecord(input: ArrayBuffer): number {
    // setup new record & header
    const newHeader = this.header;
    const newOffset = this.getNewRecordOffset(input.byteLength);
    newHeader.rowByteOffsets = [...this.header.rowByteOffsets, newOffset];

    // validate it fits
    if (!this.recordFits(input.byteLength)) {
      throw new Error(
        `No room in page for new record of ${input.byteLength} bytes`
      );
    }

    // write
    this.writeRecord(input, newOffset);
    this.header = newHeader;
    return newOffset;
  }

  getRecordBounds(recordIndex: number) {
    const offsets = [...this.header.rowByteOffsets];
    const start = offsets[recordIndex];
    const end = recordIndex > 0 ? offsets[recordIndex - 1] : this.length;
    return [start, end];
  }

  getRecord(recordIndex: number) {
    if (recordIndex < 0 || recordIndex >= this.numRecords) {
      return undefined;
    }
    return this.buffer.slice(...this.getRecordBounds(recordIndex));
  }

  private getNewRecordOffset(inputLength: number) {
    const rowByteOffsetsArray = [...this.header.rowByteOffsets];
    const lastOffset = // a little smelly here
      rowByteOffsetsArray[rowByteOffsetsArray.length - 1] || this.length;

    return lastOffset - inputLength;
  }

  private writeRecord(input: ArrayBuffer, offset: number) {
    this.buffer.set(new Uint8Array(input), offset);
  }

  getHeaderEndIndex(header?: PageHeader) {
    if (!header) {
      return this.headerLength + HEADER_LENGTH_FLAG_BYTES;
    } else {
      return header.serialize().byteLength + HEADER_LENGTH_FLAG_BYTES;
    }
  }

  set header(input: PageHeader) {
    this.headerBuffer = input.serialize();
  }

  get header() {
    return PageHeader.deserialize(this.headerBuffer);
  }

  private set headerBuffer(input: ArrayBuffer) {
    this.headerLength = input.byteLength;
    this.buffer.set(new Uint8Array(input), HEADER_LENGTH_FLAG_BYTES);
  }

  private get headerBuffer() {
    this.headerLength;
    return this.buffer.slice(
      HEADER_LENGTH_FLAG_BYTES,
      HEADER_LENGTH_FLAG_BYTES + this.headerLength
    ).buffer;
  }

  /* static constructor methods */

  static create(schemaName: string, pageBytes: number) {
    const page = new Page(new Uint8Array(pageBytes));
    const headerObj = PageHeader.createEmpty();
    headerObj.schemaName = schemaName;
    headerObj.pageBytes = pageBytes;
    headerObj.rowByteOffsets = [];
    page.header = headerObj;
    return page;
  }

  static fromBuffer(buffer: Uint8Array) {
    return new Page(buffer);
  }
}

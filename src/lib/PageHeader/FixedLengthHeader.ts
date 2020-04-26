import { validateUint16 } from "../util.ts";
import { IPageHeader, IPageHeaderConstructor } from "./IPageHeader.ts";

export class FixedLengthHeader implements IPageHeader {
  static BYTE_LENGTH = 8;

  constructor(
    public pageByteLength: number,
    public recordPointersByteLength: number = 0
  ) {}
  // public freeSpaceBeginPointer: number = pageByteLength,
  // public freeSpaceEndPointer: number = pageByteLength

  serialize(): ArrayBuffer {
    [
      this.pageByteLength,
      this.recordPointersByteLength,
      // this.freeSpaceBeginPointer,
      // this.freeSpaceEndPointer,
    ].forEach(validateUint16);

    return new Uint16Array([
      this.pageByteLength,
      this.recordPointersByteLength,
      // this.freeSpaceBeginPointer,
      // this.freeSpaceEndPointer,
    ]).buffer;
  }

  static deserialize(buffer: ArrayBuffer): FixedLengthHeader {
    if (buffer.byteLength !== FixedLengthHeader.BYTE_LENGTH) {
      throw new RangeError(
        `FixedLengthHeader buffer byte length should be ${FixedLengthHeader.BYTE_LENGTH}`
      );
    }
    const [
      pageByteLength,
      recordPointersByteLength,
      // freeSpaceBeginPointer,
      // freeSpaceEndPointer,
    ] = new Uint16Array(buffer);

    return new this(
      pageByteLength,
      recordPointersByteLength
      // freeSpaceBeginPointer,
      // freeSpaceEndPointer
    );
  }
}

// assert types match
const headerClass: IPageHeaderConstructor = FixedLengthHeader;

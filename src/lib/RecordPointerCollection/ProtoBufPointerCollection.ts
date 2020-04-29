import {
  IRecordPointerCollection,
  IRecordPointer,
  IRecordPointerCollectionConstructor,
} from "./IRecordPointerCollection.ts";
import { ProtoBufGenerated } from "../gen-ts/RecordPointers.ts";
import { fromObject, floorBy } from "../util.ts";
import { RecordPointer } from "./RecordPointer.ts";

// to keep records chunk aligned for caching
const CHUNK_ALIGN_BYTES = 8;

export class ProtoBufPointerCollection implements IRecordPointerCollection {
  constructor(
    public pointers: IRecordPointer[],
    public freeSpaceBeginPointer: number,
    public freeSpaceEndPointer: number
  ) {}

  get byteLength() {
    return this.serialize().byteLength;
  }

  add(pointer: IRecordPointer) {
    const newLength = this.pointers.push(pointer);
    this.freeSpaceBeginPointer = Math.min(
      pointer.offset,
      this.freeSpaceBeginPointer
    );
    return newLength - 1;
  }

  get(index: number): IRecordPointer | undefined {
    return this.pointers[index];
  }

  update(index: number, pointer: IRecordPointer) {
    if (index >= this.pointers.length) {
      throw new RangeError(
        "can only use update() for an existing record pointer"
      );
    }
    this.pointers[index] = pointer;
  }

  getNextPointer(
    newRecordByteLength: number,
    prevBeginOffset: number
  ): IRecordPointer {
    const offset = floorBy(
      prevBeginOffset - newRecordByteLength,
      CHUNK_ALIGN_BYTES
    );

    return new RecordPointer(offset, newRecordByteLength);
  }

  serialize() {
    return this.getProtoBufInstance().serialize();
  }

  private getProtoBufInstance() {
    return fromObject(ProtoBufGenerated.RecordPointers, {
      freeSpaceBeginPointer: this.freeSpaceBeginPointer,
      freeSpaceEndPointer: this.freeSpaceEndPointer,
      rowByteOffsets: this.pointers.map((p) => {
        const pb = ProtoBufGenerated.RecordPointer.createEmpty();
        pb.byteLength = p.byteLength;
        pb.offset = p.offset;
        return pb;
      }),
    });
  }

  static deserialize(buffer: ArrayBuffer) {
    const protoBufInstance = ProtoBufGenerated.RecordPointers.deserialize(
      buffer
    );
    return new this(
      [...protoBufInstance.rowByteOffsets],
      protoBufInstance.freeSpaceBeginPointer,
      protoBufInstance.freeSpaceEndPointer
    );
  }
}

// assert class matches static constructor interface
const exportedClass: IRecordPointerCollectionConstructor = ProtoBufPointerCollection;

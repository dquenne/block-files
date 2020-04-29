import {
  IRecordPointer,
  IRecordPointerCollection,
  IRecordPointerCollectionConstructor,
} from "./IRecordPointerCollection.ts";
import { floorBy } from "../util.ts";

// to keep records chunk aligned for caching
const CHUNK_ALIGN_BYTES = 8;

const FIXED_VALUES_BYTE_LENGTH = 4;

const RECORD_POINTER_BYTE_LENGTH = 4;

export class SimplePointerCollection implements IRecordPointerCollection {
  constructor(private buffer: ArrayBuffer) {}

  *getPointers(): Generator<IRecordPointer> {
    const length = this.length;
    for (let i = 0; i < length; i++) {
      yield this.get(i)!;
    }
  }

  // probably want to deprecate this
  get pointers() {
    const length = this.length;
    const out = [];
    for (let i = 0; i < length; i++) {
      out[i] = this.get(i)!;
    }
    return out;
  }

  get freeSpaceBeginPointer(): number {
    return new Uint16Array(this.buffer)[0];
  }

  set freeSpaceBeginPointer(val: number) {
    new Uint16Array(this.buffer)[0] = val;
  }

  get freeSpaceEndPointer(): number {
    return new Uint16Array(this.buffer)[1];
  }

  set freeSpaceEndPointer(val: number) {
    new Uint16Array(this.buffer)[1] = val;
  }

  get byteLength() {
    return this.buffer.byteLength;
  }

  get pointersByteLength() {
    return this.buffer.byteLength - FIXED_VALUES_BYTE_LENGTH;
  }

  get length() {
    return this.pointersByteLength / RECORD_POINTER_BYTE_LENGTH;
  }

  add(pointer: IRecordPointer) {
    const newBuffer = new Uint16Array(
      (this.buffer.byteLength + RECORD_POINTER_BYTE_LENGTH) / 2
    );
    newBuffer.set(new Uint16Array(this.buffer));
    newBuffer.set(
      new Uint16Array([pointer.offset, pointer.byteLength]),
      this.buffer.byteLength / 2
    );
    this.buffer = newBuffer.buffer;

    this.freeSpaceBeginPointer = Math.min(
      pointer.offset,
      this.freeSpaceBeginPointer
    );

    return this.length - 1;
  }

  get(index: number): IRecordPointer | undefined {
    if (index > this.length) {
      return undefined;
    }
    const [offset, byteLength] = new Uint16Array(
      this.buffer,
      FIXED_VALUES_BYTE_LENGTH
    ).slice(index * 2, index * 2 + 2);
    return { offset, byteLength };
  }

  update(index: number, pointer: IRecordPointer) {
    new Uint16Array(this.buffer).set(
      [pointer.offset, pointer.byteLength],
      (FIXED_VALUES_BYTE_LENGTH + index * RECORD_POINTER_BYTE_LENGTH) / 2
    );
  }

  getNextPointer(byteLength: number, prevBeginOffset: number): IRecordPointer {
    const offset = floorBy(prevBeginOffset - byteLength, CHUNK_ALIGN_BYTES);

    return { offset, byteLength };
  }

  serialize() {
    return this.buffer;
  }

  static deserialize(buffer: ArrayBuffer) {
    // maybe should copy buffer first?
    return new this(buffer);
  }

  static create(freeSpaceBeginOffset: number, freeSpaceEndOffset: number) {
    return new this(
      new Uint16Array([freeSpaceBeginOffset, freeSpaceEndOffset]).buffer
    );
  }
}

// assert class matches static constructor interface
const exportedClass: IRecordPointerCollectionConstructor = SimplePointerCollection;

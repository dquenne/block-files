export interface IRecordPointer {
  offset: number;
  byteLength: number;
}

export interface IRecordPointerCollection {
  readonly byteLength: number;
  readonly freeSpaceBeginPointer: number;
  readonly freeSpaceEndPointer: number;
  readonly pointers: IRecordPointer[];

  add(pointer: IRecordPointer): number;
  get(index: number): IRecordPointer | undefined;
  update(index: number, pointer: IRecordPointer): void;
  getNextPointer(
    newRecordByteLength: number,
    prevBeginOffset: number
  ): IRecordPointer;

  serialize(): ArrayBuffer;
}

export interface IRecordPointerCollectionConstructor {
  new (...args: any): IRecordPointerCollection;
  deserialize(buffer: ArrayBuffer): IRecordPointerCollection;
}

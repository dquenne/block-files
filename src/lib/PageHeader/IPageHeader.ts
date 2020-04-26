export interface IPageHeader {
  pageByteLength: number;
  recordPointersByteLength: number;
  // freeSpaceBeginPointer: number;
  // freeSpaceEndPointer: number;
  serialize(): ArrayBuffer;
}

export interface IPageHeaderConstructor {
  BYTE_LENGTH: number;
  new (...args: any): IPageHeader;
  deserialize(buffer: ArrayBuffer): IPageHeader;
}

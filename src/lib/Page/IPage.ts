import { IPageHeader } from "../PageHeader/IPageHeader.ts";
import { IRecordPointerCollection } from "../RecordPointerCollection/IRecordPointerCollection.ts";

export interface IPage {
  readonly numRecords: number;
  readonly byteLength: number;
  readonly header: IPageHeader;

  getRecord(recordIndex: number): ArrayBuffer | undefined;
  addRecord(input: ArrayBuffer): number;
  readRecords(start?: number, end?: number): Iterable<ArrayBuffer>;

  // readHeader(): IPageHeader;
  // writeHeader(input: IPageHeader): void;

  // readRecordPointerCollection(): IRecordPointerCollection;
  // writeRecordPointerCollection(input: IRecordPointerCollection): void;
}

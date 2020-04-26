import { IRecordPointer } from "./IRecordPointerCollection.ts";
import { ProtoBufGenerated } from "../gen-ts/RecordPointers.ts";
import { fromObject } from "../util.ts";

export class RecordPointer implements IRecordPointer {
  constructor(public offset: number, public byteLength: number) {}

  serialize(): ArrayBuffer {
    return fromObject(ProtoBufGenerated.RecordPointer, this).serialize();
  }
}

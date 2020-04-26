import { IRowPointer } from "./IRowPointer.ts";

export class RowPointer implements IRowPointer {
  constructor(public pageNumber: number, public recordNumber: number) {}
}

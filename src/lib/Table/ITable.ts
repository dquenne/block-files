import { IRowPointer } from "../RowPointer/IRowPointer.ts";

export interface ITable<RowType> {
  readAllRows(
    beginPage?: number,
    endPage?: number
  ): AsyncGenerator<RowType, void>;
  readPage(pageNumber: number): AsyncIterator<RowType, void>;
  getRow(rowPointer: IRowPointer): Promise<RowType | undefined>;
  addRow(row: RowType): Promise<IRowPointer>;
}

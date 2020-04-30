import { IRowPointer } from "../RowPointer/IRowPointer.ts";

export interface ITable<Row> {
  readAllRows(beginPage?: number, endPage?: number): AsyncGenerator<Row, void>;
  readPage(pageNumber: number): AsyncIterator<Row, void>;
  getRow(rowPointer: IRowPointer): Promise<Row | undefined>;
  addRow(row: Row): Promise<IRowPointer>;
  addRows(row: Iterable<Row> | AsyncIterable<Row>): Promise<IRowPointer[]>;
}

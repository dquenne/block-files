export interface IRowPointer {
  pageNumber: number;
  recordNumber: number;
}

export interface ITable<RowType> {
  readAllRows(
    beginPage?: number,
    endPage?: number
  ): AsyncGenerator<RowType, void>;
  readPage(pageNumber: number): AsyncIterator<RowType, void>;
  getRow(rowPointer: IRowPointer): Promise<RowType | undefined>;
  addRow(row: RowType): Promise<IRowPointer>;
}

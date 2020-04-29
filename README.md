# Block-aligned File Read/Writer

For writing and reading block-aligned files. Each page has a header with an
optional schema name and pointers to each record in the page.

## Format

The first 8 bytes of each page are the fixed-length header. The rest of the
header is information about the location of each record in the page, stored as
a list of Uint16 pairs, with each pair specifying the byte offset of the record
and its byte length (in that order).

The rest of the page is arbitrary 'records' of bytes, filled in backwards from
the end of the page. Each row is accessed by reading its offset within the file
and its byte length, specified in the header.

This page arrangement is heavily inspired by [PostgreSQL's Database Page Layout](https://www.postgresql.org/docs/12/storage-page-layout.html).

## Usage

Note: this repository uses [Deno](https://deno.land/) as a runtime environment
for TypeScript.

```ts
// table-demo.ts

import { FileTable } from "https://raw.githubusercontent.com/dquenne/block-files/master/src/index.ts";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

await Deno.writeFile("./tmp-table", new Uint8Array()); // create or overwrite

const table = await FileTable.fromPath(
  "./tmp-table",
  4096,
  (row) => decoder.decode(row),
  (input) => encoder.encode(input)
);

const pointers = await table.addRows([
  "row 0",
  "another row",
  "row 2",
  "marginally longer row",
]);
await table.addRow("and one more");

const row1 = await table.getRow(pointers[1]);

console.log(row1, "- stored at", pointers[1]); // "another row - stored at RowPointer { pageNumber: 0, recordNumber: 1 }"
```

To run the above code:

```
deno --allow-read --allow-write ./table-demo.ts
```

## API

### class `FileTable<RowType>`

Implements [`ITable<RowType>`](./src/lib/Table/ITable.ts)

#### (static) `FileTable.fromPath()`

```ts
  static async fromPath<T>(
    path: string,
    pageBytes: number,
    deserialize: Deserializer<T>,
    serialize: Serializer<T>
  )
```

Takes in a path to an existing file, opens the file, and returns a new
`FileTable` instance with that file as its data store. Must supply page size in
bytes, as well as functions to serialize and deserialize rows.

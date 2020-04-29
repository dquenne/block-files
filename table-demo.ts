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

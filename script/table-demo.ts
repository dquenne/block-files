import { FileTable } from "../src/lib/Table/FileTable.ts";
import { FileBufferHandler } from "../src/lib/BufferHandler/FileBufferHandler.ts";
import { ITable } from "../src/lib/Table/ITable.ts";
import { IRowPointer } from "../src/lib/RowPointer/IRowPointer.ts";

const FILENAME = "./tmp/file4";
const USE_STATIC_FILE_CONSTRUCTOR = true;

await Deno.open(FILENAME).catch(async () => {
  console.warn("file did not exist, writing new file");
  await Deno.writeFile(FILENAME, new Uint8Array());
});

const encode = (a: string) => new TextEncoder().encode(a);
const decode = (a: ArrayBuffer) => new TextDecoder().decode(a);
let t: ITable<string>;

if (USE_STATIC_FILE_CONSTRUCTOR) {
  t = await FileTable.fromPath(FILENAME, 4096, decode, encode);
} else {
  console.log("opening file", FILENAME);
  const file = await Deno.open(FILENAME, { read: true, write: true });

  console.log("initializing buffer handler");
  const bufferHandler = new FileBufferHandler(file, 4096);

  console.log("initializing table manager");
  t = new FileTable(bufferHandler, decode, encode);
}

let recordToLookFor: IRowPointer;
for (let i = 0; i < 100; i++) {
  await t.addRow(`Record no. ${i}\n`);
  if (i === 20) {
    recordToLookFor = await t.addRow("Look for me!");
  }
}

const rows = [];
for await (let row of t.readAllRows()) {
  rows.push(row);
}

console.log(rows.length, "rows");
console.log(new Set(rows).size, "unique rows");

console.log(
  "found it?",
  recordToLookFor!,
  `"${await t.getRow(recordToLookFor!)}"`
);

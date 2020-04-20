import { PageHeader } from "./lib/gen-ts/PageHeader.ts";
import { fromObject } from "./lib/util.ts";

import { PageManager } from "./lib/PageManager.ts";

const PAGE_BYTES = 4096;

const fr = await PageManager.fromPath("./tmp/file1", PAGE_BYTES, 2);

const page = (await fr.getPage(0))!;
console.log(page.buffer);
const header = fromObject(PageHeader, {
  schemaName: "foobar",
  pageBytes: PAGE_BYTES,
  rowByteOffsets: [PAGE_BYTES],
});
page.header = header;
console.log(header.serialize().byteLength);
console.log(page.headerLength);

let pageNumber = 0;
let currentPage = await fr.getPage(pageNumber);
let newRecord;
for (let i = 0; i < 700; i++) {
  newRecord = new Uint8Array([i, i, i, i, i, i]);
  if (!currentPage) {
    break;
  }
  if (!currentPage.recordFits(newRecord.byteLength)) {
    console.log(pageNumber, currentPage);
    await fr.writePage(pageNumber, currentPage);
    pageNumber++;
    currentPage = await fr.getPage(pageNumber);
    console.log(pageNumber, currentPage);
  }
  if (!currentPage) {
    break;
  }
  currentPage!.addRecord(newRecord);
}
currentPage && (await fr.writePage(pageNumber, currentPage));

console.log(page.header.toObject());

console.log(page.getRecord(0));
console.log(page.getRecord(1));
console.log(page.getRecord(3));
console.log(page.getRecord(1));

console.log(page.getRecord(60));
console.log(page.headerLength);

// write page
// await fr.writePage(0, page);
// await fr.writePage(3, page);
// fr.f.seek(0, Deno.SeekMode.SEEK_START);
// fr.f.write(page.buffer);

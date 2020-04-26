import { PageManager } from "../src/lib/PageManager.ts";
import { Page } from "../src/lib/Page/index.ts";

const fr = await PageManager.fromPath("./tmp/file1", 4096, -1);

let page: Page;
for (let i = 0; i < 3; i++) {
  page = (await fr.getPage(i)) || (await fr.newPage());

  page.addRecord(new Uint8Array([1, 2, 3, i]));
  console.log(page.getRecord(0));
  page.addRecord(new Uint8Array([41, 42, 43]));
  page.addRecord(new Uint8Array([i, i, i, i, i, i]));
  console.log("header length:", page.readHeader().serialize().byteLength);
  console.log("header:", page.readHeader());
  console.log("number of rows:", page.numRecords);
  console.log("first record:", page.getRecord(0));
  console.log("last record:", page.getRecord(page.numRecords - 1));

  console.log("all records:");
  console.log([...page.readRecords()]);
}

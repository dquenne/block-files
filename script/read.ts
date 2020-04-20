import { PageManager } from "../src/lib/PageManager.ts";

const fr = await PageManager.fromPath("./tmp/file1", 4096, 2);

let page;
for (let i = 0; i < 5; i++) {
  page = await fr.getPage(i);
  if (!page) {
    console.log(`page ${i} does not exist`);
    break;
  }
  console.log("header length:", page.headerLength);
  console.log("header:", page.header.toObject());
  console.log("number of rows:", page.numRecords);
  console.log("first record:", page.getRecord(0));
  console.log("last record:", page.getRecord(page.numRecords - 1));
}

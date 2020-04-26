import { PageManager } from "../src/lib/PageManager.ts";
import { Page } from "../src/lib/Page/index.ts";

const fr = await PageManager.fromPath("./tmp/file1", 4096, 0);

let page: Page;
for (let i = 0; i < 3; i++) {
  page = (await fr.getPage(i)) || (await fr.newPage());

  page.addRecord(new Uint8Array([1, 2, 3, i]));
  console.log(page.getRecord(0));
  page.addRecord(new Uint8Array([41, 42, 43]));
  page.addRecord(new Uint8Array([i, i, i, i, i, i]));
  console.log("header length:", page.readHeader().serialize().byteLength);
  console.log("header:", page.readHeader());

  console.log("all records:");
  console.log([...page.readRecords()]);
  await fr.writePage(i, page);
}

console.log("\n\nnow read back from stored file");
const fr2 = await PageManager.fromPath("./tmp/file1", 4096, 3);
console.log(fr2.length, "pages");
let i = 0;
const it = fr2.readPages();
while (true) {
  i++;
  const next = await it.next();
  if (next.done) {
    break;
  }
  console.log("page", i);
  console.log([...next.value.readRecords()]);
}

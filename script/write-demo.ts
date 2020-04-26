import { PageManager } from "../src/lib/PageManager.ts";
import { Page } from "../src/lib/Page/index.ts";

const FILENAME = "./tmp/file1";

const fr = await PageManager.fromPath(FILENAME, 4096);

let page: Page;
for (let i = 0; i < 3; i++) {
  page = (await fr.getPage(i)) || (await fr.newPage());

  const whichWrite = page.numRecords / 4;

  page.addRecord(
    new Uint8Array(
      new TextEncoder().encode(`these records from the ${whichWrite}th write`)
    )
  );
  page.addRecord(new Uint8Array([40 + i, 40 + i * 2, 40 + i * 4]));
  page.addRecord(new Uint8Array([i, i, i, i, i, i]));
  page.addRecord(new TextEncoder().encode("Example storing string as record"));
  console.log("Created Page", i);
  console.log("Header bytes:", page.readHeader().serialize().byteLength);
  console.log("Header:", page.readHeader());
  console.log("Number of records:", page.numRecords);

  console.log("all records:");
  console.log([...page.readRecords()]);

  console.log("Writing page to disk at", FILENAME);
  await fr.writePage(i, page);
  console.log(""); // newline
}

console.log("\nnow read back from stored file");
const fr2 = await PageManager.fromPath(FILENAME, 4096);
console.log(await fr2.bufferHandler.getLength(), "pages");
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
  console.log("UTF-8 decoded:");
  console.log(
    [...next.value.readRecords()].map((bytes) =>
      new TextDecoder().decode(bytes)
    )
  );
}

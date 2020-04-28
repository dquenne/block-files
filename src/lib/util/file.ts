const inChunksOf = 16384;

export async function chunkedRead(file: Deno.File, buffer: Uint8Array) {
  const bufLength = buffer.byteLength;
  let totalRead = 0;
  for (let chunk = 0; chunk < bufLength / inChunksOf; chunk++) {
    const read = await file.read(
      buffer.subarray(chunk * inChunksOf, (chunk + 1) * inChunksOf),
    );
    if (read === Deno.EOF) {
      break;
    }
    totalRead += read;
  }
  return totalRead || Deno.EOF;
}

function isSymbol<T>(n: T | symbol): n is symbol {
  return typeof n === "symbol";
}

export function isEOF(byteCount: number | symbol): byteCount is symbol {
  return isSymbol(byteCount);
}

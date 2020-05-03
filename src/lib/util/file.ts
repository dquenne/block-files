// to do: validate whether 16384 is machine-dependant or universal
const MAX_IO_BYTES = 16384;
const IO_CHUNK_BYTES = MAX_IO_BYTES;

/**
 * `Deno.File.prototyp.read()` does not support reading more than 16384 bytes.
 * This wrapper around `read()` simulates reading more than 16384 bytes with
 * sequential reads.
 * @param file A `Deno.file` instance
 * @param p A Uint8Array buffer to read to
 */
export async function chunkedRead(file: Deno.File, p: Uint8Array) {
  const bufLength = p.byteLength;
  let totalRead = 0;
  for (let chunk = 0; chunk < bufLength / IO_CHUNK_BYTES; chunk++) {
    const read = await file.read(
      p.subarray(chunk * IO_CHUNK_BYTES, (chunk + 1) * IO_CHUNK_BYTES)
    );
    if (read === Deno.EOF) {
      break;
    }
    totalRead += read;
  }
  return totalRead || Deno.EOF;
}

/**
 * `Deno.File.prototyp.write()` does not support writing more than 16384 bytes.
 * This wrapper around `write()` simulates writing more than 16384 bytes with
 * sequential writes.
 * @param file A `Deno.file` instance
 * @param p A Uint8Array buffer to write from
 */
export async function chunkedWrite(file: Deno.File, p: Uint8Array) {
  const bufLength = p.byteLength;
  let totalWritten = 0;
  for (let chunk = 0; chunk < bufLength / IO_CHUNK_BYTES; chunk++) {
    const written = await file.write(
      p.subarray(chunk * IO_CHUNK_BYTES, (chunk + 1) * IO_CHUNK_BYTES)
    );
    totalWritten += written;
  }
  return totalWritten;
}

function isSymbol<T>(n: T | symbol): n is symbol {
  return typeof n === "symbol";
}

export function isEOF(byteCount: number | symbol): byteCount is symbol {
  return isSymbol(byteCount);
}

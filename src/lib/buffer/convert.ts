type IntArrayBuffer = { buffer: ArrayBuffer };

export function toUint32(input: IntArrayBuffer) {
  return new Uint32Array(input.buffer);
}

export function toUint16(input: IntArrayBuffer) {
  return new Uint16Array(input.buffer);
}

export function toUint8(input: IntArrayBuffer) {
  return new Uint8Array(input.buffer);
}

import Kernel from "https://deno.land/x/protobuf/kernel/kernel.js";
import Int64 from "https://deno.land/x/protobuf/int64.js";
export namespace ProtoBufGenerated {
    export class RecordPointer {
        #accessor: Kernel;
        private constructor(kernel: Kernel) {
            this.#accessor = kernel;
        }
        internalGetKernel(): Kernel {
            return this.#accessor;
        }
        get offset(): number {
            return this.#accessor.getInt32WithDefault(1) as number;
        }
        set offset(value: number) {
            this.#accessor.setInt32(1, value);
        }
        get byteLength(): number {
            return this.#accessor.getInt32WithDefault(2) as number;
        }
        set byteLength(value: number) {
            this.#accessor.setInt32(2, value);
        }
        toObject() {
            return {
                offset: this.offset,
                byteLength: this.byteLength
            };
        }
        serialize(): ArrayBuffer {
            return this.#accessor.serialize();
        }
        static instanceCreator(kernel: Kernel): RecordPointer {
            return new RecordPointer(kernel);
        }
        static createEmpty(): RecordPointer {
            return new RecordPointer(Kernel.createEmpty());
        }
        static deserialize(bytes: ArrayBuffer): RecordPointer {
            return new RecordPointer(Kernel.fromArrayBuffer(bytes));
        }
    }
    export class RecordPointers {
        #accessor: Kernel;
        private constructor(kernel: Kernel) {
            this.#accessor = kernel;
        }
        internalGetKernel(): Kernel {
            return this.#accessor;
        }
        get freeSpaceBeginPointer(): number {
            return this.#accessor.getInt32WithDefault(1) as number;
        }
        set freeSpaceBeginPointer(value: number) {
            this.#accessor.setInt32(1, value);
        }
        get freeSpaceEndPointer(): number {
            return this.#accessor.getInt32WithDefault(2) as number;
        }
        set freeSpaceEndPointer(value: number) {
            this.#accessor.setInt32(2, value);
        }
        get rowByteOffsets(): RecordPointer[] {
            return this.#accessor.getRepeatedMessageIterable(3, RecordPointer.instanceCreator) as RecordPointer[];
        }
        set rowByteOffsets(value: RecordPointer[]) {
            this.#accessor.setRepeatedMessageIterable(3, value);
        }
        toObject() {
            return {
                freeSpaceBeginPointer: this.freeSpaceBeginPointer,
                freeSpaceEndPointer: this.freeSpaceEndPointer,
                rowByteOffsets: this.rowByteOffsets.map((item: RecordPointer) => item.toObject())
            };
        }
        serialize(): ArrayBuffer {
            return this.#accessor.serialize();
        }
        static instanceCreator(kernel: Kernel): RecordPointers {
            return new RecordPointers(kernel);
        }
        static createEmpty(): RecordPointers {
            return new RecordPointers(Kernel.createEmpty());
        }
        static deserialize(bytes: ArrayBuffer): RecordPointers {
            return new RecordPointers(Kernel.fromArrayBuffer(bytes));
        }
    }
}

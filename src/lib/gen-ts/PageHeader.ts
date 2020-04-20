import Kernel from "https://deno.land/x/protobuf/kernel/kernel.js";
import Int64 from "https://deno.land/x/protobuf/int64.js";
export class PageHeader {
    #accessor: Kernel;
    private constructor(kernel: Kernel) {
        this.#accessor = kernel;
    }
    internalGetKernel(): Kernel {
        return this.#accessor;
    }
    get schemaName(): string {
        return this.#accessor.getStringWithDefault(1) as string;
    }
    set schemaName(value: string) {
        this.#accessor.setString(1, value);
    }
    get pageBytes(): number {
        return this.#accessor.getInt32WithDefault(2) as number;
    }
    set pageBytes(value: number) {
        this.#accessor.setInt32(2, value);
    }
    get rowByteOffsets(): number[] {
        return this.#accessor.getRepeatedInt32Iterable(3) as number[];
    }
    set rowByteOffsets(value: number[]) {
        this.#accessor.setPackedInt32Iterable(3, value);
    }
    toObject() {
        return {
            schemaName: this.schemaName,
            pageBytes: this.pageBytes,
            rowByteOffsets: this.rowByteOffsets
        };
    }
    serialize(): ArrayBuffer {
        return this.#accessor.serialize();
    }
    static instanceCreator(kernel: Kernel): PageHeader {
        return new PageHeader(kernel);
    }
    static createEmpty(): PageHeader {
        return new PageHeader(Kernel.createEmpty());
    }
    static deserialize(bytes: ArrayBuffer): PageHeader {
        return new PageHeader(Kernel.fromArrayBuffer(bytes));
    }
}

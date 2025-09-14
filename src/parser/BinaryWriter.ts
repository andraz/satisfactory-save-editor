import { TextEncoder } from 'util'

export class BinaryWriter {
  private buffers: Buffer[] = []
  private utf8Encoder = new TextEncoder()

  public writeByte(value: number) {
    const buf = Buffer.alloc(1)
    buf.writeUInt8(value, 0)
    this.buffers.push(buf)
  }

  public writeInt32(value: number) {
    const buf = Buffer.alloc(4)
    buf.writeInt32LE(value, 0)
    this.buffers.push(buf)
  }

  public writeFloat32(value: number) {
    const buf = Buffer.alloc(4)
    buf.writeFloatLE(value, 0)
    this.buffers.push(buf)
  }

  public writeInt64(value: bigint) {
    const buf = Buffer.alloc(8)
    buf.writeBigInt64LE(value, 0)
    this.buffers.push(buf)
  }

  public writeString(value: string) {
    if (value.length === 0) {
      this.writeInt32(0)
      return
    }

    // For simplicity, this baseline only implements UTF-8.
    // TODO: Add UTF-16 support for non-ASCII characters.
    const stringBuffer = this.utf8Encoder.encode(value)
    const nullTerminator = Buffer.alloc(1) // The null byte
    const finalBuffer = Buffer.concat([stringBuffer, nullTerminator])

    this.writeInt32(finalBuffer.length)
    this.buffers.push(finalBuffer)
  }

  public getBuffer(): Buffer {
    return Buffer.concat(this.buffers)
  }
}

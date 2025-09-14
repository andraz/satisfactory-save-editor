import { TextDecoder } from 'util'

export class BinaryReader {
  private offset: number = 0
  private dataView: DataView
  private buffer: Buffer
  private utf8Decoder = new TextDecoder('utf-8')
  private utf16Decoder = new TextDecoder('utf-16le')

  constructor(buffer: Buffer) {
    this.buffer = buffer
    this.dataView = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength,
    )
  }

  public getOffset(): number {
    return this.offset
  }

  public seek(offset: number): void {
    this.offset = offset
  }

  public bytesLeft(): number {
    return this.buffer.length - this.offset
  }

  public isEOF(): boolean {
    return this.offset >= this.buffer.length
  }

  public skip(bytes: number) {
    this.offset += bytes
  }

  public readBytes(count: number): Buffer {
    const slice = this.buffer.slice(this.offset, this.offset + count)
    this.offset += count
    return slice
  }

  public readByte(): number {
    const val = this.dataView.getUint8(this.offset)
    this.offset += 1
    return val
  }

  public readInt8(): number {
    const val = this.dataView.getInt8(this.offset)
    this.offset += 1
    return val
  }

  public readInt32(): number {
    const val = this.dataView.getInt32(this.offset, true)
    this.offset += 4
    return val
  }

  public readUint32(): number {
    const val = this.dataView.getUint32(this.offset, true)
    this.offset += 4
    return val
  }

  public readFloat32(): number {
    const val = this.dataView.getFloat32(this.offset, true)
    this.offset += 4
    return val
  }

  public readFloat64(): number {
    const val = this.dataView.getFloat64(this.offset, true)
    this.offset += 8
    return val
  }

  public readInt64(): bigint {
    const val = this.dataView.getBigInt64(this.offset, true)
    this.offset += 8
    return val
  }

  public readBigUint64(): bigint {
    const val = this.dataView.getBigUint64(this.offset, true)
    this.offset += 8
    return val
  }

  public readString(): string {
    const length = this.readInt32()
    if (length === 0) {
      return ''
    }

    if (length > this.bytesLeft() || length < -this.bytesLeft()) {
      throw new Error(
        `Invalid string length: ${length} at offset ${this.offset - 4}`,
      )
    }

    if (length < 0) {
      const numChars = -length
      const byteLength = numChars * 2
      const slice = this.buffer.slice(this.offset, this.offset + byteLength)
      this.offset += byteLength
      this.skip(2) // UTF-16 Null terminator
      return this.utf16Decoder.decode(slice)
    } else {
      const byteLength = length
      const slice = this.buffer.slice(this.offset, this.offset + byteLength)
      this.offset += length
      return this.utf8Decoder.decode(slice.slice(0, -1)) // UTF-8 Null terminator is part of length
    }
  }

  public readToEnd(): Buffer {
    const slice = this.buffer.slice(this.offset)
    this.offset = this.buffer.length
    return slice
  }
}

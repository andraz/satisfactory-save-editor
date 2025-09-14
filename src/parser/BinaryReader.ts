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

  public isEOF(): boolean {
    return this.offset >= this.buffer.length
  }

  public skip(bytes: number) {
    this.offset += bytes
  }

  public readByte(): number {
    const val = this.dataView.getUint8(this.offset)
    this.offset += 1
    return val
  }

  public readInt32(): number {
    const val = this.dataView.getInt32(this.offset, true)
    this.offset += 4
    return val
  }

  public readFloat32(): number {
    const val = this.dataView.getFloat32(this.offset, true)
    this.offset += 4
    return val
  }

  public readInt64(): bigint {
    const val = this.dataView.getBigInt64(this.offset, true)
    this.offset += 8
    return val
  }

  public readString(): string {
    const length = this.readInt32()
    if (length === 0) return ''

    if (length < 0) {
      // UTF-16
      const numChars = -length
      const byteLength = numChars * 2
      const end = this.offset + byteLength
      const slice = this.buffer.slice(this.offset, end)
      this.offset = end
      this.skip(2) // Null terminator
      return this.utf16Decoder.decode(slice)
    } else {
      // UTF-8
      const byteLength = length
      const end = this.offset + byteLength
      const slice = this.buffer.slice(this.offset, end)
      this.offset = end
      // The null terminator is included in the length for UTF-8
      return this.utf8Decoder.decode(slice.slice(0, -1))
    }
  }

  public readToEnd(): Buffer {
    const slice = this.buffer.slice(this.offset)
    this.offset = this.buffer.length
    return slice
  }
}

import { SaveHeader, SaveData } from './types'
import { BinaryReader } from './BinaryReader'
import { parseHeader } from './HeaderParser'
import { decompressBody, parseBodyOutline } from './BodyParser'

export class SaveParser {
  private reader: BinaryReader
  private header!: SaveHeader

  constructor(buffer: Buffer) {
    this.reader = new BinaryReader(buffer)
  }

  public parse(): SaveData {
    this.header = parseHeader(this.reader)
    const bodyBuffer = decompressBody(this.reader, this.header)
    this.reader = new BinaryReader(bodyBuffer)

    const objects = parseBodyOutline(this.reader, this.header)

    return { header: this.header, objects }
  }
}

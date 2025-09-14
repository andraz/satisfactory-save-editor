import * as pako from 'pako'
import { SaveHeader, SaveObject, SaveData } from './types'
import { BinaryReader } from './BinaryReader'

export class SaveParser {
  private reader: BinaryReader
  private header!: SaveHeader

  constructor(buffer: Buffer) {
    this.reader = new BinaryReader(buffer)
  }

  public parse(): SaveData {
    this.header = this._parseHeader()

    const bodyBuffer = this._decompressBody()
    this.reader = new BinaryReader(bodyBuffer)

    const objects = this._parseBody()

    return { header: this.header, objects }
  }

  private _parseHeader(): SaveHeader {
    // This logic is now more complete based on the SCIM source
    const header: Partial<SaveHeader> = {}

    header.saveHeaderType = this.reader.readInt32()
    header.saveVersion = this.reader.readInt32()
    header.buildVersion = this.reader.readInt32()
    if (header.saveHeaderType >= 14) {
      header.saveName = this.reader.readString()
    }
    header.mapName = this.reader.readString()
    header.mapOptions = this.reader.readString()
    header.sessionName = this.reader.readString()
    header.playDurationSeconds = this.reader.readInt32()
    header.saveDateTime = this.reader.readInt64()
    header.sessionVisibility = this.reader.readByte()

    if (header.saveHeaderType >= 7) {
      header.fEditorObjectVersion = this.reader.readInt32()
    }
    if (header.saveHeaderType >= 8) {
      header.modMetadata = this.reader.readString()
      header.isModdedSave = this.reader.readInt32() === 1
    }
    if (header.saveHeaderType >= 10) {
      header.saveIdentifier = this.reader.readString()
    }
    if (header.saveHeaderType >= 13) {
      header.isPartitionedWorld = this.reader.readInt32() === 1
      this.reader.skip(20) // Skip saveDataHash for now
      header.isCreativeModeEnabled = this.reader.readInt32() === 1
    }

    return header as SaveHeader
  }

  private _decompressBody(): Buffer {
    const compressedBody = this.reader.readToEnd()
    const bodyReader = new BinaryReader(compressedBody)
    const decompressedChunks: Buffer[] = []

    while (!bodyReader.isEOF()) {
      // Read chunk header
      const headerLength = this.header.saveVersion >= 41 ? 49 : 48
      bodyReader.skip(headerLength) // Skipping the header details for now, just need sizes

      // We need to re-read the chunk size from a different offset
      const chunkSizeOffset = this.header.saveVersion >= 41 ? 17 : 16
      const tempReader = new BinaryReader(
        compressedBody.slice(bodyReader.offset - headerLength),
      )
      tempReader.skip(chunkSizeOffset)
      const currentChunkSize = tempReader.readInt32()

      const chunkData = compressedBody.slice(
        bodyReader.offset,
        bodyReader.offset + currentChunkSize,
      )

      try {
        const inflatedChunk = pako.inflate(chunkData)
        decompressedChunks.push(Buffer.from(inflatedChunk))
      } catch (error) {
        console.error('Failed to inflate a chunk', error)
        throw new Error(
          'A data chunk in the save file is corrupted and could not be decompressed.',
        )
      }

      bodyReader.skip(currentChunkSize)
    }

    return Buffer.concat(decompressedChunks)
  }

  private _parseBody(): Record<string, SaveObject> {
    // This is a placeholder for the next step, once decompression is working.
    const objects: Record<string, SaveObject> = {}
    console.log(
      `Successfully decompressed save body. Total size: ${this.reader.readToEnd().length} bytes.`,
    )

    // TODO: Implement the full object and entity parsing loop here.
    // For now, we will return an empty object map.

    return objects
  }
}

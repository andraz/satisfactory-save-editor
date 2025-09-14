import * as pako from 'pako'
import { SaveHeader, SaveObject, SaveData } from './types'
import { BinaryReader } from './BinaryReader'

export class SaveParser {
  private reader: BinaryReader

  constructor(buffer: Buffer) {
    this.reader = new BinaryReader(buffer)
  }

  public parse(): SaveData {
    const header = this._parseHeader()

    // Decompress body and create a new reader for it
    const compressedBody = this.reader.readToEnd() // Simplified for baseline
    const bodyBuffer = Buffer.from(pako.inflate(compressedBody))
    this.reader = new BinaryReader(bodyBuffer)

    const objects = this._parseBody(header)

    return { header, objects }
  }

  private _parseHeader(): SaveHeader {
    // Implementation of header parsing logic from SCIM's Read.js
    // using this.reader.readInt32(), this.reader.readString(), etc.
    const header: Partial<SaveHeader> = {}
    header.saveHeaderType = this.reader.readInt32()
    header.saveVersion = this.reader.readInt32()
    header.buildVersion = this.reader.readInt32()
    // ... and so on
    header.sessionName = this.reader.readString()
    // ...
    return header as SaveHeader
  }

  private _parseBody(header: SaveHeader): Record<string, SaveObject> {
    const totalInflatedLength = this.reader.readInt32()
    const objects: Record<string, SaveObject> = {}

    const numLevels = this.reader.readInt32()

    for (let i = 0; i <= numLevels; i++) {
      const levelName =
        i === numLevels ? `Level ${header.mapName}` : this.reader.readString()
      const levelSaveBinaryLength = this.reader.readInt32()

      // TODO: Implement the full object and entity parsing loop here.
      // This is a highly simplified version for the baseline.
      const numObjects = this.reader.readInt32()
      console.log(`Found ${numObjects} objects in level ${levelName}`)

      // For now, we will just skip the object data to have a working baseline
      this.reader.skip(levelSaveBinaryLength)

      const numEntities = this.reader.readInt32()
      const entityDataLength = this.reader.readInt32()
      console.log(`Found ${numEntities} entities in level ${levelName}`)

      // Skip entity data
      this.reader.skip(entityDataLength)

      const numCollected = this.reader.readInt32()
      // ... skipping collected data parsing for baseline
    }

    return objects
  }
}

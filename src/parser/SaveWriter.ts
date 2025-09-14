import * as pako from 'pako'
import { SaveData, SaveHeader, SaveObject } from './types'
import { BinaryWriter } from './BinaryWriter'

export class SaveWriter {
  private saveData: SaveData

  constructor(saveData: SaveData) {
    this.saveData = saveData
  }

  public write(): Buffer {
    const headerBuffer = this._writeHeader()
    const bodyBuffer = this._writeBody()
    const compressedBody = Buffer.from(pako.deflate(bodyBuffer))

    // TODO: Implement the chunking logic from SCIM's Write.js for full compatibility.
    // For this baseline, we'll write it as a single chunk.
    const chunkHeaderWriter = new BinaryWriter()
    chunkHeaderWriter.writeInt32(this.saveData.header.saveVersion) // Simplified placeholder
    // ... Write full chunk header based on SCIM logic ...

    return Buffer.concat([
      headerBuffer,
      chunkHeaderWriter.getBuffer(),
      compressedBody,
    ])
  }

  private _writeHeader(): Buffer {
    const writer = new BinaryWriter()
    const header = this.saveData.header

    writer.writeInt32(header.saveHeaderType)
    writer.writeInt32(header.saveVersion)
    writer.writeInt32(header.buildVersion)
    // ... and so on for all header properties ...
    writer.writeString(header.sessionName)
    // ...

    return writer.getBuffer()
  }

  private _writeBody(): Buffer {
    const writer = new BinaryWriter()

    // TODO: Implement the full, complex body and entity writing logic here.
    // This is a major task that involves iterating through all objects and properties.
    writer.writeInt32(0) // Placeholder for total inflated length
    writer.writeInt32(1) // Placeholder for num levels
    writer.writeString(`Level ${this.saveData.header.mapName}`) // Placeholder
    writer.writeInt32(0) // Placeholder for level binary length
    writer.writeInt32(Object.keys(this.saveData.objects).length) // Number of objects

    // ... Here you would loop through all objects and call writeObject/writeActor ...

    return writer.getBuffer()
  }
}

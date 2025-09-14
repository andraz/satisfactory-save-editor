import * as pako from 'pako'
import { SaveHeader, SaveObject, SaveData, Transform } from './types'
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
    const header: Partial<SaveHeader> = {}
    header.saveHeaderType = this.reader.readInt32()
    header.saveVersion = this.reader.readInt32()
    header.buildVersion = this.reader.readInt32()
    if (header.saveHeaderType >= 14) {
      header.saveName = this.reader.readString()
    } else {
      header.saveName = ''
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
      this.reader.skip(20)
      header.isCreativeModeEnabled = this.reader.readInt32() === 1
    }
    return header as SaveHeader
  }

  private _decompressBody(): Buffer {
    const compressedBody = this.reader.readToEnd()
    const bodyReader = new BinaryReader(compressedBody)
    const decompressedChunks: Buffer[] = []
    while (!bodyReader.isEOF()) {
      const headerLength = this.header.saveVersion >= 41 ? 49 : 48
      const chunkHeaderStartOffset = bodyReader.getOffset()
      if (bodyReader.bytesLeft() < headerLength) break
      const chunkHeaderBuffer = bodyReader.readBytes(headerLength)
      const chunkHeaderReader = new BinaryReader(chunkHeaderBuffer)
      const chunkSizeOffset = this.header.saveVersion >= 41 ? 17 : 16
      chunkHeaderReader.skip(chunkSizeOffset)
      const currentChunkSize = chunkHeaderReader.readInt32()
      if (bodyReader.bytesLeft() < currentChunkSize) break
      const chunkData = bodyReader.readBytes(currentChunkSize)
      const inflatedChunk = pako.inflate(chunkData)
      decompressedChunks.push(Buffer.from(inflatedChunk))
    }
    return Buffer.concat(decompressedChunks)
  }

  private _parseBody(): Record<string, SaveObject> {
    this.reader.skip(this.header.saveVersion >= 41 ? 8 : 4)

    if (this.header.saveVersion >= 41) {
      this._skipPartitions()
    }

    const objects: Record<string, SaveObject> = {}
    const numLevels = this.reader.readInt32()

    for (let i = 0; i <= numLevels; i++) {
      const levelName =
        i === numLevels
          ? `Level ${this.header.mapName}`
          : this.reader.readString()

      const levelObjectDataLength = Number(
        this.header.saveVersion >= 41
          ? this.reader.readInt64()
          : this.reader.readInt32(),
      )
      const objectBlockStartOffset = this.reader.getOffset()
      let levelSaveVersion: number | null = null

      if (this.header.saveVersion >= 51) {
        if (levelName !== `Level ${this.header.mapName}`) {
          const tempOffset = this.reader.getOffset()
          this.reader.skip(Number(levelObjectDataLength))
          const entitiesBinaryLength = this.reader.readInt64()
          this.reader.skip(Number(entitiesBinaryLength))
          levelSaveVersion = this.reader.readUint32()
          this.reader.seek(tempOffset) // This now works!
        } else {
          levelSaveVersion = this.header.saveVersion
        }
      }

      const numObjects = this.reader.readInt32()
      console.log(`Parsing ${numObjects} objects in level ${levelName}...`)

      for (let j = 0; j < numObjects; j++) {
        const type = this.reader.readInt32()
        let obj: SaveObject
        if (type === 0) {
          obj = this._readObject(levelSaveVersion)
        } else if (type === 1) {
          obj = this._readActor(levelSaveVersion)
        } else {
          throw new Error(
            `Unknown object type: ${type} at offset ${this.reader.getOffset()}`,
          )
        }
        objects[obj.pathName] = obj
      }

      if (
        this.reader.getOffset() <=
        objectBlockStartOffset + levelObjectDataLength - 4
      ) {
        this._skipCollected(levelName)
      }

      const entityDataLength = Number(
        this.header.saveVersion >= 41
          ? this.reader.readInt64()
          : this.reader.readInt32(),
      )
      this.reader.skip(entityDataLength)

      if (
        this.header.saveVersion >= 51 &&
        levelName !== `Level ${this.header.mapName}`
      ) {
        this.reader.readUint32()
      }

      this._skipCollected(levelName)
    }

    console.log(`Successfully parsed ${Object.keys(objects).length} objects.`)
    return objects
  }

  private _skipPartitions() {
    const partitionCount = this.reader.readInt32()
    this.reader.readString()
    this.reader.readUint32()
    this.reader.readUint32()
    this.reader.readInt32()
    this.reader.readString()
    this.reader.readUint32()
    for (let i = 1; i < partitionCount; i++) {
      this.reader.readString()
      this.reader.readUint32()
      this.reader.readUint32()
      const numLevelsInPartition = this.reader.readInt32()
      for (let j = 0; j < numLevelsInPartition; j++) {
        this.reader.readString()
        this.reader.readUint32()
      }
    }
  }

  private _skipCollected(levelName: string) {
    const numCollected = this.reader.readInt32()
    if (numCollected > 0) {
      if (
        this.header.saveVersion >= 46 &&
        levelName === `Level ${this.header.mapName}`
      ) {
        this.reader.readString()
        const realNumCollected = this.reader.readInt32()
        for (let k = 0; k < realNumCollected; k++) {
          this._readObjectProperty()
        }
      } else {
        for (let k = 0; k < numCollected; k++) {
          this._readObjectProperty()
        }
      }
    }
  }

  private _readObject(levelSaveVersion: number | null): SaveObject {
    const className = this.reader.readString()
    const { pathName } = this._readObjectProperty()

    let objectFlags: number | undefined
    if (
      this.header.saveVersion >= 51 &&
      levelSaveVersion &&
      levelSaveVersion >= 51
    ) {
      objectFlags = this.reader.readUint32()
    }

    const outerPathName = this.reader.readString()
    return {
      type: 0,
      className,
      pathName,
      outerPathName,
      objectFlags,
      properties: [],
      children: [],
    }
  }

  private _readActor(levelSaveVersion: number | null): SaveObject {
    const className = this.reader.readString()
    const { pathName } = this._readObjectProperty()

    let objectFlags: number | undefined
    if (
      this.header.saveVersion >= 51 &&
      levelSaveVersion &&
      levelSaveVersion >= 51
    ) {
      objectFlags = this.reader.readUint32()
    }

    this.reader.readInt32() // Skip needTransform
    const transform: Transform = {
      rotation: [
        this.reader.readFloat32(),
        this.reader.readFloat32(),
        this.reader.readFloat32(),
        this.reader.readFloat32(),
      ],
      translation: [
        this.reader.readFloat32(),
        this.reader.readFloat32(),
        this.reader.readFloat32(),
      ],
      scale3d: [
        this.reader.readFloat32(),
        this.reader.readFloat32(),
        this.reader.readFloat32(),
      ],
    }
    this.reader.readInt32() // Skip wasPlacedInLevel
    return {
      type: 1,
      className,
      pathName,
      transform,
      objectFlags,
      properties: [],
      children: [],
    }
  }

  private _readObjectProperty(): { levelName: string; pathName: string } {
    const levelName = this.reader.readString()
    const pathName = this.reader.readString()
    return { levelName, pathName }
  }
}

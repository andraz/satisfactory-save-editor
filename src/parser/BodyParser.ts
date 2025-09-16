import * as pako from 'pako'
import { SaveHeader, SaveObject } from './types'
import { BinaryReader } from './BinaryReader'
import { readObject, readActor, readObjectProperty } from './ObjectParser'

export function decompressBody(
  reader: BinaryReader,
  header: SaveHeader,
): Buffer {
  const compressedBody = reader.readToEnd()
  const bodyReader = new BinaryReader(compressedBody)
  const decompressedChunks: Buffer[] = []
  while (!bodyReader.isEOF()) {
    const headerLength = header.saveVersion >= 41 ? 49 : 48
    if (bodyReader.bytesLeft() < headerLength) {
      break
    }
    const chunkHeaderStartOffset = bodyReader.getOffset()
    const chunkHeaderBuffer = bodyReader.readBytes(headerLength)
    const chunkHeaderReader = new BinaryReader(chunkHeaderBuffer)
    const chunkSizeOffset = header.saveVersion >= 41 ? 17 : 16
    chunkHeaderReader.skip(chunkSizeOffset)
    const currentChunkSize = chunkHeaderReader.readInt32()
    if (bodyReader.bytesLeft() < currentChunkSize) {
      break
    }
    const chunkData = bodyReader.readBytes(currentChunkSize)
    const inflatedChunk = pako.inflate(chunkData)
    decompressedChunks.push(Buffer.from(inflatedChunk))
  }
  return Buffer.concat(decompressedChunks)
}

export function parseBodyOutline(
  reader: BinaryReader,
  header: SaveHeader,
): Record<string, SaveObject> {
  reader.skip(header.saveVersion >= 41 ? 8 : 4)

  if (header.saveVersion >= 41) {
    skipPartitions(reader)
  }

  const objects: Record<string, SaveObject> = {}
  const numLevels = reader.readInt32()

  for (let i = 0; i <= numLevels; i++) {
    const levelName =
      i === numLevels ? `Level ${header.mapName}` : reader.readString()

    const levelObjectDataLength = Number(
      header.saveVersion >= 41 ? reader.readInt64() : reader.readInt32(),
    )

    let levelSaveVersion: number | null = null
    if (header.saveVersion >= 51) {
      if (levelName !== `Level ${header.mapName}`) {
        const tempOffset = reader.getOffset()
        reader.skip(Number(levelObjectDataLength))
        const entitiesBinaryLength = reader.readInt64()
        reader.skip(Number(entitiesBinaryLength))
        levelSaveVersion = reader.readUint32()
        reader.seek(tempOffset)
      } else {
        levelSaveVersion = header.saveVersion
      }
    }

    const objectBlockStartOffset = reader.getOffset()

    const numObjects = reader.readInt32()
    for (let j = 0; j < numObjects; j++) {
      const type = reader.readInt32()
      const obj: SaveObject =
        type === 0
          ? readObject(reader, header, levelSaveVersion)
          : readActor(reader, header, levelSaveVersion)
      objects[obj.pathName] = obj
    }

    reader.seek(objectBlockStartOffset + Number(levelObjectDataLength))

    const entityDataLength = Number(
      header.saveVersion >= 41 ? reader.readInt64() : reader.readInt32(),
    )
    reader.skip(Number(entityDataLength))

    if (header.saveVersion >= 51 && levelName !== `Level ${header.mapName}`) {
      if (reader.bytesLeft() >= 4) {
        reader.readUint32()
      }
    }

    skipCollected(reader, header, levelName)
  }
  return objects
}

function skipPartitions(reader: BinaryReader) {
  const partitionCount = reader.readInt32()
  reader.readString()
  reader.readUint32()
  reader.readUint32()
  reader.readInt32()
  reader.readString()
  reader.readUint32()
  for (let i = 1; i < partitionCount; i++) {
    reader.readString()
    reader.readUint32()
    reader.readUint32()
    const numLevelsInPartition = reader.readInt32()
    for (let j = 0; j < numLevelsInPartition; j++) {
      reader.readString()
      reader.readUint32()
    }
  }
}

function skipCollected(
  reader: BinaryReader,
  header: SaveHeader,
  levelName: string,
) {
  if (reader.bytesLeft() < 4) {
    return
  }
  let numCollected = reader.readInt32()
  if (numCollected > 0) {
    if (header.saveVersion >= 46 && levelName === `Level ${header.mapName}`) {
      reader.readString()
      numCollected = reader.readInt32()
    }
    for (let k = 0; k < numCollected; k++) {
      readObjectProperty(reader)
    }
  }
}

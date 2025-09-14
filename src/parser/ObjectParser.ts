import { SaveHeader, SaveObject, Transform } from './types'
import { BinaryReader } from './BinaryReader'

export function readObject(
  reader: BinaryReader,
  header: SaveHeader,
  levelSaveVersion?: number | null,
): SaveObject {
  const className = reader.readString()
  const { pathName } = readObjectProperty(reader)
  let objectFlags: number | undefined
  if (header.saveVersion >= 51 && levelSaveVersion && levelSaveVersion >= 51) {
    objectFlags = reader.readUint32()
  }
  const outerPathName = reader.readString()
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

export function readActor(
  reader: BinaryReader,
  header: SaveHeader,
  levelSaveVersion?: number | null,
): SaveObject {
  const className = reader.readString()
  const { pathName } = readObjectProperty(reader)
  let objectFlags: number | undefined
  if (header.saveVersion >= 51 && levelSaveVersion && levelSaveVersion >= 51) {
    objectFlags = reader.readUint32()
  }
  reader.readInt32() // Skip needTransform
  const transform: Transform = {
    rotation: [
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readFloat32(),
    ],
    translation: [
      reader.readFloat32(),
      reader.readFloat32(),
      reader.readFloat32(),
    ],
    scale3d: [reader.readFloat32(), reader.readFloat32(), reader.readFloat32()],
  }
  reader.readInt32() // Skip wasPlacedInLevel
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

export function readObjectProperty(reader: BinaryReader): {
  levelName: string
  pathName: string
} {
  const levelName = reader.readString()
  const pathName = reader.readString()
  return { levelName, pathName }
}

import { SaveObject, SaveHeader } from './types'
import { BinaryReader } from './BinaryReader'
import { readProperty } from './PropertyParser'
import { readObjectProperty } from './ObjectParser'

export function readEntity(
  reader: BinaryReader,
  header: SaveHeader,
  obj: SaveObject,
) {
  if (header.saveVersion >= 41) {
    const entitySaveVersion = reader.readInt32()
    reader.readInt32()
    if (entitySaveVersion !== header.saveVersion) {
      // TODO: What to do with entitySaveVersion?
    }
  }

  const entityLength = reader.readInt32()
  const entityStartOffset = reader.getOffset()

  if (obj.outerPathName === undefined) {
    obj.entity = readObjectProperty(reader)
    const childCount = reader.readInt32()
    if (childCount > 0) {
      obj.children = []
      for (let i = 0; i < childCount; i++) {
        obj.children.push(readObjectProperty(reader))
      }
    }
  }

  // MODIFICATION: Restored the essential bounded loop for robustness.
  while (reader.getOffset() < entityStartOffset + entityLength) {
    const property = readProperty(reader, obj.className)
    if (property === null) {
      break
    }
    obj.properties.push(property)
  }

  // Failsafe to ensure the reader is correctly positioned after parsing.
  const bytesRead = reader.getOffset() - entityStartOffset
  if (bytesRead < entityLength) {
    reader.skip(entityLength - bytesRead)
  }
}

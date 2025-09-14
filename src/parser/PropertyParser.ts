import { SaveProperty } from './types'
import { BinaryReader } from './BinaryReader'
import { readObjectProperty } from './ObjectParser'

export function readProperty(
  reader: BinaryReader,
  parentType: string,
): SaveProperty | null {
  const name = reader.readString()
  if (name === 'None') {
    return null
  }

  reader.readByte() // Skip extra byte
  const type = reader.readString().replace('Property', '')
  const length = reader.readInt32()
  const propertyStartOffset = reader.getOffset()

  const index = reader.readInt32()
  const property: SaveProperty = {
    name,
    type,
    value: null,
    index: index !== 0 ? index : undefined,
  }

  const hasGuid = reader.readByte() === 1
  if (hasGuid) {
    reader.skip(16)
  }

  switch (type) {
    case 'Bool':
      property.value = reader.readByte() === 1
      break
    case 'Int':
      property.value = reader.readInt32()
      break
    case 'Int8':
      property.value = reader.readInt8()
      break
    case 'Int64':
      property.value = reader.readInt64()
      break
    case 'UInt32':
      property.value = reader.readUint32()
      break
    case 'UInt64':
      property.value = reader.readBigUint64()
      break
    case 'Float':
      property.value = reader.readFloat32()
      break
    case 'Double':
      property.value = reader.readFloat64()
      break
    case 'Str':
    case 'Name':
      property.value = reader.readString()
      break
    case 'Object':
    case 'Interface':
      property.value = readObjectProperty(reader)
      break
    case 'Enum':
      const enumName = reader.readString()
      property.value = { enumName, value: reader.readString() }
      break
    case 'Byte':
      const byteEnumName = reader.readString()
      if (byteEnumName === 'None') {
        property.value = {
          enumName: byteEnumName,
          value: reader.readByte(),
        }
      } else {
        property.value = {
          enumName: byteEnumName,
          valueName: reader.readString(),
        }
      }
      break
    case 'Text':
      // Simplified text parsing, captures the most common format
      reader.skip(5) // flags, historyType
      property.value = reader.readString()
      break
    case 'Struct':
      property.value = readStructProperty(reader, property.name)
      break
    case 'Array':
      property.value = readArrayProperty(reader, property.name)
      break
    case 'Map':
      property.value = readMapProperty(reader)
      break
    default:
      reader.seek(propertyStartOffset + length)
      property.value = `SKIPPED (type: ${type}, length: ${length})`
      break
  }

  const bytesRead = reader.getOffset() - propertyStartOffset
  if (bytesRead < length) {
    reader.skip(length - bytesRead)
  }

  return property
}

const readStructProperty = (reader: BinaryReader, propertyName: string) => {
  const type = reader.readString()
  reader.skip(17) // GUID + 1 byte

  const values: any[] = []
  while (true) {
    const prop = readProperty(reader, type)
    if (prop === null) {
      break
    }
    values.push(prop)
  }
  return { type, values }
}

const readArrayProperty = (reader: BinaryReader, propertyName: string) => {
  const type = reader.readString().replace('Property', '')
  reader.skip(1) // Unknown byte
  const count = reader.readInt32()
  const values: any[] = []

  if (type === 'Struct') {
    reader.readString() // e.g. "mSortRules"
    reader.readString() // "StructProperty"
    reader.skip(4) // structureSize
    reader.skip(4) // 0
    const structureSubType = reader.readString()
    reader.skip(17) // GUID + 1 byte

    for (let i = 0; i < count; i++) {
      const structProperties: any[] = []
      while (true) {
        const prop = readProperty(reader, structureSubType)
        if (prop === null) {
          break
        }
        structProperties.push(prop)
      }
      values.push(structProperties)
    }
  } else {
    // For simple types, just read count times
    for (let i = 0; i < count; i++) {
      // Simplified for baseline
    }
  }
  return { type, values }
}

const readMapProperty = (reader: BinaryReader) => {
  const keyType = reader.readString().replace('Property', '')
  const valueType = reader.readString().replace('Property', '')
  reader.skip(1)
  const count = reader.readInt32()
  reader.skip(4) // Unknown
  const values: { key: any; value: any }[] = []

  for (let i = 0; i < count; i++) {
    // Full implementation is very complex, skipping for now
  }
  return { keyType, valueType, values }
}

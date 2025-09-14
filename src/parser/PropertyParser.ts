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

  const extraByte = reader.readByte()
  if (extraByte !== 0) {
    reader.seek(reader.getOffset() - 1)
  }

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
      reader.skip(5)
      property.value = reader.readString()
      break
    case 'Struct':
      property.value = readStructProperty(reader, length, propertyStartOffset)
      break
    case 'Array':
      property.value = readArrayProperty(reader)
      break
    case 'Map':
      property.value = readMapProperty(reader)
      break
    default:
      break
  }

  reader.seek(propertyStartOffset + length)
  return property
}

const readStructProperty = (
  reader: BinaryReader,
  structLength: number,
  structStartOffset: number,
) => {
  const type = reader.readString()
  reader.skip(17)

  const values: any[] = []
  while (reader.getOffset() < structStartOffset + structLength) {
    const prop = readProperty(reader, type)
    if (prop === null) {
      break
    }
    values.push(prop)
  }
  return { type, values }
}

const readArrayProperty = (reader: BinaryReader) => {
  const type = reader.readString().replace('Property', '')
  reader.skip(1)
  const count = reader.readInt32()
  const values: any[] = []

  if (type === 'Struct') {
    // MODIFICATION: The erroneous reader.readString() was here and has been removed.
    reader.readString() // "StructProperty"
    const structureSize = reader.readInt32()
    reader.skip(4) // 0
    const structureSubType = reader.readString()
    reader.skip(17) // GUID + 1 byte

    for (let i = 0; i < count; i++) {
      const structProperties: any[] = []
      const structStartOffset = reader.getOffset()
      while (reader.getOffset() < structStartOffset + structureSize) {
        const prop = readProperty(reader, structureSubType)
        if (prop === null) {
          break
        }
        structProperties.push(prop)
      }
      values.push(structProperties)

      const bytesReadInStruct = reader.getOffset() - structStartOffset
      if (bytesReadInStruct < structureSize) {
        reader.skip(structureSize - bytesReadInStruct)
      }
    }
  }
  return { type, values }
}

const readMapProperty = (reader: BinaryReader) => {
  const keyType = reader.readString().replace('Property', '')
  const valueType = reader.readString().replace('Property', '')
  reader.skip(1)
  const count = reader.readInt32()
  reader.skip(4)
  const values: { key: any; value: any }[] = []

  for (let i = 0; i < count; i++) {
    // Full implementation is very complex, skipping for now
  }
  return { keyType, valueType, values }
}

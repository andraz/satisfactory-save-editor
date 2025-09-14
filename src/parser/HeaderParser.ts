import { SaveHeader } from './types'
import { BinaryReader } from './BinaryReader'

export function parseHeader(reader: BinaryReader): SaveHeader {
  const header: Partial<SaveHeader> = {}
  header.saveHeaderType = reader.readInt32()
  header.saveVersion = reader.readInt32()
  header.buildVersion = reader.readInt32()
  if (header.saveHeaderType >= 14) {
    header.saveName = reader.readString()
  } else {
    header.saveName = ''
  }
  header.mapName = reader.readString()
  header.mapOptions = reader.readString()
  header.sessionName = reader.readString()
  header.playDurationSeconds = reader.readInt32()
  header.saveDateTime = reader.readInt64()
  header.sessionVisibility = reader.readByte()
  if (header.saveHeaderType >= 7) {
    header.fEditorObjectVersion = reader.readInt32()
  }
  if (header.saveHeaderType >= 8) {
    header.modMetadata = reader.readString()
    header.isModdedSave = reader.readInt32() === 1
  }
  if (header.saveHeaderType >= 10) {
    header.saveIdentifier = reader.readString()
  }
  if (header.saveHeaderType >= 13) {
    header.isPartitionedWorld = reader.readInt32() === 1
    reader.skip(20)
    header.isCreativeModeEnabled = reader.readInt32() === 1
  }
  return header as SaveHeader
}

// All data structures that will be parsed from the save file.

export interface SaveData {
  header: SaveHeader
  objects: Record<string, SaveObject>
}

export interface SaveHeader {
  saveHeaderType: number
  saveVersion: number
  buildVersion: number
  saveName: string
  mapName: string
  mapOptions: string
  sessionName: string
  playDurationSeconds: number
  saveDateTime: bigint
  sessionVisibility: number
  fEditorObjectVersion?: number
  modMetadata?: string
  isModdedSave?: boolean
  saveIdentifier?: string
  isPartitionedWorld?: boolean
  saveDataHash?: string
  isCreativeModeEnabled?: boolean
}

export interface SaveObject {
  type: number // 0 for object, 1 for actor
  className: string
  pathName: string
  outerPathName?: string
  children?: { pathName: string }[]
  properties: SaveProperty[]
  entity?: any // To be defined further
  transform?: Transform
}

export interface SaveActor extends SaveObject {
  transform: Transform
  wasPlacedInLevel: boolean
}

export interface Transform {
  rotation: [number, number, number, number]
  translation: [number, number, number, number]
  scale3d: [number, number, number]
}

export interface SaveProperty {
  name: string
  type: string
  value: any
  index?: number
  // ... other metadata for complex types like arrays/structs
}

import * as assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'
import { BinaryReader } from '../parser/BinaryReader'
import { parseHeader } from '../parser/HeaderParser'
import { decompressBody, parseBodyOutline } from '../parser/BodyParser'

suite('BDD-002: Isolated Body Outline Test', () => {
  test('Should correctly outline the body structure without full parsing', () => {
    // 1. ARRANGE: Read the file, parse header, and decompress the body.
    const saveFilePath = path.join(
      __dirname,
      '..',
      '..',
      'src',
      'test',
      '1.sav',
    )
    const originalFileBuffer = fs.readFileSync(saveFilePath)

    const headerReader = new BinaryReader(originalFileBuffer)
    const header = parseHeader(headerReader)

    const bodyBuffer = decompressBody(headerReader, header)
    const bodyReader = new BinaryReader(bodyBuffer)

    // 2. ACT: Call ONLY the outline function.
    const objects = parseBodyOutline(bodyReader, header)

    // 3. ASSERT: Verify the outline is valid.
    assert.ok(
      objects,
      'The parseBodyOutline function returned null or undefined.',
    )
    const objectCount = Object.keys(objects).length
    assert.ok(
      objectCount > 100,
      `Expected many objects in the outline, but found only ${objectCount}`,
    )
  })
})

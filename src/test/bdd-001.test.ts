import * as assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'
import { BinaryReader } from '../parser/BinaryReader'
import { parseHeader } from '../parser/HeaderParser'

suite('BDD-001: Isolated Header Parser Test', () => {
  test('Should correctly parse the header from a real save file', () => {
    // 1. ARRANGE: Read the file and create a BinaryReader. No other parsing.
    const saveFilePath = path.join(
      __dirname,
      '..',
      '..',
      'src',
      'test',
      '1.sav',
    )
    assert.ok(
      fs.existsSync(saveFilePath),
      `ERROR: The test save file could not be found at "${saveFilePath}"`,
    )
    const originalFileBuffer = fs.readFileSync(saveFilePath)
    const reader = new BinaryReader(originalFileBuffer)

    // 2. ACT: Call ONLY the function we need to test.
    const header = parseHeader(reader)

    // 3. ASSERT: Verify the header data is valid.
    assert.ok(header, 'The parseHeader function returned null or undefined.')
    assert.strictEqual(
      typeof header.saveVersion,
      'number',
      'Header.saveVersion should be a number.',
    )
    assert.ok(
      header.saveVersion > 0,
      'Header.saveVersion should be greater than 0.',
    )
    assert.strictEqual(
      typeof header.sessionName,
      'string',
      'Header.sessionName should be a string.',
    )
    assert.ok(
      header.sessionName.length > 0,
      'Header.sessionName should not be an empty string.',
    )
    assert.strictEqual(
      typeof header.playDurationSeconds,
      'number',
      'Header.playDurationSeconds should be a number.',
    )
  })
})

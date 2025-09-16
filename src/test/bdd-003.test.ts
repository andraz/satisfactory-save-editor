import * as assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'
import { SaveParser } from '../parser/SaveParser'

suite('BDD-003: Deep Object Deserialization Test', () => {
  test('Should correctly parse a single game object with its properties', () => {
    // 1. ARRANGE: Parse the file with the current parser implementation.
    const saveFilePath = path.join(
      __dirname,
      '..',
      '..',
      'src',
      'test',
      '1.sav',
    )
    const originalFileBuffer = fs.readFileSync(saveFilePath)
    const parser = new SaveParser(originalFileBuffer)

    // 2. ACT: Parse the entire save file.
    const saveData = parser.parse()

    // 3. ASSERT ON THE FIRST FOUND ITEM
    const firstObjectKey = Object.keys(saveData.objects)[0]
    const firstObject = saveData.objects[firstObjectKey]

    // Assert that the parser found at least one object.
    assert.ok(firstObject, 'The parser did not return any objects.')

    // Assert that the first object has a valid, non-empty className.
    assert.strictEqual(
      typeof firstObject.className,
      'string',
      'The first object must have a string className.',
    )
    assert.ok(
      firstObject.className.length > 0,
      'The className of the first object should not be empty.',
    )

    // Assert that the first object has a valid, non-empty pathName.
    assert.strictEqual(
      typeof firstObject.pathName,
      'string',
      'The first object must have a string pathName.',
    )
    assert.ok(
      firstObject.pathName.length > 0,
      'The pathName of the first object should not be empty.',
    )

    // Assert that the first object has a valid type.
    assert.strictEqual(
      typeof firstObject.type,
      'number',
      'The first object must have a numeric type.',
    )

    // Assert that the first object has a properties array (it can be empty).
    assert.ok(
      Array.isArray(firstObject.properties),
      'The first object must have a properties array.',
    )
  })
})

import * as assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'
import { SaveParser } from '../parser/SaveParser'

suite('BDD-004: Display All Game Objects Test', () => {
  test('Should correctly parse and display all game objects in the save file', () => {
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

    // 3. ASSERT: Verify that all game objects are parsed correctly
    assert.ok(saveData, 'The parser should return valid save data.')

    assert.ok(
      saveData.objects,
      'Save data should contain an objects dictionary.',
    )

    const objectCount = Object.keys(saveData.objects).length
    assert.ok(
      objectCount > 0,
      `Expected at least one object, but found ${objectCount}`,
    )

    // Check that we have a reasonable number of objects (more than 100 as in BDD-002)
    assert.ok(
      objectCount > 100,
      `Expected many objects, but only found ${objectCount}. This might indicate incomplete parsing.`,
    )

    // Verify the structure of the first few objects
    const objectKeys = Object.keys(saveData.objects)
    for (let i = 0; i < Math.min(5, objectKeys.length); i++) {
      const objKey = objectKeys[i]
      const obj = saveData.objects[objKey]

      assert.ok(
        obj,
        `Object at key "${objKey}" should not be null or undefined.`,
      )

      // Assert that the object has required properties
      assert.strictEqual(
        typeof obj.className,
        'string',
        `Object ${objKey} should have a string className`,
      )
      assert.ok(
        obj.className.length > 0,
        `Object ${objKey} should have a non-empty className`,
      )

      assert.strictEqual(
        typeof obj.pathName,
        'string',
        `Object ${objKey} should have a string pathName`,
      )
      assert.ok(
        obj.pathName.length > 0,
        `Object ${objKey} should have a non-empty pathName`,
      )

      assert.ok(
        obj.type === 0 || obj.type === 1,
        `Object ${objKey} should have a valid type (0 or 1)`,
      )

      // Properties array should exist (can be empty)
      assert.ok(
        Array.isArray(obj.properties),
        `Object ${objKey} should have a properties array`,
      )

      // Check for transform if it's an actor
      if (obj.type === 1) {
        assert.ok(
          obj.transform,
          `Actor object ${objKey} should have a transform`,
        )
        if (obj.transform) {
          assert.strictEqual(
            obj.transform.rotation.length,
            4,
            `Object ${objKey} should have rotation with 4 values`,
          )
          assert.strictEqual(
            obj.transform.translation.length,
            3,
            `Object ${objKey} should have translation with 3 values`,
          )
          assert.strictEqual(
            obj.transform.scale3d.length,
            3,
            `Object ${objKey} should have scale3d with 3 values`,
          )
        }
      }
    }

    // Verify that we can access a reasonable subset of objects
    const firstFewObjects = objectKeys.slice(0, 10)
    assert.ok(
      firstFewObjects.length > 0,
      'Should be able to access at least some objects',
    )

    console.log(
      `Successfully parsed ${objectCount} game objects from the save file.`,
    )
  })
})

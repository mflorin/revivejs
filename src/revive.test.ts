import { assert } from 'chai'
import {revive} from './revive'
import {RevivalSchema} from './types'

describe('revive tests', () => {
  it('should revive a simple object correctly', () => {
    const name = 'John Smith'
    const serialized = `{ "name": "${name}" }`

    class Person {
      name = ''
      public getName() {
        return this.name
      }
    }

    const obj = revive(serialized, Person)
    assert.equal(obj.getName(), name)
  })

  it('should revive a complex object correctly', () => {

    const name = 'John Smith'
    const jobTitle = 'Developer'
    const serialized = `{ "name": "${name}", "job": { "title": "${jobTitle}" } }`


    class Job {
      title = ''
      public getTitle() {
        return this.title
      }
    }

    class Person {
      name = ''
      job: Job | null = null
      public getName() {
        return this.name
      }
      public getJob() {
        return this.job
      }
    }

    const schema: RevivalSchema<Person> = {
      type: Person,
      properties: {
        job: Job,
      },
    }
    const obj = revive(serialized, schema)
    assert.isNotNull(obj)
    assert.equal(obj.getName(), name)
    assert.equal(obj.getJob()?.getTitle(), jobTitle)
  })

  it('should revive nested schemas correctly', () => {

    const name = 'John Smith'
    const jobTitle = 'Developer'
    const prop1 = 'foo'
    const serialized = `{ "name": "${name}", "job": { "title": "${jobTitle}", "props": { "prop1": "${prop1}" } } }`

    class JobProperties {
      prop1 = ''
      getProp1() { return this.prop1 }

    }

    class Job {
      title = ''
      props: JobProperties | null = null
      public getTitle() {
        return this.title
      }

      public getProps() { return this.props }
    }

    class Employee {
      name = ''
      job: Job | null = null
      public getName() {
        return this.name
      }
      public getJob() {
        return this.job
      }
    }

    const schema: RevivalSchema<Employee> = {
      type: Employee,
      properties: {
        job: {
          type: Job,
          properties: {
            props: JobProperties
          }
        }
      },
    }
    const obj = revive(serialized, schema)
    assert.equal(obj.getName(), name)
    assert.equal(obj.getJob()?.getTitle(), jobTitle)
    assert.equal(obj.getJob()?.getProps()?.getProp1(), prop1)
  })

  it('should revive arrays correctly', () => {

    class Person {
      name = ''
      getName() {
        return this.name
      }
    }

    const name1 = 'John Smith'
    const name2 = 'Jane Doe'
    const serialized = `[
      {
        "name": "${name1}"
      },
      {
        "name": "${name2}"
      }
    ]`
    const schema = {
      items: Person
    }
    const list = revive(serialized, schema)
    assert.isArray(list)
    assert.equal(list[0].getName(), name1)
  })

  it('should revive nested array schemas correctly', () => {

    const name = 'John Smith'
    const jobTitle = 'Developer'
    const friend1Name = 'Mary'
    const friend1JobTitle = 'Tester'
    const friend2Name = 'Paul'
    const friend2JobTitle = 'PO'
    const prop1 = 'foo'
    const serialized = `{ 
      "name": "${name}", 
      "job": { 
        "title": "${jobTitle}", 
        "props": { "prop1": "${prop1}" } 
      },
      "friends": [ 
        {
          "name": "${friend1Name}",
          "job": {
            "title": "${friend1JobTitle}"
          }
        },
        {
          "name": "${friend2Name}",
          "job": {
            "title": "${friend2JobTitle}"
          }
        }
      ]
    }`

    class JobProperties {
      prop1 = ''
      getProp1() { return this.prop1 }

    }

    class Job {
      title = ''
      props: JobProperties = new JobProperties()
      public getTitle() {
        return this.title
      }

      public getProps() { return this.props }
    }

    class Employee {
      name = ''
      job: Job = new Job()
      friends: Employee[] = []
      public getName() {
        return this.name
      }
      public getJob() {
        return this.job
      }
      public getFriends() {
        return this.friends
      }

      static getRevivalSchema(): RevivalSchema<Employee> {
        return {
          type: Employee,
          properties: {
            job: {
              type: Job,
              properties: {
                props: JobProperties
              }
            },
            friends: {
              items: Employee
            }
          }
        }
      }
    }

    const obj = revive(serialized, Employee)
    assert.equal(obj.getName(), name)
    assert.equal(obj.getJob().getTitle(), jobTitle)
    assert.equal(obj.getJob().getProps().getProp1(), prop1)
    assert.isArray(obj.getFriends())
    assert.equal(obj.getFriends().length, 2)
    assert.equal(obj.getFriends()[0].getName(), friend1Name)
    assert.equal(obj.getFriends()[0].getJob().getTitle(), friend1JobTitle)
    assert.equal(obj.getFriends()[1].getName(), friend2Name)
    assert.equal(obj.getFriends()[1].getJob().getTitle(), friend2JobTitle)
  })

  it('should throw an error on missing properties', () => {

    const data = '{ "name": "John" }'

    class Person {
      name = ''
      age = 0
    }

    assert.throw(() => revive(data, Person, { failOnMissingFields: true }),
      'field age not found in serialized data')
  })

  it('should throw an error on unknown properties', () => {
    const data= '{ "name": "John", "foo": "bar" }'
    class Person {
      name = ''
      age = 0
    }

    assert.throw(() => revive(data, Person, { failOnUnknownFields: true }),
      'unknown field foo in serialized data')
  })

  it('should throw an error when deserializing root array types', () => {
    const data = '[1, 2, 3]'
    assert.throw(() => revive(data, Number), 'expected object, got array')
  })

  it('should deserialize root number', () => {
    const data = '123'
    assert.equal(revive(data, Number), 123)
  })

  it('should throw an error when deserializing root number into something else', () => {
    const data = '123'
    assert.throw(() => revive(data, String), 'expected schema type to be Number, got String')
  })

  it('should deserialize root string', () => {
    const data = '"foo"'
    assert.equal(revive(data, String), 'foo')
  })

  it('should throw an error when deserializing root string into something else', () => {
    const data = '"foo"'
    assert.throw(() => revive(data, Number), 'expected schema type to be String, got Number')
  })

  it('should deserialize root boolean', () => {
    const data = 'true'
    assert.equal(revive(data, Boolean), true)
  })

  it('should throw an error when deserializing root boolean into something else', () => {
    const data = 'true'
    assert.throw(() => revive(data, Number), 'expected schema type to be Boolean, got Number')
  })

  it('should throw an error when deserializing root boolean into something else', () => {
    const data = 'true'
    assert.throw(() => revive(data, Number), 'expected schema type to be Boolean, got Number')
  })

  it('should revive a map correctly', function () {
    class Prop {
      value = 0
      getValue() { return this.value }
    }
    class Person {
      name = ''
      props: {[key: string]: Prop} = {}
      getName() { return this.name }
      getProps() { return this.props }
      static getRevivalSchema(): RevivalSchema<Person> {
        return {
          type: Person,
          properties: {
            props: {
              map: Prop
            }
          }
        }
      }
    }
    const data= '{"name": "John", "props": {"foo": {"value": 1}, "bar": {"value": 2}}}'
    const p = revive(data, Person)
    assert.equal(p.getName(), 'John')
    assert.equal(p.getProps()['foo'].getValue(), 1)
    assert.equal(p.getProps()['bar'].getValue(), 2)
  });
})

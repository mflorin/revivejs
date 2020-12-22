import {
  defaultMarshalOptions,
  MarshalArraySchema,
  MarshalConstructor,
  MarshalObjectSchema,
  MarshalOptions,
  MarshalSchema, MarshalSchemaProvider,
} from './types';

type ParametricConstructor<T> = new(...args: any[]) => T

interface ParametricObjectSchema<T> extends MarshalObjectSchema {
  type: ParametricConstructor<T>;
}

interface ParametricArraySchema<T> extends MarshalArraySchema {
  items: ParametricSchema<T>
}

type ParametricSchema<T> = ParametricConstructor<T> | ParametricObjectSchema<T> | ParametricArraySchema<T>

function isParametricObjectSchema<T>(schema: any): schema is ParametricObjectSchema<T> {
  return 'type' in schema && 'properties' in schema
}

function isParametricArraySchema<T>(schema: any): schema is ParametricArraySchema<T> {
  return 'items' in schema
}

function isMarshalSchemaProvider(obj: any): obj is MarshalSchemaProvider {
  return typeof obj['getMarshalSchema'] === 'function'
}

type Unmarshalable = string | number | {[key: string]: any} | any[]

export function unmarshal<T>(data: Unmarshalable, schema: ParametricSchema<T>, options: MarshalOptions = defaultMarshalOptions): T {

  let obj: any

  if (typeof data === 'string') {
    obj = JSON.parse(data)
  } else {
    obj = data
  }

  return unmarshalAny(obj, schema, options)
}

function unmarshalAny(data: any, schema: MarshalSchema, options: MarshalOptions): any {

  if (isParametricObjectSchema(schema)) {
    return unmarshalObjectAny(data, schema, options)
  } else {
    if (isParametricArraySchema(schema)) {
      return unmarshalArrayAny(data, schema, options)
    } else {
      return unmarshalConstructorAny(data, schema, options)
    }
  }
}

function unmarshalObjectAny(data: any, schema: MarshalObjectSchema, options: MarshalOptions): any {
  let ret

  const constructor = schema.type

  if (options.createObjects) {
    ret = new constructor()

    /* assign values */
    const retProps = Object.getOwnPropertyNames(ret)
    for (const prop of retProps) {

      if (data[prop] === undefined) {
        if (options.failOnMissingFields) {
          throw new TypeError(`field ${prop} not found in serialized data`)
        }
        continue
      }

      if (typeof data[prop] !== 'object') {
        ret[prop] = data[prop]
        continue
      }

      if (schema.properties[prop] !== undefined) {
        ret[prop] = unmarshalAny(data[prop], schema.properties[prop], options)
      } else {
        ret[prop] = data[prop]
      }

    }

    if (options.failOnUnknownFields) {
      /* check if we have fields in serialized data that don't belong to the object */
      for (const field of Object.keys(data)) {
        if (!retProps.includes(field)) {
          throw new TypeError(`unknown field ${field} in serialized data`)
        }
      }
    }


  } else {
    /* just set the prototype */
    ret = data
    Object.setPrototypeOf(ret, constructor.prototype)
  }

  return ret
}

function unmarshalArrayAny(data: any, schema: MarshalArraySchema, options: MarshalOptions): any[] {
  if (!Array.isArray(data)) {
    throw new TypeError(`expected an array, got ${typeof data}`)
  }

  const ret: any[] = []
  for (const item of data) {
    ret.push(unmarshalAny(item, schema.items, options))
  }

  return ret
}

function unmarshalConstructorAny(data: any, objConstructor: MarshalConstructor, options: MarshalOptions): any {
  if (isMarshalSchemaProvider(objConstructor)) {
    return unmarshalAny(data, objConstructor.getMarshalSchema(), options)
  }
  return unmarshalObjectAny(data, {type: objConstructor, properties: {}}, options)
}

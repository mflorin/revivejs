import {
  defaultReviveOptions,
  ReviveArraySchema,
  ReviveConstructor,
  ReviveObjectSchema,
  ReviveOptions,
  ReviveSchema, ReviveSchemaProvider,
} from './types';

type ParametricConstructor<T> = new(...args: any[]) => T

interface ParametricObjectSchema<T> extends ReviveObjectSchema {
  type: ParametricConstructor<T>;
}

interface ParametricArraySchema<T> extends ReviveArraySchema {
  items: ParametricSchema<T>
}

type ParametricSchema<T> = ParametricConstructor<T> | ParametricObjectSchema<T> | ParametricArraySchema<T>

function isParametricObjectSchema<T>(schema: any): schema is ParametricObjectSchema<T> {
  return 'type' in schema && 'properties' in schema
}

function isParametricArraySchema<T>(schema: any): schema is ParametricArraySchema<T> {
  return 'items' in schema
}

function isReviveSchemaProvider(obj: any): obj is ReviveSchemaProvider {
  return typeof obj['getReviveSchema'] === 'function'
}

type Revivable = string | number | {[key: string]: any} | any[]

export function revive<T>(data: Revivable, schema: ParametricSchema<T>, options: ReviveOptions = defaultReviveOptions): T {

  let obj: any

  if (typeof data === 'string') {
    obj = JSON.parse(data)
  } else {
    obj = data
  }

  return reviveAny(obj, schema, options)
}

function reviveAny(data: any, schema: ReviveSchema, options: ReviveOptions): any {

  if (isParametricObjectSchema(schema)) {
    return reviveObjectAny(data, schema, options)
  } else {
    if (isParametricArraySchema(schema)) {
      return reviveArrayAny(data, schema, options)
    } else {
      return reviveConstructorAny(data, schema, options)
    }
  }
}

function reviveObjectAny(data: any, schema: ReviveObjectSchema, options: ReviveOptions): any {
  let ret

  const constructor = schema.type

  if (options.assignOnly) {
    ret = data
    return Object.setPrototypeOf(ret, constructor.prototype)
  }

  switch(typeof data) {
  case 'number':
    if (schema.type !== Number) {
      throw new TypeError(`expected schema type to be Number, got ${schema.type.name}`)
    }
    return data
  case 'bigint':
    if (schema.type !== Number) {
      throw new TypeError(`expected schema type to be Number, got ${schema.type.name}`)
    }
    return data
  case 'boolean':
    if (schema.type !== Boolean) {
      throw new TypeError(`expected schema type to be Boolean, got ${schema.type.name}`)
    }
    return data
  case 'function':
    throw new TypeError('`function` is not supported')
  case 'string':
    if (schema.type !== String) {
      throw new TypeError(`expected schema type to be String, got ${schema.type.name}`)
    }
    return data
  case 'symbol':
    throw new TypeError('`symbol` is not supported')
  case 'undefined':
    return data
  }

  if (Array.isArray(data)) {
    throw new TypeError('expected object, got array')
  }

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

    if (schema.properties[prop] !== undefined) {
      ret[prop] = reviveAny(data[prop], schema.properties[prop], options)
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


  return ret
}

function reviveArrayAny(data: any, schema: ReviveArraySchema, options: ReviveOptions): any[] {
  if (!Array.isArray(data)) {
    throw new TypeError(`expected an array, got ${typeof data}`)
  }

  const ret: any[] = []
  for (const item of data) {
    ret.push(reviveAny(item, schema.items, options))
  }

  return ret
}

function reviveConstructorAny(data: any, objConstructor: ReviveConstructor, options: ReviveOptions): any {
  if (isReviveSchemaProvider(objConstructor)) {
    return reviveAny(data, objConstructor.getReviveSchema(), options)
  }
  return reviveObjectAny(data, {type: objConstructor, properties: {}}, options)
}

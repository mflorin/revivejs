import {defaultMarshalOptions, MarshalConstructor, MarshalDetailedSchema, MarshalOptions, MarshalSchema} from './types';

type ParametricConstructor<T> = new(...args: any[]) => T

interface ParametricSchema<T> extends MarshalDetailedSchema {
  type: ParametricConstructor<T>;
}

function isParametricSchema<T>(schema: any): schema is ParametricSchema<T> {
  return 'type' in schema && 'properties' in schema
}

export function unmarshal<T>(
  data: string | {[key: string]: any}, schema: ParametricConstructor<T> | ParametricSchema<T>,
  options: MarshalOptions = defaultMarshalOptions): T {

  let obj: {[key: string]: any}
  let ret: T

  if (typeof data === 'string') {
    obj = JSON.parse(data)
  } else {
    obj = data
  }

  let constructor: ParametricConstructor<T>
  if (isParametricSchema(schema)) {
    constructor = schema.type
  } else {
    constructor = schema
  }

  if (options.createObjects) {
    ret = new constructor()

  } else {
    /* just set the prototype */
    ret = obj as T
    Object.setPrototypeOf(ret, constructor.prototype)
  }

  return ret
}

function unmarshalAny(data: {[key: string]: any}, options: MarshalOptions): any {

}

function populateObject<T>(obj: T, data: {[key: string]: any}, options: MarshalOptions): T {

  let prop: keyof T
  for (prop of Object.getOwnPropertyNames(obj).map(k => <keyof T>k)) {
    if (data[prop as string] !== undefined) {
      obj[prop] = data[prop as string] as any
    }
    obj[prop] = 'foo' as any
  }

  return obj
}


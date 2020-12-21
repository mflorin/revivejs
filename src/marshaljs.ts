import {defaultMarshalOptions, MarshalConstructor, MarshalDetailedSchema, MarshalOptions, MarshalSchema} from './types';

function isInitialSchema<T extends MarshalConstructor>(schema: any): schema is { type: T; properties: { [key: string]: MarshalSchema }} {
  return 'type' in schema && 'properties' in schema
}

export function unmarshal<T extends MarshalConstructor>(
  data: string | {[key: string]: any}, schema: T | { type: T; properties: { [key: string]: MarshalSchema }}, options: MarshalOptions = defaultMarshalOptions): T {

  let obj: {[key: string]: any}
  if (typeof data === 'string') {
    obj = JSON.parse(data)
  } else {
    obj = data
  }
  if (isInitialSchema(schema)) {
    if (options.createObjects) {
      
    }
  }


}


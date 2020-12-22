export interface MarshalOptions {
  failOnUnknownFields: boolean;
  failOnMissingFields: boolean;
  createObjects: boolean;
}

export const defaultMarshalOptions: MarshalOptions = {
  failOnUnknownFields: false,
  failOnMissingFields: false,
  createObjects: true,
}

export interface MarshalConstructor {
  new (...args: any[]): any;
}

export interface MarshalObjectSchema {
  type: MarshalConstructor;
  properties: { [key: string]: MarshalSchema }
}

export interface MarshalArraySchema {
  items: MarshalSchema
}

export type MarshalSchema = MarshalConstructor | MarshalObjectSchema | MarshalArraySchema

export interface MarshalSchemaProvider {
  getMarshalSchema(): MarshalSchema
}

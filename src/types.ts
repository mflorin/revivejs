export interface ReviveOptions {
  failOnUnknownFields: boolean;
  failOnMissingFields: boolean;
  createObjects: boolean;
}

export const defaultReviveOptions: ReviveOptions = {
  failOnUnknownFields: false,
  failOnMissingFields: false,
  createObjects: true,
}

export interface ReviveConstructor {
  new (...args: any[]): any;
}

export interface ReviveObjectSchema {
  type: ReviveConstructor;
  properties: { [key: string]: ReviveSchema }
}

export interface ReviveArraySchema {
  items: ReviveSchema
}

export type ReviveSchema = ReviveConstructor | ReviveObjectSchema | ReviveArraySchema

export interface ReviveSchemaProvider {
  getReviveSchema(): ReviveSchema
}

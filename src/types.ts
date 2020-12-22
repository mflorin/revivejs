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

export interface MarshalDetailedSchema {
  type: MarshalConstructor;
  properties: { [key: string]: MarshalSchema }
}

export type MarshalSchema = MarshalConstructor | MarshalDetailedSchema

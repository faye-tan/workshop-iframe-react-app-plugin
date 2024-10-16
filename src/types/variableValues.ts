/**
 * Copyright 2024 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Until OSDK is able to resolve objects by temporary ObjectRids, primary keys will be used as object locators.
 * Capped to 10,000 primaryKeys.
 */
export type ObjectSetLocators =
  | ObjectSetLocator_WithStringPKeys
  | ObjectSetLocator_WithNumberPKeys;
export interface ObjectSetLocator_WithStringPKeys {
  type: "string";
  primaryKeys: string[];
}
export interface ObjectSetLocator_WithNumberPKeys {
  type: "number";
  primaryKeys: number[];
}

/**
 * The value types the context holds.
 */
type SingleVariableValue =
  | boolean
  | number
  | string
  | Date
  | ObjectSetLocators
  | StructValue;
export type IVariableValue = SingleVariableValue | SingleVariableValue[];
export interface StructValue {
  structFields: { [structFieldId: string]: IVariableValue | undefined };
}

/**
 * Until OSDK is able to resolve objects by temporary ObjectRids, primary keys will be used as object locators.
 * Capped to 10,000 objectRids.
 */
export interface ObjectRids {
  objectRids: string[];
}

/**
 * The value types that Workshop is able to accept.
 */
type SingleVariableValueToSet =
  | boolean
  | number
  | string
  | Date
  | ObjectRids
  | StructValueWithObjectRids;
export type IVariableToSet =
  | SingleVariableValueToSet
  | SingleVariableValueToSet[];
export interface StructValueWithObjectRids {
  structFields: { [structFieldId: string]: IVariableToSet | undefined };
}
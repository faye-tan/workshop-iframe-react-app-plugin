/**
Copyright 2024 Palantir Technologies, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

import { asyncStatusLoaded, IAsyncLoaded, IConfigDefinition } from "./types";
import { IConfigValueMap } from "./types/configValues";
import { IVariableType_WithDefaultValue } from "./types/variableTypeWithDefaultValue";
import { IVariableValue } from "./types/variableValues";
import { assertNever } from "./utils";

/**
 * Takes the configDefinition and pulls out the default values, creating a default config values map.
 */
export function createDefaultConfigValueMap(
  configFields: IConfigDefinition
): IConfigValueMap {
  const configValueMap: IConfigValueMap = {};

  configFields.forEach((configField) => {
    switch (configField.field.type) {
      case "single":
        switch (configField.field.fieldValue.type) {
          case "inputOutput":
            configValueMap[configField.fieldId] = {
              type: "single",
              value: variableTypeWithDefaultValueToValue(
                configField.field.fieldValue.variableType
              ),
            };
            return;
          case "event":
            return;
          default:
            assertNever(
              `Unkonwn IConfigDefinitionFieldType type ${configField.field.fieldValue} when creating default config values map`,
              configField.field.fieldValue
            );
        }
        return;

      case "listOf":
        configValueMap[configField.fieldId] = {
          type: "listOf",
          listOfValues: [],
        };
        return;
      default:
        assertNever(
          `Unknown IConfigurationFieldType type ${configField.field} when creating default config values map`,
          configField.field
        );
    }
  });

  return configValueMap;
}

function variableTypeWithDefaultValueToValue(
  variableType: IVariableType_WithDefaultValue
): IAsyncLoaded<IVariableValue> | undefined {
  return variableType.defaultValue == null
    ? undefined
    : asyncStatusLoaded(variableType.defaultValue);
}

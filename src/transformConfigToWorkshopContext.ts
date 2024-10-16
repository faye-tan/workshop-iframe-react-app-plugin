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

import { asyncReloading, asyncStatusFailed, asyncStatusLoaded, asyncStatusLoading, IAsyncLoaded, IConfigDefinition, IWorkshopContext } from "./types";
import { IConfigValueMap } from "./types/configValues";
import { ILocator } from "./types/locator";
import { MESSAGE_TYPES_TO_WORKSHOP } from "./types/messages";
import { isOntologyObject } from "./types/ontologyObject";
import { IVariableType_WithDefaultValue } from "./types/variableTypeWithDefaultValue";
import { IVariableToSet, IVariableValue } from "./types/variableValues";
import { ExecutableEvent, IWorkshopContextField, ValueAndSetterMethods, VariableTypeToValueTypeToSet } from "./types/workshopContext";
import { assertNever, sendMessageToWorkshop } from "./utils";

// Currently, object sets are limited to 10000 objects. This limit will be removed when osdk supports materializing objects from temporary ObjectRids.
const MAX_OBJECTS = 10000;

/**
 * A recursive transformation function that given a config definition, returns a context object with
 * strongly typed properties and property value types from a given config definition.
 *
 * @param config: IConfigDefinition, a list of config fields
 * @param configValues: the map of values that populates the values of the config's properties.
 * @param opts: optionally contains a callback function `createLocatorInListCallback` to create a nested ILocator,
 * which is used when calling the function recursively.
 *
 * @returns IWorkshopContext, the context object.
 */
export function transformConfigWorkshopContext<T extends IConfigDefinition, V extends IVariableType_WithDefaultValue>(
  config: T,
  configValues: IConfigValueMap,
  setConfigValues: (newConfigValues: IConfigValueMap) => void,
  iframeWidgetId: string | undefined,
  opts?: {
    createLocatorInListCallback: (locator: ILocator) => ILocator;
  }
): IWorkshopContext<T> {

  // Recursively traverses the value map and updates it when given 
  // a value and valueLocator path through the value map tree. 
  const createNewConfigValueMapWithValueChange = (
    configValueMap: IConfigValueMap,
    valueLocator: ILocator,
    value?: IAsyncLoaded<IVariableValue>
  ): IConfigValueMap => {
    switch (valueLocator.type) {
      case "listOf": {
        const valueMapField = configValueMap[valueLocator.configFieldId];
        if (
          valueMapField.type === "listOf" &&
          valueLocator.index < valueMapField.listOfValues.length
        ) {
          return {
            ...configValueMap,
            [valueLocator.configFieldId]: {
              ...valueMapField,
              listOfValues: [
                ...valueMapField.listOfValues.slice(0, valueLocator.index),
                createNewConfigValueMapWithValueChange(
                  valueMapField.listOfValues[valueLocator.index],
                  valueLocator.locator,
                  value
                ),
                ...valueMapField.listOfValues.slice(valueLocator.index + 1),
              ],
            },
          };
        }
        return configValueMap;
      }
      case "single": {
        const valueMapField = configValueMap[valueLocator.configFieldId];
        if (valueMapField.type === "single") {
          return {
            ...configValueMap,
            [valueLocator.configFieldId]: {
              ...valueMapField,
              value: value,
            },
          };
        }
        return configValueMap;
      }
      default:
        assertNever(
          `Unknown ILocator type ${valueLocator} when creating context`,
          valueLocator
        );
    }
  };

  // Before setting objectSet information in the context's value map, extract the primaryKeys,
  // which is OSDK's preffered format to load objects with
  const maybeExtractObjectRidsFromVariableTypeToValueValue = <
    V extends IVariableType_WithDefaultValue
  >(
    value?: VariableTypeToValueTypeToSet<V>
  ): IVariableValue | undefined => {
    if (Array.isArray(value) && value.every(isOntologyObject)) {
      if (
        value.every(
          (ontologyObject) => typeof ontologyObject.$primaryKey === "string"
        )
      ) {
        return {
          type: "string",
          primaryKeys: value
            .slice(MAX_OBJECTS)
            .map((ontologyObject) => ontologyObject.$primaryKey) as string[],
        };
      } else if (
        value.every(
          (ontologyObject) => typeof ontologyObject.$primaryKey === "number"
        )
      ) {
        return {
          type: "number",
          primaryKeys: value
            .slice(MAX_OBJECTS)
            .map((ontologyObject) => ontologyObject.$primaryKey) as number[],
        };
      }
      return undefined;
    }
    return value;
  };

  // Before sending objectSet information to Workshop, extract the objectRids, 
  // which is Workshop's locator format to load objects with
  const maybeExtractObjectRidsFromVariableTypeToValueTypeToSet = <
    V extends IVariableType_WithDefaultValue
  >(
    value?: VariableTypeToValueTypeToSet<V>
  ): IVariableToSet | undefined => {
    if (Array.isArray(value) && value.every(isOntologyObject)) {
      return {
        objectRids: value
          .slice(MAX_OBJECTS)
          .map((ontologyObject) => ontologyObject.$rid),
      };
    }
    return value;
  };

  // Returns a callback to set a context field as "loaded" with a value
  const createSetLoadedValueCallback =
    <V extends IVariableType_WithDefaultValue>(valueLocator: ILocator) =>
    (value?: VariableTypeToValueTypeToSet<V>) => {
      const variableValue =
        maybeExtractObjectRidsFromVariableTypeToValueValue(value);
      setConfigValues(
        createNewConfigValueMapWithValueChange(
          configValues,
          valueLocator,
          variableValue == null
            ? variableValue
            : asyncStatusLoaded(variableValue)
        )
      );

      const valueTypeToSet =
        maybeExtractObjectRidsFromVariableTypeToValueTypeToSet(value);

      // Only able to send message to workshop if iframeWidgetId was received
      if (iframeWidgetId != null) {
        sendMessageToWorkshop({
          type: MESSAGE_TYPES_TO_WORKSHOP.SETTING_VALUE,
          iframeWidgetId: iframeWidgetId,
          valueLocator,
          value:
            valueTypeToSet == null
              ? valueTypeToSet
              : asyncStatusLoaded(valueTypeToSet),
        });
      }
    };

  // Returns a callback to set a context field as "reloading" with a value
  const createSetReloadingValueCallback =
    <V extends IVariableType_WithDefaultValue>(valueLocator: ILocator) =>
    (value?: VariableTypeToValueTypeToSet<V>) => {
      const variableValue =
        maybeExtractObjectRidsFromVariableTypeToValueValue(value);
      setConfigValues(
        createNewConfigValueMapWithValueChange(
          configValues,
          valueLocator,
          variableValue == null ? variableValue : asyncReloading(variableValue)
        )
      );

      const valueTypeToSet =
        maybeExtractObjectRidsFromVariableTypeToValueTypeToSet(value);

      // Only able to send message to workshop if iframeWidgetId was received
      if (iframeWidgetId != null) {
        sendMessageToWorkshop({
          type: MESSAGE_TYPES_TO_WORKSHOP.SETTING_VALUE,
          iframeWidgetId,
          valueLocator,
          value:
            valueTypeToSet == null
              ? valueTypeToSet
              : asyncReloading(valueTypeToSet),
        });
      }
    };

  // Returns a callback to set a context field as "loading" 
  const createSetLoadingCallback = (valueLocator: ILocator) => () => {
    // Only able to send message to workshop if iframeWidgetId was received
    if (iframeWidgetId != null) {
      sendMessageToWorkshop({
        type: MESSAGE_TYPES_TO_WORKSHOP.SETTING_VALUE,
        iframeWidgetId,
        valueLocator,
        value: asyncStatusLoading(),
      });
    }
  };

  // Returns a callback to set a context field as "failed to load"
  const createSetFailedWithErrorCallback =
    (valueLocator: ILocator) => (error: string) => {
      // Only able to send message to workshop if iframeWidgetId was received
      if (iframeWidgetId != null) {
        sendMessageToWorkshop({
          type: MESSAGE_TYPES_TO_WORKSHOP.SETTING_VALUE,
          iframeWidgetId,
          valueLocator,
          value: asyncStatusFailed(error),
        });
      }
    };

  // Returns a callback to execute an event in Workshop
  const createExecuteEventCallback = (eventLocator: ILocator) => () => {
    // Only able to send message to workshop if iframeWidgetId was received
    if (iframeWidgetId != null) {
      sendMessageToWorkshop({
        type: MESSAGE_TYPES_TO_WORKSHOP.EXECUTING_EVENT,
        iframeWidgetId,
        eventLocator,
      });
    }
  };

  const workshopContext: { [fieldId: string]: IWorkshopContextField<T, V> } =
    {};

  // Populate the context object from the config fields 
  config.forEach((fieldDefinition) => {
    const { fieldId, field } = fieldDefinition;
    switch (field.type) {
      case "single":
        switch (field.fieldValue.type) {
          case "event": {
            const locator: ILocator =
              opts == null
                ? { type: "single", configFieldId: fieldId }
                : opts.createLocatorInListCallback({
                    type: "single",
                    configFieldId: fieldId,
                  });
                  workshopContext[fieldId] = {
              executeEvent: createExecuteEventCallback(locator),
            } as ExecutableEvent;
            return;
          }
          case "inputOutput": {
            const locator: ILocator =
              opts == null
                ? { type: "single", configFieldId: fieldId }
                : opts.createLocatorInListCallback({
                    type: "single",
                    configFieldId: fieldId,
                  });
                  workshopContext[fieldId] = {
              fieldValue:
                configValues[fieldId].type === "single"
                  ? configValues[fieldId].value
                  : undefined,
              setLoading: createSetLoadingCallback(locator),
              setLoadedValue: createSetLoadedValueCallback(locator),
              setReloadingValue: createSetReloadingValueCallback(locator),
              setFailedWithError: createSetFailedWithErrorCallback(locator),
            } as ValueAndSetterMethods<typeof field.fieldValue.variableType>;
            return;
          }
          default:
            assertNever(
              `Unknown IConfigDefinitionFieldType ${field.fieldValue} when`,
              field.fieldValue
            );
        }
      case "listOf":
        if (configValues[fieldId].type === "listOf") {
          const createLocator =
            (index: number) =>
            (locator: ILocator): ILocator => {
              return {
                type: "listOf",
                configFieldId: fieldId,
                index,
                locator,
              };
            };
          const listOfValues = configValues[fieldId].listOfValues;
          workshopContext[fieldId] = listOfValues.map((listOfValue, index) =>
            transformConfigWorkshopContext(field.config, listOfValue, setConfigValues, iframeWidgetId, {
              createLocatorInListCallback: createLocator(index),
            })
          );
        } else {
            workshopContext[fieldId] = [];
        }
        return;
      default:
        assertNever(
          `Unknown IConfigurationFieldType type ${field} when`,
          field
        );
    }
  });

  return workshopContext as IWorkshopContext<T>;
}

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

import React from "react";
import { IConfigDefinition } from "./types/configDefinition";
import { IAsyncStatus, asyncStatusLoading, asyncStatusLoaded, asyncStatusFailed, asyncReloading } from "./types/loadingState";
import { MESSAGE_TYPES_TO_WORKSHOP, IMessageFromWorkshop, MESSAGE_TYPES_FROM_WORKSHOP } from "./types/messages";
import { isInsideNonVSCodeWorkspacesIframe, sendMessageToWorkshop } from "./utils";
import { ExecutableEvent, IWorkshopContext, IWorkshopContextField, ValueAndSetterMethods, VariableTypeToValueTypeToSet } from "./types/workshopContext";
import { IConfigValueMap } from "./types/configValues";
import { IVariableType_WithDefaultValue } from "./types/variableTypeWithDefaultValue";
import { IVariableToSet, IVariableValue, OntologyObject } from "./types/variableValues";
import { ILocator } from "./types/locator";

function variableTypeWithDefaultValueToValue(variableType: IVariableType_WithDefaultValue): IAsyncStatus<IVariableValue> | undefined {
    return variableType.defaultValue == null ? undefined : asyncStatusLoaded(variableType.defaultValue);
}

const MAX_OBJECTS = 10000;

function makeDefaultConfigValueMap(configFields: IConfigDefinition): IConfigValueMap {
    const configValueMap: IConfigValueMap = {};

    configFields.forEach(configField => {
        switch (configField.field.type) {
            case "single":
                switch (configField.field.fieldValue.type) {
                    case "inputOutput": 
                        configValueMap[configField.fieldId] = { 
                            type: "single", 
                            value: variableTypeWithDefaultValueToValue(configField.field.fieldValue.variableType),
                        };
                        return; 
                }
                return;

            case "listOf": 
                configValueMap[configField.fieldId] = {
                    type: "listOf", 
                    listOfValues: [],
                }
        }
    });

    return configValueMap;
}

export function useWorkshopContext<T extends IConfigDefinition, V extends IVariableType_WithDefaultValue>(configFields: IConfigDefinition): IAsyncStatus<IWorkshopContext<T>> {
    // The context's definition
    const [configDefinition] = React.useState<IConfigDefinition>(configFields); 
    // The context's values
    const [configValues, setConfigValues] = React.useState<IConfigValueMap>(makeDefaultConfigValueMap(configFields)); 

    // The id of the corresponding widget 
    const [iframeWidgetId, setIframeWidgetId] = React.useState<string>();

    // Boolean checks
    const [isConfigRejectedByWorkshop, setIsConfigRejectedByWorkshop] = React.useState<boolean>(false);
    const [isListenerInitialized, setIsListenerInitialized] = React.useState<boolean>(false);
    const [workshopReceivedConfig, setWorkshopReceivedConfig] = React.useState<boolean>(false);

    // Once on mount, initialize listeners
    React.useEffect(() => {
        sendConfigDefinitionToWorkshop(configFields);
        
        if (isListenerInitialized) {
            return; 
        }
        window.addEventListener("message", messageHandler); 
        setIsListenerInitialized(true); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** 
     * Handles each type of message received from Workshop.
     */
    const messageHandler = (event: MessageEvent<IMessageFromWorkshop>) => {
        // only process messages from the parent window (otherwise messages posted by 3rd party widgets may be processed)
        if (event.source !== window.parent || window.parent === window) {
            return;
        }

        console.log("child iframe: handling message in child iframe", event.source, event.origin, window.parent, event.data); 

        const message = event.data;
        switch (message.type) {
            case MESSAGE_TYPES_FROM_WORKSHOP.CONFIG_ACCEPTED: 
                handleWorkshopAcceptedConfigMessage(message.iframeWidgetId); 
                return;
            case MESSAGE_TYPES_FROM_WORKSHOP.CONFIG_REJECTED: 
                handleWorkshopRejectedConfigMessage(); 
                return;
            case MESSAGE_TYPES_FROM_WORKSHOP.VALUE_CHANGE:
                handleValueChangeFromWorkshop(message.inputValues, message.iframeWidgetId);
                return; 
        }
        
    }

    /**
     * Only receives a message of type IWorkshopAcceptedConfigMessage, and once received, fills in values, outputTypes, eventIds with given values. 
     */
    const handleWorkshopAcceptedConfigMessage = (iframeWidgetId: string) => {
        console.log("child iframe: useWorkshopContext config was accepted");
        setWorkshopReceivedConfig(true);
        setIframeWidgetId(iframeWidgetId);
    }

    /**
     * This will determine whether the hook should return asyncFailedLoaded status 
     */ 
    const handleWorkshopRejectedConfigMessage = () => {
        console.log("child iframe: useWorkshopContext config was rejected");
        setIsConfigRejectedByWorkshop(true); 
    }
 
    /**
     * Entire tree of values is passed from Workshop.
     */
    const handleValueChangeFromWorkshop = (newConfigValues: IConfigValueMap, iframeWidgetIdFromWorkshop: string) => {
        // Only set map of config values if iframeWidgetId received from Workshop matches saved iframeWidgetId
        if (iframeWidgetIdFromWorkshop === iframeWidgetId) {
            setConfigValues(newConfigValues);
        }
    }

    /**
     * Pass the config definition to Workshop
     * If it's on a brand new iframe widget, the definition gets saved
     * If it's on an existing iframe widget, the definition gets reconciled with the saved definition. 
     */
    const sendConfigDefinitionToWorkshop = (configFields: IConfigDefinition) => {
        sendMessageToWorkshop({
            type: MESSAGE_TYPES_TO_WORKSHOP.SENDING_CONFIG, 
            config: configFields, 
        })
    } 

    function makeConfigWorkshopContext<T extends IConfigDefinition>(config: T, configValues: IConfigValueMap,
        opts?: { 
            createLocatorCallbackInList: (locator: ILocator) => ILocator;
        }): IWorkshopContext<T> {

        const createNewConfigValueMapWithValueChange = (configValueMap: IConfigValueMap, valueLocator: ILocator, value?: IAsyncStatus<IVariableValue>): IConfigValueMap => {
            switch (valueLocator.type) {
                case "listOf": {
                    const valueMapField = configValueMap[valueLocator.configFieldId]; 
                    if (valueMapField.type === "listOf" && valueLocator.index < valueMapField.listOfValues.length) {
                        return {
                            ...configValueMap, 
                            [valueLocator.configFieldId]: {
                                ...valueMapField, 
                                listOfValues: [
                                    ...valueMapField.listOfValues.slice(0, valueLocator.index), 
                                    createNewConfigValueMapWithValueChange(valueMapField.listOfValues[valueLocator.index], valueLocator.locator, value), 
                                    ...valueMapField.listOfValues.slice(valueLocator.index + 1)
                                ],
                            }
                        }
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
                            }
                        };
                    }
                    return configValueMap;
                }
            }
        }

        const maybeExtractObjectRidsFromVariableTypeToValueValue = <V extends IVariableType_WithDefaultValue>(value?: VariableTypeToValueTypeToSet<V>): IVariableValue | undefined => {
            if (Array.isArray(value) && value.every(isOntologyObject)) {
                if (value.every(ontologyObject => typeof ontologyObject.$primaryKey === "string")) {
                    return {
                        type: "string", 
                        primaryKeys: value.slice(MAX_OBJECTS).map(ontologyObject => ontologyObject.$primaryKey) as string[],
                    }
                } else if (value.every(ontologyObject => typeof ontologyObject.$primaryKey === "number")) {
                    return {
                        type: "number", 
                        primaryKeys: value.slice(MAX_OBJECTS).map(ontologyObject => ontologyObject.$primaryKey) as number[],
                    }
                }
                return undefined;
            }
            return value;
        }

        const maybeExtractObjectRidsFromVariableTypeToValueTypeToSet = <V extends IVariableType_WithDefaultValue>(value?: VariableTypeToValueTypeToSet<V>): IVariableToSet | undefined => {
            if (Array.isArray(value) && value.every(isOntologyObject)) {
                return {
                    objectRids: value.slice(MAX_OBJECTS).map(ontologyObject => ontologyObject.$rid),
                };
            }
            return value;
        }

        const isOntologyObject = (value: unknown): value is OntologyObject => {
            return typeof value === "object" 
                && value != null 
                && "$rid" in value 
                && typeof value.$rid === "string" 
                && "$primaryKey" in value 
                && (typeof value.$primaryKey === "string" || typeof value.$primaryKey === "number");
        }

        const createSetLoadedValueCallback = <V extends IVariableType_WithDefaultValue>(valueLocator: ILocator) => (value?: VariableTypeToValueTypeToSet<V>) => {
            console.log("child iframe: value is being set loaded", valueLocator, value);

            const variableValue = maybeExtractObjectRidsFromVariableTypeToValueValue(value); 
            setConfigValues(createNewConfigValueMapWithValueChange(configValues, valueLocator, variableValue == null ? variableValue : asyncStatusLoaded(variableValue)));

            const valueTypeToSet = maybeExtractObjectRidsFromVariableTypeToValueTypeToSet(value);

            // Only able to send message to workshop if iframeWidgetId was received
            if (iframeWidgetId != null) {
                sendMessageToWorkshop({
                    type: MESSAGE_TYPES_TO_WORKSHOP.SETTING_VALUE, 
                    iframeWidgetId: iframeWidgetId,
                    valueLocator,
                    value: valueTypeToSet == null ? valueTypeToSet : asyncStatusLoaded(valueTypeToSet),
                })
            }
        };

        const createSetReloadingValueCallback = <V extends IVariableType_WithDefaultValue>(valueLocator: ILocator) => (value?: VariableTypeToValueTypeToSet<V>) => {
            console.log("child iframe: value is being set reloading", valueLocator, value);

            const variableValue = maybeExtractObjectRidsFromVariableTypeToValueValue(value); 
            setConfigValues(createNewConfigValueMapWithValueChange(configValues, valueLocator, variableValue == null ? variableValue : asyncReloading(variableValue)));

            const valueTypeToSet = maybeExtractObjectRidsFromVariableTypeToValueTypeToSet(value);

            // Only able to send message to workshop if iframeWidgetId was received
            if (iframeWidgetId != null) {
                sendMessageToWorkshop({
                    type: MESSAGE_TYPES_TO_WORKSHOP.SETTING_VALUE, 
                    iframeWidgetId,
                    valueLocator,
                    value: valueTypeToSet == null ? valueTypeToSet : asyncReloading(valueTypeToSet),
                });
            }
        };

        const createSetLoadingCallback = (valueLocator: ILocator) => () => {
            console.log("child iframe: value is being set loading", valueLocator);

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

        const createSetFailedWithErrorCallback = (valueLocator: ILocator) => (error: string) => {
            console.log("child iframe: value is being set failed with error", valueLocator, error);

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

        const createExecuteEventCallback = (eventLocator: ILocator) => () => {
            console.log("child iframe: event is being executed", eventLocator);

            // Only able to send message to workshop if iframeWidgetId was received
            if (iframeWidgetId != null) {
                sendMessageToWorkshop({
                    type: MESSAGE_TYPES_TO_WORKSHOP.EXECUTING_EVENT, 
                    iframeWidgetId,
                    eventLocator,
                });
            }
        };

        const result: {[fieldId: string]: IWorkshopContextField<T, V> } = {} as IWorkshopContext<T>;
        
        config.forEach(fieldDefinition => {
            const { fieldId, field } = fieldDefinition;
            switch (field.type) {
                case "single": 
                    switch (field.fieldValue.type) {
                        case "event": {
                            const locator: ILocator = opts == null 
                                ? { type: "single", configFieldId: fieldId }
                                : opts.createLocatorCallbackInList({ type: "single", configFieldId: fieldId });
                            result[fieldId] = {
                                executeEvent: createExecuteEventCallback(locator),
                            } as ExecutableEvent;
                            return; 
                        }
                        case "inputOutput": {
                            const locator: ILocator = opts == null
                                ? { type: "single", configFieldId: fieldId }
                                : opts.createLocatorCallbackInList({ type: "single", configFieldId: fieldId });
                            result[fieldId] = {
                                fieldValue: configValues[fieldId].type === "single" ? configValues[fieldId].value : undefined, 
                                setLoading: createSetLoadingCallback(locator), 
                                setLoadedValue: createSetLoadedValueCallback(locator),
                                setReloadingValue: createSetReloadingValueCallback(locator),
                                setFailedWithError: createSetFailedWithErrorCallback(locator),
                            } as ValueAndSetterMethods<typeof field.fieldValue.variableType>;
                        }
                    }
                    return;
                case "listOf":
                    if (configValues[fieldId].type === "listOf") {
                        const createLocator = (index: number) => (locator: ILocator): ILocator => {
                            return {
                                type: "listOf",
                                configFieldId: fieldId,
                                index,
                                locator,
                            };
                        }
                        const listOfValues = configValues[fieldId].listOfValues;
                        result[fieldId] = listOfValues.map((listOfValue, index) => makeConfigWorkshopContext(field.config, listOfValue, { 
                            createLocatorCallbackInList: createLocator(index) 
                        }));
                    } else {
                        result[fieldId] = [];
                    }
                    return; 
            }
        });
    
        return result as IWorkshopContext<T>;
    }

    const insideIframe = isInsideNonVSCodeWorkspacesIframe();

    console.log(362, isConfigRejectedByWorkshop, insideIframe);

    if (!insideIframe) {
        return asyncStatusLoaded(makeConfigWorkshopContext(configDefinition, configValues));
    }

    // Config was not accepted by workshop, return failed
    if (isConfigRejectedByWorkshop && insideIframe) {
        return asyncStatusFailed("Workshop rejected the config definition. This is likely due to an API break, as the Workshop iframe's existing saved config is not a subset of the provided config.");
    }

    console.log(227, workshopReceivedConfig, insideIframe);
    return workshopReceivedConfig && insideIframe
        ? asyncStatusLoaded(makeConfigWorkshopContext(configDefinition, configValues)) 
        : asyncStatusLoading(); 
}

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
import { IConfigDefinition, IConfigDefinitionField } from "./types/configDefinition";
import { IAsyncStatus, asyncStatusLoading, asyncStatusLoaded, asyncStatusFailed } from "./types/loadingState";
import { MESSAGE_TYPES_TO_WORKSHOP, IMessageFromWorkshop, MESSAGE_TYPES_FROM_WORKSHOP } from "./types/messages";
import { IStructVariableFieldTypes, IVariableType, IVariableType_Struct } from "./types/variableTypes";
import { isInsideIframe, sendMessageToWorkshop } from "./utils";
import { IVariableValue } from "./types/variableValues";

interface ExecutableEvent {
    executeEvent: () => void;
}
type SettableValue<T extends IVariableType> = {
    setValue: StronglyTypedSetterFunction<T>;
}

type VariableTypeToValueType<T extends IVariableType> = T extends { type: "string" }
    ? string 
    : T extends { type: "boolean" }
        ? boolean
        : T extends { type: "number"}
            ? number 
            : T extends { type: "date" } | { type: "timestamp" }
                ? Date
                : T extends { type: "array" }
                    ? VariableTypeToValueType<T["arraySubType"]>[]
                    : T extends { type: "struct", structFieldTypes: readonly IStructVariableFieldTypes[] }
                        ? StructTypeToStructValue<T> 
                        : never;

type StructTypeToStructValue<T extends IVariableType_Struct> = {
    structFields: { 
        [K in T['structFieldTypes'][number]['fieldId']
    ]: VariableTypeToValueType<T["structFieldTypes"][number]["fieldType"]> | undefined }
};

type StronglyTypedSetterFunction<T extends IVariableType> = (value: VariableTypeToValueType<T> | undefined) => void; 

/**
 * The API consumers of useWorkshopContext have access to. 
 * - values: the input values Workshop sends 
 * - changeValue: a function to change an output value in Workshop
 * - executeEvent: 
 */
type IWorkshopContext<T extends IConfigDefinition> = {
    [K in T[number] as K["fieldId"]]: 
      K["field"] extends { type: "single", fieldType: { type: "input" } } 
        ? VariableTypeToValueType<K["field"]["fieldType"]["inputVariableType"]> | undefined // K["field"]["fieldType"]["defaultValue"]
        : K["field"] extends { type: "single", fieldType: { type: "output" } }
          ? SettableValue<K["field"]["fieldType"]["outputVariableType"]>
          : K["field"] extends { type: "single", fieldType: { type: "event" } }
            ? ExecutableEvent
            : K["field"] extends { type: "listOf"; config: readonly IConfigDefinitionField[] }
              ? IWorkshopContext<K["field"]["config"]>[]
              : never; 
};

export function useWorkshopContext<T extends IConfigDefinition>(configFields: T): IAsyncStatus<IWorkshopContext<T>> {
    const [workshopContext, setWorkshopContext] = React.useState<IWorkshopContext<T>>(() => makeConfigWorkshopContext(configFields));
    const [isConfigRejectedByWorkshop, setIsConfigRejectedByWorkshop] = React.useState<boolean>(false);
    const [isListenerInitialized, setIsListenerInitialized] = React.useState<boolean>(false);
    const [workshopReceivedConfig, setWorkshopReceivedConfig] = React.useState<boolean>(false);

    // Once on mount, initialize listeners
    React.useEffect(() => {
        sendConfigDefinitionToWorkshop(configFields);  // TODO(ftan) what if configFields input changes? I feel like they should not be dynamically changing the configFields so that's fine. 
        
        if (!isListenerInitialized) {
            return; 
        }
        window.addEventListener("message", messageHandler); 
        setIsListenerInitialized(true); 
    }, []);

    /** 
     * Handles each type of message received from Workshop.
     */
    const messageHandler = (event: MessageEvent<IMessageFromWorkshop>) => {
        // TODO(ftan): check origin that it is parent 
        const message = event.data;
        switch (message.type) {
            case MESSAGE_TYPES_FROM_WORKSHOP.CONFIG_ACCEPTED: 
                handleWorkshopAcceptedConfigMessage(); 
                return;
            case MESSAGE_TYPES_FROM_WORKSHOP.CONFIG_REJECTED: 
                handleWorkshopRejectedConfigMessage(); 
                return;
            case MESSAGE_TYPES_FROM_WORKSHOP.VALUE_CHANGE: 
                handleValueChangeFromWorkshop(message.fieldId, message.value);  // remove value locator 
                return; 
        }
    }

    /**
     * Only receives a message of type IWorkshopAcceptedConfigMessage, and once received, fills in values, outputTypes, eventIds with given values. 
     */
    const handleWorkshopAcceptedConfigMessage = () => {
        setWorkshopReceivedConfig(true);
    }

    /**
     * This will determine whether the hook should return asyncFailedLoaded status 
     */ 
    const handleWorkshopRejectedConfigMessage = () => {
        setIsConfigRejectedByWorkshop(true); 
    }

    // TODO: fix this
    const handleValueChangeFromWorkshop = (fieldId: string, value: IVariableValue | undefined) => {
        setWorkshopContext(prevWorkshopContext => ({...prevWorkshopContext, [fieldId]: value })); 
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

    function makeConfigWorkshopContext<T extends IConfigDefinition>(config: T): IWorkshopContext<T> {
        const result: { [key: string]: any } = {};
    
        config.forEach((fieldDefinition) => {
            const { fieldId, field } = fieldDefinition;
            if (field.type === "single") {
                if (field.fieldType.type === "input") {
                    result[fieldId] = field.fieldType.value;
                } else if (field.fieldType.type === "output") {
                    result[fieldId] = { 
                        setValue: createSetValueCallback(fieldId), // TODO switch this out for specific type functions
                    } as SettableValue<typeof field.fieldType.outputVariableType>;
                } else if (field.fieldType.type === "event") {
                    result[fieldId] = {
                        executeEvent: createExecuteEventCallback(fieldId),
                    } as ExecutableEvent;
                }
            } else if (field.type === "listOf") {
                result[fieldId] = Array(field.defaultLength).fill(makeConfigWorkshopContext(field.config));
            }
        });
    
        return result as IWorkshopContext<T>;
    }

    const createExecuteEventCallback = (eventId: string) => () => {
        sendMessageToWorkshop({
            type: MESSAGE_TYPES_TO_WORKSHOP.EXECUTING_EVENT, 
            eventId,
        })
    };

    // TODO fix this 
    const createSetValueCallback = <T extends IVariableType>(fieldId: string) => (value: VariableTypeToValueType<T>) => {
        sendMessageToWorkshop({
            type: MESSAGE_TYPES_TO_WORKSHOP.SETTING_VALUE, 
            fieldId, 
            value,
        })
    };

    // Config was not accepted by workshop, return failed
    if (isConfigRejectedByWorkshop) {
        return asyncStatusFailed("Workshop rejected the config definition. This is likely due to an API break, as the Workshop iframe's existing saved config is not a subset of the provided config.");
    }

    return workshopReceivedConfig || !isInsideIframe() 
        ? asyncStatusLoaded(workshopContext) 
        : asyncStatusLoading(); 
}
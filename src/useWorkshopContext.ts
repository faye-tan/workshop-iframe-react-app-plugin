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
import { IConfigDefinitionFields } from "./types/configDefinition";
import { IAsyncStatus, asyncStatusLoading, asyncStatusLoaded } from "./types/loadingState";
import { MESSAGE_TYPES_TO_WORKSHOP, IWorkshopReceivedConfigMessage } from "./types/messages";
import { IVariableType } from "./types/variableTypes";
import { VariableValue } from "./types/variableValues";
import { WorkshopContext } from "./classes/WorkshopContext";
import { sendMessageToWorkshop } from "./utils";
import { ContextConfigLayer } from "./classes/ContextConfigLayer";

/**
 * Returns a WorkshopContext in an async wrapper, which when is loaded can be used to reference input values, set output values, and execute events in Workshop. 
 */
export function useWorkshopContext(configFields: IConfigDefinitionFields): IAsyncStatus<WorkshopContext> {
    const [isListenerInitialized, setIsListenerInitialized] = React.useState<boolean>(false);
    const [workshopContext, setWorkshopContext] = React.useState<IAsyncStatus<WorkshopContext>>(asyncStatusLoading()); 

    /**
     * Once on mount, initialize listeners and send config to Workshop
     */
    React.useEffect(() => {
        sendConfigDefinitionToWorkshop(configFields);  // TODO what if configFields input changes?? 
        initializeListeners();
    }, []);

    const initializeListeners = () => {
        if (isListenerInitialized) {
            return; 
        }
        window.addEventListener("message", handleWorkshopReceivedConfigMessage);
        setIsListenerInitialized(true);
    }

    /**
     * Pass the config definition to Workshop
     * If it's on a brand new iframe widget, the definition gets saved
     * If it's on an existing iframe widget, the definition gets reconciled with the saved definition. 
     */
    const sendConfigDefinitionToWorkshop = (configFields: IConfigDefinitionFields) => {
        sendMessageToWorkshop({
            type: MESSAGE_TYPES_TO_WORKSHOP.SENDING_CONFIG, 
            config: configFields, 
        })
    } 

    /**
     * Only receives a message of type IWorkshopReceivedConfigMessage. 
     */
    const handleWorkshopReceivedConfigMessage = (_event: MessageEvent<IWorkshopReceivedConfigMessage>) => {
        createConfigFromConfigFields(configFields.fields); 
    }

    /**
     * Convert the given config definition into config layers, filled in with default values. 
     */
    const createConfigFromConfigFields = (configFields: IConfigDefinitionFields["fields"]) => {
        const eventIds = new Set<string>(); 
        const inputValues: { [configFieldId: string]: { variableType: IVariableType, value: IAsyncStatus<VariableValue | undefined> } } = {}; 
        const outputValueTypes: { [id: string]: IVariableType } = {}; 
        const listOfConfigs: { [id: string]: ContextConfigLayer[] } = {};

        Object.entries(configFields).forEach(([fieldId, field]) => {
            switch (field.type) {
                case "single": 
                    switch (field.fieldType.type) {
                        case "event": 
                            eventIds.add(fieldId)
                            return;
                        case "input": 
                            inputValues[fieldId] = { 
                                variableType: field.fieldType.inputVariableType, 
                                value: asyncStatusLoaded(field.fieldType.defaultValue),
                            }; 
                            return;
                        case "output": 
                            outputValueTypes[fieldId] = field.fieldType.outputVariableType;
                            return; 
                    }
                case "listOf": 
                    listOfConfigs[fieldId] = Array(field.maxLength).fill(createConfigFromConfigFields(field.config));
                    return; 
            }
        });

        const mainConfigLayer = new ContextConfigLayer(inputValues, listOfConfigs, outputValueTypes, eventIds); 

        setWorkshopContext(asyncStatusLoaded(new WorkshopContext(mainConfigLayer))); 
    }

    return workshopContext; 
}
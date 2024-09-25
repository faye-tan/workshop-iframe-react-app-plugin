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
import { MESSAGE_TYPES_TO_WORKSHOP, IMessageFromWorkshop, MESSAGE_TYPES_FROM_WORKSHOP } from './types/messages';
import { isInsideIframe, sendMessageToWorkshop } from "./utils";
import { convertConfigToContext } from "./convertConfigToContext";
import { IWorkshopContext } from "./types/workshopContext";

export function useWorkshopContext<T extends IConfigDefinition>(configFields: T): IAsyncStatus<IWorkshopContext<T>> {
    const [configDefinition, setConfigDefinition] = React.useState<IConfigDefinition>(configFields); 
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

        const message = event.data;
        switch (message.type) {
            case MESSAGE_TYPES_FROM_WORKSHOP.CONFIG_ACCEPTED: 
                setWorkshopReceivedConfig(true);
                return;
            case MESSAGE_TYPES_FROM_WORKSHOP.CONFIG_REJECTED: 
                setIsConfigRejectedByWorkshop(true); 
                return;
            case MESSAGE_TYPES_FROM_WORKSHOP.VALUE_CHANGE: 
                handleValueChangeFromWorkshop(message.configValues);
                return; 
        }
        
    }
 
    /**
     * When a value in Workshop is changed, traverse through the new config values and update them.
     */
    const handleValueChangeFromWorkshop = (newConfigValues: IConfigDefinition) => {

        const recursivelyTraverseConfigField = (prevConfigDefinitionField: IConfigDefinitionField, newConfigField: IConfigDefinitionField): IConfigDefinitionField => {
            if (prevConfigDefinitionField.field.type === "single" && newConfigField.field.type === "single") {
                if (prevConfigDefinitionField.field.fieldType.type === "input" && newConfigField.field.fieldType.type === "input") {
                    return {
                        ...prevConfigDefinitionField, 
                        field: {
                            ...prevConfigDefinitionField.field, 
                            fieldType: {
                                ...prevConfigDefinitionField.field.fieldType, 
                                value: newConfigField.field.fieldType.value,
                            }
                        }
                    }
                }
            } else if (prevConfigDefinitionField.field.type === "listOf" && newConfigField.field.type === "listOf") {
                const newListOfConfig = newConfigField.field.config;
                return {
                    ...prevConfigDefinitionField, 
                    field: {
                        ...prevConfigDefinitionField.field, 
                        config: prevConfigDefinitionField.field.config.map((prevConfigField, index) => 
                            recursivelyTraverseConfigField(prevConfigField, newListOfConfig[index])
                        ),
                    }
                }
            }
            return prevConfigDefinitionField;
        }

        setConfigDefinition(prevConfigDefinition => {
            return prevConfigDefinition.map(prevConfig => {
                const maybeMatch = newConfigValues.find(config => config.fieldId === prevConfig.fieldId);
                if (maybeMatch != null) {
                    return recursivelyTraverseConfigField(prevConfig, maybeMatch); 
                } else {
                    return prevConfig;
                }
            })
        }); 
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

    const insideIframe = isInsideIframe();

    // Config was not accepted by workshop, return failed
    if (isConfigRejectedByWorkshop) {
        return asyncStatusFailed("Workshop rejected the config definition. This is likely due to an API break, as the Workshop iframe's existing saved config is not a subset of the provided config.");
    }

    return workshopReceivedConfig || insideIframe
        ? asyncStatusLoaded(convertConfigToContext(configDefinition)) 
        : asyncStatusLoading(); 
}
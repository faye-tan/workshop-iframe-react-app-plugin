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
import { IConfigDefinitionFields } from "./types/configDefinition";
import { IVariableType } from "./types/variableTypes";
import { asyncStatusLoaded, asyncStatusLoading, IAsyncStatus } from './types/loadingState';
import { IMessageToWorkshop, IWorkshopReceivedConfigMessage, IValueChangeFromWorkshopMessage, MESSAGE_TYPES_TO_WORKSHOP, ValueLocator } from './types/messages';
import React from "react";
import { isValueOfVariableType, VariableValue } from "./types/variableValues";

function sendMessageToWorkshop(message: IMessageToWorkshop) {
    window.postMessage(JSON.stringify(message), "*");
}
 
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
        const inputValues: { [configFieldId: string]: { variableType: IVariableType, value?: VariableValue } } = {}; 
        const outputValueTypes: { [id: string]: IVariableType } = {}; 
        const listOfConfigs: { [id: string]: ConfigLayer[] } = {};

        Object.entries(configFields).forEach(([fieldId, field]) => {
            switch (field.type) {
                case "single": 
                    switch (field.fieldType.type) {
                        case "event": 
                            eventIds.add(fieldId)
                            return;
                        case "input": 
                            inputValues[fieldId] = { 
                                variableType: field.fieldType.inputVariable.variableType, 
                                value: field.fieldType.inputVariable.defaultValue,
                            }; 
                            return;
                        case "output": 
                            outputValueTypes[fieldId] = field.fieldType.outputVariable.variableType;
                            return; 
                    }
                case "listOf": 
                    listOfConfigs[fieldId] = Array(field.maxLength).fill(createConfigFromConfigFields(field.config));
                    return; 
            }
        });

        const mainConfigLayer = new ConfigLayer(inputValues, listOfConfigs, outputValueTypes, eventIds); 

        setWorkshopContext(asyncStatusLoaded(new WorkshopContext(mainConfigLayer))); 
    }

    return workshopContext; 
}

/**
 * Context manager class to receive and send information with Workshop. 
 */
class WorkshopContext { 
    private initializedListener = false;

    /** Contains the context from which to retrieve values, set values, and execute events */
    private mainConfigLayer: ConfigLayer;

    constructor(mainConfigLayer: ConfigLayer) {
        this.initializeListeners(); 
        this.mainConfigLayer = mainConfigLayer; 
    }

    /**
     * Initialize listeners to capture messages from Workshop.
     */
    private initializeListeners() {
        if (this.initializedListener) {
            return;
        }
        window.addEventListener("message", this.messageHandler);
        this.initializedListener = true; 
    }

    /**
     * Handle messages recieved from Workshop. 
     */
    private messageHandler = (event: MessageEvent<IValueChangeFromWorkshopMessage>) => {
        const message = event.data;
        const valueLocator = message.valueLocator; 
        const value = message.value; 
        this.changeValue(this.mainConfigLayer, valueLocator, value);
    }

    /**
     * Traverses context based on value locator to change the value in the context.
     */
    private changeValue(context: ConfigLayer, valueLocator: ValueLocator, value?: VariableValue) {
        switch (valueLocator.type) {
            case "single": 
                const variableType = context.inputValues[valueLocator.configFieldId].variableType; 
                // Only change value if type is right 
                if (isValueOfVariableType(variableType, value)) {
                    context.inputValues[valueLocator.configFieldId] = { 
                        ...context.inputValues[valueLocator.configFieldId], 
                        value,
                    }; 
                }
                break;
                    
            case "listOf":
                this.changeValue(context.listOfConfigs[valueLocator.configFieldId][valueLocator.index], valueLocator.locator, value);
                break; 
        }
    }

    /**
     * Traverses context based on value locator to execute an event in the context.
     */
    public executeEvent(valueLocator: ValueLocator): Promise<void> {
        return this.mainConfigLayer.executeEvent(valueLocator);
    }

    /**
     * Traverses context based on value locator to execute an event in the context.
     */
    public setValue(valueLocator: ValueLocator, value?: VariableValue): Promise<void> {
        return this.mainConfigLayer.setValue(valueLocator, value); 
    }

    /**
     * 
     */
    public getValuesMap() {
        return this.mainConfigLayer.inputValues;
    }
}

class ConfigLayer {
    /** Keeps track of the valid eventIds that can execute events in Workshop. */
    readonly eventIds: Set<string>; 
    
    /** A map of single values, referenced by their fieldId. The type is stored along with the value to enforce type checking. */
    readonly inputValues: {
            [id: string]: {
                variableType: IVariableType, 
                value?: VariableValue,
            }; 
        }; 
    
    /** Keeps track of the valid output value types that can be set in Workshop when setting values. */
    readonly outputValueTypes: {
            [id: string]: IVariableType;
        }
    
    /** To 'move into another layer' of the config, like enter a list this contains more config layers. */
    readonly listOfConfigs: { [id: string]: ConfigLayer[] }; 

    constructor(inputValues: {
        [id: string]: {
            variableType: IVariableType, 
            value?: VariableValue,
        }; 
    }, listOfConfigs: { [id: string]: ConfigLayer[] }, outputValueTypes: {
        [id: string]: IVariableType;
    }, eventIds: Set<string>) {
        this.inputValues = inputValues;
        this.listOfConfigs = listOfConfigs;
        this.outputValueTypes = outputValueTypes; 
        this.eventIds = eventIds;
    }

    /**
     * Returns a config layer inside a listOf config, or undefined if not found.
     */
    public getConfigInListOfConfig(listOfFieldId: string, indexOfListConfig: number): ConfigLayer | undefined {
        if (this.listOfConfigs[listOfFieldId] !== null && indexOfListConfig < this.listOfConfigs[listOfFieldId].length - 1 ) {
            return this.listOfConfigs[listOfFieldId][listOfFieldId];
        }
        return undefined; 
    }

    /**
     * Returns a resolved Promise if the set value request was successfully sent to Workshop, and rejects if the value to set is invalid.
     */
    public setValue(valueLocator: ValueLocator, value?: VariableValue): Promise<void> {
        return this.setValueOnLayer(this, valueLocator, value);
    }

    private setValueOnLayer(context: ConfigLayer, valueLocator: ValueLocator, value?: VariableValue): Promise<void> {
        switch (valueLocator.type) {
            case "single": 
                if (this.outputValueTypes[valueLocator.configFieldId] == null) {
                    return Promise.reject("Output field does not exist in config definition and cannot be set."); 
                } else if (this.outputValueTypes[valueLocator.configFieldId].type != value) { // check value type
                    return Promise.reject(`${value} type cannot be set for output field ${valueLocator.configFieldId} which has type ${this.outputValueTypes[valueLocator.configFieldId].type}`);
                }
                this.sendMessageToWorkshop({
                    type: MESSAGE_TYPES_TO_WORKSHOP.SETTING_VALUE,
                    configFieldId: valueLocator.configFieldId, 
                    value, 
                }); 
                return Promise.resolve(); 
                    
            case "listOf": 
                const contextInListOf = context.getConfigInListOfConfig(valueLocator.configFieldId, valueLocator.index); 
                if (contextInListOf != null) {
                    return this.setValueOnLayer(contextInListOf, valueLocator.locator, value);
                }
                return Promise.reject(`Unable to set value while traversing a listOf config, as ${valueLocator.configFieldId} with index ${valueLocator.index} does not exist`); 
        } 
    }

    /**
     * Returns a resolved Promise if the event was successfully sent to Workshop to execute, and rejects if the event to execute ID is not valid.
     */
    public executeEvent(valueLocator: ValueLocator): Promise<void> {
        return this.executeEventOnLayer(this, valueLocator);
    }

    private executeEventOnLayer(context: ConfigLayer, valueLocator: ValueLocator): Promise<void> {
        switch (valueLocator.type) {
            case "single": 
                if (!this.eventIds.has(valueLocator.configFieldId)) {
                    return Promise.reject(`Event with id ${valueLocator.configFieldId} does not exist in config definition and cannot be executed.`); 
                }
                sendMessageToWorkshop({
                    type: MESSAGE_TYPES_TO_WORKSHOP.EXECUTING_EVENT, 
                    eventId: valueLocator.configFieldId,
                })
                return Promise.resolve(); 
            case "listOf": 
                const contextInListOf = context.getConfigInListOfConfig(valueLocator.configFieldId, valueLocator.index); 
                if (contextInListOf != null) {
                    return this.executeEventOnLayer(contextInListOf, valueLocator.locator);
                }
                return Promise.reject(`Unable to execute event with eventId while traversing a listOf config, as ${valueLocator.configFieldId} with index ${valueLocator.index} does not exist`); 
        }
    }

    private sendMessageToWorkshop(message: IMessageToWorkshop) {
        window.postMessage(JSON.stringify(message), "*");
    }
}
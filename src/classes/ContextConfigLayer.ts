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
import { ValueLocator, MESSAGE_TYPES_TO_WORKSHOP } from "../types/messages";
import { IVariableType } from "../types/variableTypes";
import { VariableValue } from "../types/variableValues";
import { sendMessageToWorkshop } from "../utils";

/**
 * Represents a layer in the config. These are nesting to keep track of config layers in listOf configs.
 */
export class ContextConfigLayer {
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
    readonly listOfConfigs: { [id: string]: ContextConfigLayer[] }; 

    constructor(inputValues: {
        [id: string]: {
            variableType: IVariableType, 
            value?: VariableValue,
        }; 
    }, listOfConfigs: { [id: string]: ContextConfigLayer[] }, outputValueTypes: {
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
    public getConfigInListOfConfig(listOfFieldId: string, indexOfListConfig: number): ContextConfigLayer | undefined {
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

    private setValueOnLayer(context: ContextConfigLayer, valueLocator: ValueLocator, value?: VariableValue): Promise<void> {
        switch (valueLocator.type) {
            case "single": 
                if (this.outputValueTypes[valueLocator.configFieldId] == null) {
                    return Promise.reject("Output field does not exist in config definition and cannot be set."); 
                } else if (this.outputValueTypes[valueLocator.configFieldId].type != value) { // check value type
                    return Promise.reject(`${value} type cannot be set for output field ${valueLocator.configFieldId} which has type ${this.outputValueTypes[valueLocator.configFieldId].type}`);
                }
                sendMessageToWorkshop({
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

    private executeEventOnLayer(context: ContextConfigLayer, valueLocator: ValueLocator): Promise<void> {
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
}
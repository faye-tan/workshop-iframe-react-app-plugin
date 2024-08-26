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
import { IValueChangeFromWorkshopMessage, ValueLocator } from '../types/messages';
import { VariableValue } from "../types/variableValues";
import { isValueOfVariableType } from '../utils';
import { ContextConfigLayer } from "./ContextConfigLayer";

/**
 * Context manager class to receive and send information with Workshop. 
 */
export class WorkshopContext { 
    private initializedListener = false;

    /** Contains the context from which to retrieve values, set values, and execute events */
    private mainConfigLayer: ContextConfigLayer;

    constructor(mainConfigLayer: ContextConfigLayer) {
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
    private changeValue(context: ContextConfigLayer, valueLocator: ValueLocator, value?: VariableValue) {
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
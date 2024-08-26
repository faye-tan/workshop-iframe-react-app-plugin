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
import { IConfigDefinitionFields, isValueOfVariableType, IVariableType, IVariableValue } from "./types/configDefinition";
import { asyncStatusLoaded, asyncStatusLoading, IAsyncStatus, isAsyncStatusLoaded } from './types/loadingState';
import { IMessageFromWorkshop, IMessageToWorkshop, IValueLocator_Single, MESSAGE_TYPES_FROM_WORKSHOP, MESSAGE_TYPES_TO_WORKSHOP, ValueLocator } from "./types/messages";
import { IContextVariableType } from "./types/contextVariable";
import { isBoolean, isDate, isNumber, isString } from "lodash-es";

/**
 * function version 
 */
// export function useWorkshopContext(configDefinition: IConfigDefinitionFields): IAsyncStatus<IWorkshopContext<IConfigDefinitionFields["fields"]>> {
//     const [initializedListener, setInitializedListener] = React.useState<boolean>(false);
//     const [configReceivedByParent, setConfigReceivedByParent] = React.useState<boolean>(false);

//     const context = new WorkshopContext(configDefinition); 

//     const isValidOrigin = (origin: string): boolean => {
//         try {
//             const newUrl = new URL(origin);
//             return window.location.origin === newUrl.origin;
//         } catch (_error) {
//             return false;
//         }
//     }

//     const messageHandler = (event: MessageEvent<IMessageFromWorkshop>) => {
//         if (!isValidOrigin(event.origin)) {
//             return; 
//         }

//         const message = event.data;
//         switch (message.type) {
//             case MESSAGE_TYPES_FROM_WORKSHOP.CONFIG_RECIEVED: 
//                 setConfigReceivedByParent(true);  
//                 // TODO
//                 return; 
//             case MESSAGE_TYPES_FROM_WORKSHOP.VALUE_CHANGE: 
//                 const id = message.id; 
//                 // TODO 
//                 return; 
//         }
//     }

//     const initializeListeners = React.useCallback(() => {
//         if (this.initializeListeners) {
//             return; 
//         }

//         window.addEventListener("message", messageHandler); 
//     }, []); 

//     // On mount, send config definition
//     React.useEffect(() => {
//         initializeListeners(); 
//     }, []);

//     const isInIframe = React.useMemo(() => { 
//         // TODO verify this
//         return window.self.location.origin !== "https://swirl-containers.palantirfoundry.com";
//     }, []); 

//     // if (!isInIframe) {
//     //     return asyncStatusLoaded(); 
//     // }

//     return asyncStatusLoading();
// }

/**
 * Context manager class to receive and send information with Workshop. 
 */
export class WorkshopContextPlugin { 
    private initializedListener = false;

    /** Contains the context from which to retrieve values, set values, and execute events */
    private context: IAsyncStatus<ConfigLayer> = asyncStatusLoading(); 

    /** The config definition provided */
    private configDefinition: IConfigDefinitionFields;

    constructor(configDefinition: IConfigDefinitionFields) {
        this.initializeListeners(); 
        this.sendConfigDefinitionToWorkshop(configDefinition); 
    }

    public getContext() {
        return this.context; 
    }

    /**
     * Pass the config definition to Workshop
     * If it's on a brand new iframe widget, the definition gets saved
     * If it's on an existing iframe widget, the definition gets reconciled with the saved definition. 
     */
    private sendConfigDefinitionToWorkshop(configDefinition: IConfigDefinitionFields) {
        this.sendMessageToWorkshop({
            type: MESSAGE_TYPES_TO_WORKSHOP.SENDING_CONFIG, 
            config: configDefinition, 
        })
    }

    // TODO, consolidate with other method
    private sendMessageToWorkshop(message: IMessageToWorkshop) {
        window.postMessage(JSON.stringify(message), "*"); // TODO fix this
    }

    /**
     * Convert the given config definition into the context, filled in with default values. 
     */
    private initializeContext(configFields: IConfigDefinitionFields["fields"]) {
        const eventIds = new Set<string>(); 
        const inputValues: {
            [id: string]: {
                variableType: IVariableType, 
                value?: any,
            }; // TODO: strongly type
        } = {}; 
        const outputValueTypes: {
            [id: string]: IContextVariableType;
        } = {}; 
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
                    listOfConfigs[fieldId] = Array(field.maxLength).fill(this.initializeContext(field.config));
                    return; 
            }
        }); 
        this.context = asyncStatusLoaded(new ConfigLayer(inputValues, listOfConfigs, outputValueTypes, eventIds)); 
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
    private messageHandler = (event: MessageEvent<IMessageFromWorkshop>) => {
        const message = event.data;
        switch (message.type) {
            // Once we confirm from Workshop that the config has been sucessfully recieved, the context can be initialized
            case MESSAGE_TYPES_FROM_WORKSHOP.CONFIG_RECIEVED: 
                this.initializeContext(this.configDefinition.fields); 
                break; 

    
            case MESSAGE_TYPES_FROM_WORKSHOP.VALUE_CHANGE: 
                const valueLocator = message.valueLocator; 
                const value = message.value; 
                if (isAsyncStatusLoaded(this.context)) {
                    this.changeValue(this.context.value, valueLocator, value);
                }
                break;
        }
    }

    /**
     * Traverses context based on value locator to change the value in the context.
     */
    // Should this be on the context object level?? 
    private changeValue(context: ConfigLayer, valueLocator: ValueLocator, value: any) {
        switch (valueLocator.type) {
            case ("single"): 
                const variableType = context.inputValues[valueLocator.configFieldId].variableType; 
                // Only change value if type is right 
                if (isValueOfVariableType(variableType, value)) {
                    context.inputValues[valueLocator.configFieldId] = { 
                        ...context.inputValues[valueLocator.configFieldId], 
                        value,
                    }; 
                }
                break;
                    
            case ("listOf"): // TODO check 
                this.changeValue(context.listOfConfigs[valueLocator.configFieldId][valueLocator.index], valueLocator.locator, value);
                break; 
        }
        
    }
}

// type ConfigLayerV2<T extends IConfigDefinitionFields> = {
//     eventIds: IEventIds<T["fields"]>; 
// }

// type IEventIds<T extends IConfigDefinitionFields["fields"]> = {
//     [key in keyof T]: T[key] extends { type: "single" } 
//         ? (T[key]["fieldType"] extends { type: "event" } ? () => void : never)
//         : never; 
// }

interface IConfigLayer {
    setValue: (configFieldId: string, value: any) => Promise<void>; 
    executeEvent: (eventId: string) => Promise<void>; 
}

class ConfigLayer implements IConfigLayer{
    private eventIds: Set<string>; 
    readonly inputValues: {
            [id: string]: {
                variableType: IVariableType, 
                value?: any,
            }; // TODO: strongly type value? 
        }; 
    private outputValueTypes: {
            [id: string]: IContextVariableType;
        }
    // TODO ?? 
    public listOfConfigs: { [id: string]: ConfigLayer[] }; 

    constructor(inputValues: {
        [id: string]: {
            variableType: IVariableType, 
            value?: any,
        }; // TODO: strongly type;
    }, listOfConfigs: { [id: string]: ConfigLayer[] }, outputValueTypes: {
        [id: string]: IContextVariableType;
    }, eventIds: Set<string>) {
        this.inputValues = inputValues;
        this.listOfConfigs = listOfConfigs;
        this.outputValueTypes = outputValueTypes; 
        this.eventIds = eventIds;
    }

    public setValue(configFieldId: string, value: any): Promise<void> {
        if (this.outputValueTypes[configFieldId] == null) {
            return Promise.reject("Output field does not exist in config definition and cannot be set."); 
        } else if (this.outputValueTypes[configFieldId].type != value) { // check value type
            return Promise.reject(`${value} type cannot be set for output field ${configFieldId} which has type ${this.outputValueTypes[configFieldId].type}`);
        }
        this.sendMessageToWorkshop({
            type: MESSAGE_TYPES_TO_WORKSHOP.SETTING_VALUE,
            configFieldId, 
            value, 
        }); 
        return Promise.resolve(); 
    }

    public executeEvent(eventId: string): Promise<void> {
        if (!this.eventIds.has(eventId)) {
            return Promise.reject(`Event with id ${eventId} does not exist in config definition and cannot be executed.`);
        }
        this.sendMessageToWorkshop({
            type: MESSAGE_TYPES_TO_WORKSHOP.EXECUTING_EVENT, 
            eventId,
        })
        return Promise.resolve(); 
    }

    private sendMessageToWorkshop(message: IMessageToWorkshop) {
        window.postMessage(JSON.stringify(message), "*"); // TODO fix this
    }
}

type ConfigValue = IValue | ConfigLayer; 
interface IValue {
    type: "value"; 
    value: string | boolean | number; 
}
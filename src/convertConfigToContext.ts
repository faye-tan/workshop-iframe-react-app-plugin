import { IConfigDefinition } from "./types/configDefinition";
import { IAsyncStatus } from "./types/loadingState";
import { ILocator, MESSAGE_TYPES_TO_WORKSHOP } from "./types/messages";
import { IVariableType } from "./types/variableTypes";
import { IWorkshopContext, VariableTypeToValueType, SettableValue, ExecutableEvent } from "./types/workshopContext";
import { assertNever, sendMessageToWorkshop } from "./utils";

/**
 * Given the condig definition, convert it to a context object with the desired API for each field depending on the field type. 
 * - field type of "input" will get an async wrapped value.
 * - field type of "output" will get a callback to set a value in a variable in Workshop. 
 * - field type of "event" will get a callback to execute the event in Workshop.
 */
export function convertConfigToContext<T extends IConfigDefinition>(config: T, 
    opts?: { 
        createSetValueCallbackInList: (locator: ILocator) => void;
        createExecuteEventCallbackInList: (locator: ILocator) => void; 
    }): IWorkshopContext<T> {

    const createSetValueCallback = <T extends IVariableType>(valueLocator: ILocator) => (value: IAsyncStatus<VariableTypeToValueType<T>>) => {
        sendMessageToWorkshop({
            type: MESSAGE_TYPES_TO_WORKSHOP.SETTING_VALUE, 
            valueLocator,
            value,
        })
    };

    const createSetValueCallbackInList = (configFieldId: string, index: number) => (locator: ILocator) => {
        opts == null 
            ? createSetValueCallback({ type: "listOf", configFieldId, index, locator }) 
            : opts.createSetValueCallbackInList({ type: "listOf", configFieldId, index, locator });
    }

    const createExecuteEventCallback = (eventLocator: ILocator) => () => {
        sendMessageToWorkshop({
            type: MESSAGE_TYPES_TO_WORKSHOP.EXECUTING_EVENT, 
            eventLocator,
        })
    };

    const createExecuteEventCallbackInList = (configFieldId: string, index: number) => (locator: ILocator) => {
        opts == null 
            ? createExecuteEventCallback({ type: "listOf", configFieldId, index, locator }) 
            : opts.createExecuteEventCallbackInList({ type: "listOf", configFieldId, index, locator }); 
    }; 

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: { [key: string]: any } = {};
    
    config.forEach((fieldDefinition) => {
        const { fieldId, field } = fieldDefinition;
        switch (field.type) {
            case "single": 
                if (field.fieldType.type === "input") {
                    result[fieldId] = field.fieldType.value;
                } else if (field.fieldType.type === "output") {
                    result[fieldId] = { 
                        setValue: opts == null 
                            ? createSetValueCallback({ type: "single", configFieldId: fieldId }) 
                            : opts.createSetValueCallbackInList({ type: "single", configFieldId: fieldId }),
                    } as SettableValue<typeof field.fieldType.outputVariableType>;
                } else if (field.fieldType.type === "event") {
                    result[fieldId] = {
                        executeEvent: opts == null 
                            ? createExecuteEventCallback({ type: "single", configFieldId: fieldId })
                            : opts.createExecuteEventCallbackInList({ type: "single", configFieldId: fieldId }),
                    } as ExecutableEvent;
                }
                return; 
            case "listOf": 
                result[fieldId] = Array.from(Array(field.defaultLength), (_, index) => convertConfigToContext(field.config, {
                    createSetValueCallbackInList: createSetValueCallbackInList(fieldId, index),  
                    createExecuteEventCallbackInList: createExecuteEventCallbackInList(fieldId, index),  
                }));
                return; 
            default: 
                assertNever("Unknown config field type when converting config to context", field); 
        }
    });

    return result as IWorkshopContext<T>;
}
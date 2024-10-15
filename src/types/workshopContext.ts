import { IConfigDefinition, IConfigDefinitionField } from "./configDefinition";
import { IAsyncStatus } from "./loadingState";
import { IStructVariableFieldTypes_WithDefaultValue, IVariableType_WithDefaultValue } from "./variableTypeWithDefaultValue";
import { ObjectSetLocators, OntologyObject } from "./variableValues";

export interface ExecutableEvent {
    executeEvent: () => void;
}
export type ValueAndSetterMethods<T extends IVariableType_WithDefaultValue> = {
    fieldValue?: IAsyncStatus<VariableTypeToValueType<T>>;
    setLoadedValue: StronglyTypedSetterFunction<T>; 
    setLoading: () => void; 
    setReloadingValue: StronglyTypedSetterFunction<T>; 
    setFailedWithError: (error: string) => void; 
}

/**
 * Identical to VariableTypeToValueTypeToSet, except the value of an objectSet in the Wokrshop context is based on ObjectSetLocators.
 */
export type VariableTypeToValueType<T extends IVariableType_WithDefaultValue> = 
    T extends { type: "string" }
        ? string 
        : T extends { type: "boolean" }
            ? boolean
            : T extends { type: "number"}
                ? number 
                : T extends { type: "date" } | { type: "timestamp" }
                    ? Date
                    : T extends { type: "objectSet" }
                        ? ObjectSetLocators
                        : T extends { type: "string-list" }
                            ? string[]
                            : T extends { type: "boolean-list" }
                                ? boolean[]
                                : T extends { type: "number-list" }
                                    ? number[]
                                    : T extends { type: "date-list" } | { type: "timestamp-list" }
                                        ? Date[]
                                        : T extends { type: "struct", structFieldTypes: readonly IStructVariableFieldTypes_WithDefaultValue[] }
                                            ? { structFields: { [K in T['structFieldTypes'][number]['fieldId']]: VariableTypeToValueType<ExtractFieldType<T['structFieldTypes'], K>> | undefined } }
                                            : never; 

/**
 * Identical to VariableTypeToValueType, except the value of an objectSet to be set in Workshop consists of ObjectRids.
 */
export type VariableTypeToValueTypeToSet<T extends IVariableType_WithDefaultValue> = 
    T extends { type: "string" }
        ? string 
        : T extends { type: "boolean" }
            ? boolean
            : T extends { type: "number"}
                ? number 
                : T extends { type: "date" } | { type: "timestamp" }
                    ? Date
                    : T extends { type: "objectSet" }
                        ? OntologyObject[]
                        : T extends { type: "string-list" }
                            ? string[]
                            : T extends { type: "boolean-list" }
                                ? boolean[]
                                : T extends { type: "number-list" }
                                    ? number[]
                                    : T extends { type: "date-list" } | { type: "timestamp-list" }
                                        ? Date[]
                                        : T extends { type: "struct", structFieldTypes: readonly IStructVariableFieldTypes_WithDefaultValue[] }
                                            ? { structFields: { [K in T['structFieldTypes'][number]['fieldId']]: VariableTypeToValueTypeToSet<ExtractFieldType<T['structFieldTypes'], K>> | undefined } }
                                            : never; 
                        
export type ExtractFieldType<
        Fields extends readonly IStructVariableFieldTypes_WithDefaultValue[],
        FieldId extends string
    > = Fields extends readonly (infer F extends IStructVariableFieldTypes_WithDefaultValue)[]
        ? F extends { fieldId: FieldId }
            ? F["fieldType"]
            : never
        : never;

export type StronglyTypedSetterFunction<T extends IVariableType_WithDefaultValue> = (value: VariableTypeToValueTypeToSet<T> | undefined) => void; 

/**
 * The API consumers of useWorkshopContext have access to. 
 * - values: the input values Workshop sends 
 * - changeValue: a function to change an output value in Workshop
 * - executeEvent: a function to execute an event in Workshop
 */
export type IWorkshopContext<T extends IConfigDefinition> = {
    [K in T[number] as K["fieldId"]]: K["field"] extends { type: "single", fieldValue: { type: "inputOutput" } } 
        ? ValueAndSetterMethods<K["field"]["fieldValue"]["variableType"]>
        : K["field"] extends { type: "single", fieldValue: { type: "event" } }
            ? ExecutableEvent
            : K["field"] extends { type: "listOf"; config: readonly IConfigDefinitionField[] }
              ? IWorkshopContext<K["field"]["config"]>[]
              : never; 
};

/**
 * Valid types for IWorkshopContext
 */
export type IWorkshopContextField<T extends IConfigDefinition, V extends IVariableType_WithDefaultValue> = 
    ValueAndSetterMethods<V> | ExecutableEvent | IWorkshopContext<T>[]; 

import { IConfigDefinition, IConfigDefinitionField } from "./configDefinition";
import { IAsyncStatus } from "./loadingState";
import { IVariableType, IStructVariableFieldTypes } from "./variableTypes";

export interface ExecutableEvent {
    executeEvent: () => void;
}
export type SettableValue<T extends IVariableType> = {
    setValue: StronglyTypedSetterFunction<T>;
}

export type VariableTypeToValueType<T extends IVariableType> = T extends { type: "string" }
    ? string 
    : T extends { type: "boolean" }
        ? boolean
        : T extends { type: "number"}
            ? number 
            : T extends { type: "date" } | { type: "timestamp" }
                ? Date
                : T extends { type: "objectSet" }
                    ? { objectType: string; primaryKey: string; }
                    : T extends { type: "list" }
                        ? VariableTypeToValueType<T["valueType"]>[]
                        : T extends { type: "struct", structFieldTypes: readonly IStructVariableFieldTypes[] }
                            ? { structFields: { [K in T['structFieldTypes'][number]['fieldId']]: VariableTypeToValueType<ExtractFieldType<T['structFieldTypes'], K>> | undefined } }
                            : never; 
                        
export type ExtractFieldType<
        Fields extends readonly IStructVariableFieldTypes[],
        FieldId extends string
    > = Fields extends readonly (infer F extends IStructVariableFieldTypes)[]
        ? F extends { fieldId: FieldId }
            ? F["fieldType"]
            : never
        : never;

export type StronglyTypedSetterFunction<T extends IVariableType> = (value: IAsyncStatus<VariableTypeToValueType<T> | undefined>) => void; 

/**
 * The API consumers of useWorkshopContext have access to. 
 * - values: the input values Workshop sends 
 * - changeValue: a function to change an output value in Workshop
 * - executeEvent: a function to execute an event in Workshop
 */
export type IWorkshopContext<T extends IConfigDefinition> = {
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
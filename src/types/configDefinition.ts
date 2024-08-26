/**
 * Copyright 2024 Palantir Technologies, Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { isBoolean, isDate, isNumber, isString } from "lodash-es";
import { IContextVariableType } from "./contextVariable";

export interface IConfigDefinitionFields {
    fields: { [id: string]: IConfigDefinitionField };
}

export declare type IConfigDefinitionField =
    | IConfigDefinitionField_Single
    | IConfigDefinitionField_ListOf;

export interface IConfigDefinitionField_Single {
    type: "single";
    isRequired?: boolean;
    fieldType: IConfigDefinitionFieldType;
    label: string;
    helperText?: string;
}

export interface IConfigDefinitionField_ListOf {
    type: "listOf";
    config: IConfigDefinitionFields["fields"];
    label: string;
    helperText?: string;
    addButtonText?: string;
    maxLength: number;
}

export type IConfigDefinitionFieldType =
    | IConfigDefinitionFieldType_Input
    | IConfigDefinitionFieldType_Output
    | IConfigDefinitionFieldType_Event;

export interface IConfigDefinitionFieldType_Input {
    type: "input";
    inputVariable: IVariableValue<"with-default">;
}

export interface IConfigDefinitionFieldType_Output {
    type: "output";
    outputVariable: IVariableValue<"type-only">;
}

export interface IConfigDefinitionFieldType_Event {
    type: "event";
}

export type IVariableValue<T extends "with-default" | "with-value" | "type-only"> = 
    | IVariableValue_String<T>
    | IVariableValue_Boolean<T>
    | IVariableValue_Number<T>
    | IVariableValue_Date<T>
    | IVariableValue_Timestamp<T>
    | IVariableValue_StringArray<T>
    | IVariableValue_BooleanArray<T>
    | IVariableValue_NumberArray<T>
    | IVariableValue_DateArray<T>
    | IVariableValue_TimestampArray<T>
    | IVariableValue_Struct<T>
    | IVariableValue_ObjectSet<T>; 
export type IVariableValue_String<T extends "with-default" | "with-value" | "type-only"> = 
    T extends "with-default"
        ? { variableType: IVariableType_String, defaultValue?: string }
        : T extends "with-value" 
            ? { variableType: IVariableType_String, value?: string }
            : { variableType: IVariableType_String }; 
export type IVariableValue_Boolean<T extends "with-default" | "with-value" | "type-only"> = 
    T extends "with-default"
        ? { variableType: IVariableType_Boolean, defaultValue?: boolean }
        : T extends "with-value"  
            ? { variableType: IVariableType_Boolean, value?: boolean }
            : { variableType: IVariableType_Boolean }; 
export type IVariableValue_Number<T extends "with-default" | "with-value" | "type-only"> = 
    T extends "with-default"
        ? { variableType: IVariableType_Number, defaultValue?: number }
        : T extends "with-value" 
            ? { variableType: IVariableType_Number, value?: number }
            : { variableType: IVariableType_Number } 
export type IVariableValue_Date<T extends "with-default" | "with-value" | "type-only"> = 
    T extends "with-default"
        ? { variableType: IVariableType_Date, defaultValue?: Date }
        : T extends "with-value" 
            ? { variableType: IVariableType_Date, value?: Date }
            : { variableType: IVariableType_Date }
export type IVariableValue_Timestamp<T extends "with-default" | "with-value" | "type-only"> = 
    T extends "with-default"
        ? { variableType: IVariableType_Timestamp, defaultValue?: Date }
        : T extends "with-value"    
            ? { variableType: IVariableType_Timestamp, value?: Date }
            : { variableType: IVariableType_Timestamp }; 
export type IVariableValue_StringArray<T extends "with-default" | "with-value" | "type-only"> = 
T extends "with-default"
    ? { variableType: { type: "array"; arraySubType: IVariableType_String }, defaultValue?: string[] }
    : T extends "with-value" 
        ? { variableType: { type: "array"; arraySubType: IVariableType_String }, value?: string[] }
        : { variableType: { type: "array"; arraySubType: IVariableType_String } }; 
export type IVariableValue_BooleanArray<T extends "with-default" | "with-value" | "type-only"> = 
T extends "with-default"
    ? { variableType: { type: "array"; arraySubType: IVariableType_Boolean }, defaultValue?: boolean[] }
    : T extends "with-value"  
        ? { variableType: { type: "array"; arraySubType: IVariableType_Boolean }, value?: boolean[] }
        : { variableType: { type: "array"; arraySubType: IVariableType_Boolean } }; 
export type IVariableValue_NumberArray<T extends "with-default" | "with-value" | "type-only"> = 
T extends "with-default"
    ? { variableType: { type: "array"; arraySubType: IVariableType_Number }, defaultValue?: number[] }
    : T extends "with-value" 
        ? { variableType: { type: "array"; arraySubType: IVariableType_Number }, value?: number[] }
        : { variableType: { type: "array"; arraySubType: IVariableType_Number } } 
export type IVariableValue_DateArray<T extends "with-default" | "with-value" | "type-only"> = 
T extends "with-default"
    ? { variableType: { type: "array"; arraySubType: IVariableType_Date }, defaultValue?: Date[] }
    : T extends "with-value" 
        ? { variableType: { type: "array"; arraySubType: IVariableType_Date }, value?: Date[] }
        : { variableType: { type: "array"; arraySubType: IVariableType_Date } }
export type IVariableValue_TimestampArray<T extends "with-default" | "with-value" | "type-only"> = 
T extends "with-default"
    ? { variableType: { type: "array"; arraySubType: IVariableType_Timestamp }, defaultValue?: Date[] }
    : T extends "with-value"    
        ? { variableType: { type: "array"; arraySubType: IVariableType_Timestamp }, value?: Date[] }
        : { variableType: { type: "array"; arraySubType: IVariableType_Timestamp } }; 
export type IVariableValue_Struct<T extends "with-default" | "with-value" | "type-only"> = 
T extends "with-default"
    ? { variableType: IVariableType_Struct, defaultValue?: {[fieldId: string]: IVariableValue<T>; }  }
    : T extends "with-value"    
        ? { variableType: IVariableType_Struct, value?: {[fieldId: string]: IVariableValue<T> } }
        : { variableType: IVariableType_Struct }; 
export type IVariableValue_ObjectSet<T extends "with-default" | "with-value" | "type-only"> = 
T extends "with-default"
    ? { variableType: IVariableType_ObjectSet, defaultValue?: {
        objectType: string;
        objectRid: string; 
    }  }
    : T extends "with-value"    
        ? { variableType: IVariableType_ObjectSet, value?: {
            objectType: string;
            objectRid: string; 
        } }
        : { variableType: IVariableType_ObjectSet }; 


// export type IInputVariable = 
//     | IInputVariableType_String
//     | IInputVariableType_Boolean
//     | IInputVariableType_Number
//     | IInputVariableType_Date
//     | IInputVariableType_Timestamp
//     | IInputVariableType_StringArray
//     | IInputVariableType_BooleanArray
//     | IInputVariableType_NumberArray
//     | IInputVariableType_DateArray
//     | IInputVariableType_TimestampArray
//     | IInputVariableType_Struct
//     | IInputVariableType_ObjectSet;
// export type IInputStructVariables = 
//     | IInputVariableType_String
//     | IInputVariableType_Boolean
//     | IInputVariableType_Number
//     | IInputVariableType_Date
//     | IInputVariableType_Timestamp
//     | IInputVariableType_StringArray
//     | IInputVariableType_BooleanArray
//     | IInputVariableType_NumberArray
//     | IInputVariableType_DateArray
//     | IInputVariableType_TimestampArray
//     | IInputVariableType_ObjectSet;

// interface IInputVariableType_String {
//     variableType: IVariableType_String;
//     defaultValue?: string;
// }
// interface IInputVariableType_Boolean {
//     variableType: IVariableType_Boolean;
//     defaultValue?: boolean;
// }
// interface IInputVariableType_Number {
//     variableType: IVariableType_Number;
//     defaultValue?: number;
// }
// interface IInputVariableType_Date {
//     variableType: IVariableType_Date;
//     defaultValue?: Date;
// }
// interface IInputVariableType_Timestamp {
//     variableType: IVariableType_Timestamp; 
//     defaultValue?: Date; 
// }
// interface IInputVariableType_StringArray {
//     variableType: IVariableType_Array; 
//     defaultValue?: string[]; 
// }
// interface IInputVariableType_BooleanArray {
//     variableType: IVariableType_Array; 
//     defaultValue?: boolean[]; 
// }
// interface IInputVariableType_NumberArray {
//     variableType: IVariableType_Array; 
//     defaultValue?: number[];
// }
// interface IInputVariableType_DateArray {
//     variableType: IVariableType_Array; 
//     defaultValue?: Date[];
// }
// interface IInputVariableType_TimestampArray {
//     variableType: IVariableType_Array; 
//     defaultValue?: Date[];
// }
// interface IInputVariableType_Struct {
//     variableType: IVariableType_Struct; 
//     defaultValue?: IStructValue;
// }
// interface IInputVariableType_ObjectSet {
//     variableType: IVariableType_ObjectSet;
//     defaultValue?: {
//         objectType: string;
//         objectRid: string; 
//     }
// }

// export interface IStructValue {
//     structFields: { [structFieldId: string]: IInputStructVariables }; 
// }

export function isStruct(structType: IVariableType_Struct, value?: any): value is IVariableValue_Struct<"with-value">["value"] {
    if (value != null && value["structFields"] != null && typeof value["structFields"] === "object") {
        return Object.entries(value["structFields"]).every(([structFieldId, structFieldValue]) => {
            if (!isString(structFieldId)) {
                return false 
            }
            const structTypeField = structType.structFieldTypes.find(structTypeField => structTypeField.fieldId === structFieldId); 
            if (structTypeField != null) {
                return isValueOfVariableType(structTypeField.fieldType, structFieldValue);
            }
            return true; 
        });
    } 
    return false; 
}

export function isValueOfVariableType(variableType: IVariableType, value?: any): boolean {
    switch (variableType.type) {
        case "string": 
            return isString(value);
        case "boolean": 
            return isBoolean(value);
        case "number": 
            return isNumber(value);
        case "date": 
            return isDate(value);
        case "timestamp": 
            return isDate(value);
        case "array": 
            if (Array.isArray(value)) {
                return value.every(val => isValueOfVariableType(variableType.arraySubType, val));
            }   
            return false; 
        case "struct": 
            return isStruct(variableType, value); 
        case "objectSet":
            return typeof value === "object" && isString(value["objectTypeId"]) && isString(value["objectRid"]);  
    }
}

export type IInputDefaultValue<T extends IContextVariableType> = 
    T extends { type: "string" }
        ? string
        : T extends { type: "boolean" }
            ? boolean
            : T extends { type: "array", arraySubType: { type: "string" } }
                ? string[]
                : never; 

export type IVariableType =
    | IVariableType_String
    | IVariableType_Boolean
    | IVariableType_Number
    | IVariableType_Date
    | IVariableType_Timestamp
    | IVariableType_Array
    | IVariableType_Struct
    | IVariableType_ObjectSet;

// Workshop only supports arrays containing the following types
export type IArrayVariableSubType =
    | IVariableType_String
    | IVariableType_Boolean
    | IVariableType_Number
    | IVariableType_Date
    | IVariableType_Timestamp;


// Workshop only supports struct fields containing the following types
export type IStructVariableFieldType =
    | IVariableType_String
    | IVariableType_Boolean
    | IVariableType_Number
    | IVariableType_Date
    | IVariableType_Timestamp
    | IVariableType_Array
    | IVariableType_ObjectSet;

export interface IVariableType_String {
    type: "string";
}

export interface IVariableType_Boolean {
    type: "boolean";
}

export interface IVariableType_Number {
    type: "number";
}

export interface IVariableType_Date {
    type: "date";
}

export interface IVariableType_Timestamp {
    type: "timestamp";
}

export interface IVariableType_Array {
    type: "array";
    arraySubType: IArrayVariableSubType;
}

export interface IVariableType_Struct {
    type: "struct";
    structFieldTypes: IStructVariableFieldTypes[];
}

export interface IStructVariableFieldTypes {
    fieldId: string;
    fieldType: IStructVariableFieldType;
}

export interface IVariableType_ObjectSet {
    type: "objectSet";
}

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
import { 
    IVariableType_String, 
    IVariableType_Boolean, 
    IVariableType_Number, 
    IVariableType_Date, 
    IVariableType_Timestamp, 
    IVariableType_Struct, 
    IVariableType_ObjectSet, 
} from "./variableTypes";

interface ObjectSet {
    objectType: string;
    objectRid: string; 
}

type SingleVariableValue =
    | boolean
    | number
    | string
    | Date
    | ObjectSet
    | StructValue;
export type VariableValue = SingleVariableValue | SingleVariableValue[];
export interface StructValue {
    structFields: { [structFieldId: string]: VariableValue };
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
    ? { variableType: IVariableType_Struct, defaultValue?: StructValue  }
    : T extends "with-value"    
        ? { variableType: IVariableType_Struct, value?: StructValue }
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
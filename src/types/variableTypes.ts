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

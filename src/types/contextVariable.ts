import {
    isBoolean,
    isDate,
    isNumber,
    isString, 
} from "lodash-es";

interface IObjectSet {
    objectType: string;
    objectRid: string; 
}

type ISingleEvaluatedValueType =
    | boolean
    | number
    | string
    | Date
    | IObjectSet
    | IStructValue;
export type IEvaluatedValueType = ISingleEvaluatedValueType | ISingleEvaluatedValueType[];
export interface IStructValue {
    structFields: { [structFieldId: string]: ISingleEvaluatedValueType };
}

export type IContextVariableValue<T extends IContextVariableType> = 
    T extends IContextVariableType_String
        ? { type: T["type"], value: string; }
        : T extends IContextVariableType_Boolean
            ? { type: T["type"], value: boolean }
            : T extends IContextVariableType_Number
                ? { type: T["type"], value: number }
                : T extends IContextVariableType_Array
                    ? IContextArrayValue<IContextVariableType_Array>
                    : T extends IContextVariableType_Struct
                        ? { type: T["type"], value: IStructValue } 
                        : never;  

export type IContextArrayValue<T extends IContextVariableType_Array> = 
    T["arraySubType"] extends IContextVariableType_String
        ? { type: T["type"], arraySubType: T["arraySubType"], value: string[] }
        : T["arraySubType"] extends IContextVariableType_Boolean 
            ? { type: T["type"], arraySubType: T["arraySubType"], value: boolean[] }
            : never;

// All variable types
export type IContextVariableType =
    | IContextVariableType_String
    | IContextVariableType_Boolean
    | IContextVariableType_Number
    | IContextVariableType_Date
    | IContextVariableType_Timestamp
    | IContextVariableType_Array
    | IContextVariableType_Struct
    | IContextVariableType_ObjectSet;

// Workshop only supports arrays containing the following types
export type IContextVariableType_ArraySubtype =
    | IContextVariableType_String
    | IContextVariableType_Boolean
    | IContextVariableType_Number
    | IContextVariableType_Date
    | IContextVariableType_Timestamp;


// Workshop only supports struct fields containing the following types
export type IContextVariableType_StructFieldType =
    | IContextVariableType_String
    | IContextVariableType_Boolean
    | IContextVariableType_Number
    | IContextVariableType_Date
    | IContextVariableType_Timestamp
    | IContextVariableType_Array
    | IContextVariableType_ObjectSet;

export interface IContextVariableType_String {
    type: "string";
}

export interface IContextVariableType_Boolean {
    type: "boolean";
}

export interface IContextVariableType_Number {
    type: "number";
}

export interface IContextVariableType_Date {
    type: "date";
}

export interface IContextVariableType_Timestamp {
    type: "timestamp";
}

export interface IContextVariableType_Array {
    type: "array";
    arraySubType: IContextVariableType_ArraySubtype;
    
}

export interface IContextVariableType_Struct {
    type: "struct";
    structFieldTypes: IStructVariableFields[];
}

export interface IStructVariableFields {
    fieldId: string;
    fieldType: IContextVariableType_StructFieldType;
}

export interface IContextVariableType_ObjectSet {
    type: "objectSet";
}

export function isValueString(val: any) {
    return isString(val); 
}

export function isValueBoolean(val: any) {
    return isBoolean(val); 
}

export function isValueNumber(val: any) {
    return isNumber(val); 
}

export function isValueDate(val: any) {
    return isDate(val);
}


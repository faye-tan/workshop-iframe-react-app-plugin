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
import { isString, isBoolean, isNumber, isDate } from "lodash-es";
import { IMessageToWorkshop } from "./types/messages";
import { IVariableType_Struct, IVariableType } from "./types/variableTypes";
import { StructValue, VariableValue } from "./types/variableValues";

/**
 * Sends a message to Workshop through the window. 
 */
export function sendMessageToWorkshop(message: IMessageToWorkshop) {
    window.postMessage(JSON.stringify(message), "*");
}

/**
 * Return true only if the value can be resolved to StructValue
 */
export function isStruct(structType: IVariableType_Struct, value?: VariableValue): value is StructValue {
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

/**
 * Returns true only if the type of value is of the variableType provided.
 */
export function isValueOfVariableType(variableType: IVariableType, value?: any): boolean {
    if (value == null) {
        return true;
    }
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
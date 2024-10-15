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
import { IVariableType_WithDefaultValue } from "./variableTypeWithDefaultValue";

export type IConfigDefinition = readonly IConfigDefinitionField[];
export interface IConfigDefinitionField {
    fieldId: string; 
    field: IConfigurationFieldType; 
}
export type IConfigurationFieldType = IConfigDefinitionFieldType_Single | IConfigDefinitionFieldType_ListOf;

interface IConfigDefinitionFieldType_Single {
    type: "single"; 
    fieldValue: IConfigDefinitionFieldType; 
    label: string; 
    helperText?: string; 
}

export type IConfigDefinitionFieldType = IConfigDefinitionFieldType_InputOutput | IConfigDefinitionFieldType_Event; 
interface IConfigDefinitionFieldType_InputOutput {
    type: "inputOutput"; 
    variableType: IVariableType_WithDefaultValue;
}
interface IConfigDefinitionFieldType_Event {
    type: "event"; 
}

interface IConfigDefinitionFieldType_ListOf {
    type: "listOf";
    config: IConfigDefinition;
    label: string; 
    helperText?: string; 
    addButtonText?: string;
}
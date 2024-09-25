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

import { IVariableType } from "./variableTypes";
import { IVariableValue } from "./variableValues";

export type IConfigDefinition = readonly IConfigDefinitionField[];
export interface IConfigDefinitionField {
    fieldId: string; 
    field: IConfigurationFieldType; 
}
export type IConfigurationFieldType = IConfigDefinitionFieldType_Single | IConfigDefinitionFieldType_ListOf;

interface IConfigDefinitionFieldType_Single {
    type: "single"; 
    isRequired?: boolean; 
    fieldType: IConfigDefinitionFieldType; 
    label: string; 
    helperText?: string; 
}

type IConfigDefinitionFieldType = IConfigDefinitionFieldType_Input | IConfigDefinitionFieldType_Output | IConfigDefinitionFieldType_Event; 
interface IConfigDefinitionFieldType_Input {
    type: "input"; 
    inputVariableType: IVariableType;
    /** Set the default value for an input variable */
    value?: IVariableValue;
}
interface IConfigDefinitionFieldType_Output {
    type: "output"; 
    outputVariableType: IVariableType; 
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
    defaultLength?: number; 
}

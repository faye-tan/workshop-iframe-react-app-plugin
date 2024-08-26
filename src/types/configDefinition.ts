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
import { IVariableValue } from "./variableValues";

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
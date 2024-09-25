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

import { IConfigDefinition } from "./configDefinition";
import { IAsyncStatus } from "./loadingState";
import { IVariableValue } from "./variableValues";

/**
 * Messages to send to Workshop.
 */
export type IMessageToWorkshop = 
    ISendConfigToWorkshopMessage | 
    ISetWorkshopValue | 
    IExecuteWorkshopEvent;

/**
 * Sends the config to Workshop 
 */
export interface ISendConfigToWorkshopMessage {
    type: MESSAGE_TYPES_TO_WORKSHOP.SENDING_CONFIG;  
    config: IConfigDefinition;
}

/**
 * Sets an output config field's value in Workshop. 
 * Value type checking occurs before this message is sent to verify that the value is the exepcted type. 
 */
export interface ISetWorkshopValue {
    type: MESSAGE_TYPES_TO_WORKSHOP.SETTING_VALUE; 
    valueLocator: ILocator; 
    value: IAsyncStatus<IVariableValue>; 
}

/**
 * Executes an event in Workshop.
 */
export interface IExecuteWorkshopEvent {
    type: MESSAGE_TYPES_TO_WORKSHOP.EXECUTING_EVENT;
    eventLocator: ILocator; 
}

/**
 * Messages that can be recieved from Workshop 
 */
export type IMessageFromWorkshop = 
    IWorkshopAcceptedConfigMessage | 
    IWorkshopRejectedConfigMessage |
    IValueChangeFromWorkshopMessage;

/**
 * Workshop has accepted the config. 
 */
export interface IWorkshopAcceptedConfigMessage {
    type: MESSAGE_TYPES_FROM_WORKSHOP.CONFIG_ACCEPTED; 
    initialConfigValues: IConfigDefinition;
}

/**
 * Workshop has rejected the config. This occurs when there is a break in the API, and the Workshop iframe widget's saved config fields 
 * do not match with what was sent by the iframed React app. 
 */
export interface IWorkshopRejectedConfigMessage {
    type: MESSAGE_TYPES_FROM_WORKSHOP.CONFIG_REJECTED; 
}
        
/**
 * Workshop is alerting that an input value has changed. 
 * Value type checking occurs before the value change actually takes effect and the value is saved. 
 */
export interface IValueChangeFromWorkshopMessage {
    type: MESSAGE_TYPES_FROM_WORKSHOP.VALUE_CHANGE; 
    configValues: IConfigDefinition;
}

export enum MESSAGE_TYPES_TO_WORKSHOP {
    SENDING_CONFIG = "react-app-sending-config", 
    SETTING_VALUE = "react-app-setting-value",
    EXECUTING_EVENT = "react-app-executing-event",  
}
    
export enum MESSAGE_TYPES_FROM_WORKSHOP {
    CONFIG_ACCEPTED = "workshop-accepted-config",
    CONFIG_REJECTED = "workshop-did-not-accept-config",
    VALUE_CHANGE = "workshop-value-change", 
}

/**
 * Represents the path to a value in the config
 */
export type ILocator = ILocator_Single | ILocator_ListOf;
export interface ILocator_Single {
    type: "single";
    configFieldId: string;
}
/**
 * Traverses tho the configFieldId which should be a listOf, and then indexes into it and continues traversing along the path to the value.
 */
export interface ILocator_ListOf {
    type: "listOf";
    configFieldId: string;
    index: number;
    locator: ILocator;
}

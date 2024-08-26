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

import { IConfigDefinitionFields } from "./configDefinition";

/**
 * Messages to send to Workshop.
 */
export type IMessageToWorkshop = 
    ISendingConfigToWorkshopMessage | 
    ISettingWorkshopValue | 
    IExecutingWorkshopEvent;

/**
 * Sends the config to Workshop 
 */
export interface ISendingConfigToWorkshopMessage {
    type: MESSAGE_TYPES_TO_WORKSHOP.SENDING_CONFIG;  
    config: IConfigDefinitionFields;
}

export interface ISettingWorkshopValue {
    type: MESSAGE_TYPES_TO_WORKSHOP.SETTING_VALUE; 
    configFieldId: string; 
    value: any; // Value is type checked in method 
}

export interface IExecutingWorkshopEvent {
    type: MESSAGE_TYPES_TO_WORKSHOP.EXECUTING_EVENT;
    eventId: string; 
}

/**
 * Messages that can be recieved from Workshop 
 */
export type IMessageFromWorkshop = 
    IWorkshopReceivedConfigMessage | 
    IValueChangeFromWorkshopMessage;
export interface IWorkshopReceivedConfigMessage {
    type: MESSAGE_TYPES_FROM_WORKSHOP.CONFIG_RECIEVED; 
}
        
export interface IValueChangeFromWorkshopMessage {
    type: MESSAGE_TYPES_FROM_WORKSHOP.VALUE_CHANGE; 
    valueLocator: ValueLocator; 
    value: any; // Value is type checked in method
}

/**
 * Represents the path to a value in the config
 */
export type ValueLocator = IValueLocator_Single | IValueLocator_ListOf; 
export interface IValueLocator_Single {
    type: "single"; 
    configFieldId: string; 
}
/**
 * Traverses tho the configFieldId which should be a listOf, and then indexes into it and continues traversing along the path to the value. 
 */
export interface IValueLocator_ListOf {
    type: "listOf"; 
    configFieldId: string; 
    index: number; 
    locator: ValueLocator;
}

export enum MESSAGE_TYPES_TO_WORKSHOP {
    SENDING_CONFIG = "react-app-sending-config", 
    SETTING_VALUE = "react-app-setting-value",
    EXECUTING_EVENT = "react-app-executing-event",  
}
    
export enum MESSAGE_TYPES_FROM_WORKSHOP {
    CONFIG_RECIEVED = "workshop-received-config",
    VALUE_CHANGE = "workshop-value-change", 
}

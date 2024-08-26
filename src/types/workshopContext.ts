// import { IConfigDefinitionField, IConfigDefinitionField_ListOf, IConfigDefinitionField_Single, IConfigDefinitionFields, IVariableType } from "./configDefinition";
// import { IAsyncStatus } from "./loadingState";
// import { IMessageToWorkshop, MESSAGE_TYPES_TO_WORKSHOP } from "./messages";

// /**
//  * The context is based off the config definition provided. 
//  */
// export type IWorkshopContext<T extends IConfigDefinitionFields["fields"]> = {
//     [key in keyof T]: IWorkshopResource<T[key]>; 
// }

// export type IWorkshopResource<T extends IConfigDefinitionField> = 
//     T extends IConfigDefinitionField_Single
//         ? { type: "single", single: IWorkshopInteraction<T> }
//         : T extends IConfigDefinitionField_ListOf
//             ? { type: "listOf", listOf: IListOfWorkshopInteractions<T>[] }
//             : never; 

// // TODO: check this
// export type IListOfWorkshopInteractions<T extends IConfigDefinitionField_ListOf> = {
//     type: "listOf"; 
//     config: { [key in keyof T["config"]]: IWorkshopResource<T["config"][key]> };
// }

// export type IWorkshopInteraction<T extends IConfigDefinitionField_Single> = 
//     T extends { type: "input" }
//         ? IWorkshopValue<T["inputVariableType"]> 
//         : T extends { type: "output" }
//             ? IWorkshopSetter<T["outputVariableType"]> 
//             : T extends { type: "event" }
//                 ? IWorkshopEventExecutor
//                 : never; 

// export interface IWorkshopValue<T extends IVariableType> {
//     type: "value"; 
//     variableType: T; 
//     value: IAsyncStatus<IVariableValue<T> | undefined>; 
// }

// export interface IWorkshopSetter<T extends IVariableType> {
//     type: "setter"; 
//     variableType: T; 
//     set: (value: IVariableValue<T>) => void; 
// }

// export interface IWorkshopEventExecutor {
//     type: "event"; 
//     executeEvent: () => void; 
// }

// export type IVariableValue<T extends IVariableType> = 
//     T extends { type: "string" } 
//         ? { value: string }
//         : T extends { type: "number" }
//             ? { value: number }
//             : T extends { type: "date" }
//                 ? { value: Date }
//                 : T extends { type: "timestamp" }
//                     ? { value: Date }
//                     : never;  // TODO complete this


// interface IEventCallback {
//     [eventId: string]: IEvent; 
// }
// type IEvent = ICallableEvent | IEventCallback; 
// interface ICallableEvent {
//     type: "event"; 
// }


// interface IWorkshopContextValues {
//     [id: string]: IWorkshopContextValue; 
// }

// type IWorkshopContextValue = ISingleValue | IListOfValue; 
// interface ISingleValue {
//     type: "single-value"; 
//     value: 
// }
// interface IListOfValue {
//     type: "list-of-values"; 
//     valuesList: { [id: string]: IWorkshopContextValue}[];  
// }

// // export class WorkshopContext {
// //     private configDefinition: IConfigDefinitionFields; 
// //     // Set of callable event ids 
// //     private eventsContext: Set<string>; 
// //     public values: IWorkshopContextValues; 
// //     // Layered configs 
// //     private configLayers: { [layerId: string]: WorkshopContext };  

// //     constructor(configDefinition: IConfigDefinitionFields) {
// //         this.configDefinition = configDefinition; 
// //         this.eventsContext = new Set<string>(); 
// //     }

// //     private initialize() {
// //         Object.entries(this.configDefinition.fields).forEach(([fieldId, field]) => {
// //             switch (field.type) {
// //                 case "single": 
// //                     switch (field.fieldType.type) {
// //                         // Set default values 
// //                         case "input": 
// //                             this.values[fieldId] = 
                        
// //                         // Add to context for type checking when setting values
// //                         case "output": 

// //                         // Add to context for checking eventIds
// //                         case "event": 
// //                     }
// //                 case "listOf":
// //                     field.config
// //             }
// //         }); 
// //     }

// //     /**
// //      * 
// //      */
// //     public setValue(configFieldId: string, value: any) {
// //         this.sendMessageToWorkshop({
// //             type: MESSAGE_TYPES_TO_WORKSHOP.SETTING_VALUE,
// //             configFieldId, 
// //             value, 
// //         }); 
// //     }

// //     /**
// //      * 
// //      */
// //     public executeEvent(eventId: string): Promise<undefined> {
// //         if (!this.eventsContext.has(eventId)) {
// //             return Promise.reject(); 
// //         }
// //         this.sendMessageToWorkshop({
// //             type: MESSAGE_TYPES_TO_WORKSHOP.EXECUTING_EVENT, 
// //             eventId,
// //         }); 
// //         return Promise.resolve(undefined);
// //     }

// //     private sendMessageToWorkshop(message: IMessageToWorkshop) {
// //         window.postMessage(JSON.stringify(message), "*"); // TODO fix this
// //     }
// // }

// const test = new WorkshopContext({ fields: {} }); 
// const val = test.values["test"]; 
export {};
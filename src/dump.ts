// /**
//  * Returns true only if the type of value is of the variableType provided.
//  */
// export function isValueOfVariableType(variableType: IVariableType, value?: any): boolean {
//     if (value == null) {
//         return true;
//     }
//     switch (variableType.type) {
//         case "string": 
//             return isString(value);
//         case "boolean": 
//             return isBoolean(value);
//         case "number": 
//             return isNumber(value);
//         case "date": 
//             return isDate(value);
//         case "timestamp": 
//             return isDate(value);
//         case "array": 
//             if (Array.isArray(value)) {
//                 return value.every(val => isValueOfVariableType(variableType.arraySubType, val));
//             }   
//             return false; 
//         case "struct": 
//             return isStruct(variableType, value); 
//         case "objectSet":
//             return typeof value === "object" && isString(value["objectTypeId"]) && isString(value["objectRid"]);  
//     }
// }
// 
// /**
//  * Return true only if the value can be resolved to StructValue
//  */
// export function isStruct(structType: IVariableType_Struct, value?: IVariableValue): value is StructValue {
//     if (value != null && typeof value === "object" && value["structFields"] != null) {
//         return Object.entries(value["structFields"]).every(([structFieldId, structFieldValue]) => {
//             if (!isString(structFieldId)) {
//                 return false 
//             }
//             const structTypeField = structType.structFieldTypes.find(structTypeField => structTypeField.fieldId === structFieldId); 
//             if (structTypeField != null) {
//                 return isValueOfVariableType(structTypeField.fieldType, structFieldValue);
//             }
//             return true; 
//         });
//     } 
//     return false; 
// }


// /**
//  * Represents the path to a value in the config
//  */
// export type ValueLocator = IValueLocator_Single | IValueLocator_ListOf; 
// export interface IValueLocator_Single {
//     type: "single"; 
//     configFieldId: string; 
// }
// /**
//  * Traverses tho the configFieldId which should be a listOf, and then indexes into it and continues traversing along the path to the value. 
//  */
// export interface IValueLocator_ListOf {
//     type: "listOf"; 
//     configFieldId: string; 
//     index: number; 
//     locator: ValueLocator;
// }

// /**
//  * Returns a WorkshopContext in an async wrapper, which when is loaded can be used to reference input values, set output values, and execute events in Workshop. 
//  */
// export function useWorkshopContext(configFields: IConfigDefinition) {
//     const [isListenerInitialized, setIsListenerInitialized] = React.useState<boolean>(false);
//     const [workshopReceivedConfig, setWorkshopReceivedConfig] = React.useState<boolean>(false);
//     const [isConfigRejectedByWorkshop, setIsConfigRejectedByWorkshop] = React.useState<boolean>(false);
//     const [workshopContext, setWorkshopContext] = React.useState(makeConfigWorkshopContext(configFields)); 

//     // Once on mount, initialize listeners
//     React.useEffect(() => {
//         sendConfigDefinitionToWorkshop(configFields);  // TODO(ftan) what if configFields input changes? I feel like they should not be dynamically changing the configFields so that's fine. 
//         initializeListeners();
//     }, []);

//     /**
//      * Pass the config definition to Workshop
//      * If it's on a brand new iframe widget, the definition gets saved
//      * If it's on an existing iframe widget, the definition gets reconciled with the saved definition. 
//      */
//     const sendConfigDefinitionToWorkshop = (configFields: IConfigDefinition) => {
//         sendMessageToWorkshop({
//             type: MESSAGE_TYPES_TO_WORKSHOP.SENDING_CONFIG, 
//             config: configFields, 
//         })
//     } 

//     const initializeListeners = () => {
//         if (isListenerInitialized) {
//             return; 
//         }
//         window.addEventListener("message", messageHandler);
//         setIsListenerInitialized(true);
//     }

//     /** 
//      * Handles each type of message received from Workshop.
//      */
//     const messageHandler = (event: MessageEvent<IMessageFromWorkshop>) => {
//         // TODO(ftan): check origin that it is parent 
//         const message = event.data;
//         switch (message.type) {
//             case MESSAGE_TYPES_FROM_WORKSHOP.CONFIG_ACCEPTED: 
//                 handleWorkshopAcceptedConfigMessage(); 
//                 return;
//             case MESSAGE_TYPES_FROM_WORKSHOP.CONFIG_REJECTED: 
//                 handleWorkshopRejectedConfigMessage(); 
//                 return;
//             case MESSAGE_TYPES_FROM_WORKSHOP.VALUE_CHANGE: 
//                 setInputValue(message.valueLocator, message.value); 
//                 return; 
//         }

//     }

//     /**
//      * Only receives a message of type IWorkshopAcceptedConfigMessage, and once received, fills in values, outputTypes, eventIds with given values. 
//      */
//     const handleWorkshopAcceptedConfigMessage = () => {
//         setWorkshopReceivedConfig(true);
//     }

//     const handleWorkshopRejectedConfigMessage = () => {
//         setIsConfigRejectedByWorkshop(true); 
//     }

//     // const setInputValue = (valueLocator: ValueLocator, value: IAsyncStatus<IVariableValue | undefined>): Promise<void> => {
//     //     return setInputValueOnLayer(inputValues, valueLocator, value);
//     // }
//     // const setInputValueOnLayer = (layerOfValues: { [id: string]: WorkshopContextValue }, valueLocator: ValueLocator, value: IAsyncStatus<IVariableValue | undefined>): Promise<void> => {
//     //     switch (valueLocator.type) {
//     //         case "single": {
//     //             if (layerOfValues[valueLocator.configFieldId] != null) {
//     //                 const inputField = layerOfValues[valueLocator.configFieldId];
//     //                 if (inputField.type === "single") {
//     //                         const variableType = inputField.variableType;
//     //                         // Only change value if type is right 
//     //                         if (isValueOfVariableType(variableType, value)) {
//     //                             setInputValues(prevInputValues => ({
//     //                                 ...prevInputValues, 
//     //                                 [valueLocator.configFieldId]: {
//     //                                     ...layerOfValues[valueLocator.configFieldId], 
//     //                                     value: inputField.value,
//     //                                 }
//     //                             }));
//     //                             return Promise.resolve(); 
//     //                         }
//     //                         return Promise.reject();
//     //                     }
//     //                 }
//     //             return Promise.reject();
//     //         }
//     //         case "listOf":  // TODO
//     //             if (layerOfValues[valueLocator.configFieldId].type === "list") {
//     //                 return valueLocator.index < (layerOfValues[valueLocator.configFieldId] as ListOfWorkshopContextValue).listOfValues.length 
//     //                     ? layerOfValues[valueLocator.configFieldId][valueLocator.index]
//     //                     : Promise.reject();
//     //             }
//     //             return Promise.reject();
//     //     }
//     // }
//     // const changeOutputValue = (valueLocator: ValueLocator, value?: IVariableValue): Promise<void> => {
//     //     return changeOutputValueOnLayer(outputValueTypes, valueLocator, value);
//     // }
//     // const changeOutputValueOnLayer = (layerOfOutputValueTypes: {[id: string]: WorkshopContextOutputVariableType}, valueLocator: ValueLocator, value?: IVariableValue): Promise<void> => {
//     //     switch (valueLocator.type) {
//     //         case "single": 
//     //             if (layerOfOutputValueTypes[valueLocator.configFieldId] == null) {
//     //                 return Promise.reject("Output field does not exist in config definition and cannot be set."); 
//     //             } else if (layerOfOutputValueTypes[valueLocator.configFieldId].type != value) { // check value type
//     //                 return Promise.reject(`${value} type cannot be set for output field ${valueLocator.configFieldId} which has type ${outputValueTypes[valueLocator.configFieldId].type}`);
//     //             }
//     //             sendMessageToWorkshop({
//     //                 type: MESSAGE_TYPES_TO_WORKSHOP.SETTING_VALUE,
//     //                 configFieldId: valueLocator.configFieldId, 
//     //                 value, 
//     //             }); 
//     //             return Promise.resolve(); 
//     //         case "listOf": 
//     //             if (layerOfOutputValueTypes[valueLocator.configFieldId] == null) {
//     //                 return Promise.reject(`Output field does not exist in config definition listOf ${valueLocator.configFieldId} and cannot be set.`); 
//     //             }
//     //             switch (layerOfOutputValueTypes[valueLocator.configFieldId].type) {
//     //                 case "single": 
//     //                     return Promise.reject();
//     //                 case "list": 
//     //                     // TODO: why do I have to cast here
//     //                     return valueLocator.index < (layerOfOutputValueTypes[valueLocator.configFieldId] as ListOfWorkshopContextOutputVariableType).listOfOutputTypes.length 
//     //                         ? setInputValueOnLayer(layerOfOutputValueTypes[valueLocator.configFieldId][valueLocator.index], valueLocator.locator, value)
//     //                         : Promise.reject(); 
//     //             }
//     //     } 
//     // }
//     // const executeEvent = (valueLocator: ValueLocator): Promise<void> => {
//     //     return executeEventOnLayer(eventIds, valueLocator); 
//     // }
//     // const executeEventOnLayer = (layerOfEventIds: { [id: string]: WorkshopContextEventId }, valueLocator: ValueLocator): Promise<void> => {
//     //     switch (valueLocator.type) {
//     //         case "single": 
//     //             if (layerOfEventIds[valueLocator.configFieldId] == null) {
//     //                 return Promise.reject(`Event with id ${valueLocator.configFieldId} does not exist in config definition and cannot be executed.`); 
//     //             }
//     //             sendMessageToWorkshop({
//     //                 type: MESSAGE_TYPES_TO_WORKSHOP.EXECUTING_EVENT, 
//     //                 eventId: valueLocator.configFieldId,
//     //             })
//     //             return Promise.resolve(); 
//     //         case "listOf": 
//     //             if (layerOfEventIds[valueLocator.configFieldId] != null) {
//     //                 switch (layerOfEventIds[valueLocator.configFieldId].type) {
//     //                     case "single": 
//     //                         return Promise.reject();
//     //                     case "list": 
//     //                         // TODO: why do I have to cast here
//     //                         return valueLocator.index < (layerOfEventIds[valueLocator.configFieldId] as ListOfWorkshopContextEventIds).listOfEventIds.length 
//     //                             ? executeEventOnLayer(layerOfEventIds[valueLocator.configFieldId][valueLocator.index], valueLocator.locator) 
//     //                             : Promise.reject();
//     //                 }
//     //             }
//     //     }
//     //     return Promise.reject();
//     // }

//     // Config was not accepted by workshop, return failed
//     if (isConfigRejectedByWorkshop) {
//         return asyncStatusFailed("Workshop rejected the config definition. This is likely due to an API break, as the Workshop iframe's existing saved config is not a subset of the provided config.");
//     }

//     // If not rendered inside iframe in Workshop, return loaded without having to wait for Workshop to confirm it received the config,
//     // Otherwise it would be loading forever.
//     return workshopReceivedConfig || !isInsideIframe() ? asyncStatusLoaded(makeConfigWorkshopContext(configFields)) : asyncStatusLoading(); 
// }

// // testing 
// // const test = useWorkshopContext(EXAMPLE_CONFIG_DEFINITION); 
// // if (isAsyncStatusLoaded(test)) {
// //     const value = test.value;
// //     console.log(value);  
// // }
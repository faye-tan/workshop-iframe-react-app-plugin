// interface ObjectSetValue {
//     objectType: string;
//     objectRid: string;
// }

// type SingleVariableValue =
//     | boolean
//     | number
//     | string
//     | Date
//     | ObjectSetValue
//     | StructValue;

// type IVariableValue = SingleVariableValue | readonly SingleVariableValue[];

// interface StructValue {
//     structFields: { [structFieldId: string]: IVariableValue };
// }

// type ConfigDefinition = readonly IConfigDefinitionFields[];

// interface IConfigDefinitionFields {
//     fieldId: string;
//     field: IConfigDefinitionField;
// }

// type IConfigDefinitionField = IConfigDefinitionField_Single | IConfigDefinitionField_ListOf;

// interface IConfigDefinitionField_Single {
//     type: "single";
//     fieldType: IConfigDefinitionFieldType;
// }

// type IConfigDefinitionFieldType = IConfigDefinitionFieldType_Input | IConfigDefinitionFieldType_Output | IConfigDefinitionFieldType_Event;

// interface IConfigDefinitionFieldType_Input {
//     type: "input";
//     inputDefaultValue: IVariableValue;
// }

// interface IConfigDefinitionFieldType_Output {
//     type: "output";
// }

// interface IConfigDefinitionFieldType_Event {
//     type: "event";
// }

// interface IConfigDefinitionField_ListOf {
//     type: "listOf";
//     config: ConfigDefinition;
// }

// interface SettableValue {
//     setValue: (val: IVariableValue) => void;
// }

// interface ExecutableEvent {
//     executeEvent: () => void;
// }

// const NESTED = [
//     {
//         fieldId: "singleField1",
//         field: {
//             type: "single",
//             fieldType: {
//                 type: "input",
//                 inputDefaultValue: "a single value 1",
//             },
//         },
//     },
//     {
//         fieldId: "singleField2",
//         field: {
//             type: "single",
//             fieldType: {
//                 type: "input",
//                 inputDefaultValue: [100, 200, 300] as const,
//             },
//         },
//     },
//     {
//         fieldId: "outputField1",
//         field: {
//             type: "single",
//             fieldType: {
//                 type: "output",
//             },
//         },
//     },
//     {
//         fieldId: "listOfFieldWithNoInputs",
//         field: {
//             type: "listOf",
//             config: [
//                 {
//                     fieldId: "outputFieldInlistOfFieldWithNoInputs",
//                     field: {
//                         type: "single",
//                         fieldType: {
//                             type: "output",
//                         },
//                     },
//                 },
//                 {
//                     fieldId: "eventFieldInlistOfFieldWithNoInputs",
//                     field: {
//                         type: "single",
//                         fieldType: {
//                             type: "event",
//                         },
//                     },
//                 },
//             ],
//         },
//     },
//     {
//         fieldId: "listOfField",
//         field: {
//             type: "listOf",
//             config: [
//                 {
//                     fieldId: "singleFieldInList",
//                     field: {
//                         type: "single",
//                         fieldType: {
//                             type: "input",
//                             inputDefaultValue: "a single field in a listOf",
//                         },
//                     },
//                 },
//                 {
//                     fieldId: "listOfInList",
//                     field: {
//                         type: "listOf",
//                         config: [
//                             {
//                                 fieldId: "inputFieldInListInList",
//                                 field: {
//                                     type: "single",
//                                     fieldType: {
//                                         type: "input",
//                                         inputDefaultValue: "a single value in a listOf in a listOf",
//                                     },
//                                 },
//                             },
//                             {
//                                 fieldId: "eventFieldInListInList",
//                                 field: {
//                                     type: "single",
//                                     fieldType: {
//                                         type: "event",
//                                     },
//                                 },
//                             },
//                         ],
//                     },
//                 },
//             ],
//         },
//     },
// ] as const;

// type ConfigToObject<T extends ConfigDefinition> = {
//     [K in T[number] as K["fieldId"]]: 
//       K["field"] extends { type: "single", fieldType: { type: "input" } } 
//         ? K["field"]["fieldType"]["inputDefaultValue"]
//         : K["field"] extends { type: "single", fieldType: { type: "output" } }
//           ? SettableValue
//           : K["field"] extends { type: "single", fieldType: { type: "event" } }
//             ? ExecutableEvent
//             : K["field"] extends { type: "listOf"; config: readonly IConfigDefinitionFields[] }
//               ? ConfigToObject<K["field"]["config"]>[]
//               : never; 
// };

// function randomFunction() {
//     console.log("HELLO WORLD"); 
// }

// function setValue(val: IVariableValue) {
//     console.log(val);
// }

// function makeConfigWorkshopContext<T extends ConfigDefinition>(config: T): ConfigToObject<T> {
//     const result: { [key: string]: any } = {};

//     config.forEach((fieldDefinition) => {
//         const { fieldId, field } = fieldDefinition;
//         if (field.type === "single") {
//             if (field.fieldType.type === "input") {
//                 result[fieldId] = field.fieldType.inputDefaultValue;
//             } else if (field.fieldType.type === "output") {
//                 result[fieldId] = { 
//                     setValue: setValue
//                 } as SettableValue;
//             } else if (field.fieldType.type === "event") {
//                 result[fieldId] = {
//                     executeEvent: randomFunction
//                 } as ExecutableEvent;
//             }
//         } else if (field.type === "listOf") {
//             result[fieldId] = [makeConfigWorkshopContext(field.config)];
//         }
//     });

//     return result as ConfigToObject<T>;
// }

// // Generate result from config
// let result = makeConfigWorkshopContext(NESTED);
// console.log(result);  
// result.listOfField[0].listOfInList;
// console.log(result.listOfFieldWithNoInputs[0].eventFieldInlistOfFieldWithNoInputs);

// // Call setValue directly without checking
// result.outputField1.setValue("someValue");

// // interface ObjectSetValue {
// //     objectType: string;
// //     objectRid: string;
// // }

// // type SingleVariableValue =
// //     | boolean
// //     | number
// //     | string
// //     | Date
// //     | ObjectSetValue
// //     | StructValue;
// // type IVariableValue = SingleVariableValue | readonly SingleVariableValue[];
// // interface StructValue {
// //     structFields: { [structFieldId: string]: IVariableValue };
// // }
// // type ConfigDefinition = readonly IConfigDefinitionFields[];
// // interface IConfigDefinitionFields  {
// //     fieldId: string;
// //     field: IConfigDefinitionField;
// // }
// // type IConfigDefinitionField = IConfigDefinitionField_Single | IConfigDefinitionField_ListOf;

// // interface IConfigDefinitionField_Single {
// //     type: "single";
// //     fieldType: IConfigDefinitionFieldType;
// // }
// // type IConfigDefinitionFieldType = IConfigDefinitionFieldType_Input | IConfigDefinitionFieldType_Output | IConfigDefinitionFieldType_Event;
// // interface IConfigDefinitionFieldType_Input {
// //     type: "input";
// //     inputDefaultValue: IVariableValue;
// // }
// // interface IConfigDefinitionFieldType_Output {
// //     type: "output";
// // }
// // interface IConfigDefinitionFieldType_Event {
// //     type: "event";
// // }

// // interface IConfigDefinitionField_ListOf {
// //     type: "listOf";
// //     config: ConfigDefinition;
// // }

// // const NESTED = [
// //     {
// //         fieldId: "singleField1",
// //         field: {
// //             type: "single",
// //             fieldType: {
// //                 type: "input",
// //                 inputDefaultValue: "a single value 1",
// //             },
// //         },
// //     },
// //     {
// //         fieldId: "singleField2",
// //         field: {
// //             type: "single",
// //             fieldType: {
// //                 type: "input",
// //                 inputDefaultValue: [100, 200, 300] as const,
// //             },
// //         },
// //     },
// //     {
// //         fieldId: "singleField2",
// //         field: {
// //             type: "single",
// //             fieldType: {
// //                 type: "output",
// //             },
// //         },
// //     },
// //     {
// //         fieldId: "listOfFieldWithNoInputs",
// //         field: {
// //             type: "listOf",
// //             config: [
// //                 {
// //                     fieldId: "outputFieldInlistOfFieldWithNoInputs",
// //                     field: {
// //                         type: "single",
// //                         fieldType: {
// //                             type: "output",
// //                         },
// //                     },
// //                 },
// //                 {
// //                     fieldId: "eventFieldInlistOfFieldWithNoInputs",
// //                     field: {
// //                         type: "single",
// //                         fieldType: {
// //                             type: "event",
// //                         },
// //                     },
// //                 },
// //             ],
// //         },
// //     },
// //     {
// //         fieldId: "listOfField",
// //         field: {
// //             type: "listOf",
// //             config: [
// //                 {
// //                     fieldId: "singleFieldInList",
// //                     field: {
// //                         type: "single",
// //                         fieldType: {
// //                             type: "input",
// //                             inputDefaultValue: "a single field in a listOf",
// //                         },
// //                     },
// //                 },
// //                 {
// //                     fieldId: "listOfInList",
// //                     field: {
// //                         type: "listOf",
// //                         config: [
// //                             {
// //                                 fieldId: "inputFieldInListInList",
// //                                 field: {
// //                                     type: "single",
// //                                     fieldType: {
// //                                         type: "input",
// //                                         inputDefaultValue: "a single value in a listOf in a listOf",
// //                                     },
// //                                 },
// //                             },
// //                             {
// //                                 fieldId: "eventFieldInListInList",
// //                                 field: {
// //                                     type: "single",
// //                                     fieldType: {
// //                                         type: "event",
// //                                     },
// //                                 },
// //                             },
// //                         ],
// //                     },
// //                 },
// //             ],
// //         },
// //     },
// // ] as const;

// // type ConfigToObject<T extends ConfigDefinition> = {
// //     [K in T[number] as K["field"] extends { type: "single", fieldType: { type: "input" } } | { type: "listOf" } ? K["fieldId"] : never]: 
// //     K["field"] extends { type: "single"; fieldType: { type: "input" } }
// //         ? K["field"]["fieldType"]["inputDefaultValue"]
// //         : K["field"] extends { type: "listOf"; config: readonly IConfigDefinitionFields[] }
// //         ? ConfigToObject<K["field"]["config"]>[]
// //         : undefined; // We can also use undefined for non-input types but this is optional
// // };

// // function makeConfigWorkshopContext<T extends ConfigDefinition>(config: T): ConfigToObject<T> {
// //     const result: any = {};

// //     config.forEach((fieldDefinition) => {
// //         const { fieldId, field } = fieldDefinition;

// //         if (field.type === "single" && field.fieldType.type === "input") {
// //             result[fieldId] = field.fieldType.inputDefaultValue;
// //         } else if (field.type === "listOf") {
// //             const subConfigContext = makeConfigWorkshopContext(field.config); 
// //             if (Object.keys(subConfigContext).length !== 0) {
// //                 result[fieldId] = [subConfigContext];
// //             } else {
// //               result[fieldId] = []; 
// //             }
// //         }
// //     });

// //     return result;
// // }
// // const result = makeConfigWorkshopContext(NESTED);
// // console.log(result);
// // // console.log(result.randomFieldId);
// // console.log(result.listOfField[0].listOfInList[0].inputFieldInListInList);
// // // console.log(result.listOfField[0].listOfInList[0].randomFieldId);
// // console.log(result.listOfFieldWithNoInputs[0].); 
// // // console.log(result.listOfField); // This should show a nested array with input fields only
// // // console.log(result.listOfField[0].singleFieldInList); // This should log the value of the input field
// // // console.log(result.listOfField[1].listOfInList[0].inputFieldInListInList); // This should log the value of the input field in the nested list
// // // // The following line should now cause a compile-time error because `eventFieldInlistOfFieldWithNoInputs` is excluded
// // // console.log(result.listOfFieldWithNoInputs[0].); // This should trigger a type error


// // // interface ObjectSetValue {
// // //     objectType: string;
// // //     objectRid: string; 
// // // }

// // // type SingleVariableValue =
// // //     | boolean
// // //     | number
// // //     | string
// // //     | Date
// // //     | ObjectSetValue
// // //     | StructValue;
// // // type IVariableValue = SingleVariableValue | readonly SingleVariableValue[];
// // // interface StructValue {
// // //     structFields: { [structFieldId: string]: IVariableValue };
// // // }
// // // type ConfigDefinition = readonly IConfigDefinitionFields[];
// // // interface IConfigDefinitionFields  {
// // //     fieldId: string;
// // //     field: IConfigDefinitionField; 
// // // }
// // // type IConfigDefinitionField = IConfigDefinitionField_Single | IConfigDefinitionField_ListOf; 

// // // interface IConfigDefinitionField_Single {
// // //     type: "single"; 
// // //     fieldType: IConfigDefinitionFieldType;
// // // }
// // // type IConfigDefinitionFieldType = IConfigDefinitionFieldType_Input | IConfigDefinitionFieldType_Output | IConfigDefinitionFieldType_Event; 
// // // interface IConfigDefinitionFieldType_Input {
// // //   type: "input"; 
// // //   inputDefaultValue: IVariableValue;
// // // }
// // // interface IConfigDefinitionFieldType_Output {
// // //   type: "output";
// // // }
// // // interface IConfigDefinitionFieldType_Event {
// // //   type: "event"; 
// // // }

// // // interface IConfigDefinitionField_ListOf {
// // //     type: "listOf"
// // //     config: readonly IConfigDefinitionFields[]; 
// // // }

// // // const NESTED = [
// // //     {
// // //         fieldId: "singleField1", 
// // //         field: {
// // //             type: "single",
// // //             fieldType: {
// // //               type: "input", 
// // //               inputDefaultValue: "a single value 1",
// // //             }
// // //         }
// // //     }, 
// // //     {
// // //         fieldId: "singleField2", 
// // //         field: {
// // //             type: "single",
// // //             fieldType: { 
// // //               type: "input", 
// // //               inputDefaultValue: [100, 200, 300] as const,
// // //             }
// // //         }
// // //     },
// // //     {
// // //         fieldId: "singleField2", 
// // //         field: {
// // //             type: "single",
// // //             fieldType: {
// // //               type: "output", 
// // //             }
// // //         }
// // //     },
// // //     {
// // //       fieldId: "listOfFieldWithNoInputs", 
// // //       field: {
// // //         type: "listOf", 
// // //         config: [
// // //           {
// // //               fieldId: "outputFieldInlistOfFieldWithNoInputs", 
// // //               field: {
// // //                   type: "single",
// // //                   fieldType: {
// // //                     type: "output", 
// // //                   }
// // //               }
// // //           },
// // //           {
// // //               fieldId: "eventFieldInlistOfFieldWithNoInputs", 
// // //               field: {
// // //                   type: "single",
// // //                   fieldType: {
// // //                     type: "event", 
// // //                   }
// // //               }
// // //           },
// // //         ]
// // //       }
// // //     },
// // //     {
// // //         fieldId: "listOfField", 
// // //         field: {
// // //             type: "listOf", 
// // //             config: [
// // //                 {
// // //                     fieldId: "singleFieldInList", 
// // //                     field: {
// // //                         type: "single", 
// // //                         fieldType: {
// // //                           type: "input", 
// // //                           inputDefaultValue: "a single field in a listOf",
// // //                         } 
// // //                     }
// // //                 }, 
// // //                 {
// // //                     fieldId: "listOfInList",
// // //                     field: {
// // //                         type: "listOf", 
// // //                         config: [
// // //                             {
// // //                                 fieldId: "inputFieldInListInList", 
// // //                                 field: {
// // //                                     type: "single", 
// // //                                     fieldType: { 
// // //                                       type: "input", 
// // //                                       inputDefaultValue: "a single value in a listOf in a listOf"
// // //                                     }
// // //                                 }
// // //                             }, 
// // //                             {
// // //                                 fieldId: "eventFieldInListInList", 
// // //                                 field: {
// // //                                     type: "single", 
// // //                                     fieldType: { 
// // //                                       type: "event", 
// // //                                     }
// // //                                 }
// // //                             }
// // //                         ],
// // //                     } 
// // //                 }, 
// // //             ],
// // //         }
// // //     },
// // // ] as const;

// // // // type ConfigToObject<T extends ConfigDefinition> = {
// // // //   [K in T[number] as K['fieldId']]: K['field'] extends { type: 'single' }
// // // //     ? (K['field']['fieldType'] extends { type: "input" }
// // // //       ? K["field"]["fieldType"]["inputDefaultValue"]
// // // //       : never)
// // // //     : K['field'] extends { type: 'listOf'; config: readonly IConfigDefinitionFields[] }
// // // //     ? ConfigToObject<K['field']['config']>[]
// // // //     : never;
// // // // };

// // // type ConfigToObject<T extends ConfigDefinition> = {
// // //   [K in T[number] as K['fieldId']]: K['field'] extends { type: 'single' }
// // //     ? (K["field"]["fieldType"] extends { type: "input" }
// // //       ? K["field"]["fieldType"]["inputDefaultValue"]
// // //       : never) // Exclude non-input fields
// // //     : K['field'] extends { type: 'listOf'; config: readonly IConfigDefinitionFields[] }
// // //     ? ConfigToObject<K['field']['config']>[]
// // //     : never;
// // // };

// // // function makeConfigWorkshopContext<T extends ConfigDefinition>(config: T): ConfigToObject<T> {
// // //   const result: any = {};

// // //   config.forEach(fieldDefinition => {
// // //     const { fieldId, field } = fieldDefinition;

// // //     if (field.type === 'single') {
// // //       if (field.fieldType.type === "input") {
// // //         result[fieldId] = field.fieldType.inputDefaultValue;
// // //       }
// // //     } else if (field.type === 'listOf') {
// // //       result[fieldId] = field.config.reduce((accum, subConfig) => { 
// // //         const subConfigContext = makeConfigWorkshopContext([subConfig]); 
// // //         if (Object.keys(subConfigContext).length !== 0) {
// // //           accum.push(subConfigContext); 
// // //         }
// // //         return accum;
// // //       }, [] as any[]); // Recursive call correctly passing array
// // //     }
// // //   });

// // //   return result;
// // // }

// // // const result = makeConfigWorkshopContext(NESTED);

// // // // The following line will now cause a compile-time error because the field was filtered out
// // // console.log(result.listOfFieldWithNoInputs[0].eventFieldInlistOfFieldWithNoInputs); // should error


// // // const listOfField = result.listOfField;
// // // console.log(result);

// // // console.log(result.listOfField); // "a single value 1"
// // // console.log(result.listOfField[0].singleFieldInList); // "a single field in a listOf"
// // // console.log(result.listOfField[1].listOfInList[0].inputFieldInListInList); 
// // // console.log(result.listOfFieldWithNoInputs[0].eventFieldInlistOfFieldWithNoInputs); // should error 
// // // // console.log(result.listOfField[0].listOfInList[0].singleFieldInListInList); // "a single value in a listOf in a listOf"
// // // console.log(result.fieldThatDoesNotExist); // yey this does not work, as expected since field does not exist. 


// // // // // CHAT GPT v1

// // // // // Define the type to transform ConfigDefinition
// // // // type TransformInitialConfigDefinition<T extends IConfigDefinitionFields[]> =
// // // //   T extends { fieldId: infer F; field: infer C }[]
// // // //     ? { [K in F & string]: TransformConfigField<C> }
// // // //     : never;

// // // // type TransformConfigField<T> =
// // // //   T extends IConfigDefinitionField_Single
// // // //     ? T['value']
// // // //     : T extends IConfigDefinitionField_ListOf
// // // //     ? TransformInitialConfigDefinition<T['config']>[]
// // // //     : never;

// // // // function makeConfigWorkshopContext(config: ConfigDefinition): TransformInitialConfigDefinition<ConfigDefinition> {
// // // //   const transformField = (field: IConfigDefinitionField): any => {
// // // //     if (field.type === "single") {
// // // //       return field.value;
// // // //     } else if (field.type === "listOf") {
// // // //       return field.config.map(transformConfig);
// // // //     }
// // // //   };

// // // //   const transformConfig = (item: IConfigDefinitionFields): any => {
// // // //     return {
// // // //       [item.fieldId]: transformField(item.field)
// // // //     };
// // // //   };

// // // //   const result: Record<string, any> = {};

// // // //   for (const item of config) {
// // // //     Object.assign(result, transformConfig(item));
// // // //   }

// // // //   return result as TransformInitialConfigDefinition<ConfigDefinition>;
// // // // }

// // // // const result = makeConfigWorkshopContext(NESTED);
// // // // console.log(result.singleField1); // "a single value 1"
// // // // console.log(result.singleField2); // "a single value 2"
// // // // console.log(result.listOfField); // [{ singleFieldInList: "a single field in a listOf", listOfInList: [{ singleFieldInListInList: "a single value in a listOf in a listOf" }] }]
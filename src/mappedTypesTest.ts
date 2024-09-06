// import { asyncStatusLoaded, IAsyncStatus } from "./types/loadingState"; 
// import { IVariableValue } from "./types/variableValues";
// import { IVariableType } from './types/variableTypes';
// /**
//  * THIS IS AN EXAMPLE I FOUND ONLINE 
//  */
// const options = [{
//     property: 'title',
//     defaultValue: 'Default Title',
// },
// {
//     property: 'category',
// },
// {
//     property: 'hasNotifications',
//     defaultValue: true,
// },
// ] as const; // <-- need this or else the compiler won't remember the literal string types

// type Option = {
//     readonly property: string;
//     readonly defaultValue?: string | number | boolean;
// };

// const makeOptionsObject = <T extends Option>(options: readonly T[]): {
//     [O in T as O["property"]]: "defaultValue" extends keyof O ? O["defaultValue"] : ""
// } => {
//     return options.reduce((accum, option) => ({
//         ...accum,
//         [option.property]: option.defaultValue ?? '',
//     }), {}) as any;

// };

// const optionObject = makeOptionsObject(options);
// /* const optionObject: {
//     title: "Default Title";
//     category: "";
//     hasNotifications: true;
// } */

// console.log(optionObject);
// /*
//     {
//         title: 'Default Title',
//         category: '',
//         hasNotifications: true,
//     }
// */

// optionObject.title  // should autofill and exist in intellisense
// optionObject.asdf   // should not exist

// /**
//  * NON-NESTED ATTEMPT IS WORKING 
//  */
// interface IConfigDefinitionFields {
//     fieldId: string;
//     field: IConfigDefinitionField_Single; 
// }
// interface IConfigDefinitionField_Single {
//     type: "single"; 
//     variableType: IVariableType; 
//     defaultValue?: IVariableValue; 
// }
// interface IConfigDefinitionField_ListOf { // not used in non-nested attempt 
//     type: "listOf"
// }


// const NOT_NESTED_CONFIG = [
//     { 
//         fieldId: "field1", 
//         field: {
//             type: "single", 
//             variableType: {
//                 type: "string",
//             },
//             defaultValue: "test",
//         },
//     }, 
//     {
//         fieldId: "field2", 
//         field: {
//             type: "single", 
//             variableType: {
//                 type: "number",    
//             },
//             defaultValue: 100,
//         }
//     }, 
// ] as const; // need this or compiler won't remember literal string types

// const makeConfigWorkshopContextV0 = <T extends IConfigDefinitionFields>(config: readonly T[]): {
//     [K in T as T["fieldId"]]: IAsyncStatus<IVariableValue | undefined>
// } => {
//     return config.reduce((accum, field) => ({
//         ...accum, 
//         [field.fieldId]: asyncStatusLoaded(field.field.defaultValue)
//     }), {} as any); 
// }

// const notNestedConfigContext = makeConfigWorkshopContextV0(NOT_NESTED_CONFIG); 
// console.log(notNestedConfigContext.field1); 
// console.log(notNestedConfigContext.field2); 
// console.log(notNestedConfigContext.field3); // won't work, as expected. 

// /**
//  * EXAMPLES: 
//  */
// // Example of nested 
// type DeepReadonly<T> = Readonly<{
//     [K in keyof T]: 
//       // Is it a primitive? Then make it readonly
//       T[K] extends (number | string | symbol) ? Readonly<T[K]> 
//       // Is it an array of items? Then make the array readonly and the item as well
//       : T[K] extends Array<infer A> ? Readonly<Array<DeepReadonly<A>>> 
//       // It is some other object, make it readonly as well
//       : DeepReadonly<T[K]>;
//   }>

// // Example of nested type 
// // + or - allows control over the mapped type modifier (? or readonly). 
// // -? means must be all present, aka it removes optionality 
// type Flatten<T extends object> = {
//     [K in keyof T]-?: (
//       x: NonNullable<T[K]> extends infer V // infer keyword to create a temporary type variable V within the true branch of the conditional type
//         ? V extends object
//           ? V extends readonly any[]
//             ? Pick<T, K>
//             : Flatten<V> extends infer FV
//             ? {
//                 [P in keyof FV as `${Extract<K, string | number>}.${Extract<P, string | number>}`]: FV[P]
//               }
//             : never
//           : Pick<T, K>
//         : never
//     ) => void
//   } extends Record<keyof T, (y: infer O) => void>
//     ? O extends unknown
//       ? { [K in keyof O]: O[K] }
//       : never
//     : never;

// /**
//  * Nested attempt 1 
//  */
// type ListOfConfigs = IConfigDefinitionFieldsV0[];
// interface IConfigDefinitionFieldsV0  {
//     fieldId: string;
//     field: IConfigDefinitionFieldV0; 
// }
// type IConfigDefinitionFieldV0 = IConfigDefinitionFieldV0_Single | IConfigDefinitionFieldV0_ListOf; 

// interface IConfigDefinitionFieldV0_Single {
//     type: "single"; 
//     variableType: IVariableType; 
//     defaultValue?: IVariableValue; 
// }
// interface IConfigDefinitionFieldV0_ListOf {
//     type: "listOf"
//     config: readonly IConfigDefinitionFieldsV0[]; // have to add readonly 
// }

// const NESTED = [
//     {
//         fieldId: "singleField1", 
//         field: {
//             type: "single",
//             variableType: {
//                 type: "string",
//             }, 
//             defaultValue: "a single value 1"
//         }
//     }, 
//     {
//         fieldId: "singleField2", 
//         field: {
//             type: "single",
//             variableType: {
//                 type: "string", 
//             },
//             defaultValue: "a single value 2", 
//         }
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
//                         variableType: {
//                             type: "string",
//                         }, 
//                         defaultValue: "a single field in a listOf"
//                     }
//                 }, 
//                 {
//                     fieldId: "listOfInList",
//                     field: {
//                         type: "listOf", 
//                         config: [
//                             {
//                                 fieldId: "singleFieldInListInList", 
//                                 field: {
//                                     type: "single", 
//                                     variableType: {
//                                         type: "string", 
//                                     },
//                                     defaultValue: "a single value in a listOf in a listOf"
//                                 }
//                             }
//                         ]
//                     } 
//                 }, 
//             ],
//         }
//     },
// ] as const;

// const makeConfigWorkshopContextV1 = <T extends IConfigDefinitionFieldsV0>(config: readonly T[]): {
//     [K in T as T["fieldId"]]: T["field"]["type"] extends "single" // T["field"] extends { type: "single" }
//         ? IAsyncStatus<IVariableValue | undefined> 
//         : T["field"]["type"] extends "listOf" // // T["field"] extends { type: "listOf" }
//             ? IConfigDefinitionFieldsV0[] // recursive
//             : never;
// } => {
//     return config.reduce((accum, field) => { 
//         if (field.field.type === "single") {
//             return ({
//                 ...accum, 
//                 [field.fieldId]: asyncStatusLoaded(field.field.defaultValue),
//             })
//         } else if (field.field.type === "listOf") {
//             return ({
//                 ...accum, 
//                 [field.fieldId]: field.field.config.map(conf => makeConfigWorkshopContextV1(conf)),
//             })
//         }
//         return ({
//             ...accum, 
//         }); 
//     }, {} as any); 
// }

// const notNestedConfigContext2 = makeConfigWorkshopContextV1(NESTED);
// console.log(notNestedConfigContext2.listOfField)
































// /**
//  * NESTED ATTEMPT  
//  */
// interface IConfigDefinitionFieldsV2 {
//     fieldId: string;
//     field: IConfigDefinitionFieldV2; 
// }
// type IConfigDefinitionFieldV2 = IConfigDefinitionFieldV2_Single | IConfigDefinitionFieldV2_ListOf;
// interface IConfigDefinitionFieldV2_Single {
//     type: "single"; 
//     variableType: IVariableType; 
//     defaultValue?: IVariableValue; 
// }
// interface IConfigDefinitionFieldV2_ListOf {
//     type: "listOf";
//     readonly config: IConfigDefinitionFieldsV2[];
// }

// const NESTED_CONFIG = [
//     { 
//         fieldId: "field1", 
//         field: {
//             type: "single", 
//             variableType: {
//                 type: "string",
//             },
//             defaultValue: "test",
//         },
//     }, 
//     {
//         fieldId: "field2", 
//         field: {
//             type: "single", 
//             variableType: {
//                 type: "number",    
//             },
//             defaultValue: 100,
//         }
//     }, 
//     {
//         fieldId: "field3", 
//         field: {
//             type: "single",
//             variableType: {
//                 type: "date", 
//             }, 
//         }
//     }, 
//     {
//         fieldId: "field4", 
//         field: {
//             type: "listOf", 
//             config: [
//                 {
//                     fieldId: "singleFieldInList", 
//                     field: {
//                         type: "single", 
//                         variableType: {
//                             type: "string",
//                         }, 
//                         defaultValue: "a single field in a listOf"
//                     }
//                 }, 
//                 {
//                     fieldId: "listOfInList",
//                     field: {
//                         type: "listOf", 
//                         config: [
//                             {
//                                 fieldId: "singleFieldInListInList", 
//                                 field: {
//                                     type: "single", 
//                                     variableType: {
//                                         type: "string", 
//                                     },
//                                     defaultValue: "a single value in a listOf in a listOf"
//                                 }
//                             } 
//                         ] as const,
//                     } 
//                 }, 
//             ] as const,
//         }
//     }
// ] as const; // need this or compiler won't remember literal string types

// type WorkshopContext<T extends IConfigDefinitionFieldsV2> = {
//     [K in T as T["fieldId"]]: T["field"]["type"] extends IConfigDefinitionFieldV2_Single
//         ? WorkshopContextField_Single
//         : T["field"] extends IConfigDefinitionFieldV2_ListOf 
//             ? WorkshopContextField_ListOf<T["field"]["config"]>
//             : never;
// }
// interface WorkshopContextField_Single {
//     variableType: IVariableType;
//     value: IAsyncStatus<IVariableValue | undefined>;
// }
// interface WorkshopContextField_ListOf<T extends readonly IConfigDefinitionFieldsV2[]> {
//     // [K in T[number]]: undefined; 
// }
    
// const makeConfigWorkshopContextV2 = <T extends IConfigDefinitionFieldsV2>(config: readonly T[]): WorkshopContext<T> => {
//     return config.reduce((accum, field) => {
//         if (field.field.type === "single") {
//             return ({
//                 ...accum, 
//                 [field.fieldId]: makeSingleConfigWorkshopContextV2(field.field),
//             })
//         } else if (field.field.type === "listOf") {
//             return ({
//                 ...accum, 
//                 [field.fieldId]: makeListOfConfigWorkshopContextV2(field.field),
//             })
//         }
//         return accum; 
//     }, {} as any);
//     // return config.reduce((accum, field) => ({
//     //     ...accum, 
//     //     [field.fieldId]: asyncStatusLoaded(field.field.defaultValue)
//     // }), {} as any); 
// }

// const makeSingleConfigWorkshopContextV2 = <T extends IConfigDefinitionFieldV2_Single>(config: readonly T) => {

// }

// const makeListOfConfigWorkshopContextV2 = <T extends IConfigDefinitionFieldV2_ListOf>(config: readonly T) => {

// }

// const nestedConfigContext = makeConfigWorkshopContextV2(NESTED_CONFIG); 
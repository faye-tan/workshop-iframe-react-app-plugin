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
/**
 * This is an example config definition that shows a mix of input/output variable types
 * in single fields as well as listOf config fields. 
 * 
 * Note that if you use camel case or snake case you can use dot notation later
 * Otherwise, you need to use square bracket notation 
 */
export const EXAMPLE_CONFIG_DEFINITION = [
    {
        fieldId: "inputStringField", 
        field: {
            type: "single",
            isRequired: true, 
            fieldType: {
                type: "input", 
                inputVariableType: {
                    type: "string",
                },
                value: "test",
            }, 
            label: "String input field", 
        }, 
    }, 
    {
        fieldId: "input-number-field",
        field: {
            type: "single",
            isRequired: true,
            label: "required number field input",
            fieldType: {
                type: "input",
                inputVariableType: {
                    type: "number",    
                },
                value: 100,
            },
        },
    }, 
    {
        fieldId: "output_boolean_field",
        field: {
            type: "single",
            isRequired: false,
            label: "optional boolean field output",
            fieldType: {
                type: "output",
                outputVariableType: {
                    type: "boolean",
                },
            },
        },
    }, 
    {
        fieldId: "input-date-field",
        field: {
            type: "single",
            isRequired: true,
            label: "required date field input",
            fieldType: {
                type: "input",
                inputVariableType: {
                    type: "date",
                },
                value: Date.now(),
            },
        },
    }, 
    {
        fieldId: "output-timestamp-field",
        field: {
            type: "single",
            isRequired: false,
            label: "optional timestamp field output",
            fieldType: {
                type: "output",
                outputVariableType: {
                    type: "timestamp",    
                },
            },
        },
    }, 
    {
        fieldId: "input-objectSet-field",
        field: {
            type: "single",
            isRequired: true,
            label: "required objectSet field input",
            fieldType: {
                type: "input",
                inputVariableType: {
                    type: "objectSet",
                },
            },
        },
    }, 
    {
        fieldId: "output-array-string-field", 
        field: {
            type: "single",
            isRequired: false,
            label: "optional array string field output",
            fieldType: {
                type: "output",
                outputVariableType: {
                    type: "array",
                    arraySubType: {
                        type: "string",
                    },
                },
            },
        },
    }, 
    {
        fieldId: "inputArrayNumberField", 
        field: {
            type: "single",
            isRequired: true,
            label: "required array number field input",
            fieldType: {
                type: "input",
                inputVariableType: {
                    type: "array",
                    arraySubType: {
                        type: "number",
                    },            
                },
            },
        },
    }, 
    {
        fieldId: "outputarray-boolean-field", 
        field: {
            type: "single",
            isRequired: false,
            label: "optional array boolean field output",
            fieldType: {
                type: "output",
                outputVariableType: {
                    type: "array",
                    arraySubType: {
                        type: "boolean",
                    },
                },
            },
        },
    },
    {
        fieldId: "output-array-date-field", 
        field: {
            type: "single",
            isRequired: true,
            label: "required array date field output",
            fieldType: {
                type: "output",
                outputVariableType: {
                    type: "array",
                    arraySubType: {
                        type: "date",
                    },
                },
            },
        },
    }, 
    {
        fieldId: "output-array-timestamp-field", 
        field: {
            type: "single",
            isRequired: false,
            label: "optional array timestamp field output",
            fieldType: {
                type: "output",
                outputVariableType: {
                    type: "array",
                    arraySubType: {
                        type: "timestamp",
                    },
                },
            },
        },
    }, 
    {
        fieldId: "input-struct-field", 
        field: {
            type: "single",
            isRequired: true,
            label: "required struct field input",
            fieldType: {
                type: "input",
                inputVariableType: {
                    type: "struct",
                    structFieldTypes: [
                        {
                            fieldId: "struct-field-1",
                            fieldType: {
                                type: "string",
                            },
                        },
                        {
                            fieldId: "struct-field-2",
                            fieldType: {
                                type: "boolean",
                            },
                        },
                    ],
                },
            },
        }
    },
    {
        fieldId: "output-struct-field", 
        field: {
            type: "single",
            isRequired: true,
            label: "required struct field input",
            fieldType: {
                type: "output",
                outputVariableType: {
                    type: "struct",
                    structFieldTypes: [
                        {
                            fieldId: "struct-field-1",
                            fieldType: {
                                type: "string",
                            },
                        },
                        {
                            fieldId: "struct-field-2",
                            fieldType: {
                                type: "boolean",
                            },
                        },
                    ],
                },
            },
        },
    }, 
    {
        fieldId: "event", 
        field: {
            type: "single",
            isRequired: true,
            label: "Events",
            fieldType: {
                type: "event",
            },
        },
    }, 
    {
        fieldId: "listOfConfigFields", 
        field: {
            type: "listOf",
            label: "List of config fields",
            addButtonText: "Add another entry to list",
            defaultLength: 4,
            config: [
                {
                    fieldId: "inputStringFieldInsideListOf",
                    field: {
                        type: "single",
                        isRequired: true, 
                        fieldType: {
                            type: "input", 
                            inputVariableType: {
                                type: "string",
                            },
                        }, 
                        label: "String input field", 
                    }, 
                },
                {
                    fieldId: "event-in-listOf",
                    field: {
                        type: "single",
                        isRequired: true,
                        label: "Events",
                        fieldType: {
                            type: "event",
                        },
                    },
                }, {
                    fieldId: "structInListOf", 
                    field: {
                        type: "single", 
                        label: "Struct in list of", 
                        fieldType: {
                            type: "input",
                            inputVariableType: {
                                type: "struct",
                                structFieldTypes: [
                                    {
                                        fieldId: "struct-field-1",
                                        fieldType: {
                                            type: "number",
                                        },
                                    },
                                    {
                                        fieldId: "struct-field-2",
                                        fieldType: {
                                            type: "date",
                                        },
                                    },
                                ],
                            }
                        }
                    }
                }, {
                    fieldId: "listOf-in-listOf", 
                    field: {
                        type: "listOf", 
                        label: "List of inside list of", 
                        addButtonText: "Add something else to list", 
                        defaultLength: 2, 
                        config: [
                            {
                                fieldId: "output-boolean-array-in-nested-list",
                                field: {
                                    type: "single", 
                                    isRequired: true, 
                                    label: "Output boolean array in nested list", 
                                    fieldType: {
                                        type: "output", 
                                        outputVariableType: {
                                            type: "array", 
                                            arraySubType: { 
                                                type: "boolean",
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            ],
        },
    }
] as const; // This const assertion is mandatory! 
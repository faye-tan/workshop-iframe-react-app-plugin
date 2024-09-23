import { IVariableValue } from "../types/variableValues";

export const COMPREHENSIVE_EXAMPLE_CONFIG = [
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
            label: "Input string (title)", 
        }, 
    }, 
    {
        fieldId: "inputNumberField",
        field: {
            type: "single",
            isRequired: true,
            label: "Input number",
            fieldType: {
                type: "input",
                inputVariableType: {
                    type: "number",    
                },
                value: 25,
            },
        },
    }, 
    {
        fieldId: "inputBooleanField",
        field: {
            type: "single",
            isRequired: true,
            label: "Input boolean",
            fieldType: {
                type: "input",
                inputVariableType: {
                    type: "boolean",    
                },
                value: true,
            },
        },
    }, 
    {
        fieldId: "input-date-field",
        field: {
            type: "single",
            isRequired: true,
            label: "Input date",
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
        fieldId: "input-timestamp-field",
        field: {
            type: "single",
            isRequired: true,
            label: "Input timestamp",
            fieldType: {
                type: "input",
                inputVariableType: {
                    type: "timestamp",
                },
                value: Date.now(),
            },
        },
    }, 
    {
        fieldId: "inputObjectSet-field", 
        field: {
            type: "single",
            isRequired: true,
            label: "Input object set",
            fieldType: {
                type: "input",
                inputVariableType: {
                    type: "objectSet",       
                },
            },
        },
    }, 
    {
        fieldId: "inputArrayStringField", 
        field: {
            type: "single",
            isRequired: true,
            label: "Input string list",
            fieldType: {
                type: "input",
                inputVariableType: {
                    type: "list",
                    valueType: {
                        type: "string",
                    },            
                },
                value: ["hello", "world"] as IVariableValue,
            },
        },
    }, 
    {
        fieldId: "inputArrayNumberField", 
        field: {
            type: "single",
            isRequired: true,
            label: "Input number list",
            fieldType: {
                type: "input",
                inputVariableType: {
                    type: "list",
                    valueType: {
                        type: "number",
                    },            
                },
                value: [1, 3] as IVariableValue,
            },
        },
    }, 
    {
        fieldId: "inputArrayBooleanField", 
        field: {
            type: "single",
            isRequired: true,
            label: "Input boolean list",
            fieldType: {
                type: "input",
                inputVariableType: {
                    type: "list",
                    valueType: {
                        type: "boolean",
                    },            
                },
                value: [true, false] as IVariableValue,
            },
        },
    }, 
    {
        fieldId: "inputArrayDateField", 
        field: {
            type: "single",
            isRequired: true,
            label: "Input date list",
            fieldType: {
                type: "input",
                inputVariableType: {
                    type: "list",
                    valueType: {
                        type: "date",
                    },            
                },
                value: [] as IVariableValue, 
            },
        },
    }, 
    {
        fieldId: "inputArrayTimestampField", 
        field: {
            type: "single",
            isRequired: true,
            label: "Input timestamp list",
            fieldType: {
                type: "input",
                inputVariableType: {
                    type: "list",
                    valueType: {
                        type: "timestamp",
                    },            
                },
                value: [] as IVariableValue,
            },
        },
    }, 
    {
        fieldId: "input-struct-field", 
        field: {
            type: "single",
            isRequired: true,
            label: "Input struct",
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
        fieldId: "outputStringField",
        field: {
            type: "single",
            isRequired: true,
            label: "Output string",
            fieldType: {
                type: "output",
                outputVariableType: {
                    type: "string",    
                },
            },
        },
    }, 
    {
        fieldId: "output-number-field",
        field: {
            type: "single",
            isRequired: true,
            label: "Output number",
            fieldType: {
                type: "output",
                outputVariableType: {
                    type: "number",    
                },
            },
        },
    }, 
    {
        fieldId: "output_boolean_field",
        field: {
            type: "single",
            isRequired: false,
            label: "Ouptut boolean",
            fieldType: {
                type: "output",
                outputVariableType: {
                    type: "boolean",
                },
            },
        },
    }, 
    {
        fieldId: "output-date-field",
        field: {
            type: "single",
            isRequired: false,
            label: "Output date",
            fieldType: {
                type: "output",
                outputVariableType: {
                    type: "date",    
                },
            },
        },
    }, 
    {
        fieldId: "output-timestamp-field",
        field: {
            type: "single",
            isRequired: false,
            label: "Output timestamp",
            fieldType: {
                type: "output",
                outputVariableType: {
                    type: "timestamp",    
                },
            },
        },
    }, 
    {
        fieldId: "output-objectSet-field",
        field: {
            type: "single",
            isRequired: true,
            label: "Output object set",
            fieldType: {
                type: "output",
                outputVariableType: {
                    type: "objectSet",
                },
            },
        },
    }, 
    {
        fieldId: "output-list-string-field", 
        field: {
            type: "single",
            isRequired: false,
            label: "Output string list",
            fieldType: {
                type: "output",
                outputVariableType: {
                    type: "list",
                    valueType: {
                        type: "string",
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
            label: "Output boolean list",
            fieldType: {
                type: "output",
                outputVariableType: {
                    type: "list",
                    valueType: {
                        type: "boolean",
                    },
                },
            },
        },
    },
    {
        fieldId: "outputarray-number-field", 
        field: {
            type: "single",
            isRequired: false,
            label: "Output number list",
            fieldType: {
                type: "output",
                outputVariableType: {
                    type: "list",
                    valueType: {
                        type: "number",
                    },
                },
            },
        },
    },
    {
        fieldId: "output-list-date-field", 
        field: {
            type: "single",
            isRequired: true,
            label: "Output date list",
            fieldType: {
                type: "output",
                outputVariableType: {
                    type: "list",
                    valueType: {
                        type: "date",
                    },
                },
            },
        },
    }, 
    {
        fieldId: "output-list-timestamp-field", 
        field: {
            type: "single",
            isRequired: false,
            label: "Output timestamp list",
            fieldType: {
                type: "output",
                outputVariableType: {
                    type: "list",
                    valueType: {
                        type: "timestamp",
                    },
                },
            },
        },
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
                                fieldId: "output-boolean-list-in-nested-list",
                                field: {
                                    type: "single", 
                                    isRequired: true, 
                                    label: "Output boolean list in nested list", 
                                    fieldType: {
                                        type: "output", 
                                        outputVariableType: {
                                            type: "list", 
                                            valueType: { 
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
] as const;
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
import { IConfigDefinitionFields } from "../types/configDefinition";

export const EXAMPLE_CONFIG_DEFINITION: IConfigDefinitionFields = {
    fields: {
        stringField1: {
            type: "single",
            isRequired: true, 
            fieldType: {
                type: "input", 
                inputVariable: {
                    variableType: { 
                        type: "string",
                    },
                    defaultValue: "test"
                },
            }, 
            label: "String input field", 
        }, 
        field2: {
            type: "single",
            isRequired: true,
            label: "required number field input",
            fieldType: {
                type: "input",
                inputVariable: {
                    variableType: {
                        type: "number",
                    },
                },
            },
        },
        field3: {
            type: "single",
            isRequired: false,
            label: "optional boolean field output",
            fieldType: {
                type: "output",
                outputVariable: {
                    variableType: {
                        type: "boolean",
                    },
                },
            },
        },
        field4: {
            type: "single",
            isRequired: true,
            label: "required date field input",
            fieldType: {
                type: "input",
                inputVariable: {
                    variableType: {
                        type: "date",
                    },
                },
            },
        },
        field5: {
            type: "single",
            isRequired: false,
            label: "optional timestamp field output",
            fieldType: {
                type: "output",
                outputVariable: {
                    variableType: {
                        type: "timestamp",
                    },
                },
            },
        },
        field6: {
            type: "single",
            isRequired: true,
            label: "required objectSet field input",
            fieldType: {
                type: "input",
                inputVariable: {
                    variableType: {
                        type: "objectSet",
                    },
                },
            },
        },
        field7: {
            type: "single",
            isRequired: false,
            label: "optional array string field output",
            fieldType: {
                type: "output",
                outputVariable: {
                    variableType: {
                        type: "array",
                        arraySubType: {
                            type: "string",
                        },
                    },
                },
            },
        },
        field8: {
            type: "single",
            isRequired: true,
            label: "required array number field input",
            fieldType: {
                type: "input",
                inputVariable: {
                    variableType: {
                        type: "array",
                        arraySubType: {
                            type: "number",
                        },
                    },
                },
            },
        },
        field9: {
            type: "single",
            isRequired: false,
            label: "optional array boolean field output",
            fieldType: {
                type: "output",
                outputVariable: {
                    variableType: {
                        type: "array",
                        arraySubType: {
                            type: "boolean",
                        },
                    },
                },
            },
        },
        field10: {
            type: "single",
            isRequired: true,
            label: "required array date field output",
            fieldType: {
                type: "output",
                outputVariable: {
                    variableType: {
                        type: "array",
                        arraySubType: {
                            type: "date",
                        },
                    },
                },
            },
        },
        field11: {
            type: "single",
            isRequired: false,
            label: "optional array timestamp field output",
            fieldType: {
                type: "output",
                outputVariable: {
                    variableType: {
                        type: "array",
                        arraySubType: {
                            type: "timestamp",
                        },
                    },
                },
            },
        },
        field12: {
            type: "single",
            isRequired: true,
            label: "required struct field input",
            fieldType: {
                type: "input",
                inputVariable: {
                    variableType: {
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
        event1: {
            type: "single",
            isRequired: true,
            label: "Events",
            fieldType: {
                type: "event",
            },
        },
        list1: {
            type: "listOf",
            label: "List of config fields",
            addButtonText: "Add another entry to list",
            maxLength: 4,
            config: {
                field1InList1: {
                    type: "single",
                    isRequired: true, 
                    fieldType: {
                        type: "input", 
                        inputVariable: {
                            variableType: { 
                                type: "string",
                            },
                            defaultValue: "test"
                        },
                    }, 
                    label: "String input field", 
                }, 
                event1InList1: {
                    type: "single",
                    isRequired: true,
                    label: "Events",
                    fieldType: {
                        type: "event",
                    },
                },
            },
        },
    }
}
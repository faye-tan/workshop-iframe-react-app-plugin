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
import React from "react";
import { isAsyncStatusLoaded, isAsyncStatusLoading } from '../types/loadingState';
import { useWorkshopContext } from "../useWorkshopContext";
import { COMPREHENSIVE_EXAMPLE_CONFIG } from "./exampleConfigDefinition";

export const Example: React.FC<{}> = props => {
    const workshopContext = useWorkshopContext(COMPREHENSIVE_EXAMPLE_CONFIG);

    if (isAsyncStatusLoading(workshopContext)) {
        return <>Loading...</>; 
    } if (isAsyncStatusLoaded(workshopContext)) {
        const loadedContext = workshopContext.value; 
        
        // get values 
        const inputArrayNumberVariable = loadedContext.inputArrayNumberField; // type is number[] | undefined
        const v2 = loadedContext.listOfConfigFields[0].inputStringFieldInsideListOf; // type is string | undefined 
        const v3 = loadedContext["input-struct-field"]; 
        const test = v3?.structFields["struct-field-1"];  // type is string
        
        // set values 
        loadedContext.output_boolean_field.setValue(true); // input param must be bool or compiler will err
        loadedContext.listOfConfigFields[0]["listOf-in-listOf"][0]["output-boolean-list-in-nested-list"].setValue([true, false]); // input param must be bool[] or compiler will err
        loadedContext["output-struct-field"].setValue({ // TODO this is not working 100% yet 
            structFields: {
                "struct-field-1": "false",
                "struct-field-2": true, 
            }
        });

        // execute events 
        loadedContext.event.executeEvent(); 
        loadedContext.listOfConfigFields[0]["event-in-listOf"].executeEvent();

        return <div onClick={() => loadedContext.event.executeEvent()}>{inputArrayNumberVariable}</div>;
    }
    
    return <>Something went wrong, context failed.</>
}
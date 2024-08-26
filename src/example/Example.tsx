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
import { isAsyncStatusLoaded, isAsyncStatusLoading } from "../types/loadingState";
import { WorkshopContextPlugin } from "../WorkshopContextPlugin"
import { EXAMPLE_CONFIG_DEFINITION } from "./exampleConfigDefinition";

export const Example: React.FC<{}> = props => {
    const workshopContext = new WorkshopContextPlugin(EXAMPLE_CONFIG_DEFINITION).getContext();

    if (isAsyncStatusLoading(workshopContext)) {
        return <>Loading...</>; 
    } if (isAsyncStatusLoaded(workshopContext)) {
        const stringValue = workshopContext.value.inputValues["stringField1"]; 
        workshopContext.value.executeEvent("test");
        return <>{stringValue}</>;
    }
    
    return <>Something went wrong, context failed.</>
}
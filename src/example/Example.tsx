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
import React from "react";
import { COMPREHENSIVE_EXAMPLE_CONFIG } from "./ExampleConfig";
import {
  IAsyncLoaded,
  isAsyncStatus_FailedLoading,
  isAsyncStatus_Loaded,
  isAsyncStatus_Loading,
} from "../types/loadingState";
import { IWorkshopContext } from "../types/workshopContext";
import { useWorkshopContext } from "../";
import { ObjectSetLocators } from "../types/variableValues";

/**
 * This is an example of how to use `useWorkshopContext`, and then ensure that the context object returned is loaded before
 * retrieving values or setting values.
 */
export const Example = () => {
  const workshopContext = useWorkshopContext(COMPREHENSIVE_EXAMPLE_CONFIG);

  if (isAsyncStatus_Loading(workshopContext)) {
    return <div>LOADING...</div>;
  } else if (isAsyncStatus_Loaded(workshopContext)) {
    const loadedWorkshopContext = workshopContext.value;
    return (
      <LoadedComprehensiveExample
        loadedWorkshopContext={loadedWorkshopContext}
      />
    );
  } else if (isAsyncStatus_FailedLoading(workshopContext)) {
    return <div>SOMETHING WENT WRONG...</div>;
  }
};

/**
 * This is an example of how to use values and setter methods inside of the context object.
 */
const LoadedComprehensiveExample: React.FC<{
  loadedWorkshopContext: IWorkshopContext<typeof COMPREHENSIVE_EXAMPLE_CONFIG>;
}> = (props) => {
  const {
    stringField,
    booleanField,
    numberField,
    dateField,
    timestampField,
    stringListField,
    objectSetField,
    event,
    booleanListField,
    numberListField,
    dateListField,
    timestampListField,
    listOfFields,
  } = props.loadedWorkshopContext;

  /**
   * Examples of retrieving field values.
   */
  const stringFieldValue: IAsyncLoaded<string> | undefined =
    stringField.fieldValue;
  const booleanFieldValue: IAsyncLoaded<boolean> | undefined =
    booleanField.fieldValue;
  const numberFieldValue: IAsyncLoaded<number> | undefined =
    numberField.fieldValue;
  const dateFieldValue: IAsyncLoaded<Date> | undefined = dateField.fieldValue;
  const timestampFieldValue: IAsyncLoaded<Date> | undefined =
    timestampField.fieldValue;

  const objectSetFieldValue: IAsyncLoaded<ObjectSetLocators> | undefined =
    objectSetField.fieldValue;
  // Example usage of objectSetFieldValue's primary keys to query for objects using osdk's client:
  //      const primaryKeys: string[] = isAsyncStatusLoaded(objectSetFieldValue) ? objectSetFieldValue.value.primaryKeys : [];
  //      const housesfilteredByPrimaryKey: ObjectSet<RottenTomatoesMovies> = client.ontology.objects.RottenTomatoesMovies.where(query => query.rottenTomatoesLink.containsAnyTerm(primaryKeys.join(" ")));

  const stringListFieldValue: IAsyncLoaded<string[]> | undefined =
    stringListField.fieldValue;
  const booleanListFieldValue: IAsyncLoaded<boolean[]> | undefined =
    booleanListField.fieldValue;
  const numberListFieldValue: IAsyncLoaded<number[]> | undefined =
    numberListField.fieldValue;
  const dateListFieldValue: IAsyncLoaded<Date[]> | undefined =
    dateListField.fieldValue;
  const timestampListFieldValue: IAsyncLoaded<Date[]> | undefined =
    timestampListField.fieldValue;

  /**
   * Examples of setting values on the config fields.
   */
  stringField.setLoading();
  stringField.setLoadedValue("Hello world!!!"); // The value takes the config field type, in this case, string
  stringField.setReloadingValue("I am reloading..."); // The value takes the config field type, in this case, string
  stringField.setFailedWithError("Oh no, an error occurred!"); // Takes string for error message

  booleanField.setLoading();
  booleanField.setLoadedValue(false); // The value takes the config field type, in this case, string
  booleanField.setReloadingValue(true); // The value takes the config field type, in this case, string
  booleanField.setFailedWithError("Oh no, an error occurred!"); // Takes string for error message

  /**
   * Examples of executing event
   */
  event.executeEvent(undefined); // Takes a React MouseEvent, React KeyboardEvent, or undefined if those are not applicable

  /**
   * Examples of ListOf config. These are accessed by index.
   */
  listOfFields.forEach((listOfLayer, index) => {
    // Events inside of listOf also have an execution method
    listOfLayer.eventInsideListOf.executeEvent(undefined); // Takes a React MouseEvent, React KeyboardEvent, or undefined if those are not applicable

    // Single fields inside listOf each also have a value and setter methods
    const stringValueInsideListOf: IAsyncLoaded<string> | undefined =
      listOfLayer.stringFieldInsideListOf.fieldValue;
    listOfLayer.stringFieldInsideListOf.setLoading();
    listOfLayer.stringFieldInsideListOf.setLoadedValue(
      `I am a string inside of a listOf at index ${index}`
    );
    listOfLayer.stringFieldInsideListOf.setReloadingValue(
      `stringFieldInsideListOf is reloading at ${index}`
    );
    listOfLayer.stringFieldInsideListOf.setFailedWithError(
      `stringFieldInsideListOf failed to load at ${index}`
    );

    // Can have nested listOf configs
    listOfLayer.nestedListOfField.forEach((nestedListOfLayer, nestedIndex) => {
      // Single fields inside nested listOf configs also have value and setter methods
      nestedListOfLayer.booleanListInsideNestedListof.setLoading();
      nestedListOfLayer.booleanListInsideNestedListof.setLoadedValue([
        true,
        true,
      ]);
      nestedListOfLayer.booleanListInsideNestedListof.setLoadedValue([
        false,
        true,
      ]);
      nestedListOfLayer.booleanListInsideNestedListof.setFailedWithError(
        `booleanListInsideNestedListof failed to load at ${nestedIndex}`
      );
    });
  });

  return <></>;
};

import React from "react"; 
import { COMPREHENSIVE_EXAMPLE_CONFIG } from "./ExampleConfig";
import { IAsyncStatus, isAsyncStatusFailedLoading, isAsyncStatusLoaded, isAsyncStatusLoading } from "../types/loadingState";
import { IWorkshopContext } from "../types/workshopContext";
import { useWorkshopContext } from "../";
import { ObjectSetLocators } from "../types/variableValues";

export const Example = () => {
    const workshopContext = useWorkshopContext(COMPREHENSIVE_EXAMPLE_CONFIG);

    if (isAsyncStatusLoading(workshopContext)) {
        return <div>LOADING...</div>
    } else if (isAsyncStatusLoaded(workshopContext)) {
        const loadedWorkshopContext = workshopContext.value;
        return <LoadedComprehensiveExample loadedWorkshopContext={loadedWorkshopContext} />;
    } else if (isAsyncStatusFailedLoading(workshopContext)) {
        return <div>SOMETHING WENT WRONG...</div>
    }
}

const LoadedComprehensiveExample: React.FC<{loadedWorkshopContext: IWorkshopContext<typeof COMPREHENSIVE_EXAMPLE_CONFIG>}> = props => {
    const { stringField, booleanField, numberField, dateField, timestampField, stringListField, objectSetField, event, booleanListField, numberListField, dateListField, timestampListField, listOfFields } = props.loadedWorkshopContext;

    /**
     * Examples of retrieving field values.
     */
    const stringFieldValue: IAsyncStatus<string> | undefined = stringField.fieldValue; 
    const booleanFieldValue: IAsyncStatus<boolean> | undefined = booleanField.fieldValue;
    const numberFieldValue: IAsyncStatus<number> | undefined = numberField.fieldValue;
    const dateFieldValue: IAsyncStatus<Date> | undefined = dateField.fieldValue;
    const timestampFieldValue: IAsyncStatus<Date> | undefined = timestampField.fieldValue; 

    const objectSetFieldValue: IAsyncStatus<ObjectSetLocators> | undefined = objectSetField.fieldValue;
    // Example usage of objectSetFieldValue's primary keys to query for objects using osdk's client: 
    //      const primaryKeys: string[] = isAsyncStatusLoaded(objectSetFieldValue) ? objectSetFieldValue.value.primaryKeys : [];
    //      const housesfilteredByPrimaryKey: ObjectSet<RottenTomatoesMovies> = client.ontology.objects.RottenTomatoesMovies.where(query => query.rottenTomatoesLink.containsAnyTerm(primaryKeys.join(" ")));

    const stringListFieldValue: IAsyncStatus<string[]> | undefined = stringListField.fieldValue; 
    const booleanListFieldValue: IAsyncStatus<boolean[]> | undefined = booleanListField.fieldValue;
    const numberListFieldValue: IAsyncStatus<number[]> | undefined = numberListField.fieldValue;
    const dateListFieldValue: IAsyncStatus<Date[]> | undefined = dateListField.fieldValue;
    const timestampListFieldValue: IAsyncStatus<Date[]> | undefined = timestampListField.fieldValue; 

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
    event.executeEvent(); // Takes no arguments

    /**
     * Examples of ListOf config. These are accessed by index.
     */
    listOfFields.forEach((listOfLayer, index) => {
        // Events inside of listOf also have an execution method
        listOfLayer.eventInsideListOf.executeEvent(); 

        // Single fields inside listOf each also have a value and setter methods
        const stringValueInsideListOf: IAsyncStatus<string> | undefined = listOfLayer.stringFieldInsideListOf.fieldValue; 
        listOfLayer.stringFieldInsideListOf.setLoading();
        listOfLayer.stringFieldInsideListOf.setLoadedValue(`I am a string inside of a listOf at index ${index}`);
        listOfLayer.stringFieldInsideListOf.setReloadingValue(`stringFieldInsideListOf is reloading at ${index}`);
        listOfLayer.stringFieldInsideListOf.setFailedWithError(`stringFieldInsideListOf failed to load at ${index}`);

        // Can have nested listOf configs 
        listOfLayer.nestedListOfField.forEach((nestedListOfLayer, nestedIndex) => {

            // Single fields inside nested listOf configs also have value and setter methods
            nestedListOfLayer.booleanListInsideNestedListof.setLoading();
            nestedListOfLayer.booleanListInsideNestedListof.setLoadedValue([true, true]);
            nestedListOfLayer.booleanListInsideNestedListof.setLoadedValue([false, true]);
            nestedListOfLayer.booleanListInsideNestedListof.setFailedWithError(`booleanListInsideNestedListof failed to load at ${nestedIndex}`);
        })
    }); 

    return <></>; 
}

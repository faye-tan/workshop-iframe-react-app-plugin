# Workshop Iframe React app plugin

## Description

A plugin to be used in React apps intended to be iframed inside of [Palantir's Workshop](https://www.palantir.com/docs/foundry/workshop/overview/) and bidirectionally communicate. Bidirectional communication includes the following:

- Workshop can pass variable values to the iframed React app
- The iframed React app is able to set variables' values in Workshop
- The iframed React app is able to execute events in Workshop

## How does it work?

![Diagram of how this Workshop Iframe React app plugin works](./src/media/workshop-iframe-react-app-plugin-diagram.png)

## When should I use this?

For Palantirians, the recommended path for being a custom widget will continue to be creating a new plugin in Forge. Going through route means you can build a reusable widget that it’s easy to ship to the fleet. It also means your widget will be a performant, native React component when used in Workshop.
So why might you use this new option OSDK + custom iframe widget and why are we so excited about it?

- If you’re a customer builder, this is the first-time you’ve had a product-supported means of creating new Workshop widget in React, and that’s a big deal! For third-party devs, this is the recommended path for custom widgets and we’re hoping it’s a game-changer
- If you’re a Palantirian working alongside a third-party developer, this is also a great option. You can bootstrap a new custom widget and then turn it over to the customer for continued development and maintenance
- If you’re just prototyping and experimenting as a Palantirian, this is a great option. (And then if / when you’re experiment takes off, we strongly encourage you to bring this to core product as a Forge plugin!)

## Limitations

- There is no current way to bypass the Login screen for OSDK React apps.
- For object set variables, they are constrained to a pre-defined objectType, additionally the current limit is 10,000 objects primaryKeys/objectRids that can be passed back and forth between Workshop and the iframed React app. Any more and they will be cut off at the first 10,000. This limitation will be removed once OSDK is able to support materializing objectSets from temporary objectSetRids.
- No struct variable support yet but it is coming soon.

## Install

```
npm install TODO // fill this in later
```

## Use

See [Examples.tsx](./src/example/Example.tsx) for full example usage, and see [ExampleConfig.ts](./src/example/ExampleConfig.ts) for a comprehensive example of all config field types.

A basic config definition:

```
export const BASIC_CONFIG_DEFINITION = [
  {
    fieldId: "stringField",
    field: {
      type: "single",
      fieldValue: {
        type: "inputOutput",
        variableType: {
          type: "string",
          defaultValue: "test",
        },
      },
      label: "Input string (title)",
    },
  },
  {
    fieldId: "workshopEvent",
    field: {
      type: "single",
      label: "Events",
      fieldValue: {
        type: "event",
      },
    },
  },
  {
    fieldId: "listOfField",
    field: {
      type: "listOf",
      label: "A list of fields",
      addButtonText: "Add another item to these listOf fields",
      config: [
        {
          fieldId: "booleanListField",
          field: {
            type: "single",
            label: "Boolean list in a listOf",
            fieldValue: {
              type: "inputOutput",
              variableType: {
                type: "boolean-list",
                defaultValue: [true, false, true, false],
              },
            },
          },
        },
      ],
    },
  },
  ...
] as const satisfies IConfigDefinition;
```

It is imperative to declare the config as a const. In order to transform the config into a context object where each `fieldId` becomes a property in the context object, the input config to `useWorkshopContext` must be declared as an object literal using `as const`.

Here is an example React component that shows how to call `useWorkshopContext` with the config above:

```
export const Example = () => {
  const workshopContext = useWorkshopContext(BASIC_CONFIG_DEFINITION);

  if (isAsyncStatus_Loading(workshopContext)) {
    // Render a loading state
  } else if (isAsyncStatus_Loaded(workshopContext)) {
    const loadedWorkshopContext = workshopContext.value;

    const { stringField, workshopEvent, listOfField } = loadedWorkshopContext;

    // Examples of retrieving single field values.
    const stringValue: IAsyncLoaded<string> | undefined = stringField.fieldValue;

    // Examples of retrieving listOf field values.
    listOfFields.forEach(listLayer => {
        const booleanListValue: IAsyncLoaded<boolean[]> | undefined = listLayer.booleanListField.fieldValue;
    });

    // Examples of setting single field values.
    stringValue.setLoading();
    stringValue.setLoadedValue("Hello world!");
    stringValue.setReloadingValue("Hello world is reloading.");
    stringValue.setFailedWithError("Hello world failed to load.");

    // Examples of setting listOf field values.
    listOfFields.forEach((listLayer, index) => {
        listLayer.booleanListField.setLoading();
        listLayer.booleanListField.setLoadedValue(`Hello world is set on listOf layer ${index}`);
        listLayer.booleanListField.setReloadingValue(`Hello world is reloading on listOf layer ${index}`);
        listLayer.booleanListField.setFailedWithError(`Hello world failed to load on listOf layer ${index}`);
    });


    // Example of executing event. Takes a React MouseEvent, React KeyboardEvent, or undefined if those are not applicable
    workshopEvent.executeEvent(undefined);


    return <div>{Render something here.}</div>;
  } else if (isAsyncStatus_FailedLoading(workshopContext)) {
    // Render a failure state
  }
};
```

## FAQ's

1. Why is the context object returned by `useWorkshopContext` wrapped in an async loading state?
   Please refer to the diagram Figure 1.a and 1.b. When your React app is iframed inside of Workshop, the context object will not exist until Workshop accepts the config parameter and as such will be in a loading state until it is accepted. It may also be rejected by Workshop and as such will be wrapped in a failed to load async state with an accompanying error message.

2. Why should I provide default values when defining the config passed to `useWorkshopContext`?
   During development when your React app is not iframed in Workshop, its not receiving any values and as such it would make development difficult if all you had to work with were a forever loading context object or a loaded context object with null values. Allowing you to provide default values when defining the config that gets translated to the context object returned by `useWorkshopContext` helps you during development when the app is not being iframed, as the plugin will detect whether your app is being iframed and if not, will return a loaded context object populated with your default values.

3. Why is each value inside the context object returned by `useWorkshopContext` wrapped in with an async loading state?
   Workshop's variables each have an async loading state, as variables could come from asynchronous origins, such as a function that takes 10 seconds to return a value. Having a 1:1 match between the types in the context object and Workshop means that the two can be in sync concerning the state of the shared variable values. If a variable in Workshop goes into a loading state or fails to load, reflecting that in the iframed React app makes for consistency.

## License

TODO

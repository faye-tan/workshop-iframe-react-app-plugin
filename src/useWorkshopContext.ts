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
import { IConfigDefinition } from "./types/configDefinition";
import {
  IAsyncLoaded,
  asyncStatusLoading,
  asyncStatusLoaded,
  asyncStatusFailed,
} from "./types/loadingState";
import {
  MESSAGE_TYPES_TO_WORKSHOP,
  MESSAGE_TYPES_FROM_WORKSHOP,
  IMessageFromWorkshop,
} from "./types/messages";
import { isInsideIframe, sendMessageToWorkshop } from "./utils";
import { IWorkshopContext } from "./types/workshopContext";
import { IConfigValueMap } from "./types/configValues";
import { createDefaultConfigValueMap } from "./createDefaultConfigValueMap";
import { transformConfigWorkshopContext } from "./transformConfigToWorkshopContext";

/**
 * Given the definition of config fields, returns a context object in an async wrapper with properties of the requested fields' IDs,
 * and depending on the field type, each property contains either a value in an async wrapper with setter methods or a method to execute a Workshop event.
 *
 * @param configFields: IConfigDefinition
 * @returns IAsyncLoaded<IWorkshopContext>, a context object in an async wrapper.
 */
export function useWorkshopContext<T extends IConfigDefinition>(
  configFields: IConfigDefinition
): IAsyncLoaded<IWorkshopContext<T>> {
  // The context's definition
  const [configDefinition] = React.useState<IConfigDefinition>(configFields);
  // The context's values
  const [configValues, setConfigValues] = React.useState<IConfigValueMap>(
    createDefaultConfigValueMap(configFields)
  );

  // The id of the corresponding widget
  const [iframeWidgetId, setIframeWidgetId] = React.useState<string>();

  // Boolean checks
  const [isConfigRejectedByWorkshop, setIsConfigRejectedByWorkshop] =
    React.useState<boolean>(false);
  const [workshopReceivedConfig, setWorkshopReceivedConfig] =
    React.useState<boolean>(false);

  /**
   * Handles each type of message received from Workshop.
   */
  const messageHandler = React.useCallback(
    (event: MessageEvent<IMessageFromWorkshop>) => {
      // only process messages from the parent window (otherwise messages posted by 3rd party widgets may be processed)
      if (event.source !== window.parent || window.parent === window) {
        return;
      }
      const message = event.data;
      switch (message.type) {
        case MESSAGE_TYPES_FROM_WORKSHOP.CONFIG_ACCEPTED:
          setIframeWidgetId(message.iframeWidgetId);
          setWorkshopReceivedConfig(true);
          setConfigValues(message.configValues);
          return;
        case MESSAGE_TYPES_FROM_WORKSHOP.CONFIG_REJECTED:
          setIframeWidgetId(message.iframeWidgetId);
          setIsConfigRejectedByWorkshop(true);
          return;
        case MESSAGE_TYPES_FROM_WORKSHOP.VALUE_CHANGE:
          if (message.iframeWidgetId === iframeWidgetId) {
            setConfigValues(message.configValues);
          }
          return;
      }
    },
    [
      iframeWidgetId,
    ]
  );

  // Once on mount
  React.useEffect(() => {
    sendMessageToWorkshop({
        type: MESSAGE_TYPES_TO_WORKSHOP.SENDING_CONFIG, 
        config: configFields, 
    });
  }, []);

  React.useEffect(() => {
    window.addEventListener("message", messageHandler);

    return () => {
        window.removeEventListener("message", messageHandler);
    }
}, [messageHandler]);

  const insideIframe = isInsideIframe();

  // If not inside iframe, simply return the loaded context with default values
  if (!insideIframe) {
    return asyncStatusLoaded(
      transformConfigWorkshopContext(
        configDefinition,
        configValues,
        setConfigValues,
        iframeWidgetId
      )
    );
  }

  // Config was not accepted by workshop, return failed
  if (isConfigRejectedByWorkshop && insideIframe) {
    return asyncStatusFailed(
      "Workshop rejected the config definition. This is likely due to an API break, as the Workshop iframe's existing saved config is not a subset of the provided config."
    );
  }

  // Finally, if inside iframe and Workshop has signalled that the config was received,
  // return the loaded context otherwise return that the context is loading.
  return workshopReceivedConfig && insideIframe
    ? asyncStatusLoaded(
        transformConfigWorkshopContext(
          configDefinition,
          configValues,
          setConfigValues,
          iframeWidgetId
        )
      )
    : asyncStatusLoading();
}

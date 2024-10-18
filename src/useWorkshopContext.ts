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
  IWorkshopAcceptedConfigMessage,
  IWorkshopRejectedConfigMessage,
  IValueChangeFromWorkshopMessage,
} from "./types/messages";
import { assertNever, isInsideIframe, sendMessageToWorkshop } from "./utils";
import { IWorkshopContext } from "./types/workshopContext";
import { IConfigValueMap } from "./types/configValues";
import { createDefaultConfigValueMap } from "./createDefaultConfigValueMap";
import { transformConfigWorkshopContext } from "./transformConfigToWorkshopContext";
import { isEmpty } from "lodash-es";

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
  const [
    isChangeValueListenerInitialized,
    setIsChangeValueListenerInitialized,
  ] = React.useState<boolean>(false);
  const [workshopReceivedConfig, setWorkshopReceivedConfig] =
    React.useState<boolean>(false);

  // Once on mount, initialize listeners
  React.useEffect(() => {
    sendConfigDefinitionToWorkshop(configFields);
    window.addEventListener("message", configMessageHandler);
  }, []);

  // Only once iframeWidgetId is defined should a listener be added for value changes from Workshop
  React.useEffect(() => {
    if (isChangeValueListenerInitialized && !isEmpty(iframeWidgetId)) {
      return;
    }
    window.addEventListener("message", changeValueMessageHandler);
    setIsChangeValueListenerInitialized(true);
  }, [iframeWidgetId]);

  /**
   * Entire tree of values is passed from Workshop.
   */
  const handleValueChangeFromWorkshop = React.useCallback(
    (newConfigValues: IConfigValueMap, iframeWidgetIdFromWorkshop: string) => {
      // Only set map of config values if iframeWidgetId received from Workshop matches saved iframeWidgetId
      if (iframeWidgetIdFromWorkshop === iframeWidgetId) {
        setConfigValues(newConfigValues);
      }
    },
    [iframeWidgetId]
  );

  /**
   * Handles value change messages received from Workshop.
   */
  const changeValueMessageHandler = React.useCallback(
    (event: MessageEvent<IValueChangeFromWorkshopMessage>) => {
      if (event.source !== window.parent || window.parent === window) {
        return;
      }

      const message = event.data;
      if (message.type === MESSAGE_TYPES_FROM_WORKSHOP.VALUE_CHANGE) {
        handleValueChangeFromWorkshop(
          message.inputValues,
          message.iframeWidgetId
        );
        return;
      }
    },
    [handleValueChangeFromWorkshop]
  );

  /**
   * Handles config related message received from Workshop.
   */
  const configMessageHandler = (
    event: MessageEvent<
      IWorkshopAcceptedConfigMessage | IWorkshopRejectedConfigMessage
    >
  ) => {
    // only process messages from the parent window (otherwise messages posted by 3rd party widgets may be processed)
    if (event.source !== window.parent || window.parent === window) {
      return;
    }

    const message = event.data;
    switch (message.type) {
      case MESSAGE_TYPES_FROM_WORKSHOP.CONFIG_ACCEPTED:
        handleWorkshopAcceptedConfigMessage(message.iframeWidgetId);
        return;
      case MESSAGE_TYPES_FROM_WORKSHOP.CONFIG_REJECTED:
        handleWorkshopRejectedConfigMessage();
        return;
      default:
        assertNever(
          `Unknown IMessageFromWorkshop type ${message} when handling a config message from Workshop`,
          message
        );
    }
  };

  /**
   * Only receives a message of type IWorkshopAcceptedConfigMessage, and once received, fills in values, outputTypes, eventIds with given values.
   */
  const handleWorkshopAcceptedConfigMessage = (iframeWidgetId: string) => {
    setWorkshopReceivedConfig(true);
    setIframeWidgetId(iframeWidgetId);
  };

  /**
   * This will determine whether the hook should return asyncFailedLoaded status
   */
  const handleWorkshopRejectedConfigMessage = () => {
    setIsConfigRejectedByWorkshop(true);
  };

  /**
   * Pass the config definition to Workshop
   * If it's on a brand new iframe widget, the definition gets saved
   * If it's on an existing iframe widget, the definition gets reconciled with the saved definition.
   */
  const sendConfigDefinitionToWorkshop = (configFields: IConfigDefinition) => {
    sendMessageToWorkshop({
      type: MESSAGE_TYPES_TO_WORKSHOP.SENDING_CONFIG,
      config: configFields,
    });
  };

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

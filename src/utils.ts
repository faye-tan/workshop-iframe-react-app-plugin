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
import { IConfigDefinition } from "./types/configDefinition";
import { IMessageToWorkshop, MESSAGE_TYPES_TO_WORKSHOP } from "./types/messages";

/**
 * Sends a message to Workshop through the parent window.
 */
export function sendMessageToWorkshop(message: IMessageToWorkshop) {
    window.parent.postMessage(JSON.stringify(message), "*");
}

/**
 * Detect whether app is in Dev Console in order to use default values 
 */
export function isInsideIframe(): boolean { 
    // TODO generalize this to all stacks
    const isIframedInDevConsole = window.self.location.origin !== "https://swirl-containers.palantirfoundry.com";

    // Need try/catch since browsers can block access to window.top due to same origin policy. IE bugs also take place.
    try {
        return window.self !== window.top || isIframedInDevConsole;
    } catch (e) {
        return true;
    }
}

/**
 * Throws an error when a value isn't a `never` as expected. Used for guaranteeing exhaustive checks
 * and preventing further code from running when in an unexpected state.
 *
 * @param message A description of why a `never` type is expected.
 * @param value   The value that should be `never`.
 */
export function assertNever(message: string, value: never): never {
    throw new Error(`assertNever condition failed: ${message} (${JSON.stringify(value)})`);
}

/**
     * Pass the config definition to Workshop
     * If it's on a brand new iframe widget, the definition gets saved
     * If it's on an existing iframe widget, the definition gets reconciled with the saved definition. 
     */
export function sendConfigDefinitionToWorkshop(configFields: IConfigDefinition) {
    sendMessageToWorkshop({
        type: MESSAGE_TYPES_TO_WORKSHOP.SENDING_CONFIG, 
        config: configFields, 
    })
} 
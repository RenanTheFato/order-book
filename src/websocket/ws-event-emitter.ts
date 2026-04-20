import { EventEmitter } from "events";

export const wsEventEmitter = new EventEmitter()

wsEventEmitter.setMaxListeners(1000)
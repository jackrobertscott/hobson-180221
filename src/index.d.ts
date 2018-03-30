// Type definitions for hobson 0.7.5
// Project: https://github.com/jackrobertscott/hobson

///<reference types="node" />

import core from './index';
import { Mongoose } from 'mongoose';

declare namespace hobson {
  interface Resource {
    /**
     * Constructor
     */
    ({
      name: string,
      schema: any,
      address: string,
      disable: array,
      unsecure: boolean,
      timestamps: boolean,
      safe: boolean,
    }): Resource;

    /**
     * 
     */
    defaults(): Map;

    /**
     * 
     */
    model(): Mongoose.model;

    /**
     * 
     * @param id 
     */
    route(id: string): Route;

    /**
     * 
     * @param id 
     * @param endpoint 
     */
    addEndpoint(id: string, endpoint: object): Resource;

    /**
     * 
     * @param id 
     * @param middleware 
     */
    addMiddleware(id: string, middleware: function): Resource;

    /**
     * 
     * @param id 
     * @param hook 
     */
    addPreHook(id: string, hook: function): Resource;

    /**
     * 
     * @param id 
     * @param hook 
     */
    addPostHook(id: string, hook: function): Resource;

    /**
     * 
     * @param id 
     * @param permission 
     */
    addPermission(id: string, permission: function): Resource;

    /**
     * 
     */
    compile(): void;

    /**
     * 
     * @param app 
     */
    attach(app: Express): void;
  }
  interface UserResource extends core.UserResouce {}
  interface TokenResource extends core.TokenResource {}
  interface ResponseError extends core.ResponseError {}
  interface connect extends core.connect {}
  interface access extends core.access {}
}
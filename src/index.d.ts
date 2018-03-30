// Type definitions for hobson 0.7.5
// Project: https://github.com/jackrobertscott/hobson

///<reference types="node" />

import { Mongoose } from 'mongoose';

declare namespace hobson {
  interface Resource {
    /**
     * Resource constructor
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
     */
    route(id: string): Route;

    /**
     * 
     */
    addEndpoint(id: string, endpoint: object): Resource;

    /**
     * 
     */
    addMiddleware(id: string, middleware: function): Resource;

    /**
     * 
     */
    addPreHook(id: string, hook: function): Resource;

    /**
     * 
     */
    addPostHook(id: string, hook: function): Resource;

    /**
     * 
     */
    addPermission(id: string, permission: function): Resource;

    /**
     * 
     */
    compile(): void;

    /**
     * 
     */
    attach(app: Express): void;
  }
  interface UserResource {

  }
  interface TokenResource {

  }
  interface ResponseError {

  }
  interface connect {

  }
  interface access {
    
  }
}
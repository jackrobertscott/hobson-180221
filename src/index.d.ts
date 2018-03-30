// Type definitions for hobson 0.7.5
// Project: https://github.com/jackrobertscott/hobson

///<reference types="node" />

import { Mongoose } from 'mongoose';
import { Secret } from 'jsonwebtoken';
import { Express } from 'express';

declare class Route {
  /**
   * 
   */
  constructor();

  /**
   * 
   */
  addEndpoint(endpoint: any): Route;

  /**
   * 
   */
  addMiddleware(middleware: function): Route;

  /**
   * 
   */
  addPreHook(hook: function): Route;

  /**
   * 
   */
  addPostHook(hook: function): Route;

  /**
   * 
   */
  addPermission(permission: function): Route;
}

declare namespace hobson {
  export class Resource {
    /**
     * 
     */
    static formatEndpoint(endpoint: any[]): any[];
    /**
     * Resource constructor
     */
    constructor(args: any);

    /**
     * 
     */
    defaults(): Map<string, any>;

    /**
     * 
     */
    model(): Mongoose['model'];

    /**
     * 
     */
    route(id: string): Route;

    /**
     * 
     */
    addEndpoint(id: string, endpoint: any): Resource;

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
  
  export class UserResource extends Resource {
    /**
     * 
     */
    constructor(args: any);

    /**
     * 
     */
    addExtensions(options: any): void;
  }

  export class TokenResource extends Resource {
    /**
     * 
     */
    static generate(secret: Secret, payload: string, options: any): string;

    /**
     * 
     */
    constructor(args: any);
  }

  export class ResponseError extends Error {
    constructor(error: any);
  }

  export function connect (args: any): void;
  
  export namespace access {
    /**
     * 
     */
    function isAnyone(): boolean;

    /**
     * 
     */
    function isTokenized(): boolean;

    /**
     * 
     */
    function isUser(): boolean;

    /**
     * 
     */
    function isOwner(args: any) :boolean;
  }
}
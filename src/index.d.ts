// Type definitions for hobson 0.7.5
// Project: https://github.com/jackrobertscott/hobson

///<reference types="node" />

import { Mongoose } from 'mongoose';
import { Secret } from 'jsonwebtoken';

declare namespace hobson {
  interface Resource {
    /**
     * 
     */
    static formatEndpoint(endpoint: any[]): any[];
    /**
     * Resource constructor
     */
    (args: any): Resource;

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
  
  interface UserResource extends Resource {
    /**
     * 
     */
    (args: any): UserResource;

    /**
     * 
     */
    addExtensions(options: any): void;
  }

  interface TokenResource extends Resource {
    /**
     * 
     */
    static generate(secret: Secret, payload: string | Object | Buffer, options: any): string;

    /**
     * 
     */
    (args: any): TokenResource;
  }

  interface ResponseError extends Error {
    (error: any): ResponseError;
  }

  function connect (args: any): void;
  
  interface access {
    /**
     * 
     */
    isAnyone(): boolean;

    /**
     * 
     */
    isTokenized(): boolean;

    /**
     * 
     */
    isUser(): boolean;

    /**
     * 
     */
    isOwner(args: any) :boolean;
  }
}
// Type definitions for hobson 0.7.5
// Project: https://github.com/jackrobertscott/hobson

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
  addMiddleware(middleware: () => void): Route;

  /**
   * 
   */
  addPreHook(hook: () => void): Route;

  /**
   * 
   */
  addPostHook(hook: () => void): Route;

  /**
   * 
   */
  addPermission(permission: () => boolean): Route;
}

export declare class Resource {
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
  addMiddleware(id: string, middleware: () => void): Resource;

  /**
   * 
   */
  addPreHook(id: string, hook: () => void): Resource;

  /**
   * 
   */
  addPostHook(id: string, hook: () => void): Resource;

  /**
   * 
   */
  addPermission(id: string, permission: () => boolean): Resource;

  /**
   * 
   */
  compile(): void;

  /**
   * 
   */
  attach(app: Express): void;
}

export declare class UserResource extends Resource {
  /**
   * 
   */
  constructor(args: any);

  /**
   * 
   */
  addExtensions(options: any): void;
}

export declare class TokenResource extends Resource {
  /**
   * 
   */
  static generate(secret: Secret, payload: string, options: any): string;

  /**
   * 
   */
  constructor(args: any);
}

export declare class ResponseError extends Error {
  constructor(error: any);
}

export declare function connect (args: any): void;

export declare namespace access {
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
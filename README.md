# hobson

> Lightweight, minimalistic approach to fully functioning RESTful endpoints in [Express](https://github.com/expressjs/express/).

[![Build Status](https://travis-ci.org/jackrobertscott/hobson.svg?branch=master)](https://travis-ci.org/jackrobertscott/hobson) [![npm version](https://badge.fury.io/js/hobson.svg)](https://badge.fury.io/js/hobson) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Get up and running with a fully functioning CRUD api with minimum configuration. Simply set add your schema to a resource and attach it to your Express app.

## Features

RESTful endpoint features:

- Optional CRUD endpoints provided by default
- Custom endpoints can be added
- Endpoints are protected by default
- Provide permission functions to allow access
- Mongoose model schemas
- Pre and post hooks to all endpoints

## Install

Get started by installing hobson and mongoose (if you haven't already).

```sh
npm install --save hobson
```

[Mongoose](https://github.com/Automattic/mongoose) **is required** as it gives us awesome schema validation features.

```sh
npm install --save mongoose
```

###### Other options may be supported in the future.

## Usage

Hobson takes advantage of the awesome powers of Mongoose for defining schemas and models.

1. Create your Mongoose schema

```js
const mongoose = require('mongoose');

const unicornSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // same as userResource.modelName
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// custom mongoose functions, virtual properties, and more...

module.exports = unicornSchema;
```

2. Create the Hobson resource and attach it to your Express app.

```js
const { Resource } = require('hobson');
const unicornSchema = require('./unicornSchema');

const unicornResource = new Resource({
  name: 'unicorn',
  schema: unicornSchema,
  modelName: 'Unicorn', // optional: this will default to "Unicorn"
  path: '/unicorns', // optional: this will default to "/unicorns"
});

// other cool things...

unicornResource.attach(app);
```

### Endpoints Provided

The Hobson resource creates endpoints for you like you would on a regular RESTful api.

| Type          | Method      | Endpoint               | Example                                 |
|---------------|-------------|------------------------|-----------------------------------------|
| `find`        | get         | `/unicorns`            | `/unicorns?filter[color]=white`         |
| `findOne`     | get         | `/unicorns/:catId`     | `/unicorns/5a8ed7fabf4aabad60e41247`    |
| `create`      | post        | `/unicorns`            | `/unicorns`                             |
| `update`      | patch       | `/unicorns/:catId`     | `/unicorns/5a8ed7fabf4aabad60e41247`    |
| `remove`      | delete      | `/unicorns/:catId`     | `/unicorns/5a8ed7fabf4aabad60e41247`    |

You can also disable any unwanted default endpoints when defining the resource.

```js
const unicornResource = new Resource({
  name: 'unicorn',
  schema: unicornSchema,
  disable: ['find', 'remove'], // disabled
});
```

Here is how you create custom endpoints.

```js
unicornResource.addEndpoint('talkSmack', {
  path: '/talk/smack',
  method: 'get',
  handler: () => 'Yo mama!',
});
```

### Authentication

Routes are **protected by default**. Provide permission functions to give access to your users.

```js
unicornResource
  .addPermission('find', ({ user }) => {
    return true; // access given to everyone
  })
  .addPermission('talkSmack', ({ user }) => {
    return user.role === ROLE_ADMIN; // access given to only admins
  });
```

### Logic and Hooks

Provide hooks to your endpoints which will be run before and after the main handler. There is also a helpful `context` object which you can use to assign data to and access through out your function chain.

```js
unicornResource
  .addPreHook('talkSmack', ({ context }) => {
    context.appendMessage = 'Hi Fred,';
  })
  .addPostHook('talkSmack', ({ data, context }) => {
    console.log(context.appendMessage, data); // Hi Fred, Yo mama!
  })
```

Use old express middleware too. This will be run before all other functions.

```js
unicornResource.addMiddleware('talkSmack', (req, res, next) => {
  req.example = 'Make sure your old middleware functions call next()';
  next();
});
```

## Response Standards

Endpoints should return information is a specific format that is easy to read on the client.

The following standards are inspired by the work done on JSend. See there standards [here](https://labs.omniti.com/labs/jsend).

### Success

```json
{
  "status": "success",
  "code": 200,
  "data": {
    "unicorns": [
      {
        "_id": "110297391319273",
        "content": "This is a good unicorn.",
      },
      {
        "_id": "110297391319273",
        "content": "This is another unicorn.",
      }
    ],
  }
}
```

### Failed

```json
{
  "status": "fail",
  "code": 400,
  "message": "There was a validation error.",
  "data": {
    "title": {
      "unicorn": "Path `title` is required.",
      "kind": "required",
      "path": "title",
    },
    "magic.wands": {
      "unicorn": "Path `magic.wands` (10) is less than minimum allowed value (1000).",
      "kind": "min",
      "path": "magic.wands",
      "value": 10,
    }
  }
}
```

### Error

```json
{
  "status": "error",
  "code": 500,
  "message": "The server pooped itself.",
}
```

## Maintainers

- [Jack Scott](https://github.com/jackrobertscott)
- [Thomas Rayden](https://github.com/thomasraydeniscool)

## License

MIT

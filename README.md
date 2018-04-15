# hobson

> Lightweight, minimalistic approach to RESTful endpoints in [express](https://github.com/expressjs/express/).

[![Build Status](https://travis-ci.org/jackrobertscott/hobson.svg?branch=master)](https://travis-ci.org/jackrobertscott/hobson) [![npm version](https://badge.fury.io/js/hobson.svg)](https://badge.fury.io/js/hobson) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Get up and running with a fully functioning CRUD API, with minimum configuration. Get all the functionality of a fully loaded framework with only the smallest amount of configuration.

## Highlights

The hobson framework follows a RESTful approach. It uses *models* to define database relations and *resources* to provide endpoints to query the database.

- Provides commonly used CRUD endpoints out of the box
- Easily add and configure endpoints
- Endpoints take a *protected by default* approach to ensure security
- Provides stateless authentication using tokens
- Mongoose is used to provide great schema validation, hooks, etc.
- Before and after hooks are provided
- Easily integrates with existing express apps

## Install

Get started by installing hobson.

```sh
npm install --save hobson
```

Hobson uses [mongoose](https://github.com/Automattic/mongoose) under the hood as it gives us awesome schema validation features.

## Usage

Hobson is straight forwards in that it has 2 main types of components; models and resources. Models handle data interations and resources provide easy to use API endpoints.

**Step 1.** Create a model with a schema

File: `unicorn.model.js`

```js
const { Schema } = require('hobson');

const unicornSchema = Schema({
  shape: {
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', // same as userResource.name
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  options: {
    timestamps: false,
  },
});

// unicornSchema is a mongoose schema which means you can create virtuals, methods, etc. on it.

unicornSchema.virtual('today').get(() => Date.now());

module.exports = unicornSchema.compile('Unicorn'); // returns the Unicorn model
```

**Step 2.** Create a resource from a model

File: `unicorn.resource.js`

```js
const { Resource } = require('hobson');
const Unicorn = require('./unicorn.model.js');

const unicornResource = new Resource({ model: Unicorn });

// route configuration here...

module.exports = unicornResource;
```

**Step 3.** Connect to your express app

File: `app.js`

```js
const hobson = require('hobson');
const app = require('express')();

// add middlewares and configurations to express app...

hobson.attach({
  app,
  secret: process.env.SUPER_SECRET_FOR_AUTHENTICATION,
  resources: [
    unicornResource,
    // others...
  ],
});
```

### Endpoints

All endpoints have a unique string ID by which you can use to access them. To access an resource's endpoint, use the `get` method.

```js
unicornResource.get('findById');
```

To overwrite an endpoint, simply provide your endpoint configuration with the same ID value.

#### CRUD Endpoints Provided

The hobson resource creates endpoints for you like you would on a regular RESTful API.

| ID            | Method      | Endpoint                | Example                                 |
|---------------|-------------|-------------------------|-----------------------------------------|
| `find`        | get         | `/unicorns`             | `/unicorns?filter[color]=purple`        |
| `count`       | get         | `/unicorns/count`       | `/unicorns/count?filter[color]=yellow`  |
| `findOne`     | get         | `/unicorns/one`         | `/unicorns/one?include=horns`           |
| `findById`    | get         | `/unicorns/:unicornId`  | `/unicorns/5a8ed7fabf4aabad60e41247`    |
| `create`      | post        | `/unicorns`             | `/unicorns`                             |
| `update`      | patch       | `/unicorns/:unicornId`  | `/unicorns/5a8ed7fabf4aabad60e41247`    |
| `remove`      | delete      | `/unicorns/:unicornId`  | `/unicorns/5a8ed7fabf4aabad60e41247`    |

#### Custom Endpoints

Here is how you add custom endpoints to the resource.

File: `unicorn.resource.js`

```js
const findGreenUnicons = new Route({
  id: 'findGreenUnicons',
  path: '/green',
  methods: 'get',
  handler: async () => console.log('do things here'),
});

unicornResource.add(findGreenUnicorns);
```

### Authentication

Routes are *protected by default*. Provide permission functions to give access to your users.

File: `unicorn.resource.js`

```js
unicornResource.get('findGreenUnicorns')
  .access(({ user }) => {
    return user.role === ROLE_ADMIN; // access given to only admins
  });
```

### Logic & Hooks

Provide hooks to your endpoints which will run before and after the main handler. There is also a helpful `context` object which you can use to assign data to access throughout your function chain.

File: `unicorn.resource.js`

```js
unicornResource.get('findGreenUnicorns')
  .before(({ context }) => {
    context.appendMessage = 'Hi Fred,';
  })
  .after(({ data, context }) => {
    console.log(context.appendMessage, data); // Hi Fred, Yo mama!
  });
```

You can also use old express middleware too. When added, these will run before all the other functions.

File: `unicorn.resource.js`

```js
unicornResource.get('findGreenUnicorns')
  .middleware((req, res, next) => {
    req.example = 'Hello there!';
    next(); // important: make sure to call next
  });
```

## Response Standards

Endpoints should return information in a specific format so that it is easy to read on the client.

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
      "message": "Path `title` is required.",
      "kind": "required",
      "path": "title",
    },
    "magic.wands": {
      "message": "Path `magic.wands` (10) is less than minimum allowed value (1000).",
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

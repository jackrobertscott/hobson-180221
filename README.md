# hobson

> Lightweight, minimalistic approach to RESTful endpoints in [express](https://github.com/expressjs/express/).

[![Build Status](https://travis-ci.org/jackrobertscott/hobson.svg?branch=master)](https://travis-ci.org/jackrobertscott/hobson) [![npm version](https://badge.fury.io/js/hobson.svg)](https://badge.fury.io/js/hobson) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Get up and running with a fully functioning CRUD API, with minimum configuration. Get all the functionality of a fully loaded framework with only the smallest amount of configuration.

## Features

RESTful endpoint features:

- Optional CRUD endpoints provided by default
- Custom endpoints can be added
- Endpoints are protected by default
- Provide permission functions to allow access
- Mongoose model schemas
- Pre and post hooks to all endpoints

## Install

Get started by installing hobson.

```sh
npm install --save hobson
```

Hobson uses [mongoose](https://github.com/Automattic/mongoose) under the hood as it gives us awesome schema validation features.

## Usage

Hobson takes advantage of the awesome powers of mongoose for defining schemas and models.

**Step 1.** Create a schema

File: `unicorn.schema.js`

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

module.exports = unicornSchema;
```

**Step 2.** Create a model from the schema

File: `unicorn.model.js`

```js
const { create } = require('hobson');
const unicornSchema = require('./unicorn.schema.js');

const Unicorn = unicornSchema.compile('Unicorn');

module.exports = Unicorn;
```

**Step 3.** Create a resource

File: `unicorn.resource.js`

```js
const { Resource } = require('hobson');
const Unicorn = require('./unicorn.model.js');

const unicornResource = new Resource({ model: Unicorn });

// extra routes go here...

module.exports = unicornResource;
```

**Step 4.** Create additional routes

File: `unicorn.resource.js`

```js
const { Route, Resource } = require('hobson');

// ...

const findGreenUnicons = new Route({
  id: 'findGreenUnicons',
  path: '/green',
  methods: 'get',
  handler: async () => console.log('do things here'),
});

unicornResource.add(findGreenUnicorns);

module.exports = unicornResource;
```

**Step 5.** Connect hobson to express

```js
const app = express();

// add any middleware or routes...

connect({
  app,
  resources: [
    unicornResource,
    // others...
  ],
});
```

### Endpoints

#### CRUD Endpoints Provided

The hobson resource creates endpoints for you like you would on a regular RESTful API.

| Type          | Method      | Endpoint                | Example                                 |
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

Routes are **protected by default**. Provide permission functions to give access to your users.

```js
unicornResource.get('findGreenUnicorns')
  .access(({ user }) => {
    return user.role === ROLE_ADMIN; // access given to only admins
  });
```

### Logic and Hooks

Provide hooks to your endpoints which will run before and after the main handler. There is also a helpful `context` object which you can use to assign data to access throughout your function chain.

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

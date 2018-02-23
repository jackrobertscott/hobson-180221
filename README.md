# express-sleep
[![Build Status](https://travis-ci.org/jackrobertscott/express-sleep.svg?branch=master)](https://travis-ci.org/jackrobertscott/express-sleep)

Lightweight node.js package which takes a convention over configuration approach to RESTful endpoints using express.

## Goal

This package should allow you to create a fully working RESTful api with minimal configuration. Should only have to define a schema, add some custom endpoints and configure your authentication and you are done.

## Features

RESTful endpoint features:
- Optional CRUD endpoints provided by default
- Custom endpoints can be added
- Endpoints are protected by default
- Provide permission functions to allow access
- Mongoose model schemas
- Pre and post hooks to all endpoints

## Usage

Takes advantage of the awesome powers of mongoose for defining schemas and models.

```js
import mongoose from 'mongoose';

export const messageSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
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

export default messageSchema;
```

Create the resource.

```js
import messageSchema from './messageSchema';

const messageResource = new Resource({
  name: 'message',
  schema: messageSchema,
});

// other cool things...

messageResource.compile().attach(app);
```

Create custom endpoints.

```js
messageResource.addEndpoint('talkSmack', {
  path: '/talk/smack',
  method: 'get',
  handler: () => 'Yo mama!',
});
```

Routes are protected by default. Provide permission functions to give access to your users.

```js
messageResource.addPermission('talkSmack', ({ user }) => {
  return user.role === ROLE_ADMIN;
});
```

Provide hooks to your endpoints which will be run before and after the main handler. There is also a helpful `context` object which you can use to assign data to and access through out your function chain.

```js
messageResource
  .addPreHook('talkSmack', ({ context }) => {
    context.appendMessage = 'Hi Fred,';
  })
  .addPostHook('talkSmack', ({ data, context }) => {
    console.log(context.appendMessage, data); // Hi Fred, Yo mama!
  })
```

Use old express middleware too. This will be run before all other functions.

```js
messageResource.addMiddleware('talkSmack', (req, res, next) => {
  req.example = 'Make sure your old middleware functions call next()';
  next();
});
```

## Endpoint Standards

Endpoints should return information is a specific format that is easy to read on the client.

**Success**

```json
{
  "status": "success",
  "code": "200",
  "data": {
    "messages": [{
      "_id": "110297391319273",
      "content": "This is a good message.",
    }, {
      "_id": "110297391319273",
      "content": "This is another message.",
    }],
  }
}
```

**Failed**

```json
{
  "status": "failed",
  "code": "400",
  "data": {
    "tite": [{
      "type": "required",
      "message": "The title field is required.",
    }, {
      "type": "maxLength",
      "message": "The title field must be less than 20 charaters.",
    }],
  }
}
```

**Error**

```json
{
  "status": "errored",
  "code": "500",
  "message": "The server pooped itself."
}
```



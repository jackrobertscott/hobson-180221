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

Sleep takes advantage of the awesome powers of mongoose for defining schemas and models.

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

export default messageSchema;
```

Create the resource.

```js
import messageSchema from './messageSchema';

// create the resource
const messageResource = new Resource('message', messageSchema);

// attach the routes to the app
messageResource.attach(app);
```

Set up routes.

```js
const routes = new Map();

routes
  .set('findMessages', {
    path: '/',
    method: 'get',
    handler: findMessages,
    activate: [
      isOwner,
      ({ user }) => user.role === ROLE_ADMIN, // example access check
    ],
  })
  .set('findOneMessage', {
    path: '/:messageId',
    method: 'get',
    handler: async ({ req }) => {
      const { messageId } = req.params;
      if (!ObjectId.isValid(messageId)) {
        throw new Error('Request did not contain a valid id.')
      }
      const message = await Message.findById(messageId);
      if (!message) {
        throw new NotFoundError(`Message was not found with id "${messageId}".`);
      }
      return { message };
    },
    activate: [
      isOwner,
      ({ user }) => user.role === ROLE_ADMIN, // example access check
    ],
  })
```

Update the routes as see fit.

```js
const access = new Map();

access
  .set('findMessages', [
    isAnyone,
  ])
  .set('updateMessages', [
    isAdmin,
  ]);

const messageResource = new Resource('message', messageSchema, { access });
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



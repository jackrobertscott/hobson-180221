const { plural, singular } = require('pluralize');
const { expect, checkObjectId } = require('./helpers');
const { merge } = require('lodash');
const { BreakingResponse, NotFoundResponse } = require('../errors');

/**
 * Find many items in the database.
 *
 * @param {string} name the resource name
 */
module.exports.find = function find({ name, safe } = {}) {
  expect({ name: 'name', value: name, type: 'string' });
  return async ({ query: { filter, skip, limit, include, sort, select }, Model }) => {
    let options = {};
    if (safe) options = { deleted: false };
    const query = Model.find(merge(options, filter || {}));
    if (include) query.populate(include);
    if (sort) query.sort(sort);
    if (select) query.select(select);
    if (skip) query.skip(Number(skip));
    if (limit) query.limit(Number(limit));
    const value = await query.exec();
    if (!value) {
      throw new BreakingResponse({ message: `Error occurred when attempting to query the "${name}" model.` });
    }
    return {
      [plural(name)]: value,
    };
  };
};

/**
 * Count the number of items in the database.
 *
 * @param {string} name the resource name
 */
module.exports.count = function count({ name, safe } = {}) {
  expect({ name: 'name', value: name, type: 'string' });
  return async ({ query: { filter }, Model }) => {
    let options = {};
    if (safe) options = { deleted: false };
    const value = await Model.count(merge(options, filter || {}));
    if (typeof value !== 'number') {
      throw new BreakingResponse({ message: `Error occurred when attempting to query the "${name}" model.` });
    }
    return {
      count: value,
    };
  };
};

/**
 * Find one item in the database.
 *
 * @param {string} name the resource name
 */
module.exports.findOne = function findOne({ name, safe } = {}) {
  expect({ name: 'name', value: name, type: 'string' });
  return async ({ Model, query: { filter, include, select } }) => {
    let options = {};
    if (safe) options = { deleted: false };
    const query = Model.findOne(merge(options, filter || {}));
    if (include) query.populate(include);
    if (select) query.select(select);
    const value = await query.exec();
    if (!value) {
      throw new NotFoundResponse({ message: `Model ${name} did not have an item with the given parameters.` });
    }
    return {
      [singular(name)]: value,
    };
  };
};

/**
 * Find one item in the database by it's id.
 *
 * @param {string} name the resource name
 */
module.exports.findById = function findById({ name } = {}) {
  expect({ name: 'name', value: name, type: 'string' });
  return async ({ params, Model, query: { include, select } }) => {
    const id = params[`${name}Id`];
    checkObjectId(id);
    const query = Model.findById(id);
    if (include) query.populate(include);
    if (select) query.select(select);
    const value = await query.exec();
    if (!value) {
      throw new NotFoundResponse({ message: `Model ${name} did not have an item with the id "${id}".` });
    }
    return {
      [singular(name)]: value,
    };
  };
};

/**
 * Create a resource item in the database.
 *
 * @param {string} name the resource name
 */
module.exports.create = function create({ name } = {}) {
  expect({ name: 'name', value: name, type: 'string' });
  return async ({ body, Model }) => {
    const value = await Model.create(body);
    if (!value) {
      throw new BreakingResponse({ message: `Error occurred creating an item for "${name}" model.` });
    }
    return {
      [singular(name)]: value,
    };
  };
};

/**
 * Update a resource item in the database.
 *
 * @param {string} name the resource name
 */
module.exports.update = function update({ name } = {}) {
  expect({ name: 'name', value: name, type: 'string' });
  return async ({ params, body, Model }) => {
    const id = params[`${name}Id`];
    checkObjectId(id);
    const value = await Model.findById(id);
    if (!value) {
      throw new NotFoundResponse({ message: `Model ${name} did not have an item with the id "${id}".` });
    }
    await merge(value, body).save();
    return {
      [singular(name)]: value,
    };
  };
};

/**
 * Remove a resource from the database.
 *
 * @param {string} name the resource name
 */
module.exports.remove = function remove({ name, safe, timestamps } = {}) {
  expect({ name: 'name', value: name, type: 'string' });
  return async ({ params, Model }) => {
    const id = params[`${name}Id`];
    checkObjectId(id);
    if (safe) {
      const value = await Model.findById(id);
      if (!value) {
        throw new NotFoundResponse({ message: `Model ${name} did not have an item with the id "${id}".` });
      }
      const body = { deleted: true };
      if (timestamps) body.deletedAt = new Date();
      await merge(value, body).save();
    } else {
      await Model.findByIdAndRemove(id);
    }
    return {
      [singular(name)]: null,
    };
  };
};

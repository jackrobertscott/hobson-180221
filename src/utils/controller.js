const { camelCase } = require('change-case');
const { plural, singular } = require('pluralize');
const HTTPStatus = require('http-status');
const { checkString, checkObjectId } = require('./helpers');
const { ResponseError } = require('./errors');

/**
 * Find many items in the database.
 *
 * @param {string} name the resource name
 */
function find(name) {
  checkString(name, { method: camelCase(`find${name}`) });
  return async ({ query: { filter, skip, limit, include, sort, select }, Model }) => {
    const query = Model.find();
    if (filter) query.where(filter);
    if (include) query.populate(include);
    if (sort) query.sort(sort);
    if (select) query.select(select);
    if (skip) query.skip(Number(skip));
    if (limit) query.limit(Number(limit));
    const value = await query.exec();
    if (!value) {
      throw new ResponseError({ message: `Error occurred when attempting to query the "${name}" model.` });
    }
    return {
      [plural(name)]: value,
    };
  };
}
module.exports.find = find;

/**
 * Count the number of items in the database.
 *
 * @param {string} name the resource name
 */
function count(name) {
  checkString(name, { method: camelCase(`count${name}`) });
  return async ({ query: { filter }, Model }) => {
    const query = Model.count();
    if (filter) query.where(filter);
    const value = await query.exec();
    if (typeof value !== 'number') {
      throw new ResponseError({ message: `Error occurred when attempting to query the "${name}" model.` });
    }
    return {
      count: value,
    };
  };
}
module.exports.count = count;

/**
 * Find one item in the database.
 *
 * @param {string} name the resource name
 */
function findOne(name) {
  checkString(name, { method: camelCase(`findOne${name}`) });
  return async ({ Model, query: { filter, include, select } }) => {
    const query = Model.findOne();
    if (filter) query.where(filter);
    if (include) query.populate(include);
    if (select) query.select(select);
    const value = await query.exec();
    if (!value) {
      throw new ResponseError({
        message: `Model ${name} did not have an item with the given parameters.`,
        code: HTTPStatus.NOT_FOUND,
      });
    }
    return {
      [singular(name)]: value,
    };
  };
}
module.exports.findOne = findOne;

/**
 * Find one item in the database by it's id.
 *
 * @param {string} name the resource name
 */
function findById(name) {
  checkString(name, { method: camelCase(`findById${name}`) });
  return async ({ params, Model, query: { include, select } }) => {
    const id = params[`${name}Id`];
    checkObjectId(id);
    const query = Model.findById(id);
    if (include) query.populate(include);
    if (select) query.select(select);
    const value = await query.exec();
    if (!value) {
      throw new ResponseError({
        message: `Model ${name} did not have an item with the id "${id}".`,
        code: HTTPStatus.NOT_FOUND,
      });
    }
    return {
      [singular(name)]: value,
    };
  };
}
module.exports.findById = findById;

/**
 * Create a resource item in the database.
 *
 * @param {string} name the resource name
 */
function create(name) {
  checkString(name, { method: camelCase(`create${name}`) });
  return async ({ body, Model }) => {
    const value = await Model.create(body);
    if (!value) {
      throw new ResponseError({ message: `Error occurred creating an item for "${name}" model.` });
    }
    return {
      [singular(name)]: value,
    };
  };
}
module.exports.create = create;

/**
 * Update a resource item in the database.
 *
 * @param {string} name the resource name
 */
function update(name) {
  checkString(name, { method: camelCase(`update${name}`) });
  return async ({ params, body, Model }) => {
    const id = params[`${name}Id`];
    checkObjectId(id);
    const value = await Model.findById(id);
    if (!value) {
      throw new ResponseError({
        message: `Model ${name} did not have an item with the id "${id}".`,
        code: HTTPStatus.NOT_FOUND,
      });
    }
    await Object.assign(value, body).save();
    return {
      [singular(name)]: value,
    };
  };
}
module.exports.update = update;

/**
 * Remove a resource from the database.
 *
 * @param {string} name the resource name
 */
function remove(name) {
  checkString(name, { method: camelCase(`remove${name}`) });
  return async ({ params, Model }) => {
    const id = params[`${name}Id`];
    checkObjectId(id);
    await Model.findByIdAndRemove(id);
    return {
      [singular(name)]: null,
    };
  };
}
module.exports.remove = remove;

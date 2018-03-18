const { camelCase } = require('change-case');
const { plural, singular } = require('pluralize');
const HTTPStatus = require('http-status');
const { checkString, checkObjectId, createError } = require('./helpers');

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
      throw createError({ message: `Error occurred when attempting to query the "${name}" model.` });
    }
    return {
      [plural(name)]: value,
    };
  };
}
module.exports.find = find;

/**
 * Find one item in the database by it's id.
 *
 * @param {string} name the resource name
 */
function findOne(name) {
  checkString(name, { method: camelCase(`findOne${name}`) });
  return async ({ params, Model, query: { include, select } }) => {
    const id = params[`${name}Id`];
    checkObjectId(id);
    const query = Model.findById(id);
    if (include) query.populate(include);
    if (select) query.select(select);
    const value = await query.exec();
    if (!value) {
      throw createError({
        message: `Model ${name} did not have an item with the id "${id}".`,
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
 * Create a resource item in the database.
 *
 * @param {string} name the resource name
 */
function create(name) {
  checkString(name, { method: camelCase(`create${name}`) });
  return async ({ body, Model }) => {
    const value = await Model.create(body);
    if (!value) {
      throw createError({ message: `Error occurred creating an item for "${name}" model.` });
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
      throw createError({
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

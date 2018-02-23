const { camelCase } = require('change-case');
const { plural, singular } = require('pluralize');
const { checkString, checkObjectId, checkExists } = require('./util');

/**
 * Find many items in the database.
 *
 * @param {string} name the resource name
 */
function find(name) {
  checkString(name, { method: camelCase(`find${name}`) });
  return async ({ query: { filter }, model }) => {
    const value = await model.find(filter || {});
    checkExists(value);
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
  return async ({ params, model }) => {
    const id = params[`${name}Id`];
    checkObjectId(id);
    const value = await model.findById(id);
    checkExists(value, { message: `Model ${name} did not have an item with the id "${id}".` });
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
  return async ({ body, model }) => {
    const value = await model.create(body);
    checkExists(value, { message: `There was an error creating an item for ${name}.` });
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
  return async ({ params, body, model }) => {
    const id = params[`${name}Id`];
    checkObjectId(id);
    const value = await model.findById(id);
    checkExists(value, { message: `Model ${name} did not have an item with the id "${id}".` });
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
  return async ({ params, model }) => {
    const id = params[`${name}Id`];
    checkObjectId(id);
    await model.findByIdAndRemove(id);
    return {
      [singular(name)]: null,
    };
  };
}
module.exports.remove = remove;

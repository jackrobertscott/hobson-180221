const { camelCase } = require('change-case');
const { plural, singular } = require('pluralize');
const { checkString, checkObjectId, checkExists } = require('./util');

/**
 * Find many items in the database.
 *
 * @param {string} name the resource name
 */
module.exports.find = function find(name) {
  checkString(name, { method: camelCase(`find${name}`) });
  return async ({ req, model }) => {
    const { filter } = req.query;
    const value = await model.find(filter ? decodeURIComponent(filter) : {});
    checkExists(value);
    if (!value) {
      throw new Error('There was an error getting items from server.');
    }
    return {
      [plural(name)]: value,
    };
  };
};

/**
 * Find one item in the database by it's id.
 *
 * @param {string} name the resource name
 */
module.exports.findOne = function findOne(name) {
  checkString(name, { method: camelCase(`findOne${name}`) });
  return async ({ req, model }) => {
    console.log(`${name}Id`);
    const id = req.params[`${name}Id`];
    checkObjectId(id);
    const value = await model.findById(id);
    checkExists(value, { message: `Model ${name} did not have an item with the id "${id}".` });
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
module.exports.create = function create(name) {
  checkString(name, { method: camelCase(`create${name}`) });
  return async ({ req, model }) => {
    const value = await model.create(req.body);
    checkExists(value, { message: `There was an error creating an item for ${name}.` });
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
module.exports.update = function update(name) {
  checkString(name, { method: camelCase(`update${name}`) });
  return async ({ req, model }) => {
    const id = req.params[`${name}Id`];
    checkObjectId(id);
    const value = await model.findById(id);
    checkExists(value, { message: `Model ${name} did not have an item with the id "${id}".` });
    await Object.assign(value, req.body).save();
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
module.exports.remove = function remove(name) {
  checkString(name, { method: camelCase(`remove${name}`) });
  return async ({ req, model }) => {
    const id = req.params[`${name}Id`];
    checkObjectId(id);
    await model.findByIdAndRemove(id);
    return {
      [singular(name)]: null,
    };
  };
};

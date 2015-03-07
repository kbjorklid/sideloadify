var _ = require('lodash');

var getValue = module.exports.getValue = function (object, propertyPath, defaultValue) {
    var properties = propertyPath.split('.');
    return getValueForPropertyArray(object, properties, defaultValue);
};

var getValueForPropertyArray  = function (object, properties, defaultValue) {
    var val = object,
        i;
    for (i = 0; i < properties.length; ++i) {
        val = val[properties[i]];
        if (val === null) {
            if (i == properties.length - 1) {
                return null;
            } else {
                return defaultValue;
            }
        } else if (val === undefined) {
            return defaultValue;
        }
    }
    return val || defaultValue;
}


var getValueArray = function (target, propertyPathAsArray) {
    var nextPropertyName, restOfPath, value, result, hasMorePath;
    if (propertyPathAsArray.length === 0) {
        result = target;
        if (!_.isArray(result)) {
            result = [ result ];
        }
    } else if (_.isArray(target)) {
        result = [];
        _.forEach(target, function (targetElement) {
            result = result.concat(getValueArray(targetElement, propertyPathAsArray));
        });
    } else {
        nextPropertyName = propertyPathAsArray[0];
        restOfPath = propertyPathAsArray.slice(1);
        value = target[nextPropertyName];
        hasMorePath = restOfPath.length > 0;
        if (!hasMorePath) {
            result = [value];
        }
        if (_.isArray(value)) {
            result = [];
            _.forEach(value, function (item) {
                result = result.concat(getValueArray(item, restOfPath));
            })
        } else if (_.isObject(value)) {
            result = getValueArray(value, restOfPath);
        } else {
            result = undefined;
        }
    }
    return result;
};

module.exports.replaceWithIdArray = function replaceWithIdArray(targetObject, propertyPath, idAttribute) {
    var result = [];
    this.forEachProperty(targetObject, propertyPath, function (value, parent, lastPropertyName) {
        if (_.isArray(value)) {
            result = result.concat(value);
            parent[lastPropertyName] = asIdArray(value, idAttribute);
        } else {
            result.push(value);
            parent[lastPropertyName] = value[idAttribute];
        }
    });
    return result;
};

function asIdArray(objectArray, idAttributeName) {
    var result = [];
    _.forEach(objectArray, function(obj) {
        var id = obj[idAttributeName];
        if (id !== null && id !== undefined) {
            result.push(id);
        }
    });
    return result;
}


/**
 * Executes the given function for each property found through the given propertyPath.
 *
 * @param {object} targetObject - the object searched for properties matching the path
 * @param {String|String[]} propertyPath - the property path
 * @param {function} func - the function to
 */
module.exports.forEachProperty = function forEachProperty(targetObject, propertyPath, func) {
    if (_.isArray(propertyPath)) {
        propertyPath.forEach(function (pp) {
            forEachProperty(targetObject, pp, func);
        });
        return;
    }
    var parentsPropertyArray, lastPropertyName, parentsArray;

    parentsPropertyArray = propertyPath.split('.');
    lastPropertyName = parentsPropertyArray.pop();

    parentsArray = getValueArray(targetObject, parentsPropertyArray);
    _.forEach(parentsArray, function (parent) {
        var value;
        value = parent[lastPropertyName];
        if (value !== undefined) {
            func(value, parent, lastPropertyName);
        }
    });
};


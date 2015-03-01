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
    var nextProperty, restOfPath, value, result, hasMorePath;
    if (propertyPathAsArray.length === 0) {
        result = target;
        if (!_.isArray(result)) {
            result = [ result ];
        }
        return result;
    }

    nextProperty = propertyPathAsArray[0];
    restOfPath = propertyPathAsArray.slice(1);
    value = target[nextProperty];
    hasMorePath = restOfPath.length > 0;
    if (!hasMorePath) {
        result = [ value ];
    } if (_.isArray(value)) {
        result = [];
        _.forEach(value, function (item) {
            result = result.concat(getValueArray(item, restOfPath));
        })
    } else if (_.isObject(value)) {
        result = getValueArray(value, restOfPath);
    } else {
        result = undefined;
    }
    return result;
};

module.exports.replaceWithIdArray = function replaceWithIdArray(targetObject, propertyPath, idAttribute) {
    var parentsPropertyArray, lastPropertyName, parentsArray, result;
    result = [];

    parentsPropertyArray = propertyPath.split('.');
    lastPropertyName = parentsPropertyArray.pop();

    parentsArray = getValueArray(targetObject, parentsPropertyArray);
    _.forEach(parentsArray, function (parent) {
        var value = parent[lastPropertyName];
        if (value) {
            if (_.isArray(value)) {
                result = result.concat(value);
                parent[lastPropertyName] = asIdArray(value, idAttribute);
            } else {
                result.push(value);
                parent[lastPropertyName] = value[idAttribute];
            }
        }
    });
    return result;
}

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


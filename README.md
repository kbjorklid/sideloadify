[![Build Status](https://travis-ci.org/kbjorklid/sideloadify.svg)](https://travis-ci.org/kbjorklid/sideloadify)

# Sideloadify
Easily reformat JSON responses of a REST service to extract inline objects.

The motivation for this micro library is to be able to convert output from for instance [Bookshelf.js](http://bookshelfjs.org/) to match the format expected by [Ember](http://emberjs.com/) Data.

## Usage

You'll need to define a configuration object to pass along with the target object:

```javascript
var sideloadify = require('sideloadify');

// configuration:
var sideloadConfig = {
    wrapper: { singular: 'book', plural: 'books' },
    sideloading: [
        { property: 'chapters', idAttribute: 'id', as: 'chapters' }
    ]
};

// process
var result = sideloadify(target, config);
```

## Configuration
* ```wrapper``` contains the name for the property of the root object or array.
  * The value of the ```singular``` property is used if the root is an object
  * The value of the ```plural``` property is used if the root is an array
* ```sideloading``` is an array of definitions for how to extract inline objects and wrap them as sideloads.
  * ```property``` defines the name of the property of the sideload array. This may be a property path, e.g. ```user.roles```.
  * ```idAttribute``` contains the name of the id of the inline object. The value of this attribute will replace the inline object.
  * ```as```  defines the name of the property of the sideload array. If left undefined, the sideloads will not be added (only replace the inline objects with IDs).

The way configuration works and the capabilities are best demonstrated through the following examples

## Examples

### Simple sideload

```javascript
var book = {
  "id": 1
  "title": "Foo",
  "chapters": [
     { "id" : 1, "title": "First chapter" },
     { "id" : 2, "title": "Second chapter" }
  ]
};

var config = {
    wrapper: { singular: "book", plural: "books" },
    sideloading: [
        { property: "chapters", idAttribute: "id", as: "chapters" }
    ]
};

var result = sideloadify(book, config);
```

result:

```javascript
{
    "book": {
        "id": 1,
        "title": "Foo",
        "chapters": [1, 2];
    },
    "chapters": [
       { "id" : 1, "title": "First chapter" },
       { "id" : 2, "title": "Second chapter" }
    ]
}
```
### Multiple sideloads

```javascript
var book = {
  "id": 1
  "title": "Foo",
  "authors" : [
    { "id": 1, "name" : "John Snow" },
    { "id": 2, "name" : "Ned Stark"}
  ]
  "chapters": [
    { "id": 1, "title": "First chapter" },
    { "id": 2, "title": "Second chapter" }
  ]
};

var config = {
    wrapper: { singular: "book", plural: "books" },
    sideloading: [
      { property: "chapters", idAttribute: "id", as: "chapters" },
      { property: "authors", idAttribute: "id", as: "persons" }
    ]
};

var result = sideloadify(book, config);
```

result:

```javascript
{
  "book": {
    "id": 1,
    "title": "Foo",
    "chapters": [1, 2];
  },
  "chapters": [
    { "id" : 1, "title": "First chapter" },
    { "id" : 2, "title": "Second chapter" }
  ],
  "persons": [
    { "id" : 1, "name": "John Snow" },
    { "id" : 2, "name": "Ned Stark" }
  ]
}
```

### Sideload of array root

```javascript
var dealerships = [
  {
    "id": 1
    "name": "Bob's cars",
    "makes": [
      { "id" : 1, "name": "Fiat" },
      { "id" : 2, "name": "Volvo" }
    ]
  },
  {
    "id": 2
    "name": "Dan's vagons",
    "makes": [
      { "id" : 2, "name": "Volvo" },
      { "id" : 3, "name": "Porche" }
    ]
  }
];

var config = {
    wrapper: { singular: "dealership", plural: "dealerships" },
    sideloading: [
        { property: "makes", idAttribute: "id", as: "carMakes" }
    ]
};

var result = sideloadify(dealerships, config);
```

result:

```javascript
{
  "dealerships": [
    {
      "id": 1,
      "name": "Bob's cars",
      "makes": [1, 2];
      },
      {
      "id": 1,
      "name": "Dan's vagons",
      "makes": [2, 3];
    }
  ],
  "carMakes": [
    { "id" : 1, "name": "Fiat" },
    { "id" : 2, "name": "Volvo" },
    { "id" : 3, "name": "Porche" }
  ]
}
```

### Multiple sources for one sideload

```javascript
var book = {
  "id": 1
  "title": "Foo",
  "authors" : [
    { "id": 1, "name" : "John Snow" },
    { "id": 2, "name" : "Ned Stark"}
  ]
  "editors": [
    { "id": 3, "name": "Catelyn Stark" }
  ]
};

var config = {
    wrapper: { singular: "book", plural: "books" },
    sideloading: [
      { property: "authors", idAttribute: "id", as: "persons" },
      { property: "editors", idAttribute: "id", as: "persons" }
    ]
};

var result = sideloadify(book, config);
```

result:

```javascript
{
  "book": {
    "id": 1,
    "title": "Foo",
    "authors": [1, 2];
    "editors": [3];
  },
  "persons": [
    { "id" : 1, "name": "John Snow" },
    { "id" : 2, "name": "Ned Stark" },
    { "id" : 3, "name": "Catelyn Stark" }
  ]
}
```

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
* ```sideloading``` (optional) is an array of definitions (or a single definition) for how to extract inline objects and wrap them as sideloads.
  * ```property``` defines the [property path](#property-paths) the target to sideload.
  * ```idAttribute``` contains the name of the id of the inline object. The value of this attribute will replace the inline object.
  * ```as``` (optional)  defines the name of the property of the sideload array. If left undefined, the sideloads will not be added (only replace the inline objects with IDs).
* ```delete``` (optional) is an array or a single string specifying the property path or property paths which should be deleted from the original object before other processing takes place.
* ```rename``` (optional) is an array or a single object specifying which property or properties should be renamed
  * ```property``` defines the property path of the property to rename.
  * ```name``` defines the new name for the property.

### Property paths
The property paths refer to a notation to identify the properties. See examples below

Given the JSON object
```javascript
{
  "id": 1,
  "metadata": { "publisher": "Acme Co.", "isbn": "9783832791629" },
  "chapters": [
    { "id" : 1, "title": "First chapter" },
    { "id" : 2, "title": "Second chapter" }
  ]
}
```
some of the property paths and their respective values would be:
* ```id``` : ```1```
* ```metadata.publisher``` : ```"Acme Co."```
* ```chapters.title``` : ```["First chapter", "Second chapter"]```

## Execution order
The execution order of the different operations is as follows:
1. delete
2. rename
3. move sideloads

You must take this into account if you need to rename the sideload array. See the
[Rename and sideload](#rename-and-sideload) example.


## Examples

### Simple sideload

```javascript
var book = {
  "id": 1,
  "title": "Foo",
  "chapters": [
     { "id" : 1, "title": "First chapter" },
     { "id" : 2, "title": "Second chapter" }
  ]
};

var config = {
    wrapper: { singular: "book", plural: "books" },
    sideloading: { property: "chapters", idAttribute: "id", as: "chapters" }
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

### Nested sideloads

```javascript
var nestedObjects = {
    name: "root",
    children : [
        {
            cid: 1,
            name : "child1",
            grandchildren: [
                {
                    gid: 1,
                    title : "grandChild1"
                }
            ]
        },
        {
            cid: 2,
            name : "child2",
            grandchildren: [
                {
                    gid: 2,
                    title : "grandChild2"
                },
                {
                    gid: 3,
                    title : "grandChild3"
                }
            ]
        }
    ]
};

var config = {
    wrapper: { singular : 'root' },
    sideloading: [
        { property : 'children', idAttribute : 'cid', as: 'children'},
        { property : 'children.grandchildren', idAttribute : 'gid', as: 'grandchildren'}
    ]
};

var result = sideloadify(book, config);
```

result:
```javascript
{
    root: { name: "root", children: [1, 2] },
    children: [
        { cid: 1, name: "child1", grandchildren: [1] },
        { cid: 2, name: "child2", grandchildren: [2, 3] }
    ],
    grandchildren: [
        { gid: 1, title: "grandChild1" },
        { gid: 2, title: "grandChild2" },
        { gid: 3, title: "grandChild3" }
    ]
}
```


### Single object sideload

```javascript
var employee = {
  "id": 1
  "name": "John Snow",
  "employer": {
    "id": 1,
    "name" : "Night's Watch"
  }
};

var config = {
    wrapper: { singular: "employee", plural: "employees" },
    sideloading: [
        { property: "employer", idAttribute: "id", as: "employers" }
    ]
};

var result = sideloadify(book, config);
```

result:

```javascript
{
    "employee": {
        "id": 1,
        "name": "John Snow",
        "employer": 1;
    },
    "employers": [
       { "id" : 1, "name": "Night's Watch" }
    ]
}
```

### Rename and sideload
Note that rename operations take place before extracting the sideloads, demonstrated by the following example:

```javascript
var book = {
  "id": 1,
  "title": "Foo",
  "chapters": [
     { "id" : 1, "title": "First chapter" },
     { "id" : 2, "title": "Second chapter" }
  ]
};

var config = {
    rename: { property: "chapters", name: "chapterList" },
    wrapper: { singular: "book", plural: "books" },
    sideloading: { property: "chapterList", idAttribute: "id", as: "chapters" }
};

var result = sideloadify(book, config);
```

result:

```javascript
{
    "book": {
        "id": 1,
        "title": "Foo",
        "chapterList": [1, 2]
    },
    "chapters": [
       { "id" : 1, "title": "First chapter" },
       { "id" : 2, "title": "Second chapter" }
    ]
}
```

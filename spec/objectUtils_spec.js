var objectUtils = require('../lib/objectUtils')

describe("ObjectUtils", function() {

    describe("forEachProperty", function () {

        var testObj = {
            propOne: "one",
            propTwo: {
                propThree: "three"
            },
            propFour: [
                {
                    propFive: "five-one",
                    propSix: [
                        {propSeven: "seven-one"},
                        {propSeven: "seven-two"}
                    ]
                },
                {
                    propFive: "five-two",
                    propSix: [
                        {propSeven: "seven-three"},
                        {propSeven: "seven-four"}
                    ]
                }
            ]
        };

        var collectArgumentsWithForEachProperty = function (targetObject, propertyPath) {
            var results = [];
            objectUtils.forEachProperty(targetObject, propertyPath, function (value, parent, lastPropertyName) {
                results.push({
                    value: value,
                    parent: parent,
                    lastPropertyName: lastPropertyName
                });
            });
            return results;
        };

        it("should exec single root object successfully", function () {
            expect(collectArgumentsWithForEachProperty(testObj, "propOne")).toEqual([
                { value: "one", parent: testObj, lastPropertyName: "propOne"}
            ]);
        });

        it("should exec single nested object successfully", function () {
            expect(collectArgumentsWithForEachProperty(testObj, "propTwo.propThree")).toEqual([
                { value: "three", parent: testObj.propTwo, lastPropertyName: "propThree"}
            ]);
        });

        it("should exec nested array successfully", function () {
            expect(collectArgumentsWithForEachProperty(testObj, "propFour.propFive")).toEqual([
                { value: "five-one", parent: testObj.propFour[0], lastPropertyName: "propFive"},
                { value: "five-two", parent: testObj.propFour[1], lastPropertyName: "propFive"}
            ]);
        });

        it("should exec two nested arrays successfully", function() {
            expect(collectArgumentsWithForEachProperty(testObj, "propFour.propSix.propSeven")).toEqual([
                { value: "seven-one", parent: testObj.propFour[0].propSix[0], lastPropertyName: "propSeven"},
                { value: "seven-two", parent: testObj.propFour[0].propSix[1], lastPropertyName: "propSeven"},
                { value: "seven-three", parent: testObj.propFour[1].propSix[0], lastPropertyName: "propSeven"},
                { value: "seven-four", parent: testObj.propFour[1].propSix[1], lastPropertyName: "propSeven"}
            ]);
        });

        it("should exec with root array successfully", function() {
            var arr = testObj.propFour;
            expect(collectArgumentsWithForEachProperty(arr, "propFive")).toEqual([
                { value: "five-one", parent: arr[0], lastPropertyName: "propFive"},
                { value: "five-two", parent: arr[1], lastPropertyName: "propFive"}
            ]);
        });

        it("should do stuff", function() {
            var arr = testObj.propFour;
            expect(collectArgumentsWithForEachProperty(arr, "propSix")).toEqual([
                { value: arr[0].propSix, parent: arr[0], lastPropertyName: "propSix"},
                { value: arr[1].propSix, parent: arr[1], lastPropertyName: "propSix"},
            ]);
        });

        it("should exec with root array and nested array successfully", function() {
            var arr = testObj.propFour;
            expect(collectArgumentsWithForEachProperty(arr, "propSix.propSeven")).toEqual([
                { value: "seven-one", parent: arr[0].propSix[0], lastPropertyName: "propSeven"},
                { value: "seven-two", parent: arr[0].propSix[1], lastPropertyName: "propSeven"},
                { value: "seven-three", parent: arr[1].propSix[0], lastPropertyName: "propSeven"},
                { value: "seven-four", parent: arr[1].propSix[1], lastPropertyName: "propSeven"}
            ]);
        });

    });

    describe("getValue", function() {
        var testObj = {
            intVal1 : 1,
            innerObject : {
                intVal2 : 2,
                nullVal : null
            }
        };

        it("should find correct first-tier int value", function() {
            expect(objectUtils.getValue(testObj, "intVal1")).toBe(1);
        });

        it("should find correct second-tier int value", function() {
            expect(objectUtils.getValue(testObj, "innerObject.intVal2")).toBe(2);
        });

        it("should return undefined for non-existent first-tier property", function () {
            expect(objectUtils.getValue(testObj, "doesNotExist")).toBeUndefined();
        });

        it("should return undefined for non-existent second-tier property", function () {
            expect(objectUtils.getValue(testObj, "innerObject.doesNotExist")).toBeUndefined();
        });

        it("should return object property value", function () {
            expect(objectUtils.getValue(testObj, "innerObject").intVal2).toBe(2);
        });

        it("should return null value correctly", function() {
            expect(objectUtils.getValue(testObj, "innerObject.nullVal")).toBeNull();
        });

        it("should return default value for undefined property", function() {
            expect(objectUtils.getValue(testObj, "doesNotExist", 100)).toBe(100);
        });
    });

    describe("replaceWithIdArray", function() {
        var buildTestObj = function () {
            return {
                secondTier : {
                    emptyArray : [],
                    objArray : [
                        {
                            objId : 1,
                            thing : "foo"
                        },
                        {
                            objId : 2,
                            bar : "baz"
                        }
                    ]
                },
                firstTierArray : [
                    {
                        id : 100
                    }
                ]
            };
        }


        it("should work for empty array", function() {
            var testObj = buildTestObj();
            objectUtils.replaceWithIdArray(testObj, "secondTier.emptyArray", "objId");
            expect(testObj.secondTier.emptyArray).toBeDefined();
            expect(testObj.secondTier.emptyArray.length).toBe(0);
        });

        it("should work for non-empty array", function () {
            var testObj = buildTestObj();
            objectUtils.replaceWithIdArray(testObj, "firstTierArray", "id");
            var arr = testObj.firstTierArray;
            expect(arr).toBeDefined();
            expect(arr.length).toBe(1);
            expect(arr[0]).toBe(100);
        });

        it("should work for nested non-empty array", function () {
            var testObj = buildTestObj();
            objectUtils.replaceWithIdArray(testObj, "secondTier.objArray", "objId");
            var arr = testObj.secondTier.objArray;
            expect(arr).toBeDefined();
            expect(arr.length).toBe(2);
            expect(arr[0]).toBe(1);
            expect(arr[1]).toBe(2);
        });

        it("should return the replaced array", function () {
            var testObj = buildTestObj();
            var result = objectUtils.replaceWithIdArray(testObj, "secondTier.objArray", "objId");
            expect(result).toBeDefined();
            expect(result.length).toBe(2);
            expect(result[0].objId).toBe(1);
            expect(result[0].thing).toBe("foo");
        });
    });
});

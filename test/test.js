var logger = require("tracer").console();
var FieldVal = require('fieldval');
var bval = require("../fieldval-basicval");
var assert = require("assert")

describe('FieldVal', function() {
    describe('get()', function() {
        it('should return value when the value is present', function() {
            var my_validator = new FieldVal({
                "my_value": 13
            })
            assert.equal(13, my_validator.get("my_value", bval.integer(true)));
            assert.equal(null, my_validator.end());
        })

        it('should return value when an optional value is present', function() {
            var my_validator = new FieldVal({
                "my_value": 17
            })
            assert.equal(17, my_validator.get("my_value", bval.integer(false)));
            assert.equal(null, my_validator.end());
        })

        it('should return an integer when an integer is requested and the value is an integer string and parse flag is true', function() {
            var my_validator = new FieldVal({
                "my_integer": "26"
            })
            assert.equal(26, my_validator.get("my_integer", bval.integer(true, {parse: true})));
            assert.equal(null, my_validator.end());
        })

        it('should create an error when an integer is requested and the value is an integer string, but parse flag is not set to true', function() {
            var my_validator = new FieldVal({
                "my_integer": "26"
            })
            assert.equal(null, my_validator.get("my_integer", bval.integer(true)));
            assert.deepEqual({"invalid":{"my_integer":{"error_message":"Incorrect field type. Expected integer.","error":2,"expected":"integer","received":"string"}},"error_message":"One or more errors.","error":0}, my_validator.end());
        })

        it('should return an email when an string of valid syntax is present', function() {
            var my_validator = new FieldVal({
                "my_email": "example-user@test.com"
            })
            assert.equal("example-user@test.com", my_validator.get("my_email", bval.string(true), bval.email()));
            assert.equal(null, my_validator.end());
        })

        it('should return a date string when an string of valid syntax is present', function() {
            var my_validator = new FieldVal({
                "my_date_1": "04/07/2014",
                "my_date_2": "1/2/34",
                "my_date_3": "1-2-34",
                "my_date_4": "29:2",
                "my_date_5": "2014 05 27",
                "my_date_6": "07/30/14",
                "my_date_7": "30/07/14",
                "my_date_8": "29/02/04"
            })

            var my_date_check = bval.date("DD/MM/YYYY");

            logger.log("Example 1: ", my_date_check("11/20//1992"));

            assert.equal("04/07/2014", my_validator.get("my_date_1", bval.string(true), bval.date("DD/MM/YYYY")));
            assert.equal("1/2/34", my_validator.get("my_date_2", bval.string(true), bval.date("D/M/YY")));
            assert.equal("1-2-34", my_validator.get("my_date_3", bval.string(true), bval.date("D-M-YY")));
            assert.equal("29:2", my_validator.get("my_date_4", bval.string(true), bval.date("D:M")));
            assert.equal("2014 05 27", my_validator.get("my_date_5", bval.string(true), bval.date("YYYY MM DD")));
            assert.equal("07/30/14", my_validator.get("my_date_6", bval.string(true), bval.date("MM/DD/YY")));
            assert.equal("30/07/14", my_validator.get("my_date_7", bval.string(true), bval.date("DD/MM/YY")));
            assert.equal("30/07/14", my_validator.get("my_date_8", bval.string(true), bval.date("DD/MM/YYYY")));
            assert.equal(null, my_validator.end());
        })

        it('should return a float when an float is requested and the value is a float string and parse flag is true', function() {
            var my_validator = new FieldVal({
                "my_float": "43.5"
            })
            assert.equal(43.5, my_validator.get("my_float", bval.float(true, {parse: true})));
            assert.equal(null, my_validator.end());
        })

        it('should create an error when an float is requested and the value is a float string, but parse flag is not set to true', function() {
            var my_validator = new FieldVal({
                "my_float": "43.5"
            })
            assert.equal(null, my_validator.get("my_float", bval.float(true)));
            assert.deepEqual({"invalid":{"my_float":{"error_message":"Incorrect field type. Expected float.","error":2,"expected":"float","received":"string"}},"error_message":"One or more errors.","error":0}, my_validator.end());
        })

        it('should create a custom error when one is provided (float)', function() {
            var my_validator = new FieldVal({
                "my_float": "42"
            })
            assert.equal(null, my_validator.get(
                "my_float", 
                bval.float(true, {
                    error:{
                        error: 1000,
                        error_message: "Please enter a number"
                    }
                })
            ));
            assert.deepEqual({"invalid":{"my_float":{"error":1000,"error_message":"Please enter a number"}},"error_message":"One or more errors.","error":0}, my_validator.end());
        })

        it('should create a custom error when one is provided (string)', function() {
            var my_validator = new FieldVal({
                "my_string": 42
            })
            assert.equal(null, my_validator.get(
                "my_string", 
                bval.string(true, {
                    error:{
                        error: 1001,
                        error_message: "Please enter text"
                    }
                })
            ));
            assert.deepEqual({"invalid":{"my_string":{"error":1001,"error_message":"Please enter text"}},"error_message":"One or more errors.","error":0}, my_validator.end());
        })

        it('should return null when the value is the wrong type', function() {
            var my_validator = new FieldVal({
                "my_string": 13
            })
            assert.equal(null, my_validator.get("my_string", bval.string(true)));
            assert.deepEqual({"invalid":{"my_string":{"error_message":"Incorrect field type. Expected string.","error":2,"expected":"string","received":"number"}},"error_message":"One or more errors.","error":0}, my_validator.end())
        })
    })
})
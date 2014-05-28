var _validator_ref;

if((typeof require) === 'function'){
    _validator_ref = require("fieldval");
} else {
    _validator_ref = Validator;
}

var BasicVal = {
    errors: {
        too_short: function(min_len) {
            return {
                error: 100,
                error_message: "Length is less than " + min_len
            }
        },
        too_long: function(max_len) {
            return {
                error: 101,
                error_message: "Length is greater than " + max_len
            }
        },
        too_small: function(min_val) {
            return {
                error: 102,
                error_message: "Value is less than " + min_val
            }
        },
        too_large: function(max_val) {
            return {
                error: 103,
                error_message: "Value is greater than " + max_val
            }
        },
        not_in_list: function() {
            return {
                error: 104,
                error_message: "Value is not a valid choice"
            }
        },
        cannot_be_empty: function() {
            return {
                error: 105,
                error_message: "Value cannot be empty."
            }
        },
        no_prefix: function(prefix) {
            return {
                error: 106,
                error_message: "Value does not have prefix: " + prefix
            }
        },
        invalid_email: function(prefix) {
            return {
                error: 107,
                error_message: "Invalid email address format."
            }
        }
    },
    integer: function(required,flags){
        return _validator_ref.type("integer",required,flags);
    },
    number: function(required,flags){
        return _validator_ref.type("number",required,flags);
    },
    array: function(required,flags){
        return _validator_ref.type("array",required,flags);
    },
    object: function(required,flags){
        return _validator_ref.type("object",required,flags);
    },
    float: function(required,flags){
        return _validator_ref.type("float",required,flags);
    },
    boolean: function(required,flags){
        return _validator_ref.type("boolean",required,flags);
    },
    string: function(required,flags){
        var operator = function(value, emit) {
            var error = _validator_ref.type("string",required,flags)(value);
            if(error) return error;

            if(!flags || flags.trim!==false){//If not explicitly false
                value = value.trim();
            }
            if (value.length === 0) {
                if(required || required===undefined){
                    return _validator_ref.REQUIRED_ERROR;
                } else {
                    return _validator_ref.NOT_REQUIRED_BUT_MISSING;
                }
            }
            emit(value);
        }
        if(flags!==undefined){
            flags.operator = operator;
            return flags
        }
        return operator;
    },
    min_length: function(min_len, flags) {
        var operator = function(value) {
            if (value.length < min_len) {
                return BasicVal.errors.too_short(min_len)
            }
        }
        if(flags!==undefined){
            flags.operator = operator;
            return flags
        }
        return operator;
    },
    max_length: function(max_len, flags) {
        var operator = function(value) {
            if (value.length > max_len) {
                return BasicVal.errors.too_long(max_len);
            }
        }
        if(flags!==undefined){
            flags.operator = operator;
            return flags
        }
        return operator;
    },
    minimum: function(min_val, flags) {
        var operator = function(value) {
            if (value < min_val) {
                return BasicVal.errors.too_small(min_val);
            }
        }
        if(flags!==undefined){
            flags.operator = operator;
            return flags
        }
        return operator;
    },
    maximum: function(max_val, flags) {
        var operator = function(value) {
            if (value > max_val) {
                return BasicVal.errors.too_large(max_val);
            }
        }
        if(flags!==undefined){
            flags.operator = operator;
            return flags
        }
        return operator;
    },
    range: function(min_val, max_val, flags) {
        //Effectively combines minimum and maximum
        var operator = function(value){
            if (value < min_val) {
                return BasicVal.errors.too_small(min_val);
            } else if (value > max_val) {
                return BasicVal.errors.too_large(max_val);
            }
        }
        if(flags!==undefined){
            flags.operator = operator;
            return flags
        }
        return operator;
    },
    one_of: function(array, flags) {
        var valid_values = [];
        for(var i = 0; i < array.length; i++){
            var option = array[i];
            if((typeof option) === 'object'){
                valid_values.push(option[0]);
            } else {
                valid_values.push(option);
            }
        }
        var operator = function(value) {
            if (valid_values.indexOf(value) === -1) {
                return BasicVal.errors.not_in_list();
            }
        }
        if(flags!==undefined){
            flags.operator = operator;
            return flags
        }
        return operator;
    },
    not_empty: function(trim, flags) {
        var operator = function(value) {
            if (trim) {
                if (value.trim().length === 0) {
                    return BasicVal.errors.cannot_be_empty();
                }
            } else {
                if (value.length === 0) {
                    return BasicVal.errors.cannot_be_empty();
                }
            }
        }
        if(flags!==undefined){
            flags.operator = operator;
            return flags
        }
        return operator;
    },
    prefix: function(prefix, flags) {
        var operator = function(value) {
            if (value.length >= prefix.length) {
                if (value.substring(0, prefix.length) != prefix) {
                    return BasicVal.errors.no_prefix(prefix);
                }
            } else {
                return BasicVal.errors.no_prefix(prefix);
            }
        }
        if(flags!==undefined){
            flags.operator = operator;
            return flags
        }
        return operator;
    },
    each: function(on_each, flags) {
        var operator = function(array, stop) {
            var validator = new _validator_ref(null);
            for (var i = 0; i < array.length; i++) {
                var value = array[i];

                var res = on_each(value,i);
                if (res != null) {
                    validator.invalid("" + i, res);
                }
            }
            var error = validator.end();
            if(error!=null){
                return error;
            }
        }
        if(flags!==undefined){
            flags.operator = operator;
            return flags
        }
        return operator;
    },
    email: function(flags){
        var operator = function(value) {
            var re = BasicVal.email_regex;
            if(!re.test(value)){
                return BasicVal.errors.invalid_email();
            } 
        }
        if(flags!==undefined){
            flags.operator = operator;
            return flags
        }
        return operator;
    }
}

BasicVal.email_regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

if (typeof module != 'undefined') {
    module.exports = BasicVal;
}
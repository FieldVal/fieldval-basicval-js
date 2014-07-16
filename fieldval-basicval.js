var logger;
if((typeof require) === 'function'){
    logger = require('tracer').console();
}

var _validator_ref;

if((typeof require) === 'function'){
    _validator_ref = require("fieldval");
} else {
    _validator_ref = FieldVal;
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
        invalid_email: function() {
            return {
                error: 107,
                error_message: "Invalid email address format."
            }
        },
        invalid_url: function() {
            return {
                error: 108,
                error_message: "Invalid url format."
            }
        },
        incorrect_length: function(len){
            return {
                error: 109,
                error_message: "Length is not equal to " + len
            }
        },
        no_suffix: function(suffix) {
            return {
                error: 110,
                error_message: "Value does not have suffix: " + suffix
            }
        },
        invalid_date_format: function() {
            return {
                error: 111,
                error_message: "Invalid date format."
            }
        },
        invalid_date: function() {
            return {
                error: 112,
                error_message: "Invalid date."
            }
        }
    },
    merge_required_and_flags: function(required, flags){
        if((typeof required)==="object"){
            flags = required;
        } else {
            if(!flags){
                flags = {};
            }
            flags.required = required;
        }
        return flags;
    },
    integer: function(required, flags){
        return _validator_ref.type("integer",BasicVal.merge_required_and_flags(required, flags));
    },
    number: function(required, flags){
        return _validator_ref.type("number",BasicVal.merge_required_and_flags(required, flags));
    },
    array: function(required, flags){
        return _validator_ref.type("array",BasicVal.merge_required_and_flags(required, flags));
    },
    object: function(required, flags){
        return _validator_ref.type("object",BasicVal.merge_required_and_flags(required, flags));
    },
    float: function(required, flags){
        return _validator_ref.type("float",BasicVal.merge_required_and_flags(required, flags));
    },
    boolean: function(required, flags){
        return _validator_ref.type("boolean",BasicVal.merge_required_and_flags(required, flags));
    },
    string: function(required, flags){
        flags = BasicVal.merge_required_and_flags(required, flags);
        var check = function(value, emit) {

            var core_check = _validator_ref.type("string",flags);
            if(typeof core_check === 'object'){
                //Passing flags turns the check into an object
                core_check = core_check.check;
            }

            //Passing emit means that the value can be changed
            var error = core_check(value,emit);
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
        }
        if(flags){
            flags.check = check;
            return flags
        }
        return {
            check: check
        }
    },
    length: function(len, flags) {
        var check = function(value) {
            if (value.length!==len) {
                return FieldVal.create_error(BasicVal.errors.incorrect_length, flags, len)
            }
        }
        if(flags){
            flags.check = check;
            return flags
        }
        return {
            check: check
        }
    },
    min_length: function(min_len, flags) {
        var check = function(value) {
            if (value.length < min_len) {
                return FieldVal.create_error(BasicVal.errors.too_short, flags, min_len)
            }
        }
        if(flags){
            flags.check = check;
            return flags
        }
        return {
            check: check
        }
    },
    max_length: function(max_len, flags) {
        var check = function(value) {
            if (value.length > max_len) {
                return FieldVal.create_error(BasicVal.errors.too_long, flags, max_len);
            }
        }
        if(flags){
            flags.check = check;
            return flags
        }
        return {
            check: check
        }
    },
    minimum: function(min_val, flags) {
        var check = function(value) {
            if (value < min_val) {
                return FieldVal.create_error(BasicVal.errors.too_small, flags, min_val);
            }
        }
        if(flags){
            flags.check = check;
            return flags
        }
        return {
            check: check
        }
    },
    maximum: function(max_val, flags) {
        var check = function(value) {
            if (value > max_val) {
                return FieldVal.create_error(BasicVal.errors.too_large, flags, max_val);
            }
        }
        if(flags){
            flags.check = check;
            return flags
        }
        return {
            check: check
        }
    },
    range: function(min_val, max_val, flags) {
        //Effectively combines minimum and maximum
        var check = function(value){
            if (value < min_val) {
                return FieldVal.create_error(BasicVal.errors.too_small, flags, min_val);
            } else if (value > max_val) {
                return FieldVal.create_error(BasicVal.errors.too_large, flags, max_val);
            }
        }
        if(flags){
            flags.check = check;
            return flags
        }
        return {
            check: check
        }
    },
    one_of: function(array, flags) {
        var valid_values = [];
        if(Object.prototype.toString.call(array) === '[object Array]'){
            for(var i = 0; i < array.length; i++){
                var option = array[i];
                if((typeof option) === 'object'){
                    valid_values.push(option[0]);
                } else {
                    valid_values.push(option);
                }
            }
        } else {
            for(var i in array){
                valid_values.push(i);
            }
        }
        var check = function(value) {
            if (valid_values.indexOf(value) === -1) {
                return FieldVal.create_error(BasicVal.errors.not_in_list, flags);
            }
        }
        if(flags){
            flags.check = check;
            return flags
        }
        return {
            check: check
        }
    },
    not_empty: function(trim, flags) {
        var check = function(value) {
            if (trim) {
                if (value.trim().length === 0) {
                    if(typeof flags.error){
                    }
                    return FieldVal.create_error(BasicVal.errors.cannot_be_empty, flags);
                }
            } else {
                if (value.length === 0) {
                    return FieldVal.create_error(BasicVal.errors.cannot_be_empty, flags);
                }
            }
        }
        if(flags){
            flags.check = check;
            return flags
        }
        return {
            check: check
        }
    },
    prefix: function(prefix, flags) {
        var check = function(value) {
            if (value.length >= prefix.length) {
                if (value.substring(0, prefix.length) != prefix) {
                    return FieldVal.create_error(BasicVal.errors.no_prefix, flags, prefix);
                }
            } else {
                return FieldVal.create_error(BasicVal.errors.no_prefix, flags, prefix);
            }
        }
        if(flags){
            flags.check = check;
            return flags
        }
        return {
            check: check
        }
    },
    suffix: function(suffix, flags) {
        var check = function(value) {
            if (value.length >= suffix.length) {
                if (value.substring(value.length-suffix.length, value.length) != suffix) {
                    return FieldVal.create_error(BasicVal.errors.no_suffix, flags, suffix);
                }
            } else {
                return FieldVal.create_error(BasicVal.errors.no_suffix, flags, suffix);
            }
        }
        if(flags){
            flags.check = check;
            return flags
        }
        return {
            check: check
        }
    },
    each: function(on_each, flags) {
        var check = function(array, stop) {
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
        if(flags){
            flags.check = check;
            return flags
        }
        return {
            check: check
        }
    },
    email: function(flags){
        var check = function(value) {
            var re = BasicVal.email_regex;
            if(!re.test(value)){
                return FieldVal.create_error(BasicVal.errors.invalid_email, flags);
            } 
        }
        if(flags){
            flags.check = check;
            return flags
        }
        return {
            check: check
        }
    },
    date: function(format, flags){

        var valid_components = {
            "YYYY": [4],
            "YY": [2],
            "MM": [2],
            "M": [1,2],
            "DD": [2],
            "D": [1,2],
            " ": 0,
            "-": 0,
            "/": 0,
            ":": 0
        }

        var format_array = [];

        var f = 0;
        var error = false;
        while(f < format.length && !error){
            var handled = false;
            for(var c in valid_components){
                var substring = format.substring(f,f+c.length);
                if(substring===c){
                    format_array.push(c);
                    f += c.length;
                    handled = true;
                    break;
                }
            }
            if(!handled){
                error = true;
            }
        }

        if(error){
            if(console.error){
                console.error("Invalid date format");
            }
        }

        var check = function(value) {
            var values = {};

            var i = 0;
            var current_component = null;
            var current_component_value = null;
            var component_index = -1;
            var error = false;
            while(i < value.length && !error){
                component_index++;
                current_component = format_array[component_index];
                current_component_value = valid_components[current_component];

                if(current_component_value===0){
                    //Expecting a particular delimiter
                    if(value[i]!==current_component){
                        error = true;
                        break;
                    } else {
                        i++;
                        continue;
                    }
                }

                var min = current_component_value[0];
                var max = current_component_value[current_component_value.length-1];

                var incremented = false;
                var numeric_string = "";
                for(var n = 0; n < max; n++){
                    var character = value[i + n];
                    if(character===undefined){
                        break;
                    }
                    var char_code = character.charCodeAt(0);
                    if(char_code < 48 || char_code > 57){
                        if(n===min){
                            //Stopped at min
                            break;
                        } else {
                            error = true;
                            break;
                        }
                    } else {
                        numeric_string+=character;
                    }
                }
                
                i += n;

                if(error){
                    break;
                }

                var int_val = parseInt(numeric_string);

                if(current_component==='YYYY' || current_component==='YY'){
                    values['year'] = int_val;
                } else if(current_component==='MM' || current_component==='M'){
                    values['month'] = int_val;
                } else if(current_component==='DD' || current_component==='D'){
                    values['day'] = int_val;
                }

            }

            if(error){
                return FieldVal.create_error(BasicVal.errors.invalid_date_format, flags);
            }


            if(values.month!==undefined){
                var month = values.month;
                if(month>12){
                    return FieldVal.create_error(BasicVal.errors.invalid_date, flags);
                }

                if(values.day){
                    var day = values.day;

                    if(values.year){
                        var year = values.year;
                        if(month==2){
                            if(year%400==0 || (year%100!=0 && year%4==0)){
                                if(day>29){
                                    return FieldVal.create_error(BasicVal.errors.invalid_date, flags);
                                }
                            } else {
                                if(day>28){
                                    return FieldVal.create_error(BasicVal.errors.invalid_date, flags);
                                }
                            }
                        }
                    }
    
                    if(month===4 || month===6 || month===9 || month===11){
                        if(day>30){
                            return FieldVal.create_error(BasicVal.errors.invalid_date, flags);
                        }
                    } else if(month===2){
                        if(day>29){
                            return FieldVal.create_error(BasicVal.errors.invalid_date, flags);
                        }
                    } else {
                        if(day>31){
                            return FieldVal.create_error(BasicVal.errors.invalid_date, flags);
                        }
                    }
                }
            } else {
                //Don't have month, but days shouldn't be greater than 31 anyway
                if(values.day){
                    if(values.day>31){
                        return FieldVal.create_error(BasicVal.errors.invalid_date, flags);
                    }
                }
            }

            //SUCCESS
            return;

        }
        if(flags){
            flags.check = check;
            return flags
        }
        return {
            check: check
        }
    },
    url: function(flags){
        var check = function(value) {
            var re = BasicVal.url_regex;
            if(!re.test(value)){
                return FieldVal.create_error(BasicVal.errors.invalid_url, flags);
            } 
        }
        if(flags){
            flags.check = check;
            return flags
        }
        return {
            check: check
        }
    }
}

BasicVal.email_regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
BasicVal.url_regex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

if (typeof module != 'undefined') {
    module.exports = BasicVal;
}
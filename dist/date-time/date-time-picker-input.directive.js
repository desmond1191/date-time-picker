import { Directive, ElementRef, EventEmitter, forwardRef, HostBinding, HostListener, Inject, Input, Optional, Output, Renderer2 } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { DOWN_ARROW } from '@angular/cdk/keycodes';
import { OwlDateTimeComponent } from './date-time-picker.component';
import { DateTimeAdapter } from './adapter/date-time-adapter.class';
import { OWL_DATE_TIME_FORMATS } from './adapter/date-time-format.class';
import { Subscription } from 'rxjs';
export var OWL_DATETIME_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(function () { return OwlDateTimeInputDirective; }),
    multi: true
};
export var OWL_DATETIME_VALIDATORS = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(function () { return OwlDateTimeInputDirective; }),
    multi: true
};
var OwlDateTimeInputDirective = (function () {
    function OwlDateTimeInputDirective(elmRef, renderer, dateTimeAdapter, dateTimeFormats) {
        var _this = this;
        this.elmRef = elmRef;
        this.renderer = renderer;
        this.dateTimeAdapter = dateTimeAdapter;
        this.dateTimeFormats = dateTimeFormats;
        this._selectMode = 'single';
        this.rangeSeparator = '~';
        this._values = [];
        this.dateTimeChange = new EventEmitter();
        this.dateTimeInput = new EventEmitter();
        this.dtPickerSub = Subscription.EMPTY;
        this.localeSub = Subscription.EMPTY;
        this.lastValueValid = true;
        this.onModelChange = function () {
        };
        this.onModelTouched = function () {
        };
        this.validatorOnChange = function () {
        };
        this.parseValidator = function () {
            return _this.lastValueValid ?
                null : { 'owlDateTimeParse': { 'text': _this.elmRef.nativeElement.value } };
        };
        this.minValidator = function (control) {
            if (_this.isInSingleMode) {
                var controlValue = _this.getValidDate(_this.dateTimeAdapter.deserialize(control.value));
                return (!_this.min || !controlValue ||
                    _this.dateTimeAdapter.compare(_this.min, controlValue) <= 0) ?
                    null : { 'owlDateTimeMin': { 'min': _this.min, 'actual': controlValue } };
            }
            else if (_this.isInRangeMode && control.value) {
                var controlValueFrom = _this.getValidDate(_this.dateTimeAdapter.deserialize(control.value[0]));
                var controlValueTo = _this.getValidDate(_this.dateTimeAdapter.deserialize(control.value[1]));
                return (!_this.min || !controlValueFrom || !controlValueTo ||
                    _this.dateTimeAdapter.compare(_this.min, controlValueFrom) <= 0) ?
                    null : { 'owlDateTimeMin': { 'min': _this.min, 'actual': [controlValueFrom, controlValueTo] } };
            }
        };
        this.maxValidator = function (control) {
            if (_this.isInSingleMode) {
                var controlValue = _this.getValidDate(_this.dateTimeAdapter.deserialize(control.value));
                return (!_this.max || !controlValue ||
                    _this.dateTimeAdapter.compare(_this.max, controlValue) >= 0) ?
                    null : { 'owlDateTimeMax': { 'max': _this.max, 'actual': controlValue } };
            }
            else if (_this.isInRangeMode && control.value) {
                var controlValueFrom = _this.getValidDate(_this.dateTimeAdapter.deserialize(control.value[0]));
                var controlValueTo = _this.getValidDate(_this.dateTimeAdapter.deserialize(control.value[1]));
                return (!_this.max || !controlValueFrom || !controlValueTo ||
                    _this.dateTimeAdapter.compare(_this.max, controlValueTo) >= 0) ?
                    null : { 'owlDateTimeMax': { 'max': _this.max, 'actual': [controlValueFrom, controlValueTo] } };
            }
        };
        this.filterValidator = function (control) {
            var controlValue = _this.getValidDate(_this.dateTimeAdapter.deserialize(control.value));
            return !_this._dateTimeFilter || !controlValue || _this._dateTimeFilter(controlValue) ?
                null : { 'owlDateTimeFilter': true };
        };
        this.rangeValidator = function (control) {
            if (_this.isInSingleMode || !control.value) {
                return null;
            }
            var controlValueFrom = _this.getValidDate(_this.dateTimeAdapter.deserialize(control.value[0]));
            var controlValueTo = _this.getValidDate(_this.dateTimeAdapter.deserialize(control.value[1]));
            return !controlValueFrom || !controlValueTo || _this.dateTimeAdapter.compare(controlValueFrom, controlValueTo) <= 0 ?
                null : { 'owlDateTimeRange': true };
        };
        this.validator = Validators.compose([this.parseValidator, this.minValidator, this.maxValidator, this.filterValidator, this.rangeValidator]);
        this.valueChange = new EventEmitter();
        this.disabledChange = new EventEmitter();
        if (!this.dateTimeAdapter) {
            throw Error("OwlDateTimePicker: No provider found for DateTimePicker. You must import one of the following " +
                "modules at your application root: OwlNativeDateTimeModule, OwlMomentDateTimeModule, or provide a " +
                "custom implementation.");
        }
        if (!this.dateTimeFormats) {
            throw Error("OwlDateTimePicker: No provider found for OWL_DATE_TIME_FORMATS. You must import one of the following " +
                "modules at your application root: OwlNativeDateTimeModule, OwlMomentDateTimeModule, or provide a " +
                "custom implementation.");
        }
        this.localeSub = this.dateTimeAdapter.localeChanges.subscribe(function () {
            _this.value = _this.value;
        });
    }
    Object.defineProperty(OwlDateTimeInputDirective.prototype, "owlDateTime", {
        set: function (value) {
            this.registerDateTimePicker(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlDateTimeInputDirective.prototype, "owlDateTimeFilter", {
        set: function (filter) {
            this._dateTimeFilter = filter;
            this.validatorOnChange();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlDateTimeInputDirective.prototype, "dateTimeFilter", {
        get: function () {
            return this._dateTimeFilter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlDateTimeInputDirective.prototype, "disabled", {
        get: function () {
            return this._disabled;
        },
        set: function (value) {
            if (this._disabled !== value) {
                this._disabled = value;
                this.disabledChange.emit(value);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlDateTimeInputDirective.prototype, "min", {
        get: function () {
            return this._min;
        },
        set: function (value) {
            this._min = this.getValidDate(this.dateTimeAdapter.deserialize(value));
            this.validatorOnChange();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlDateTimeInputDirective.prototype, "max", {
        get: function () {
            return this._max;
        },
        set: function (value) {
            this._max = this.getValidDate(this.dateTimeAdapter.deserialize(value));
            this.validatorOnChange();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlDateTimeInputDirective.prototype, "selectMode", {
        get: function () {
            return this._selectMode;
        },
        set: function (mode) {
            if (mode !== 'single' && mode !== 'range' &&
                mode !== 'rangeFrom' && mode !== 'rangeTo') {
                throw Error('OwlDateTime Error: invalid selectMode value!');
            }
            this._selectMode = mode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlDateTimeInputDirective.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) {
            value = this.dateTimeAdapter.deserialize(value);
            this.lastValueValid = !value || this.dateTimeAdapter.isValid(value);
            value = this.getValidDate(value);
            var oldDate = this.value;
            this._value = value;
            this.renderer.setProperty(this.elmRef.nativeElement, 'value', value ? this.dateTimeAdapter.format(value, this.dtPicker.formatString) : '');
            if (!this.dateTimeAdapter.isEqual(oldDate, value)) {
                this.valueChange.emit(value);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlDateTimeInputDirective.prototype, "values", {
        get: function () {
            return this._values;
        },
        set: function (values) {
            var _this = this;
            if (values && values.length > 0) {
                this._values = values.map(function (v) {
                    v = _this.dateTimeAdapter.deserialize(v);
                    return _this.getValidDate(v);
                });
                var from = this._values[0];
                var to = this._values[1];
                this.lastValueValid = (!from || this.dateTimeAdapter.isValid(from)) && (!to || this.dateTimeAdapter.isValid(to));
                var fromFormatted = from ? this.dateTimeAdapter.format(from, this.dtPicker.formatString) : '';
                var toFormatted = to ? this.dateTimeAdapter.format(to, this.dtPicker.formatString) : '';
                if (!fromFormatted && !toFormatted) {
                    this.renderer.setProperty(this.elmRef.nativeElement, 'value', null);
                }
                else {
                    if (this._selectMode === 'range') {
                        this.renderer.setProperty(this.elmRef.nativeElement, 'value', fromFormatted + ' ' + this.rangeSeparator + ' ' + toFormatted);
                    }
                    else if (this._selectMode === 'rangeFrom') {
                        this.renderer.setProperty(this.elmRef.nativeElement, 'value', fromFormatted);
                    }
                    else if (this._selectMode === 'rangeTo') {
                        this.renderer.setProperty(this.elmRef.nativeElement, 'value', toFormatted);
                    }
                }
            }
            else {
                this._values = [];
                this.renderer.setProperty(this.elmRef.nativeElement, 'value', '');
            }
            this.valueChange.emit(this._values);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlDateTimeInputDirective.prototype, "elementRef", {
        get: function () {
            return this.elmRef;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlDateTimeInputDirective.prototype, "isInSingleMode", {
        get: function () {
            return this._selectMode === 'single';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlDateTimeInputDirective.prototype, "isInRangeMode", {
        get: function () {
            return this._selectMode === 'range' || this._selectMode === 'rangeFrom'
                || this._selectMode === 'rangeTo';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlDateTimeInputDirective.prototype, "owlDateTimeInputAriaHaspopup", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlDateTimeInputDirective.prototype, "owlDateTimeInputAriaOwns", {
        get: function () {
            return (this.dtPicker.opened && this.dtPicker.id) || null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlDateTimeInputDirective.prototype, "minIso8601", {
        get: function () {
            return this.min ? this.dateTimeAdapter.toIso8601(this.min) : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlDateTimeInputDirective.prototype, "maxIso8601", {
        get: function () {
            return this.max ? this.dateTimeAdapter.toIso8601(this.max) : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OwlDateTimeInputDirective.prototype, "owlDateTimeInputDisabled", {
        get: function () {
            return this.disabled;
        },
        enumerable: true,
        configurable: true
    });
    OwlDateTimeInputDirective.prototype.ngOnInit = function () {
        if (!this.dtPicker) {
            throw Error("OwlDateTimePicker: the picker input doesn't have any associated owl-date-time component");
        }
    };
    OwlDateTimeInputDirective.prototype.ngAfterContentInit = function () {
        var _this = this;
        this.dtPickerSub = this.dtPicker.confirmSelectedChange.subscribe(function (selecteds) {
            if (Array.isArray(selecteds)) {
                _this.values = selecteds;
            }
            else {
                _this.value = selecteds;
            }
            _this.onModelChange(selecteds);
            _this.onModelTouched();
            _this.dateTimeChange.emit({ source: _this, value: selecteds, input: _this.elmRef.nativeElement });
        });
    };
    OwlDateTimeInputDirective.prototype.ngOnDestroy = function () {
        this.dtPickerSub.unsubscribe();
        this.localeSub.unsubscribe();
        this.valueChange.complete();
        this.disabledChange.complete();
    };
    OwlDateTimeInputDirective.prototype.writeValue = function (value) {
        if (this.isInSingleMode) {
            this.value = value;
        }
        else {
            this.values = value;
        }
    };
    OwlDateTimeInputDirective.prototype.registerOnChange = function (fn) {
        this.onModelChange = fn;
    };
    OwlDateTimeInputDirective.prototype.registerOnTouched = function (fn) {
        this.onModelTouched = fn;
    };
    OwlDateTimeInputDirective.prototype.setDisabledState = function (isDisabled) {
        this.disabled = isDisabled;
    };
    OwlDateTimeInputDirective.prototype.validate = function (c) {
        return this.validator ? this.validator(c) : null;
    };
    OwlDateTimeInputDirective.prototype.registerOnValidatorChange = function (fn) {
        this.validatorOnChange = fn;
    };
    OwlDateTimeInputDirective.prototype.handleKeydownOnHost = function (event) {
        if (event.altKey && event.keyCode === DOWN_ARROW) {
            this.dtPicker.open();
            event.preventDefault();
        }
    };
    OwlDateTimeInputDirective.prototype.handleBlurOnHost = function (event) {
        this.onModelTouched();
    };
    OwlDateTimeInputDirective.prototype.handleInputOnHost = function (event) {
        var value = event.target.value;
        if (this._selectMode === 'single') {
            this.changeInputInSingleMode(value);
        }
        else if (this._selectMode === 'range') {
            this.changeInputInRangeMode(value);
        }
        else {
            this.changeInputInRangeFromToMode(value);
        }
    };
    OwlDateTimeInputDirective.prototype.handleChangeOnHost = function (event) {
        var v;
        if (this.isInSingleMode) {
            v = this.value;
        }
        else if (this.isInRangeMode) {
            v = this.values;
        }
        this.dateTimeChange.emit({
            source: this,
            value: v,
            input: this.elmRef.nativeElement
        });
    };
    OwlDateTimeInputDirective.prototype.registerDateTimePicker = function (picker) {
        if (picker) {
            this.dtPicker = picker;
            this.dtPicker.registerInput(this);
        }
    };
    OwlDateTimeInputDirective.prototype.getValidDate = function (obj) {
        return (this.dateTimeAdapter.isDateInstance(obj) && this.dateTimeAdapter.isValid(obj)) ? obj : null;
    };
    OwlDateTimeInputDirective.prototype.convertTimeStringToDateTimeString = function (timeString, dateTime) {
        if (timeString) {
            var v = dateTime || this.dateTimeAdapter.now();
            var dateString = this.dateTimeAdapter.format(v, this.dateTimeFormats.datePickerInput);
            return dateString + ' ' + timeString;
        }
        else {
            return null;
        }
    };
    OwlDateTimeInputDirective.prototype.changeInputInSingleMode = function (inputValue) {
        var value = inputValue;
        if (this.dtPicker.pickerType === 'timer') {
            value = this.convertTimeStringToDateTimeString(value, this.value);
        }
        var result = this.dateTimeAdapter.parse(value, this.dateTimeFormats.parseInput);
        this.lastValueValid = !result || this.dateTimeAdapter.isValid(result);
        result = this.getValidDate(result);
        this._value = result;
        this.valueChange.emit(result);
        this.onModelChange(result);
        this.dateTimeInput.emit({ source: this, value: result, input: this.elmRef.nativeElement });
    };
    OwlDateTimeInputDirective.prototype.changeInputInRangeFromToMode = function (inputValue) {
        var originalValue = this._selectMode === 'rangeFrom' ? this._values[0] : this._values[1];
        if (this.dtPicker.pickerType === 'timer') {
            inputValue = this.convertTimeStringToDateTimeString(inputValue, originalValue);
        }
        var result = this.dateTimeAdapter.parse(inputValue, this.dateTimeFormats.parseInput);
        this.lastValueValid = !result || this.dateTimeAdapter.isValid(result);
        result = this.getValidDate(result);
        this._values = this._selectMode === 'rangeFrom' ? [result, this._values[1]] : [this._values[0], result];
        this.valueChange.emit(this._values);
        this.onModelChange(this._values);
        this.dateTimeInput.emit({ source: this, value: this._values, input: this.elmRef.nativeElement });
    };
    OwlDateTimeInputDirective.prototype.changeInputInRangeMode = function (inputValue) {
        var selecteds = inputValue.split(this.rangeSeparator);
        var fromString = selecteds[0];
        var toString = selecteds[1];
        if (this.dtPicker.pickerType === 'timer') {
            fromString = this.convertTimeStringToDateTimeString(fromString, this.values[0]);
            toString = this.convertTimeStringToDateTimeString(toString, this.values[1]);
        }
        var from = this.dateTimeAdapter.parse(fromString, this.dateTimeFormats.parseInput);
        var to = this.dateTimeAdapter.parse(toString, this.dateTimeFormats.parseInput);
        this.lastValueValid = (!from || this.dateTimeAdapter.isValid(from)) && (!to || this.dateTimeAdapter.isValid(to));
        from = this.getValidDate(from);
        to = this.getValidDate(to);
        this._values = [from, to];
        this.valueChange.emit(this._values);
        this.onModelChange(this._values);
        this.dateTimeInput.emit({ source: this, value: this._values, input: this.elmRef.nativeElement });
    };
    OwlDateTimeInputDirective.decorators = [
        { type: Directive, args: [{
                    selector: 'input[owlDateTime]',
                    exportAs: 'owlDateTimeInput',
                    providers: [
                        OWL_DATETIME_VALUE_ACCESSOR,
                        OWL_DATETIME_VALIDATORS,
                    ],
                },] },
    ];
    OwlDateTimeInputDirective.ctorParameters = function () { return [
        { type: ElementRef, },
        { type: Renderer2, },
        { type: DateTimeAdapter, decorators: [{ type: Optional },] },
        { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [OWL_DATE_TIME_FORMATS,] },] },
    ]; };
    OwlDateTimeInputDirective.propDecorators = {
        "owlDateTime": [{ type: Input },],
        "owlDateTimeFilter": [{ type: Input },],
        "_disabled": [{ type: Input },],
        "min": [{ type: Input },],
        "max": [{ type: Input },],
        "selectMode": [{ type: Input },],
        "rangeSeparator": [{ type: Input },],
        "value": [{ type: Input },],
        "values": [{ type: Input },],
        "dateTimeChange": [{ type: Output },],
        "dateTimeInput": [{ type: Output },],
        "owlDateTimeInputAriaHaspopup": [{ type: HostBinding, args: ['attr.aria-haspopup',] },],
        "owlDateTimeInputAriaOwns": [{ type: HostBinding, args: ['attr.aria-owns',] },],
        "minIso8601": [{ type: HostBinding, args: ['attr.min',] },],
        "maxIso8601": [{ type: HostBinding, args: ['attr.max',] },],
        "owlDateTimeInputDisabled": [{ type: HostBinding, args: ['disabled',] },],
        "handleKeydownOnHost": [{ type: HostListener, args: ['keydown', ['$event'],] },],
        "handleBlurOnHost": [{ type: HostListener, args: ['blur', ['$event'],] },],
        "handleInputOnHost": [{ type: HostListener, args: ['input', ['$event'],] },],
        "handleChangeOnHost": [{ type: HostListener, args: ['change', ['$event'],] },],
    };
    return OwlDateTimeInputDirective;
}());
export { OwlDateTimeInputDirective };
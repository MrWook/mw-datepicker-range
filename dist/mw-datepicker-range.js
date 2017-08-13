/**
 * @version 1.1.0
 * @license MIT
 * @Author MrWook
 */
(function (angular) {
	'use strict';
	var app = angular.module('mw-datepicker-range', ['ui.bootstrap.datepicker', 'ui.bootstrap.datepickerPopup']);

	app.config(['$provide', '$injector', function($provide, $injector){

		// extending datepicker (access to attributes and app scope through $parent)
		var datepickerDelegate = function($delegate){
			var directive = $delegate[0];

			// Override compile
			var link = directive.link;

			directive.compile = function(){
				return function(scope, elem, attrs, ctrls){
					link.apply(this, arguments);

					scope.selected_dates = [];
					scope.select_range;
					if(attrs.mwMultiSelect === undefined){
						//watch for datepickerpopup
						var multi_select = angular.element(elem.parent().parent().parent().parent().children()[0]).attr('mw-multi-select');
						if(multi_select !== undefined){
							scope.$parent.$parent.$parent.$parent.$watchCollection(multi_select, function(value_new){
								scope.selected_dates = value_new || [];
							});
						}
					}else{
						var multi_select = attrs.mwMultiSelect;
						//watch for datepicker
						scope.$parent.$watchCollection(multi_select, function (value_new){
							scope.selected_dates = value_new || [];
						});
					}
					if(multi_select !== undefined){
						attrs.$observe('mwMultiSelectType', function(value_new){
							scope.selected_type = !!value_new && value_new !== "false";
						});
						scope.selected_type = true;
						var ngModelCtrl = ctrls[1];

						ngModelCtrl.$viewChangeListeners.push(function(){
							var value_new = scope.$parent.$eval(attrs.ngModel);

							if(!value_new && scope.$parent.$parent.$parent !== null)
								value_new = scope.$parent.$parent.$parent.date;
							if(!value_new)
								return;
							var value_date = Math.round(+value_new.setHours(0, 0, 0, 0)),
								selected_dates = scope.selected_dates;


							if(scope.selected_type){
								// reset range
								if(!selected_dates.length || selected_dates.length > 1 || selected_dates[0] == value_date)
									return selected_dates.splice(0, selected_dates.length, value_date);

								selected_dates.push(value_date);

								var value_temp = new Date(Math.min.apply(null, selected_dates));
								var value_max = new Date(Math.max.apply(null, selected_dates));
								// Start on the next day to prevent duplicating the	first date
								value_temp = new Date(value_temp.setDate(value_temp.getDate() + 1));
								while(value_temp < value_max){
									selected_dates.push(Math.round(+value_temp.setHours(0, 0, 0, 0)));
									// Set a day ahead after pushing to prevent duplicating last date
									value_temp = new Date(value_temp.setDate(value_temp.getDate() + 1));
								}
							}
						});
					}
				};
			};

			return $delegate;
		};

		if ($injector.has('uibDatepickerDirective'))
			$provide.decorator('uibDatepickerDirective', ['$delegate', datepickerDelegate]);


		// extending datepicker popup (access to attributes and app scope through $parent)
		var datepickerPopupDelegate = function ($delegate, $filter, $timeout) {
			var directive = $delegate[0];

			// Override compile
			var link = directive.link;

			directive.compile = function(){
				return function (scope, elem, attrs, ctrls) {
					link.apply(this, arguments);

					function set_view_value(value){
						multi_select = angular.element(elem.parent().children()[0]).attr('mw-multi-select');
						var date_format = attrs.uibDatepickerPopup || 'dd.MM.y';
						//inside timeout so that multi_select is set correctly
						$timeout(function(){
							var array = scope.$parent[multi_select];
							if(array === undefined)
								array = [];
							var from = '';
							var to = '';
							if(array.length > 0){
								from = $filter('date')($filter('orderBy')(array)[0], date_format);
								if(array.length > 1)
									to = ' - '+$filter('date')($filter('orderBy')(array, '-')[0], date_format);
							}

							ngModelCtrl.$setViewValue(from+to);
							ngModelCtrl.$render();
						}, 0);
					}

					var ngModelCtrl = ctrls[0];
					var multi_select = angular.element(elem.parent().children()[0]).attr('mw-multi-select');
					if(multi_select !== undefined){
						//override change listener
						ngModelCtrl.$viewChangeListeners = [function(){
							scope.date = ngModelCtrl.$modelValue;
						}];
						//override formatter
						ngModelCtrl.$formatters = [function(value){
							set_view_value(value);
						}];
						// //override parser
						ngModelCtrl.$parsers = [function(value){
							set_view_value(value);
						}];
						var old_select_function = scope.select;
						scope.select = function(date, evt){
							old_select_function(date, evt);
							var multi_select = angular.element(elem.parent().children()[0]).attr('mw-multi-select');
							if(date === null)
								scope.$parent[multi_select] = [];
							else if(date === 'today')
								scope.$parent[multi_select] = [new Date().setHours(0, 0, 0, 0)];
						}
					}
				};
			};
			return $delegate;
		};

		if ($injector.has('uibDatepickerPopupDirective'))
			$provide.decorator('uibDatepickerPopupDirective', ['$delegate', '$filter', '$timeout', datepickerPopupDelegate]);
	}]);

	app.directive('mwMultiSelect', ['$compile', function mwMultiSelect($compile){
		return{
			priority: 1001,
			terminal: true,
			compile: function (elem, attr) {
				var multi_select = attr.mwMultiSelect;
				var options = attr.datepickerOptions;

				//never close the date on selection
				elem.attr('close-on-date-selection', false);
				//block to write into the input field
				elem.attr('onkeypress', 'return false;');
				elem.attr('readonly', '');

				var compiled = $compile(elem, null, 1001);
				return function linkFn(scope) {
					if(scope[options] === undefined){
						scope[options] = {};
					}
					//add users customClass
					if(scope[options].customClass !== undefined)
						var users_custmClass =  scope[options].customClass;
					var return_value = '';
					//add daterangerpicker custom class
					scope[options].customClass = function(data){
						// console.log(scope.dt);
						if(users_custmClass !== undefined)
							return_value = users_custmClass(data);
						if(scope[multi_select] === undefined)
							scope[multi_select] = [];
						var temp_unix = Math.round(+data.date.setHours(0, 0, 0, 0));
						if(scope[multi_select].indexOf(temp_unix) > -1 || scope[multi_select].indexOf(temp_unix+3600000) > -1) {
							return return_value+' selected';
						}
						return '';
					};
					compiled(scope)
				}
			}
		}
	}]);
	//service to return formatted value
	app.service('mwMultiSelectService', ['$filter', function mwMultiSelectService($filter) {
		var service = {};

		service.parse = function(data, format) {
			if(data === undefined)
				data = [];

			var return_value = {};
			if(data.length > 0){
				return_value.before = $filter('orderBy')(data)[0];
				if(format !== undefined)
					return_value.before = $filter('date')(return_value.before, format);
				if(data.length > 1){
					return_value.after = $filter('orderBy')(data, '-')[0];
					if(format !== undefined)
						return_value.after = $filter('date')(return_value.before, format);
				}
			}
			return return_value
		};

		return service;
	}]);
})(window.angular);

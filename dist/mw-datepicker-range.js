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
		var datepickerDelegate = function($delegate, mwMultiSelectService){
			var directive = $delegate[0];

			// Override compile
			var link = directive.link;

			directive.compile = function(){
				return function(scope, elem, attrs, ctrls){
					link.apply(this, arguments);
					scope.selected_dates = [];
					var multi_select;
					var id = mwMultiSelectService.get_last_datepicker();
					if(attrs.mwMultiSelect === undefined){
						var multi_select_element = angular.element(document.getElementById(id));
						//watch for datepickerpopup
						multi_select = multi_select_element.attr('mw-multi-select');
						if(multi_select !== undefined){
							multi_select_element.scope().$watchCollection(multi_select, function(value_new){
								scope.selected_dates = value_new || [];
							});
						}
					}else{
						multi_select = attrs.mwMultiSelect;
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

						function change_listener() {
							var value_new = ngModelCtrl.$$scope[attrs.ngModel];
							if(!value_new && multi_select_element !== undefined){
								value_new = ngModelCtrl.$$scope.date;
							}

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
						}
						//only add the event listener once
						var check_listener = true;
						for(var i = 0; i < ngModelCtrl.$viewChangeListeners.length; i++){
							if(''+ngModelCtrl.$viewChangeListeners[i] == ''+change_listener){
								check_listener = false;
							}
						}
						if(check_listener)
							ngModelCtrl.$viewChangeListeners.push(change_listener);
					}
				};
			};

			return $delegate;
		};

		if ($injector.has('uibDatepickerDirective'))
			$provide.decorator('uibDatepickerDirective', ['$delegate', 'mwMultiSelectService', datepickerDelegate]);


		// extending datepicker popup (access to attributes and app scope through $parent)
		var datepickerPopupDelegate = function ($delegate, $filter, $timeout) {
			var directive = $delegate[0];

			// Override compile
			var link = directive.link;

			directive.compile = function(){
				return function (scope, elem, attrs, ctrls) {
					link.apply(this, arguments);
					var ngModelCtrl = ctrls[0];
					var multi_select = attrs.mwMultiSelect;
					if(multi_select !== undefined){
						//override change listener
						ngModelCtrl.$viewChangeListeners = [function(){
							scope[attrs.ngModel] = ngModelCtrl.$modelValue;
						}];
						//override formatter
						ngModelCtrl.$formatters = [function(value){
							set_view_value(value);
						}];
						//override parser
						ngModelCtrl.$parsers = [function(value){
							set_view_value(value);
						}];
						function set_view_value(value){
							multi_select = attrs.mwMultiSelect;
							var date_format = attrs.uibDatepickerPopup || 'dd.MM.y';
							//inside timeout so that multi_select is set correctly
							$timeout(function(){
								var array = ngModelCtrl.$$scope[multi_select];
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
						var old_select_function = scope.select;
						scope.select = function(date, evt){
							old_select_function(date, evt);
							var multi_select = attrs.mwMultiSelect;
							if(date === null)
								ngModelCtrl.$$scope[multi_select] = [];
							else if(date === 'today')
								ngModelCtrl.$$scope[multi_select] = [new Date().setHours(0, 0, 0, 0)];
						}
					}
				};
			};
			return $delegate;
		};

		if ($injector.has('uibDatepickerPopupDirective'))
			$provide.decorator('uibDatepickerPopupDirective', ['$delegate', '$filter', '$timeout', datepickerPopupDelegate]);
	}]);

	//add template for smartTable support
	app.run(['$templateCache', function($templateCache) {
		$templateCache.put('stDateRange.html', '<div class="input-group"><input title="" type="text" class="form-control" ng-model="date" mw-multi-select="selectedDates" datepicker-append-to-body="true" uib-datepicker-popup="yyyy/MM/dd"  is-open="is_open" datepicker-options="dateOptions"/><span class="input-group-btn"><button type="button" class="btn btn-default" ng-click="open($event)"><i class="glyphicon glyphicon-calendar"></i></button></span></div>');
	}]);



	app.directive('mwMultiSelect', ['$compile', 'mwMultiSelectService', function mwMultiSelect($compile, mwMultiSelectService){
		return{
			priority: 1001,
			terminal: true,
			compile: function (elem, attr) {
				var multi_select = attr.mwMultiSelect;
				var options = attr.datepickerOptions;
				var id = attr.id;
				if(id === undefined){
					id = 'mwDatePickerRange-'+Math.floor(Math.random()*1000);
					elem.attr('id', id);
				}
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
					scope.$watch(attr.isOpen, function(val_new){
						if(val_new)
							mwMultiSelectService.set_last_datepicker(id);
					});
					//add users customClass
					if(scope[options].customClass !== undefined)
						var users_custmClass =  scope[options].customClass;
					var return_value = '';
					//add daterangerpicker custom class
					scope[options].customClass = function(data){
						if(users_custmClass !== undefined)
							return_value = users_custmClass(data);
						if(scope[multi_select] === undefined)
							scope[multi_select] = [];
						var temp_unix = Math.round(+data.date.setHours(0, 0, 0, 0));
						if(scope[multi_select].indexOf(temp_unix) > -1 || scope[multi_select].indexOf(temp_unix+3600000) > -1) {
							return return_value+' selected';
						}
						return return_value;
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
		var id;
		service.set_last_datepicker = function(datepicker) {
			id = datepicker;
		};
		service.get_last_datepicker = function() {
			return id
		};

		return service;
	}]);

	app.directive('stDateRange', ['$filter', function ($filter) {
		return {
			restrict: 'E',
			require: '^stTable',
			scope: {
				selectedDates: '='
			},
			templateUrl: 'stDateRange.html',
			link: function (scope, element, attr, table) {
				var predicateName = attr.predicate;
				scope.open = function ($event) {
					$event.preventDefault();
					$event.stopPropagation();
					scope.is_open = !scope.is_open;
				};

				scope.$watch('is_open', function(val_new){
					"use strict";
					if(!val_new){
						var query = {};
						if(scope.selectedDates === undefined)
							scope.selectedDates = [];
						if(scope.selectedDates.length > 1){
							query.before = $filter('date')($filter('orderBy')(scope.selectedDates)[0], 'y-MM-dd');
							query.after = $filter('date')($filter('orderBy')(scope.selectedDates, '-')[0], 'y-MM-dd');
						}else{
							query = $filter('date')($filter('orderBy')(scope.selectedDates)[0], 'y-MM-dd');
						}
						table.search(query, predicateName);
					}
				});
			}
		}
	}]);

	app.filter('customFilter', ['$filter', function ($filter){
		var filterFilter = $filter('filter');
		var standardComparator = function standardComparator(obj, text){
			text = ('' + text).toLowerCase();
			return ('' + obj).toLowerCase().indexOf(text) > -1;
		};

		return function customFilter(array, expression){
			function customComparator(actual, expected){
				var itemDate;
				var queryDate;
				if(angular.isObject(expected)){
					var before = expected.before;
					var after = expected.after;
					//date range
					if(before && after){
						try {
							itemDate = new Date(actual);
							queryDate = new Date(before);
							if(itemDate < queryDate){
								return false;
							}

							itemDate = new Date(actual);
							queryDate = new Date(after);

							if(itemDate > queryDate){
								return false;
							}
							return true;
						}catch(e){
							return false;
						}
					}
					return standardComparator(actual, expected);
				}
				return standardComparator(actual, expected);
			}
			return  filterFilter(array, expression, customComparator);
		};
	}]);
})(window.angular);

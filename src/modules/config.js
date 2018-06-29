angular.module('mw-datepicker-range').config(['$provide', '$injector', function($provide, $injector){

	// extending datepicker (access to attributes and app scope through $parent)
	const datepickerDelegate = function($delegate, mwMultiSelectService){
		const directive = $delegate[0];

		// Override compile
		const link = directive.link;

		directive.compile = function(){
			return function(scope, elem, attrs, ctrls){
				link.apply(this, arguments);
				scope.selected_dates = [];
				let multi_select;
				let id               = mwMultiSelectService.get_last_datepicker();
				if(attrs.mwMultiSelect === undefined){
					const multi_select_element = angular.element(document.getElementById(id));
					//watch for datepickerpopup
					multi_select               = multi_select_element.attr('mw-multi-select');
					if(multi_select !== undefined){
						multi_select_element.scope().$watchCollection(multi_select, function(value_new){
							scope.selected_dates = value_new || [];
						});
					}
				}else{
					multi_select = attrs.mwMultiSelect;
					//watch for datepicker
					scope.$parent.$watchCollection(multi_select, function(value_new){
						scope.selected_dates = value_new || [];
					});
				}
				if(multi_select !== undefined){
					attrs.$observe('mwMultiSelectType', function(value_new){
						scope.selected_type = !!value_new && value_new !== 'false';
					});
					scope.selected_type = true;
					const ngModelCtrl   = ctrls[1];

					function change_listener(){
						let value_new = ngModelCtrl.$$scope[attrs.ngModel];
						if(!value_new && multi_select_element !== undefined){
							value_new = ngModelCtrl.$$scope.date;
						}

						if(!value_new){
							return;
						}
						const value_date     = Math.round(+value_new.setHours(0, 0, 0, 0)),
							  selected_dates = scope.selected_dates;


						if(scope.selected_type){

							// reset range
							if(!selected_dates.length || selected_dates.length > 1 || selected_dates[0] == value_date){
								return selected_dates.splice(0, selected_dates.length, value_date);
							}

							selected_dates.push(value_date);

							let value_temp = new Date(Math.min.apply(null, selected_dates));
							let value_max  = new Date(Math.max.apply(null, selected_dates));
							// Start on the next day to prevent duplicating the	first date
							value_temp     = new Date(value_temp.setDate(value_temp.getDate()+1));
							while(value_temp < value_max){
								selected_dates.push(Math.round(+value_temp.setHours(0, 0, 0, 0)));
								// Set a day ahead after pushing to prevent duplicating last date
								value_temp = new Date(value_temp.setDate(value_temp.getDate()+1));
							}
						}
					}

					//only add the event listener once
					let check_listener = true;
					for(let i = 0; i < ngModelCtrl.$viewChangeListeners.length; i++){
						if(''+ngModelCtrl.$viewChangeListeners[i] == ''+change_listener){
							check_listener = false;
						}
					}
					if(check_listener){
						ngModelCtrl.$viewChangeListeners.push(change_listener);
					}
				}
			};
		};

		return $delegate;
	};

	if($injector.has('uibDatepickerDirective')){
		$provide.decorator('uibDatepickerDirective', ['$delegate', 'mwMultiSelectService', datepickerDelegate]);
	}


	// extending datepicker popup (access to attributes and app scope through $parent)
	const datepickerPopupDelegate = function($delegate, $filter, $timeout){
		const directive = $delegate[0];

		// Override compile
		const link = directive.link;

		directive.compile = function(){
			return function(scope, elem, attrs, ctrls){
				link.apply(this, arguments);
				const ngModelCtrl = ctrls[0];
				let multi_select  = attrs.mwMultiSelect;
				if(multi_select !== undefined){
					//override change listener
					ngModelCtrl.$viewChangeListeners = [function(){
						scope[attrs.ngModel] = ngModelCtrl.$modelValue;
					}];
					//override formatter
					ngModelCtrl.$formatters          = [function(value){
						set_view_value(value);
					}];
					//override parser
					ngModelCtrl.$parsers             = [function(value){
						set_view_value(value);
					}];

					function set_view_value(value){
						multi_select      = attrs.mwMultiSelect;
						const date_format = attrs.uibDatepickerPopup || 'dd.MM.y';
						//inside timeout so that multi_select is set correctly
						$timeout(function(){
							let array = ngModelCtrl.$$scope[multi_select];
							if(array === undefined){
								array = [];
							}
							let from = '';
							let to   = '';
							if(array.length > 0){
								from = $filter('date')($filter('orderBy')(array)[0], date_format);
								if(array.length > 1){
									to = ' - '+$filter('date')($filter('orderBy')(array, '-')[0], date_format);
								}
							}

							ngModelCtrl.$setViewValue(from+to);
							ngModelCtrl.$render();
						}, 0);
					}

					const old_select_function = scope.select;
					scope.select              = function(date, evt){
						old_select_function(date, evt);
						const multi_select = attrs.mwMultiSelect;
						if(date === null){
							ngModelCtrl.$$scope[multi_select] = [];
						}else if(date === 'today'){
							ngModelCtrl.$$scope[multi_select] = [new Date().setHours(0, 0, 0, 0)];
						}
					};
				}
			};
		};
		return $delegate;
	};

	if($injector.has('uibDatepickerPopupDirective')){
		$provide.decorator('uibDatepickerPopupDirective', ['$delegate', '$filter', '$timeout', datepickerPopupDelegate]);
	}
}]);
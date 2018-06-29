angular.module('mw-datepicker-range').directive('mwMultiSelect', ['$compile', 'mwMultiSelectService', function mwMultiSelect($compile, mwMultiSelectService){
	return {
		priority: 1001,
		terminal: true,
		compile:  function(elem, attr){
			const multi_select = attr.mwMultiSelect;
			const options      = attr.datepickerOptions;
			let id             = attr.id;
			if(id === undefined){
				id = 'mwDatePickerRange-'+Math.floor(Math.random()*1000);
				elem.attr('id', id);
			}
			//never close the date on selection
			elem.attr('close-on-date-selection', false);
			//block to write into the input field
			elem.attr('onkeypress', 'return false;');
			elem.attr('readonly', '');

			const compiled = $compile(elem, null, 1001);
			return function linkFn(scope){
				let users_custmClass;
				if(scope[options] === undefined){
					scope[options] = {};
				}
				scope.$watch(attr.isOpen, function(val_new){
					if(val_new){
						mwMultiSelectService.set_last_datepicker(id);
					}
				});
				//add users customClass
				if(scope[options].customClass !== undefined){
					users_custmClass = scope[options].customClass;
				}
				let return_value           = '';
				//add daterangerpicker custom class
				scope[options].customClass = function(data){
					if(users_custmClass !== undefined){
						return_value = users_custmClass(data);
					}
					if(scope[multi_select] === undefined){
						scope[multi_select] = [];
					}
					let temp_unix = Math.round(+data.date.setHours(0, 0, 0, 0));
					if(scope[multi_select].indexOf(temp_unix) > -1 || scope[multi_select].indexOf(temp_unix+3600000) > -1){
						return return_value+' selected';
					}
					return return_value;
				};
				compiled(scope);
			};
		}
	};
}]);

angular.module('mw-datepicker-range').directive('stDateRange', ['$filter', function($filter){
	return {
		restrict:    'E',
		require:     '^stTable',
		scope:       {
			selectedDates: '='
		},
		templateUrl: 'stDateRange.html',
		link:        function(scope, element, attr, table){
			const predicateName = attr.predicate;
			scope.open          = function($event){
				$event.preventDefault();
				$event.stopPropagation();
				scope.is_open = !scope.is_open;
			};

			scope.$watch('is_open', function(val_new){
				if(!val_new){
					let query = {};
					if(scope.selectedDates === undefined){
						scope.selectedDates = [];
					}
					if(scope.selectedDates.length > 1){
						query.before = $filter('date')($filter('orderBy')(scope.selectedDates)[0], 'y-MM-dd');
						query.after  = $filter('date')($filter('orderBy')(scope.selectedDates, '-')[0], 'y-MM-dd');
					}else{
						query = $filter('date')($filter('orderBy')(scope.selectedDates)[0], 'y-MM-dd');
					}
					table.search(query, predicateName);
				}
			});
		}
	}
}]);
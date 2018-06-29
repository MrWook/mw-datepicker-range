angular.module('mw-datepicker-range').service('mwMultiSelectService', ['$filter', function mwMultiSelectService($filter){
	let service = {};

	service.parse               = function(data, format){
		if(data === undefined){
			data = [];
		}

		let return_value = {};
		if(data.length > 0){
			return_value.before = $filter('orderBy')(data)[0];
			if(format !== undefined){
				return_value.before = $filter('date')(return_value.before, format);
			}
			if(data.length > 1){
				return_value.after = $filter('orderBy')(data, '-')[0];
				if(format !== undefined){
					return_value.after = $filter('date')(return_value.before, format);
				}
			}
		}
		return return_value;
	};
	let id;
	service.set_last_datepicker = function(datepicker){
		id = datepicker;
	};
	service.get_last_datepicker = function(){
		return id;
	};

	return service;
}]);
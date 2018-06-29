angular.module('mw-datepicker-range').filter('customFilter', ['$filter', function($filter){
	const filterFilter       = $filter('filter');
	const standardComparator = function standardComparator(obj, text){
		text = (''+text).toLowerCase();
		return (''+obj).toLowerCase().indexOf(text) > -1;
	};

	return function customFilter(array, expression){
		function customComparator(actual, expected){
			let itemDate;
			let queryDate;
			if(angular.isObject(expected)){
				let before = expected.before;
				let after  = expected.after;
				//date range
				if(before && after){
					try{
						itemDate  = new Date(actual);
						queryDate = new Date(before);
						if(itemDate < queryDate){
							return false;
						}

						itemDate  = new Date(actual);
						queryDate = new Date(after);

						return itemDate <= queryDate;

					}
					catch(e){
						return false;
					}
				}
				return standardComparator(actual, expected);
			}
			return standardComparator(actual, expected);
		}

		return filterFilter(array, expression, customComparator);
	};
}]);
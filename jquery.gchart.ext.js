/* http://keith-wood.name/gChart.html
   Google Chart interface extensions for jQuery v2.0.0.
   See API details at https://developers.google.com/chart/image/.
   Written by Keith Wood (kbwood{at}iinet.com.au) September 2008.
   Available under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

	/** General extension for Google Chart plugin.
		@module GChartExt
		@augments GChart */

	/** More default options.
		@memberof GChartExt
		@name defaultOptions
		@property [mapLatLong=false] {boolean} <code>true</code> to use lat/long coords in mapArea.
		@property [mapArea=null] {number|number[]|string} New maps: pixel border all around or
					individual pixel borders or lat/long; Original maps: the general area to show:
					world, africa, asia, europe, middle_east, south_america, usa.
		@property [mapRegions=[]] {string[]} List of country/state codes to plot on a map.
		@property [mapDefaultColor='bebebe'] {string} The colour for non-plotted countries/states on a map.
		@property [mapColors=['blue','red']] {string[]} The colour range for plotted countries/states on a map.
		@property [qrECLevel=null] {string} QR code error correction level: low, medium, quarter, high.
		@property [qrMargin=null] {number} Margin (squares) around QR code, default is 4. */
	$.extend($.gchart.defaultOptions, {
		mapLatLong: false,
		mapArea: null,
		mapRegions: [],
		mapDefaultColor: 'bebebe',
		mapColors: ['blue', 'red'],
		qrECLevel: null,
		qrMargin: null
	});

	// New chart types: formula, map, mapOriginal, meter, qrCode, scatter, venn
	$.extend($.gchart._chartTypes, {formula: 'tx', map: 'map', mapOriginal: 't',
		meter: 'gom', qrCode: 'qr', scatter: 's', venn: 'v',
		gom: 'gom', qr: 'qr', s: 's', t: 't', tx: 'tx', v: 'v'});
		
	$.extend($.gchart._typeOptions, {map: 'map', qr: 'qr', t: 'map', tx: 'no'});

	$.extend($.gchart, {

		/** Latitude and longitude coordinates for Africa. */
		mapAfrica: [-35, -20, 40, 55],
		/** Latitude and longitude coordinates for Asia. */
		mapAsia: [-15, 40, 75, 180],
		/** Latitude and longitude coordinates for Australia. */
		mapAustralia: [-45, 110, -10, 155],
		/** Latitude and longitude coordinates for Europe. */
		mapEurope: [33, -25, 73, 50],
		/** Latitude and longitude coordinates for North America. */
		mapNorthAmerica: [5, -175, 75, -50],
		/** Latitude and longitude coordinates for South America. */
		mapSouthAmerica: [-55, -85, 15, -35],

		/** Prepare options for a scatter chart.
			@param values {number[]} The coordinates of the points: each entry is an array with
						[0] is the x-coord, [1] is the y-coord, [2] (optional) is the percentage size.
			@param [minMax] {number[]} Any minimum and maximum values for the axes.
			@param [labels] {string[]} The labels for the groups.
			@param [colours] {string[]} The colours for the labels.
			@param [options] {object} Additional settings.
			@return {object} The configured options object.
			@example $(selector).gchart($.gchart.scatter(
 	[[10, 80], [30, 40, 50], [60, 70, 25], [90, 20], [20, 10],
 	[40, 90], [20, 50, 75], [50, 70, 50], [90, 30], [70, 50]])) */
		scatter: function(values, minMax, labels, colours, options) {
			if (!$.isArray(minMax)) {
				options = minMax;
				colours = null;
				labels = null;
				minMax = null;
			}
			else if (typeof minMax[0] !== 'number') {
				options = colours;
				colours = labels;
				labels = minMax;
				minMax = null;
			}
			if (labels && !$.isArray(labels)) {
				options = labels;
				colours = null;
				labels = null;
			}
			var series = [[], [], []];
			for (var i = 0; i < values.length; i++) {
				series[0][i] = values[i][0];
				series[1][i] = values[i][1];
				series[2][i] = values[i][2] || 100;
			}
			minMax = minMax || [];
			options = options || {};
			if (labels) {
				options.extension = {chdl: labels.join('|')};
			}
			if (colours) {
				colours = $.map(colours, function(v, i) {
					return $.gchart.color(v);
				});
				$.extend(options.extension, {chco: colours.join('|')});
			}
			return $.extend({}, options,
				{type: 'scatter', encoding: (minMax.length >= 2 ? 'scaled' : 'text'), series: [
					(minMax.length >= 2 ? $.gchart.series(series[0], minMax[0], minMax[1]) :
					$.gchart.series(series[0])),
					(minMax.length >= 4 ? $.gchart.series(series[1],
					(minMax[2] != null ? minMax[2] : minMax[0]), (minMax[3] != null ? minMax[3] : minMax[1])) :
					$.gchart.series(series[1])), $.gchart.series(series[2])]});
		},

		/** Prepare options for a Venn diagram.
			@param size1 {number} The relative size of the first circle.
			@param size2 {number} The relative size of the second circle.
			@param size3 {number} The relative size of the third circle.
			@param overlap12 {number} The overlap between circles 1 and 2.
			@param overlap13 {number} The overlap between circles 1 and 3.
			@param overlap23 {number} The overlap between circles 2 and 3.
			@param overlap123 {number} The overlap between all circles.
			@param [options] {object} Additional settings.
			@return {object} The configured options object.
			@example $(selector).gchart($.gchart.venn(100, 80, 60, 10, 30, 30, 10)) */
		venn: function(size1, size2, size3, overlap12, overlap13, overlap23, overlap123, options) {
			return $.extend({}, options || {}, {type: 'venn', series:
				[$.gchart.series([size1, size2, size3, overlap12, overlap13, overlap23, overlap123])]});
		},

		/** Prepare options for a Google meter.
			@param [text] {string|string[]} The text to show on the arrow.
			@param values {number|number[]} The position(s) of the arrow(s).
			@param [maxValue=100] {number} The maximum value for the meter.
			@param [colours] {string[]} The colours to use for the band.
			@param [labels] {string[]} Labels appearing beneath the meter.
			@param [styles] {number[]} The styles of each series' arrows: each entry is an array with
						width, dash, space, arrow size.
			@param [options] {object} Additional settings.
			@return {object} The configured options object.
			@example $(selector).gchart($.gchart.meter(['1', '2', '3'], [10, 30, 70])) */
		meter: function(text, values, maxValue, colours, labels, styles, options) {
			if (typeof text !== 'string' && !$.isArray(text)) {
				options = styles;
				styles = labels;
				labels = colours;
				colours = maxValue;
				maxValue = values;
				values = text;
				text = '';
			}
			if (typeof maxValue !== 'number') {
				options = styles;
				styles = labels;
				labels = colours;
				colours = maxValue;
				maxValue = null;
			}
			if (!$.isArray(colours)) {
				options = styles;
				styles = labels;
				labels = colours;
				colours = null;
			}
			if (!$.isArray(labels)) {
				options = styles;
				styles = labels;
				labels = null;
			}
			if (!$.isArray(styles)) {
				options = styles;
				styles = null;
			}
			values = ($.isArray(values) ? values : [values]);
			var multi = false;
			for (var i = 0; i < values.length; i++) {
				multi = multi || $.isArray(values[i]);
			}
			var ss = (multi ? [] : [$.gchart.series(values)]);
			if (multi) {
				for (var i = 0; i < values.length; i++) {
					ss.push($.gchart.series($.isArray(values[i]) ? values[i] : [values[i]]));
				}
			}
			values = ss;
			if (colours) {
				var cs = '';
				$.each(colours, function(i, v) {
					cs += ',' + $.gchart.color(v);
				});
				colours = cs.substr(1);
			}
			if (styles) {
				var ls = ['', ''];
				$.each(styles, function(i, v) {
					v = ($.isArray(v) ? v : [v]);
					ls[0] += '|' + $.gchart.color(v.slice(0, 3).join(','));
					ls[1] += '|' + (v[3] || 15);
				});
				styles = ls[0].substr(1) + ls[1];
			}
			var axis = (labels && labels.length ?  $.gchart.axis('y', labels) : null);
			return $.extend({}, options || {}, {type: 'meter',
				maxValue: maxValue || 100, series: values,
				dataLabels: ($.isArray(text) ? text : [text || ''])},
				(colours ? {extension: {chco: colours}} : {}),
				(axis ? {axes: [axis]} : {}),
				(styles ? {extension: {chls: styles}} : {}));
		},

		/** Prepare options for a map chart.
			@param [latLongArea] {boolean} <code>true</code> to specify the area via latitude/longitude.
			@param [mapArea] {string|number[]|number} The region of the world to show (original map style) or
						the pixel zoom or lat/long coordinates to show or all around pixel zoom.
			@param values {object} The countries/states to plot - attributes are country/state codes and values.
			@param [defaultColour] {string} The colour for regions without values.
			@param [colour] {string|string[]} The starting colour or gradient colours for rendering values.
			@param [endColour] {string} The ending colour for rendering values.
			@param [options] {object} Additional settings.
			@return {object} The configured options object.
			@example $(selector).gchart(true, $.gchart.mapAustralia, data, defaultColour, colour, endColour)) */
		map: function(latLongArea, mapArea, values, defaultColour, colour, endColour, options) {
			if (typeof latLongArea !== 'boolean') {
				options = endColour;
				endColour = colour;
				colour = defaultColour;
				defaultColour = values;
				values = mapArea;
				mapArea = latLongArea;
				latLongArea = false;
			}
			if (typeof mapArea === 'object' && !$.isArray(mapArea)) { // Optional mapArea
				options = endColour;
				endColour = colour;
				colour = defaultColour;
				defaultColour = values;
				values = mapArea;
				mapArea = null;
			}
			if (typeof defaultColour === 'object') {
				options = defaultColour;
				endColour = null;
				colour = null;
				defaultColour = null;
			}
			else if (typeof colour === 'object' && !$.isArray(colour)) {
				options = colour;
				endColour = null;
				colour = null;
			}
			else if (typeof endColour === 'object') {
				options = endColour;
				endColour = null;
			}
			var mapRegions = [];
			var data = [];
			var i = 0;
			for (var name in values) {
				mapRegions[i] = name.replace(/_/g, '-');
				data[i] = values[name];
				i++;
			}
			if (typeof mapArea === 'number') {
				mapArea = [mapArea, mapArea, mapArea, mapArea];
			}
			return $.extend({}, options || {},
				{type: (typeof mapArea === 'string' ? 'mapOriginal' : 'map'),
				mapLatLong: latLongArea, mapArea: mapArea, mapRegions: mapRegions,
				mapDefaultColor: defaultColour || $.gchart.defaultOptions.mapDefaultColor,
				mapColors: ($.isArray(colour) ? colour : [colour || $.gchart.defaultOptions.mapColors[0],
				endColour || $.gchart.defaultOptions.mapColors[1]]),
				series: [$.gchart.series('', data)]});
		},

		/** Prepare options for generating a QR Code.
			@param text {object|string} The QR code settings or the text to encode.
			@param [encoding] {string} The encoding scheme.
			@param [ecLevel] {string} The error correction level: l, m, q, h.
			@param [margin] {number} The margin around the code.
			@return {object) the configured options object.
			@example $(selector).gchart($.gchart.qrCode('This is a QR Code')) */
		qrCode: function(text, encoding, ecLevel, margin) {
			var options = {};
			if (typeof text === 'object') {
				options = text;
			}
			else { // Individual fields
				options = {dataLabels: [text], encoding: encoding,
					qrECLevel: ecLevel, qrMargin: margin};
			}
			options.type = 'qrCode';
			if (options.text) {
				options.dataLabels = [options.text];
				options.text = null;
			}
			return options;
		},

		/** Generate standard options for map charts.
			@private
			@param options {object} The chart settings.
			@param labels {string} The concatenated labels for the chart.
			@return {string} The standard map chart options. */
		_mapOptions: function(options, labels) {
			var encoding = this['_' + options.encoding + 'Encoding'] || this['_textEncoding'];
			var colours = '';
			for (var i = 0; i < options.mapColors.length; i++) {
				colours += ',' + $.gchart.color(options.mapColors[i]);
			}
			return (typeof options.mapArea === 'string' ? '&chtm=' + options.mapArea :
				(options.mapArea ? (options.mapLatLong ? ':fixed=' : ':auto=') +
				($.isArray(options.mapArea) ? options.mapArea.join(',') :
				options.mapArea + ',' + options.mapArea + ',' + options.mapArea + ',' + options.mapArea) : '')) +
				'&chd=' + encoding.apply($.gchart, [options]) +
				(options.mapRegions && options.mapRegions.length ?
				'&chld=' + options.mapRegions.join(typeof options.mapArea === 'string' ? '' : '|') : '') +
				'&chco=' + $.gchart.color(options.mapDefaultColor) + colours;
		},

		/** Generate standard options for QR Code charts.
			@private
			@param options {object} The chart settings.
			@param labels {string} The concatenated labels for the chart.
			@return {string} The standard QR Code chart options. */
		_qrOptions: function(options, labels) {
			return $.gchart._include('&choe=', options.encoding) +
				(options.qrECLevel || options.qrMargin ?
				'&chld=' + (options.qrECLevel ? options.qrECLevel.charAt(0) : 'l') +
				(options.qrMargin != null ? '|' + options.qrMargin : '') : '') +
				(labels ? '&chl=' + labels.substr(1) : '');
		},

		/** Generate standard options for charts that aren't really charts.
			@private
			@param options {object} The chart settings.
			@param labels {string} The concatenated labels for the chart.
			@return {string} The standard non-chart options. */
		_noOptions: function(options, labels) {
			return '&chl=' + labels.substr(1);
		},

		/** Generate the options for chart size, including restriction for maps.
			@private
			@param type {string} The encoded chart type.
			@param options {object} The chart settings.
			@return {string} The chart size options. */
		_addSize: function(type, options) {
			var maxSize = (type === 'map' || type === 't' ? 600 : 1000);
			options.width = Math.max(10, Math.min(options.width, maxSize));
			options.height = Math.max(10, Math.min(options.height, maxSize));
			if (options.width * options.height > 300000) {
				options.height = Math.floor(300000 / options.width);
			}
			return 'chs=' + options.width + 'x' + options.height;
		}
	});

})(jQuery);

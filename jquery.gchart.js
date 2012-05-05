/* http://keith-wood.name/gChart.html
   Google Chart interface for jQuery v1.1.1.
   See API details at http://code.google.com/apis/chart/.
   Written by Keith Wood (kbwood@virginbroadband.com.au) September 2008.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */

/* Request a chart from Google charts.
   $('div selector').gchart({type: 'pie', series: [$.gchart.series([101, 84])]});
*/

(function($) { // Hide scope, no $ conflict

/* Google Charting manager. */
function GChart() {
	this._defaults = {
		width: 0, // Width of the chart
		height: 0, // Height of the chart
		title: '', // The title of the chart
		titleColor: '', // The colour of the title
		titleSize: 0, // The font size of the title
		backgroundColor: null, // The background colour for the entire image
		chartColor: null, // The background colour for the chart area
		legend: '', // The location of the legend: top, bottom, left, right, or '' for none
		type: 'pie3D', // Type of chart requested: line, lineXY, sparkline,
			// barHoriz, barVert, barHorizGrouped, barVertGrouped, pie, pie3D (default),
			// venn, scatter, radar, radarCurved, map, meter, qrCode
		encoding: '', // Type of data encoding: text (default), scaled, simple, extended
		series: [this.series('Hello', [60]), this.series('World', [40])], // Details about the values to be plotted
		dataLabels: [], // Labels for the values across all the series
		axes: [], // Definitions for the various axes, each entry is either
			// a string of the axis name or an object with
			// axis (x, y, top, left, bottom, right), labels (string[], optional),
			// positions (number[], optional), and range (number[2], optional),
			// color (string, optional), alignment (string, optional),
			// and size (number, optional) attributes
		ranges: [], // Definitions of ranges for the chart, each entry is an object with
			// vertical (boolean), color (string), start (number, 0-1),
			// and end (number, 0-1) attributes
		markers: [], // Definitions of markers for the chart, each entry is an object with
			// shape (arrow, circle, cross, diamond, down, horizontal,
			// plus, sparkfill, sparkline, square, text, vertical),
			// color (string), series (number), item (number), size (number),
			// priority (number), text (string)
		minValue: 0, // The minimum value of the data, $.gchart.calculate to calculate from data
		maxValue: 100, // The maximum value of the data, $.gchart.calculate to calculate from data
		gridSize: [], // The x and y spacings between grid lines
		gridLine: [], // The line and gap lengths for the grid lines
		extension: {}, // Any custom extensions to the Google chart parameters
		// Bar charts -------------
		barWidth: null, // The width of each bar (pixels)
		barSpacing: null, // The space (pixels) between bars in a group
		barGroupSpacing: null, // The space (pixels) between groups of bars
		barZeroPoint: null, // The position (0.0 to 1.0) of the zero-line
		// Maps -------------------
		mapArea: 'world', // The general area to show: world,
			// africa, asia, europe, middle_east, south_america, usa
		mapRegions: [], // List of country/state codes to plot
		mapDefaultColor: 'white', // The colour for non-plotted countries/states
		mapColors: ['aaffaa', 'green'], // The colour range for plotted countries/states
		// QR Code ----------------
		qrECLevel: null, // Error correction level: low, medium, quarter, high
		qrMargin: null // Margin (squares) around QR code, default is 4
	};
};

/* The name of the data property that holds the instance settings. */
var PROP_NAME = 'gChart';
/* Translations of text colour names into chart values. */
var COLOURS = {aqua: '008080', black: '000000', blue: '0000ff', fuchsia: 'ff00ff',
	gray: '808080', green: '008000', lime: '00ff00', maroon: '800000', navy: '000080',
	olive: '808000', orange: 'ffa500', purple: '800080', red: 'ff0000', silver: 'c0c0c0',
	teal: '008080', transparent: '00000000', white: 'ffffff', yellow: 'ffff00'};
/* Mapping from plugin chart types to Google chart types. */
var CHART_TYPES = {line: 'lc', lineXY: 'lxy', sparkline: 'ls',
	barHoriz: 'bhs', barVert: 'bvs', barHorizGrouped: 'bhg', barVertGrouped: 'bvg',
	pie: 'p', pie3D: 'p3', venn: 'v', scatter: 's',
	radar: 'r', radarCurved: 'rs', map: 't', meter: 'gom', qrCode: 'qr'};
/* Mapping from plugin shape types to Google chart shapes. */
var SHAPES = {arrow: 'a', circle: 'o', cross: 'x', diamond: 'd', down: 'v', horizontal: 'h',
	plus: 'c', sparkfill: 'B', sparkline: 'D', square: 's', text: 't', vertical: 'V'};
/* Mapping from plugin priority names to chart priority codes. */
var PRIORITIES = {behind: -1, normal: 0, above: 1};
/* Mapping from plugin gradient names to angles. */
var GRADIENTS = {diagonalDown: -45, diagonalUp: 45, horizontal: 0, vertical: 90};
/* Mapping from plugin alignment names to chart alignment codes. */
var ALIGNMENTS = {left: -1, center: 0, right: 1};

/* Characters to use for encoding schemes. */
var SIMPLE_ENCODING = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var EXTENDED_ENCODING = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.';

$.extend(GChart.prototype, {
	/* Class name added to elements to indicate already configured with Google charting. */
	markerClassName: 'hasGChart',
	
	/* Marker value to indicate min/max calculation from data. */
	calculate: -0.123,

	/* Override the default settings for all Google chart instances.
	   @param  options  (object) the new settings to use as defaults */
	setDefaults: function(options) {
		extendRemove(this._defaults, options || {});
	},

	/* Create a new data series.
	   @param  label       (string, optional) the label for this series
	   @param  data        (number[]) the data values for this series
	   @param  colour      (string) the colour for this series
	   @param  fillColour  (string, optional) the fill colour for this series
	   @param  minValue    (number) the minimum value for this series
	   @param  maxValue    (number) the maximum value for this series
	   @param  thickness   (number) the thickness (pixels) of the line for this series
	   @param  segments    (number[2]) the line and gap lengths (pixels) for this series
	   @return  (object) the new series object */
	series: function(label, data, colour, fillColour, minValue, maxValue, thickness, segments) {
		if (isArray(label)) { // Optional label
			segments = thickness;
			thickness = maxValue;
			maxValue = minValue;
			minValue = fillColour;
			fillColour = colour;
			colour = data;
			data = label;
			label = '';
		}
		if (typeof colour != 'string') { // Optional colour/fillColour
			segments = maxValue;
			thickness = minValue;
			maxValue = fillColour;
			minValue = colour;
			fillColour = null;
			colour = null;
		}
		else if (fillColour != null && typeof fillColour != 'string') { // Optional fillColour
			segments = thickness;
			thickness = maxValue;
			maxValue = minValue;
			minValue = fillColour;
			fillColour = null;
		}
		if (isArray(maxValue)) { // Optional min/max values
			segments = maxValue;
			thickness = minValue;
			maxValue = null;
			minValue = null;
		}
		return {label: label, data: data || [], color: colour || '',
			fillColor: fillColour, minValue: minValue, maxValue: maxValue,
			lineThickness: thickness, lineSegments: segments};
	},

	/* Load series data from CSV.
	   Include a header row if fields other than data required.
	   Use these names - label, color, fillColor, minValue, maxValue,
	   lineThickness, lineSegmentLine, lineSegmentGap - for series attributes.
	   Data columns should be labelled ynn, where nn is a sequential number.
	   For X-Y line charts, include xnn columns before corresponding ynn.
	   @param  csv  (string or string[]) the series data in CSV format
	   @return  (object[]) the series definitions */
	seriesFromCsv: function(csv) {
		var seriesData = [];
		if (!isArray(csv)) {
			csv = csv.split('\n');
		}
		if (!csv.length) {
			return seriesData;
		}
		var xyData = false;
		var sColumns = [];
		var xColumns = [];
		var fields = ['label', 'color', 'fillColor', 'minValue', 'maxValue',
			'lineThickness', 'lineSegmentLine', 'lineSegmentGap'];
		$.each(csv, function(i, line) {
			var cols = line.split(',');
			if (i == 0 && isNaN(parseFloat(cols[0]))) { // Header row
				$.each(cols, function(i, val) {
					if ($.inArray(val, fields) > -1) { // Note the positions of the columns
						sColumns[i] = val;
					}
					else if (val.match(/^x\d+$/)) { // Column with x-coordinate
						xColumns[i] = val;
					}
				});
			}
			else {
				var series = {};
				var data = [];
				var saveX = null;
				$.each(cols, function(i, val) {
					if (sColumns[i]) { // Non-data value
						var pos = $.inArray(sColumns[i], fields);
						series[sColumns[i]] = (pos > 2 ? $.gchart._numeric(val, 0) : val);
					}
					else if (xColumns[i]) { // X-coordinate
						saveX = (val ? $.gchart._numeric(val, -1) : null);
						xyData = true;
					}
					else {
						var y = $.gchart._numeric(val, -1);
						data.push(saveX != null ? [saveX, y] : y);
						saveX = null;
					}
				});
				if (series.lineSegmentLine != null && series.lineSegmentGap != null) {
					series.lineSegments = [series.lineSegmentLine, series.lineSegmentGap];
					series.lineSegmentLine = series.lineSegmentGap = null;
				}
				seriesData.push($.extend(series, {data: data}));
			}
		});
		return (xyData ? this.seriesForXYLines(seriesData) : seriesData);
	},

	/* Load series data from XML. All attributes are optional except point/@y.
	   <data>
	     <series label="" color="" fillColor="" minValue="" maxValue="" lineThickness="" lineSegments="">
	       <point x="" y=""/>
	       ...
	     </series>
	     ...
	   </data>
	   @param  xml  (string or Document) the XML containing the series data
	   @return  (object[]) the series definitions */
	seriesFromXml: function(xml) {
		if ($.browser.msie && typeof xml == 'string') {
			var doc = new ActiveXObject('Microsoft.XMLDOM');
			doc.validateOnParse = false;
			doc.resolveExternals = false;
			doc.loadXML(xml);
			xml = doc;
		}
		xml = $(xml);
		var seriesData = [];
		var xyData = false;
		xml.find('series').each(function() {
			var series = $(this);
			var data = [];
			series.find('point').each(function() {
				var point = $(this);
				var x = point.attr('x');
				if (x != null) {
					xyData = true;
					x = $.gchart._numeric(x, -1);
				}
				y = $.gchart._numeric(point.attr('y'), -1);
				data.push(x ? [x, y] : y);
			});
			var segments = series.attr('lineSegments');
			if (segments) {
				segments = segments.split(',');
			}
			seriesData.push({label: series.attr('label'), data: data,
				color: series.attr('color'), fillColor: series.attr('fillColor'),
				minValue: series.attr('minValue'), maxValue: series.attr('maxValue'),
				lineThickness: series.attr('lineThickness'), lineSegments: segments});
		});
		return (xyData ? this.seriesForXYLines(seriesData) : seriesData);
	},

	/* Force a value to be numeric.
	   @param  val      (string) the value to convert
	   @param  whenNaN  (number) value to use if not numeric
	   @return  (number) the numeric equivalent or whenNaN if not numeric */
	_numeric: function(val, whenNaN) {
		val = parseFloat(val);
		return (isNaN(val) ? whenNaN : val);
	},

	/* Prepare series for a line XY chart.
	   @param  series  (object[]) the details of the points to plot,
	                   each data value may be an array of two points
	   @return  (object[]) the transformed series
	   @deprecated  in favour of seriesForXYLines */
	lineXYSeries: function(series) {
		return this.seriesForXYLines(series);
	},

	/* Prepare series for a line XY chart.
	   @param  series  (object[]) the details of the points to plot,
	                   each data value may be an array of two points
	   @return  (object[]) the transformed series */
	seriesForXYLines: function(series) {
		var xySeries = [];
		for (var i = 0; i < series.length; i++) {
			var xNull = !isArray(series[i].data[0]);
			var xData = (xNull ? [null] : []);
			var yData = [];
			for (var j = 0; j < series[i].data.length; j++) {
				if (xNull) {
					yData[yData.length] = series[i].data[j];
				}
				else {
					xData[xData.length] = series[i].data[j][0];
					yData[yData.length] = series[i].data[j][1];
				}
			}
			xySeries.push($.gchart.series(series[i].label, xData, series[i].color,
				series[i].fillColor, series[i].minValue, series[i].maxValue,
				series[i].lineThickness, series[i].lineSegments));
			xySeries.push($.gchart.series(series[i].label, yData, '',
				series[i].fillColor, series[i].minValue, series[i].maxValue,
				series[i].lineThickness, series[i].lineSegments));
		}
		return xySeries;
	},

	/* Prepare options for a scatter chart.
	   @param  values   (number[][]) the coordinates of the points:
	                    [0] is the x-coord, [1] is the y-coord, [2] is the percentage size
	   @param  options  (object) additional settings (optional)
	   @return  (object) the configured options object */
	scatter: function(values, options) {
		var series = [[], [], []];
		for (var i = 0; i < values.length; i++) {
			series[0][i] = values[i][0];
			series[1][i] = values[i][1];
			series[2][i] = values[i][2] || 100;
		}
		return $.extend({}, options || {}, {type: 'scatter',
			series: [$.gchart.series('', series[0]),
				$.gchart.series('', series[1]),
				$.gchart.series('', series[2])]});
	},

	/* Prepare options for a Venn diagram.
	   @param  size1       (number) the relative size of the first circle
	   @param  size2       (number) the relative size of the second circle
	   @param  size3       (number) the relative size of the third circle
	   @param  overlap12   (number) the overlap between circles 1 and 2
	   @param  overlap13   (number) the overlap between circles 1 and 3
	   @param  overlap23   (number) the overlap between circles 2 and 3
	   @param  overlap123  (number) the overlap between all circles
	   @param  options     (object) additional settings (optional)
	   @return  (object) the configured options object */
	venn: function(size1, size2, size3, overlap12, overlap13, overlap23, overlap123, options) {
		return $.extend({}, options || {}, {type: 'venn', series:
			[$.gchart.series([size1, size2, size3, overlap12, overlap13, overlap23, overlap123])]});
	},

	/* Prepare options for a Google meter.
	   @param  text      (string) the text to show on the arrow (optional)
	   @param  value     (number) the position of the arrow
	   @param  maxValue  (number) the maximum value for the meter (optional, default 100)
	   @param  options   (object) additional settings (optional)
	   @return  (object) the configured options object */
	meter: function(text, value, maxValue, options) {
		if (typeof text != 'string') {
			options = maxValue;
			maxValue = value;
			value = text;
			text = '';
		}
		return $.extend({}, options || {}, {type: 'meter', maxValue: maxValue || 100,
			dataLabels: [text || ''], series: [$.gchart.series([value])]});
	},

	/* Prepare options for a map chart.
	   @param  mapArea        (string) the region of the world to show (optional)
	   @param  values         (object) the countries/states to plot -
	                          attributes are country/state codes and values
	   @param  defaultColour  (string) the colour for regions without values (optional)
	   @param  startColour    (string) the starting colour for rendering values (optional)
	   @param  endColour      (string) the ending colour for rendering values (optional)
	   @param  options        (object) additional settings (optional)
	   @return  (object) the configured options object */
	map: function(mapArea, values, defaultColour, startColour, endColour, options) {
		if (typeof mapArea == 'object') { // Optional mapArea
			options = endColour;
			endColour = startColour;
			startColour = defaultColour;
			defaultColour = values;
			values = mapArea;
			mapArea = 'world';
		}
		if (typeof defaultColour == 'object') {
			options = defaultColour;
			defaultColour = null;
		}
		else if (typeof startColour == 'object') {
			options = startColour;
			startColour = null;
		}
		else if (typeof endColour == 'object') {
			options = endColour;
			endColour = null;
		}
		var mapRegions = [];
		var data = [];
		var i = 0;
		for (var name in values) {
			mapRegions[i] = name;
			data[i] = values[name];
			i++;
		}
		return $.extend({}, options || {}, {type: 'map',
			mapArea: mapArea, mapRegions: mapRegions,
			mapDefaultColor: defaultColour || $.gchart._defaults.mapDefaultColor,
			mapColors: [startColour || $.gchart._defaults.mapColors[0],
			endColour || $.gchart._defaults.mapColors[1]],
			series: [$.gchart.series('', data)]});
	},

	/* Prepare options for generating a QR Code.
	   @param  text      (object) the QR code settings or
	                     (string) the text to encode
	   @param  encoding  (string) the encoding scheme (optional)
	   @param  ecLevel   (string) the error correction level: l, m, q, h (optional)
	   @param  margin    (number) the margin around the code (optional)
	   @return  (object) the configured options object */
	qrCode: function(text, encoding, ecLevel, margin) {
		var options = {};
		if (typeof text == 'object') {
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

	/* Generate a Google chart color.
	   @param  r  (string) colour name or
	              (number) red value (0-255)
	   @param  g  (number) green value (0-255) or
	              (number) alpha value (0-255, optional) if r is name
	   @param  b  (number) blue value (0-255)
	   @param  a  (number) alpha value (0-255, optional)
	   @return  (string) the translated colour */
	color: function(r, g, b, a) {
		var checkRange = function(value) {
			if (typeof value == 'number' && (value < 0 || value > 255)) {
				throw 'Value out of range (0-255) ' + value;
			}
		};
		var twoDigits = function(value) {
			return (value.length == 1 ? '0' : '') + value;
		};
		if (typeof r == 'string') {
			checkRange(g);
			return (COLOURS[r] || r) + (g ? twoDigits(g.toString(16)) : '');
		}
		checkRange(r);
		checkRange(g);
		checkRange(b);
		checkRange(a);
		return twoDigits(r.toString(16)) + twoDigits(g.toString(16)) +
			twoDigits(b.toString(16)) + (a ? twoDigits(a.toString(16)) : '');
	},

	/* Create a simple linear gradient definition for a background.
	   @param  angle    (string or number) the angle of the gradient from x-axis
	   @param  colour1  (string[]) an array of colours or
	                    (string) the starting colour
	   @param  colour2  (string, optional) the ending colour
	   @return  (object) the gradient definition */
	gradient: function(angle, colour1, colour2) {
		var colourPoints = [];
		if (isArray(colour1)) {
			var step = 1 / (colour1.length - 1);
			for (var i = 0; i < colour1.length; i++) {
				colourPoints[colourPoints.length] =
					[colour1[i], Math.round(i * step * 100) / 100];
			}
		}
		else {
			colourPoints = [[colour1, 0], [colour2, 1]];
		}
		return {angle: angle, colorPoints: colourPoints};
	},

	/* Create a colour striping definition for a background.
	   @param  angle    (string or number) the angle of the stripes from x-axis
	   @param  colours  (string[]) the colours to stripe
	   @return  (object) the stripe definition */
	stripe: function(angle, colours) {
		var colourPoints = [];
		var width = Math.round(100 / colours.length) / 100;
		for (var i = 0; i < colours.length; i++) {
			colourPoints[colourPoints.length] = [colours[i], width];
		}
		return {angle: angle, striped: true, colorPoints: colourPoints};
	},

	/* Create a range definition.
	   @param  vertical  (boolean, optional) true if vertical, false if horizontal
	   @param  colour    (string) the marker's colour
	   @param  start     (number) the starting point for the range (0.0 to 1.0)
	   @param  end       (number, optional) the ending point for the range (0.0 to 1.0)
	   @return  (object) the range definition */
	range: function(vertical, colour, start, end) {
		if (typeof vertical == 'string') { // Optional vertical
			end = start;
			start = colour;
			colour = vertical;
			vertical = false;
		}
		return {vertical: vertical, color: colour, start: start, end: end};
	},

	/* Create a marker definition.
	   @param  shape     (string) the marker shape
	   @param  colour    (string) the marker's colour
	   @param  series    (number) the series to which the marker applies
	   @param  item      (number or string, optional) the item in the series to which it applies
	   @param  size      (number, optional) the size (pixels) of the marker
	   @param  priority  (string or number, optional) the rendering priority
	   @param  text      (string, optional) the display text for a text type marker
	   @return  (object) the marker definition */
	marker: function(shape, colour, series, item, size, priority, text) {
		if (typeof size == 'string') { // Optional size/priority
			text = size;
			size = null;
		}
		return {shape: shape, color: colour, series: series, item: item || -1,
			size: size || 10, priority: (priority != null ? priority : 0), text: text};
	},

	/* Create an axis definition.
	   @param  axis        (string) the axis position: top, bottom, left, right
	   @param  labels      (string[]) the labels for this axis
	   @param  positions   (number[]) the positions of the labels
	   @param  rangeStart  (number) start of range
	   @param  rangeEnd    (number) end of range
	   @param  colour      (string) the axis colour
	   @param  alignment   (string) the labels' alignment
	   @param  size        (number) the labels' size
	   @return  (object) the axis definition */
	axis: function(axis, labels, positions, rangeStart, rangeEnd, colour, alignment, size) {
		if (typeof labels == 'number') { // Range instead of labels/positions
			size = colour;
			alignment = rangeEnd;
			colour = rangeStart;
			rangeEnd = positions;
			rangeStart = labels;
			positions = null;
			labels = null;
		}
		else if (!isArray(positions)) { // Optional positions
			size = alignment;
			alignment = colour;
			colour = rangeEnd;
			rangeEnd = rangeStart;
			rangeStart = positions;
			positions = null;
		}
		if (typeof rangeStart == 'string') { // Optional rangeStart/rangeEnd
			size = colour;
			alignment = rangeEnd;
			colour = rangeStart;
			rangeEnd = null;
			rangeStart = null;
		}
		if (typeof alignment == 'number') { // Optional alignment
			size = alignment;
			alignment = null;
		}
		return {axis: axis, labels: labels, positions: positions,
			range: (rangeStart != null ? [rangeStart, rangeEnd] : null),
			color: colour, alignment: alignment, size: size};
	},

	/* Attach the Google chart functionality to a div.
	   @param  target   (element) the containing division
	   @param  options  (object) the settings for this Google chart instance (optional) */
	_attachGChart: function(target, options) {
		target = $(target);
		if (target.is('.' + this.markerClassName)) {
			return;
		}
		target.addClass(this.markerClassName);
		options = options || {};
		var width = options.width || parseInt(target.css('width'));
		var height = options.height || parseInt(target.css('height'));
		var allOptions = $.extend({}, this._defaults, options,
			{width: width, height: height});
		$.data(target[0], PROP_NAME, allOptions);
		this._updateChart(target[0], allOptions);
	},

	/* Reconfigure the settings for a Google charting div.
	   @param  target   (element) the containing division
	   @param  options  (object) the new settings for this Google chart instance */
	_changeGChart: function(target, options) {
		var curOptions = $.data(target, PROP_NAME);
		extendRemove(curOptions || {}, options || {});
		$.data(target, PROP_NAME, curOptions);
		this._updateChart(target, curOptions);
	},

	/* Remove the Google charting functionality from a div.
	   @param  target  (element) the containing division */
	_destroyGChart: function(target) {
		target = $(target);
		if (!target.is('.' + this.markerClassName)) {
			return;
		}
		target.removeClass(this.markerClassName).empty();
		$.removeData(target[0], PROP_NAME);
	},

	/* Update the Google charting div with the new settings.
	   @param  target   (element) the containing division
	   @param  options  (object) the new settings for this Google chart instance */
	_updateChart: function(target, options) {
		var type = CHART_TYPES[options.type] || 'p3';
		var encoding = this['_' + options.encoding + 'Encoding'] ||
			this['_textEncoding'];
		var labels = '';
		for (var i = 0; i < options.dataLabels.length; i++) {
			labels += '|' + escape(options.dataLabels[i] || '');
		}
		labels = (labels.length == options.dataLabels.length ? '' : labels);
		var legends = '';
		var colours = '';
		var lines = '';
		for (var i = 0; i < options.series.length; i++) {
			legends += '|' + escape(options.series[i].label || '');
			if (type != 'lxy' || i % 2 == 0) {
				colours += ',' + this.color(options.series[i].color || '');
			}
			if (type.substr(0, 1) == 'l' && options.series[i].lineThickness &&
					isArray(options.series[i].lineSegments)) {
				lines += '|' + options.series[i].lineThickness + ',' +
					options.series[i].lineSegments.join(',');
			}
		}
		var include = function(name, value) {
			return (value ? name + value : '');
		};
		var addSize = function() {
			options.width = Math.min(options.width, 1000);
			options.height = Math.min(options.height, 1000);
			if (type != 't' && options.width * options.height > 300000) {
				options.height = Math.floor(300000 / options.width);
			}
			return (type != 't' ? '&amp;chs=' + options.width + 'x' + options.height :
				'&amp;chs=' + Math.min(440, options.width) + 'x' + Math.min(220, options.height));
		};
		var qrOptions = function() {
			return include('&amp;choe=', options.encoding) +
				(options.qrECLevel || options.qrMargin ?
				'&amp;chld=' + (options.qrECLevel ? options.qrECLevel.charAt(0) : 'l') +
				(options.qrMargin != null ? '|' + options.qrMargin : '') : '') +
				(labels ? '&amp;chl=' + labels.substr(1) : '');
		};
		var mapOptions = function() {
			return '&amp;chtm=' + (options.mapArea || 'world') +
				'&amp;chd=' + encoding.apply($.gchart, [options]) +
				(options.mapRegions && options.mapRegions.length ?
				'&amp;chld=' + options.mapRegions.join('') : '') +
				'&amp;chco=' + $.gchart.color(options.mapDefaultColor) + ',' +
				$.gchart.color(options.mapColors[0] || 'aaffaa') + ',' +
				$.gchart.color(options.mapColors[1] || 'green');
		};
		var pieOptions = function() {
			var series = options.series;
			var pieLabels = '';
			if (options.series.length > 1) {
				var pieSeries = $.gchart.series([]);
				for (var i = 0; i < options.series.length; i++) {
					pieSeries.data[pieSeries.data.length] = options.series[i].data[0];
					pieLabels += '|' + escape(options.series[i].label || '');
				}
				options.series = [pieSeries];
			}
			var data = encoding.apply($.gchart, [options]);
			options.series = series;
			return '&amp;chd=' + data + (labels ? '&amp;chl=' + labels.substr(1) :
				(pieLabels ? '&amp;chl=' + pieLabels.substr(1) : ''));
		};
		var standardOptions = function() {
			return '&amp;chd=' + encoding.apply($.gchart, [options]) +
				(labels ? '&amp;chl=' + labels.substr(1) : '');
		};
		var addBarSizings = function() {
			return (type.substr(0, 1) != 'b' ? '' : (options.barWidth == null ? '' :
				'&amp;chbh=' + options.barWidth +
				(options.barSpacing == null ? '' : ',' + options.barSpacing +
				(options.barGroupSpacing == null ? '' : ',' + options.barGroupSpacing))) +
				(options.barZeroPoint == null ? '' : '&amp;chp=' + options.barZeroPoint));
		};
		var addLineStyles = function() {
			return (type.charAt(0) == 'l' && lines ? '&amp;chls=' + lines.substr(1) : '');
		};
		var addColours = function() {
			return (colours.length > options.series.length ? '&amp;chco=' + colours.substr(1) : '');
		};
		var addTitle = function() {
			return include('&amp;chtt=', escape(options.title)) +
			(options.titleColor || options.titleSize ?
			'&amp;chts=' + $.gchart.color(options.titleColor) + ',' +
			(options.titleSize || 20) : '');
		};
		var addAxes = function() {
			var axes = '';
			var axesLabels = '';
			var axesPositions = '';
			var axesRanges = '';
			var axesStyles = '';
			for (var i = 0; i < options.axes.length; i++) {
				var axis = (typeof options.axes[i] == 'string' ?
					options.axes[i].charAt(0) : options.axes[i].axis.charAt(0));
				axes += ',' + (axis == 'b' ? 'x' : (axis == 'l' ? 'y' : axis));
				if (options.axes[i].labels) {
					var labels = '';
					for (var j = 0; j < options.axes[i].labels.length; j++) {
						labels += '|' + escape(options.axes[i].labels[j] || '');
					}
					axesLabels += (labels ? '|' + i + ':' + labels : '');
				}
				if (options.axes[i].positions) {
					var positions = '';
					for (var j = 0; j < options.axes[i].positions.length; j++) {
						positions += ',' + options.axes[i].positions[j];
					}
					axesPositions += (positions ? '|' + i + positions : '');
				}
				if (options.axes[i].range) {
					axesRanges += '|' + i + ',' + options.axes[i].range[0] +
						',' + options.axes[i].range[1];
				}
				if (options.axes[i].color) {
					var alignment = options.axes[i].alignment || 0;
					axesStyles += '|' + i + ',' +
						$.gchart.color(options.axes[i].color || 'gray') + ',' +
						(options.axes[i].size || 10) + ',' + 
						(ALIGNMENTS[alignment] != null ? ALIGNMENTS[alignment] : alignment);
				}
			}
			return (!axes ? '' : '&amp;chxt=' + axes.substr(1) +
				(!axesLabels ? '' : '&amp;chxl=' + axesLabels.substr(1)) +
				(!axesPositions ? '' : '&amp;chxp=' + axesPositions.substr(1)) +
				(!axesRanges ? '' : '&amp;chxr=' + axesRanges.substr(1)) +
				(!axesStyles ? '' : '&amp;chxs=' + axesStyles.substr(1)));
		};
		var addBackground = function(area, background) {
			if (background == null) {
				return '';
			}
			if (typeof background == 'string') {
				return area + ',s,' + $.gchart.color(background);
			}
			var bg = area + ',l' + (background.striped ? 's' : 'g') + ',' +
				(GRADIENTS[background.angle] != null ?
				GRADIENTS[background.angle] : background.angle);
			for (var i = 0; i < background.colorPoints.length; i++) {
				bg += ',' + $.gchart.color(background.colorPoints[i][0]) +
					',' + background.colorPoints[i][1];
			}
			return bg;
		};
		var addBackgrounds = function() {
			var backgrounds = addBackground('|bg', options.backgroundColor) +
				addBackground('|c', options.chartColor);
			return (backgrounds ? '&amp;chf=' + backgrounds.substr(1) : '');
		};
		var addGrids = function() {
			return (options.gridSize.length == 0 ? '' :
				'&amp;chg=' + options.gridSize[0] + ',' + options.gridSize[1] +
				(options.gridLine.length == 0 ? '' :
				',' + options.gridLine[0] + ',' + options.gridLine[1]));
		};
		var addMarkers = function() {
			var markers = '';
			for (var i = 0; i < options.markers.length; i++) {
				var shape = SHAPES[options.markers[i].shape] || options.markers[i].shape;
				markers += '|' + shape + (shape == 't' ? options.markers[i].text : '') + ',' +
					$.gchart.color(options.markers[i].color) + ',' +
					options.markers[i].series + ',' +
					(options.markers[i].item == 'all' ? -1 : options.markers[i].item) + ',' +
					options.markers[i].size + ',' +
					(PRIORITIES[options.markers[i].priority] != null ?
					PRIORITIES[options.markers[i].priority] : options.markers[i].priority);
			}
			for (var i = 0; i < options.ranges.length; i++) {
				markers += '|' + (options.ranges[i].vertical ? 'R' : 'r') + ',' +
					$.gchart.color(options.ranges[i].color) + ',0,' +
					options.ranges[i].start + ',' +
					(options.ranges[i].end || options.ranges[i].start + 0.005);
			}
			for (var i = 0; i < options.series.length; i++) {
				markers += (!options.series[i].fillColor ? '' :
					'|b,' + $.gchart.color(options.series[i].fillColor) +
					',' + i + ',' + (i + 1) + ',0');
			}
			return (markers ? '&amp;chm=' + markers.substr(1) : '');
		};
		var addLegends = function() {
			return (!options.legend || legends.length <= options.series.length ? '' :
				'&amp;chdl=' + legends.substr(1) + include('&amp;chdlp=', options.legend.charAt(0)));
		};
		var addExtensions = function() {
			var params = '';
			for (var name in options.extension) {
				params += '&amp;' + name + '=' + escape(options.extension[name]);
			}
			return params;
		};
		$(target).html('<img src="http://chart.apis.google.com/chart?cht=' + type + addSize() +
			(type == 'qr' ? qrOptions() : (type == 't' ? mapOptions() :
			(type.charAt(0) == 'p' ? pieOptions() : standardOptions()))) +
			addBarSizings() + addLineStyles() + addColours() + addTitle() + addAxes() +
			addBackgrounds() + addGrids() + addMarkers() +
			addLegends() + addExtensions() + '"/>');
	},

	/* Encode all series with text encoding.
	   @param  options  (object) the settings for this Google chart instance
	   @return  (string) the encoded series data */
	_textEncoding: function(options) {
		var minValue = (options.minValue == $.gchart.calculate ?
			this._calculateMinValue(options.series) : options.minValue);
		var maxValue = (options.maxValue == $.gchart.calculate ?
			this._calculateMaxValue(options.series) : options.maxValue);
		var data = '';
		for (var i = 0; i < options.series.length; i++) {
			data += '|' + this._textEncode(options.series[i], minValue, maxValue);
		}
		return 't:' + data.substr(1);
	},

	/* Encode values in text format: numeric 0.0 to 100.0, comma separated, -1 for null
	   @param  series    (object) details about the data values to encode
	   @param  minValue  (number) the minimum possible data value
	   @param  maxValue  (number) the maximum possible data value
	   @return  (string) the encoded data values */
	_textEncode: function(series, minValue, maxValue) {
		minValue = (series.minValue != null ? series.minValue : minValue);
		maxValue = (series.maxValue != null ? series.maxValue : maxValue);
		var factor = 100 / (maxValue - minValue);
		var data = '';
		for (var i = 0; i < series.data.length; i++) {
			data += ',' + (series.data[i] == null || isNaN(series.data[i]) ? '-1' :
				Math.round(factor * (series.data[i] - minValue) * 100) / 100);
		}
		return data.substr(1);
	},

	/* Encode all series with scaled text encoding.
	   @param  options  (object) the settings for this Google chart instance
	   @return  (string) the encoded series data */
	_scaledEncoding: function(options) {
		var minValue = (options.minValue == $.gchart.calculate ?
			this._calculateMinValue(options.series) : options.minValue);
		var maxValue = (options.maxValue == $.gchart.calculate ?
			this._calculateMaxValue(options.series) : options.maxValue);
		var data = '';
		var minMax = '';
		for (var i = 0; i < options.series.length; i++) {
			data += '|' + this._scaledEncode(options.series[i], minValue);
			minMax += ',' + (options.series[i].minValue != null ?
				options.series[i].minValue : minValue) +
				',' + (options.series[i].maxValue != null ?
				options.series[i].maxValue : maxValue);
		}
		return 't:' + data.substr(1) + '&amp;chds=' + minMax.substr(1);
	},

	/* Encode values in text format: numeric min to max, comma separated, min - 1 for null
	   @param  series    (object) details about the data values to encode
	   @param  minValue  (number) the minimum possible data value
	   @return  (string) the encoded data values */
	_scaledEncode: function(series, minValue) {
		minValue = (series.minValue != null ? series.minValue : minValue);
		var data = '';
		for (var i = 0; i < series.data.length; i++) {
			data += ',' + (series.data[i] == null || isNaN(series.data[i]) ?
				(minValue - 1) : series.data[i]);
		}
		return data.substr(1);
	},

	/* Encode all series with simple encoding.
	   @param  options  (object) the settings for this Google chart instance
	   @return  (string) the encoded series data */
	_simpleEncoding: function(options) {
		var minValue = (options.minValue == $.gchart.calculate ?
			this._calculateMinValue(options.series) : options.minValue);
		var maxValue = (options.maxValue == $.gchart.calculate ?
			this._calculateMaxValue(options.series) : options.maxValue);
		var data = '';
		for (var i = 0; i < options.series.length; i++) {
			data += ',' + this._simpleEncode(options.series[i], minValue, maxValue);
		}
		return 's:' + data.substr(1);
	},

	/* Encode values in simple format: single character,
	   banded-62 as A-Za-z0-9, _ for null.
	   @param  series    (object) details about the data values to encode
	   @param  minValue  (number) the minimum possible data value
	   @param  maxValue  (number) the maximum possible data value
	   @return  (string) the encoded data values */
	_simpleEncode: function(series, minValue, maxValue) {
		minValue = (series.minValue != null ? series.minValue : minValue);
		maxValue = (series.maxValue != null ? series.maxValue : maxValue);
		var factor = 61 / (maxValue - minValue);
		var data = '';
		for (var i = 0; i < series.data.length; i++) {
			data += (series.data[i] == null || isNaN(series.data[i]) ? '_' :
				SIMPLE_ENCODING.charAt(Math.round(factor * (series.data[i] - minValue))));
		}
		return data;
	},

	/* Encode all series with extended encoding.
	   @param  options  (object) the settings for this Google chart instance
	   @return  (string) the encoded series data */
	_extendedEncoding: function(options) {
		var minValue = (options.minValue == $.gchart.calculate ?
			this._calculateMinValue(options.series) : options.minValue);
		var maxValue = (options.maxValue == $.gchart.calculate ?
			this._calculateMaxValue(options.series) : options.maxValue);
		var data = '';
		for (var i = 0; i < options.series.length; i++) {
			data += ',' + this._extendedEncode(options.series[i], minValue, maxValue);
		}
		return 'e:' + data.substr(1);
	},

	/* Encode values in extended format: double character,
	   banded-4096 as A-Za-z0-9-., __ for null.
	   @param  series    (object) details about the data values to encode
	   @param  minValue  (number) the minimum possible data value
	   @param  maxValue  (number) the maximum possible data value
	   @return  (string) the encoded data values */
	_extendedEncode: function(series, minValue, maxValue) {
		minValue = (series.minValue != null ? series.minValue : minValue);
		maxValue = (series.maxValue != null ? series.maxValue : maxValue);
		var factor = 4095 / (maxValue - minValue);
		var encode = function(value) {
			return EXTENDED_ENCODING.charAt(value / 64) +
				EXTENDED_ENCODING.charAt(value % 64);
		};
		var data = '';
		for (var i = 0; i < series.data.length; i++) {
			data += (series.data[i] == null || isNaN(series.data[i]) ? '__' :
				encode(Math.round(factor * (series.data[i] - minValue))));
		}
		return data;
	},

	/* Determine the minimum value amongst the data values.
	   @param  series  (object[]) the series to examine
	   @return  (number) the minimum value therein */
	_calculateMinValue: function(series) {
		var minValue = 99999999;
		for (var i = 0; i < series.length; i++) {
			var data = series[i].data;
			for (var j = 0; j < data.length; j++) {
				minValue = Math.min(minValue, (data[j] == null ? 99999999 : data[j]));
			}
		}
		return minValue;
	},

	/* Determine the maximum value amongst the data values.
	   @param  series  (object[]) the series to examine
	   @return  (number) the maximum value therein */
	_calculateMaxValue: function(series) {
		var maxValue = -99999999;
		for (var i = 0; i < series.length; i++) {
			var data = series[i].data;
			for (var j = 0; j < data.length; j++) {
				maxValue = Math.max(maxValue, (data[j] == null ? -99999999 : data[j]));
			}
		}
		return maxValue;
	}
});

/* jQuery extend now ignores nulls!
   @param  target  (object) the object to extend
   @param  props   (object) the new attributes to add
   @return  (object) the updated object */
function extendRemove(target, props) {
	$.extend(target, props);
	for (var name in props) {
		if (props[name] == null) {
			target[name] = null;
		}
	}
	return target;
}

/* Determine whether an object is an array.
   @param  a  (object) the object to be tested
   @return  (boolean) true if this is an array, false if not */
function isArray(a) {
	return (a && a.constructor == Array);
}

/* Attach the Google chart functionality to a jQuery selection.
   @param  command  (string) the command to run (optional, default 'attach')
   @param  options  (object) the new settings to use for these Google chart instances
   @return  (jQuery object) for chaining further calls */
$.fn.gchart = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if (options == 'current') {
		return $.gchart['_' + options + 'GChart'].
			apply($.gchart, [this[0]].concat(otherArgs));
	}
	return this.each(function() {
		if (typeof options == 'string') {
			$.gchart['_' + options + 'GChart'].
				apply($.gchart, [this].concat(otherArgs));
		}
		else {
			$.gchart._attachGChart(this, options);
		}
	});
};

/* Initialise the Google chart functionality. */
$.gchart = new GChart(); // singleton instance

})(jQuery);

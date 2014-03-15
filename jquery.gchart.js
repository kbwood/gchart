/* http://keith-wood.name/gChart.html
   Google Chart interface for jQuery v2.0.0.
   See API details at https://developers.google.com/chart/image/.
   Written by Keith Wood (kbwood{at}iinet.com.au) September 2008.
   Available under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

	var pluginName = 'gchart';

	/* Translations of text colour names into chart values. */
	var COLOURS = {aqua: '008080', black: '000000', blue: '0000ff', fuchsia: 'ff00ff', gray: '808080',
		green: '008000', grey: '808080', lime: '00ff00', maroon: '800000', navy: '000080',
		olive: '808000', orange: 'ffa500', purple: '800080', red: 'ff0000', silver: 'c0c0c0',
		teal: '008080', transparent: '00000000', white: 'ffffff', yellow: 'ffff00'};
	/* Mapping from plugin shape types to Google chart shapes. */
	var SHAPES = {annotation: 'A', arrow: 'a', candlestick: 'F', circle: 'o', cross: 'x',
		diamond: 'd', down: 'v', errorbar: 'E', flag: 'f', financial: 'F', horizbar: 'H',
		horizontal: 'h', number: 'N', plus: 'c', rectangle: 'C', sparkfill: 'B',
		sparkline: 'D', sparkslice: 'b', square: 's', text: 't', vertical: 'V'};
	/* Mapping from plugin priority names to chart priority codes. */
	var PRIORITIES = {behind: -1, below: -1, normal: 0, above: +1, inFront: +1, '-': -1, '+': +1};
	/* Mapping from plugin gradient names to angles. */
	var GRADIENTS = {diagonalDown: -45, diagonalUp: 45, horizontal: 0, vertical: 90,
		dd: -45, du: 45, h: 0, v: 90};
	/* Mapping from plugin alignment names to chart alignment codes. */
	var ALIGNMENTS = {left: -1, center: 0, centre: 0, right: +1, l: -1, c: 0, r: +1};
	/* Mapping from plugin drawing control names to chart drawing control codes. */
	var DRAWING = {line: 'l', ticks: 't', both: 'lt'};
	/* Mapping from legend order names to chart drawing control codes. */
	var ORDERS = {normal: 'l', reverse: 'r', automatic: 'a', '': '', l: 'l', r: 'r', a: 'a'};
	/* Mapping from marker placement names to chart drawing placement codes. */
	var PLACEMENTS = {barbase: 's', barcenter: 'c', barcentre: 'c', bartop: 'e', bottom: 'b',
		center: 'h', centre: 'h', left: 'l', middle: 'v', right: 'r', top: 't',
		b: 'b', c: 'c', e: 'e', h: 'h', l: 'l', r: 'r', s: 's', t: 't', v: 'v'};

	/* Characters to use for encoding schemes. */
	var SIMPLE_ENCODING = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var EXTENDED_ENCODING = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.';

	/** Create the Google chart plugin.
		<p>Sets a div to display a chart from Google Charts.</p>
		<p>Expects HTML like:</p>
		<pre>&lt;div>&lt;/div></pre>
		<p>Provide inline configuration like:</p>
		<pre>&lt;div data-gchart="name: 'value'"></pre>
	 	@module GChart
		@augments JQPlugin
		@example $(selector).gchart()
 $(selector).gchart({type: 'pie', series: [$.gchart.series([101, 84])]}) */
	$.JQPlugin.createPlugin({
	
		/** The name of the plugin. */
		name: pluginName,
			
		/** Google Chart on load callback.
			Triggered when <a href="module-GChart.html#defaultOptions"><code>provideJson</code></a> is <code>true</code>.
			@callback GChartOnLoad
			@param jsonData {object} The JSON data describing the chart.
			@example onLoad: function(jsonData) {
	saveRegions = jsonData;
} */
			
		/** Default settings for the plugin.
			@property [width=0] {number} The width of the chart (pixels).
			@property [height=0] {number} The height of the chart (pixels).
			@property [format='png'] {string} The returned format: png, gif.
			@property [usePost=false] {boolean} <code>true</code> to POST instead of GET - for larger charts with more data.
			@property [secure=false] {boolean} <code>true</code> to access a secure version of Google Charts.
			@property [margins=null] {number|number[]} The minimum margins (pixels) around the chart:
						all or [left/right, top/bottom] or [left, right, top, bottom].
			@property [title=''] {string} The title of the chart.
			@property [titleColor=''] {string} The colour of the title.
			@property [titleSize=0] {number} The font size of the title, 0 for default.
			@property [opacity=0] {number} Make the entire chart semi-transparent (0.0-1.0 or 0-100).
			@property [backgroundColor=null] {string} The background colour for the entire image.
			@property [chartColor=null] {string} The background colour for the chart area.
			@property [legend=''] {string} The location of the legend: top, topVertical,
						bottom, bottomVertical, left, right, or '' for none.
			@property [legendOrder='normal'] {string} The order of items within a legend: normal, reverse, automatic.
			@property [legendDims=null] {number[]} The minimum size (pixels) of the legend: [width, height].
			@property [legendColor=''] {string} The colour of the legend.
			@property [legendSize=0] {number} The font size of the legend, 0 for default.
			@property [type='pie3D'] {string} Type of chart requested: line, lineXY, sparkline, barHoriz, barVert,
						barHorizGrouped, barVertGrouped, barHorizOverlapped, barVertOverlapped, pie, pie3D (default),
						pieConcentric, venn, scatter, radar, radarCurved, map, mapOriginal, meter, qrCode, formula.
			@property [encoding=''] {string} Type of data encoding: text (default), scaled, simple, extended.
			@property [series=[$.gchart.series('Hello&nbsp;World',[60,40])]] {object[]}
						Details about the values to be plotted.
			@property [visibleSeries=0] {number} The number of series that are directly displayed, 0 for all.
			@property [functions=[]] {function} Functions (array) to apply to be plotted based on data.
			@property [dataLabels=[]] {string[]} Labels for the values across all the series.
			@property [axes=[]] {object[]} Definitions for the various axes, each entry is either
						a string of the axis name or a GChartAxis object.
			@property [ranges=[]] {object[]} Definitions of ranges for the chart, each entry is an object with
						vertical (boolean), color (string), start (number, 0-1), and end (number, 0-1) attributes.
			@property [markers=[]] {object[]} Definitions of markers for the chart, each entry is an object with
						shape (arrow, circle, cross, diamond, down, flag, horizontal,
						number, plus, sparkfill, sparkline, square, text, vertical),
						color (string), series (number), item (number), size (number),
						priority (number), text (string), positioned (boolean),
						placement (string or string[]), offsets (number[2]).
			@property [minValue=0] {number} The minimum value of the data,
						<a href="#calculate"><code>$.gchart.calculate</code></a> to calculate from data.
			@property [maxValue=100] {number} The maximum value of the data,
						<a href="#calculate"><code>$.gchart.calculate</code></a> to calculate from data
			@property [gridSize=null] {number|number[]} The x and y spacings between grid lines.
			@property [gridLine=null] {number|number[]} The line and gap lengths for the grid lines.
			@property [gridOffsets=null] {number|number[]} The x and y offsets for the grid lines.
			@property [extension=&#123;}] {object} Any custom extensions to the Google chart parameters.
			@property [barWidth=null] {number} The width of each bar (pixels) or 'a' for automatic or 'r' for relative.
			@property [barSpacing=null] {number} The space (pixels) between bars in a group.
			@property [barGroupSpacing=null] {number} The space (pixels) between groups of bars.
			@property [barZeroPoint=null] {number} The position (0.0 to 1.0) of the zero-line.
			@property [pieOrientation=0] {number} The angle (degrees) of orientation from the positive x-axis.
			@property [onLoad=null] {GChartOnLoad} Function to call when loaded.
			@property [provideJSON=false] {boolean} <code>true</code> to return JSON description of chart with the <code>onLoad</code> callback.
			@example {legend: 'top', legendSize: 10, secure: true} */
		defaultOptions: {
			width: 0,
			height: 0,
			format: 'png',
			usePost: false,
			secure: false,
			margins: null,
			title: '',
			titleColor: '',
			titleSize: 0,
			opacity: 0,
			backgroundColor: null,
			chartColor: null,
			legend: '',
			legendOrder: 'normal',
			legendDims: null,
			legendColor: '',
			legendSize: 0,
			type: 'pie3D',
			encoding: '',
			series: [],
			visibleSeries: 0,
			functions: [],
			dataLabels: [],
			axes: [],
			ranges: [],
			markers: [],
			minValue: 0,
			maxValue: 100,
			gridSize: null,
			gridLine: null,
			gridOffsets: null,
			extension: {},
			// Bar charts -------------
			barWidth: null,
			barSpacing: null,
			barGroupSpacing: null,
			barZeroPoint: null,
			// Pie charts -------------
			pieOrientation: 0,
			// Callback ---------------
			onLoad: null,
			provideJSON: false
		},

		/* Mapping from chart type to options function: xxxOptions(). */
		_typeOptions: {'': 'standard', p: 'pie', p3: 'pie', pc: 'pie'},
		/* List of additional options functions: addXXX(). */
		_chartOptions: ['Margins', 'DataFunctions', 'BarSizings', 'LineStyles', 'Colours',
			'Title', 'Axes', 'Backgrounds', 'Grids', 'Markers', 'Legends', 'Extensions'],
		/* Mapping from plugin chart types to Google chart types. */
		_chartTypes: {line: 'lc', lineXY: 'lxy', sparkline: 'ls', barHoriz: 'bhs', barVert: 'bvs',
			barHorizGrouped: 'bhg', barVertGrouped: 'bvg', barHorizOverlapped: 'bho', barVertOverlapped: 'bvo',
			pie: 'p', pie3D: 'p3', pieConcentric: 'pc', radar: 'r', radarCurved: 'rs', 
			lc: 'lc', lxy: 'lxy', ls: 'ls', bhs: 'bhs', bvs: 'bvs', bhg: 'bhg', bvg: 'bvg',
			bho: 'bho', bvo: 'bvo', p: 'p', p3: 'p3', pc: 'pc', r: 'r', rs: 'rs'},
		
		/** Marker value to indicate min/max calculation from data.
			@example minValue: $.gchart.calculate */
		calculate: -0.123456789,
		
		/** Bar width - automatic resize to fill.
			@example barWidth: $.gchart.barWidthAuto */
		barWidthAuto: 'a',
		/** Bar width - Spacings are relative to bars (0.0 - 1.0).
			@example barWidth: $.gchart.barWidthRelative */
		barWidthRelative: 'r',
		
		/** Floating point number format.
			@example axis.format($.gchart.formatFloat, ...) */
		formatFloat: 'f',
		/** Percentage number format.
			@example axis.format($.gchart.formatPercent, ...) */
		formatPercent: 'p',
		/** Scientific notation number format.
			@example axis.format($.gchart.formatScientific, ...) */
		formatScientific: 'e',
		/** Currency number format.
			@example axis.format($.gchart.formatCurrency + 'AUD', ...) */
		formatCurrency: 'c',

		_getters: ['current'],

		_instSettings: function(elem, options) {
			var width = options.width || parseInt(elem.css('width'), 10);
			var height = options.height || parseInt(elem.css('height'), 10);
			$.extend(options, {width: width, height: height});
			return {};
		},

		_postAttach: function(elem, inst) {
			this._updateChart(elem[0], inst);
		},

		_optionsChanged: function(elem, inst, options) {
			$.extend(inst.options, options);
			this._updateChart(elem, inst);
		},

		_preDestroy: function(elem, inst) {
			elem.empty();
		},

		/** Create a new data series.
			@param [label] {string} The label for this series.
			@param data {number[]} The data values for this series.
			@param [colour] {string|string[]} The colour(s) for this series.
			@param [fillColour] {string|object|object[]} The fill colour for this series or
					fill slice with attributes color and range ('start:end') or an array of the above.
			@param [minValue] {number} The minimum value for this series.
			@param [maxValue] {number} The maximum value for this series.
			@param [thickness] {number} The thickness (pixels) of the line for this series.
			@param [segments] {number[]} The line and gap lengths (pixels) for this series.
			@return {object} The new series object.
			@example series: [$.gchart.series('Max', [29.1, ..., 28.6], 'red', 'ffcccc')]
 series: [$.gchart.series([0, 5, 10, 7, 12, 6], -50, 100)] */
		series: function(label, data, colour, fillColour, minValue, maxValue, thickness, segments) {
			if ($.isArray(label)) { // Optional label
				segments = thickness;
				thickness = maxValue;
				maxValue = minValue;
				minValue = fillColour;
				fillColour = colour;
				colour = data;
				data = label;
				label = '';
			}
			if (typeof colour === 'number') { // Optional colour/fillColour
				segments = maxValue;
				thickness = minValue;
				maxValue = fillColour;
				minValue = colour;
				fillColour = null;
				colour = null;
			}
			if (typeof fillColour === 'number') { // Optional fillColour
				segments = thickness;
				thickness = maxValue;
				maxValue = minValue;
				minValue = fillColour;
				fillColour = null;
			}
			if ($.isArray(maxValue)) { // Optional min/max values
				segments = maxValue;
				thickness = minValue;
				maxValue = null;
				minValue = null;
			}
			return {label: label, data: data || [], color: colour || '',
				fillColor: fillColour, minValue: minValue, maxValue: maxValue,
				lineThickness: thickness, lineSegments: segments};
		},

		/** Load series data from CSV.
			Include a header row if fields other than data required.
			Use these names - label, color, fillColor, minValue, maxValue,
			lineThickness, lineSegmentLine, lineSegmentGap - for series attributes.
			Data columns should be labelled ynn, where nn is a sequential number.
			For X-Y line charts, include xnn columns before corresponding ynn.
			@param csv  {string|string[]} The series data in CSV format.
			@return {object[]} The series definitions.
			@example series: $.gchart.seriesFromCsv(csv) */
		seriesFromCsv: function(csv) {
			var seriesData = [];
			if (!$.isArray(csv)) {
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
				if (i === 0 && isNaN(parseFloat(cols[0]))) { // Header row
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
							series[sColumns[i]] = (pos > 2 ? plugin._numeric(val, 0) : val);
						}
						else if (xColumns[i]) { // X-coordinate
							saveX = (val ? plugin._numeric(val, -1) : null);
							xyData = true;
						}
						else {
							var y = plugin._numeric(val, -1);
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

		/** Load series data from XML. All attributes are optional except point/@y.
			<pre>&lt;data>
	&lt;series label="" color="" fillColor="" minValue="" maxValue="" lineThickness="" lineSegments="">
 		&lt;point x="" y=""/>
 		...
 	&lt;/series>
 	...
 &lt;/data></pre>
			@param xml {string|Document} The XML containing the series data.
			@return {object[]} The series definitions.
			@example series: $.gchart.seriesFromXml(xml) */
		seriesFromXml: function(xml) {
			if (typeof ActiveXObject !== 'undefined' && typeof xml === 'string') {
				var doc = new ActiveXObject('Microsoft.XMLDOM');
				doc.validateOnParse = false;
				doc.resolveExternals = false;
				doc.loadXML(xml);
				xml = doc;
			}
			xml = $(xml);
			var seriesData = [];
			var xyData = false;
			try {
				xml.find('series').each(function() {
					var series = $(this);
					var data = [];
					series.find('point').each(function() {
						var point = $(this);
						var x = point.attr('x');
						if (x != null) {
							xyData = true;
							x = plugin._numeric(x, -1);
						}
						y = plugin._numeric(point.attr('y'), -1);
						data.push(x ? [x, y] : y);
					});
					var segments = series.attr('lineSegments');
					if (segments) {
						segments = segments.split(',');
						for (var i = 0; i < segments.length; i++) {
							segments[i] = plugin._numeric(segments[i], 1);
						}
					}
					seriesData.push({label: series.attr('label'), data: data,
						color: series.attr('color'), fillColor: series.attr('fillColor'),
						minValue: plugin._numeric(series.attr('minValue'), null),
						maxValue: plugin._numeric(series.attr('maxValue'), null),
						lineThickness: plugin._numeric(series.attr('lineThickness'), null),
						lineSegments: segments});
				});
			}
			catch (e) {
				// Ignore
			}
			return (xyData ? this.seriesForXYLines(seriesData) : seriesData);
		},

		/** Force a value to be numeric.
			@private
			@param val {string} The value to convert.
			@param whenNaN {number} the value to use if not numeric.
			@return {number} The numeric equivalent or whenNaN if not numeric. */
		_numeric: function(val, whenNaN) {
			val = parseFloat(val);
			return (isNaN(val) ? whenNaN : val);
		},

		/** Prepare series for a line XY chart.
			@param series {object[]} The details of the points to plot, each data value may be an array of two points.
			@return {object[]} The transformed series.
			@deprecated  In favour of seriesForXYLines. */
		lineXYSeries: function(series) {
			return this.seriesForXYLines(series);
		},

		/** Prepare series for a line XY chart.
			@param series {object[]} The details of the points to plot,
						each data value may be an array of two points.
			@return {object[]} The transformed series.
			@example series: $.gchart.seriesForXYLines(
 	[$.gchart.series('One', [[0, 20], [30, 30], [60, 40],
 	[70, 50], [90, 60], [95, 70], [100, 80]], 'red'),
 	$.gchart.series('Two', [[10, 100], [30, 90], [40, 40],
 	[45,20], [52, 10]], 'green'),
 	$.gchart.series('Three', [5, 33, 50, 55, 7], 'blue')])*/
		seriesForXYLines: function(series) {
			var xySeries = [];
			for (var i = 0; i < series.length; i++) {
				var xNull = !$.isArray(series[i].data[0]);
				var xData = (xNull ? [null] : []);
				var yData = [];
				for (var j = 0; j < series[i].data.length; j++) {
					if (xNull) {
						yData.push(series[i].data[j]);
					}
					else {
						xData.push(series[i].data[j][0]);
						yData.push(series[i].data[j][1]);
					}
				}
				xySeries.push(plugin.series(series[i].label, xData, series[i].color,
					series[i].fillColor, series[i].minValue, series[i].maxValue,
					series[i].lineThickness, series[i].lineSegments));
				xySeries.push(plugin.series('', yData, '',
					series[i].fillColor, series[i].minValue, series[i].maxValue,
					series[i].lineThickness, series[i].lineSegments));
			}
			return xySeries;
		},

		/** Generate a data function definition.
			@param series {number} The output series to generate into.
			@param data {object[]|string} The function variables list or the name of a single variable.
			@param [series] {number} The input series to use for the variable data or
						the start of a generated range (with end/step).
			@param [end] {number} The end of the generated range.
			@param [step] {number} The step between values in the generated range.
			@param fnText {string} The function call, using the variable(s) above, in muParser function syntax.
			@return {object} The data function definition.
			@example functions: [$.gchart.fn(0, 'x', 0, 11, 0.1, 'sin(x) * 50 + 50')]
 functions: [$.gchart.fn(1, 'x', 0, 'x^2')] */
		fn: function(series, data, start, end, step, fnText) {
			if (typeof end === 'string') {
				fnText = end;
				end = null;
				step = null;
			}
			if (typeof start === 'string') {
				fnText = start;
				start = null;
				end = null;
				step = null;
			}
			if (typeof data === 'string') {
				data = this.fnVar(data, start, end, step);
			}
			return {series: series, data: data, fnText: fnText};
		},

		/** Generate a function variable definition.
			@param name {string} The variable name.
			@param start {number} The input series to use for the variable data or
						the start of a generated range (with end/step).
			@param [end] {number} The end of the generated range.
			@param [step] {number} The step between values in the generated range.
			@return {object} The function variable definition.
			@example functions: [$.gchart.fn(0, $.gchart.fnVar('x', 0, 360, 0.33), 'sin(x) * 50 + 50'),
	$.gchart.fn(1, $.gchart.fnVar('y', 0, 360, 0.1), 'cos(y) * 50 + 50')] */
		fnVar: function(name, start, end, step) {
			return {name: name, series: (step ? -1 : start),
				start: (step ? start : null), end: end, step: step};
		},

		/** Generate a Google chart color.
			@param r {string|number} The colour name or '#hhhhhh' or red value (0-255).
			@param [g] {number} The green value (0-255) or alpha value (0-255) if <code>r</code> is name.
			@param [b] {number} The blue value (0-255).
			@param [a] {number} The alpha value (0-255).
			@return {string} The translated colour.
			@example chartColor: $.gchart.color('#ccffcc')
 chartColor: $.gchart.color(204, 255, 204)
 chartColor: $.gchart.color(204, 255, 204, 128) */
		color: function(r, g, b, a) {
			var checkRange = function(value) {
				if (typeof value === 'number' && (value < 0 || value > 255)) {
					throw 'Value out of range (0-255) ' + value;
				}
			};
			var twoDigits = function(value) {
				return (value.length === 1 ? '0' : '') + value;
			};
			if (typeof r === 'string') {
				checkRange(g);
				return (r.match(/^#([A-Fa-f0-9]{2}){3,4}$/) ? r.substring(1) :
					(COLOURS[r] || r) + (g ? twoDigits(g.toString(16)) : ''));
			}
			checkRange(r);
			checkRange(g);
			checkRange(b);
			checkRange(a);
			return twoDigits(r.toString(16)) + twoDigits(g.toString(16)) +
				twoDigits(b.toString(16)) + (a ? twoDigits(a.toString(16)) : '');
		},

		/** Create a simple linear gradient definition for a background.
			@param angle {string|number} The angle of the gradient from positive x-axis.
			@param colours {string[]|string} An array of colours or the starting colour.
			@param [positions] {number[]|string} The positions (0.0 to 1.0)
						of the gradient colours or the ending colour.
			@return {object} The gradient definition.
			@example backgroundColor: $.gchart.gradient('horizontal', 'ccffff', 'ccffff00')
 backgroundColor: $.gchart.gradient('diagonalUp', ['lime', 'blue'])
 backgroundColor: $.gchart.gradient(30, ['white', 'yellow', 'red'], [0.25, 0.5, 0.75]) */
		gradient: function(angle, colours, positions) {
			var colourPoints = [];
			if ($.isArray(colours)) {
				var step = 1 / (colours.length - 1);
				for (var i = 0; i < colours.length; i++) {
					colourPoints.push([colours[i], (positions ? positions[i] : Math.round(i * step * 100) / 100)]);
				}
			}
			else {
				colourPoints = [[colours, 0], [positions, 1]];
			}
			return {angle: angle, colorPoints: colourPoints};
		},

		/** Create a colour striping definition for a background.
			@param angle {string|number} The angle of the stripes from positive x-axis.
			@param colours {string[]} The colours to stripe.
			@param [widths] {number[]} The widths (0.0 to 1.0) of the stripes.
			@return {object} The stripe definition.
			@example $.gchart.stripe('horizontal', ['white', 'silver', 'gray'], [0.2, 0.2, 0.2]) */
		stripe: function(angle, colours, widths) {
			var colourPoints = [];
			var avgWidth = Math.round(100 / colours.length) / 100;
			for (var i = 0; i < colours.length; i++) {
				colourPoints.push([colours[i], (widths ? widths[i] : avgWidth)]);
			}
			return {angle: angle, striped: true, colorPoints: colourPoints};
		},

		/** Create a range definition.
			@param [vertical] {boolean} <code>true</code> if vertical, <code>false</code> if horizontal.
			@param colour {string} The marker's colour.
			@param start {number} The starting point for the range (0.0 to 1.0).
			@param [end] {number} The ending point for the range (0.0 to 1.0).
			@return {object} The range definition.
			@example ranges: [$.gchart.range(true, 'ccffcc', 0.6, 0.8)] */
		range: function(vertical, colour, start, end) {
			if (typeof vertical === 'string') { // Optional vertical
				end = start;
				start = colour;
				colour = vertical;
				vertical = false;
			}
			return {vertical: vertical, color: colour, start: start, end: end};
		},

		/** Create a marker definition.
			@param shape {string} The marker shape.
			@param colour {string} The marker's colour.
			@param series {number} The series to which the marker applies.
			@param [item] {number|string|number[]} The item in the series to which it applies or 'all' or
						'everyn' or 'everyn[s:e]' or [start, end, every].
			@param [size] {number|string} The size (pixels) of the marker or
						'thickness:length' for horizline or vertical.
			@param [priority] {string|number} The rendering priority.
			@param [text] {string} The display text for a text type marker.
			@param [positioned] {boolean} <code>true</code> to absolutely position the marker.
			@param [placement] {string|string[]} The placement locations.
			@param [offsets] {number[]} The pixel offsets, horizontal and vertical.
			@return {object} The marker definition.
			@example markers: [$.gchart.marker('diamond', 'red', 0)]
 markers: [$.gchart.marker('text', 'black', 0, 14, 12, 'above', 'Note this')]
 markers: [$.gchart.marker('sparkline', 'ffff0080', 0, 'all', 6)] */
		marker: function(shape, colour, series, item, size, priority, text,
				positioned, placement, offsets) {
			if (typeof size === 'boolean') {
				offsets = text;
				placement = priority;
				positioned = size;
				text = null;
				priority = null;
				size = null;
			}
			if ($.isArray(size)) {
				if (typeof size[0] === 'string') {
					offsets = priority;
					placement = size;
				}
				else {
					offsets = size;
					placement = null;
				}
				positioned = null;
				text = null;
				priority = null;
				size = null;
			}
			if (typeof priority === 'boolean') {
				offsets = positioned;
				placement = text;
				positioned = priority;
				text = null;
				priority = null;
			}
			if ($.isArray(priority)) {
				if (typeof priority[0] === 'string') {
					offsets = text;
					placement = priority;
				}
				else {
					offsets = priority;
					placement = null;
				}
				positioned = null;
				text = null;
				priority = null;
			}
			if (typeof text === 'boolean') {
				offsets = placement;
				placement = positioned;
				positioned = text;
				text = null;
			}
			if ($.isArray(text)) {
				if (typeof text[0] === 'string') {
					offsets = positioned;
					placement = text;
				}
				else {
					offsets = text;
					placement = null;
				}
				positioned = null;
				text = null;
			}
			if ($.isArray(positioned)) {
				if (typeof positioned[0] === 'string') {
					offsets = placement;
					placement = positioned;
				}
				else {
					offsets = positioned;
					placement = null;
				}
				positioned = null;
			}
			if ($.isArray(placement) && typeof placement[0] !== 'string') {
				offsets = placement;
				placement = null;
			}
			return {shape: shape, color: colour, series: series,
				item: (item || item === 0 ? item : -1), size: size || 10,
				priority: (priority != null ? priority : 0), text: text,
				positioned: positioned, placement: placement, offsets: offsets};
		},

		/** Create a number format for a marker.
			@param type {object|string} An object containing all these settings or
						'f' for floating point, 'p' for percentage,
						'e' for scientific notation, 'c<CUR>' for currency (as specified by CUR).
			@param [prefix] {string} The text appearing before the number.
			@param [suffix] {string} The text appearing after the number
						(can only be present if <code>prefix</code> is present).
			@param [precision] {number} The number of decimal places.
			@param [showX] {boolean} <code>true</code> to show the x-value, <code>false</code> for the y-value.
			@param [zeroes] {boolean|number} <code>true</code> to display trailing zeroes, number for that many trailing zeroes
						(can only be present if <code>showX</code> is present).
			@param [separators] {boolean} <code>true</code> to display group separators
						(can only be present if <code>showX</code> and <code>zeroes</code> are present).
			@return {string} The format definition.
			@example $.gchart.numberFormat($.gchart.formatFloat, 1, false, true) */
		numberFormat: function(type, prefix, suffix, precision, showX, zeroes, separators) {
			var format = initNumberFormat(type, prefix, suffix, precision, showX, zeroes, separators);
			return format.prefix + '*' + format.type + format.precision +
				(format.zeroes ? (typeof format.zeroes === 'number' ? 'z' + format.zeroes : 'z') : '') +
				(format.separators ? 's' : '') + (format.showX ? 'x' : '') + '*' + format.suffix;
		},

		/** Create an axis definition.
			@param axis {string} The axis position: top, bottom, left, right.
			@param [lineColour] {string} The axis lines' colour.
			@param labels {string[]} The labels for this axis.
			@param [positions] {number[]} The positions of the labels.
			@param [rangeStart] {number} The start of the range.
			@param [rangeEnd] {number} The end of the range (optional with above).
			@param [rangeInterval] {number} The interval between values in the range (optional with above).
			@param [colour] {string} The labels' colour.
			@param [alignment] {string} The labels' alignment.
			@param [size] {number} The labels' size.
			@param [format] {object} The labels' number format options.
			@return {GChartAxis} The axis definition.
			@example axes: [$.gchart.axis('bottom', ['Jan', 'Feb', 'Mar', 'Apr',
 	'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 'black'),
 	$.gchart.axis('left', 0, 40, 'red', 'right')] */
		axis: function(axis, lineColour, labels, positions, rangeStart,
				rangeEnd, rangeInterval, colour, alignment, size, format) {
			return new GChartAxis(axis, lineColour, labels, positions, rangeStart,
				rangeEnd, rangeInterval, colour, alignment, size, format);
		},
		
		/** Determine the region within a chart.
			@param event {MouseEvent} The mouse event containing the cursor position.
			@param jsonData {object} The JSON description of the chart - see <a href="#defaultOptions"><code>provideJSON</code></a>
						and <a href="#defaultOptions"><code>onLoad</code></a>.
			@return {object} The current region details (type, series, and point) or <code>null</code> if none.
			@example var region = $.gchart.findRegion(event, regionData) */
		findRegion: function(event, jsonData) {
			if (!jsonData || !jsonData.chartshape) {
				return null;
			}
			var decodeName = function(name) {
				var matches = name.match(/([^\d]+)(\d+)(?:_(\d)+)?/);
				return {type: matches[1], series: parseInt(matches[2]), point: parseInt(matches[3] || -1)};
			};
			var offset = $(event.target).offset();
			var x = event.pageX - offset.left;
			var y = event.pageY - offset.top;
			for (var i = 0; i < jsonData.chartshape.length; i++) {
				var shape = jsonData.chartshape[i];
				switch (shape.type) {
					case 'RECT':
						if (shape.coords[0] <= x && x <= shape.coords[2] &&
								shape.coords[1] <= y && y <= shape.coords[3]) {
							return decodeName(shape.name);
						}
						break;
					case 'CIRCLE':
						if (Math.abs(x - shape.coords[0]) <= shape.coords[2] &&
								Math.abs(y - shape.coords[1]) <= shape.coords[2] &&
								Math.sqrt(Math.pow(x - shape.coords[0], 2) +
								Math.pow(y - shape.coords[1], 2)) <= shape.coords[2]) {
							return decodeName(shape.name);
						}
						break;
					case 'POLY':
						if (plugin._insidePolygon(shape.coords, x, y)) {
							return decodeName(shape.name);
						}
						break;
				}
			}
			return null;
		},

		/** Determine whether a point is within a polygon.
			Ray casting algorithm adapted from http://ozviz.wasp.uwa.edu.au/~pbourke/geometry/insidepoly/.
			@private
			@param coords {number[]} The polygon coords as [x1, y1, x2, y2, ...].
			@param x {number} The point's x-coord.
			@param y {number} The point's y-coord.
			@return {boolean} <code>true</code> if the point is inside, <code>false</code> if not. */
		_insidePolygon: function(coords, x, y) {
			var counter = 0;
			var p1 = [coords[0], coords[1]];
			for (var i = 2; i <= coords.length; i += 2) {
				var p2 = [coords[i % coords.length], coords[i % coords.length + 1]];
				if (y > Math.min(p1[1], p2[1]) && y <= Math.max(p1[1], p2[1])) {
					if (x <= Math.max(p1[0], p2[0]) && p1[1] !== p2[1]) {
						var xinters = (y - p1[1]) * (p2[0] - p1[0]) / (p2[1] - p1[1]) + p1[0];
						if (p1[0] === p2[0] || x <= xinters) {
							counter++;
						}
					}
				}
				p1 = p2;
			}
			return (counter % 2 !== 0);
		},

		/** Generate the Google charting request with the new settings.
			@private
			@param options {object} The new settings for this Google chart instance.
			@return {string} The Google chart URL. */
		_generateChart: function(options) {
			var type = (options.type && options.type.match(/.+:.+/) ?
				options.type : this._chartTypes[options.type] || 'p3');
			var labels = '';
			for (var i = 0; i < options.dataLabels.length; i++) {
				labels += '|' + encodeURIComponent(options.dataLabels[i] || '');
			}
			labels = (labels.length === options.dataLabels.length ? '' : labels);
			var format = options.format || 'png';
			var img = (options.secure ? 'https://chart.googleapis.com' : 'http://chart.apis.google.com') + '/chart?' +
				this._addSize(type, options) + (format !== 'png' ? '&chof=' + format : '') + '&cht=' + type +
				this['_' + (this._typeOptions[type.replace(/:.*/, '')] || this._typeOptions['']) +
				'Options'](options, labels);
			for (var i = 0; i < this._chartOptions.length; i++) {
				img += this['_add' + this._chartOptions[i]](type, options);
			}
			return img;
		},

		/** Optionally include a parameter.
			@private
			@param name {string} The parameter name.
			@param value {string} Its value.
			@return {string} The name and value, or blank if no value. */
		_include: function(name, value) {
			return (value ? name + value : '');
		},

		/** Generate standard options for charts.
			@private
			@param options {object} The chart settings.
			@param labels {string} The concatenated labels for the chart.
			@return {string} The standard chart options. */
		_standardOptions: function(options, labels) {
			var encoding = this['_' + options.encoding + 'Encoding'] || this['_textEncoding'];
			return '&chd=' + encoding.apply(plugin, [options]) +
				(labels ? '&chl=' + labels.substr(1) : '');
		},

		/** Generate standard options for pie charts.
			@private
			@param options {object} The chart settings.
			@param labels {string} The concatenated labels for the chart.
			@return {string} The standard pie chart options. */
		_pieOptions: function(options, labels) {
			return (options.pieOrientation ? '&chp=' + (options.pieOrientation / 180 * Math.PI) : '') +
				this._standardOptions(options, labels);
		},

		/** Generate the options for chart size.
			@private
			@param type {string} The encoded chart type.
			@param options {object} The chart settings.
			@return {string} The chart size options. */
		_addSize: function(type, options) {
			var maxSize = 1000;
			options.width = Math.max(10, Math.min(options.width, maxSize));
			options.height = Math.max(10, Math.min(options.height, maxSize));
			if (options.width * options.height > 300000) {
				options.height = Math.floor(300000 / options.width);
			}
			return 'chs=' + options.width + 'x' + options.height;
		},

		/** Generate the options for chart margins.
			@private
			@param type {string} The encoded chart type.
			@param options {object} The chart settings.
			@return {string} The chart margin options. */
		_addMargins: function(type, options) {
			var margins = options.margins;
			margins = (margins == null ? null :
				(typeof margins === 'number' ? [margins, margins, margins, margins] :
				(!$.isArray(margins) ? null :
				(margins.length === 4 ? margins :
				(margins.length === 2 ? [margins[0], margins[0], margins[1], margins[1]] : null)))));
			return (!margins ? '' : '&chma=' + margins.join(',') +
				(!options.legendDims || options.legendDims.length !== 2 ? '' :
				'|' + options.legendDims.join(',')));
		},

		/** Generate the options for chart data functions.
			@private
			@param type {string} The encoded chart type.
			@param options {object} The chart settings.
			@return {string} The chart function options. */
		_addDataFunctions: function(type, options) {
			var fns = '';
			for (var i = 0; i < options.functions.length; i++) {
				var fn = options.functions[i];
				var data = '';
				fn.data = ($.isArray(fn.data) ? fn.data : [fn.data]);
				for (var j = 0; j < fn.data.length; j++) {
					var fnVar = fn.data[j];
					data += ';' + fnVar.name + ',' + (fnVar.series !== -1 ? fnVar.series :
						fnVar.start + ',' + fnVar.end + ',' + fnVar.step);
				}
				fns += '|' + fn.series + ',' + data.substr(1) + ',' + encodeURIComponent(fn.fnText);
			}
			return (fns ? '&chfd=' + fns.substr(1) : '');
		},

		/** Generate the options for bar chart sizings.
			@private
			@param type {string} The encoded chart type.
			@param options {object} The chart settings.
			@return {string} The bar chart size options. */
		_addBarSizings: function(type, options) {
			return (type.substr(0, 1) !== 'b' ? '' : (options.barWidth == null ? '' :
				'&chbh=' + options.barWidth +
				(options.barSpacing == null ? '' : ',' + (options.barWidth === plugin.barWidthRelative ?
				Math.min(Math.max(options.barSpacing, 0.0), 1.0) : options.barSpacing) +
				(options.barGroupSpacing == null ? '' : ',' + (options.barWidth === plugin.barWidthRelative ?
				Math.min(Math.max(options.barGroupSpacing, 0.0), 1.0) : options.barGroupSpacing)))) +
				(options.barZeroPoint == null ? '' : '&chp=' + options.barZeroPoint));
		},

		/** Generate the options for chart line styles.
			@private
			@param type {string} The encoded chart type.
			@param options {object} The chart settings.
			@return {string} The chart line style options. */
		_addLineStyles: function(type, options) {
			if (type.charAt(0) !== 'l') {
				return '';
			}
			var lines = '';
			for (var i = 0; i < options.series.length; i++) {
				if (options.series[i].lineThickness && $.isArray(options.series[i].lineSegments)) {
					lines += '|' + options.series[i].lineThickness + ',' +
						options.series[i].lineSegments.join(',');
				}
			}
			return (lines ? '&chls=' + lines.substr(1) : '');
		},

		/** Generate the options for chart colours.
			@private
			@param type {string} The encoded chart type.
			@param options {object} The chart settings.
			@return {string} The chart colour options. */
		_addColours: function(type, options) {
			var colours = '';
			var hasColour = false;
			for (var i = 0; i < options.series.length; i++) {
				var clrs = '';
				if (type !== 'lxy' || i % 2 === 0) {
					var sep = ',';
					$.each(($.isArray(options.series[i].color) ? options.series[i].color :
							[options.series[i].color]), function(i, v) {
						var colour = plugin.color(v || '');
						if (colour) {
							hasColour = true;
						}
						clrs += sep + (colour || '000000');
						sep = '|';
					});
				}
				colours += (hasColour ? clrs : '');
			}
			return (colours.length > options.series.length ? '&chco=' + colours.substr(1) : '');
		},

		/** Generate the options for chart title.
			@private
			@param type {string} The encoded chart type.
			@param options {object} The chart settings.
			@return {string} The chart title options. */
		_addTitle: function(type, options) {
			return plugin._include('&chtt=', encodeURIComponent(options.title)) +
				(options.titleColor || options.titleSize ?
				'&chts=' + (plugin.color(options.titleColor) || '000000') + ',' +
				(options.titleSize || 14) : '');
		},

		/** Generate the options for chart backgrounds.
			@private
			@param type {string} The encoded chart type.
			@param options {object} The chart settings.
			@return {string} The chart background options. */
		_addBackgrounds: function(type, options) {
			var opacity = (!options.opacity ? null : '000000' +
				Math.floor(options.opacity / (options.opacity > 1 ? 100 : 1) * 255).toString(16));
			if (opacity && opacity.length < 8) {
				opacity = '0' + opacity;
			}
			var addBackground = function(area, background) {
				if (background == null) {
					return '';
				}
				if (typeof background === 'string') {
					return area + ',s,' + plugin.color(background);
				}
				var bg = area + ',l' + (background.striped ? 's' : 'g') + ',' +
					(GRADIENTS[background.angle] != null ? GRADIENTS[background.angle] : background.angle);
				for (var i = 0; i < background.colorPoints.length; i++) {
					bg += ',' + plugin.color(background.colorPoints[i][0]) +
						',' + background.colorPoints[i][1];
				}
				return bg;
			};
			var backgrounds = addBackground('|a', opacity) + addBackground('|bg', options.backgroundColor) +
				addBackground('|c', options.chartColor);
			for (var i = 0; i < options.series.length; i++) {
				if (options.series[i].fillColor && options.series[i].fillColor.colorPoints) {
					backgrounds += addBackground('|b' + i, options.series[i].fillColor);
				}
			}
			return (backgrounds ? '&chf=' + backgrounds.substr(1) : '');
		},

		/** Generate the options for chart grids.
			@private
			@param type {string} The encoded chart type.
			@param options {object} The chart settings.
			@return {string} The chart grid options. */
		_addGrids: function(type, options) {
			var size = (typeof options.gridSize === 'number' ?
				[options.gridSize, options.gridSize] : options.gridSize);
			var line = (typeof options.gridLine === 'number' ?
				[options.gridLine, options.gridLine] : options.gridLine);
			var offsets = (typeof options.gridOffsets === 'number' ?
				[options.gridOffsets, options.gridOffsets] : options.gridOffsets);
			return (!size ? '' : '&chg=' + size[0] + ',' + size[1] +
				(!line ? '' : ',' + line[0] + ',' + line[1] +
				(!offsets ? '' : ',' + offsets[0] + ',' + offsets[1])));
		},

		/** Generate the options for chart legend.
			@private
			@param type {string} The encoded chart type.
			@param options {object} The chart settings.
			@return {string} The chart legend options. */
		_addLegends: function(type, options) {
			var legends = '';
			for (var i = 0; i < options.series.length; i++) {
				if (type !== 'lxy' || i % 2 === 0) {
					legends += '|' + encodeURIComponent(options.series[i].label || '');
				}
			}
			var order = (options.legendOrder && options.legendOrder.match(/^\d+(,\d+)*$/) ?
				options.legendOrder : ORDERS[options.legendOrder]) || '';
			return (!options.legend ||
				(type !== 'lxy' && legends.length <= options.series.length) ||
				(type === 'lxy' && legends.length <= (options.series.length / 2)) ? '' :
				'&chdl=' + legends.substr(1) + plugin._include('&chdlp=',
				options.legend.charAt(0) + (options.legend.indexOf('V') > -1 ? 'v' : '') +
				plugin._include('|', order)) + (options.legendColor || options.legendSize ? '&chdls=' +
				(plugin.color(options.legendColor) || '000000') + ',' + (options.legendSize || 11) : ''));
		},

		/** Generate the options for chart extensions.
			@private
			@param type {string} The encoded chart type.
			@param options {object} The chart settings.
			@return {string} The chart extension options. */
		_addExtensions: function(type, options) {
			var params = '';
			for (var name in options.extension) {
				params += '&' + name + '=' + options.extension[name];
			}
			return params;
		},

		/** Generate axes parameters.
			@private
			@param type {string} The encoded chart type.
			@param options {object} The current instance settings.
			@return {string} The axes parameters. */
		_addAxes: function(type, options) {
			var axes = '';
			var axesLabels = '';
			var axesPositions = '';
			var axesRanges = '';
			var axesStyles = '';
			var axesTicks = '';
			for (var i = 0; i < options.axes.length; i++) {
				if (!options.axes[i]) {
					continue;
				}
				var axisDef = (typeof options.axes[i] === 'string' ?
					new GChartAxis(options.axes[i]) : options.axes[i]);
				var axis = axisDef.axis().charAt(0);
				axes += ',' + (axis === 'b' ? 'x' : (axis === 'l' ? 'y' : axis));
				if (axisDef.labels()) {
					var labels = '';
					for (var j = 0; j < axisDef.labels().length; j++) {
						labels += '|' + encodeURIComponent(axisDef.labels()[j] || '');
					}
					axesLabels += (labels ? '|' + i + ':' + labels : '');
				}
				if (axisDef.positions()) {
					var positions = '';
					for (var j = 0; j < axisDef.positions().length; j++) {
						positions += ',' + axisDef.positions()[j];
					}
					axesPositions += (positions ? '|' + i + positions : '');
				}
				if (axisDef.range()) {
					var range = axisDef.range();
					axesRanges += '|' + i + ',' + range[0] + ',' + range[1] +
						(range[2] ? ',' + range[2] : '');
				}
				var ticks = axisDef.ticks() || {};
				if (axisDef.color() || axisDef.style() || axisDef.drawing() || ticks.color || axisDef.format()) {
					var style = axisDef.style() || {};
					axesStyles += '|' + i +
						(axisDef.format() ? 'N' + this.numberFormat(axisDef.format()) : '') + ',' +
						plugin.color(style.color || 'gray') + ',' +
						(style.size || 10) + ',' + 
						(ALIGNMENTS[style.alignment] || style.alignment || 0) + ',' +
						(DRAWING[axisDef.drawing()] || axisDef.drawing() || 'lt') +
						(!ticks.color && !axisDef.color() ? '' :
						',' + (ticks.color ? plugin.color(ticks.color) : '808080') +
						(!axisDef.color() ? '' : ',' + plugin.color(axisDef.color())));
				}
				if (ticks.length) {
					axesTicks += '|' + i + ',' + ($.isArray(ticks.length) ? ticks.length.join(',') : ticks.length);
				}
			}
			return (!axes ? '' : '&chxt=' + axes.substr(1) +
				(!axesLabels ? '' : '&chxl=' + axesLabels.substr(1)) +
				(!axesPositions ? '' : '&chxp=' + axesPositions.substr(1)) +
				(!axesRanges ? '' : '&chxr=' + axesRanges.substr(1)) +
				(!axesStyles ? '' : '&chxs=' + axesStyles.substr(1)) +
				(!axesTicks ? '' : '&chxtc=' + axesTicks.substr(1)));
		},

		/** Generate markers parameters.
			@private
			@param type {string} The encoded chart type.
			@param options {object} The current instance settings.
			@return {string} The markers parameters. */
		_addMarkers: function(type, options) {
			var markers = '';
			var decodeItem = function(item, positioned) {
				if (item === 'all') {
					return -1;
				}
				if (typeof item === 'string') {
					var matches = /^every(\d+)(?:\[(\d+):(\d+)\])?$/.exec(item);
					if (matches) {
						var every = parseInt(matches[1], 10);
						return (matches[2] && matches[3] ?
							(positioned ? Math.max(0.0, Math.min(1.0, matches[2])) : matches[2]) + ':' +
							(positioned ? Math.max(0.0, Math.min(1.0, matches[3])) : matches[3]) + ':' +
							every : -every);
					}
				}
				if ($.isArray(item)) {
					item = $.map(item, function(v, i) {
						return (positioned ? Math.max(0.0, Math.min(1.0, v)) : v);
					});
					return item.join(':') + (item.length < 2 ? ':' : '');
				}
				return item;
			};
			var escapeText = function(value) {
				return value.replace(/,/g, '\\,');
			};
			for (var i = 0; i < options.markers.length; i++) {
				var marker = options.markers[i];
				var shape = SHAPES[marker.shape] || marker.shape;
				var placement = '';
				if (marker.placement) {
					var placements = $.makeArray(marker.placement);
					for (var j = 0; j < placements.length; j++) {
						placement += PLACEMENTS[placements[j]] || '';
					}
				}
				markers += '|' + (marker.positioned ? '@' : '') + shape +
					('AfNt'.indexOf(shape) > -1 ? escapeText(marker.text || '') : '') + ',' +
					plugin.color(marker.color) + ',' +
					marker.series + ',' + decodeItem(marker.item, marker.positioned) +
					',' + marker.size + ',' + (PRIORITIES[marker.priority] != null ?
					PRIORITIES[marker.priority] : marker.priority) +
					(placement || marker.offsets ? ',' + placement +
					':' + (marker.offsets && marker.offsets[0] ? marker.offsets[0] : '') +
					':' + (marker.offsets && marker.offsets[1] ? marker.offsets[1] : '') : '');
			}
			for (var i = 0; i < options.ranges.length; i++) {
				markers += '|' + (options.ranges[i].vertical ? 'R' : 'r') + ',' +
					plugin.color(options.ranges[i].color) + ',0,' +
					options.ranges[i].start + ',' +
					(options.ranges[i].end || options.ranges[i].start + 0.005);
			}
			for (var i = 0; i < options.series.length; i++) {
				if (options.series[i].fillColor && !options.series[i].fillColor.colorPoints) {
					var fills = ($.isArray(options.series[i].fillColor) ?
						options.series[i].fillColor : [options.series[i].fillColor]);
					for (var j = 0; j < fills.length; j++) {
						if (typeof fills[j] === 'string') {
							markers += '|b,' + plugin.color(options.series[i].fillColor) +
								',' + i + ',' + (i + 1) + ',0';
						}
						else {
							var props = ($.isArray(fills[j]) ? fills[j] : [fills[j].color, fills[j].range]);
							markers += '|B,' + plugin.color(props[0]) +
								',' + i + ',' + props[1] + ',0';
						}
					}
				}
			}
			return (markers ? '&chm=' + markers.substr(1) : '');
		},

		/** Update the Google charting div with the new settings.
			@private
			@param target {Element} The containing division.
			@param inst {object} The new settings for this Google chart instance. */
		_updateChart: function(target, inst) {
			inst._src = this._generateChart(inst.options);
			if (inst.options.usePost) {
				var form = '<form action="' +
					(inst.options.secure ? 'https://chart.googleapis.com' : 'http://chart.apis.google.com') +
					'/chart?' + Math.floor(Math.random() * 1e8) + '" method="POST">';
				var pattern = /(\w+)=([^&]*)/g;
				var match = pattern.exec(inst._src);
				while (match) {
					form += '<input type="hidden" name="' + match[1] + '" value="' +
						($.inArray(match[1], ['chdl', 'chl', 'chtt', 'chxl']) > -1 ?
						decodeURIComponent(match[2]) : match[2]) + '">';
					match = pattern.exec(inst._src);
				}
				form += '</form>';
				target = $(target);
				target.empty();
				var ifr = $('<iframe></iframe>').appendTo(target).css({width: '100%', height: '100%'});
				var doc = ifr.contents()[0]; // Write iframe directly
				doc.open();
				doc.write(form);
				doc.close();
				ifr.show().contents().find('form').submit();	
			}
			else {
				var img = $(new Image()); // Prepare to load chart image in background
				img.load(function() { // Once loaded...
					$(target).find('img').remove().end().append(this); // Replace
					if ($.isFunction(inst.options.onLoad)) {
						if (inst.options.provideJSON) { // Retrieve JSON details
							$.getJSON(inst._src + '&chof=json&callback=?', 
								function(data) {
									inst.options.onLoad.apply(target, [plugin._normaliseRects(data)]);
								});
						}
						else {
							inst.options.onLoad.apply(target, []);
						}
					}
				});
				$(img).attr('src', inst._src);
			}
		},

		/** Ensure that rectangle coords go from min to max.
			@private
			@param jsonData {object} The JSON description of the chart.
			@return {object} The normalised JSON description. */
		_normaliseRects: function(jsonData) {
			if (jsonData && jsonData.chartshape) {
				for (var i = 0; i < jsonData.chartshape.length; i++) {
					var shape = jsonData.chartshape[i];
					if (shape.type === 'RECT') {
						if (shape.coords[0] > shape.coords[2]) {
							var temp = shape.coords[0];
							shape.coords[0] = shape.coords[2];
							shape.coords[2] = temp;
						}
						if (shape.coords[1] > shape.coords[3]) {
							var temp = shape.coords[1];
							shape.coords[1] = shape.coords[3];
							shape.coords[3] = temp;
						}
					}
				}
			}
			return jsonData;
		},

		/** Encode all series with text encoding.
			@private
			@param options {object} The settings for this Google chart instance.
			@return {string} The encoded series data. */
		_textEncoding: function(options) {
			var minValue = (options.minValue === plugin.calculate ?
				this._calculateMinValue(options.series) : options.minValue);
			var maxValue = (options.maxValue === plugin.calculate ?
				this._calculateMaxValue(options.series) : options.maxValue);
			var data = '';
			for (var i = 0; i < options.series.length; i++) {
				data += '|' + this._textEncode(options.series[i], minValue, maxValue);
			}
			return 't' + (options.visibleSeries || '') + ':' + data.substr(1);
		},

		/** Encode values in text format: numeric 0.0 to 100.0, comma separated, -1 for <code>null</code>.
			@private
			@param series {object} Details about the data values to encode.
			@param minValue {number} The minimum possible data value.
			@param maxValue {number} The maximum possible data value.
			@return {string} The encoded data values. */
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

		/** Encode all series with scaled text encoding.
			@memberof GChart
			@private
			@param options {object} The settings for this Google chart instance.
			@return {string} The encoded series data. */
		_scaledEncoding: function(options) {
			var minValue = (options.minValue === plugin.calculate ?
				this._calculateMinValue(options.series) : options.minValue);
			var maxValue = (options.maxValue === plugin.calculate ?
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
			return 't' + (options.visibleSeries || '') + ':' + data.substr(1) +
				'&chds=' + minMax.substr(1);
		},

		/** Encode values in text format: numeric min to max, comma separated, min - 1 for <code>null</code>.
			@private
			@param series {object} Details about the data values to encode.
			@param minValue {number} The minimum possible data value.
			@return {string} The encoded data values. */
		_scaledEncode: function(series, minValue) {
			minValue = (series.minValue != null ? series.minValue : minValue);
			var data = '';
			for (var i = 0; i < series.data.length; i++) {
				data += ',' + (series.data[i] == null || isNaN(series.data[i]) ?
					(minValue - 1) : series.data[i]);
			}
			return data.substr(1);
		},

		/** Encode all series with simple encoding.
			@private
			@param options {object} The settings for this Google chart instance.
			@return {string} The encoded series data. */
		_simpleEncoding: function(options) {
			var minValue = (options.minValue === plugin.calculate ?
				this._calculateMinValue(options.series) : options.minValue);
			var maxValue = (options.maxValue === plugin.calculate ?
				this._calculateMaxValue(options.series) : options.maxValue);
			var data = '';
			for (var i = 0; i < options.series.length; i++) {
				data += ',' + this._simpleEncode(options.series[i], minValue, maxValue);
			}
			return 's' + (options.visibleSeries || '') + ':' + data.substr(1);
		},

		/** Encode values in simple format: single character,
			banded-62 as A-Za-z0-9, _ for <code>null</code>.
			@private
			@param series {object} Details about the data values to encode.
			@param minValue {number} The minimum possible data value.
			@param maxValue {number} The maximum possible data value.
			@return {string} The encoded data values. */
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

		/** Encode all series with extended encoding.
			@private
			@param options {object} The settings for this Google chart instance.
			@return {string} The encoded series data. */
		_extendedEncoding: function(options) {
			var minValue = (options.minValue === plugin.calculate ?
				this._calculateMinValue(options.series) : options.minValue);
			var maxValue = (options.maxValue === plugin.calculate ?
				this._calculateMaxValue(options.series) : options.maxValue);
			var data = '';
			for (var i = 0; i < options.series.length; i++) {
				data += ',' + this._extendedEncode(options.series[i], minValue, maxValue);
			}
			return 'e' + (options.visibleSeries || '') + ':' + data.substr(1);
		},

		/** Encode values in extended format: double character,
			banded-4096 as A-Za-z0-9-., __ for <code>null</code>.
			@private
			@param series {object} Details about the data values to encode.
			@param minValue {number} The minimum possible data value.
			@param maxValue {number} The maximum possible data value.
			@return {string} The encoded data values. */
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

		/** Determine the minimum value amongst the data values.
			@private
			@param series {object[]} The series to examine.
			@return {number} The minimum value therein. */
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

		/** Determine the maximum value amongst the data values.
			@private
			@param series {object[]} The series to examine.
			@return {number} The maximum value therein. */
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

	/** The definition of a chart axis.
		@class GChartAxis
		@param axis {string} The axis position: top, bottom, left, right.
		@param [lineColour] {string} The axis lines' colour.
		@param labels {string[]} The labels for this axis.
		@param [positions] {number[]} The positions of the labels.
		@param [rangeStart] {number} Start of range (optional with next two).
		@param [rangeEnd] {number} End of range (optional with above).
		@param [rangeInterval] {number} Interval between values in the range (optional with above).
		@param [colour] {string} The labels' colour.
		@param [alignment] {string} The labels' alignment.
		@param [size] {number} The labels' size.
		@param [format] {object} The labels' number format options. */
	function GChartAxis(axis, lineColour, labels, positions, rangeStart, rangeEnd, rangeInterval,
			colour, alignment, size, format) {
		if (typeof lineColour !== 'string') { // Optional lineColour
			format = size;
			size = alignment;
			alignment = colour;
			colour = rangeInterval;
			rangeInterval = rangeEnd;
			rangeEnd = rangeStart;
			rangeStart = positions;
			positions = labels;
			labels = lineColour;
			lineColour = null;
		}
		if (typeof labels === 'number') { // Range instead of labels/positions
			format = alignment;
			size = colour;
			alignment = rangeInterval;
			colour = rangeEnd;
			rangeInterval = rangeStart;
			rangeEnd = positions;
			rangeStart = labels;
			positions = null;
			labels = null;
		}
		else if (!$.isArray(positions)) { // Optional positions
			format = size;
			size = alignment;
			alignment = colour;
			colour = rangeInterval;
			rangeInterval = rangeEnd;
			rangeEnd = rangeStart;
			rangeStart = positions;
			positions = null;
		}
		if (typeof rangeStart === 'string') { // Optional rangeStart/rangeEnd/rangeInterval
			format = colour;
			size = rangeInterval;
			alignment = rangeEnd;
			colour = rangeStart;
			rangeInterval = null;
			rangeEnd = null;
			rangeStart = null;
		}
		if (typeof rangeInterval === 'string') { // Optional rangeInterval
			format = size;
			size = alignment;
			alignment = colour;
			colour = rangeInterval;
			rangeInterval = null;
		}
		if (typeof alignment === 'number') { // Optional alignment
			format = size;
			size = alignment;
			alignment = null;
		}
		this._axis = axis;
		this._lineColor = lineColour;
		this._labels = labels;
		this._positions = positions;
		this._range = (rangeStart != null ? [rangeStart, rangeEnd, rangeInterval || null] : null);
		this._color = colour;
		this._alignment = alignment;
		this._size = size;
		this._drawing = null;
		this._tickColor = null;
		this._tickLength = null;
		this._format = format;
	}

	$.extend(GChartAxis.prototype, {

		/** Get/set the axis position.
			@memberof GChartAxis
			@param axis {string} The axis position: top, bottom, left, right.
			@return {GChartAxis|string} The axis object or the axis position (if no parameters specified). */
		axis: function(axis) {
			if (arguments.length === 0) {
				return this._axis;
			}
			this._axis = axis;
			return this;
		},

		/** Get/set the axis colour.
			@memberof GChartAxis
			@param lineColour {string} The axis line colour.
			@return {GChartAxis|string} The axis object or the axis line colour (if no parameters specified). */
		color: function(lineColour) {
			if (arguments.length === 0) {
				return this._lineColor;
			}
			this._lineColor = lineColour;
			return this;
		},

		/** Get/set the axis labels.
			@memberof GChartAxis
			@param labels {string[]} The labels for this axis.
			@return {GChartAxis|string[]} The axis object or the axis labels (if no parameters specified). */
		labels: function(labels) {
			if (arguments.length === 0) {
				return this._labels;
			}
			this._labels = labels;
			return this;
		},

		/** Get/set the axis label positions.
			@memberof GChartAxis
			@param positions {number[]} The positions of the labels.
			@return {GChartAxis|number[]} The axis object or the axis label positions (if no parameters specified). */
		positions: function(positions) {
			if (arguments.length === 0) {
				return this._positions;
			}
			this._positions = positions;
			return this;
		},

		/** Get/set the axis range.
			@memberof GChartAxis
			@param rangeStart {number} Start of range.
			@param rangeEnd {number} End of range.
			@param [rangeInterval] {number} Interval between values in the range.
			@return {GChartAxis|number[]} The axis object or the axis range start, end, and interval
						(if no parameters specified). */
		range: function(start, end, interval) {
			if (arguments.length === 0) {
				return this._range;
			}
			this._range = [start, end, interval || null];
			return this;
		},

		/** Get/set the axis labels' style.
			@memberof GChartAxis
			@param colour {string} The labels' colour.
			@param [alignment] {string} The labels' alignment.
			@param [size] {number} The labels' size.
			@return {GChartAxis|object} The axis object or the axis style with attributes <code>color</code>,
						<code>alignment</code>, and <code>size</code> (if no parameters specified). */
		style: function(colour, alignment, size) {
			if (arguments.length === 0) {
				return (!this._color && !this._alignment && !this._size ? null :
					{color: this._color, alignment: this._alignment, size: this._size});
			}
			this._color = colour;
			this._alignment = alignment;
			this._size = size;
			return this;
		},

		/** Get/set the axis drawing control.
			@memberof GChartAxis
			@param drawing {string} The drawing control: line, ticks, both
			@return {GChartAxis|string} The axis object or the axis drawing control (if no parameters specified). */
		drawing: function(drawing) {
			if (arguments.length === 0) {
				return this._drawing;
			}
			this._drawing = drawing;
			return this;
		},

		/** Get/set the axis tick style.
			@memberof GChartAxis
			@param colour {string} The colour of the tick marks.
			@param [length] {number|string} The length of the tick marks, negative values draw inside the chart
						or list of lengths, comma-separated.
			@return {GChartAxis|object} The axis object or the axis tick style with attributes
						<code>color</code> and <code>length</code> (if no parameters specified). */
		ticks: function(colour, length) {
			if (arguments.length === 0) {
				return (!this._tickColor && !this._tickLength ? null :
					{color: this._tickColor, length: this._tickLength});
			}
			this._tickColor = colour;
			this._tickLength = length;
			return this;
		},

		/** Get/set the number format for the axis.
			@memberof GChartAxis
			@param type {object|string} Containing all these settings or 'f' for floating point, 'p' for percentage,
						'e' for scientific notation, 'c<CUR>' for currency (as specified by CUR).
			@param [prefix] {string} Text appearing before the number.
			@param [suffix] {string} Text appearing after the number
						(can only be present if <code>prefix</code> is present).
			@param [precision] {number} The number of decimal places.
			@param [showX] {boolean} <code>true</code> to show the x-value, <code>false</code> for the y-value.
			@param [zeroes] {boolean|number} <code>true</code> to display trailing zeroes, number for that many trailing zeroes
						(can only be present if <code>showX</code> is present).
			@param [separators] {boolean} <code>true</code> to display group separators
						(can only be present if <code>showX</code> and <code>zeroes</code> are present).
			@return {GChartAxis|object} The axis object or the axis format (if no parameters specified). */
		format: function(type, prefix, suffix, precision, showX, zeroes, separators) {
			if (arguments.length === 0) {
				return this._format;
			}
			this._format = initNumberFormat(type, prefix, suffix, precision, showX, zeroes, separators);
			return this;
		}
	});

	/** Initialise a number format specification.
		@private
		@param type {object|string} Containing all these settings or 'f' for floating point, 'p' for percentage,
					'e' for scientific notation, 'c<CUR>' for currency (as specified by CUR).
		@param [prefix] {string} Text appearing before the number.
		@param [suffix] {string} Text appearing after the number
					(can only be present if <code>prefix</code> is present).
		@param [precision] {number} The number of decimal places.
		@param [showX] {boolean} <code>true</code> to show the x-value, <code>false</code> for the y-value.
		@param [zeroes] {boolean|number} <code>true</code> to display trailing zeroes, number for that many trailing zeroes
					(can only be present if <code>showX</code> is present).
		@param [separators] {boolean} <code>true</code> to display group separators
					(can only be present if <code>showX</code> and <code>zeroes</code> are present).
		@return {object} The number format specification. */
	function initNumberFormat(type, prefix, suffix, precision, showX, zeroes, separators) {
		if (typeof type === 'object') {
			return type;
		}
		if (typeof prefix === 'number') {
			separators = showX;
			zeroes = precision;
			showX = suffix;
			precision = prefix;
			suffix = '';
			prefix = '';
		}
		if (typeof prefix === 'boolean') {
			separators = precision;
			zeroes = suffix;
			showX = prefix;
			precision = 0;
			suffix = '';
			prefix = '';
		}
		if (typeof suffix === 'number') {
			separators = zeroes;
			zeroes = showX;
			showX = precision;
			precision = suffix;
			suffix = '';
		}
		if (typeof suffix === 'boolean') {
			separators = showX;
			zeroes = precision;
			showX = suffix;
			precision = 0;
			suffix = '';
		}
		if (typeof precision === 'boolean') {
			separators = zeroes;
			zeroes = showX;
			showX = precision;
			precision = 0;
		}
		return {type: type, prefix: prefix || '', suffix: suffix || '', precision: precision || '',
			showX: showX || false, zeroes: zeroes || false, separators: separators || false};
	}

	var plugin = $.gchart;
	
	plugin.defaultOptions.series = [plugin.series('Hello World', [60, 40])];

})(jQuery);

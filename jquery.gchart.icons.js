/* http://keith-wood.name/gChart.html
   Google Chart icons extension for jQuery v2.0.0.
   See API details at https://developers.google.com/chart/image/.
   Written by Keith Wood (kbwood{at}iinet.com.au) September 2008.
   Available under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

	/* Mapping from marker placement names to chart drawing placement codes. */
	var PLACEMENTS = {center: 'h', centre: 'h', left: 'l', right: 'r', h: 'h', l: 'l', r: 'r'};
	/* Mapping from icon tail names to chart tail codes. */
	var TAILS = {bottomLeft: 'bb', topLeft: 'bbtl', topRight: 'bbtr', bottomRight: 'bbbr', none: 'bbT',
		bb: 'bb', bbtl: 'bbtl', bbtr: 'bbtr', bbbr: 'bbbr', bbT: 'bbT',
		edgeBottomLeft: 'edge_bl', edgeBottomCenter: 'edge_bc', edgeBottomRight: 'edge_br',
		edgeTopLeft: 'edge_tl', edgeTopCenter: 'edge_tc', edgeTopRight: 'edge_tr',
		edgeLeftTop: 'edge_lt', edgeLeftCenter: 'edge_lc', edgeLeftBottom: 'edge_lb',
		edgeRightTop: 'edge_rt', edgeRightCenter: 'edge_rc', edgeRightBottom: 'edge_rb',
		edgeBL: 'edge_bl', edgeBC: 'edge_bc', edgeBR: 'edge_br',
		edgeTL: 'edge_tl', edgeTC: 'edge_tc', edgeTR: 'edge_tr',
		edgeLT: 'edge_lt', edgeLC: 'edge_lc', edgeLB: 'edge_lb',
		edgeRT: 'edge_rt', edgeRC: 'edge_rc', edgeRB: 'edge_rb'};
	/* Mapping from icon map pin style names to chart map pin style codes. */
	var PIN_STYLES = {none: 'pin', star: 'pin_star', left: 'pin_sleft', right: 'pin_sright'};
	/* Mapping from icon shadow names to chart icon shadow codes. */
	var SHADOWS = {no: '', yes: '_withshadow', only: '_shadow'};
	/* Mapping from icon note types to chart icon note codes. */
	var NOTES = {arrow: 'arrow_d', balloon: 'balloon', pinned: 'pinned_c',
		sticky: 'sticky_y', taped: 'taped_y', thought: 'thought'};
	/* Mapping from contextual alignment names to chart drawing alignment codes. */
	var ALIGNMENTS = {topLeft: 'lt', top: 'ht', topRight: 'rt', left: 'lv', center: 'hv', centre: 'hv',
		right: 'rv', bottomLeft: 'lb', bottom: 'hb', bottomRight: 'rb',
		tl: 'lt', lt: 'lt', t: 'ht', ht: 'ht', tr: 'rt', rt: 'rt', l: 'l', lv: 'lv', c: 'hv', hc: 'hv',
		hv: 'hv', r: 'rv', rv: 'rv', bl: 'lb', lb: 'lb', b: 'hb', hb: 'hb', br: 'rb', rb: 'rb'};
	/* Allowed sizes of icons. */
	var SIZES = {12: 12, 16: 16, 24: 24};
	/* Mapping from embedded chart alignment names to chart drawing alignment codes. */
	var EMBEDDED_ALIGNMENTS = {topLeft: 'tl', top: 'ht', topRight: 'tr', left: 'vl', center: 'hv', centre: 'hv',
		right: 'vr', bottomLeft: 'lb', bottom: 'hb', bottomRight: 'rb',
		tl: 'tl', t: 'ht', ht: 'ht', tr: 'tr', l: 'vl', vl: 'vl', c: 'hv',
		hv: 'hv', r: 'vr', vr: 'vr', bl: 'lb', lb: 'lb', b: 'hb', hb: 'hb', br: 'rb', rb: 'rb'};

	/** Icons extension for Google Chart plugin.
		@module GChartIcons
		@augments GChart */
		
	/** More default options.
		@memberof GChartIcons
		@name defaultOptions
		@property [icons=[]] {object[]} Definitions of dynamic icons for the chart, each entry is an object with
				<code>name</code> {string}, <code>data</code> {string}, <code>series</code> {number},
				<code>item</code> {number}, <code>zIndex</code> {number},
				<code>position</code> {number[]}, <code>offsets</code> {number[]}. */
	$.extend($.gchart.defaultOptions, {
		icons: []
	});

	try {
		$.gchart._chartOptions.splice($.gchart._chartOptions.indexOf('Markers') + 1, 0, 'Icons');
	}
	catch (e) { // IE playing games!
		$.gchart._chartOptions = ['Margins', 'DataFunctions', 'BarSizings', 'LineStyles', 'Colours',
			'Title', 'Axes', 'Backgrounds', 'Grids', 'Markers', 'Icons', 'Legends', 'Extensions'];
	}

	$.extend($.gchart, {

		/** Create a dynamic icon definition.
			@param name {string} The name of the icon to use.
			@param data {string} The icon's encoded parameters.
			@param [series] {number} The series to which the icon applies, -1 for freestanding.
			@param [item='all'] {number|string|number[]} The item in the series to which it applies or 'all'
						or 'everyn' or <code>[start, end, every]</code>.
			@param [zIndex] {number} The z-index (-1.0 to 1.0).
			@param [position] {number[]} An absolute chart position (0.0 to 1.0).
			@param [offsets] {number[]} Pixel offsets.
			@return {object} The icon definition.
			@example icons: [$.gchart.icon('map_spin', '2.0,-45,ffcccc,20,b,Here!', 0, 7, 1.0)] */
		icon: function(name, data, series, item, zIndex, position, offsets) {
			if ($.isArray(series)) {
				offsets = item;
				position = series;
				zIndex = null;
				item = null;
				series = null;
			}
			if ($.isArray(zIndex)) {
				offsets = position;
				position = zIndex;
				zIndex = null;
			}
			return {name: name, data: data, series: series || 0, item: (item || item === 0 ? item : 'all'),
				zIndex: zIndex, position: position, offsets: offsets};
		},

		/** Create a bubble icon definition.
			@param text {string} The text content, use '|' for line breaks.
			@param [image] {string} The name of an inset image.
			@param [tail] {string} The type of tail to use.
			@param [large] {boolean} <code>true</code> if a large bubble is required.
			@param [shadow] {string} 'no', 'yes', 'only'.
			@param [bgColour] {string} The icon background's colour.
			@param [colour] {string} The icon text's colour.
			@param [series] {number} The series to which the icon applies.
			@param [item='all'] {number|string|number[]} The item in the series to which it applies or 'all'
						or 'everyn' or <code>[start, end, every]</code>.
			@param [zIndex] {number} The z-index (-1.0 to 1.0).
			@param [position] {number[]} An absolute chart position (0.0 to 1.0).
			@param [offsets] {number[]} Pixel offsets.
			@return {object} The icon definition.
			@example icons: [$.gchart.bubbleIcon('Wheeee!', 'ski', 0, 7.5),
 	$.gchart.bubbleIcon('Sale', '', 'bottomRight', false, '',
 		'ffffcc', 'green', 0, 7, 0, null, [-58, 0])] */
		bubbleIcon: function(text, image, tail, large, shadow, bgColour, colour,
				series, item, zIndex, position, offsets) {
			if (typeof image === 'boolean') {
				offsets = zIndex;
				position = item;
				zIndex = series;
				item = colour;
				series = bgColour;
				colour = shadow;
				bgColour = large;
				shadow = tail;
				large = image;
				tail = null;
				image = null;
			}
			else if (typeof image === 'number') {
				offsets = bgColour;
				position = shadow;
				zIndex = large;
				item = tail;
				series = image;
				colour = null;
				bgColour = null;
				shadow = null;
				large = null;
				tail = null;
				image = null;
			}
			if (typeof tail === 'boolean') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = colour;
				colour = bgColour;
				bgColour = shadow;
				shadow = large;
				large = tail;
				tail = null;
			}
			else if (typeof tail === 'number') {
				offsets = colour;
				position = bgColour;
				zIndex = shadow;
				item = large;
				series = tail;
				colour = null;
				bgColour = null;
				shadow = null;
				large = null;
				tail = null;
			}
			if (typeof large === 'number') {
				offsets = series;
				position = colour;
				zIndex = bgColour;
				item = shadow;
				series = large;
				colour = null;
				bgColour = null;
				shadow = null;
				large = null;
			}
			if (typeof shadow === 'number') {
				offsets = item;
				position = series;
				zIndex = colour;
				item = bgColour;
				series = shadow;
				colour = null;
				bgColour = null;
				shadow = null;
			}
			if (typeof bgColour === 'number') {
				offsets = zIndex;
				position = item;
				zIndex = series;
				item = colour;
				series = bgColour;
				colour = null;
				bgColour = null;
			}
			if (typeof colour === 'number') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = colour;
				colour = null;
			}
			var multiline = text.match(/\|/);
			var colours = this.color(bgColour || 'white') + ',' + this.color(colour || 'black');
			var data = (image ? image + ',' : '') + (TAILS[tail] || 'bb') + ',' +
				(multiline ? colours + ',' : '') + this._escapeIconText(text) +
				(multiline ? '' : ',' + colours);
			return this.icon('bubble' + (image ? '_icon' : '') +
				(multiline || (!image && large) ? '_texts' : '_text') +
				(large || multiline  ? '_big' : '_small') + SHADOWS[shadow || 'yes'],
				data, series, item, zIndex, position, offsets);
		},

		/** Create a map pin icon definition.
			@param letter {string} The single letter to show.
			@param [image] {string} The name of an inset image.
			@param [style] {string} '' or 'none', 'star', 'left', 'right'.
			@param [shadow] {string} 'no', 'yes', 'only'.
			@param [bgColour] {string} The icon background's colour.
			@param [colour] {string} The icon text's colour.
			@param [series] {number} The series to which the icon applies.
			@param [item='all'] {number|string|number[]} The item in the series to which it applies or 'all'
						or 'everyn' or <code>[start, end, every]</code>.
			@param [zIndex] {number} The z-index (-1.0 to 1.0).
			@param [position] {number[]} An absolute chart position (0.0 to 1.0).
			@param [offsets] {number[]} Pixel offsets.
			@return {object} The icon definition.
			@example icons: [$.gchart.mapPinIcon('R', '', 'right', 'no', 'yellow', 'blue', 0, 7, 0, null, [12, 0]),
	$.gchart.mapPinIcon('', 'caution', '', '', 'red', 0, 'every2')] */
		mapPinIcon: function(letter, image, style, shadow, bgColour, colour,
				series, item, zIndex, position, offsets) {
			if (typeof image === 'number') {
				offsets = colour;
				position = bgColour;
				zIndex = shadow;
				item = style;
				series = image;
				colour = null;
				bgColour = null;
				shadow = null;
				style = null;
				image = null;
			}
			if (typeof style === 'number') {
				offsets = series;
				position = colour;
				zIndex = bgColour;
				item = shadow;
				series = style;
				colour = null;
				bgColour = null;
				shadow = null;
				style = null;
			}
			if (typeof shadow === 'number') {
				offsets = item;
				position = series;
				zIndex = colour;
				item = bgColour;
				series = shadow;
				colour = null;
				bgColour = null;
				shadow = null;
			}
			if (typeof bgColour === 'number') {
				offsets = zIndex;
				position = item;
				zIndex = series;
				item = colour;
				series = bgColour;
				colour = null;
				bgColour = null;
			}
			if (typeof colour === 'number') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = colour;
				colour = null;
			}
			var data = (style ? (PIN_STYLES[style] || 'pin') + ',' : '') +
				(image ? image : this._escapeIconText(letter)) + ',' + this.color(bgColour || 'white') +
				(image ? '' : ',' + this.color(colour || 'black'));
			return this.icon('map_' + (style ? 'x' : '') + 'pin' + (image ? '_icon' : '_letter') +
				SHADOWS[shadow || 'yes'], data, series, item, zIndex, position, offsets);
		},

		/** Create a fun note icon definition.
			@param title {string} The note title.
			@param [text] {string} The text content, use '|' for line breaks.
			@param [type] {string} The type of note to display.
			@param [large] {boolean} <code>true</code> if a large note is required.
			@param [alignment] {string} 'left', 'right', 'center'.
			@param [colour] {string} The icon text's colour.
			@param [series] {number} The series to which the icon applies.
			@param [item='all'] {number|string|number[]} The item in the series to which it applies or 'all'
						or 'everyn' or <code>[start, end, every]</code>.
			@param [zIndex] {number} The z-index (-1.0 to 1.0).
			@param [position] {number[]} An absolute chart position (0.0 to 1.0).
			@param [offsets] {number[]} Pixel offsets.
			@return {object} The icon definition.
			@example icons: [$.gchart.noteIcon('A bump|in the road', 0, 7),
 	$.gchart.noteIcon('Progress', '3rd Quarter', 'taped', false, '', '', [0.2, 0.8])] */
		noteIcon: function(title, text, type, large, alignment, colour,
				series, item, zIndex, position, offsets) {
			if (typeof text === 'boolean') {
				offsets = zIndex;
				position = item;
				zIndex = series;
				item = colour;
				series = alignment;
				colour = large;
				alignment = type;
				large = text;
				type = null;
				text = null;
			}
			else if (typeof text === 'number') {
				offsets = colour;
				position = alignment;
				zIndex = large;
				item = type;
				series = text;
				colour = null;
				alignment = null;
				large = null;
				type = null;
				text = null;
			}
			if (typeof type === 'boolean') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = colour;
				colour = alignment;
				alignment = large;
				large = type;
				type = null;
			}
			else if (typeof type === 'number') {
				offsets = series;
				position = colour;
				zIndex = alignment;
				item = large;
				series = type;
				colour = null;
				alignment = null;
				large = null;
				type = null;
			}
			if (typeof large === 'number') {
				offsets = item;
				position = series;
				zIndex = colour;
				item = alignment;
				series = large;
				colour = null;
				alignment = null;
				large = null;
			}
			if (typeof alignment === 'number') {
				offsets = zIndex;
				position = item;
				zIndex = series;
				item = colour;
				series = alignment;
				colour = null;
				alignment = null;
			}
			if (typeof colour === 'number') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = colour;
				colour = null;
			}
			var data = (NOTES[type] || 'sticky_y') + ',' + (large ? '1' : '2') + ',' +
				this.color(colour || 'black') + ',' + (PLACEMENTS[alignment] || 'h') + ',' +
				(title ? this._escapeIconText(title) + ',' : '') + this._escapeIconText(text || '');
			return this.icon('fnote' + (title ? '_title' : ''),
				data, series, item, zIndex, position, offsets);
		},

		/** Create a weather icon definition.
			@param title {string} The note title.
			@param [text] {string} The text content, use '|' for line breaks.
			@param [type] {string} The type of note to display.
			@param [image] {string} The name of an inset image.
			@param [series] {number} The series to which the icon applies.
			@param [item='all'] {number|string|number[]} The item in the series to which it applies or 'all'
						or 'everyn' or <code>[start, end, every]</code>.
			@param [zIndex] {number} The z-index (-1.0 to 1.0).
			@param [position] {number[]} An absolute chart position (0.0 to 1.0).
			@param [offsets] {number[]} Pixel offsets.
			@return {object} The icon definition.
			@example icons: [$.gchart.weatherIcon('City', '22-29°C', '', '', [0.2, 0.8])] */
		weatherIcon: function(title, text, type, image, series, item, zIndex, position, offsets) {
			if (typeof text === 'number') {
				offsets = item;
				position = series;
				zIndex = image;
				item = type;
				series = text;
				image = null;
				type = null;
				text = null;
			}
			if (typeof type === 'number') {
				offsets = zIndex;
				position = item;
				zIndex = series;
				item = image;
				series = type;
				image = null;
				type = null;
			}
			if (typeof image === 'number') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = image;
				image = null;
			}
			var data = (NOTES[type] || 'sticky_y') + ',' + (image || 'sunny') + ',' +
				this._escapeIconText(title || '') + (text ? ',' + this._escapeIconText(text) : '');
			return this.icon('weather', data, series, item, zIndex, position, offsets);
		},

		/** Create a text outline icon definition.
			@param text {string} The text content, use '|' for line breaks.
			@param [size] {number} The text size in pixels.
			@param [bold] {boolean} <code>true</code> for bold.
			@param [alignment] {string} 'left', 'right', 'center'.
			@param [colour] {string} The icon text's fill colour.
			@param [outline] {string} The icon text's outline colour.
			@param [series] {number} The series to which the icon applies.
			@param [item='all'] {number|string|number[]} The item in the series to which it applies or 'all'
						or 'everyn' or <code>[start, end, every]</code>.
			@param [zIndex] {number} The z-index (-1.0 to 1.0).
			@param [position] {number[]} An absolute chart position (0.0 to 1.0).
			@param [offsets] {number[]} Pixel offsets.
			@return {object} The icon definition.
			@example icons: [$.gchart.outlineIcon('Sale', 20, true, 0, 7)] */
		outlineIcon: function(text, size, bold, alignment, colour, outline,
				series, item, zIndex, position, offsets) {
			if (typeof size === 'boolean') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = outline;
				outline = colour;
				colour = alignment;
				alignment = bold;
				bold = size;
				size = null;
			}
			if (typeof size === 'string') {
				offsets = zIndex;
				position = item;
				zIndex = series;
				item = outline;
				series = colour;
				outline = alignment;
				colour = bold;
				alignment = size;
				bold = null;
				size = null;
			}
			if (typeof bold === 'number') {
				offsets = series;
				position = outline;
				zIndex = colour;
				item = alignment;
				series = bold;
				outline = null;
				colour = null;
				alignment = null;
				bold = null;
			}
			if (typeof alignment === 'number') {
				offsets = item;
				position = series;
				zIndex = outline;
				item = colour;
				series = alignment;
				outline = null;
				colour = null;
				alignment = null;
			}
			if (typeof colour === 'number') {
				offsets = zIndex;
				position = item;
				zIndex = series;
				item = outline;
				series = colour;
				outline = null;
				colour = null;
			}
			if (typeof outline === 'number') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = outline;
				outline = null;
			}
			var data = this.color(colour || 'white') + ',' + (size || 10) + ',' +
				(PLACEMENTS[alignment] || 'h') + ',' + this.color(outline || 'black') + ',' +
				(bold ? 'b' : '_') + ',' + this._escapeIconText(text);
			return this.icon('text_outline', data, series, item, zIndex, position, offsets);
		},

		/** Create a colour varying icon definition.
			@param image {string} The name of the icon to use.
			@param colourSeries {number} The series from which colour data is taken.
			@param [colourLow='green'] {string[]|string} The icons' fill colour(s).
			@param [colourMiddle='yellow'] {string} The icons' middle fill colour.
			@param [colourHigh='red'] {string} The icons' high fill colour.
			@param [size=12] {number} The icon size in pixels - 12, 16, 24.
			@param [outline='black'] {string} The icons' outline colour.
			@param [alignment='hb'] {string} Result of <code>contextualAlignment(...)</code>.
			@param series {number} The series to which the icon applies.
			@param [item='all'] {numberstring|number[]} The item in the series to which it applies or 'all'
						or 'everyn' or <code>[start, end, every]</code>.
			@param [zIndex] {number} The z-index (-1.0 to 1.0).
			@param [position] {number[]} An absolute chart position (0.0 to 1.0).
			@param [offsets] {number[]} Pixel offsets.
			@return {object} The icon definition.
			@example icons: [$.gchart.colorVaryIcon('books', 1, ['green', 'blue', 'red'], 24, 0)] */
		colourVaryIcon: function(image, colourSeries, colourLow, colourMiddle, colourHigh, size, outline, alignment,
				series, item, zIndex, position, offsets) {
			if ($.isArray(colourLow)) {
				offsets = zIndex;
				position = item;
				zIndex = series;
				item = alignment;
				series = outline;
				alignment = size;
				outline = colourHigh;
				size = colourMiddle;
				colourHigh = colourLow[2];
				colourMiddle = colourLow[1];
				colourLow = colourLow[0];
			}
			else if (typeof colourLow !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = outline;
				outline = size;
				size = colourHigh;
				colourHigh = colourMiddle;
				colourMiddle = colourLow;
				colourLow = null;
			}
			if (typeof colourMiddle !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = outline;
				outline = size;
				size = colourHigh;
				colourHigh = colourMiddle;
				colourMiddle = null;
			}
			if (typeof colourHigh !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = outline;
				outline = size;
				size = colourHigh;
				colourHigh = null;
			}
			if (typeof size !== 'number') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = outline;
				outline = size;
				size = null;
			}
			if (typeof outline !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = outline;
				outline = null;
			}
			if (typeof alignment !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = null;
			}
			var data = image + ',' + (colourSeries || 0) + ',' + this.color(colourLow || 'green') + ',' +
				this.color(colourMiddle || 'yellow') + ',' + this.color(colourHigh || 'red') + ',' +
				(SIZES[size] || 12) + ',' + this.color(outline || 'black') + ',' + (alignment || 'hb-0-0');
			return this.icon('cm_color', data, series, item, zIndex, position, offsets);
		},

		/** Create a size varying icon definition.
			@param image {string} The name of the icon to use.
			@param sizeSeries {number} The series from which size data is taken.
			@param [zeroSize=4] {number[]|number} The icons' size at minimum data value,
						or array of this and next two values.
			@param [sizeMultiplier=10] {number} The size scaling factor.
			@param [minSize=4] {number} The minimum size for any icon in pixels.
			@param [colour='#88ff88'] {string} The icons' fill colour.
			@param [outline='black'] {string} The icons' outline colour.
			@param [alignment='hb'] {string} Result of <code>contextualAlignment(...)</code>.
			@param series {number} The series to which the icon applies.
			@param [item='all'] {number|string|number[]} The item in the series to which it applies or 'all'
						or 'everyn' or <code>[start, end, every]</code>.
			@param [zIndex] {number} The z-index (-1.0 to 1.0).
			@param [position] {number[]} An absolute chart position (0.0 to 1.0).
			@param [offsets] {number[]} Pixel offsets.
			@return {object} The icon definition.
			@example icons: [$.gchart.sizeVaryIcon('disk', 1, 5, 20, 5, 'black', 'red',
 	$.gchart.contextualAlignment('centre'), 0)] */
		sizeVaryIcon: function(image, sizeSeries, zeroSize, sizeMultiplier, minSize, colour, outline, alignment,
				series, item, zIndex, position, offsets) {
			if ($.isArray(zeroSize)) {
				offsets = zIndex;
				position = item;
				zIndex = series;
				item = alignment;
				series = outline;
				alignment = colour;
				outline = minSize;
				colour = sizeMultiplier;
				minSize = zeroSize[2];
				sizeMultiplier = zeroSize[1];
				zeroSize = zeroSize[0];
			}
			else if (typeof zeroSize !== 'number') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = outline;
				outline = colour;
				colour = minSize;
				minSize = sizeMultiplier;
				sizeMultiplier = zeroSize;
				zeroSize = null;
			}
			if (typeof sizeMultiplier !== 'number') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = outline;
				outline = colour;
				colour = minSize;
				minSize = sizeMultiplier;
				sizeMultiplier = null;
			}
			if (typeof minSize !== 'number') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = outline;
				outline = colour;
				colour = minSize;
				minSize = null;
			}
			if (typeof colour !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = outline;
				outline = colour;
				colour = null;
			}
			if (typeof outline !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = outline;
				outline = null;
			}
			if (typeof alignment !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = null;
			}
			var data = image + ',' + (sizeSeries || 0) + ',' + (zeroSize || 4) + ',' +
				(sizeMultiplier || 10) + ',' + (minSize || 4) + ',' + this.color(outline || 'black') + ',' +
				this.color(colour || '#88ff88') + ',' + (alignment || 'hb-0-0');
			return this.icon('cm_size', data, series, item, zIndex, position, offsets);
		},

		/** Create a colour and size varying icon definition.
			@param image {string} The name of the icon to use.
			@param colourSeries {number} The series from which colour data is taken.
			@param [colourLow='green'] {string[]|string} The icons' fill colour(s).
			@param [colourMiddle='yellow'] {string} The icons' middle fill colour.
			@param [colourHigh='red'] {string} The icons' high fill colour.
			@param sizeSeries {number} The series from which size data is taken.
			@param [zeroSize=4] {number[]|number} The icons' size at minimum data value,
						or array of this and next two values.
			@param [sizeMultiplier=10] {number} The size scaling factor.
			@param [minSize=4] {number} The minimum size for any icon in pixels.
			@param [outline='black'] {string} The icons' outline colour.
			@param [alignment='hb'] {string} Result of <code>contextualAlignment(...)</code>.
			@param series {number} The series to which the icon applies.
			@param [item='all'] {number|string|number[]} The item in the series to which it applies or 'all'
						or 'everyn' or <code>[start, end, every]</code>.
			@param [zIndex] {number} The z-index (-1.0 to 1.0).
			@param [position] {number[]} An absolute chart position (0.0 to 1.0).
			@param [offsets] {number[]} Pixel offsets.
			@return {object} The icon definition.
			@example icons: [$.gchart.colorSizeVaryIcon('square', 1, ['green', 'blue', 'red'], 1, 5, 20, 5, 0)] */
		colourSizeVaryIcon: function(image, colourSeries, colourLow, colourMiddle, colourHigh,
				sizeSeries, zeroSize, sizeMultiplier, minSize, outline, alignment,
				series, item, zIndex, position, offsets) {
			if ($.isArray(colourLow)) {
				offsets = zIndex;
				position = item;
				zIndex = series;
				item = alignment;
				series = outline;
				alignment = minSize;
				outline = sizeMultiplier;
				minSize = zeroSize;
				sizeMultiplier = sizeSeries;
				zeroSize = colourHigh;
				sizeSeries = colourMiddle;
				colourHigh = colourLow[2];
				colourMiddle = colourLow[1];
				colourLow = colourLow[0];
			}
			else if (typeof colourLow !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = outline;
				outline = minSize;
				minSize = sizeMultiplier;
				sizeMultiplier = zeroSize;
				zeroSize = sizeSeries;
				sizeSeries = colourHigh;
				colourHigh = colourMiddle;
				colourMiddle = colourLow;
				colourLow = null;
			}
			if (typeof colourMiddle !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = outline;
				outline = minSize;
				minSize = sizeMultiplier;
				sizeMultiplier = zeroSize;
				zeroSize = sizeSeries;
				sizeSeries = colourHigh;
				colourHigh = colourMiddle;
				colourMiddle = null;
			}
			if (typeof colourHigh !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = outline;
				outline = minSize;
				minSize = sizeMultiplier;
				sizeMultiplier = zeroSize;
				zeroSize = sizeSeries;
				sizeSeries = colourHigh;
				colourHigh = null;
			}
			if ($.isArray(zeroSize)) {
				offsets = zIndex;
				position = item;
				zIndex = series;
				item = alignment;
				series = outline;
				alignment = minSize;
				outline = sizeMultiplier;
				minSize = zeroSize[2];
				sizeMultiplier = zeroSize[1];
				zeroSize = zeroSize[0];
			}
			else if (typeof zeroSize !== 'number') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = outline;
				outline = minSize;
				minSize = sizeMultiplier;
				sizeMultiplier = zeroSize;
				zeroSize = null;
			}
			if (typeof sizeMultiplier !== 'number') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = outline;
				outline = minSize;
				minSize = sizeMultiplier;
				sizeMultiplier = null;
			}
			if (typeof minSize !== 'number') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = outline;
				outline = minSize;
				minSize = null;
			}
			if (typeof outline !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = outline;
				outline = null;
			}
			if (typeof alignment !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = null;
			}
			var data = image + ',' + (colourSeries || 0) + ',' + this.color(colourLow || 'green') + ',' +
				this.color(colourMiddle || 'yellow') + ',' + this.color(colourHigh || 'red') + ',' +
				(sizeSeries || 0) + ',' + (zeroSize || 4) + ',' + (sizeMultiplier || 10) + ',' + (minSize || 4) + ',' +
				this.color(outline || 'black') + ',' + (alignment || 'hb-0-0');
			return this.icon('cm_color_size', data, series, item, zIndex, position, offsets);
		},

		/** Create a stacking icon definition.
			@param image {string} The name of the icon to use.
			@param repeatSeries {number} The series from which repeat data is taken.
			@param [scalingFactor=10] {number} The data value scaling factor.
			@param [horizontal=false] {boolean} <code>true</code> if stacking horizontally.
			@param [size=12] {number} The icons' size - 12, 16, 24.
			@param [colour='#88ff88'] {string} The icons' fill colour.
			@param [outline='black'] {string} The icons' outline colour.
			@param [spacing=0] {number} Spacing between icons in pixels.
			@param [alignment='hb'] {string} Result of <code>contextualAlignment(...)</code>.
			@param series {number} The series to which the icon applies.
			@param [item='all'] {number|string|number[]} The item in the series to which it applies or 'all'
						or 'everyn' or <code>[start, end, every]</code>.
			@param [zIndex] {number} The z-index (-1.0 to 1.0).
			@param [position] {number[]} An absolute chart position (0.0 to 1.0).
			@param [offsets] {number[]} Pixel offsets.
			@return {object} The icon definition.
			@example icons: [$.gchart.stackingIcon('flag', 1)] */
		stackingIcon: function(image, repeatSeries, scalingFactor, horizontal, size, colour, outline,
				spacing, alignment, series, item, zIndex, position, offsets) {
			if (typeof scalingFactor !== 'number') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = spacing;
				spacing = outline;
				outline = colour;
				colour = size;
				size = horizontal;
				horizontal = scalingFactor;
				scalingFactor = null;
			}
			if (typeof horizontal !== 'boolean') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = spacing;
				spacing = outline;
				outline = colour;
				colour = size;
				size = horizontal;
				horizontal = null;
			}
			if (typeof size !== 'number') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = spacing;
				spacing = outline;
				outline = colour;
				colour = size;
				size = null;
			}
			if (typeof colour !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = spacing;
				spacing = outline;
				outline = colour;
				colour = null;
			}
			if (typeof outline !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = spacing;
				spacing = outline;
				outline = null;
			}
			if (typeof spacing !== 'number') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = spacing;
				spacing = null;
			}
			if (typeof alignment !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = null;
			}
			var data = image + ',' + (repeatSeries || 0) + ',' + (scalingFactor || 10) + ',' +
				(horizontal ? 'h' : 'V') + ',' + (SIZES[size] || 12) + ',' + this.color(colour || '#88ff88') + ',' +
				this.color(outline || 'black') + ',' + (spacing || 0) + ',' + (alignment || 'hb-0-0');
			return this.icon('cm_repeat', data, series, item, zIndex, position, offsets);
		},

		/** Create a stacking with colour varying icon definition.
			@param image {string} The name of the icon to use.
			@param repeatSeries {number} The series from which repeat data is taken.
			@param [scalingFactor=10] {number} The data value scaling factor.
			@param [horizontal=false] {boolean} <code>true</code> if stacking horizontally.
			@param [size=12] {number} The icons' size - 12, 16, 24.
			@param colourSeries {number} The series from which colour data is taken.
			@param [colourLow='green'] {string[]|string} The icons' fill colour(s).
			@param [colourMiddle='yellow'] {string} The icons' middle fill colour.
			@param [colourHigh='red'] {string} The icons' high fill colour.
			@param [outline='black'] {string} The icons' outline colour.
			@param [spacing=0] {number} Spacing between icons in pixels.
			@param [alignment='hb'] {string} Result of <code>contextualAlignment(...)</code>.
			@param series {number} The series to which the icon applies.
			@param [item='all'] {number|string|number[]} The item in the series to which it applies or 'all'
						or 'everyn' or <code>[start, end, every]</code>.
			@param [zIndex] {number} The z-index (-1.0 to 1.0).
			@param [position] {number[]} An absolute chart position (0.0 to 1.0).
			@param [offsets] {number[]} Pixel offsets.
			@return {object} The icon definition.
			@example icons: [$.gchart.stackingColourVaryIcon('books', 1, 6, 16, 1,
 	['green', 'blue', 'red'], 'black', 2, $.gchart.contextualAlignment('centre'), 0)] */
		stackingColourVaryIcon: function(image, repeatSeries, scalingFactor, horizontal, size,
				colourSeries, colourLow, colourMiddle, colourHigh, outline,
				spacing, alignment, series, item, zIndex, position, offsets) {
			if (typeof scalingFactor !== 'number') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = spacing;
				spacing = outline;
				outline = colourHigh;
				colourHigh = colourMiddle;
				colourMiddle = colourLow;
				colourLow = colourSeries;
				colourSeries = size;
				size = horizontal;
				horizontal = scalingFactor;
				scalingFactor = null;
			}
			if (typeof horizontal !== 'boolean') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = spacing;
				spacing = outline;
				outline = colourHigh;
				colourHigh = colourMiddle;
				colourMiddle = colourLow;
				colourLow = colourSeries;
				colourSeries = size;
				size = horizontal;
				horizontal = null;
			}
			if (typeof size !== 'number') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = spacing;
				spacing = outline;
				outline = colourHigh;
				colourHigh = colourMiddle;
				colourMiddle = colourLow;
				colourLow = colourSeries;
				colourSeries = size;
				size = null;
			}
			if ($.isArray(colourLow)) {
				offsets = zIndex;
				position = item;
				zIndex = series;
				item = alignment;
				series = spacing;
				alignment = outline;
				spacing = colourHigh;
				outline = colourMiddle;
				colourHigh = colourLow[2];
				colourMiddle = colourLow[1];
				colourLow = colourLow[0];
			}
			else if (typeof colourLow !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = spacing;
				spacing = outline;
				outline = colourHigh;
				colourHigh = colourMiddle;
				colourMiddle = colourLow;
				colourLow = null;
			}
			if (typeof colourMiddle !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = spacing;
				spacing = outline;
				outline = colourHigh;
				colourHigh = colourMiddle;
				colourMiddle = null;
			}
			if (typeof colourHigh !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = spacing;
				spacing = outline;
				outline = colourHigh;
				colourHigh = null;
			}
			if (typeof outline !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = spacing;
				spacing = outline;
				outline = null;
			}
			if (typeof spacing !== 'number') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = spacing;
				spacing = null;
			}
			if (typeof alignment !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = alignment;
				alignment = null;
			}
			var data = image + ',' + (repeatSeries || 0) + ',' + (scalingFactor || 10) + ',' +
				(horizontal ? 'h' : 'V') + ',' + (SIZES[size] || 12) + ',' + (colourSeries || 0) + ',' +
				this.color(colourLow || 'green') + ',' + this.color(colourMiddle || 'yellow') + ',' +
				this.color(colourHigh || 'red') + ',' + this.color(outline || 'black') + ',' +
				(spacing || 0) + ',' + (alignment || 'hb-0-0');
			return this.icon('cm_repeat_color', data, series, item, zIndex, position, offsets);
		},

		/** Generate a contextual alignment value.
			@param position {string} The anchor point, e.g. 'topLeft', 'center', ...
			@param [hOffset] {number} A horizontal offset (pixels).
			@param [vOffset] {number} A vertical offset (pixels).
			@return {string} The alignment property.
			@example $.gchart.contextualAlignment('center') */
		contextualAlignment: function(position, hOffset, vOffset) {
			hOffset = hOffset || 0;
			vOffset = vOffset || 0;
			return (ALIGNMENTS[position] || 'hv') +
				(hOffset === 0 ? '-0' : (hOffset > 0 ? '%20' + hOffset : hOffset)) +
				(vOffset === 0 ? '-0' : (vOffset > 0 ? '%20' + vOffset : vOffset));
		},

		/** Generate an embedded chart icon.
			@param embeddedOptions {object} The options for the embedded chart.
			@param [bubble=false] {boolean} <code>true</code> if embedded in a bubble.
			@param [alignment='bottomLeft'] {string} The type of tail to use for a bubble,
						or the alignment of a non-bubble icon.
			@param [padding=4] {number} The padding inside the bubble in pixels.
			@param [frameColour='#00d0d0'] {string} The colour of the frame border.
			@param [fillColour='#80ffff'] {string} The colour of the frame background.
			@param [series] {number} The series to which the icon applies.
			@param [item='all'] {number|string|number[]} The item in the series to which it applies or 'all'
						or 'everyn' or <code>[start, end, every]</code>.
			@param [zIndex] {number} The z-index (-1.0 to 1.0).
			@param [position] {number[]} An absolute chart position (0.0 to 1.0).
			@param [offsets] {number[]} Pixel offsets.
			@return {object} The icon definition.
			@example icons: [$.gchart.embeddedChart({type: 'pie', legend: 'right', backgroundColor: 'cyan',
 	series: [$.gchart.series([10, 20, 30])], dataLabels: ['Q1', 'Q2', 'Q3']}, 'centre', 0, 7)] */
		embeddedChart: function(embeddedOptions, bubble, alignment, padding, frameColour, fillColour,
				series, item, zIndex, position, offsets) {
			if (typeof bubble !== 'boolean') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = fillColour;
				fillColour = frameColour;
				frameColour = padding;
				padding = alignment;
				alignment = bubble;
				bubble = false;
			}
			if (typeof alignment !== 'string') {
				offsets = position;
				position = zIndex;
				zIndex = item;
				item = series;
				series = fillColour;
				fillColour = frameColour;
				frameColour = padding;
				padding = alignment;
				alignment = null;
			}
			if (!bubble) {
				offsets = item;
				position = series;
				zIndex = fillColour;
				item = frameColour;
				series = padding;
				fillColour = null;
				frameColour = null;
				padding = null;
			}
			else {
				if (typeof padding !== 'number') {
					offsets = position;
					position = zIndex;
					zIndex = item;
					item = series;
					series = fillColour;
					fillColour = frameColour;
					frameColour = padding;
					padding = null;
				}
				if (typeof frameColour !== 'string') {
					offsets = zIndex;
					position = item;
					zIndex = series;
					item = fillColour;
					series = frameColour;
					fillColour = null;
					frameColour = null;
				}
				else if (typeof fillColour !== 'string') {
					offsets = position;
					position = zIndex;
					zIndex = item;
					item = series;
					series = fillColour;
					fillColour = null;
				}
			}
			var encodeEmbedded = function(value) {
				return value.replace(/%7c/ig, '|').replace(/@/g, '@@').replace(/%/g, '%25').
					replace(/,/g, '@,').replace(/\|/g, '@|').replace(/;/g, '@;').
					replace(/&/g, '%26').replace(/=/g, '%3D');
			};
			var allOptions = $.extend({}, $.gchart.defaultOptions, {width: 120, height: 60}, embeddedOptions);
			var embedded = $.gchart._generateChart(allOptions);
			embedded = embedded.replace(/^[^\?]+\?/, '').split('&');
			embedded = $.map(embedded, function(value) {
				value = value.split('=');
				return encodeEmbedded(value[0]) + ',' + encodeEmbedded(value[1]);
			});
			var data = (bubble ? (TAILS[alignment] || 'bb') + ',' + (padding == null ? 4 : padding) + ',' +
				this.color(frameColour || '#00d0d0') + ',' + this.color(fillColour || '#80ffff') :
				(EMBEDDED_ALIGNMENTS[alignment] || 'lb')) + ',' + embedded.join(',');
			return this.icon('ec' + (bubble ? 'b' : ''), data, series, item, zIndex, position, offsets);
		},

		/** Generate dynamic icon parameters.
			@private
			@param type {string} The encoded chart type.
			@param options {object} The current instance settings.
			@return {string} The icons parameters. */
		_addIcons: function(type, options) {
			var decodeItem = function(item) {
				if (item === 'all') {
					return item;
				}
				if (typeof item === 'string') {
					if (/^every(\d+)$/.exec(item)) {
						return item.replace(/every/, 'every,');
					}
				}
				if ($.isArray(item)) {
					return 'range,' + item.join(',');
				}
				return item;
			};
			var icons = '';
			var freeIcon = '';
			for (var i = 0; i < options.icons.length; i++) {
				var icon = options.icons[i];
				if (icon.series === -1) {
					freeIcon = '&chst=d_' + icon.name + '&chld=' + icon.data.replace(/,/g, '|');
				}
				else {
					icons += '|y;s=' + icon.name + ';d=' + icon.data +
						(icon.position ? '' : ';ds=' + icon.series + ';dp=' + decodeItem(icon.item)) +
						(icon.zIndex ? ';py=' + icon.zIndex : '') + 
						(icon.position ? ';po=' + icon.position.join(',') : '') + 
						(icon.offsets ? ';of=' + icon.offsets.join(',') : '');
				}
			}
			return (icons ? '&chem=' + icons.substr(1) : '') + freeIcon;
		},

		/** Escape reserved characters in icon text.
			@private
			@param value {string} The text to escape.
			@return {string} The escaped text. */
		_escapeIconText: function(value) {
			return value.replace(/([@=,;])/g, '@$1').replace(/\|/g, ',');
		}
	});

	$.extend($.gchart, {
		colorVaryIcon: $.gchart.colourVaryIcon,
		colorSizeVaryIcon: $.gchart.colourSizeVaryIcon,
		stackingColorVaryIcon: $.gchart.stackingColourVaryIcon
	});

})(jQuery);

/* http://keith-wood.name/gChart.html
   Google Chart GraphViz extension for jQuery v2.0.0.
   See API details at http://code.google.com/apis/chart/.
   Written by Keith Wood (kbwood{at}iinet.com.au) September 2008.
   Available under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

	/** GraphViz extension for Google Chart plugin.
		@module GChartGraphViz
		@augments GChart */

	// New chart types: graphviz
	$.extend($.gchart._chartTypes, {graphviz: 'gv', gv: 'gv'});
		
	$.extend($.gchart._typeOptions, {gv: 'no'});

	$.extend($.gchart, {

		/** Prepare options for a GraphViz chart.
			@param [engine='dot'] {string} The graphing engine to use: dot, neato, twopi, circo, fdp.
			@param [options] {object} Other options for the chart.
			@param [directed] {boolean} <code>true</code> for directed graph, <code>false</code> for normal.
			@param nodes {string|object} The DOT representation of the nodes to graph or
						the graph nodes and their settings.
			@param [edges] {object} The graph edges keyed from, with array of to.
			@param [attrs] {object} Other settings for the graph.
			@return {object} The configured options object.
			@example $(selector).gchart($.gchart.graphviz('neato', 'digraph{A->B->C->A}')) */
		graphviz: function(engine, options, directed, nodes, edges, attrs) {
			if (arguments.length === 1) {
				nodes = engine;
				engine = 'dot';
			}
			var hadEngine = typeof engine === 'string';
			if (!hadEngine) {
				attrs = edges;
				edges = nodes;
				nodes = directed;
				directed = options;
				options = engine;
				engine = 'dot';
			}
			if ((options && typeof options !== 'object') || arguments.length === 2 ||
					(arguments.length === 3 && hadEngine)) {
				attrs = edges;
				edges = nodes;
				nodes = directed;
				directed = options;
				options = {};
			}
			if (typeof directed !== 'boolean' && arguments.length > 1) {
				attrs = edges;
				edges = nodes;
				nodes = directed;
				directed = false;
			}
			options = options || {};
			options.type = 'gv' + (engine !== 'dot' ? ':' + engine : '');
			options.dataLabels = [typeof nodes === 'string' ? nodes :
				this._genGraph(directed, nodes, edges, attrs)];
			return options;
		},

		/** Generate a graph definition.
			@private
			@param [directed=false] {boolean} <code>true</code> for directed graph, <code>false</code> for normal.
			@param nodes {object} The graph nodes and their settings.
			@param edges {object} The graph edges keyed from, with array of to.
			@param [attrs] {object} Other settings for the graph.
			@return {string} The graph definition. */
		_genGraph: function(directed, nodes, edges, attrs) {
			attrs = attrs || {};
			var gdef = (directed ? 'digraph' : 'graph') + '{';
			var sep = '';
			for (var n in attrs) {
				gdef += sep + n;
				var sep2 = '[';
				for (var n2 in attrs[n]) {
					gdef += sep2 + n2 + '=' + attrs[n][n2];
					sep2 = ','
				}
				gdef += (sep2 !== '[' ? ']' : '');
				sep = ';';
			}
			for (var node in nodes || {}) {
				gdef += sep + node;
				var sep2 = '[';
				for (var n in nodes[node]) {
					gdef += sep2 + n + '=' + nodes[node][n];
					sep2 = ','
				}
				gdef += (sep2 !== '[' ? ']' : '');
				sep = ';';
			}
			for (var edge in edges || {}) {
				for (var n in edges[edge]) {
					gdef += sep + edge + (directed ? '->' : '--') + edges[edge][n];
				}
				sep = ';';
			}
			gdef += '}';
			return gdef;
		},

		/** Generate standard options for charts that aren't really charts.
			@private
			@param options {object} The chart settings.
			@param labels {string} The concatenated labels for the chart.
			@return {string} The standard non-chart options. */
		_noOptions: function(options, labels) {
			return '&chl=' + labels.substr(1);
		}
	});

})(jQuery);

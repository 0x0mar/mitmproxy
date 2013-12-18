define(["dojo/_base/declare",
		"dojo/aspect",
		"dgrid/OnDemandGrid",
		"dgrid/Keyboard",
		"dgrid/Selection",
		"dgrid/extensions/ColumnResizer",
		"dgrid/extensions/ColumnHider",
		"dgrid/extensions/DijitRegistry",
		"../flow/RequestUtils",
		"../flow/ResponseUtils",
		"dojo/text!./templates/tutorial.html"
], function(declare, aspect, OnDemandGrid, Keyboard, Selection, ColumnResizer, ColumnHider, DijitRegistry, RequestUtils, ResponseUtils, tutorial) {

	return declare([OnDemandGrid, Keyboard, Selection, ColumnResizer, ColumnHider, DijitRegistry], {
		constructor: function() {
			aspect.after(this, "renderRow", function(row, args) {
				var flow = args[0];
                //flow.View.className can contain multiple classNames, breaks classList.add ...
				row.className += " " + flow.View.className;
                //Pure Code Beauty: Construct background gradient
                var c = flow.tags.length;
                if(c > 0){
                    var background = "linear-gradient(90deg";
                    flow.tags.forEach(function(tag,i){
                        var ps = (100* i   /c) + "%";
                        var pe = (100*(i+1)/c) + "%";
                        background += ("," + tag + " " + ps +
                                       "," + tag + " " + pe);
                    });
                    background += ")";
                    row.style.background = background;
                }
				return row;
			});
		},
		columns: {
			id: {
				label: "id",
				hidden: true
			},
			ssl: {
				label: "SSL",
				resizable: false,
				renderCell: function(flow, value, node) {
					node.classList.add(flow.request.scheme);
				},
				renderHeaderCell: function(node) {
					node.textContent = "";
				}
			},
			icon: {
				label: "Icon",
				resizable: false,
				get: function() {
					return "";
				},
				renderHeaderCell: function(node) {
					node.textContent = "";
				},
				sortable: false
			},
			"request-path": {
				label: "Path",
				renderCell: function(flow, value, node) {
					var filenameNode = document.createElement("span");
					filenameNode.textContent = RequestUtils.getFilename(flow.request);
					node.appendChild(filenameNode);

					node.appendChild(document.createElement("br"));

					var fullPathNode = document.createElement("small");
					var queryString = RequestUtils.getQueryString(flow.request);
					fullPathNode.textContent = RequestUtils.getFullPath(flow.request) + (queryString ? "?" + queryString : "");
					node.appendChild(fullPathNode);
				}
			},
            source: {
                label: "Source",
                hidden: true,
                get: function(flow) {
					return flow.request.client_conn.address.join(":");
				}
            },
			method: {
				label: "Method",
				get: function(flow) {
					return flow.request.method;
				}
			},
			status: {
				label: "Status",
				className: "field-status.text-right",
				renderCell: function(flow, value, node) {
					if(flow.error){
                        var warn_icon = document.createElement("i");
                        warn_icon.classList.add("icon-warning-sign");
                        warn_icon.title = flow.error.msg;
                        node.appendChild(warn_icon);
                        return;
                    }
                    node.textContent = flow.response ? flow.response.code : "";
                    node.title = flow.response ? (flow.response.code + " " + flow.response.msg) : "";
				}
			},
			"response-type": {
				label: "Response Type",
				get: function(flow) {
					var contentType = flow.response ? ResponseUtils.getContentType(flow.response) : false;
					if (contentType) {
						var split = contentType.indexOf(";");
						return contentType.substr(0, split === -1 ? undefined : split);
					}
				}
			},
			size: {
				label: "Size",
				className: "field-size.text-right",
				get: function(flow) {
					return flow.response ? ResponseUtils.getContentLengthFormatted(flow.response) : "-";
				}
			},
			time: {
				label: "Time",
				className: "field-time.text-right",
				renderCell: function(flow, value, node) {
					var date = new Date(flow.request.timestamp_start * 1000);
					//ugly but performant
					node.innerHTML = (
						'<span class="timestamp" title="UNIX Timestamp: ' + flow.request.timestamp_start + '">' +
						date.toLocaleTimeString() + ', ' + ("0" + date.getDate()).slice(-2) + '.' + ("0" + (date.getMonth() + 1)).slice(-2) +
						'.</span><br><small class="duration">' + (flow.response ? Math.floor((flow.response.timestamp_end - flow.request.timestamp_start) * 1000)+"ms" : "...") + '</small>');
				}
			}
		},
		selectionMode: "singleRefresh",
		// only select a single row at a time. In contrast to "single", 
		// a select event will always be triggered 
		// (workaround when DetailPane is closed and user clicks the same flow again)
		_singleRefreshSelectionHandler: function(event, target) {
			this.clearSelection();
			this.select(target);
		},
		cellNavigation: false,
		noDataMessage: tutorial,
		loadingMessage: '<i class="icon-spinner icon-spin icon-large"></i>',
		farOffRemoval: 2000,
		/* Pixels! If this gets too small, dgrid fails. */
		minRowsPerPage: 100,
		maxRowsPerPage: 250,
		queryRowsOverlap: 1
	});
});
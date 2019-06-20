/**
 * 单元格类型
 *
 * @export
 * @enum {number}
 */
var CellContentTypes;
(function (CellContentTypes) {
    /**
     * 只读文本
     */
    CellContentTypes[CellContentTypes["label"] = 0] = "label";
    /**
     * 读写文本
     */
    CellContentTypes[CellContentTypes["text"] = 1] = "text";
    /**
     * 多行读写文本
     */
    CellContentTypes[CellContentTypes["textarea"] = 2] = "textarea";
    /**
     *下拉框
     */
    //dropdown
})(CellContentTypes || (CellContentTypes = {}));
var TreeTable = /** @class */ (function () {
    function TreeTable(opts) {
        this.opts = opts;
        this._data = opts.data;
    }
    TreeTable.prototype.data = function () {
        return this._data;
    };
    TreeTable.prototype.render = function (data) {
        this._data = data || this._data;
        this._roots = {};
        var table = document.createElement("table");
        var attrs = this.opts.attrs || {};
        for (var n in attrs) {
            table.setAttribute(n, attrs[n]);
        }
        if (this.opts.className)
            table.className = this.opts.className;
        var head = this._createHeader();
        table.appendChild(head);
        var body = this._createBody();
        table.appendChild(body);
        return table;
    };
    TreeTable.prototype._createHeader = function () {
        var header = document.createElement("thead");
        var row = document.createElement("tr");
        header.appendChild(row);
        var colspan = 0;
        for (var i = 0, j = this.opts.columns.length; i < j; i++) {
            var col = this.opts.columns[i];
            if (colspan) {
                colspan--;
                continue;
            }
            var text = col.text || col.name;
            var th = document.createElement("th");
            if (col.visible === false)
                th.style.display = "none";
            th.className = col.name;
            th.innerHTML = text;
            row.appendChild(th);
            if (col.colspan) {
                th.colSpan = col.colspan;
                colspan = col.colspan - 1;
            }
        }
        this._columnCount = this.opts.columns.length;
        return header;
    };
    TreeTable.prototype._createBody = function () {
        var tbody = document.createElement("tbody");
        var data = this._data;
        if (data && data.length > 0) {
            for (var i = 0, j = data.length; i < j; i++) {
                var rowData = data[i];
                var row = this._createRow(rowData, i);
                tbody.appendChild(row);
            }
        }
        else {
            var tr = document.createElement("tr");
            tbody.appendChild(tr);
            var td = document.createElement("td");
            tr.appendChild(td);
            td.colSpan = this._columnCount;
            td.innerHTML = this.opts.emptyMessage || "没有数据";
        }
        return tbody;
    };
    TreeTable.prototype._createRow = function (rowData, index) {
        var tr = document.createElement("tr");
        var rowClassName = this.opts.rowClassName;
        if (rowClassName) {
            if (typeof rowClassName == 'function') {
                tr.className = rowClassName.call(this, rowData, index);
            }
            else {
                tr.className = rowClassName;
            }
        }
        var node = this._createCells(tr, rowData, index);
        var p = node ? node.parent : null;
        while (p) {
            p.childCount++;
            if (p.row != node.row) {
                p.cell.rowSpan = p.childCount;
                if (!p.collapseButton && p.childCount > 1) {
                    var collapseButton = p.collapseButton = this._createCollapseButton(p);
                    p.cell.insertBefore(collapseButton, p.cell.firstChild);
                }
            }
            p = p.parent;
        }
        return tr;
    };
    TreeTable.prototype._createCells = function (row, rowData, index) {
        var cols = this.opts.columns;
        var makeNodeOpts = {
            id: rowData[this.opts.primary],
            node: null,
            row: row,
            rowData: rowData
        };
        var treeDeep = 0;
        var isTreeColumnCompleted = false;
        var node = null;
        for (var i = 0, j = cols.length; i < j; i++) {
            var col = cols[i];
            if (col.nodeId) {
                if (isTreeColumnCompleted)
                    throw "collapsable列必须从开头连在一起";
                treeDeep++;
                var nodeNew = this._createNode(col, makeNodeOpts);
                if (nodeNew) {
                    node = nodeNew;
                }
                else {
                    node.cell._TTColSpanCount = node.cell.colSpan = (node.cell.colSpan || 1) + 1;
                }
            }
            else {
                isTreeColumnCompleted = true;
            }
            if (isTreeColumnCompleted) {
                var td = this._createCell(col, rowData, index);
                //(td as any)._TTNode = node;
                row.appendChild(td);
            }
            else if (!node.cell) {
                var td = this._createCell(col, rowData, index);
                td._TTNode = node;
                node.cell = td;
                row.appendChild(td);
            }
        }
        this._treeDeep = treeDeep;
        return node;
    };
    TreeTable.prototype._createCell = function (col, rowData, index) {
        var td = document.createElement("td");
        td.rowSpan = 1;
        td._TTRowData = rowData;
        td._TTColumn = col;
        if (col.visible === false)
            td.style.display = "none";
        var div = document.createElement("div");
        td.appendChild(div);
        var tdClassName = col.name;
        if (col.columnClassName) {
            if (typeof col.columnClassName === "function") {
                tdClassName += " " + col.columnClassName.call(this, rowData, col.name);
            }
            else {
                tdClassName += " " + col.columnClassName;
            }
        }
        div.className = tdClassName;
        div.style.display = "inline-block";
        if (col.cell) {
            //let ct:
            if (typeof col.cell == "function") {
                var ctt = col.cell.call(this, rowData, col.name);
                if (ctt.nodeType !== undefined)
                    div.appendChild(div);
                else
                    div.innerHTML = ctt;
            }
            else {
                var cct = void 0;
                if (typeof col.cell == "string") {
                    cct = CellContentTypes[col.cell];
                }
                else if (typeof col.cell == "number") {
                    cct = col.cell;
                }
                else {
                    throw "col.cell是错误的.name=" + col.name;
                }
                switch (cct) {
                    case CellContentTypes.label:
                        div.innerHTML = rowData[col.name];
                        break;
                    case CellContentTypes.text:
                        var input = document.createElement("input");
                        input.name = col.name;
                        input.type = "text";
                        input.value = rowData[col.name];
                        div.appendChild(input);
                        break;
                    case CellContentTypes.textarea:
                        var tarea = document.createElement("textarea");
                        tarea.name = col.name;
                        tarea.value = rowData[col.name];
                        div.appendChild(tarea);
                        break;
                }
            }
        }
        else {
            var val = rowData[col.name];
            if (val === null || val === undefined)
                val = "";
            div.innerHTML = val;
        }
        td._TTExpandedCell = div;
        var collapsedDiv = document.createElement("div");
        collapsedDiv.className = tdClassName + " collapsed";
        collapsedDiv.style.display = "inline-block";
        return td;
    };
    TreeTable.prototype._createNode = function (col, makeNodeOpts) {
        var nodeId = makeNodeOpts.rowData[col.nodeId];
        if (nodeId === undefined || nodeId === null)
            return;
        var parent = makeNodeOpts.node;
        var node = parent ? parent.children[nodeId] : this._roots[nodeId];
        if (!node) {
            node = {
                id: nodeId,
                row: makeNodeOpts.row,
                rowData: makeNodeOpts.rowData,
                column: col,
                parent: parent,
                childCount: 0,
                children: {},
                ttInstance: this
            };
            //makeNodeOpts.children[node.id] = node;
        }
        if (parent) {
            parent.children[node.id] = node;
        }
        else {
            this._roots[node.id] = node;
        }
        makeNodeOpts.node = node;
        return node;
    };
    TreeTable.prototype._createCollapseButton = function (node) {
        var collapseButton = document.createElement("div");
        collapseButton.style.display = "inline-block";
        collapseButton.className = "collapseButton expanded";
        collapseButton._TTNode = node;
        var me = this;
        collapseButton.onclick = function () {
            var currentNode = this._TTNode;
            if (currentNode.isCollapsed) {
                expand.call(currentNode);
            }
            else {
                collapse.call(currentNode);
            }
        };
        return collapseButton;
    };
    return TreeTable;
}());
function expand() {
    var currentNode = this;
    if (!currentNode.isCollapsed)
        return;
    currentNode.cell.colSpan = currentNode.cell._TTColSpanCount || 1;
    currentNode.collapseButton.className = "collapseButton expanded";
    currentNode.isCollapsed = false;
    var line_count = showNode.call(currentNode);
    currentNode.cell.rowSpan = line_count || 1;
    var p = currentNode.parent;
    while (p) {
        p.cell.rowSpan = p.cell.rowSpan + line_count - 1;
        p = p.parent;
    }
    for (var id in currentNode.children) {
        var child = currentNode.children[id];
        child.row.style.display = "table-row";
    }
    //currentNode.row.style.display="table-row";
    var nextCell = currentNode.cell.nextSibling;
    var ignoreNextNodes = false;
    while (nextCell) {
        var nextNode = nextCell._TTNode;
        if (nextNode && !ignoreNextNodes && nextNode.column.nodeId) {
            nextCell.style.display = "table-cell";
            if (nextNode.isCollapsed === true)
                ignoreNextNodes = true;
            nextCell = nextCell.nextSibling;
            continue;
        }
        var expandedDiv = nextCell._TTExpandedCell;
        nextCell.replaceChild(expandedDiv, nextCell.lastChild);
        if (nextCell._TTNode && nextCell._TTNode.collapseButton) {
            nextCell._TTNode.collapseButton.style.display = "table-cell";
            nextCell._TTNode.cell.rowSpan = (nextCell._TTNode.childCount) || 1;
        }
        nextCell = nextCell.nextSibling;
    }
}
/**
 * 显示当前节点的行，如果当前节点为展开状态，当前节点的子行也会显示
 *
 * @returns {number} 当前节点应该展示的行
 */
function showNode() {
    var line_count = 0;
    var currentNode = this;
    currentNode.row.style.display = "table-row";
    if (currentNode.isCollapsed !== true) {
        for (var id in currentNode.children) {
            line_count += showNode.call(currentNode.children[id]);
        }
    }
    else
        line_count = 1;
    return line_count || 1;
}
function collapse() {
    var currentNode = this;
    if (currentNode.isCollapsed)
        return;
    currentNode.collapseButton.className = "collapseButton collapsed";
    hideNode.call(currentNode);
    currentNode.row.style.display = "table-row";
    currentNode.isCollapsed = true;
    var n = currentNode.cell.rowSpan - 1;
    currentNode.cell.rowSpan = 1;
    var p = currentNode.parent;
    while (p) {
        p.cell.rowSpan = p.cell.rowSpan - n;
        p = p.parent;
    }
    var nextCell = currentNode.cell.nextSibling;
    var colCount = currentNode.cell.colSpan;
    var ignoreNextNodes = false;
    while (nextCell) {
        var nextNode = nextCell._TTNode;
        if (nextNode && !ignoreNextNodes && nextNode.column.nodeId) {
            nextCell.style.display = "none";
            colCount += (nextCell.colSpan || 1);
            if (nextNode.isCollapsed === true) {
                ignoreNextNodes = true;
            }
            nextCell = nextCell.nextSibling;
            continue;
        }
        var expandedDiv = nextCell._TTExpandedCell;
        var collapsedDiv = nextCell._TTCollaspedCell;
        if (!collapsedDiv) {
            collapsedDiv = document.createElement("div");
            collapsedDiv.className = expandedDiv.className + " collapsed";
            nextCell._TTCollaspedCell = collapsedDiv;
            var col = nextCell._TTColumn;
            var rowData = nextCell._TTRowData;
            if (col.collapsedCell) {
                var ctt = col.collapsedCell.call(this.ttInstance, rowData, col.name, currentNode);
                if (ctt) {
                    if (ctt.nodeType !== undefined)
                        collapsedDiv.appendChild(ctt);
                    else
                        collapsedDiv.innerHTML = ctt;
                }
                else
                    collapsedDiv.innerHTML = "";
            }
        }
        nextCell.replaceChild(collapsedDiv, nextCell.lastChild);
        nextCell.rowSpan = 1;
        if (nextNode && nextNode.collapseButton)
            nextNode.collapseButton.style.display = "none";
        nextCell = nextCell.nextSibling;
    }
    currentNode.cell.colSpan = colCount;
}
/**
 * 隐藏当前节点的行与所有子节点的行
 *
 */
function hideNode() {
    var currentNode = this;
    currentNode.row.style.display = "none";
    for (var id in currentNode.children) {
        hideNode.call(currentNode.children[id]);
    }
}
//let isCollapsed:boolean = true;
//if(this.opts.expended===undefined || this.opts.expended===true) isCollapsed=false;
//else if(this.opts.expended===false) isCollapsed = true;
//else if(typeof this.opts.expended==="string"){
//    isCollapsed=true;
//    if(makeNodeOpts.id === this.opts.expended) isCollapsed=false;
//} 

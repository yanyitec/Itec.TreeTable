
/**
 * 树形表格配置接口
 *
 * @export
 * @interface ITreeTableOptions
 */
interface ITreeTableOptions{
    /**
     * 列定义列表
     *
     * @type {Array<ITreeTableColumnOptions>}
     * @memberof ITreeTableOptions
     */
    columns:Array<ITreeTableColumnOptions>;
    
    /**
     * 主键字段
     *
     * @type {string}
     * @memberof ITreeTableOptions
     */
    primary:string;

    /**
     * 是否是展开状态，
     * 默认是展开
     * 未实现
     * 如果是string,表示只有id=该值的行与父行是展开状态
     *
     * @type {(boolean|string)}
     * @memberof ITreeTableOptions
     */
    expended?:boolean|string;
    collapsable?:boolean;
    /**
     * 要写入到Table的属性
     *
     * @type {{[attrName:string]:string}}
     * @memberof ITreeTableOptions
     */
    attrs?:{[attrName:string]:string};

    /**
     * 生成的Table上面带的className
     *
     * @type {string}
     * @memberof ITreeTableOptions
     */
    className?:string;

    /**
     * 生成的TR上带的className,
     * 如果是函数，就会调用函数来生成className
     *
     * @type {(string|IRowClassNameMaker)}
     * @memberof ITreeTableOptions
     */
    rowClassName?:string|IRowClassNameMaker;
    /**
     * 生成的TD上带的className,
     * 如果是函数，就会调用函数来生成className
     *
     * @type {(string|IRowClassNameMaker)}
     * @memberof ITreeTableOptions
     */
    cellClassName?:string | ICellClassNameMaker;

    
    

    /**
     * 数据
     *
     * @type {Array<any>}
     * @memberof ITreeTableColumnOptions
     */
    data?:Array<any>;
    emptyMessage?:string;
}

/**
 * 树形表格列配置
 *
 * @export
 * @interface ITreeTableColumnOptions
 */
interface ITreeTableColumnOptions{

    /**
     * 列名称，对应着数据字段
     *
     * @type {string}
     * @memberof ITreeTableColumnOptions
     */
    name:string;

    nodeId?:string;

    /**
     * 用于显示的列名
     *
     * @type {string}
     * @memberof ITreeTableColumnOptions
     */
    text?:string;

    /**
     * 单元格类型
     * 如果是CellTypes或者string,根据值生成对应的Cell
     * 如果是函数，用函数的返回的元素填充单元格
     * @type {(ColumnTypes|string|ICellContentMaker)}
     * @memberof ITreeTableColumnOptions
     */
    cell?:CellContentTypes|string|ICellContentMaker;

    
    /**
     * 收起来后，后面的列都会合并，合并的内容从这里得到
     *
     * @type {ICellClassNameMaker}
     * @memberof ITreeTableColumnOptions
     */
    collapsedCell?:ICellClassNameMaker;
    /**
     * 列的ClassName ,
     * 会在cell上首先写该ClassName
     *
     * @type {string}
     * @memberof ITreeTableColumnOptions
     */
    columnClassName?:string;
    
    /**
     * 可折叠的列
     *
     * @type {string}
     * @memberof ITreeTableColumnOptions
     */
    group?:string|boolean;
    
    visible?:boolean;

    colspan?:number;
    
}



/**
 * 生成RowClassName的函数签名
 *
 * @export
 * @interface IRowClassNameMaker
 */
interface IRowClassNameMaker{
    (

        rowData:object,
        rowIndex:number
    ):string;
}

/**
 * 生成cellClassName的函数签名
 *
 * @export
 * @interface ICellClassNameMaker
 */
interface ICellClassNameMaker{
    (rowData:object,colName:string):string;
}

/**
 * 单元格类型
 *
 * @export
 * @enum {number}
 */
enum CellContentTypes{

    /**
     * 只读文本
     */
    label,
    /**
     * 读写文本
     */
    text,

    /**
     * 多行读写文本
     */
    textarea,

    /**
     *下拉框
     */
    //dropdown

}

/**
 * 单元格生成函数签名
 *
 * @interface ICellContentMaker
 */
interface ICellContentMaker{
    (
        rowData:any,
        colName:string
    ):HTMLDivElement;
}


/**
 * 收起来的单元格生成函数签名
 *
 * @interface ICellContentCollapsedMaker
 */
interface ICellContentCollapsedMaker{
    (
        rowData:any,
        colName:string,
        node:ITreeTableNode
    ):HTMLDivElement;
}

interface ICollapsableOptions{
    
    /**
     *本级树形结构字段
     *
     * @type {string}
     * @memberof ICollapsableOptions
     */
    primary_field:string;

    /**
     * 下级树形结构字段
     *
     * @type {string}
     * @memberof ICollapsableOptions
     */
    super_field:string;
}

interface ITreeTableNode{
    id:string;
    cell?:HTMLTableCellElement;
    rowData?:object;
    column?:ITreeTableColumnOptions;
    collapsePlaceholdCell?:HTMLTableCellElement;
    row?:HTMLTableRowElement;
    deep?:number;
    isCollapsed?:boolean;
    collapseButton?:HTMLDivElement;
    parent?: ITreeTableNode;
    childCount?:number;
    children?:{[id:string]:ITreeTableNode}
    ttInstance:TreeTable;
    
}

interface ITreeTableMakeNodeOptions{
    id:string;
    node:ITreeTableNode;
    row:HTMLTableRowElement;
    rowData:object;
}

class TreeTable{
    opts:ITreeTableOptions;
    private _data:Array<any>;
    private _roots:{[id:string]:ITreeTableNode};
    private _treeDeep:number;
    private _columnCount:number;
    constructor(opts:ITreeTableOptions){
        this.opts = opts;
        this._data = opts.data;
    }
    data():Array<object>{
        return this._data;
    }
    
    render(data?:Array<object>):HTMLTableElement{
        this._data = data||this._data;
        this._roots = {};
        let table :HTMLTableElement = document.createElement("table") as HTMLTableElement;
        let attrs: {[name:string]:string}= this.opts.attrs || {};
        for(let n in attrs){
            table.setAttribute(n,attrs[n]);
        }
        if(this.opts.className) table.className = this.opts.className;
        let head = this._createHeader();
        table.appendChild(head);
        let body = this._createBody();
        table.appendChild(body);
        return table;
    }

    private _createHeader(){
        let header = document.createElement("thead");
        let row = document.createElement("tr");
        header.appendChild(row);
        let colspan :number= 0;
        for(let i=0,j=this.opts.columns.length;i<j;i++){
            let col = this.opts.columns[i];
            if(colspan){colspan--; continue;}
            let text = col.text|| col.name;
            let th = document.createElement("th");
            if(col.visible===false) th.style.display="none";
            th.className = col.name;
            th.innerHTML = text;
            row.appendChild(th);
            if(col.colspan) {th.colSpan = col.colspan;colspan = col.colspan-1;}
            
        }
        this._columnCount = this.opts.columns.length;
        return header;
    }

    private _createBody(){
        let tbody = document.createElement("tbody");
        let data :Array<object> = this._data;
        if(data && data.length>0){
            for(let i=0,j=data.length; i<j; i++){
                let rowData = data[i];
                let row = this._createRow(rowData,i);
                tbody.appendChild(row);
            }
        }else {
            let tr = document.createElement("tr");
            tbody.appendChild(tr);
            let td = document.createElement("td");
            tr.appendChild(td);
            td.colSpan = this._columnCount;
            td.innerHTML = this.opts.emptyMessage||"没有数据";
        }
        
        
        return tbody;
    }

    private _createRow(rowData:object,index:number):HTMLTableRowElement{
        let tr = document.createElement("tr");
        let rowClassName :any= this.opts.rowClassName;
        if(rowClassName){
            if( typeof rowClassName =='function'){
                tr.className =(rowClassName as IRowClassNameMaker).call(this,rowData,index);
            }else {
                tr.className = rowClassName as string;
            }
        }
        var node = this._createCells(tr,rowData,index);
        var p = node?node. parent:null;
        

        while(p){
            p.childCount++;
            if(p.row!=node.row){
                p.cell.rowSpan = p.childCount;
                if(!p.collapseButton && p.childCount>1){
                    let collapseButton =p.collapseButton = this._createCollapseButton(p);
                    p.cell.insertBefore(collapseButton,p.cell.firstChild);
                }
            }
                        
            p = p.parent;
        }
        return tr;
    }

    private _createCells(row:HTMLTableRowElement,rowData:object,index:number):ITreeTableNode{
        let cols = this.opts.columns;
        let makeNodeOpts:ITreeTableMakeNodeOptions = {
            id:rowData[this.opts.primary],
            node:null,
            row:row,
            rowData:rowData

        };
        
        let treeDeep=0;
        let isTreeColumnCompleted = false;
        let node :ITreeTableNode=null;
        for(let i=0,j=cols.length;i<j;i++ ){
            let col = cols[i];
            
            
            if(col.nodeId){
                if(isTreeColumnCompleted) throw "collapsable列必须从开头连在一起";
                treeDeep++;
                let nodeNew = this._createNode(col,makeNodeOpts);
                if(nodeNew){
                    node = nodeNew;
                }else {
                    (node.cell as any)._TTColSpanCount =node.cell.colSpan = (node.cell.colSpan||1)+1;
                }
                
            }else{
                isTreeColumnCompleted = true;
            }
            if(isTreeColumnCompleted){
                let td = this._createCell(col,rowData,index);
                //(td as any)._TTNode = node;
                row.appendChild(td);
            }else if(!node.cell){
                let td = this._createCell(col,rowData,index);
                (td as any)._TTNode = node;
                node.cell = td;
                row.appendChild(td);
            }
            
            
        }
        
        this._treeDeep = treeDeep;
        return node;
    }

    private _createCell(col:ITreeTableColumnOptions,rowData:object,index:number):HTMLTableCellElement{
        var td = document.createElement("td");
        td.rowSpan=1;
        (td as any)._TTRowData = rowData;
        (td as any)._TTColumn = col;
        if(col.visible===false) td.style.display="none";
        var div = document.createElement("div");
        td.appendChild(div);
        var tdClassName = col.name;
        if(col.columnClassName){
            if(typeof col.columnClassName ==="function"){
                tdClassName += " " + (col.columnClassName as Function).call(this,rowData,col.name);
            }else {
                tdClassName += " " + col.columnClassName;
            }
        }
        div.className = tdClassName;
        div.style.display="inline-block";
        
        if(col.cell){
            //let ct:
            if(typeof col.cell== "function"){
                let ctt = col.cell.call(this,rowData,col.name);
                if(ctt.nodeType!==undefined) div.appendChild(div);
                else div.innerHTML = ctt;
               
            }else{
                let cct:CellContentTypes;
                if(typeof col.cell=="string"){
                    cct = CellContentTypes[col.cell];
                }else if(typeof col.cell=="number"){
                    cct = col.cell as CellContentTypes;
                }else {
                    throw "col.cell是错误的.name="+ col.name;
                }
                switch(cct){
                    case  CellContentTypes.label:
                        div.innerHTML = rowData[col.name];
                        break;
                    case CellContentTypes.text:
                        let input = document.createElement("input");
                        input.name = col.name;
                        input.type = "text";
                        input.value = rowData[col.name];
                        div.appendChild(input);
                        break;
                    case CellContentTypes.textarea:
                        let tarea = document.createElement("textarea");
                        tarea.name = col.name;
                        tarea.value = rowData[col.name];
                        div.appendChild(tarea);
                        break;
                }
            }
            
            
        }else {
            var val = rowData[col.name];
            if(val===null || val ===undefined) val = "";
            div.innerHTML = val;
        }
        (td as any)._TTExpandedCell =div;
        
        let collapsedDiv = document.createElement("div");
            
        collapsedDiv.className = tdClassName + " collapsed" ;
        collapsedDiv.style.display="inline-block";
        
        return td;
    }

    private _createNode(col:ITreeTableColumnOptions,makeNodeOpts:ITreeTableMakeNodeOptions):ITreeTableNode{
        let nodeId:string = makeNodeOpts.rowData[col.nodeId];
        if(nodeId===undefined|| nodeId===null) return;
        let parent :ITreeTableNode = makeNodeOpts.node;
        let node:ITreeTableNode = parent?parent.children[nodeId]:this._roots[nodeId];
        
        if(!node){
            node = {
                id:nodeId,
                row:makeNodeOpts.row,
                rowData:makeNodeOpts.rowData,
                column:col,
                parent:parent,
                childCount:0,
                children:{},
                ttInstance:this
            };
            //makeNodeOpts.children[node.id] = node;
        } 

        if(parent){
            
            parent.children[node.id] = node;
        }else{
            this._roots[node.id] = node;
        }
        makeNodeOpts.node= node;
        return node;
    }
    private _createCollapseButton(node:ITreeTableNode){
        let collapseButton = document.createElement("div");
        collapseButton.style.display = "inline-block";
        collapseButton.className ="collapseButton expanded";
        (collapseButton as any)._TTNode = node;
        let me = this;
        collapseButton.onclick = function(){
            let currentNode:ITreeTableNode = (this as any)._TTNode;
            if(currentNode.isCollapsed){
                expand.call(currentNode);
                
            }else{
                collapse.call(currentNode);
                
           }
                    
        }
        return collapseButton;
    }
}
function expand(){
    let currentNode = this as ITreeTableNode;
    if(!currentNode.isCollapsed)return;
    currentNode.cell.colSpan = (currentNode.cell as any)._TTColSpanCount || 1;
    
    currentNode.collapseButton.className="collapseButton expanded";
    currentNode.isCollapsed=false;
    let line_count = showNode.call(currentNode);
    
    currentNode.cell.rowSpan = line_count||1;
    let p = currentNode.parent;
    while(p){
        p.cell.rowSpan = p.cell.rowSpan + line_count-1;
        p=p.parent;
    }
                
    for(let id in currentNode.children){
        let child = currentNode.children[id];
        child.row.style.display="table-row";
    }
    //currentNode.row.style.display="table-row";
    let nextCell = currentNode.cell.nextSibling as HTMLTableCellElement;
    let ignoreNextNodes = false;
    while(nextCell){
        let nextNode = (nextCell as any)._TTNode as ITreeTableNode; 
        if( nextNode &&!ignoreNextNodes && nextNode.column.nodeId){
            nextCell.style.display="table-cell";
            if(nextNode.isCollapsed===true) ignoreNextNodes=true;
            nextCell = nextCell.nextSibling as HTMLTableCellElement;
            continue;
        }

        let expandedDiv =  (nextCell as any)._TTExpandedCell;
                   
        nextCell.replaceChild(expandedDiv,nextCell.lastChild);
        
        if((nextCell as any)._TTNode && (nextCell as any)._TTNode.collapseButton) {
            (nextCell as any)._TTNode.collapseButton.style.display="table-cell"; 
            (nextCell as any)._TTNode.cell.rowSpan = ((nextCell as any)._TTNode.childCount)||1;
        }
        nextCell = nextCell.nextSibling as HTMLTableCellElement;
    }
}

/**
 * 显示当前节点的行，如果当前节点为展开状态，当前节点的子行也会显示
 *
 * @returns {number} 当前节点应该展示的行
 */
function showNode():number{
    let line_count = 0;
    let currentNode = this as ITreeTableNode;
    currentNode.row.style.display="table-row";
    if(currentNode.isCollapsed!==true){
        for(let id in currentNode.children){
            line_count += showNode.call(currentNode.children[id]);
        }
    }else line_count=1;
    return line_count||1;
    
}

function collapse(){
    let currentNode = this as ITreeTableNode;
    if(currentNode.isCollapsed) return;
    
    currentNode.collapseButton.className="collapseButton collapsed";
    hideNode.call(currentNode);
    currentNode.row.style.display="table-row";

    currentNode.isCollapsed=true;
    let n = currentNode.cell.rowSpan-1;
    currentNode.cell.rowSpan = 1;
    let p = currentNode.parent;
    while(p){
        p.cell.rowSpan = p.cell.rowSpan - n;
        p=p.parent;
    }
                
    
    let nextCell = currentNode.cell.nextSibling as HTMLTableCellElement;
    let colCount = currentNode.cell.colSpan;
    let ignoreNextNodes = false;
    while(nextCell){
        let nextNode = (nextCell as any)._TTNode as ITreeTableNode;
        if( nextNode &&!ignoreNextNodes && nextNode.column.nodeId){
            nextCell.style.display="none";
            colCount += (nextCell.colSpan||1);
            if(nextNode.isCollapsed===true){
                ignoreNextNodes=true;
            }
            nextCell = nextCell.nextSibling as HTMLTableCellElement;
            continue;
        }
        let expandedDiv =  (nextCell as any)._TTExpandedCell;
        let collapsedDiv =  (nextCell as any)._TTCollaspedCell;
        if(!collapsedDiv){
            collapsedDiv = document.createElement("div");
            collapsedDiv.className = expandedDiv.className + " collapsed";
            (nextCell as any)._TTCollaspedCell =collapsedDiv;
            let col = (nextCell as any)._TTColumn;
            let rowData = (nextCell as any)._TTRowData;
            if(col.collapsedCell){
                let ctt = col.collapsedCell.call((this as ITreeTableNode).ttInstance,rowData,col.name,currentNode);
                if(ctt){
                    if(ctt.nodeType!==undefined) collapsedDiv.appendChild(ctt);
                    else collapsedDiv.innerHTML = ctt;   
                }else collapsedDiv.innerHTML = "";
            }
        }
        
                    
        nextCell.replaceChild(collapsedDiv,nextCell.lastChild);
        (nextCell as HTMLTableCellElement).rowSpan=1;

        if(nextNode && nextNode.collapseButton) nextNode.collapseButton.style.display="none"; 
        nextCell = nextCell.nextSibling as HTMLTableCellElement;
    }
    currentNode.cell.colSpan = colCount;
}

/**
 * 隐藏当前节点的行与所有子节点的行
 *
 */
function hideNode(){
    let currentNode = this as ITreeTableNode;
    currentNode.row.style.display="none";
    for(let id in currentNode.children){
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
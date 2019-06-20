/**
 * 树形表格配置接口
 *
 * @export
 * @interface ITreeTableOptions
 */
interface ITreeTableOptions {
    /**
     * 列定义列表
     *
     * @type {Array<ITreeTableColumnOptions>}
     * @memberof ITreeTableOptions
     */
    columns: Array<ITreeTableColumnOptions>;
    /**
     * 主键字段
     *
     * @type {string}
     * @memberof ITreeTableOptions
     */
    primary: string;
    /**
     * 是否是展开状态，
     * 默认是展开
     * 未实现
     * 如果是string,表示只有id=该值的行与父行是展开状态
     *
     * @type {(boolean|string)}
     * @memberof ITreeTableOptions
     */
    expended?: boolean | string;
    collapsable?: boolean;
    /**
     * 要写入到Table的属性
     *
     * @type {{[attrName:string]:string}}
     * @memberof ITreeTableOptions
     */
    attrs?: {
        [attrName: string]: string;
    };
    /**
     * 生成的Table上面带的className
     *
     * @type {string}
     * @memberof ITreeTableOptions
     */
    className?: string;
    /**
     * 生成的TR上带的className,
     * 如果是函数，就会调用函数来生成className
     *
     * @type {(string|IRowClassNameMaker)}
     * @memberof ITreeTableOptions
     */
    rowClassName?: string | IRowClassNameMaker;
    /**
     * 生成的TD上带的className,
     * 如果是函数，就会调用函数来生成className
     *
     * @type {(string|IRowClassNameMaker)}
     * @memberof ITreeTableOptions
     */
    cellClassName?: string | ICellClassNameMaker;
    /**
     * 数据
     *
     * @type {Array<any>}
     * @memberof ITreeTableColumnOptions
     */
    data?: Array<any>;
    emptyMessage?: string;
}
/**
 * 树形表格列配置
 *
 * @export
 * @interface ITreeTableColumnOptions
 */
interface ITreeTableColumnOptions {
    /**
     * 列名称，对应着数据字段
     *
     * @type {string}
     * @memberof ITreeTableColumnOptions
     */
    name: string;
    nodeId?: string;
    /**
     * 用于显示的列名
     *
     * @type {string}
     * @memberof ITreeTableColumnOptions
     */
    text?: string;
    /**
     * 单元格类型
     * 如果是CellTypes或者string,根据值生成对应的Cell
     * 如果是函数，用函数的返回的元素填充单元格
     * @type {(ColumnTypes|string|ICellContentMaker)}
     * @memberof ITreeTableColumnOptions
     */
    cell?: CellContentTypes | string | ICellContentMaker;
    /**
     * 收起来后，后面的列都会合并，合并的内容从这里得到
     *
     * @type {ICellClassNameMaker}
     * @memberof ITreeTableColumnOptions
     */
    collapsedCell?: ICellClassNameMaker;
    /**
     * 列的ClassName ,
     * 会在cell上首先写该ClassName
     *
     * @type {string}
     * @memberof ITreeTableColumnOptions
     */
    columnClassName?: string;
    /**
     * 可折叠的列
     *
     * @type {string}
     * @memberof ITreeTableColumnOptions
     */
    group?: string | boolean;
    visible?: boolean;
    colspan?: number;
}
/**
 * 生成RowClassName的函数签名
 *
 * @export
 * @interface IRowClassNameMaker
 */
interface IRowClassNameMaker {
    (rowData: object, rowIndex: number): string;
}
/**
 * 生成cellClassName的函数签名
 *
 * @export
 * @interface ICellClassNameMaker
 */
interface ICellClassNameMaker {
    (rowData: object, colName: string): string;
}
/**
 * 单元格类型
 *
 * @export
 * @enum {number}
 */
declare enum CellContentTypes {
    /**
     * 只读文本
     */
    label = 0,
    /**
     * 读写文本
     */
    text = 1,
    /**
     * 多行读写文本
     */
    textarea = 2,
}
/**
 * 单元格生成函数签名
 *
 * @interface ICellContentMaker
 */
interface ICellContentMaker {
    (rowData: any, colName: string): HTMLDivElement;
}
/**
 * 收起来的单元格生成函数签名
 *
 * @interface ICellContentCollapsedMaker
 */
interface ICellContentCollapsedMaker {
    (rowData: any, colName: string, node: ITreeTableNode): HTMLDivElement;
}
interface ICollapsableOptions {
    /**
     *本级树形结构字段
     *
     * @type {string}
     * @memberof ICollapsableOptions
     */
    primary_field: string;
    /**
     * 下级树形结构字段
     *
     * @type {string}
     * @memberof ICollapsableOptions
     */
    super_field: string;
}
interface ITreeTableNode {
    id: string;
    cell?: HTMLTableCellElement;
    rowData?: object;
    column?: ITreeTableColumnOptions;
    collapsePlaceholdCell?: HTMLTableCellElement;
    row?: HTMLTableRowElement;
    deep?: number;
    isCollapsed?: boolean;
    collapseButton?: HTMLDivElement;
    parent?: ITreeTableNode;
    childCount?: number;
    children?: {
        [id: string]: ITreeTableNode;
    };
    ttInstance: TreeTable;
}
interface ITreeTableMakeNodeOptions {
    id: string;
    node: ITreeTableNode;
    row: HTMLTableRowElement;
    rowData: object;
}
declare class TreeTable {
    opts: ITreeTableOptions;
    private _data;
    private _roots;
    private _treeDeep;
    private _columnCount;
    constructor(opts: ITreeTableOptions);
    data(): Array<object>;
    render(data?: Array<object>): HTMLTableElement;
    private _createHeader();
    private _createBody();
    private _createRow(rowData, index);
    private _createCells(row, rowData, index);
    private _createCell(col, rowData, index);
    private _createNode(col, makeNodeOpts);
    private _createCollapseButton(node);
}
declare function expand(): void;
/**
 * 显示当前节点的行，如果当前节点为展开状态，当前节点的子行也会显示
 *
 * @returns {number} 当前节点应该展示的行
 */
declare function showNode(): number;
declare function collapse(): void;
/**
 * 隐藏当前节点的行与所有子节点的行
 *
 */
declare function hideNode(): void;

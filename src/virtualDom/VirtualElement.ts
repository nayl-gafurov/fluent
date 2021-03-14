import ts from 'typescript';
import { DomElements } from '../jsxTransformer';
const factory = ts.factory;


export abstract class VirtualElement {

    protected parent?: VirtualElement;


    node: ts.JsxChild;
    index: number;

    static isJsxChild(node: ts.Node): node is ts.JsxChild {
        return ts.isJsxElement(node) || ts.isJsxText(node) || ts.isJsxExpression(node) ||
            ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node);
    }


    constructor(node: ts.JsxChild) {
        this.node = node;

        DomElements.add(this);
        this.index = DomElements.size;
    }

    setParent(parent: VirtualElement) {
        if (!this.parent) {
            this.parent = parent;
        }
    }


    abstract getElement(): ts.Statement 


    abstract getCode(): ts.Statement 



}

import { TagElement } from "./TagElement"
import { VirtualJsxSelfClosingElement } from "./VirtualJsxSelfClosingElement"
import { VirtualJsxText } from "./VirtualJsxText"
import { VirtualJsxExpression } from "./VirtualJsxExpression"

import ts from 'typescript';
import { VirtualElement } from "./VirtualElement";
const factory = ts.factory;



export class VirtualJsxElement extends TagElement {

    node: ts.JsxElement
    children: Array<VirtualElement>;
    constructor(node: ts.JsxElement) {
        super(node);
        this.children = [];
        this.tagName = (node.openingElement.tagName as ts.Identifier).text;
        node.children.forEach(child => {
            if (ts.isJsxElement(child)) {
                this.addChild(new VirtualJsxElement(child))
            } else if (ts.isJsxSelfClosingElement(child)) {
                this.addChild(new VirtualJsxSelfClosingElement(child))
            } else if (ts.isJsxText(child)) {
                this.addChild(new VirtualJsxText(child))
            } else if (ts.isJsxExpression(child)) {
                this.addChild(new VirtualJsxExpression(child))
            }

        })
    }

    addChild(element: VirtualElement) {
        this.children.push(element);
        element.setParent(this);
    }



    getCode() {

        return factory.createBlock(
            [
                this.getElement(),

                ...this.children.map(el => el.getCode())
            ],
            true
        )
    }

}

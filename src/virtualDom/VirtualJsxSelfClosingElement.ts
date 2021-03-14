
import {TagElement} from "./TagElement"
import ts from 'typescript';
const factory = ts.factory;





export class VirtualJsxSelfClosingElement extends TagElement{

    node: ts.JsxSelfClosingElement

    constructor(node: ts.JsxSelfClosingElement){
        super(node);

        this.tagName = (node.tagName as ts.Identifier).text;
    }


    getCode() {

        return this.getElement();
    }

    
}

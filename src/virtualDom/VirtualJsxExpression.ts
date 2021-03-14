
import { VirtualElement } from "./VirtualElement"
import ts from 'typescript';
import { visitNode } from "../jsxTransformer";
import { App } from "../App";
const factory = ts.factory;





export class VirtualJsxExpression extends VirtualElement {

    node: ts.JsxExpression;

    constructor(node: ts.JsxExpression) {
        super(node);

        // this.tagName = 'span';
    }

    generateExpression() {
        const expression = (visitNode(this.node, App.program(), App.context()) as ts.JsxExpression).expression
        if (expression) {
            return factory.createExpressionStatement(factory.createCallExpression(
                factory.createIdentifier("autorun"),
                undefined,
                [factory.createArrowFunction(
                    undefined,
                    undefined,
                    [],
                    undefined,
                    factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    expression


                )]
            ))
        }
        return factory.createExpressionStatement();
    }

    getElement() {
        return this.generateExpression();
    }

    getCode() {
        return this.getElement();
    }


}

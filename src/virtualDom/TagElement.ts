
import { VirtualElement } from "./VirtualElement"
import ts from 'typescript';
const factory = ts.factory;





export abstract class TagElement extends VirtualElement {

    node: ts.JsxElement | ts.JsxSelfClosingElement
    tagName: string;

    constructor(node: ts.JsxElement | ts.JsxSelfClosingElement) {
        super(node);
    }

    generateDomElement() {
        return factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
                [factory.createVariableDeclaration(
                    factory.createIdentifier(`el${this.index}`),
                    undefined,
                    undefined,
                    factory.createCallExpression(
                        factory.createPropertyAccessExpression(
                            factory.createIdentifier("document"),
                            factory.createIdentifier("createElement")
                        ),
                        undefined,
                        [factory.createIdentifier('"' + this.tagName + '"')]
                    )
                )],
                ts.NodeFlags.Const
            )
        )
    }

    getElement() {
        return this.generateDomElement();
    }

}
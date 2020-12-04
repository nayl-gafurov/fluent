import ts from 'typescript';
const factory = ts.factory;


export class VirtualElement {
    protected parent?: VirtualElement;
    children: Array<VirtualElement | string>;
    tagName: string;
    node: ts.JsxElement | ts.JsxSelfClosingElement;


    constructor(node: ts.JsxElement | ts.JsxSelfClosingElement) {
        this.node = node;
        if (ts.isJsxElement(node)) {
            this.tagName = (node.openingElement.tagName as ts.Identifier).text;
        } else {
            this.tagName = (node.tagName as ts.Identifier).text;
        }

        this.children = [];


    }

    addChildren() {
        const childrenNodes = this.node.getChildren();
        if (Array.isArray(childrenNodes)) {
            childrenNodes.forEach(child => {
                if (ts.isJsxText(child)) {
                    this.children.push(child.getText())
                } else if (ts.isJsxExpression(child)) {

                } else if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
                    this.children.push(new VirtualElement(child))
                }
            })
        }


    }

    generateTextDomElement(text: ts.Identifier | string) {
        return factory.createCallExpression(
            factory.createPropertyAccessExpression(
                factory.createIdentifier("document"),
                factory.createIdentifier("createTextNode")
            ),
            undefined,
            [typeof (text) === "string" ? factory.createIdentifier(text) : text]
        )
    }


    generateDomElement() {
        return (
            factory.createCallExpression(
                factory.createPropertyAccessExpression(
                    factory.createIdentifier("document"),
                    factory.createIdentifier("createElement")
                ),
                undefined,
                [factory.createIdentifier('"' + this.tagName + '"')]
            )

        )
    }

    generateExpression(){
        return factory.createExpressionStatement(factory.createCallExpression(
            factory.createIdentifier("autorun"),
            undefined,
            [factory.createArrowFunction(
              undefined,
              undefined,
              [],
              undefined,
              factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
              factory.createBinaryExpression(
                factory.createIdentifier("e"),
                factory.createToken(ts.SyntaxKind.PlusToken),
                factory.createNumericLiteral("5")
              )
            )]
          ))
    }

    finalGather() {
        factory.createBlock(
            [
                factory.createExpressionStatement(this.generateDomElement()),
            ],
            true
        )
    }



}

import { VirtualElement } from "./VirtualElement"
import ts from 'typescript';
const factory = ts.factory;





export class VirtualJsxText extends VirtualElement {

    node: ts.JsxText;
    protected parent: VirtualElement;
    
    constructor(node: ts.JsxText) {
        super(node);

    }

    private generateTextDomElement() {

        return factory.createExpressionStatement(factory.createCallExpression(
            factory.createPropertyAccessExpression(
                factory.createIdentifier(`el${this.parent.index}`),
                factory.createIdentifier("appendChild")
            ),
            undefined,
            [factory.createCallExpression(
                factory.createPropertyAccessExpression(
                    factory.createIdentifier("document"),
                    factory.createIdentifier("createTextNode")
                ),
                undefined,
                [factory.createStringLiteral(this.node.text)]
            )]
        ))





        // return factory.createExpressionStatement(
        //     factory.createCallExpression(
        //         factory.createPropertyAccessExpression(
        //             factory.createIdentifier("document"),
        //             factory.createIdentifier("createTextNode")
        //         ),
        //         undefined,
        //         [factory.createStringLiteral(this.node.text)]
        //     ))
    }



    getElement() {
        return this.generateTextDomElement()
    }


    getCode() {

        return this.getElement()

        // return factory.createBlock(
        //     [
        //         this.getElement(),


        //     ],
        //     true
        // )
    }



}

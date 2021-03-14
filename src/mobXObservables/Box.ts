import ts from "typescript";
import { TransformedObservables, visitNode } from "../jsxTransformer";
import { getSymbol, isPrimitive } from "../utils";
import { Observable } from "./Observable"
const factory = ts.factory;


export class Box extends Observable {
    readonly node: ts.VariableDeclaration;
    readonly program: ts.Program;
    readonly context: ts.TransformationContext
    private transformedToBox: boolean;
    readonly name: ts.Identifier;
    readonly initializerExpression: ts.Expression;
    readonly type?: ts.SyntaxKind;

    constructor(variableDeclaration: ts.VariableDeclaration, program: ts.Program, context: ts.TransformationContext) {
        super()
        this.node = variableDeclaration;
        this.program = program;
        this.transformedToBox = false;
        this.context = context;


        if(this.node.initializer){
            const modifiedNode = visitNode(this.node.initializer , this.program, this.context );
            if(modifiedNode ){
                this.initializerExpression = modifiedNode as ts.Expression
            }
        }else{
            this.initializerExpression = factory.createIdentifier("undefined")
        }

        this.type = this.node.type?.kind;
        this.name = this.node.name as ts.Identifier;

    }



    getBoxForDeclaration(): ts.VariableDeclaration | undefined {
        if (!this.transformedToBox && (this.initializerExpression || (isPrimitive(this.node)))) {
            this.transformedToBox = true;
            TransformedObservables.set(this.node, this)
            return factory.createVariableDeclaration(this.name, undefined, undefined, this.getExpression());
        }
    }

    getBoxForBinary(node: ts.BinaryExpression) {
        if (isPrimitive(node.right)) {
            const identifier = node.left;
            if (ts.isIdentifier(identifier)) {
                const symbol = getSymbol(identifier);
                if (symbol) {
                    const valueDeclaration = symbol.valueDeclaration;
                    if (ts.isVariableDeclaration(valueDeclaration)) {
                        if (valueDeclaration === this.node) {
                            if (node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
                                if (this.transformedToBox) {
                                    return factory.createCallExpression(
                                        factory.createPropertyAccessExpression(
                                            this.name,
                                            factory.createIdentifier("set")
                                        ),
                                        undefined,
                                        [node.right]
                                    )
                                } else {

                                    this.transformedToBox = true;
                                    return factory.createBinaryExpression(
                                        this.name,
                                        factory.createToken(ts.SyntaxKind.EqualsToken),
                                        this.getExpression(node.right))
                                }
                            }
                        }
                    }
                }
            }
        }
    }


    getForIdentifier() {
        if (this.transformedToBox) {
            return factory.createCallExpression(
                factory.createPropertyAccessExpression(
                    this.name,
                    factory.createIdentifier("get")
                ),
                undefined,
                []
            )
        }
    }


    private getExpression(value?: ts.Expression) {
        if (!value) {
            value = this.initializerExpression
        }
        return factory.createCallExpression(
            factory.createPropertyAccessExpression(
                factory.createIdentifier("observable"),
                factory.createIdentifier("box")
            ),
            undefined,
            [value]
        )
    }
}
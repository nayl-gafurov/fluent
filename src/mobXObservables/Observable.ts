import ts from "typescript";



export abstract class Observable{
    abstract getBoxForDeclaration():ts.VariableDeclaration| undefined;
    abstract getBoxForBinary(node: ts.BinaryExpression): ts.BinaryExpression | ts.CallExpression | undefined;
    abstract getForIdentifier(node: ts.Identifier): ts.CallExpression | undefined;
}
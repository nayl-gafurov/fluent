import ts from 'typescript';
import { App } from './App';


export type Primitive = ts.SyntaxKind.NumberKeyword | ts.SyntaxKind.StringKeyword;
export type PrimitiveLiterals = ts.NumericLiteral | ts.StringLiteral;

export const getType = (node: ts.Node):ts.Type => {
   return  App.program().getTypeChecker().getTypeAtLocation(node);
}


export const isPrimitiveType = (type: ts.Type): boolean => {
    if(type.flags === ts.TypeFlags.Number || type.flags === ts.TypeFlags.String){
        return true;
    }
    if (type.isNumberLiteral() || type.isStringLiteral()) {
        return true;
    }
    if (type.isUnion()) {
        return type.types.every(t => isPrimitiveType(type))
    }
    return false
}


export const getSymbol = (node: ts.Identifier): ts.Symbol | undefined => {
    const checker = App.program().getTypeChecker();
    return checker.getSymbolAtLocation(node);
}

export const getVariableDeclaration = (node: ts.Identifier): ts.VariableDeclaration | undefined => {
    const symbol = getSymbol(node);
    if (symbol) {
        const valueDeclaration = symbol.valueDeclaration
        if (ts.isVariableDeclaration(valueDeclaration))
            return valueDeclaration;
    }
}



export const isPrimitive = (node: ts.VariableDeclaration | ts.Expression | PrimitiveLiterals | ts.TypeNode): node is PrimitiveLiterals => {
    if (ts.isVariableDeclaration(node)) {
        if (node.initializer) {
            return isPrimitive(node.initializer);
        }
        if (node.type) {
            return isPrimitive(node.type);
        }
    } else if (ts.isBinaryExpression(node)) {
        return isPrimitive(node.right);
    } else if (ts.isIdentifier(node)) {
        const symbol = getSymbol(node);
        if (symbol) {
            const valueDeclaration = symbol.valueDeclaration
            if (ts.isVariableDeclaration(valueDeclaration))
                return isPrimitive(valueDeclaration)
        }
    }else{
        return isPrimitiveType (getType(node))
    }
    return false
}
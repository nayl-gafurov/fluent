import ts, { isVariableDeclaration } from 'typescript';

export type Primitive = ts.SyntaxKind.NumberKeyword | ts.SyntaxKind.StringKeyword;
export type PrimitiveLiterals = ts.NumericLiteral | ts.StringLiteral;

export const isPrimitiveLiterals = (node: ts.Node): node is PrimitiveLiterals => {
    return (ts.isNumericLiteral(node) || ts.isStringLiteral(node))
}

export const isPrimitiveType = (type: ts.Type): boolean => {
    if (type.isNumberLiteral() || type.isStringLiteral()) {
        return true;
    }
    if (type.isUnion()) {
        return type.types.every(t => isPrimitiveType(type))
    }
    return false
}

export const isPrimitiveTypeNode = (node: ts.TypeNode, program: ts.Program): boolean => {
    const checker = program.getTypeChecker();
    const type = checker.getTypeAtLocation(node);
    return isPrimitiveType(type);
}


export const getSymbol = (node: ts.Identifier, program: ts.Program): ts.Symbol | undefined => {
    const checker = program.getTypeChecker();
    return checker.getSymbolAtLocation(node);
}

export const getValueDeclaration = (node: ts.Identifier, program: ts.Program): ts.VariableDeclaration | undefined => {
    const symbol = getSymbol(node, program);
    if (symbol) {
        const valueDeclaration = symbol.valueDeclaration
        if (ts.isVariableDeclaration(valueDeclaration))
            return valueDeclaration;
    }
}


// export const isPrimitive2 = (obj: ts.SyntaxKind | ts.VariableDeclaration): obj is Primitive => {

//     if (typeof (obj) !== "number") {
//         if (obj.initializer) {
//             // if(ts.isNumericLiteral(obj.initializer))
//             const result = isPrimitive(obj.initializer.kind);
//             if (result) {
//                 return true
//             }
//         }
//         if (obj.type) {
//             const result = isPrimitive(obj.type);
//             if (result) {
//                 return true
//             }
//         }

//     } else if (obj === ts.SyntaxKind.NumberKeyword || obj === ts.SyntaxKind.StringKeyword ||
//         obj === ts.SyntaxKind.NumericLiteral || obj === ts.SyntaxKind.StringLiteral) {
//         return true
//     }
//     return false
// }



export const isPrimitive = (node: ts.VariableDeclaration | ts.Expression | PrimitiveLiterals | ts.TypeNode, program: ts.Program): node is PrimitiveLiterals => {
    if (ts.isVariableDeclaration(node)) {
        if (node.initializer) {
            return isPrimitive(node.initializer, program);
        }
        if (node.type) {
            return isPrimitive(node.type, program);
        }
    } else if (ts.isBinaryExpression(node)) {
        return isPrimitive(node.right, program);
    } else if (isPrimitiveLiterals(node)) {
        return true;
    } else if (ts.isTypeNode(node)) {
        return isPrimitiveTypeNode(node, program);
    } else if (ts.isIdentifier(node)) {
        const symbol = getSymbol(node, program);
        if (symbol) {
            const valueDeclaration = symbol.valueDeclaration
            if (ts.isVariableDeclaration(valueDeclaration))
                return isPrimitive(valueDeclaration, program)
        }

    }
    return false
}
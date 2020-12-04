import ts, { isVariableDeclaration } from 'typescript';
import { VirtualElement } from "./virtualDom/VirtualElement";
import { getSymbol, getValueDeclaration, isPrimitive } from "./utils";
import { Box } from "./mobXObservables/Box";
import { Observable } from './mobXObservables/Observable';


const factory = ts.factory;

export const ObservableVariableDeclarations = new Set<ts.VariableDeclaration>();
export const TransformedObservables = new Map<ts.VariableDeclaration, Observable>();



export default function transformer(program: ts.Program, opt?: { browserEnv?: boolean, equateUndefinedAndNull?: boolean }): ts.TransformerFactory<ts.SourceFile> {

  return (context: ts.TransformationContext) => (file: ts.SourceFile) => {
    findAllObservables(file, program, context);
    return visitNode(file, program, context);
  };
}

export function visitNode(node: ts.SourceFile, program: ts.Program, context: ts.TransformationContext): ts.SourceFile;
export function visitNode(node: ts.Node, program: ts.Program, context: ts.TransformationContext, parent?: VirtualElement): ts.Node | undefined;
export function visitNode(node: ts.Node, program: ts.Program, context: ts.TransformationContext, parent?: VirtualElement): ts.Node | undefined {


  if (ts.isVariableDeclaration(node)) {
    if (isPrimitive(node, program)) {
      if (ObservableVariableDeclarations.has(node)) {
        return new Box(node, program, context).getBoxForDeclaration();
      }
    }
  }

  if (ts.isBinaryExpression(node)) {
    const identifier = node.left;
    if (ts.isIdentifier(identifier)) {
      const symbol = getSymbol(identifier, program);
      if (symbol) {
        const valueDeclaration = symbol.valueDeclaration;
        if (ts.isVariableDeclaration(valueDeclaration)) {
          const obj = TransformedObservables.get(valueDeclaration);
          if (obj) {
            const result = obj.getBoxForBinary(node);
            if (result) {
              return result;
            }
          }
        }
      }
    }
  }

  if (ts.isIdentifier(node)) {
    const valueDeclaration = getValueDeclaration(node, program);
    if (valueDeclaration) {
      const obj = TransformedObservables.get(valueDeclaration);
      if (obj) {
        return obj.getForIdentifier(node);
      }
    }
  }

  

  return ts.visitEachChild(node, childNode => visitNode(childNode, program, context), context);
}







function findAllObservables(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node | undefined {
  if (ts.isJsxElement(node)) {
    return ts.visitEachChild(node, childNode => inspectJSX(childNode, program, context), context);
  }
  return ts.visitEachChild(node, childNode => findAllObservables(childNode, program, context), context);
}

function inspectJSX(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node | undefined {

  if (ts.isIdentifier(node)) {

    const valueDeclaration = getValueDeclaration(node, program);
    if (valueDeclaration) {

      if (valueDeclaration.initializer && ts.isArrowFunction(valueDeclaration.initializer)) {
        inspectJSX(valueDeclaration.initializer, program, context);
      }
      ObservableVariableDeclarations.add(valueDeclaration);
    }
  }
  
  return ts.visitEachChild(node, childNode => inspectJSX(childNode, program, context), context);
}

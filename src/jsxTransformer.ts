import ts, { isVariableDeclaration } from 'typescript';
import { VirtualElement } from "./virtualDom/VirtualElement";
import { VirtualJsxElement } from "./virtualDom/VirtualJsxElement";
import { getSymbol, getVariableDeclaration, isPrimitive } from "./utils";
import { Box } from "./mobXObservables/Box";
import { Observable } from './mobXObservables/Observable';
import { App } from './App'

const factory = ts.factory;

export const DomElements = new Set<VirtualElement>();
export const ObservableVariableDeclarations = new Set<ts.VariableDeclaration>();
export const TransformedObservables = new Map<ts.VariableDeclaration, Observable>();
const FunctionDeclarations = new Set<ts.VariableDeclaration>();



export default function transformer(program: ts.Program, opt?: { browserEnv?: boolean, equateUndefinedAndNull?: boolean }): ts.TransformerFactory<ts.SourceFile> {

  return (context: ts.TransformationContext) => (file: ts.SourceFile) => {
    App.Instance().init(program, context);
    findAllObservables(file, program, context);
    console.log("1", )
    FunctionDeclarations.forEach((v1) => console.log(v1.name.getText()))
    console.log("2", )
    ObservableVariableDeclarations.forEach((v1) => console.log(v1.name.getText()))

    // inspectJSX(file, program, context);
    return visitNode(file, program, context);
  };
}

export function visitNode(node: ts.SourceFile, program: ts.Program, context: ts.TransformationContext): ts.SourceFile;
export function visitNode(node: ts.Node, program: ts.Program, context: ts.TransformationContext, parent?: VirtualElement): ts.Node | undefined;
export function visitNode(node: ts.Node, program: ts.Program, context: ts.TransformationContext, parent?: VirtualElement): ts.Node | undefined {


  if (ts.isVariableDeclaration(node)) {
    if (isPrimitive(node)) {
      if (ObservableVariableDeclarations.has(node)) {
        return new Box(node, program, context).getBoxForDeclaration();
      }
    }
  }

  if (ts.isBinaryExpression(node)) {
    const identifier = node.left;
    if (ts.isIdentifier(identifier)) {
      const symbol = getSymbol(identifier);
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
    const valueDeclaration = getVariableDeclaration(node);
    if (valueDeclaration) {
      const obj = TransformedObservables.get(valueDeclaration);
      if (obj) {
        return obj.getForIdentifier(node);
      }
    }
  }

  if(ts.isExpressionStatement(node) ){
    if(ts.isJsxElement(node.expression)){
      const ve = new VirtualJsxElement(node.expression);
      return ve.getCode()
    }
   
  }



  return ts.visitEachChild(node, childNode => visitNode(childNode, program, context), context);
}



function findAllObservables(node: ts.Node, program: ts.Program, context: ts.TransformationContext) {

  const inspectJSX = (node: ts.Node, program: ts.Program, context: ts.TransformationContext) => {
    if (ts.isIdentifier(node)) {
      const valueDeclaration = getVariableDeclaration(node);
      if (valueDeclaration) {
        if (!isPrimitive(valueDeclaration)) {
          FunctionDeclarations.add(valueDeclaration)
        } else {
          ObservableVariableDeclarations.add(valueDeclaration);
        }
      }
    }
    node.getChildren().forEach(child => inspectJSX(child, program, context))
  }

  if (ts.isJsxElement(node)) {
    node.getChildren().forEach(child => inspectJSX(child, program, context))
  } else {
    node.getChildren().forEach(child => findAllObservables(child, program, context))
  }

}


export function isReferToVariableDeclaration(node: ts.Node): boolean {
  if (ts.isIdentifier(node) && getVariableDeclaration(node)) {
    return true
  }
  return false
}

export function isNodeContainsVariableDeclaration(node: ts.Node): boolean {
  const result = isReferToVariableDeclaration(node);
  if (result) {
    return true;
  } else {
    const children = node.getChildren()
    if (children) {
      return children.some(child => isNodeContainsVariableDeclaration(child))
    }
    return false;
  }
}
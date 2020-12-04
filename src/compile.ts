import ts from 'typescript';
import transformer from './jsxTransformer';

export default function compile(
  filePaths: string[],
  target = ts.ScriptTarget.ES2019,
  opt?: { browserEnv?: boolean, equateUndefinedAndNull?: boolean },
  writeFileCallback?: ts.WriteFileCallback) {

  const program = ts.createProgram(filePaths, {
    strict: false,
    jsx: 1,
    noEmitOnError: true,
    suppressImplicitAnyIndexErrors: true,
    esModuleInterop: true,
    target
  });
  const transformers: ts.CustomTransformers = {
    before: [transformer(program, opt)],
    after: []
  };
  const { emitSkipped, diagnostics } = program.emit(undefined, writeFileCallback, undefined, false, transformers);

  if (emitSkipped) {
    throw new Error(diagnostics.map(diagnostic => diagnostic.messageText).join('\n'));
  }
}

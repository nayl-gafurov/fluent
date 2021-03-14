import ts from "typescript";



export class App {

    static Instance() {
        return this.instance || (this.instance = new App());
    }

    static program() {
        return this.Instance().program;
    }

    static context() {
        return this.Instance().context;
    }


    private static instance: App;
    private program: ts.Program;
    private context: ts.TransformationContext;

    private constructor() {
    }

    init(program: ts.Program, context: ts.TransformationContext) {
        if (!this.program && !this.context) {
            this.program = program;
            this.context = context;
        }
    }
}
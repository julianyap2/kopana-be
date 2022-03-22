const { readFileSync } = require('fs-extra');
const { basename } = require('path');
const ts = require('typescript');

require.extensions['.ts'] = function (mod, filename) {
    ;
    const { outputText: code } = ts.transpileModule(readFileSync(filename, 'utf8'), {
        compilerOptions: {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.CommonJS,
            declaration: false,
            sourceMap: false,
            allowJs: true,
            strictBindCallApply: true,
            strictNullChecks: true,
        },
        fileName: basename(filename),
        moduleName: filename,
    });

    return mod._compile(code, filename);
}
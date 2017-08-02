import path from 'path'
import fs from 'fs'
import config from './config'
import logger from 'jdf-log'
import cheerio from 'cheerio'
// import acorn from 'acorn'
// import walk from 'acorn/dist/walk'
// import escodegen from 'escodegen'
const acorn = require('acorn')
const walk = require('acorn/dist/walk')
const escodegen = require('escodegen')

export default function () {
    let VFS = config.VFS,
        jdf = config.jdf
    
    
    let widgetDir = path.resolve(VFS.originDir, jdf.config.widgetDir);

    let widgets = fs.readdirSync(widgetDir);

    widgets.forEach(widgetname => {
        let widgetVfiles = VFS.queryDir(path.resolve(widgetDir, widgetname))
        let vmcontent = ''
        let jscontent = ''
        let vmVfile, jsVfile
        widgetVfiles.forEach(vfile => {
            let widgetReg = new RegExp(widgetname + '\.')
            // 文件名和widget文件夹名一致
            if (widgetReg.exec(path.basename(vfile.originPath))) {
                if (path.extname(vfile.originPath) === '.vm' ||
                    path.extname(vfile.originPath) === '.tpl' ||
                    path.extname(vfile.originPath) === '.smarty') {
                    vmcontent = vfile.originContent
                    vmVfile = vfile
                }
                if (path.extname(vfile.targetPath) === '.js') {
                    jscontent = vfile.originContent
                    jsVfile = vfile
                }
            }
        })
        // TODO jsAST 挪动
        let $ = cheerio.load(vmcontent)
        let templates = $(`script[${config.prefix}]`)
        if (templates.length === 0) {
            return
        }
        
        const ast = acorn.parse(jscontent, {
            sourceType: 'script'
        });
        walk.simple(ast, {
            VariableDeclaration: replaceTemplate(templates, $),
        });

        // 干掉所有页面中的template
        templates.remove()

        jsVfile.targetContent = escodegen.generate(ast)
    })
}

function replaceTemplate(templates, $) {
    return function (node) {
        let reg = new RegExp('\\[' + config.prefix + '.*?\\]')

        let rightExpression = node.declarations[0].init
        if (rightExpression &&
            rightExpression.type === 'CallExpression' &&
            rightExpression.arguments.length === 0 &&
            rightExpression.callee.property &&
            rightExpression.callee.property.name === 'html' &&
            rightExpression.callee.object &&
            rightExpression.callee.object.callee &&
            (rightExpression.callee.object.callee.name === '$' || rightExpression.callee.object.callee.name === 'jQuery') &&
            rightExpression.callee.object.arguments[0] &&
            reg.test(rightExpression.callee.object.arguments[0].value || '')
        ) {
            templates.each((index, item) => {
                if ($(rightExpression.callee.object.arguments[0].value).attr(config.prefix) === $(item).attr(config.prefix)) {
                    node.declarations[0].init = {
                        type: 'Literal',
                        value: $(item).html()
                    }
                }
            })
        }
    }
}
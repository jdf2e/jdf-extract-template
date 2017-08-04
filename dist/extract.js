'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    var VFS = _config2.default.VFS,
        jdf = _config2.default.jdf;

    var widgetDir = _path2.default.resolve(VFS.originDir, jdf.config.widgetDir);

    var widgets = _fs2.default.readdirSync(widgetDir);

    widgets.forEach(function (widgetname) {
        var widgetVfiles = VFS.queryDir(_path2.default.resolve(widgetDir, widgetname));
        var vmcontent = '';
        var jscontent = '';
        var vmVfile = void 0,
            jsVfile = void 0;
        widgetVfiles.forEach(function (vfile) {
            var widgetReg = new RegExp(widgetname + '\.');
            // 文件名和widget文件夹名一致
            if (widgetReg.exec(_path2.default.basename(vfile.originPath))) {
                if (_path2.default.extname(vfile.originPath) === '.vm' || _path2.default.extname(vfile.originPath) === '.tpl' || _path2.default.extname(vfile.originPath) === '.smarty') {
                    vmcontent = vfile.originContent;
                    vmVfile = vfile;
                }
                if (_path2.default.extname(vfile.targetPath) === '.js') {
                    jscontent = vfile.originContent;
                    jsVfile = vfile;
                }
            }
        });
        // TODO jsAST 挪动
        var $ = _cheerio2.default.load(vmcontent);
        var templates = $('script[' + _config2.default.prefix + ']');
        if (templates.length === 0) {
            return;
        }

        var ast = acorn.parse(jscontent, {
            sourceType: 'script'
        });
        walk.simple(ast, {
            VariableDeclaration: replaceTemplate(templates, $)
        });

        // 干掉模板里的template(输出为楼层模板)，增加template到js文件
        templates.remove();
        vmVfile.targetContent = $.html();
        jsVfile.targetContent = escodegen.generate(ast);
    });

    // 干掉所有页面中的template
    var htmlDir = _path2.default.resolve(VFS.originDir, jdf.config.htmlDir);

    var htmls = _fs2.default.readdirSync(htmlDir);
    htmls.forEach(function (htmlname) {
        if (_path2.default.extname(htmlname) === '.html') {
            var fullpath = _path2.default.resolve(htmlDir, htmlname);
            var htmlVfile = VFS.queryFile(fullpath);
            var $ = _cheerio2.default.load(htmlVfile.targetContent);
            $('script[' + _config2.default.prefix + ']').remove();
            htmlVfile.targetContent = $.html();
        }
    });
};

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _jdfLog = require('jdf-log');

var _jdfLog2 = _interopRequireDefault(_jdfLog);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import acorn from 'acorn'
// import walk from 'acorn/dist/walk'
// import escodegen from 'escodegen'
var acorn = require('acorn');
var walk = require('acorn/dist/walk');
var escodegen = require('escodegen');

function replaceTemplate(templates, $) {
    return function (node) {
        // 匹配 $(***).html() 
        // template 由prefix获取，最后$(***).html() 对比也是对比prefix属性是否一致
        var rightExpression = node.declarations[0].init;
        if (rightExpression && rightExpression.type === 'CallExpression' && rightExpression.arguments.length === 0 && rightExpression.callee.property && rightExpression.callee.property.name === 'html' && rightExpression.callee.object && rightExpression.callee.object.callee && (rightExpression.callee.object.callee.name === '$' || rightExpression.callee.object.callee.name === 'jQuery') && rightExpression.callee.object.arguments[0]) {
            templates.each(function (index, item) {
                if ($(rightExpression.callee.object.arguments[0].value).attr(_config2.default.prefix) === $(item).attr(_config2.default.prefix)) {
                    node.declarations[0].init = {
                        type: 'Literal',
                        value: $(item).html()
                    };
                }
            });
        }
    };
}
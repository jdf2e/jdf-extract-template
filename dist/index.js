'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Plugin = undefined;

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _extract = require('./extract');

var _extract2 = _interopRequireDefault(_extract);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Plugin = exports.Plugin = function Plugin() {
    return {
        setConfig: function setConfig(option) {
            Object.assign(_config2.default, option || {});

            if (_config2.default.pluginConfig) {
                _config2.default.prefix = _config2.default.pluginConfig.prefix || _config2.default.prefix;
            }
        },

        beforeBuild: function beforeBuild() {},

        afterBuild: function afterBuild() {
            (0, _extract2.default)();
        },

        beforeTplRender: function beforeTplRender(tpl, widgetInfo) {
            return tpl;
        },

        beforeTplInsert: function beforeTplInsert(tpl, widgetInfo) {
            return tpl;
        }
    };
};
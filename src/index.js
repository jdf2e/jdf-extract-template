import config from './config'
import extract from './extract'

export const Plugin = function () {
    return {
        setConfig: function (option) {
            Object.assign(config, option || {})
        },

        beforeBuild: function () {
        },

        afterBuild: function () {
            extract()
        },

        beforeTplRender: function (tpl, widgetInfo) {
            return tpl
        },

        beforeTplInsert: function (tpl, widgetInfo) {
            return tpl
        }
    }
    
}
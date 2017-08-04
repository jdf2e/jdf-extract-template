import config from './config'
import extract from './extract'

export const Plugin = function () {
    return {
        setConfig: function (option) {
            Object.assign(config, option || {})
            
            if (config.pluginConfig) {
                config.prefix = config.pluginConfig.prefix || config.prefix
            }
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
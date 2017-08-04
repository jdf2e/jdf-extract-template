# jdf抽取插件
将html中的前端模板抽取到js中

## 注意点
默认抽取带有`ext-id`属性的script标签，可以在`config.json`中设置`prefix`属性来改变它。

`prefix`指的是模板script标签的一个属性
```
{
    "name": "jdf-extract-template",
    "prefix": "channel-id"
}
```

在js中，目前只支持jQuery调用，形如：`var tpl = $(selector).html()`

`selector`不能是变量!~~

```js
$('#id').html()
$('.class').html()
$('[]').html()
$(selector).html()
```
## 示例
```html
<div id="renderPlace">
    <script type="text/template" ext-id="12" id="floorTpl">
        <span>我是模板:${floor_id}</span>
    </script>
</div>
```
```js
define(function () {
    require('module1');
    var tpl = $("#floorTpl").html();
    var data = {
        floor_id: 1
    }
    $('#renderPlace').html(render(tpl, data))
})
```
经过插件编译后
```html
<div id="renderPlace">
</div>
```
```js
define(function () {
    require('module1');
    var tpl = '<span>我是模板:${floor_id}</span>';
    var data = {
        floor_id: 1
    }
    $('#renderPlace').html(render(tpl, data))
})
```
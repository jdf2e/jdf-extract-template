# jdf抽取插件
将html中的前端模板抽取到js中

## 注意点
模板命名用`ext-id`

在js中，目前只支持jQuery调用，如`var tpl = $([ext-id=floorTpl]).html()`

```html
<div id="renderPlace">
    <script type="text/template" ext-id="floorTpl">
        <span>我是模板:${floor_id}</span>
    </script>
</div>
```
```js
define(function () {
    require('module1');
    var tpl = $([ext-id=floorTpl]).html();
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
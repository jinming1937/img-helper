## IMG-Helper

给墨水屏快速裁图

### 使用

直接使用浏览器打开index.html

1. 可以拖放、截图ctrl+v上传图片
2. 缩放画布
3. 旋转画布
4. 选择想要的尺寸
5. 下载，文件名为 img-AAAxBBB-1766242297483.png

###　支持添加更多尺寸

在index.html里，照着已经有的option格式添加

```html
<select id="select_size" value="" class="def_size">
    <option value="0">请选择截图尺寸...</option>
    <option value="250x122">250x122</option>
    <option value="122x250">122x250</option>
    <option value="296x128">296x128</option>
    <option value="128x296">128x296</option>
    <!-- <option value="300x400">300x400</option> -->
    <option value="400x300">400x300</option>
    <option value="640x384">640x384</option>
    <!-- 这里可以添加更多尺寸... -->
</select>
```
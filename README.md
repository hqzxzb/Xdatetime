# Xdatetime
移动版页面日期插件（jQuery/JSLite插件支持）

针对移动端Web页面开发的日期插件，采用上下滚动的方式进行日期选择。

## 框架依赖：

jQuery/JSLite/其他jQuery语法框架

IScroll5 &nbsp;&nbsp;(iscroll-lite.js)

## 使用方法：

最简用法：

    $(".xdatetime").xdatetime();

带参数用法：

    $(".xdatetime").xdatetime({
			startDate : "2015-09-13", // 起始日期YYYY-MM-DD
			endDate : "2015-11-25", // 截止日期YYYY-MM-DD
			snapSpeed : 300,// 定位固定高度选项速度，越小越快（毫秒）
			event : "click", // 打开控件方式，"click"：点击打开
			Ycallback : function() {
			},// 确定按钮回调参数
			Ncallback : function() {
			}// 取消按钮回调参数
		});

参数说明：

**startDate**：起始日期

**endDate**：截止日期

**snapSpeed**：定位到一格的速度（不建议设置）

**event**：触发事件，例如"click"

**Ycallback**：点击“确定”按钮回调方法

**Ncallback**：点击“取消”按钮回调方法

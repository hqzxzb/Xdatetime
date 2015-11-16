(function($) {
	$.fn.xdatetime = function(options) {
		// 设定默认参数
		$.fn.xdatetime.defaultOptions = {
			startDate : "1990-01-01", // 起始日期YYYY-MM-DD
			endDate : "2020-12-31", // 截止日期YYYY-MM-DD
			startTime : "00:00:00", // 起始时间HH:MM:SS
			endTime : "23:59:59", // 截止时间HH:MM:SS
			now : true, // 打开后是否初始化到当前时间
			type : "datetime", // 显示类型，"date"：日期 "datetime":日期+时间 "time":时间
			event : "click", // 打开控件方式，"click"：点击打开
			Ycallback : undefined,// 确定按钮回调参数
			Ncallback : undefined
		// 取消按钮回调参数
		};
		// 使用用户设定选项覆盖默认值
		var opts = $.extend(true, {}, $.fn.xdatetime.defaultOptions, options);

		// 设定初始化参数
		var thisObj = $(this);// 获取当前元素JQuery对象
		var startDateTime = new Date((opts.startDate + " " + opts.startTime)
				.replace(/-/g, "/"));// 获取开始日期时间
		var endDateTime = new Date((opts.endDate + " " + opts.endTime).replace(
				/-/g, "/"));// 获取截止日期时间
		var yearScroll = null, monthScroll = null, dayScroll = null;// 年月日滚动对象
		var hourScroll = null, minuteScroll = null, secondScroll = null;// 时分秒滚动对象
		var indexY = 2, indexM = 2, indexD = 2;// 年月日滚动坐标
		var indexH = 2, indexI = 2, indexS = 2;// 时分秒滚动坐标
		var liHeight = 30;// LI选项高度，px

		var blankLiNum = 2;// 滚动列表前后填充空白LI数量

		// 选中的日期时间字符串：yyyy-MM-dd HH:mm:ss，yyyy-MM-dd，HH:mm:ss
		var selectedStr = "";

		var docType = $(this).is('input');// 标签类型

		// 绑定日期时间控件触发方法
		thisObj.on(opts.event, function() {
			initParams();// 初始化控件变量参数
			createDOM();// 动态生成控件元素
			initIScroll();// 初始化选项滚动
			showXDateTime();// 显示控件
			refreshDateTime();// 刷新控件滚动
			onButton();// 初始化按钮事件

			updateTitle();// 更新日期时间显示
		});

		// 每次启动控件前初始化所有变量参数
		function initParams() {
			selectedStr = "";// 选中的日期时间字符串：yyyy-MM-dd
			indexY = 2, indexM = 2, indexD = 2;// 年月日滚动坐标
			indexH = 2, indexI = 2, indexS = 2;// 时分秒滚动坐标
		}

		// 动态生成控件元素
		function createDOM() {
			createXDateTimeUI();// 生成日期时间控件主框架
			switch (opts.type) {
			case "datetime":
				createYearDOM();
				createMonthDOM();
				createDayDOM();
				createHourDOM();
				createMinuteDOM();
				createSecondDOM();
				break;
			case "time":
				createHourDOM();
				createMinuteDOM();
				createSecondDOM();
				break;
			case "date":
			default:
				createYearDOM();
				createMonthDOM();
				createDayDOM();
				break;
			}
		}

		// 生成日期时间控件主框架
		function createXDateTimeUI() {
			var html = "";
			html = '<div class="XDateTime">'
					+ '<div class="xdatetimeShadow"></div>'
					+ '<div class="xdatetimePage">'
					+ '<div class="xdatetimeTitle">请选择日期</div>'
					+ '<div class="xdatetimeDateScroll">'
					+ '<div class="wrapper yearWrapper">' + '<ul></ul>'
					+ '<div class="mark yearMark"></div>'
					+ '<div class="wrapperBg"></div>' + '</div>'
					+ '<div class="wrapper monthWrapper">' + '<ul></ul>'
					+ '<div class="mark monthMark"></div>'
					+ '<div class="wrapperBg"></div>' + '</div>'
					+ '<div class="wrapper dayWrapper">' + '<ul></ul>'
					+ '<div class="mark dayMark"></div>'
					+ '<div class="wrapperBg"></div>' + '</div>' + '</div>'
					+ '<div class="xdatetimeTimeScroll">'
					+ '<div class="wrapper hourWrapper">' + '<ul></ul>'
					+ '<div class="mark hourMark"></div>'
					+ '<div class="wrapperBg"></div>' + '</div>'
					+ '<div class="wrapper minuteWrapper">' + '<ul></ul>'
					+ '<div class="mark minuteMark"></div>'
					+ '<div class="wrapperBg"></div>' + '</div>'
					+ '<div class="wrapper secondWrapper">' + '<ul></ul>'
					+ '<div class="mark secondMark"></div>'
					+ '<div class="wrapperBg"></div>' + '</div>' + '</div>'
					+ '<div class="xdatetimeFooter">'
					+ '<div class="xdatetimeBtn xdatetimeConfirm">'
					+ '<div>确定</div>' + '</div>'
					+ '<div class="xdatetimeBtn xdatetimeCancle">'
					+ '<div>取消</div>' + '</div>' + '</div>' + '</div>'
					+ '</div>';
			$("body").append(html);// 写入页面
		}

		// 为月日时分秒补零增加到两位数参数值
		function addZeroForValue(num) {
			num += "";
			return num.length < 2 ? "0" + num : num;
		}

		// 生成年份DOM列表
		function createYearDOM() {
			var liHTML = "";
			liHTML += createBlankLiDom(blankLiNum);
			var startYear = startDateTime.getFullYear();
			var endYear = endDateTime.getFullYear();
			for (var i = startYear; i <= endYear; i++) {
				liHTML += '<li data-val="' + addZeroForValue(i) + '">' + i
						+ '年</li>';
			}
			liHTML += createBlankLiDom(blankLiNum);
			$(".yearWrapper ul").html(liHTML);
		}

		// 生成月份DOM列表
		function createMonthDOM() {
			var liHTML = "";
			liHTML += createBlankLiDom(blankLiNum);
			var startMonth = startDateTime.getMonth();
			var endMonth = endDateTime.getMonth();
			for (var i = startMonth; i <= endMonth; i++) {
				liHTML += '<li data-val="' + addZeroForValue(i + 1) + '">'
						+ (i + 1) + '月</li>';
			}
			liHTML += createBlankLiDom(blankLiNum);
			$(".monthWrapper ul").html(liHTML);
		}

		// 生成日DOM列表
		function createDayDOM() {
			var liHTML = "";
			liHTML += createBlankLiDom(blankLiNum);
			var startDay = startDateTime.getDate();
			var endDay = endDateTime.getDate();
			for (var i = startDay; i <= endDay; i++) {
				liHTML += '<li data-val="' + addZeroForValue(i) + '">' + i
						+ '日</li>';
			}
			liHTML += createBlankLiDom(blankLiNum);
			$(".dayWrapper ul").html(liHTML);
		}

		// 生成小时DOM列表
		function createHourDOM() {
			var liHTML = "";
			liHTML += createBlankLiDom(blankLiNum);
			var startHour = startDateTime.getHours();
			var endHour = endDateTime.getHours();
			for (var i = startHour; i <= endHour; i++) {
				liHTML += '<li data-val="' + addZeroForValue(i) + '">' + i
						+ '时</li>';
			}
			liHTML += createBlankLiDom(blankLiNum);
			$(".hourWrapper ul").html(liHTML);
		}

		// 生成分钟DOM列表
		function createMinuteDOM() {
			var liHTML = "";
			liHTML += createBlankLiDom(blankLiNum);
			var startMinute = startDateTime.getMinutes();
			var endMinute = endDateTime.getMinutes();
			for (var i = startMinute; i <= endMinute; i++) {
				liHTML += '<li data-val="' + addZeroForValue(i) + '">' + i
						+ '分</li>';
			}
			liHTML += createBlankLiDom(blankLiNum);
			$(".minuteWrapper ul").html(liHTML);
		}

		// 生成秒DOM列表
		function createSecondDOM() {
			var liHTML = "";
			liHTML += createBlankLiDom(blankLiNum);
			var startSecond = startDateTime.getSeconds();
			var endSecond = endDateTime.getSeconds();
			for (var i = startSecond; i <= endSecond; i++) {
				liHTML += '<li data-val="' + addZeroForValue(i) + '">' + i
						+ '秒</li>';
			}
			liHTML += createBlankLiDom(blankLiNum);
			$(".secondWrapper ul").html(liHTML);
		}

		// 创建空白Li选项，用于填充列表空白区域
		function createBlankLiDom(num) {
			var liHTML = "";
			for (var i = 0; i < num; i++) {
				liHTML += '<li data-val="">&nbsp;</li>';
			}
			return liHTML;
		}

		// 初始化滚动
		function initIScroll() {
			switch (opts.type) {
			case "datetime":
				initDateIScroll();
				initTimeIScroll();
				break;
			case "time":
				initTimeIScroll();
				break;
			case "date":
			default:
				initDateIScroll();
				break;
			}
		}

		// 初始化日期滚动
		function initDateIScroll() {
			// 初始化滚动项-年
			yearScroll = new IScroll(".yearWrapper", {
				snap : "li"
			});
			yearScroll.on("scrollEnd", function() {
				var isLiHeight = Math.abs(this.y % liHeight);
				if (isLiHeight > (liHeight / 2)) {
					this.scrollTo(0, (this.y + isLiHeight - liHeight), 500,
							IScroll.utils.ease.quadratic);
				} else if (isLiHeight <= (liHeight / 2) && isLiHeight > 0) {
					this.scrollTo(0, (this.y + isLiHeight), 500,
							IScroll.utils.ease.quadratic);
				} else {
					indexY = (this.y / liHeight) * (-1) + blankLiNum;
					updateTitle();// 更新日期时间显示
				}
			});

			// 初始化滚动项-月
			monthScroll = new IScroll(".monthWrapper", {
				snap : "li"
			});
			monthScroll.on("scrollEnd", function() {
				indexM = (this.y / liHeight) * (-1) + blankLiNum;
				updateTitle();// 更新日期时间显示
			});

			// 初始化滚动项-日
			dayScroll = new IScroll(".dayWrapper", {
				snap : "li"
			});
			dayScroll.on("scrollEnd", function() {
				indexD = (this.y / liHeight) * (-1) + blankLiNum;
				updateTitle();// 更新日期时间显示
			});
		}

		// 初始化时间滚动
		function initTimeIScroll() {
			// 初始化滚动项-时
			hourScroll = new IScroll(".hourWrapper", {
				snap : "li"
			});
			hourScroll.on("scrollEnd", function() {
				indexH = (this.y / liHeight) * (-1) + blankLiNum;
				updateTitle();// 更新日期时间显示
			});

			// 初始化滚动项-分
			minuteScroll = new IScroll(".minuteWrapper", {
				snap : "li"
			});
			minuteScroll.on("scrollEnd", function() {
				indexI = (this.y / liHeight) * (-1) + blankLiNum;
				updateTitle();// 更新日期时间显示
			});

			// 初始化滚动项-秒
			secondScroll = new IScroll(".secondWrapper", {
				snap : "li"
			});
			secondScroll.on("scrollEnd", function() {
				indexS = (this.y / liHeight) * (-1) + blankLiNum;
				updateTitle();// 更新日期时间显示
			});
		}

		// 更新日期时间
		function updateTitle() {
			/*
			 * var datetimeStr = ""; switch (opts.type) { case "datetime":
			 * datetimeStr += $(".yearWrapper ul li:eq(" + indexY + ")").attr(
			 * "data-val") + "-"; datetimeStr += $(".monthWrapper ul li:eq(" +
			 * indexM + ")") .attr("data-val") + "-"; datetimeStr +=
			 * $(".dayWrapper ul li:eq(" + indexD + ")").attr( "data-val") + " ";
			 * datetimeStr += $(".hourWrapper ul li:eq(" + indexH + ")").attr(
			 * "data-val") + ":"; datetimeStr += $(".minuteWrapper ul li:eq(" +
			 * indexI + ")") .attr("data-val") + ":"; datetimeStr +=
			 * $(".secondWrapper ul li:eq(" + indexS + ")") .attr("data-val");
			 * break; case "time": datetimeStr += $(".hourWrapper ul li:eq(" +
			 * indexH + ")").attr( "data-val") + ":"; datetimeStr +=
			 * $(".minuteWrapper ul li:eq(" + indexI + ")") .attr("data-val") +
			 * ":"; datetimeStr += $(".secondWrapper ul li:eq(" + indexS + ")")
			 * .attr("data-val"); break; case "date": default: datetimeStr +=
			 * $(".yearWrapper ul li:eq(" + indexY + ")").attr( "data-val") +
			 * "-"; datetimeStr += $(".monthWrapper ul li:eq(" + indexM + ")")
			 * .attr("data-val") + "-"; datetimeStr += $(".dayWrapper ul li:eq(" +
			 * indexD + ")").attr( "data-val"); break; }
			 * $(".xdatetimeTitle").html(datetimeStr); selectedStr =
			 * datetimeStr;// 设定选中的日期时间
			 */}

		// 显示控件
		function showXDateTime() {
			switch (opts.type) {
			case "datetime":
				$(".xdatetimeDateScroll").show();
				$(".xdatetimeTimeScroll").show();
				break;
			case "time":
				$(".xdatetimeTimeScroll").show();
				break;
			case "date":
			default:
				$(".xdatetimeDateScroll").show();
				break;
			}
		}

		// 刷新控件滚动
		function refreshDateTime() {
			switch (opts.type) {
			case "datetime":
				yearScroll.refresh();
				monthScroll.refresh();
				dayScroll.refresh();
				hourScroll.refresh();
				minuteScroll.refresh();
				secondScroll.refresh();
				break;
			case "time":
				hourScroll.refresh();
				minuteScroll.refresh();
				secondScroll.refresh();
				break;
			case "date":
			default:
				yearScroll.refresh();
				monthScroll.refresh();
				dayScroll.refresh();
				break;
			}
		}

		// 初始化按钮绑定事件
		function onButton() {
			// 绑定确定按钮事件
			$(".xdatetimeConfirm").unbind("click").on("click", function() {
				if (undefined === opts.Ycallback) {
					$(thisObj).val(selectedStr);
					if (docType) {
						$(thisObj).val(selectedStr);
					} else {
						$(thisObj).html(selectedStr);
					}
				} else {
					opts.Ycallback(selectedStr);
				}
				$(".XDateTime").remove();// 关闭控件
			});

			// 绑定取消按钮事件
			$(".xdatetimeCancle").unbind("click").on("click", function() {
				if (undefined === opts.Ncallback) {
					;
				} else {
					opts.Ncallback();
				}
				$(".XDateTime").remove();// 关闭控件
			});
		}
	};
})($);
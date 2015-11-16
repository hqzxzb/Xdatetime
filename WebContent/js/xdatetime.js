(function($) {
	$.fn.xdatetime = function(options) {
		// 设定默认参数
		$.fn.xdatetime.defaultOptions = {
			startDate : "2015-09-13", // 起始日期YYYY-MM-DD
			endDate : "2015-11-25", // 截止日期YYYY-MM-DD
			// now : true, // 打开后是否初始化到当前日期,
			snapSpeed : 300,// 定位固定高度选项速度，越小越快（毫秒）
			event : "click", // 打开控件方式，"click"：点击打开
			Ycallback : undefined,// 确定按钮回调参数
			Ncallback : undefined
		// 取消按钮回调参数
		};
		// 使用用户设定选项覆盖默认值
		var opts = $.extend(true, {}, $.fn.xdatetime.defaultOptions, options);

		// 设定初始化参数
		var _this = $(this);// 获取当前元素JQuery对象
		var startDateTime = new Date((opts.startDate + " 00:00:00").replace(
				/-/g, "/"));// 获取开始日期时间
		var endDateTime = new Date((opts.endDate + " 23:59:59").replace(/-/g,
				"/"));// 获取截止日期时间
		var startYear = startDateTime.getFullYear(), endYear = endDateTime
				.getFullYear();// 起止年份
		var startMonth = startDateTime.getMonth() + 1, endMonth = endDateTime
				.getMonth() + 1;// 起止月份
		var startDay = startDateTime.getDate(), endDay = endDateTime.getDate();// 起止天

		var yearScroll = null, monthScroll = null, dayScroll = null;// 年月日滚动对象
		var selectY = 0, selectM = 0, selectD = 0;// 选中年月日
		var liHeight = 30;// LI选项高度，px
		var blankLiNum = 2;// 滚动列表前后填充空白LI数量
		// 选中的日期时间字符串：yyyy-MM-dd HH:mm:ss，yyyy-MM-dd，HH:mm:ss
		var selectedStr = "";
		var docType = $(this).is('input');// 标签类型

		// 默认起止月份
		var defaultStartMonth = 1, defaultEndMonth = 12;
		// 默认开始天
		var defaultStartDay = 1;
		// 月份对应天数 2月需要实时计算28/29
		var md = {
			"01" : 31,
			"02" : 0,
			"03" : 31,
			"04" : 30,
			"05" : 31,
			"06" : 30,
			"07" : 31,
			"08" : 31,
			"09" : 30,
			"10" : 31,
			"11" : 30,
			"12" : 31,
		};

		// 起止类型
		/**
		 * 1 - (年相等&&月相等) 2 - (年相等&&月不等) 3 - (年不等&&(月相等||月不等))
		 */
		var seType = (function() {
			if (startYear == endYear && startMonth == endMonth) {
				return 1;
			} else if (startYear == endYear && startMonth != endMonth) {
				return 2;
			} else
				return 3;
		})();

		function februaryDay(year) {
			if ((year % 100 == 0 && year % 400 == 0)
					|| (year % 100 != 0 && year % 4 == 0)) {
				md["02"] = 29;
			} else {
				md["02"] = 28;
			}
		}

		// 绑定日期时间控件触发方法
		_this.on(opts.event, function() {
			initParams();// 初始化控件变量参数
			createDOM();// 动态生成控件元素
			initIScroll();// 初始化选项滚动
			showXDateTime();// 显示控件
			refreshDateTime();// 刷新控件滚动
			onButton();// 初始化按钮事件

			// 设定当前选定日期
			selectY = parseInt($(
					$(".yearWrapper ul li")[(yearScroll.y / liHeight) * (-1)
							+ blankLiNum]).attr("data-val"));
			selectM = parseInt($(
					$(".monthWrapper ul li")[(monthScroll.y / liHeight) * (-1)
							+ blankLiNum]).attr("data-val"));
			selectD = parseInt($(
					$(".dayWrapper ul li")[(dayScroll.y / liHeight) * (-1)
							+ blankLiNum]).attr("data-val"));

			updateTitle();// 更新日期时间显示
		});

		// 每次启动控件前初始化所有变量参数
		function initParams() {
			selectedStr = "";// 选中的日期时间字符串：yyyy-MM-dd
			selectY = 0, selectM = 0, selectD = 0;// 选中年月日
		}

		// 动态生成控件元素
		function createDOM() {
			createXDateTimeUI();// 生成日期时间控件主框架
			// 创建日期DOM
			createWrapperDOM();
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

		// 循环创建选择项
		function createOptionDom(wrapperSelector, type, start, end) {
			var liHTML = "";
			liHTML += createBlankLiDom(blankLiNum);
			switch (type) {
			case "year":
				for (var i = start; i <= end; i++) {
					liHTML += '<li data-val="' + addZeroForValue(i) + '">' + i
							+ '年</li>';
				}
				break;
			case "month":
				for (var i = start; i <= end; i++) {
					liHTML += '<li data-val="' + addZeroForValue(i) + '">' + i
							+ '月</li>';
				}
				break;
			case "day":
				for (var i = start; i <= end; i++) {
					liHTML += '<li data-val="' + addZeroForValue(i) + '">' + i
							+ '日</li>';
				}
				break;
			default:
				break;
			}
			liHTML += createBlankLiDom(blankLiNum);
			$(wrapperSelector + " ul").html(liHTML);
		}

		// 创建年月日DOM
		function createWrapperDOM() {
			switch (seType) {
			case 1:
				createOptionDom(".yearWrapper", "year", startYear, endYear);
				createOptionDom(".monthWrapper", "month", startMonth, endMonth);
				createOptionDom(".dayWrapper", "day", startDay, endDay);
				break;
			case 2:
				createOptionDom(".yearWrapper", "year", startYear, endYear);
				createOptionDom(".monthWrapper", "month", startMonth, endMonth);
				createOptionDom(".dayWrapper", "day", startDay,
						md[addZeroForValue(startMonth)]);
				break;
			case 3:
				createOptionDom(".yearWrapper", "year", startYear, endYear);
				createOptionDom(".monthWrapper", "month", startMonth,
						defaultEndMonth);
				createOptionDom(".dayWrapper", "day", startDay,
						md[addZeroForValue(startMonth)]);
				break;
			default:
				break;
			}
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
			initDateIScroll();
		}

		// 初始化日期滚动
		function initDateIScroll() {
			// 初始化滚动项-年
			yearScroll = new IScroll(".yearWrapper");
			yearScroll.on("scrollEnd", function() {
				var isLiHeight = Math.abs(this.y % liHeight);
				if (isLiHeight > (liHeight / 2)) {
					this.scrollTo(0, (this.y + isLiHeight - liHeight),
							opts.snapSpeed, IScroll.utils.ease.quadratic);
				} else if (isLiHeight <= (liHeight / 2) && isLiHeight > 0) {
					this.scrollTo(0, (this.y + isLiHeight), opts.snapSpeed,
							IScroll.utils.ease.quadratic);
				} else {
					// 获取当前值
					selectY = parseInt($(
							$(".yearWrapper ul li")[(this.y / liHeight) * (-1)
									+ blankLiNum]).attr("data-val"));
					updateDateScroll("Y");// 更新日期选项
					updateTitle();// 更新日期时间显示
				}
			});

			// 初始化滚动项-月
			monthScroll = new IScroll(".monthWrapper");
			monthScroll.on("scrollEnd", function() {
				var isLiHeight = Math.abs(this.y % liHeight);
				if (isLiHeight > (liHeight / 2)) {
					this.scrollTo(0, (this.y + isLiHeight - liHeight),
							opts.snapSpeed, IScroll.utils.ease.quadratic);
				} else if (isLiHeight <= (liHeight / 2) && isLiHeight > 0) {
					this.scrollTo(0, (this.y + isLiHeight), opts.snapSpeed,
							IScroll.utils.ease.quadratic);
				} else {
					// 获取当前值
					selectM = parseInt($(
							$(".monthWrapper ul li")[(this.y / liHeight) * (-1)
									+ blankLiNum]).attr("data-val"));
					updateDateScroll("M");// 更新日期选项
					updateTitle();// 更新日期时间显示
				}
			});

			// 初始化滚动项-日
			dayScroll = new IScroll(".dayWrapper");
			dayScroll.on("scrollEnd", function() {
				var isLiHeight = Math.abs(this.y % liHeight);
				if (isLiHeight > (liHeight / 2)) {
					this.scrollTo(0, (this.y + isLiHeight - liHeight),
							opts.snapSpeed, IScroll.utils.ease.quadratic);
				} else if (isLiHeight <= (liHeight / 2) && isLiHeight > 0) {
					this.scrollTo(0, (this.y + isLiHeight), opts.snapSpeed,
							IScroll.utils.ease.quadratic);
				} else {
					// 获取当前值
					selectD = parseInt($(
							$(".dayWrapper ul li")[(this.y / liHeight) * (-1)
									+ blankLiNum]).attr("data-val"));
					updateTitle();// 更新日期时间显示
				}
			});
		}

		// 更新日期选项 triggerType = Y M D
		function updateDateScroll(triggerType) {
			// 计算二月天数
			februaryDay(selectY);
			// 执行更新
			switch (seType) {
			case 1:
				break;
			case 2:
				if (selectM == startMonth) {
					createOptionDom(".dayWrapper", "day", startDay,
							md[addZeroForValue(startMonth)]);
				} else if (selectM == endMonth) {
					createOptionDom(".dayWrapper", "day", defaultStartDay,
							endDay);
				} else {
					createOptionDom(".dayWrapper", "day", defaultStartDay,
							md[addZeroForValue(selectM)]);
				}
				dayScroll.refresh();
				// 重新获取日
				selectD = parseInt($(
						$(".dayWrapper ul li")[(dayScroll.y / liHeight) * (-1)
								+ blankLiNum]).attr("data-val"));
				break;
			case 3:
				if (selectY == startYear) {
					// 判断刷新月份
					if (triggerType == "Y") {
						createOptionDom(".monthWrapper", "month", startMonth,
								defaultEndMonth);
						monthScroll.refresh();
						// 获取更新后的值
						selectM = parseInt($(
								$(".monthWrapper ul li")[(monthScroll.y / liHeight)
										* (-1) + blankLiNum]).attr("data-val"));
					}
					// 判断属性日
					if (selectM == startMonth) {
						createOptionDom(".dayWrapper", "day", startDay,
								md[addZeroForValue(startMonth)]);
					} else {
						createOptionDom(".dayWrapper", "day", defaultStartDay,
								md[addZeroForValue(selectM)]);
					}
				} else if (selectY == endYear) {
					// 判断刷新月份
					if (triggerType == "Y") {
						createOptionDom(".monthWrapper", "month",
								defaultStartMonth, endMonth);
						monthScroll.refresh();
						// 获取更新后的值
						selectM = parseInt($(
								$(".monthWrapper ul li")[(monthScroll.y / liHeight)
										* (-1) + blankLiNum]).attr("data-val"));
					}
					// 判断属性日
					if (selectM == endMonth) {
						createOptionDom(".dayWrapper", "day", defaultStartDay,
								endDay);
					} else {
						createOptionDom(".dayWrapper", "day", defaultStartDay,
								md[addZeroForValue(selectM)]);
					}
				} else {
					if (triggerType == "Y") {
						// 判断刷新月份
						createOptionDom(".monthWrapper", "month",
								defaultStartMonth, defaultEndMonth);
						monthScroll.refresh();
						// 获取更新后的值
						selectM = parseInt($(
								$(".monthWrapper ul li")[(monthScroll.y / liHeight)
										* (-1) + blankLiNum]).attr("data-val"));
					}
					createOptionDom(".dayWrapper", "day", defaultStartDay,
							md[addZeroForValue(selectM)]);
				}
				dayScroll.refresh();
				// 重新获取日
				selectD = parseInt($(
						$(".dayWrapper ul li")[(dayScroll.y / liHeight) * (-1)
								+ blankLiNum]).attr("data-val"));
				break;
			default:
				break;
			}
		}

		// 更新日期时间
		function updateTitle() {
			var datetimeStr = "";
			datetimeStr = addZeroForValue(selectY) + "-"
					+ addZeroForValue(selectM) + "-" + addZeroForValue(selectD);
			$(".xdatetimeTitle").html(datetimeStr);
			selectedStr = datetimeStr;// 设定选中的日期时间
		}

		// 显示控件
		function showXDateTime() {
			$(".xdatetimeDateScroll").show();
		}

		// 刷新控件滚动
		function refreshDateTime() {
			yearScroll.refresh();
			monthScroll.refresh();
			dayScroll.refresh();
		}

		// 初始化按钮绑定事件
		function onButton() {
			// 绑定确定按钮事件
			$(".xdatetimeConfirm").unbind("click").on("click", function() {
				if (undefined === opts.Ycallback) {
					_this.val(selectedStr);
					if (docType) {
						_this.val(selectedStr);
					} else {
						_this.html(selectedStr);
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
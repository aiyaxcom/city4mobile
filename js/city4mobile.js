/**
 * Created by WaTer on 2016/11/12.
 */

String.prototype.replaceAll = function(s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
}

var Mcity = {};

Mcity._m = {
    /* 选择元素 */
    $: function (arg, context) {
        var tagAll, n, eles = [], i, sub = arg.substring(1);
        context = context || document;
        if (typeof arg == 'string') {
            switch (arg.charAt(0)) {
                case '#':
                    return document.getElementById(sub);
                case '.':
                    if (context.getElementsByClassName)
                        return context.getElementsByClassName(sub);
                    tagAll = Mcity._m.$('*', context);
                    n = tagAll.length;
                    for (i = 0; i < n; i++) {
                        if (tagAll[i].className.indexOf(sub) > -1) // TODO 若查找class为city的元素，也会找到class为citya的元素
                            eles.push(tagAll[i]);
                    }
                    return eles;
                default:
                    return context.getElementsByTagName(arg);
            }
        }
    },

    // 绑定事件
    on: function (node, type, handler) {
        node.addEventListener ? node.addEventListener(type, handler, false) : node.attachEvent('on' + type, handler);
    },

    // 获取事件
    getEvent: function(event) {
        return event || window.event;
    },

    // 获取事件目标
    getTarget: function(event) {
        return event.target || event.srcElement;
    },

    // 获取元素位置
    getPos: function(node) {
        var scrollx = document.documentElement.scrollLeft || document.body.scrollLeft,
            scrollt = document.documentElement.scrollTop || document.body.scrollTop;
        var pos = node.getBoundingClientRect();
        return {
            top: pos.top + scrollt,
            right: pos.right + scrollx,
            bottom: pos.bottom + scrollt,
            left: pos.left + scrollx
        }
    },

    // 添加样式名
    addClass: function(c, node) {
        if(!node)
            return;
        node.className = Mcity._m.hasClass(c, node) ? node.className : node.className + ' ' + c;
    },

    // 移除样式名
    removeClass: function(c, node) {
        var reg = new RegExp("(^|\\s+)" + c + "(\\s+|$)", "g");
        if(!Mcity._m.hasClass(c, node))
            return;
        node.className = reg.test(node.className) ? node.className.replace(reg, '') : node.className;
    },

    // 是否含有CLASS
    hasClass: function(c, node) {
        if(!node || !node.className)
            return false;
        return node.className.indexOf(c) > -1;
    },

    // 阻止冒泡
    stopPropagation: function(event) {
        event = event || window.event;
        event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
    },

    trim: function (str) {
        return str.replace(/^\s+|\s+$/g, '');
    }
};

var hotCities = [ '北京|beijing|bj|90101', '上海|shanghai|sh|90201',
    '重庆|chongqing|cq|90401', '深圳|shenzhen|sz|92003',
    '广州|guangzhou|gz|92001', '杭州|hangzhou|hz|91201', '南京|nanjing|nj|91101',
    '苏州|shuzhou|sz|91102', '天津|tianjin|tj|90301', '成都|chengdu|cd|92301',
    '武汉|wuhan|wh|91801', '济南|jinan|jn|91602', '沈阳|shenyang|sy|90802',
    '大连|dalian|dl|90801', '哈尔滨|haerbin|heb|91001', '长沙|changsha|cs|91901',
    '三亚|sanya|sy|92201', '青岛|qingdao|qd|91601', '厦门|xiamen|xm|91401',
    '西安|xian|xa|92701' ];

/* 正则表达式 筛选中文城市名、拼音、首字母 */
Mcity.regEx = /^([\u4E00-\u9FA5\uf900-\ufa2d]+)\|(\w+)\|(\w)\w*\|(\d+)$/i;
Mcity.regExChiese = /([\u4E00-\u9FA5\uf900-\ufa2d]+)/;

Mcity.initCity = function(allCity) {
    var citys = Mcity.allCity = allCity, match, letter, regEx = Mcity.regEx, reg2 = /^[a-h]$/i, reg3 = /^[i-p]$/i, reg4 = /^[q-z]$/i;
    if(!Mcity.oCity) {
        Mcity.oCity = {
            hot : [],
            letter : []
        };
        for (var i = 0, n = citys.length; i < n; i++) {
            citys[i] = citys[i].replaceAll(" ", "");
            match = regEx.exec(citys[i]);
            if (match == null || match[0] == null || match[1] == null
                || match[2] == null || match[3] == null || match[4] == null) {
                continue;
            }
            letter = match[3].toUpperCase().substring(0, 1);
            if(!Mcity.oCity['letter'][letter]) {
                Mcity.oCity['letter'][letter] = [];
            }
            Mcity.oCity['letter'][letter].push(citys[i]);
        }
        for(var i = 0, n = hotCities.length; i < n; i++) {
            Mcity.oCity['hot'].push(hotCities[i]);
        }
    }
};

// 城市HTML模板
Mcity._template = ['<header>',
        '<div class="header-wrap pos-fixed">',
        '<div class="header-left">',
        '<i class="header-icon iconfont icon-return"></i>',
        '</div>',
        '<div class="header-tit header-search iconfont">',
        '<input type="text" id="search-input" name="search" placeholder="例：北京/beijing/bj">',
        '</div>',
        '</div>',
        '</header>'];

/*
 * 城市控件构造函数 @CitySelector
 */
Mcity.CitySelector = function() {
    this.initialize.apply(this, arguments);
}

Mcity.CitySelector.prototype = {
    constructor : Mcity.CitySelector,

    initialize : function(options) {
        Mcity.initCity(options.allCity);
        if(options.selectCallback)
            this.selectCallback = options.selectCallback;
        this.button = Mcity._m.$('#' + options.button);
        this.cityIdInput = Mcity._m.$('#' + options.cityIdInput);
        this.cityNameArea = Mcity._m.$('#' + options.cityNameArea);
        this.showBtnEvent();
    },

    createWrap : function() {
        var rootDiv = this.rootDiv = document.createElement('div');
        this.rootDiv.setAttribute('class', 'advance-city');
        var that = this;

        // 设置DIV阻止冒泡
        Mcity._m.on(this.rootDiv, 'touchstart', function(event) {
            Mcity._m.stopPropagation(event);
        });

        this.createHeader();
        var pageSelect = this.oPageSelect = document.createElement('div');
        pageSelect.className = 'page-content page-select';
        rootDiv.appendChild(pageSelect);
        this.createHistoryCity();
        this.createHotCity();
        this.createLetterCity();

        var pageSearch = this.oPageSearch = document.createElement('div');
        pageSearch.className = 'page-content page-search';
        pageSearch.style.display = 'none';
        pageSearch.innerHTML = '<ul class="search-message" style="display: none"><li class="no">抱歉，没有帮您找到符合条件的结果</li></ul>';

        var searchResult = this.oSearchResult = document.createElement('ul');
        searchResult.className = 'search-result';
        pageSearch.appendChild(searchResult);
        rootDiv.appendChild(pageSearch);

        document.getElementsByTagName('body')[0].appendChild(rootDiv);

        this.oPageSelect.style.height = (document.body.clientHeight - this.oHeader.offsetHeight) + 'px';
        this.oPageSearch.style.height = this.oPageSelect.style.height;

        this.hideBtnEvent();
        this.switchTabEvent();
        this.touchEvent();
        this.searchInput = Mcity._m.$('#search-input');
        this.searchEvent();
    },

    createHeader : function() {
        var header = this.oHeader = document.createElement('header');
        var headerWrap = document.createElement('div');
        var headerLeft = this.headerLeft = document.createElement('div');
        var headerTitle = document.createElement('div');
        var headerInput = this.headerInput = document.createElement('input');
        headerInput.setAttribute('type', 'text');
        headerInput.setAttribute('id', 'search-input');
        headerInput.setAttribute('name', 'search');
        headerInput.setAttribute('placeholder', '例：北京/beijing/bj');

        headerTitle.className = 'header-tit header-search iconfont';
        headerTitle.appendChild(headerInput);
        headerLeft.className = 'header-left';
        headerLeft.innerHTML = '<i class="header-icon iconfont icon-return"></i>';
        headerWrap.className = 'header-wrap pos-fixed';
        headerWrap.appendChild(headerLeft);
        headerWrap.appendChild(headerTitle);
        header.appendChild(headerWrap);
        this.rootDiv.appendChild(header);
    },

    createHistoryCity : function() {
        // TODO 组装历史选择
    },

    // 组装热门城市
    createHotCity : function() {
        var oCity = Mcity.oCity, oUl, cityInfo, str, cityListDiv;
        var oHotCity = this.oHotCity = document.createElement('div');
        oHotCity.className = 'hot-city';
        oHotCity.innerHTML = '<div class="page-title">热门城市</div>';
        cityListDiv = document.createElement('div');
        cityListDiv.className = 'city-list';
        oUl = ['<ul>'];
        oCity['hot'].sort();
        for (var j = 0, k = oCity['hot'].length; j < k; j++) {
            cityInfo = oCity['hot'][j].split('|');
            str = '<li data-city-id="' + cityInfo[3] + '"><span>' + cityInfo[0] + '</span></li>';
            oUl.push(str);
        }
        oUl.push('</ul>');
        cityListDiv.innerHTML = oUl.join('');
        oHotCity.appendChild(cityListDiv);
        this.oPageSelect.appendChild(oHotCity);
    },

    // 组装字母分类城市
    createLetterCity : function() {
        var oCity = Mcity.oCity.letter, oAllCity, key, cityKey, sortedKey, cityInfo, oLetterList, oCityList, oUl, str;
        oAllCity = document.createElement('div');
        oAllCity.className = 'all-city';
        oAllCity.innerHTML = '<div class="page-title">全部城市</div>';
        oLetterList = this.oLetterList = document.createElement('div');
        oLetterList.className = 'letter-list';
        oUl = ['<ul>'];

        // 添加字母列表
        sortedKey = [];
        for (key in oCity) {
            sortedKey.push(key);
        }
        sortedKey.sort();
        for (var i = 0, j = sortedKey.length; i < j; i++) {
            str = '<li>' + sortedKey[i] + '</li>';
            oUl.push(str);
        }
        oUl.push('</ul>');
        oLetterList.innerHTML = oUl.join('');
        oAllCity.appendChild(oLetterList);

        // 添加城市列表
        oCityList = this.oCityList = document.createElement('div');
        oCityList.className = 'city-list';
        oUl = [];
        for (key in oCity) {
            if(key != 'hot') {
                oUl.push('<ul data-refer="' + key + '" class="city-list-ul" style="display: none">');
                oCity[key].sort();
                for (var i = 0, j = oCity[key].length; i < j; i++) {
                    cityInfo = oCity[key][i].split('|');
                    str = '<li data-city-id="' + cityInfo[3] + '"><span>' + cityInfo[0] + '</span>';
                    oUl.push(str);
                }
                oUl.push('</ul>');
            }
        }
        oCityList.innerHTML = oUl.join('');
        oAllCity.appendChild(oCityList);

        this.oPageSelect.appendChild(oAllCity);
    },

    // 显示按钮绑定事件
    showBtnEvent : function() {
        var that = this;
        Mcity._m.on(this.button, 'click', function(event) {// TODO click 改为 touchend
            event = event || window.event;
            if (!that.rootDiv) {
                that.createWrap();
            }
            that.rootDiv.style.left = 0;

        })
    },

    // 返回按钮绑定事件
    hideBtnEvent : function() {
        var that = this;
        Mcity._m.on(this.headerLeft, 'click', function(event){ // TODO click 改为 touchend
            that.rootDiv.style.left = '100%';
        });
    },

    // 切换字母对应城市
    switchTabEvent : function() {
        var nodes = Mcity._m.$('li', this.oLetterList), that = this;
        for (var i = 0, j = nodes.length; i < j; i++) {
            Mcity._m.on(nodes[i], 'click', function(){// TODO  click 改为 touchend
                for (var k = 0; k < j; k++) {
                    Mcity._m.removeClass('on', nodes[k]);
                }
                Mcity._m.addClass('on', this);
                that.showLetterCity(this.innerHTML);
            });
        }
    },

    // 显示对应字母的城市
    showLetterCity : function(letter) {
        var cityList = Mcity._m.$('ul', this.oCityList);
        for (var k = 0, l = cityList.length; k < l; k++) {
            cityList[k].style.display = 'none';
        }
        for (var k = 0, l = cityList.length; k < l; k++) {
            if(cityList[k].getAttribute('data-refer') == letter) {
                cityList[k].style.display = 'block';
                break;
            }
        }
    },

    // 绑定查询框变化事件
    searchEvent : function() {
        var that = this;
        Mcity._m.on(this.searchInput, 'input', function(){
            var value = Mcity._m.trim(this.value);
            if(value.length > 0)
                that.searchCity(value);
            else {
                that.oPageSelect.style.display = 'block';
                that.oPageSearch.style.display = 'none';
            }
        });
    },

    // 查询匹配
    searchCity : function(keyword) {
        var reg = new RegExp('^' + keyword + '|\\|' + keyword, 'gi'), str;
        var searchResult = [];
        for (var i = 0, n = Mcity.allCity.length; i < n; i++){
            if(reg.test(Mcity.allCity[i])) {
                var match = Mcity.regEx.exec(Mcity.allCity[i]);
                str = '<li data-city-id="' + match[4] + '" data-city-name="' + match[1] + '">' + match[1] + '<span>' + match[2] + '</span></li>';
                searchResult.push(str);
                if(searchResult.length > 10)
                    break;
            }
        }
        this.isEmpty = false;
        this.oPageSelect.style.display = 'none';

        // 如果搜索数据为空
        if(searchResult.length == 0) {
            Mcity._m.$('.search-message', this.oPageSearch)[0].style.display = 'block';
            Mcity._m.$('.search-result', this.oPageSearch)[0].style.display = 'none';
        } else {
            this.oSearchResult.innerHTML = searchResult.join('');
            // 为变化的结果绑定touch事件
            var nodes = Mcity._m.$('li', this.oSearchResult), that = this;
            for (var i = 0, j = nodes.length; i < j; i++) {
                Mcity._m.on(nodes[i], 'click', function(){// TODO touchend
                    that.select(this.getAttribute('data-city-id'), this.getAttribute('data-city-name'));
                    that.oPageSelect.style.display = 'block';
                    that.oPageSearch.style.display = 'none';
                    that.searchInput.value = '';
                })
            }

            Mcity._m.$('.search-result', this.oPageSearch)[0].style.display = 'block';
            Mcity._m.$('.search-message', this.oPageSearch)[0].style.display = 'none';
        }
        this.oPageSearch.style.display = 'block';
    },

    // 绑定城市的点击事件
    touchEvent : function() {
        var hotList = Mcity._m.$('li', this.oHotCity), that = this;
        for (var i = 0, j = hotList.length; i < j; i++) {
            Mcity._m.on(hotList[i], 'click', function(event){ // TODO touchend
                that.select(this.getAttribute('data-city-id'), this.innerHTML);
            });
        }
        var cityList = Mcity._m.$('li', this.oCityList);
        for (var i = 0, j = cityList.length; i < j; i++) {
            Mcity._m.on(cityList[i], 'click', function(){ // TODO touchend
                that.select(this.getAttribute('data-city-id'), this.innerHTML);
            })
        }
    },

    // 执行选择
    select : function(cityId, cityName) {
        var hotList = Mcity._m.$('li', this.oHotCity);
        for(var k = 0, l = hotList.length; k < l; k++) {
            if(hotList[k].getAttribute('data-city-id') == cityId) {
                Mcity._m.addClass('on', hotList[k]);
                continue;
            }
            Mcity._m.removeClass('on', hotList[k]);
        }

        this.cityIdInput.value = cityId;
        this.cityNameArea.innerHTML = cityName;
        if(this.selectCallback)
            this.selectCallback();
        this.rootDiv.style.left = '100%';
    }
}
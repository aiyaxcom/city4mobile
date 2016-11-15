# city4mobile
移动端网页城市选择插件

## 配置说明
```javascript
window.onload = function(){
    var city = new Mcity.CitySelector({
      // 绑定显示的按钮
      button: 'showBtn',
      // 传入的城市数据
      allCity: ['北京|beijing|bj|90101', '上海|shanghai|sh|90201',
        '重庆|chongqing|cq|90401', '深圳|shenzhen|sz|92003',
       '广州|guangzhou|gz|92001', '杭州|hangzhou|hz|91201', '南京|nanjing|nj|91101',
        '苏州|shuzhou|sz|91102', '天津|tianjin|tj|90301', '成都|chengdu|cd|92301',
        '武汉|wuhan|wh|91801', '济南|jinan|jn|91602', '沈阳|shenyang|sy|90802',
        '大连|dalian|dl|90801', '哈尔滨|haerbin|heb|91001', '长沙|changsha|cs|91901',
        '三亚|sanya|sy|92201', '青岛|qingdao|qd|91601', '厦门|xiamen|xm|91401',
        '西安|xian|xa|92701' ],
      // 保存cityId的input的id值
      cityIdInput: 'input',
      // 显示cityName的元素（以innerHTML的属性显示）
      cityNameArea: 'showBtn'
    })
}
```

// 作品搜索、显示、编辑所需通用全局变量和函数
var key_Enter = 13;
var key_Clear = 12;
var key_Delete = 46;
var key_BackSpace = 8;
var category = {'诗':['五言古诗','五言乐府','五言绝句','五言律诗','七言古诗','七言乐府','七言绝句','七言律诗',"其它"],'词':[],'文':[],'曲':[]};
var g_chinese_char=/[\u3400-\u9FFF\uF900-\uFAFF]/;
var g_nonchinese_char=/[^\u3400-\u9FFF\uF900-\uFAFF]/;
var g_nonchinese_all=/[^\u3400-\u9FFF\uF900-\uFAFF]+/g;

var fanjian = "j";               /* 缺省显示简体字 */
var dialect = "aisjying";        /* 缺省发音为迅飞普通话 */
var tts_vendor = "tts_xunfei";   /* 缺省语音合成使用讯飞 */
var tilestyle = "bookmark";      /* 缺省搜索结果以书签形式显示 */
var mark = "none";               /* 缺省不标注拼音和平仄 */
var spinner;
var spinner_target;

var spinner_opts = {
  lines: 9 // The number of lines to draw
, length: 0 // The length of each line
, width: 6 // The line thickness
, radius: 9 // The radius of the inner circle
, scale: 2.75 // Scales overall size of the spinner
, corners: 1.0 // Corner roundness (0..1)
, color: '#FFD700' // #rgb or #rrggbb or array of colors
, opacity: 0.30 // Opacity of the lines
, rotate: 0 // The rotation offset
, direction: 1 // 1: clockwise, -1: counterclockwise
, speed: 1.0 // Rounds per second
, trail: 60 // Afterglow percentage
, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
, zIndex: 2e9 // The z-index (defaults to 2000000000)
, className: 'spinner' // The CSS class to assign to the spinner
, top: '50%' // Top position relative to parent
, left: '50%' // Left position relative to parent
, shadow: false // Whether to render a shadow
, hwaccel: false // Whether to use hardware acceleration
, position: 'absolute' // Element positioning
};

function spinner_start(){
//    console.log("start spinner");
    if ( typeof(spinner_target) == 'undefined') {
        spinner_target = document.getElementById('spinner_container');
    }
//   if ( typeof(spinner) == 'undefined' ) {
        spinner = new Spinner(spinner_opts).spin(spinner_target);
//   } else {
 //       spinner.spin();
//   }
};

function spinner_stop() {
//   console.log("stop spinner");
   if ( typeof(spinner) != 'undefined' ) {
       spinner.stop();
   }
}

/* 通过语音合成朗读诗词 
   js/tts_agent.js 中定义了相关参数和函数，如audio_state/loadedData/start()/stop()/tts_read_work()
   work: string format - name author preface line1 line2 line3 ...
*/
function read_work(work)
{
    if ( audio_state == 0 ) {
    /* 初始状态，如果合成的音频数据已经加载则开始朗读，否则调用相应tts获取音频数据后朗读 */
        if ( loadedData ) {
            start();
        } else {
            tts_read_work(work);
        }
    } else if ( audio_state == 1 ) {
    /* 朗读状态，则暂停朗读 */
        stop();
    } else if ( audio_state == 2 ) {
    /* 暂停状态，则开始朗读 */
        start();
    }
}

/* Not in use yet */
function read_work_v1(work)
{
   var text = work['name'] + " " + work['author'] + " " + work['preface'] + work['lines'].join(' ');
   read_work(text);
}

/* 繁简体切换 */
function toggle_fanjian()
{
    if ( fanjian == "j" ) {
        fanjian = "f"
    } else {
        fanjian = "j"
    }
    localStorage.setItem("FJ", fanjian);
    display_fanjian();
}

/* 根据繁简设置改变页面 */
function display_fanjian()
{
    if (localStorage.getItem("FJ") == null || localStorage.getItem("FJ") == "undefined") { 
        localStorage.setItem("FJ", fanjian); 
    } else {
        fanjian = localStorage.getItem("FJ");
    } 

    if ( fanjian == "j") {
        $('#fj').text('繁');
        $(document.body).t2s();
    } else {
        $('#fj').text('简');
        $(document.body).s2t();
    }
}
/* 切换平仄 */
function toggle_pz()
{
    mark = mark == 'pz'?'none':'pz';
    localStorage.setItem("mark", mark); 
    update_work_detail_body();
}

/* 切换拼音 */
function toggle_pinyin()
{
    mark = mark == 'pinyin'?'none':'pinyin';
    localStorage.setItem("mark", mark); 
    update_work_detail_body();
}

/* 显示标注 */
function get_mark()
{
    if (localStorage.getItem("mark") == null || localStorage.getItem("mark") == "undefined") { 
        localStorage.setItem("mark", 'none'); 
        mark = 'none';
    } else {
        mark = localStorage.getItem("mark");
    } 
}

/* 设置发音 */
function set_dialect(value)
{
    if ( dialect == value ) {
    /* 没有变化，直接返回 */
         return 0;
    }

    dialect = value;
    /* 重置tts变量，以便重新获取音频数据 */
    loadedData = false;
    audio_state = 0;

    if ( localStorage.getItem("tts_vendor") == 'tts_baidu' ) {
        localStorage.setItem("bddialect", value);
    } else {
        localStorage.setItem("xfdialect", value);
    }
}

function set_tile(value)
{
    if ( tilestyle == value ) {
       return 0;
    }
    tilestyle = value;
    localStorage.setItem("tilestyle", tilestyle);
}
/* 设置语音合成服务提供商 */
function set_tts_vendor(value)
{
    if ( tts_vendor == value ) {
        return 0;
    }
    localStorage.setItem("tts_vendor", value);
    tts_vendor = value;
    show_tts_vendor();
    /* 重置tts变量，以便重新获取音频数据 */
    loadedData = false;
    audio_state = 0;
}
/* 显示语音服务提供商对应的tts参数设置页面 */
function show_tts_vendor()
{
    if ( localStorage.getItem("tts_vendor") != null && localStorage.getItem("tts_vendor") != "undefined") {
        tts_vendor = localStorage.getItem("tts_vendor");
    }

    if ( tts_vendor == 'tts_xunfei' ) {
       $('#tts_xunfei').attr('checked', true); 
       $('#tts_xunfei_config').show();
       $('#tts_baidu_config').hide();
    } else if ( tts_vendor == 'tts_baidu' ) {
       $('#tts_baidu').attr('checked', true); 
       $('#tts_xunfei_config').hide();
       $('#tts_baidu_config').show();
    }

    display_dialect();
}

/* 在设置页面显示对应语音服务提供商的tts发音选项 */
function display_dialect()
{
    if (( tts_vendor == "tts_baidu" ) && ( localStorage.getItem("bddialect") == null || localStorage.getItem("bddialect") == "undefined")) {
        localStorage.setItem("bddialect", '0'); 
    } else if (localStorage.getItem("xfdialect") == null || localStorage.getItem("xfdialect") == "undefined") {
        localStorage.setItem("xfdialect", 'aisjying'); 
    }
    dialect = localStorage.getItem("xfdialect");
    var obj="[value='" + dialect + "']";
    $(obj).attr('checked', true);
    dialect = localStorage.getItem("bddialect");
    var obj="[value='bdtts" + dialect + "']";
    $(obj).attr('checked', true);
}

function display_tilestyle()
{
    if ( localStorage.getItem('tilestyle') == null || localStorage.getItem('tilestyle') == 'undefined' || ['bookmark', 'card'].indexOf(localStorage.getItem('tilestyle')) == -1 ) {
        if ( ['bookmark', 'card'].indexOf(tilestyle) == -1 ) {
            tilestyle = 'bookmark';
        } 
        localStorage.setItem('tilestyle', tilestyle);
    } 
    tilestyle = localStorage.getItem('tilestyle');
    var obj = "[value='" + tilestyle + "']";
    $(obj).attr('checked',true);
}

/* 将要搜索的关键字转换为简体*/
function trans_keywords()
{
    s = document.getElementById('sk').value;
    t = $.t2s(s); 
    document.getElementById('sk').value = t;
}

function trans_text(text)
{
    if (localStorage.getItem("FJ") == null || localStorage.getItem("FJ") == "undefined") { 
        localStorage.setItem("FJ", 'j'); 
    } 
    if ( localStorage.getItem("FJ") == 'j' ) {
        result = $.t2s(text);
    } else {
        result = $.s2t(text);
    }
    return result;
}

$(function() {
    $("#workDetail").on("show.bs.modal", function() {
//        console.log("show modal");
        audio_state = 0; // Need initializing audio
        loadedData = false;
    });

    $("#workDetail").on("hide.bs.modal", function() {
//        console.log("hide modal");
        stop(); //Stop play audio - call stop() in tts_demo.js
        audio_state = 0; // Need initializing audio
        $(this).removeData("bs.modal"); // remove content of Modal Dialog
        spinner_stop();
    });

    $(document).ready(function() { 
        get_mark();          //设置标注类型 - 拼音、平仄
        display_fanjian();   //设置繁简，并转换页面 
        display_tilestyle(); //设置搜索结果显示方式: 贴片/书签, 并显示在配置页面 
        show_tts_vendor();   //设置TTS服务商信息，并显示在配置页面
    });
});

pz_dict = {
    "ā": "平",
    "á": "平",
    "ǎ": "仄",
    "à": "仄",
    "ē": "平",
    "é": "平",
    "ě": "仄",
    "è": "仄",
    "ō": "平",
    "ó": "平",
    "ǒ": "仄",
    "ò": "仄",
    "ī": "平",
    "í": "平",
    "ǐ": "仄",
    "ì": "仄",
    "ū": "平",
    "ú": "平",
    "ǔ": "仄",
    "ù": "仄",
    "ü": "平",
    "ǘ": "平",
    "ǚ": "仄",
    "ǜ": "仄",
    "ń": "平",
    "ň": "仄",
    "ǹ": "仄",
    "\u1e3f": "平"
}

// 根据拼音返回韵律
// 平：一、二、轻声
// 仄：三、四声
function getpz(ptext) 
{
    var text = ptext.trim();
    if ( text.length == 0 ) return '';

   for ( i in text ) {
       var c = text[i];
       if ( c in pz_dict ) return pz_dict[c];
   }
   return "平";

}

// 根据作品类型判断是否有平仄
function pzable(category) {
    return (['五言律诗', '五言绝句', '七言律诗', '七言绝句'].indexOf($.t2s(category)) > -1);
}

// 判断对象是否为空
function isblank(obj) {
   var count = 0;
   if ( obj instanceof Array ) {
      obj.forEach(function(item, index) { count += isblank(item); });
   } else if ( typeof(obj) == 'string' ) {
       count += obj.length;
   } else if ( typeof(obj) == 'number' || typeof(obj) == 'boolean' ) {
       count += 1;
   } else if ( typeof(obj) == 'null' || typeof(obj) == 'undefined' ) {
       ;
   } else if ( obj instanceof Object ) {
       count += Object.keys(obj).length;
   }
   return count;
}

// 生成文本显示HTML，如果是多行文本则以指定的字符分隔
function show_text(text, separator) {
    return typeof(text) == 'string' ? text : text.join(separator);
}

// 判断字符是否是中文字符
// 不包括中文标点符号
function is_chinese_char(text) {
   return g_chinese_char.test(text);
}

// 判断字符是否是非中文字符
// 不包括中文标点符号
function is_nonchinese_char(text) {
   return g_nonchinese_char.test(text);
}

// 判断字符串是否包含非中文字符，包括中文标点符号
function has_nonchinese_char(text) {
   return g_nonchinese_char.test(text);
}

// 清除所有非中文字符包括中文标点符号
function remove_nonchinese(text) {
   return text.replace(g_nonchinese_all, '');
}

// 生成显示中文平仄的HTML代码
function gen_pz_html(data) {
    var html = '';
    if ( data.text.length == 0 ) return html;
    var pindex = 0;
    for ( var index in data.text ) {
        if ( is_nonchinese_char(data.text[index]) ) {
            html += ( index == 0 ? "" : (is_nonchinese_char(data.text[index-1]) ? "" : "</ruby>")) + data.text[index] ;
            continue;
        }
        html += ( index == 0 ? "<ruby>" : ( is_nonchinese_char(data.text[index-1]) ? "<ruby>" : "" )) + data.text[index] + mark_pz(pindex, data) + ( index == data.text.length ? "</ruby>":"" );
        pindex += 1;
    }
    return html;
}
// 生成标记单个汉字平仄的HTML代码
function mark_pz(pindex, data) {
    var html = "<rt>";
    html += getpz(data.dan_pinyin[pindex]);
    html += "</rt>";
    return html;
}

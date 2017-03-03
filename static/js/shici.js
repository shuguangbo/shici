var fanjian = "j";               /* 缺省显示简体字 */
var hide_pinyin = true;          /* 缺省不显示拼音 */
var dialect = "aisjying";        /* 缺省发音为迅飞普通话 */
var tts_vendor = "tts_xunfei";   /* 缺省语音合成使用讯飞 */
var tilestyle = "tile_slim";   /* 缺省搜索结果以贴片方式显示 */
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
    console.log("start spinner");
    if ( spinner_target == undefined) {
        spinner_target = document.getElementById('spinner');
    }
//   if ( spinner == undefined ) {
        spinner = new Spinner(spinner_opts).spin(spinner_target);
//   } else {
//        spinner.spin();
//   }
};

function spinner_stop() {
   console.log("stop spinner");
   if ( spinner != undefined ) {
       spinner.stop();
   }
}

/* 通过语音合成朗读诗词 
   js/tts_agent.js 中定义了相关参数和函数，如audio_state/loadedData/start()/stop()/tts_read_poem()
   poem: string format - name author preface line1 line2 line3 ...
*/
function read_poem(poem)
{
    if ( audio_state == 0 ) {
    /* 初始状态，如果合成的音频数据已经加载则开始朗读，否则调用相应tts获取音频数据后朗读 */
        if ( loadedData ) {
            start();
        } else {
            tts_read_poem(poem);
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
function read_poem_v1(poem)
{
   var text = poem['name'] + " " + poem['author'] + " " + poem['preface'] + poem['lines'].join(' ');
   read_poem(text);
}

/* 繁简体切换 */
function toggle_fanjian()
{
    if ( fanjian == "j" ) {
        fanjian = "f"
    } else {
        fanjian = "j"
    }
    $.cookie("FJ", fanjian);
    display_fanjian();
}

/* 根据繁简设置改变页面 */
function display_fanjian()
{
    if ($.cookie("FJ") == null || $.cookie("FJ") == "undefined") { 
        $.cookie("FJ", fanjian); 
    } else {
        fanjian = $.cookie("FJ");
    } 

    if ( fanjian == "j") {
        $('#fj').text('繁');
        $(document.body).t2s();
    } else {
        $('#fj').text('简');
        $(document.body).s2t();
    }
}

/* 切换拼音 */
function toggle_pinyin()
{

    $("rt").toggle(1500);
    if ($.cookie("enablePinyin") == null || $.cookie("enablePinyin") == "undefined") { 
        $.cookie("enablePinyin", 'false'); 
    }
    if ( $.cookie("enablePinyin") == 'false' ) {
        $.cookie("enablePinyin", 'true');
    } else {
        $.cookie("enablePinyin", 'false');
    }
    /* display_pinyin(); */
    update_poem_detail_body();
}

/* 显示拼音 */
function display_pinyin()
{
    if ($.cookie("enablePinyin") == null || $.cookie("enablePinyin") == "undefined") { 
        $.cookie("enablePinyin", 'false'); 
    } 
    if ( $.cookie("enablePinyin") == 'false') {
        $("rt").attr("hidden", "hidden");
    } else {
        $("rt").removeAttr("hidden");
    }
}

/* 设置发音 */
function set_dialect(obj)
{
    if ( dialect == obj.id ) {
    /* 没有变化，直接返回 */
         return 0;
    }

    dialect = obj.id;
    /* 重置tts变量，以便重新获取音频数据 */
    loadedData = false;
    audio_state = 0;

    if ( $.cookie("tts_vendor") == 'tts_baidu' ) {
        $.cookie("bddialect", obj.id);
    } else {
        $.cookie("xfdialect", obj.id);
    }
}

function set_tile(obj)
{
    if ( tilestyle == obj.id ) {
       return 0;
    }
    tilestyle = obj.id;
    $.cookie("tilestyle", obj.id);
    display_search_result();
}
/* 设置语音合成服务提供商 */
function set_tts_vendor(obj)
{
    if ( tts_vendor == obj.id ) {
        return 0;
    }
    $.cookie("tts_vendor", obj.id);
    tts_vendor = obj.id;
    show_tts_vendor();
    /* 重置tts变量，以便重新获取音频数据 */
    loadedData = false;
    audio_state = 0;
}
/* 显示语音服务提供商对应的tts参数设置页面 */
function show_tts_vendor()
{
    if ( $.cookie("tts_vendor") != null && $.cookie("tts_vendor") != "undefined") {
        tts_vendor = $.cookie("tts_vendor");
    }

    if ( tts_vendor == 'tts_xunfei' ) 
    {
       document.getElementById('tts_xunfei').checked = true; 
       $('#tts_xunfei_config').show();
       $('#tts_baidu_config').hide();
    }
    else if ( tts_vendor == 'tts_baidu' ) 
    {
       document.getElementById('tts_baidu').checked = true; 
       $('#tts_xunfei_config').hide();
       $('#tts_baidu_config').show();
    }

    display_dialect();
}

/* 在设置页面显示对应语音服务提供商的tts发音选项 */
function display_dialect()
{
    if (( tts_vendor == "tts_baidu" ) && ( $.cookie("bddialect") == null || $.cookie("bddialect") == "undefined")) {
        $.cookie("bddialect", '0'); 
    } else if ($.cookie("xfdialect") == null || $.cookie("xfdialect") == "undefined") {
        $.cookie("xfdialect", 'aisjying'); 
    }
    dialect = $.cookie("xfdialect");
    if ( dialect == 'aisjying' ) { document.getElementById('aisjying').checked=true; };
    if ( dialect == 'aisxrong' ) { document.getElementById('aisxrong').checked=true ;} ;
    if ( dialect == 'xiaomei' ) { document.getElementById('xiaomei').checked=true ;} ;
    if ( dialect == 'aisxying' ) { document.getElementById('aisxying').checked=true ;} ;
    if ( dialect == 'xiaoqian' ) { document.getElementById('xiaoqian').checked=true ;} ;
    if ( dialect == 'xiaoxin' ) { document.getElementById('xiaoxin').checked=true ;} ;
    if ( dialect == 'xiaowanzi' ) { document.getElementById('xiaowanzi').checked=true ;} ;
    if ( dialect == 'vinn' ) { document.getElementById('vinn').checked=true ;} ;
    if ( dialect == 'aisbabyxu' ) { document.getElementById('aisbabyxu').checked=true ;} ;
    dialect = $.cookie("bddialect");
    if ( dialect == '0' ) { document.getElementById('bdtts0').checked=true;}; 
    if ( dialect == '1' ) { document.getElementById('bdtts1').checked=true;}; 
    if ( dialect == '3' ) { document.getElementById('bdtts3').checked=true;}; 
    if ( dialect == '4' ) { document.getElementById('bdtts4').checked=true;}; 
}

function display_tilestyle()
{
    if ( $.cookie('tilestyle') == null || $.cookie('tilestyle') == 'undefined') {
        if ( ['tile_slim', 'tile_normal'].indexOf(tilestyle) == -1 ) {
            $.cookie('tilestyle', 'tile_slim');
            tilestyle = 'tile_slim';
        } else {
            $.cookie('tilestyle', tilestyle);
        }
    } else {
        tilestyle = $.cookie('tilestyle');
    }
    if ( tilestyle == 'tile_normal') { document.getElementById('tile_normal').checked=true;};
    if ( tilestyle == 'tile_slim') { document.getElementById('tile_slim').checked=true;};
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
    if ($.cookie("FJ") == null || $.cookie("FJ") == "undefined") { 
        $.cookie("FJ", 'j'); 
    } 
    if ( $.cookie("FJ") == 'j' ) {
        result = $.t2s(text);
    } else {
        result = $.s2t(text);
    }
    return result;
}

$(function() {
    $("#poemDetail").on("shown.bs.modal", function() {
        display_pinyin();
        audio_state = 0; // Need initializing audio
        loadedData = false;
    });

    $("#poemDetail").on("hide.bs.modal", function() {
        stop(); //Stop play audio - call stop() in tts_demo.js
        audio_state = 0; // Need initializing audio
        $(this).removeData("bs.modal"); // remove content of Modal Dialog
        spinner_stop();
    });

    $(document).ready(function() { 
        display_fanjian(); 
        display_tilestyle(); 
        show_tts_vendor();
    });
});

// 作品搜索、显示、编辑所需通用全局变量和函数
const key_Enter = 13;
const key_Clear = 12;
const key_Delete = 46;
const key_BackSpace = 8;
const category = {'诗':['五言古诗','五言乐府','五言绝句','五言律诗','七言古诗','七言乐府','七言绝句','七言律诗',"其它"],'词':[],'文':[],'曲':[]};
const g_chinese_char=/[\u3400-\u9FFF\uF900-\uFAFF]/;
const g_nonchinese_char=/[^\u3400-\u9FFF\uF900-\uFAFF]/;
const g_nonchinese_all=/[^\u3400-\u9FFF\uF900-\uFAFF]+/g;

const g_linelen = 30;       // 显示输入允许最大字符数
var spinner;
var spinner_target;

const spinner_opts = {
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
    if ( typeof(spinner_target) === 'undefined') {
        spinner_target = document.getElementById('spinner_container');
    }
    spinner = new Spinner(spinner_opts).spin(spinner_target);
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
   let text = `${work.name} ${work.author} ${work.preface} ${work.lines.join(' ')}`;
   read_work(text);
}

/* 繁简体切换 */
function toggle_fanjian()
{
    let fanjian = localStorage.getItem('FJ');
    if ( fanjian === null ) {
        fanjian = 'j';
    } 
    fanjian = fanjian == "j" ? "f" : "j";
    localStorage.setItem("FJ", fanjian);
    display_fanjian();
}

/* 根据繁简设置改变页面 */
function display_fanjian()
{
    let fanjian = localStorage.getItem('FJ');
    if ( fanjian === null ) {
        fanjian = 'j';
        localStorage.setItem('FJ', fanjian); 
    } 

    if ( fanjian == 'j') {
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
    let mark = localStorage.getItem('mark') === 'pz'?'none':'pz';
    localStorage.setItem('mark', mark); 
    update_work_detail_body();
}

/* 切换拼音 */
function toggle_pinyin()
{
    let mark = localStorage.getItem('mark') === 'pinyin'?'none':'pinyin';
    localStorage.setItem('mark', mark); 
    update_work_detail_body();
}

/* 显示标注 */
function get_mark() {
    let mark = localStorage.getItem('mark');
    if ( mark === null ) {
        localStorage.setItem('mark', 'none'); 
        mark = 'none';
    } 
    return mark;
}

/* 设置发音 */
function set_dialect(value)
{
    let dialect = localStorage.getItem("tts_vendor") === 'tts_baidu' ? localStorage.getItem("bddialect") : localStorage.getItem("xfdialect");

    if ( dialect === value ) {
    /* 没有变化，直接返回 */
         return 0;
    }

    dialect = value;
    /* 重置tts变量，以便重新获取音频数据 */
    loadedData = false;
    audio_state = 0;

    if ( localStorage.getItem("tts_vendor") === 'tts_baidu' ) {
        localStorage.setItem("bddialect", value);
    } else {
        localStorage.setItem("xfdialect", value);
    }
}

function set_tile(value)
{
    let tilestyle = localStorage.getItem('tilestyle');
    if ( tilestyle === value ) {
       return 0;
    }
    localStorage.setItem('tilestyle', value);
}
function get_tilestyle() {
    let tilestyle = localStorage.getItem('tilestyle');
    if ( tilestyle === null ) {
       tilestyle = 'bookmark';
       localStorage.setItem('tilestyle', tilestyle);
    }
    return tilestyle;
}

/* 设置语音合成服务提供商 */
function set_tts_vendor(value)
{
    let tts_vendor = localStorage.getItem('tts_vendor');
    if ( tts_vendor === value ) {
        return 0;
    }
    localStorage.setItem("tts_vendor", value);
    show_tts_vendor();
    /* 重置tts变量，以便重新获取音频数据 */
    loadedData = false;
    audio_state = 0;
}
/* 显示语音服务提供商对应的tts参数设置页面 */
function show_tts_vendor()
{
    let tts_vendor = localStorage.getItem('tts_vendor');
    if ( tts_vendor === null ) tts_vendor = 'tts_xunfei';

    if ( tts_vendor === 'tts_xunfei' ) {
       $('#tts_xunfei').attr('checked', true); 
       $('#tts_xunfei_config').show();
       $('#tts_baidu_config').hide();
    } else if ( tts_vendor === 'tts_baidu' ) {
       $('#tts_baidu').attr('checked', true); 
       $('#tts_xunfei_config').hide();
       $('#tts_baidu_config').show();
    }

    display_dialect();
}

/* 在设置页面显示对应语音服务提供商的tts发音选项 */
function display_dialect()
{
    if (( tts_vendor == 'tts_baidu' ) && ( localStorage.getItem('bddialect') === null )) {
        localStorage.setItem('bddialect', '0'); 
    } else if (localStorage.getItem('xfdialect') === null ) {
        localStorage.setItem('xfdialect', 'aisjying'); 
    }
    let dialect = localStorage.getItem('xfdialect');
    let obj=`[value="${dialect}"]`;
    $(obj).attr('checked', true);
    dialect = localStorage.getItem('bddialect');
    obj=`[value="bdtts${dialect}"]`;
    $(obj).attr('checked', true);
}

function display_tilestyle()
{
    let tilestyle = localStorage.getItem('tilestyle');
    if ( tilestyle === null || ['bookmark', 'card'].indexOf(tilestyle) == -1 ) {
        tilestyle = 'bookmark';
        localStorage.setItem('tilestyle', tilestyle);
    } 
    let obj = `[value='${tilestyle}']`;
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
    if (localStorage.getItem('FJ') === null ) { 
        localStorage.setItem('FJ', 'j'); 
    } 
    let result = localStorage.getItem('FJ') === 'j' ? $.t2s(text) : $.s2t(text);
    return result;
}

$(function() {
    $('#modal').on('md_show', function() {
        audio_state = 0; // Need initializing audio
        loadedData = false;
    });

    $('#modal').on('md_close', function() {
        stop(); //Stop play audio - call stop() in tts_demo.js
        audio_state = 0; // Need initializing audio
        spinner_stop();
    });

    $(document).ready(function() { 
        get_mark();          //设置标注类型 - 拼音、平仄
        display_fanjian();   //设置繁简，并转换页面 
        display_tilestyle(); //设置搜索结果显示方式: 贴片/书签, 并显示在配置页面 
        show_tts_vendor();   //设置TTS服务商信息，并显示在配置页面
    });
});

const pz_dict = {
    'ā': '平',
    'á': '平',
    'ǎ': '仄',
    'à': '仄',
    'ē': '平',
    'é': '平',
    'ě': '仄',
    'è': '仄',
    'ō': '平',
    'ó': '平',
    'ǒ': '仄',
    'ò': '仄',
    'ī': '平',
    'í': '平',
    'ǐ': '仄',
    'ì': '仄',
    'ū': '平',
    'ú': '平',
    'ǔ': '仄',
    'ù': '仄',
    'ü': '平',
    'ǘ': '平',
    'ǚ': '仄',
    'ǜ': '仄',
    'ń': '平',
    'ň': '仄',
    'ǹ': '仄',
    '\u1e3f': '平'
}

// 根据拼音返回韵律
// 平：一、二、轻声
// 仄：三、四声
function getpz(ptext) 
{
    let text = ptext.trim();
    if ( text.length == 0 ) return '';

   for ( let i in text ) {
       let c = text[i];
       if ( c in pz_dict ) return pz_dict[c];
   }
   return '平';

}

// 根据作品类型判断是否有平仄
function pzable(category) {
    return (['五言律诗', '五言绝句', '七言律诗', '七言绝句'].indexOf($.t2s(category)) > -1);
}

// 判断对象是否为空
function isblank(obj) {
   let count = 0;
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
    let html = '';
    if ( data.text.length == 0 ) return html;
    var pindex = 0;
    for ( let index in data.text ) {
        if ( is_nonchinese_char(data.text[index]) ) {
            html += ( index === 0 || is_nonchinese_char(data.text[index-1])) ? '' : '</ruby>' + data.text[index] ;
            continue;
        }
        html += ( index === 0 || is_nonchinese_char(data.text[index-1])) ? '<ruby>' : '' + data.text[index] + mark_pz(pindex, data) + ( index === data.text.length ? '</ruby>':'' );
        pindex += 1;
    }
    return html;
}
// 生成标记单个汉字平仄的HTML代码
function mark_pz(pindex, data) {
    let html = `<rt>${getpz(data.dan_pinyin[pindex])}</rt>`;
    return html;
}

// 判断是否需要缩进
function indent(text) {
   var html = text.length > g_linelen ? `style="text-indent: 2em;text-align: left;"` : '';
   return html;
}

// 计算多行输入区需要显示的行数
function count_rows(text) {
    let row = text.split('\n').length;
    let count = 0;
    text.split('\n').forEach(function(item) {
        count += item.trim().length > g_linelen ? item.trim().length/g_linelen : 0;
    });
    row += count;
    return row;
}


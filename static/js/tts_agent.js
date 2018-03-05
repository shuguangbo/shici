/*
 author:cyhu(viskey.hu@gmail.com) 2014.7.8
 --modified 2014.7.24 cyhu
 --modified 2014.12.26 cyhu

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
/***********************************************local Variables**********************************************************/
var audioPalyUrl = "http://h5.xf-yun.com/audioStream/";

/**
  * 初始化Session会话
  * url                 连接的服务器地址（可选）
  * reconnection        客户端是否支持断开重连
  * reconnectionDelay   重连支持的延迟时间   
  */
var session = new IFlyTtsSession();
/*
{
'url'                : 'ws://h5.xf-yun.com/tts.do',
'reconnection'       : true,
'reconnectionDelay'  : 500000
}
*/

/* 音频播放对象 */
window.iaudio = new Audio();

/* 音频播放状态 0:未播放，1:播放，2：停止*/
var audio_state = 0;
var loadedData = false;

/* 百度发音：女声，男声，度逍遥，度丫丫*/
var pr_baidu = [0,1,3,4];
/* 讯飞发间：普通女声，四川女声，广东女声，陕西女声，东北，小女声，小男声 */
var pr_xunfei = ["aisjying", "aisxrong", "xiaomei", "aisxying", "xiaoqian", "vinn", "aisbabyxu"];

/***********************************************local Variables**********************************************************/
function tts_read(content) {
     spinner_start();
     if ( localStorage.getItem("tts_vendor") == 'tts_baidu' ) {
         var vcn = localStorage.getItem("bddialect");
         tts_read_baidu(content, vcn);
     } else {
         var vcn = localStorage.getItem("xfdialect");
         tts_read_xunfei(content, vcn);
    }
}

function tts_read_baidu(content, vcn) {
    if ( content != null && content != undefined ) { 
        var per = "&per=" + vcn;
        var tex = "&tex=" + content;
        var token = "tok=24.af93ea4548686f35b8e34f0d85607812.2592000.1488246102.282335-8691120";
        var audio_url = "http://tsn.baidu.com/text2audio?lan=zh&cuid=8D3dETgZg6FdGcRDoRXFY5nR&ctp=1&" + token + per + tex;
        window.iaudio.src = audio_url;
        window.iaudio.play();
    }
}

function tts_read_xunfei(content, vcn){

      /* Use Xun Fei Demo account - works at Jan 10, 2017
      ssb_param = {"appid": '577ca2ac', "appkey":"9a77addd1154848d", "synid":"12345", "params" : "ent=aisound,appid=577ca2ac,aue=lame,vcn="+vcn};
      */

      /* use my account APPID：58744f0c，Secret Key：560b206c4f6f32dc  - works at Jan 10, 2017*/
      ssb_param = {"appid": '58744f0c', "appkey":"560b206c4f6f32dc", "synid":"12345", "params" : "ent=aisound,appid=58744f0c,aue=lame,vcn="+vcn};

    session.start(ssb_param, content, function (err, obj)
    {
        var audio_url = audioPalyUrl + obj.audio_url;
        if( audio_url != null && audio_url != undefined )
        {
            window.iaudio.src = audio_url;
            window.iaudio.play();
        }
        if ( err != null && err != undefined && err != 0 ) {
            console.log("Error: " + err);
        }
    }, function(message) {
        console.log(message);
    });
};

/*
 * work : string in format - name author preface line1 line2 line3 ...
 */
function tts_read_work(work){

    var text = new Array();
    var i = 0;
    var sec = 400;

    for (i=0; i < (work.length/sec) ; i++) {
        text.push(work.slice(i*sec, (i+1)*sec));
    } 

    window.iaudio.addEventListener('ended', playEndedHandler, false);
    window.iaudio.addEventListener('playing', playStartHandler, false);
    window.iaudio.addEventListener('pause', playPauseHandler, false);
    window.iaudio.addEventListener('error', playErrorHandler, false);
    window.iaudio.addEventListener('loadeddata', playLoadedDataHandler, false);
    window.iaudio.loop = false;

    var content = text.shift();

    tts_read(content);

    function playEndedHandler() {
        if ( text.length == 0 ) {
            audio_state = 0;
            console.log('Ended');
            document.getElementById('readwork').innerHTML=trans_text(" 朗读 ");
            return 0;
        } else {
            content = text.shift();
            tts_read(content);
        }
    };

    function playStartHandler() {
        console.log('Playing ...');
        spinner_stop();
        audio_state = 1;
        document.getElementById('readwork').innerHTML=trans_text(" 暂停 ");
    };

    function playPauseHandler() {
        console.log('Paused');
        audio_state = 2;
        document.getElementById('readwork').innerHTML=trans_text(" 朗读 ");
    };
    function playLoadedDataHandler() {
        loadedData = true;
    };
    function playErrorHandler() {
       console.log('Error');
       audio_state = 0;
       spinner_stop();
    }
};

/*
 * 暂停朗读
 */
function stop() {
    window.iaudio.pause();
}

/*
 * 开始朗读
 */
function start() {
    window.iaudio.play();
}

/**
  * 重置音频缓存队列和播放对象
  * 若音频正在播放，则暂停当前播放对象，创建并使用新的播放对象.
  */
function reset()
{
    audio_array = [];     
    audio_state = 0;
    if(window.iaudio != null)
    {
        window.iaudio.pause();
    }
    window.iaudio = new Audio();
    window.iaudio.src = '';
    //window.iaudio.play();
};

#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = ['"shuguangbo" <1262448230@qq.com>']

import logging
import traceback
import pypinyin
from pypinyin import pinyin, load_phrases_dict, lazy_pinyin, slug, TONE
from work.work import sc
import json
import jieba

from base.handler import BaseHandler

class restGetPinyinHandler(BaseHandler):
    def __init__(self, application, request, **kwargs):
        super(restGetPinyinHandler, self).__init__(application, request, **kwargs)

    def post(self, *args, **kwargs):
        try :
            text = self.get_argument("text", "")
#            text = json.loads(self.get_argument("text", ""), encoding='utf-8')
            pinyin = self.pinyin(text)
        except Exception as e:
            import traceback
            stack = traceback.format_exc()
            logging.error("get pinyin failed - error:%s cause:%s"
                          % ( e, stack))
            self.get_error_html(404, reason="Internal Error")
        else:
            self.write(pinyin)

    def pinyin(self, text) :
        """ 将一段文字转换为拼音，以JSON格式返回 
            返回数组中的每一个元素为对应文字的拼音，多音字以数组列出所有拼音
            中心 [['zhōng', 'zhòng'], ['xīn']]
        """
        text_length = len(text.strip());
        if (text_length == 0) : return []
#        print "input: %d %s" % (text_length, text)
        ptext = {'duo_pinyin': pinyin(text, heteronym=True, errors=u'ignore'),
               'dan_pinyin': lazy_pinyin(text, style=pypinyin.TONE, errors=u'ignore') }
        str = json.dumps(ptext, ensure_ascii=False, encoding='utf-8')
#        print "output: %s" % str
        return str

class restGetCommentHandler(BaseHandler):
    def __init__(self, application, request, **kwargs):
        super(restGetCommentHandler, self).__init__(application, request, **kwargs)

    def post(self, *args, **kwargs):
        try :
            text = self.get_argument("text", "")
#            text = json.loads(self.get_argument("text", ""), encoding='utf-8')
            comment = self.comment(text)
        except Exception as e:
            import traceback
            stack = traceback.format_exc()
            logging.error("get comment failed - error:%s cause:%s"
                          % ( e, stack))
            self.write_error(404, reason="Internal Error")
        else:
            self.write(comment)

    def comment(self, text) :
        """ 将一段文字分词，在注释库中找出对应注释，以JSON格式返回
            返回数组中的每一个元素为对应文字的注释
            [{关键字1：注释1},{关键字2：注释2},...]
        """
        text_length = len(text.strip());
#        print "input: %d %s" % (text_length, text)

        clist = []; 

        if (text_length > 0) : 
            for key in jieba.cut_for_search(text) :
#                print "key: %s" % key
                if sc.comment.has_key(key) :
#                    print "key: %s comment: %s" % (key, sc.comment[key])
                    clist.append({key: sc.comment[key]})

        str = json.dumps(clist, ensure_ascii=False, encoding='utf-8')
#        print "output: %s" % str
        return str

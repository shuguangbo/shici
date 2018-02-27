#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = ['"shuguangbo" <1262448230@qq.com>']

import hashlib
import logging
import xlrd
import re
import random
import os
import time
import pypinyin
from pypinyin import pinyin, load_phrases_dict, lazy_pinyin, slug, TONE
import config
import json
import jieba

#### Start of class shici ####
class Shici():
    """用于获取诗词
    """
    poem_inst = {
    'id': u'',             # 作品标志 - 名称+作者+第一句的md5 hash值
    'type': u'',           # 分类 - 诗、词、曲、文 / shi, ci, qu, wen
    'name': u'',           # 作品名称
    'author': u'',         # 作者
    'preface': u'',        # 序
    'category': u'',       # 体裁 - 五言绝句、五言律诗等
    'lines': [],           # 诗句
    'plines': [],          # 诗句 - 拼音
    'pname': [],           # 作品名称 - 拼音 
    'pauthor': [],         # 作者 - 拼音
    'ppreface': [],        # 序 - 拼音
    'tag': [],             # 标签
    'url': u'',            # 指向百科的链接
    'comment': {},         # 注释
    'analyse': []          # 赏析
    }

    poem_set={}
    md5 = hashlib.md5()
    comment={}

    def __init__(self) :
        """ 加载pypinyin的本地短语库，并将短语加入jieba
        """
        phrase = json.load(open(config.phrase_file, 'r'), encoding='utf-8')
        load_phrases_dict(phrase, style=u'default')
        for key in phrase.keys() : jieba.add_word(key)
        ### Load comment dict
#        self.comment = json.load(open(config.comment_file, 'r'), encoding='utf-8')
        self.load_comment()
        for key in self.comment.keys() : jieba.add_word(key)

    def parse_comment(self, poem) :
        """ 分析诗句，从注释字典中查找注释交添加到诗词的注释中
        """
        for line in poem['lines'] :
            for key in jieba.cut(line) :
                if poem['comment'].has_key(key) : continue
                elif self.comment.has_key(key) : poem['comment'][key] = self.comment[key]
        for key in jieba.cut(poem['name']) :
            if poem['comment'].has_key(key) : continue
            elif self.comment.has_key(key) : poem['comment'][key] = self.comment[key]
        for key in jieba.cut(poem['preface']) :
            if poem['comment'].has_key(key) : continue
            elif self.comment.has_key(key) : poem['comment'][key] = self.comment[key]
            
    def load_repo(self, name=config.repo_file) :
        """ 将待久化到文件中的诗词库装载到内存中
        """
        self.poem_set = json.load(open(name, 'r'), encoding='utf-8')

    def load_comment(self, name=config.comment_file) :
        """ 将待久化到文件中的注释库装载到内存中
        """
        self.comment = json.load(open(name, 'r'), encoding='utf-8')

    def persist_repo(self, name=config.repo_file) :
        """ 将内存中的诗词库待久化到文件中
        """
        fp = open(name, 'w')
        json.dump(self.poem_set, fp, ensure_ascii=False, encoding='utf-8')
        fp.close()

    def persist_comment(self, name=config.comment_file) :
        """ 将内存中的注释库待久化到文件中
        """
        fp = open(name, 'w')
        json.dump(self.comment, fp, ensure_ascii=False, encoding='utf-8')
        fp.close()
        

    def find_keyword(self, poem, keyword):
        """ 在诗句中查找关键字
        """
        if poem['lines'] :
            for line in poem['lines'] :
                if line.find(keyword) != -1 :
                    return 0
            return -1

    def find_tag(self, poem, keyword):
        """ 在标签中查找关键字
        """
        if keyword in poem['tag'] :
            return 0
        return -1

    ### search poem
    def search_poem(self, author='', poem_name='', category='', word='', tag='', type='html', num=320) :
        """ 查找符合关键字的诗词，分别从作者，作品名称，体裁，标签和诗句中查找。
            只要有一项满足即可
        """
        found=[]
        count = 0
        for poem in self.poem_set.itervalues() :
            ar = -1 if author=='' else  poem['author'].find(author)
            pr = -1 if poem_name=='' else poem['name'].find(poem_name)
            cr = -1 if category=='' else poem['category'].find(category)
            lr = -1 if word=='' else self.find_keyword(poem, word)
            tr = -1 if tag=='' else self.find_tag(poem, word)

            if ar != -1 or pr != -1 or lr != -1 or cr != -1 or tr != -1:
                ts={'id':poem['id'], 'lines':poem['lines'], 'name':poem['name'], 'author':poem['author'], 'preface':poem['preface'], 'type':poem['type'], 'category':poem['category'], 'tag':poem['tag']}
                found.append( ts )
                count += 1
                if count >= num :
                    break
#        print "Debug: keyword %s %d" % (word, count)
        found.sort(key=lambda k:(k.get('author',''), k.get('category',''), k.get('name',''), k.get('lines'[0], '')))
        if type == 'json' :
            jstr = json.dumps(found, ensure_ascii=False, encoding='utf-8');
            return jstr
        return found

    ### get poem
    ### for KeDa Xun Fei TTS, return text to be TTSed and specific poem
    def get_poem(self, id='', type='html'):
        """ 根据提供的标志在诗词库中找到对应的诗词并返回
        """
        if id == '' :
            index = random.randint(0,len(self.poem_set.keys())-1)
            id = self.poem_set.keys()[index]

        poem = self.poem_set[id]
        tex = poem['name'] + " " + poem['author'] + " " + poem['preface'] + " " + " ".join(poem['lines'])
        if type == 'json' :
            jstr = json.dumps(poem, ensure_ascii=False, encoding='utf-8');
            return jstr

        return tex, poem

    def daily_poem(self, type='html') :
        """ 从诗词库中找到一首经典诗词并返回
        """
        index = random.randint(0,len(self.poem_set.keys())-1)
        id = self.poem_set.keys()[index]
        poem = self.poem_set[id]
        tex = poem['name'] + " " + poem['author'] + " " + poem['preface'] + " " + " ".join(poem['lines'])
        if type == 'json' :
            jstr = json.dumps(poem, ensure_ascii=False, encoding='utf-8');
            return jstr 
            
        return tex, poem

    def pinyin(self, text) :
        """ 将一段文字转换为拼音，以JSON格式返回 
            返回数组中的每一个元素为对应文字的拼音，多音字以数组列出所有拼音
            中心 [['zhōng', 'zhòng'], ['xīn']]
        """
        len = len(text.strip());
        if (len == 0) : return []
        return json.dumps(pinyin(text, heteronym=True), ensure_ascii=False, encoding='utf-8')

    def save_poem(self, poem={}, type='json') :
        """ 获得从客户端传来的诗词并保存到文件中
        """
#        print "poem id: %s" % poem['id']
        id = poem['id']
        self.poem_set[id] = poem
        self.persist_repo()

        """ 更新注释库 """
        for item in ['name', 'preface', 'lines'] :
            for index in range(0, len(poem['comment'][item])) :
                for num in range(0, len(poem['comment'][item][index])) :
                    for key in poem['comment'][item][index][num] :
                       if key in self.comment : continue
                       self.comment[key] = poem['comment'][item][index][num][key] 
#                       print "new key: " + key + " value: " + poem['comment'][item][index][num][key]
        
        self.persist_comment()

        return True

    def del_poem(self, id='') :
        """ 删除指定的诗词
        """
        print "debug - id: %s" % id
        if id in self.poem_set :
            del self.poem_set[id]
            print "found and delete id: %s" % id
            self.persist_repo()
        
        return True
#### End of class Shici ####

sc = Shici()

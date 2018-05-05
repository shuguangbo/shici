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
    work_inst = {
    'id': u'',             # 作品标志 - 名称+作者+第一句的md5 hash值
    'type': u'',           # 分类 - 诗、词、曲、文 / shi, ci, qu, wen
    'name': u'',           # 作品名称
    'author': u'',         # 作者
    'preface': u'',        # 序
    'category': u'',       # 体裁 - 五言绝句、五言律诗等
    'lines': u'',           # 诗句
    'plines': [],          # 诗句 - 拼音
    'pname': [],           # 作品名称 - 拼音 
    'pauthor': [],         # 作者 - 拼音
    'ppreface': [],        # 序 - 拼音
    'tag': [],             # 标签
    'url': u'',            # 指向百科的链接
    'comment': {},         # 注释
    'analyse': u''          # 赏析
    }

    work_set={}
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

    def parse_comment(self, work) :
        """ 分析诗句，从注释字典中查找注释交添加到诗词的注释中
        """
        for line in work['lines'].split('\n') :
            for key in jieba.cut(line) :
                if work['comment'].has_key(key) : continue
                elif self.comment.has_key(key) : work['comment'][key] = self.comment[key]
        for key in jieba.cut(work['name']) :
            if work['comment'].has_key(key) : continue
            elif self.comment.has_key(key) : work['comment'][key] = self.comment[key]
        for key in jieba.cut(work['preface']) :
            if work['comment'].has_key(key) : continue
            elif self.comment.has_key(key) : work['comment'][key] = self.comment[key]
            
    def load_repo(self, name=config.repo_file) :
        """ 将待久化到文件中的诗词库装载到内存中
        """
        self.work_set = json.load(open(name, 'r'), encoding='utf-8')

    def load_comment(self, name=config.comment_file) :
        """ 将待久化到文件中的注释库装载到内存中
        """
        self.comment = json.load(open(name, 'r'), encoding='utf-8')

    def persist_repo(self, name=config.repo_file) :
        """ 将内存中的诗词库待久化到文件中
        """
        fp = open(name, 'w')
        json.dump(self.work_set, fp, ensure_ascii=False, encoding='utf-8')
        fp.close()

    def persist_comment(self, name=config.comment_file) :
        """ 将内存中的注释库待久化到文件中
        """
        fp = open(name, 'w')
        json.dump(self.comment, fp, ensure_ascii=False, encoding='utf-8')
        fp.close()
        

    def find_keyword(self, work, keyword):
        """ 在诗句中查找关键字
        """
        if work['lines'] :
            for line in work['lines'].split('\n') :
                if line.find(keyword) != -1 :
                    return 0
            return -1

    def find_tag(self, work, keyword):
        """ 在标签中查找关键字
        """
        if keyword in work['tag'] :
            return 0
        return -1

    ### search work
    def search_work(self, author='', work_name='', category='', word='', tag='', type='html', num=320) :
        """ 查找符合关键字的诗词，分别从作者，作品名称，体裁，标签和诗句中查找。
            只要有一项满足即可
        """
        found=[]
        count = 0
        for work in self.work_set.itervalues() :
            ar = -1 if author=='' else  work['author'].find(author)
            pr = -1 if work_name=='' else work['name'].find(work_name)
            cr = -1 if category=='' else work['category'].find(category)
            lr = -1 if word=='' else self.find_keyword(work, word)
            tr = -1 if tag=='' else self.find_tag(work, word)

            if ar != -1 or pr != -1 or lr != -1 or cr != -1 or tr != -1:
                ts={'id':work['id'], 'lines':work['lines'], 'name':work['name'], 'author':work['author'], 'preface':work['preface'], 'type':work['type'], 'category':work['category'], 'tag':work['tag']}
                found.append( ts )
                count += 1
                if count >= num :
                    break
#        print "Debug: keyword %s %d" % (word, count)
        found.sort(key=lambda k:(k.get('author',''), k.get('category',''), k.get('name','')))
        if type == 'json' :
            jstr = json.dumps(found, ensure_ascii=False, encoding='utf-8');
            return jstr
        return found

    ### get work
    ### for KeDa Xun Fei TTS, return text to be TTSed and specific work
    def get_work(self, id='', type='html'):
        """ 根据提供的标志在诗词库中找到对应的诗词并返回
        """
        if id == '' :
            index = random.randint(0,len(self.work_set.keys())-1)
            id = self.work_set.keys()[index]

        work = self.work_set[id]
        tex = work['name'] + " " + work['author'] + " " + work['preface'] + " " + work['lines']
        if type == 'json' :
            jstr = json.dumps(work, ensure_ascii=False, encoding='utf-8');
            return jstr

        return tex, work

    def pinyin(self, text) :
        """ 将一段文字转换为拼音，以JSON格式返回 
            返回数组中的每一个元素为对应文字的拼音，多音字以数组列出所有拼音
            中心 [['zhōng', 'zhòng'], ['xīn']]
        """
        len = len(text.strip());
        if (len == 0) : return []
        return json.dumps(pinyin(text, heteronym=True), ensure_ascii=False, encoding='utf-8')

    def save_work(self, work={}, type='json') :
        """ 获得从客户端传来的诗词并保存到文件中
        """
#        print "work id: %s" % work['id']
        id = work['id']
        self.work_set[id] = work
        self.persist_repo()

        """ 更新注释库 """
        for item in ['name', 'preface', 'lines'] :
            for index in range(0, len(work['comment'][item])) :
                print "item: %s index: %d length: %d" % ( item, index, len(work['comment'][item][index]))
                for num in range(0, len(work['comment'][item][index])) :
                    for key in work['comment'][item][index][num] :
                       if key in self.comment : continue
                       self.comment[key] = work['comment'][item][index][num][key] 
#                       print "new key: " + key + " value: " + work['comment'][item][index][num][key]
        
        self.persist_comment()

        return True

    def del_work(self, id='') :
        """ 删除指定的诗词
        """
        print "debug - id: %s" % id
        if id in self.work_set :
            del self.work_set[id]
            print "found and delete id: %s" % id
            self.persist_repo()
        
        return True
#### End of class Shici ####

sc = Shici()

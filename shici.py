#!/usr/bin/env python
# -*- coding: utf-8 -*-

import logging
import tornado.escape
import tornado.ioloop
import tornado.web
import os.path
import uuid

import config

from tornado.concurrent import Future
from tornado import gen
from tornado.options import define, options, parse_command_line

from base.handler import HomeHandler, ErrorHandler, TestHandler
from search.handler import SearchPoemHandler, restSearchPoemHandler
from poem.handler import GetPoemHandler, DailyPoemHandler, restDailyPoemHandler, restGetPoemHandler, restSavePoemHandler, restDelPoemHandler
from util.handler import restGetPinyinHandler, restGetCommentHandler

from poem.poem import sc
import sys

reload(sys)
sys.setdefaultencoding('utf-8')

define("port", default=8888, help="run on the given port", type=int)
define("debug", default=False, help="run in debug mode")

sc.load_repo(config.data_path+'/shici_repo.json')

def main():
    parse_command_line()
    app = tornado.web.Application(
        [
            (r'/', HomeHandler),
            (r'/test', TestHandler),
            (r'/search', SearchPoemHandler),
            (r'/get', GetPoemHandler),
            (r'/dailypoem', DailyPoemHandler),
            (r'/v1/search', restSearchPoemHandler),
            (r'/v1/get', restGetPoemHandler),
            (r'/v1/dailypoem', restDailyPoemHandler),
            (r'/v1/pinyin', restGetPinyinHandler),
            (r'/v1/comment', restGetCommentHandler),
            (r'/v1/save', restSavePoemHandler),
            (r'/v1/del', restDelPoemHandler),
            (r'/.*', ErrorHandler),
            ],
        cookie_secret = "3c4ce17055943c777753574a71b370e3",
        static_path = config.static_path,
        template_path = config.template_path,
        xsrf_cookies = True,
        debug = options.debug,
        )
    app.listen(options.port)
    tornado.ioloop.IOLoop.current().start()

if __name__ == "__main__":
    main()

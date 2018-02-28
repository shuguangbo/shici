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
from search.handler import restSearchWorkHandler
from work.handler import restClassicWorkHandler, restGetWorkHandler, restSaveWorkHandler, restDelWorkHandler
from util.handler import restGetPinyinHandler, restGetCommentHandler

from work.work import sc
import sys

reload(sys)
sys.setdefaultencoding('utf-8')

define("port", default=8888, help="run on the given port", type=int)
define("debug", default=False, help="run in debug mode")

sc.load_repo(config.repo_file)

def main():
    parse_command_line()
    app = tornado.web.Application(
        [
            (r'/', HomeHandler),
            (r'/test', TestHandler),
            (r'/v1/search', restSearchWorkHandler),
            (r'/v1/get', restGetWorkHandler),
            (r'/v1/classicwork', restClassicWorkHandler),
            (r'/v1/pinyin', restGetPinyinHandler),
            (r'/v1/comment', restGetCommentHandler),
            (r'/v1/save', restSaveWorkHandler),
            (r'/v1/del', restDelWorkHandler),
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

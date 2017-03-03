#!/usr/bin/env python
# -*- coding: utf-8 -*-


__author__ = ['"shuguangbo" <1262448230@qq.com>']

import logging
import traceback
from base.handler import BaseHandler
from poem.poem import sc 

SEARCH_PER_PAGE = 10

class SearchPoemHandler(BaseHandler):
    """处理搜索
    """
    def __init__(self, application, request, **kwargs):
        super(SearchPoemHandler, self).__init__(application, request, **kwargs)

    def get(self, *args, **kwargs):
        keywords = self.get_argument("keywords", "")

        if not keywords.strip():
            keywords = ''
        try :
            poem_list = sc.search_poem(author=keywords, poem_name=keywords, word=keywords, category=keywords, tag=keywords)
        except Exception as e:
            import traceback
            stack = traceback.format_exc()
            logging.error("search poem failed - error:%s cause:%s"
                          % ( e, stack))
            self.write_error(404, reason="Internal Error")
        else:
            self.render_html("shici.html", poem_list=poem_list)

class restSearchPoemHandler(BaseHandler):
    """处理搜索
    """
    def __init__(self, application, request, **kwargs):
        super(restSearchPoemHandler, self).__init__(application, request, **kwargs)

    def get(self, *args, **kwargs):
        keywords = self.get_argument("keywords", "")

        if not keywords.strip():
            keywords = ''
        try :
            poem_list = sc.search_poem(author=keywords, poem_name=keywords, word=keywords, category=keywords, tag=keywords, type='json')
        except Exception as e:
            import traceback
            stack = traceback.format_exc()
            logging.error("search poem failed - error:%s cause:%s"
                          % ( e, stack))
            self.write_error(404, reason="Internal Error")
        else:
            self.write(poem_list)

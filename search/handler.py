#!/usr/bin/env python
# -*- coding: utf-8 -*-


__author__ = ['"shuguangbo" <1262448230@qq.com>']

import logging
import traceback
from base.handler import BaseHandler
from work.work import sc 

SEARCH_PER_PAGE = 10

class restSearchWorkHandler(BaseHandler):
    """处理搜索
    """
    def __init__(self, application, request, **kwargs):
        super(restSearchWorkHandler, self).__init__(application, request, **kwargs)

    def get(self, *args, **kwargs):
        keywords = self.get_argument("keywords", "")

        if not keywords.strip():
            keywords = ''
        try :
            work_list = sc.search_work(author=keywords, work_name=keywords, word=keywords, category=keywords, tag=keywords, type='json')
        except Exception as e:
            import traceback
            stack = traceback.format_exc()
            logging.error("search work failed - error:%s cause:%s"
                          % ( e, stack))
            self.write_error(404, reason="Internal Error")
        else:
            self.write(work_list)

#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = ['"shuguangbo" <1262448230@qq.com>']

import logging
import traceback
import json
import tornado.web
from base.handler import BaseHandler
from work import sc

###############################################################################
### REST API 
###############################################################################
class restClassicWorkHandler(BaseHandler):
    def __init__(self, application, request, **kwargs):
        super(restClassicWorkHandler, self).__init__(application, request, **kwargs)

    @tornado.web.asynchronous
    def post(self, *args, **kwargs):
        try :
            work = sc.get_work(id='', type='json')
        except Exception as e:
            import traceback
            stack = traceback.format_exc()
            logging.error("get work failed - error:%s cause:%s"
                          % ( e, stack))
            self.write_error(404, reason="Internal Error")
        else:
            self.write(work)
        self.finish()

class restGetWorkHandler(BaseHandler):
    def __init__(self, application, request, **kwargs):
        super(restGetWorkHandler, self).__init__(application, request, **kwargs)
    @tornado.web.asynchronous
    def post(self, *args, **kwargs):
        id = json.loads(self.get_argument("id", ""), encoding='utf-8')
        try :
            work = sc.get_work(id=id, type='json')
        except Exception as e:
            import traceback
            stack = traceback.format_exc()
            logging.error("get work details failed - error:%s cause:%s"
                          % ( e, stack))
#            self.write_error(404, reason="Internal Error")
        else:
            self.write(work)
        self.finish()

class restSaveWorkHandler(BaseHandler):
    def __init__(self, application, request, **kwargs):
        super(restSaveWorkHandler, self).__init__(application, request, **kwargs)

    @tornado.web.asynchronous
    def post(self, *args, **kwargs):
        work = json.loads(self.get_argument("work", ""), encoding='utf-8')
        try :
            ret = sc.save_work(work=work, type='json')
        except Exception as e:
            import traceback
            stack = traceback.format_exc()
            logging.error("save work details failed - error:%s cause:%s"
                          % ( e, stack))
#            self.write_error(404, reason="Internal Error")
#        else:
#            self.write(ret)
        self.finish()

class restDelWorkHandler(BaseHandler):
    def __init__(self, application, request, **kwargs):
        super(restDelWorkHandler, self).__init__(application, request, **kwargs)

    @tornado.web.asynchronous
    def post(self, *args, **kwargs):
        id = self.get_argument("id", "")
        try :
            ret = sc.del_work(id=id)
        except Exception as e:
            import traceback
            stack = traceback.format_exc()
            logging.error("save work details failed - error:%s cause:%s"
                          % ( e, stack))
#            self.write_error(404, reason="Internal Error")
        self.finish()

class restSearchWorkHandler(BaseHandler):
    """处理搜索
    """
    def __init__(self, application, request, **kwargs):
        super(restSearchWorkHandler, self).__init__(application, request, **kwargs)

    @tornado.web.asynchronous
    def post(self, *args, **kwargs):
        keywords = json.loads(self.get_argument("keywords", ""), encoding='utf-8')

        if not keywords.strip():
            keywords = ''
        try :
            work_list = sc.search_work(author=keywords, work_name=keywords, word=keywords, category=keywords, tag=keywords, type='json')
        except Exception as e:
            import traceback
            stack = traceback.format_exc()
            logging.error("search work failed - error:%s cause:%s"
                          % ( e, stack))
#            self.write_error(404, reason="Internal Error")
        else:
            self.write(work_list)
        self.finish()

#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = ['"shuguangbo" <1262448230@qq.com>']

import logging
import traceback
import json
from base.handler import BaseHandler
from work import sc

###############################################################################
### REST API 
###############################################################################
class restClassicWorkHandler(BaseHandler):
    def __init__(self, application, request, **kwargs):
        super(restClassicWorkHandler, self).__init__(application, request, **kwargs)

    def get(self, *args, **kwargs):
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

class restGetWorkHandler(BaseHandler):
    def __init__(self, application, request, **kwargs):
        super(restGetWorkHandler, self).__init__(application, request, **kwargs)

    def get(self, *args, **kwargs):
        id = self.get_argument("id", "")
        try :
            work = sc.get_work(id=id, type='json')
        except Exception as e:
            import traceback
            stack = traceback.format_exc()
            logging.error("get work details failed - error:%s cause:%s"
                          % ( e, stack))
            self.write_error(404, reason="Internal Error")
        else:
            self.write(work)

class restSaveWorkHandler(BaseHandler):
    def __init__(self, application, request, **kwargs):
        super(restSaveWorkHandler, self).__init__(application, request, **kwargs)

    def post(self, *args, **kwargs):
        work = json.loads(self.get_argument("art", ""), encoding='utf-8')
        try :
            ret = sc.save_work(work=work, type='json')
        except Exception as e:
            import traceback
            stack = traceback.format_exc()
            logging.error("save work details failed - error:%s cause:%s"
                          % ( e, stack))
            self.write_error(404, reason="Internal Error")
#        else:
#            self.write(ret)

class restDelWorkHandler(BaseHandler):
    def __init__(self, application, request, **kwargs):
        super(restDelWorkHandler, self).__init__(application, request, **kwargs)

    def post(self, *args, **kwargs):
        id = self.get_argument("id", "")
        try :
            ret = sc.del_work(id=id)
        except Exception as e:
            import traceback
            stack = traceback.format_exc()
            logging.error("save work details failed - error:%s cause:%s"
                          % ( e, stack))
            self.write_error(404, reason="Internal Error")

#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = ['"shuguangbo" <1262448230@qq.com>']

import logging
import traceback
import json
from base.handler import BaseHandler
from poem import sc

class GetPoemHandler(BaseHandler):
    def __init__(self, application, request, **kwargs):
        super(GetPoemHandler, self).__init__(application, request, **kwargs)

    def get(self, *args, **kwargs):
        id = self.get_argument("id", "")
        try :
            tts_text, poem = sc.get_poem(id=id)
        except Exception as e:
            import traceback
            stack = traceback.format_exc()
            logging.error("get poem details failed - error:%s cause:%s"
                          % ( e, stack))
            self.write_error(404, reason="Internal Error")
        else:
            self.render_html("poem_detail.html", poem=poem, tts_text=tts_text)
 
class DailyPoemHandler(BaseHandler):
    def __init__(self, application, request, **kwargs):
        super(DailyPoemHandler, self).__init__(application, request, **kwargs)

    def get(self, *args, **kwargs):
        try :
            tts_text, poem = sc.get_poem(id='')
        except Exception as e:
            import traceback
            stack = traceback.format_exc()
            logging.error("get poem failed - error:%s cause:%s"
                          % ( e, stack))
            self.write_error(404, reason="Internal Error")
        else:
#            self.render_html("daily_poem.html", poem=poem, tts_text=tts_text)
            self.render_html("poem_detail.html", poem=poem, tts_text=tts_text)


###############################################################################
### REST API 
###############################################################################
class restDailyPoemHandler(BaseHandler):
    def __init__(self, application, request, **kwargs):
        super(restDailyPoemHandler, self).__init__(application, request, **kwargs)

    def get(self, *args, **kwargs):
        try :
            poem = sc.get_poem(id='', type='json')
        except Exception as e:
            import traceback
            stack = traceback.format_exc()
            logging.error("get poem failed - error:%s cause:%s"
                          % ( e, stack))
            self.write_error(404, reason="Internal Error")
        else:
            self.write(poem)

class restGetPoemHandler(BaseHandler):
    def __init__(self, application, request, **kwargs):
        super(restGetPoemHandler, self).__init__(application, request, **kwargs)

    def get(self, *args, **kwargs):
        id = self.get_argument("id", "")
        try :
            poem = sc.get_poem(id=id, type='json')
        except Exception as e:
            import traceback
            stack = traceback.format_exc()
            logging.error("get poem details failed - error:%s cause:%s"
                          % ( e, stack))
            self.write_error(404, reason="Internal Error")
        else:
            self.write(poem)

class restSavePoemHandler(BaseHandler):
    def __init__(self, application, request, **kwargs):
        super(restSavePoemHandler, self).__init__(application, request, **kwargs)

    def post(self, *args, **kwargs):
        poem = json.loads(self.get_argument("art", ""), encoding='utf-8')
        print "json load : "
        print poem
        try :
            ret = sc.save_poem(poem=poem, type='json')
        except Exception as e:
            import traceback
            stack = traceback.format_exc()
            logging.error("save poem details failed - error:%s cause:%s"
                          % ( e, stack))
            self.write_error(404, reason="Internal Error")
#        else:
#            self.write(ret)

class restDelPoemHandler(BaseHandler):
    def __init__(self, application, request, **kwargs):
        super(restDelPoemHandler, self).__init__(application, request, **kwargs)

    def post(self, *args, **kwargs):
        id = self.get_argument("id", "")
        try :
            ret = sc.del_poem(id=id)
        except Exception as e:
            import traceback
            stack = traceback.format_exc()
            logging.error("save poem details failed - error:%s cause:%s"
                          % ( e, stack))
            self.write_error(404, reason="Internal Error")

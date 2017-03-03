#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = ['"shuguangbo" <1262448230@qq.com>']

import tornado.web
from jinja2 import Environment, FileSystemLoader, TemplateNotFound
 
class TemplateRendering(object):
  """
  A simple class to hold methods for rendering templates.
  """
  def render_template(self, template_name, **kwargs):
    template_dirs = []
    if self.settings.get('template_path', ''):
        template_dirs.append(self.settings['template_path'])
    env = Environment(loader=FileSystemLoader(template_dirs))
 
    try:
        template = env.get_template(template_name)
    except TemplateNotFound:
      raise TemplateNotFound(template_name)
    content = template.render(kwargs)
    return content 

class BaseHandler(tornado.web.RequestHandler, TemplateRendering):
    """定义公共函数
    """
    def initializa(self):
        pass

    def get_json(self):
        args = json_decode(self.request.body)
        return args if args else None

    def get_json_argument(self, name, default = None):
        args = json_decode(self.request.body)
        name = to_unicode(name)
        if name in args:
            return args[name]
        elif default is not None:
            return default
        else:
            raise MissingArgumentError(name)

    def get_current_user(self):
        user = self.get_secure_cookie('user')
        return user if user else None
   
    def render_html(self, template_name, **kwargs):
        kwargs.update({
          'settings': self.settings,
          'STATIC_URL': self.settings.get('static_url_prefix', '/static/'),
          'request': self.request,
          'current_user': self.current_user,
          'xsrf_token': self.xsrf_token,
          'xsrf_form_html': self.xsrf_form_html,
        })
        content = self.render_template(template_name, **kwargs)
        self.write(content)

    def get_error_html(self, status_code, **kwargs):
        reason = kwargs.get('reason', "Server Error")
        exception = kwargs.get('exception', "")

        return self.render_string("error.html", code=str(status_code),
                                  reason=str(reason), exception=str(exception))


class ErrorHandler(BaseHandler):
    """处理错误信息
    """
    def __init__(self, application, request, **kwargs):
        super(ErrorHandler, self).__init__(application, request, **kwargs)

    def get(self):
        self.render_html("404.html")

class HomeHandler(BaseHandler):
    """ 主页面
    """
    def __init__(self, application, request, **kwargs):
        super(HomeHandler, self).__init__(application, request, **kwargs)

    def get(self):
        self.render_html("home.html")



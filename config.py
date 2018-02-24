#!/usr/bin/python
# -*- coding: utf-8 -*-

__author__ = ['"shuguangbo" <1262448230@qq.com>']

debug = True

import os

# static path
static_path = os.path.join(os.path.dirname(__file__), "static")
# Data path
data_path = os.path.join(os.path.dirname(__file__), "static/data")

# template path
template_path = os.path.join(os.path.dirname(__file__), "templates")

repo_file = data_path + "/shici_repo.json"
phrase_file = data_path + "/shici_phrase.json"
comment_file = data_path + "/shici_comment.json"

# admin 帐号密码
username = "admin"
password = "admin"


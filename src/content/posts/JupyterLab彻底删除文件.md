---
title: JupyterLab彻底删除文件
published: 2025-12-17
pinned: false
description: JupyterLab彻底删除文件。
tags: [Ubuntu, JupyterLab]
category: 杂项
draft: false
date: 2025-12-17
pubDate: 2
---

JupyterLab删除的文件会被保存在Trash路径，通过以下命令访问。

```
cd ~/.local/share/Trash
```

查看回收站占用了多少空间：

```
du -sh ~/.local/share/Trash/
```

彻底清空回收站：

```
rm -rf ~/.local/share/Trash/files/*
```
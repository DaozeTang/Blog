---
title: 修改Docker默认安装路径
published: 2025-12-13
pinned: false
description: 修改Docker默认安装路径。
tags: [Docker]
category: 杂项
draft: false
date: 2025-12-13
pubDate: 2025-12-13
---

PowerShell运行命令。

```
Start-Process 'Docker Desktop Installer.exe' -Wait "install --installation-dir=<path>"
```
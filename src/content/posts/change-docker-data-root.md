---
title: 修改Docker默认安装路径
published: 2025-12-13
pinned: false
description: 修改Docker默认安装路径。
tags: [Docker]
category: Linux 运维
draft: false
---

PowerShell运行命令。

```
Start-Process 'Docker Desktop Installer.exe' -Wait "install --installation-dir=<path>"
```
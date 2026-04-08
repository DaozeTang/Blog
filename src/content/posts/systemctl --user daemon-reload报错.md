---
title: systemctl --user daemon-reload报错
published: 2026-04-08
pinned: false
description: systemctl --user daemon-reload报错解决。
tags: [Ubuntu]
category: 杂项
draft: false
date: 2026-04-08
pubDate: 2026-04-08
---

运行 systemctl --user daemon-reload 时，遇到如下报错。

```
Failed to connect to bus: $DBUS_SESSION_BUS_ADDRESS and $XDG_RUNTIME_DIR not defined (consider using --machine=<user>@.host --user to connect to bus of other user)
```

解决方案，依次运行以下命令。

```
export XDG_RUNTIME_DIR="/run/user/$(id -u)"
export DBUS_SESSION_BUS_ADDRESS="unix:path=${XDG_RUNTIME_DIR}/bus"
```
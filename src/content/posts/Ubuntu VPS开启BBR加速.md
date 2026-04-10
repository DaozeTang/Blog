---
title: Ubuntu VPS开启BBR加速
published: 2026-4-10
pinned: false
description: Ubuntu VPS开启BBR加速。
tags: [VPS, BBR, Ubuntu]
category: 杂项
draft: false
date: 2026-4-10
pubDate: 2026-4-10
---

1.检查内核版本
首先，确认系统内核是否满足要求。在终端输入以下命令：

```
uname -r
```

如果输出的版本号低于 4.9，则需要升级内核。通常，Ubuntu 16.04 及以上版本都支持 BBR。

2.写入 BBR 配置
需要将启用 BBR 的参数写入系统的配置文件中。依次执行以下两条命令：

```
echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
```

3.应用配置
执行完上述命令后，需要让系统重新加载配置文件才能生效。输入以下命令：

```
sysctl -p
```

4.验证 BBR 是否启用
最后，验证 BBR 是否已成功启用。输入以下命令：

```
# 检查 TCP 拥塞控制算法
sysctl net.ipv4.tcp_congestion_control
```

预期输出：net.ipv4.tcp_congestion_control = bbr

```
# 检查 BBR 内核模块是否已加载
lsmod | grep bbr
```

预期输出：类似 tcp_bbr                20480  14 的字样

以上两项验证通过，则成功开启了 BBR 加速。
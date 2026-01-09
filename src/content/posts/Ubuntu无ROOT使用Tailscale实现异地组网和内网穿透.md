---
title: Ubuntu无ROOT使用Tailscale实现异地组网和内网穿透
published: 2026-01-10
pinned: false
description: Ubuntu无ROOT使用Tailscale实现异地组网和内网穿透。
tags: [Ubuntu, Tailscale, 异地组网, 内网穿透]
category: 杂项
draft: false
date: 2026-01-10
pubDate: 2026-01-10
---

访问[https://pkgs.tailscale.com/stable/#static](https://pkgs.tailscale.com/stable/#static)选择对应处理器类的版本下载。

压缩包中可以得到类似'tailscale_1.92.5_amd64'的文件夹，其中包含'tailscale'、'tailscaled'等，将其解压至'~/tailscale_1.92.5_amd64'路径。

相对路径运行遇到问题可以尝试将'~'替换为'/home/[username]'。'

首先启动守护程序，依次执行：

```
mkdir -p ~/.local/share/tailscale

# 启动 tailscaled（后台）
nohup ~/tailscale_1.92.5_amd64/tailscaled \
  --tun=userspace-networking \
  --state=~/.local/share/tailscale/tailscaled.state \
  --socket=~/.local/share/tailscale/tailscaled.sock \
  --socks5-server=127.0.0.1:1055 \
  --outbound-http-proxy-listen=127.0.0.1:1055 \
  > ~/.local/share/tailscale/tailscaled.log 2>&1 &
```

使用前需要先绑定账户：

```
~/tailscale_1.92.5_amd64/tailscale --socket=~/.local/share/tailscale/tailscaled.sock up
```

验证是否上线：

```
~/tailscale_1.92.5_amd64/tailscale --socket=~/.local/share/tailscale/tailscaled.sock status
```

端口暴露给 tailnet [可选]：

```
# tcp协议
~/tailscale_1.92.5_amd64/tailscale --socket=~/.local/share/tailscale/tailscaled.sock serve --tcp 2222 tcp://localhost:22

# http协议
~/tailscale_1.92.5_amd64/tailscale --socket=~/.local/share/tailscale/tailscaled.sock serve localhost:3000
```

查看当前暴露状态：

```
~/tailscale_1.92.5_amd64/tailscale --socket=~/.local/share/tailscale/tailscaled.sock serve status
```

关闭：

```
~/tailscale_1.92.5_amd64/tailscale --socket=~/.local/share/tailscale/tailscaled.sock serve reset
```
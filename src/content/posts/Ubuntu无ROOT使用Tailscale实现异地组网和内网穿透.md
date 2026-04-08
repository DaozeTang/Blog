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

# 配置手动启动

访问[https://pkgs.tailscale.com/stable/#static](https://pkgs.tailscale.com/stable/#static)选择对应处理器类的版本下载。

压缩包中可以得到类似'tailscale_1.92.5_amd64'的文件夹，其中包含'tailscale'、'tailscaled'等，将其解压至'/home/[username]/tailscale_1.92.5_amd64'路径。

首先启动守护程序，依次执行：

```
mkdir -p /home/[username]/.local/share/tailscale

# 启动 tailscaled（后台）
nohup /home/[username]/tailscale_1.92.5_amd64/tailscaled \
  --tun=userspace-networking \
  --state=/home/[username]/.local/share/tailscale/tailscaled.state \
  --socket=/home/[username]/.local/share/tailscale/tailscaled.sock \
  --socks5-server=127.0.0.1:1055 \
  --outbound-http-proxy-listen=127.0.0.1:1055 \
  > /home/[username]/.local/share/tailscale/tailscaled.log 2>&1 &
```

使用前需要先绑定账户：

```
/home/[username]/tailscale_1.92.5_amd64/tailscale --socket=/home/[username]/.local/share/tailscale/tailscaled.sock up
```

验证是否上线：

```
/home/[username]/tailscale_1.92.5_amd64/tailscale --socket=/home/[username]/.local/share/tailscale/tailscaled.sock status
```

端口暴露给 tailnet [可选]：

```
# tcp协议
/home/[username]/tailscale_1.92.5_amd64/tailscale --socket=/home/[username]/.local/share/tailscale/tailscaled.sock serve --tcp 2222 tcp://localhost:22

# http协议
/home/[username]/tailscale_1.92.5_amd64/tailscale --socket=/home/[username]/.local/share/tailscale/tailscaled.sock serve localhost:3000
```

查看当前暴露状态：

```
/home/[username]/tailscale_1.92.5_amd64/tailscale --socket=/home/[username]/.local/share/tailscale/tailscaled.sock serve status
```

关闭：

```
/home/[username]/tailscale_1.92.5_amd64/tailscale --socket=/home/[username]/.local/share/tailscale/tailscaled.sock serve reset
```

# 设置开机自启

1. 启用用户驻留 (Linger)
默认情况下，用户级 systemd 服务只有在用户登录时才会启动，在用户登出时会关闭。启用 linger 可以让服务在系统开机时自动启动。
运行以下命令：

```
loginctl enable-linger [username]
```

可以通过 ls /var/lib/systemd/linger 查看是否生成了 [username] 文件来确认是否成功。

2. 创建 Systemd 服务目录
为当前用户创建 systemd 配置目录：

```
mkdir -p ~/.config/systemd/user
```

3. 创建 tailscaled 服务文件
使用习惯的编辑器（nano 或 vim）创建服务配置文件：

```
nano ~/.config/systemd/user/tailscaled.service
```

将以下内容粘贴进去：

```
[Unit]
Description=Tailscale Userspace Daemon
After=network.target

[Service]
Type=simple
# 启动 tailscaled 进程
ExecStart=/home/[username]/tailscale_1.92.5_amd64/tailscaled \
  --tun=userspace-networking \
  --state=/home/[username]/.local/share/tailscale/tailscaled.state \
  --socket=/home/[username]/.local/share/tailscale/tailscaled.sock \
  --socks5-server=127.0.0.1:1055 \
  --outbound-http-proxy-listen=127.0.0.1:1055

# 崩溃后自动重启
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

保存并退出。

4. 重新加载并启动服务
执行以下命令让 systemd 识别新服务，并设置为开机自启：

```
# 重新加载 user systemd 守护进程
systemctl --user daemon-reload

# 设置开机自启
systemctl --user enable tailscaled.service

# 立即启动服务 (启动前确保之前手动后台运行的 tailscaled 进程已经被 kill 掉)
systemctl --user start tailscaled.service
```

5. 查看运行状态和日志
现在，tailscaled 已经被 systemd 托管了。

```
# 查看状态
systemctl --user status tailscaled.service

# 查看运行日志（替代 > tailscaled.log）
journalctl --user -u tailscaled.service -f
```
---
title: JupyterLab在Ubuntu系统上的部署流程
published: 2025-12-17
pinned: false
description: JupyterLab在Ubuntu系统上的部署流程。
tags: [Ubuntu, JupyterLab]
category: 杂项
draft: false
date: 2025-12-17
pubDate: 2025-12-17
---

# 第一步：准备 Miniconda 环境

创建专属虚拟环境：

```
# 创建一个名为 jupyterlab 的环境，指定 Python 版本
conda create -n jupyterlab python=3.13.9 -y

# 激活环境
conda activate jupyterlab
```

# 第二步：安装 JupyterLab

在激活的环境中安装：

```
conda install -c conda-forge jupyterlab -y
```

# 第三步：生成并修改配置文件

生成配置文件：

```
jupyter lab --generate-config
```

设置访问密码：

```
jupyter server password
```

*输入两次密码后，系统会将哈希后的密码写入配置文件。*

修改配置文件：

```
vim ~/.jupyter/jupyter_lab_config.py
```

在文件末尾添加（或取消注释并修改）以下几行关键配置：

```
# 允许监听所有 IP (0.0.0.0)，这样才能通过外部 IP 访问
c.ServerApp.ip = '0.0.0.0'

# 禁止服务器端自动打开浏览器 (因为是纯命令行环境)
c.ServerApp.open_browser = False

# 指定一个固定的端口 (选一个不太常用的，比如 8899，避免默认 8888 冲突)
c.ServerApp.port = 8899

# 允许远程访问
c.ServerApp.allow_remote_access = True

# 允许显示隐藏文件
c.ContentsManager.allow_hidden = True

# (可选) 设置根目录，如果不设则默认为启动命令所在的目录
# c.ServerApp.root_dir = '/home/your_username/projects'
```

# 第四步：启动 JupyterLab

```
jupyter lab
```

# 部署完成

# 设置开机启动运行

1. 获取 JupyterLab 的绝对路径

首先，需要找出 conda 环境中 jupyter-lab 程序的绝对路径。打开终端，运行：

```
conda activate tangdz-jupyterlab
which jupyter-lab
```

终端会输出一个路径，通常长这样：

```
/home/[username]/miniconda3/envs/[envname]/bin/jupyter-lab
```

把这串路径复制下来。

2. 创建 Systemd 服务文件

使用习惯的编辑器创建一个新的服务配置文件：

```
nano ~/.config/systemd/user/jupyterlab.service
```

将以下内容粘贴进去（注意替换刚刚复制的绝对路径）：

```
[Unit]
Description=JupyterLab Server
After=network.target

[Service]
Type=simple
# 设置 JupyterLab 启动时的默认工作目录
WorkingDirectory=/home/[username]

# 这里的环境变量是为了确保 jupyter 能够找到正确的 conda 依赖
Environment="PATH=/home/[username]/miniconda3/envs/[envname]/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# 替换为刚刚通过 which 命令查到的绝对路径
ExecStart=[绝对路径] --no-browser --ip=0.0.0.0

# 崩溃后自动重启
Restart=always
RestartSec=10

[Install]
WantedBy=default.target
```

3. 重新加载并启动服务

```
# 重新加载 user systemd 守护进程
systemctl --user daemon-reload

# 设置开机自启
systemctl --user enable jupyterlab.service

# 立即启动服务
systemctl --user start jupyterlab.service
```

4. 检查状态和日志

查看运行状态：

```
systemctl --user status jupyterlab.service
```

查看日志（获取 Token）：
```
journalctl --user -u jupyterlab.service -n 50 -f
```
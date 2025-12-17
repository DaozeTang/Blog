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

下载并安装 Miniconda（如果已安装可跳过）：

```
mkdir -p ~/miniconda3
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda3/miniconda.sh
bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3
rm -rf ~/miniconda3/miniconda.sh
~/miniconda3/bin/conda init bash
source ~/.bashrc
```

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
---
title: Ubuntu无ROOT权限安装、优化和使用Screen
published: 2025-12-17
pinned: false
description: Ubuntu无ROOT权限安装、优化和使用Screen。
tags: [Ubuntu, Screen]
category: 杂项
draft: false
date: 2025-12-17
pubDate: 2025-12-17
---

# 安装Screen
## 一：如果有 Conda 环境：

```
conda install -c conda-forge screen
```

## 二：从源码编译安装

1.创建本地安装目录

```
mkdir -p ~/local/src
cd ~/local/src
```

2.下载 Screen 源码，以 4.9.0 为例

```
wget https://ftp.gnu.org/gnu/screen/screen-4.9.0.tar.gz
tar -xzvf screen-4.9.0.tar.gz
cd screen-4.9.0
```

3.配置并指定安装路径

```
./configure --prefix=$HOME/local
```

4.编译并安装

```
make
make install
```

5.配置环境变量

```
echo 'export PATH=$HOME/local/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

# 配置Screen

在你的用户主目录下创建或编辑配置文件.screenrc：

```
vim ~/.screenrc
```

在配置文件中写入内容：

```
# ==============================
#  General Settings
# ==============================
# 关闭启动画面
startup_message off

# 设置大回滚缓冲区
defscrollback 1000000

# 编码设置
defutf8 on
defencoding utf8

# 关闭闪屏警告
vbell off

# 允许终端直接滚动 (非常重要)
termcapinfo xterm* ti@:te@

# 自动 detach (如果网络断开，自动挂起会话而不是直接杀掉。)
autodetach on

# ==============================
#  Status Bar (Theming)
# ==============================
# 始终显示底部状态栏
hardstatus alwayslastline

# 颜色与格式定义
# 格式解释：
# 绿色主机名 | 窗口列表(当前窗口高亮红白) | 黄色日期时间
hardstatus string '%{= kG}[ %{G}%H %{g}][%= %{= kw}%?%-Lw%?%{r}(%{W}%n*%f%t%?(%u)%?%{r})%{w}%?%+Lw%?%?%= ][ %{y}%Y-%m-%d %{W}%c %{g}]'

# ==============================
#  Key Bindings (Optional)
# ==============================
# 如果你想快速切换窗口 (F7/F8)
bindkey -k k7 prev
bindkey -k k8 next
```

配置好 ~/.screenrc 后，新开启的会话自动生效。

已经运行中的会话，需要：

```
1.在 Screen 会话中，按下 Ctrl + a。

2.松开手，输入 : (冒号，进入 Screen 的命令行模式)。

3.输入以下命令并回车：
source ~/.screenrc
```

# 使用Screen

新建命名会话：

```
screen -S <name>
```

列出所有会话：

```
screen -ls
```

恢复会话：

```
screen -r <id或name>
```

强制恢复：

```
screen -d -r <id或name>
```

关闭会话：

```
screen -X -S <name> quit
```
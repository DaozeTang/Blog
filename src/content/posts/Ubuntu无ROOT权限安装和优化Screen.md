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
$Id: screenrc,v 1.15 2003/10/08 11:39:03 zal Exp $
#
# /etc/screenrc
#
#   This is the system wide screenrc.
#
#   You can use this file to change the default behavior of screen system wide
#   or copy it to ~/.screenrc and use it as a starting point for your own
#   settings.
#
#   Commands in this file are used to set options, bind screen functions to
#   keys, redefine terminal capabilities, and to automatically establish one or
#   more windows at the beginning of your screen session.
#
#   This is not a comprehensive list of options, look at the screen manual for
#   details on everything that you can put in this file.
#

# ------------------------------------------------------------------------------
# SCREEN SETTINGS
# ------------------------------------------------------------------------------

startup_message off
#nethack on

#defflow on # will force screen to process ^S/^Q
deflogin on
#autodetach off
autodetach on

# turn visual bell on
#vbell on
#vbell_msg "   Wuff  ----  Wuff!!  "
vbell off

# define a bigger scrollback, default is 100 lines
defscrollback 102400

# ------------------------------------------------------------------------------
# SCREEN KEYBINDINGS
# ------------------------------------------------------------------------------

# Remove some stupid / dangerous key bindings
bind ^k
#bind L
bind ^\
# Make them better
bind \\ quit
bind K kill
bind I login on
bind O login off
bind } history

# An example of a "screen scraper" which will launch urlview on the current
# screen window
#
#bind ^B eval "hardcopy_append off" "hardcopy -h $HOME/.screen-urlview" "screen urlvi>

# ------------------------------------------------------------------------------
# TERMINAL SETTINGS
# ------------------------------------------------------------------------------

# The vt100 description does not mention "dl". *sigh*
termcapinfo vt100 dl=5\E[M


# --- MODIFIED SECTION START ---

# 1. Disable the old hardstatus off setting to allow our bottom bar
# hardstatus off
hardstatus on

# 2. Define custom commands (Backticks) to fetch dynamic info
#    %1` will hold the Username (runs 'whoami' once)
backtick 1 0 0 whoami

#    %2` will hold the Session ID/PID (Using $PPID is more reliable than $STY here)
backtick 2 0 0 sh -c 'echo $PPID'

# 3. Configure the status line (hardstatus)
#    Use 'alwayslastline' to fix it at the bottom of the terminal.
#hardstatus alwayslastline
hardstatus on

# 4. Define the format string
#    Format: Hostname | Username | Session ID | Session Name | Date Time
#    Colors: %{= kw} (Black bg, White fg), %{g} (Green separators), etc.
#hardstatus string "%{= kw}%H %{g}| %{C}%1` %{g}| %{M}%2` %{g}| %{Y}%S %{g}| %{W}%Y-%m-%d %c"
hardstatus string "%2` | %S"

# --- MODIFIED SECTION END ---


# Set the hardstatus prop on gui terms to set the titlebar/icon title
termcapinfo xterm*|rxvt*|kterm*|Eterm* hs:ts=\E]0;:fs=\007:ds=\E]0;\007
# use this for the hard status string (Commented out old default string)
#hardstatus string "%h%? users: %u%?"

# An alternative hardstatus to display a bar at the bottom listing the
# windownames and highlighting the current windowname in blue. (This is only
# enabled if there is no hardstatus setting for your terminal)
#
#hardstatus lastline "%-Lw%{= BW}%50>%n%f* %t%{-}%+Lw%<"

# set these terminals up to be 'optimal' instead of vt100
termcapinfo xterm*|linux*|rxvt*|Eterm* OP

# Change the xterm initialization string from is2=\E[!p\E[?3;4l\E[4l\E>
# (This fixes the "Aborted because of window size change" konsole symptoms found
#  in bug #134198)
termcapinfo xterm 'is=\E[r\E[m\E[2J\E[H\E[?7h\E[?1;4;6l'

# To get screen to add lines to xterm's scrollback buffer, uncomment the
# following termcapinfo line which tells xterm to use the normal screen buffer
# (which has scrollback), not the alternate screen buffer.
#
termcapinfo xterm*|xterms|xs|rxvt ti@:te@

# Enable non-blocking mode to better cope with flaky ssh connections.
defnonblock 5

# ------------------------------------------------------------------------------
# STARTUP SCREENS
# ------------------------------------------------------------------------------

# Example of automatically running some programs in windows on screen startup.
#
#   The following will open top in the first window, an ssh session to monkey
#   in the next window, and then open mutt and tail in windows 8 and 9
#   respectively.
#
# screen top
# screen -t monkey ssh monkey
# screen -t mail 8 mutt
# screen -t daemon 9 tail -f /var/log/daemon.log
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
---
title: Ubuntu VPS自建代理节点
published: 2026-4-10
pinned: false
description: Ubuntu VPS自建代理节点。
tags: [VPS, 代理节点, Ubuntu]
category: 杂项
draft: false
date: 2026-4-10
pubDate: 2026-4-10
---

1.更新系统并安装基础组件
进入服务器终端，依次执行以下命令：

```
sudo -i
apt update && apt upgrade -y
apt install curl wget -y
```

2.一键安装 3x-ui 面板
运行官方推荐的一键安装脚本：

```
bash <(curl -Ls https://raw.githubusercontent.com/mhsanaei/3x-ui/master/install.sh)
```
安装过程中，脚本会暂停并提示设置面板的访问端口（建议设置一个大于10000的不常用端口，设置好后需要在防火墙放行端口）。

安装完成后，会显示随机生成的用户名、密码、以及后台管理网站入口。


3.配置选项
在服务器终端中，输入以下命令呼出 3x-ui 管理菜单：

```
x-ui
```

输入对应选项，对默认随机生成的账户密码进行修改并启动BBR加速。

4.登录面板并创建节点
打开浏览器，访问后台管理入口，登陆账户。

点击左侧菜单的“入站列表 (Inbounds)”，然后点击“添加入站”。

推荐的防阻断配置：

```
协议 (Protocol)：vless
传输配置 (Network)：tcp
安全性 (Security)：reality （安全性设置中点击“Get New Cert”）
```

上述配置设置完成后，其余选项保持默认，直接点击“创建”。

在列表中找到刚创建的节点，点击操作栏的“查看”，然后复制节点分享链接（以 vless:// 开头的一长串字符）。将这串链接导入本地的客户端软件（V2rayN）中即可使用。
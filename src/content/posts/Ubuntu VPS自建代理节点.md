---
title: Ubuntu VPS自建代理节点
published: 2026-04-10
pinned: false
description: Ubuntu VPS自建代理节点。
tags: [VPS, 代理节点, Ubuntu]
category: 杂项
draft: false
date: 2026-04-10
pubDate: 2026-04-10
---

1. 更新系统并安装基础组件

进入服务器终端，依次执行以下命令：

```
sudo -i
apt update && apt upgrade -y
apt install curl wget -y
```

2. 一键安装 3x-ui 面板

运行官方推荐的一键安装脚本：

```
bash <(curl -Ls https://raw.githubusercontent.com/mhsanaei/3x-ui/master/install.sh)
```
安装过程中，脚本会暂停并提示设置面板的访问端口（建议设置一个大于10000的不常用端口，设置好后需要在防火墙放行端口）。

安装完成后，会显示随机生成的用户名、密码、以及后台管理网站入口。

3. 配置选项

在服务器终端中，输入以下命令呼出 3x-ui 管理菜单：

```
x-ui
```

输入对应选项，对默认随机生成的账户密码进行修改并启动BBR加速。

4. 登录面板并创建节点

打开浏览器，访问后台管理入口，登陆账户。

点击左侧菜单的“入站列表 (Inbounds)”，然后点击“添加入站”。

推荐的防阻断配置：

```
协议 (Protocol)：vless
传输配置 (Network)：tcp
安全性 (Security)：reality （安全性设置中点击“Get New Cert”）
```

上述配置设置完成后，其余选项保持默认，直接点击“创建”。

在列表中找到刚创建的节点，点击操作栏的“查看”，然后复制节点分享链接（以 vless:// 开头的一长串字符）。将这串链接直接导入本地的客户端软件（V2rayN）中即可使用。

5. 使用 Clash Verge 连接 Vless 节点

Clash Verge 连接 Vless 节点需要使用 [.yaml] 配置文件，文件名任意。按照如下模板将 vless 链接中的参数手动填入模板中或使用 Gemini 等 AI 帮忙转换填写。

```
mode: rule
log-level: info
allow-lan: false

# 代理节点配置区域
proxies:
  - name: "My-VLESS-Node"          # [自定义] 节点名称，可以随便改（如 "US-Node-1"）
    type: vless
    server: YOUR_SERVER_IP         # [必填] 替换为服务器 IP 或域名
    port: YOUR_PORT                # [必填] 替换为节点端口 (纯数字，如 443)
    uuid: YOUR_UUID                # [必填] 替换为 UUID
    network: tcp                   # 传输协议，通常为 tcp, ws 或 grpc
    tls: true
    udp: true
    servername: YOUR_SNI           # [必填] 替换为伪装域名 (SNI，如 aws.amazon.com)
    client-fingerprint: chrome     # 客户端指纹，建议保留 chrome 或 safari
    reality-opts:                  # Reality 专属配置 (如果新节点不是 Reality 协议，删除这两行)
      public-key: YOUR_PUBLIC_KEY  # [必填] 替换为 Public Key (pbk)
      short-id: YOUR_SHORT_ID      # [选填] 替换为 Short Id (sid)，如果没有则删除此行

# 代理组配置区域
proxy-groups:
  - name: "PROXIES"
    type: select
    proxies:
      - "My-VLESS-Node"            # [注意] 这里的名字必须和上面 proxies 里的 name 一模一样

# 路由规则区域 (已配置绕过大陆)
rules:
  # 1. 局域网及本地流量直连 (防止影响本地打印机、NAS 等)
  - GEOSITE,private,DIRECT
  - GEOIP,lan,DIRECT,no-resolve
  
  # 2. 绕过大陆网站
  - GEOSITE,cn,DIRECT
  
  # 3. 绕过大陆 IP
  - GEOIP,cn,DIRECT
  
  # 4. 其他所有流量走代理组
  - MATCH,PROXIES
```

填写好配置文件后，将配置文件直接拖入 Clash Verge 的 [订阅] UI 页面中，选中后即可同其他订阅链接般正常使用。

实测，Cloudflare WARP 的 IP 无法解锁服务。如果需要访问流媒体或AI，需要选择原生纯净 IP 的 VPS 或使用 DNS解锁 / 静态ISP代理 等方式。
---
title: macOS 多开任意应用：以微信为例
published: 2026-05-30
pinned: false
description: 复制应用、修改 Bundle ID 并重新签名，在 macOS 上为任意应用实现多开。以微信 4.0.5+ 双开为例。
tags: [macOS, 微信, 效率, 玩机技巧, 教程]
category: macOS
draft: false
---

macOS 上很多应用默认只能开一个实例，双击图标只会激活已有窗口。原因是应用按 **Bundle ID**（`CFBundleIdentifier`，应用唯一标识）做进程互斥：检测到相同 ID 的进程已存在，就不再新开。

绕过的思路：复制一份应用 → 给副本换一个不同的 Bundle ID → 系统将其视为另一个应用，与原版互不干扰。由于改动了 `Info.plist`，原签名会失效（提示"应用已损坏"），所以最后需重新签名。整个过程不修改原版、不注入插件。

## ⌘N、open -n、复制重签名的区别

| 操作 | 打开的是 | 进程 | 数据 / 账号 |
| --- | --- | --- | --- |
| `⌘N` | 新窗口 | 同一进程 | 视应用而定 |
| `open -n` | 新实例 | 独立进程 | 视应用而定 |
| 复制 + 重签名 | 新应用 | 独立进程 | 完全独立 |

- **`⌘N`**：应用内快捷键，行为完全由应用定义，且始终在同一进程内。多数应用只是新建窗口、共用账号；但内置多账号的应用（如 QQ）可借此直接登录第二个账号，无需后续步骤。微信等不支持的应用，则需用方法二。
- **`open -n`**：终端命令，强制启动新进程，但绕不过应用自身的进程互斥（微信等会立即退出或切回原窗口）。
- **复制 + 重签名**：从应用身份层面解决，可登录第二个账号。

## 方法一：open -n

原生支持多实例的应用，一行即可：

```bash
open -n /Applications/Safari.app
```

能开出独立窗口即成功。微信 4.0.5+、QQ、Telegram 等做了互斥的应用对此无效，用方法二。

## 方法二：复制 + 改 Bundle ID + 重新签名

适用于按 Bundle ID 互斥的应用。下面以微信为例，套用到其他应用时替换路径与 ID 即可（路径含空格或中文时用引号括起）。

**1. 查看原始 Bundle ID**

```bash
/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" "/Applications/WeChat.app/Contents/Info.plist"
```

微信结果一般为 `com.tencent.xinWeChat`，副本在其后加后缀即可。

**2. 复制副本**

```bash
sudo cp -R /Applications/WeChat.app "/Applications/微信双开.app"
```

回车后输入开机密码（不显示字符）。不想用 `sudo` 可改放到 `~/Applications`。

**3. 改 Bundle ID**

```bash
sudo /usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier com.tencent.xinWeChat.dual" "/Applications/微信双开.app/Contents/Info.plist"
```

无输出即成功。

**4. 重新签名**（ad-hoc 签名，`-` 表示无需证书）

```bash
sudo codesign --force --deep --sign - "/Applications/微信双开.app"
```

提示 `replacing existing signature` 即成功。若找不到 `codesign`，先装命令行工具：`xcode-select --install`。

**5. 启动并固定**

双击副本，或 `open "/Applications/微信双开.app"`。在 Dock 右键图标 →「选项」→「在程序坞中保留」。

微信双开完整命令：

```bash
sudo cp -R /Applications/WeChat.app "/Applications/微信双开.app"
sudo /usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier com.tencent.xinWeChat.dual" "/Applications/微信双开.app/Contents/Info.plist"
sudo codesign --force --deep --sign - "/Applications/微信双开.app"
```

完成后先开原版登录账号 A，再开副本登录账号 B。

## 常见问题

**提示"应用已损坏"**：清除扩展属性后重签。

```bash
sudo xattr -cr "/Applications/微信双开.app"
sudo codesign --force --deep --sign - "/Applications/微信双开.app"
```

**副本无法联网 / 不同步**：检查防火墙是否拦截；关闭微信「自动登录」（设置 → 账号与储存）；必要时 `sudo killall -9 WeChat` 后重开。

**更新后副本失效**：官方更新只覆盖原版，副本停留在旧版本。重跑步骤 2–4 覆盖即可。

**不适用的情况**：原生支持多开的用 `open -n` 即可；靠锁文件、单一端口或服务端登录态互斥的，改 ID 无效；启用强校验或依赖推送、钥匙串共享、App Groups 等权限的应用，重签名可能使相关功能失效；App Store 沙盒应用因收据校验可能打不开。

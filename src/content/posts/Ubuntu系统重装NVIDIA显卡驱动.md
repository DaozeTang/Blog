---
title: Ubuntu系统重装NVIDIA显卡驱动
published: 2025-12-31
pinned: false
description: Ubuntu系统重装NVIDIA显卡驱动。
tags: [Ubuntu, NVIDIA, 驱动]
category: 杂项
draft: false
date: 2025-12-31
pubDate: 2025-12-31
---

1. 卸载现有驱动

运行以下命令彻底清除旧驱动（不用担心，重启后会使用通用显示驱动）：

```
sudo apt-get --purge remove "*nvidia*"
sudo apt-get --purge remove "*libnvidia*"
sudo apt-get autoremove
```

2. 确认推荐驱动版本

清除后，检查系统推荐的驱动版本：

```
ubuntu-drivers devices
```

会看到类似 driver   : nvidia-driver-580-open - distro non-free recommended 的输出。记住那个 recommended 的版本号或其他自己想要安装的版本。

3. 重新安装驱动

可以选择自动安装推荐版本，或者手动指定版本。

方法 A：自动安装

```
sudo ubuntu-drivers autoinstall
```

方法 B：手动安装指定版本
假设需要安装的是 nvidia-driver-580-server-open 版本：

```
sudo apt-get update
sudo apt-get install nvidia-driver-580-server-open5
```

4. 重启验证

安装完成后，重启：

```
sudo reboot
```

重启后再次输入 nvidia-smi，此时应该可以看到新的驱动信息了。
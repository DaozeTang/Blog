---
title: 安装Ubuntu双系统时Grub Install报错内存写入失败的解决方案
published: 2026-04-29
pinned: false
description: 安装Ubuntu双系统时Grub Install报错内存写入失败的解决方案。
tags: [Ubuntu, 双系统]
category: 杂项
draft: false
date: 2026-04-29
pubDate: 2026-04-29
---

1. 遇到的问题

安装 Ubuntu 双系统时 Grub Install 报错内存写入失败，多次尝试重装无效，确保已关闭安全启动，确保硬盘与 U 盘分区格式正确，确保镜像与 U 盘启动项无损坏。

2. 原因分析

现代主板使用 UEFI 替代了传统的 BIOS。UEFI 启动操作系统需要依赖一些“启动变量”（比如先启动 Windows 还是先启动 Ubuntu），这些变量保存在主板上一块名为 NVRAM（非易失性随机访问存储器）的芯片里。它的容量极其有限，通常只有 64KB 左右。

由于容量极小，NVRAM 是寸土寸金的。里面通常存放着：

启动项（Boot Entries）： 比如 Windows Boot Manager、ubuntu、网络唤醒启动项等。

硬件配置变量： 主板厂商自定义的一些底层硬件信息。

系统崩溃日志（pstore/dump）： 当 Linux 内核崩溃时，有一个叫 pstore 的机制会试图把崩溃日志（通常以 dump- 开头）写到 NVRAM 里以便下次开机排错。

早年间，Linux 在写入 NVRAM 时由于不加节制，导致一些设计缺陷的主板在 NVRAM 被写满后，主板直接“变砖”。为了防止背锅，Linux 内核开发者加入了“EFI Storage Paranoia（EFI 存储偏执/安全保护机制）”。规则规定，只要 Linux 发现主板 NVRAM 的剩余空间不足 50%，或者写入一个新的变量会导致剩余空间低于安全线，Linux 内核就会强制拒绝写入，直接报错（提示 No space left on device）。

安装 Ubuntu 到了最后一步，Ubuntu 需要把自己的启动项（GRUB）写进主板 NVRAM。但是，Linux 内核检查发现 NVRAM 空间已经超过了安全警戒线，触发了保护机制，拒绝了这次写入。因此安装程序报错。

3. 解决方案

在启动安装盘时，在内核参数中加入 efi_no_storage_paranoia。

这个参数的意思是：

efi_no_storage_paranoia = EFI 无存储偏执（关闭空间安全检查）

* 第一步：清理安装失败残留项

(1) 在 U 盘 Ubuntu 环境中清理 EFI 残留项

在终端输入 efibootmgr 并回车。

找到名字带有 ubuntu 的硬盘启动项，记下它的编号（比如 Boot0002）。

输入以下命令删除它：

```
sudo efibootmgr -b 0002 -B
```

注意硬盘启动项不要和 U 盘启动项搞混，不过此处把 U 盘启动项删了也没事，没有则跳过。

(2) 清理硬盘 EFI 分区里的残留文件

如果停留在 Ubuntu 环境，在终端输入 lsblk，找到 EFI 分区（通常是几百 MB 大小，标签可能是 /boot/efi，比如 sda1 或 nvme0n1p1）。

假设 EFI 分区是 nvme0n1p1，依次执行以下命令把它挂载并清理：

```
sudo mkdir -p /mnt/efi
sudo mount /dev/nvme0n1p1 /mnt/efi
sudo rm -rf /mnt/efi/EFI/ubuntu
sudo umount /mnt/efi
```

如果进入了 Windows 环境，可以直接使用 DiskGenius 操作删除。

打开 DiskGenius，在左侧的磁盘列表中，找到硬盘中标有 "ESP" 或 "EFI" 的小分区（FAT32格式）。

展开这个分区，点击里面的 EFI 文件夹。

找到 ubuntu 文件夹，右键 -> 强制删除，完成。

(3) 清理硬盘 Ubuntu 分区里的残留文件

将之前选择安装或挂载 Ubuntu 的分区格式化或删除成为空闲空间。


* 第二步：重新从 U 盘启动，添加启动参数

将 Ubuntu 安装 U 盘插入电脑，重启电脑，从 U 盘启动。

在菜单界面选中 "Try or Install Ubuntu" （试用或安装 Ubuntu），按下键盘上的字母 e 键，进入参数编辑模式。

此时会进入类似文本编辑器的界面，使用键盘的上、下、左、右方向键移动光标，找到以单词 linux 开头的那一行。

这行代码的末尾，通常会写着 quiet splash --- （有时候没有 ---）。

将光标移动到 quiet splash 的后面。

按一下空格键，然后输入参数：

```
efi_no_storage_paranoia
```

修改完成后，这一行的末尾看起来应该是这样的：

```
... quiet splash efi_no_storage_paranoia ---
```

(注意：如果原来有 ---，就把参数加在 --- 前面；如果没有，直接加在最后面就行。单词之间必须有空格隔开。)

确认无误后，按下键盘上的 F10 键。此时，系统会使用刚刚添加了“解除限制”参数的状态开始启动。

* 第三步：正常安装系统

顺利解决，不再报错。
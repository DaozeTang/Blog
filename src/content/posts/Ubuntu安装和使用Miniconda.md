---
title: Ubuntu安装和使用Miniconda
published: 2025-12-17
pinned: false
description: Ubuntu安装和使用Miniconda。
tags: [Ubuntu, Miniconda, Python]
category: 杂项
draft: false
date: 2025-12-17
pubDate: 2025-12-17
---

# 安装Miniconda

进入用户根目录，运行：

```
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
```

下载完成后，运行：

```
bash Miniconda3-latest-Linux-x86_64.sh
```

根据提示完成安装。

激活环境变量。

```
source ~/.bashrc
```

验证安装。

```
conda --version
```

如果最后一步初始化时选了no，可以手动执行：

```
~/miniconda3/bin/conda init bash
source ~/.bashrc
```

# 创建和使用虚拟环境

查询Conda可以安装的Python版本：

```
# 基础查询
conda search -f python

# 查看特定版本
conda search -f python=3.13
conda search -f "python>=3.10"

# 指定源查询（比如 conda-forge）
conda search -c conda-forge -f python

# 只看最新的几个版本
conda search -f python | tail -n 20
```

创建新的虚拟环境：

```
# 创建一个名为 new_env 的环境，指定 Python 3.13.9
conda create -n new_env python=3.13.9

# 绝对纯净方法，防止配置干扰
conda create -n new_env python=3.13.9 --no-default-packages
```

激活环境：

```
conda activate new_env
```

退出环境：

```
conda deactivate
```

查看环境：

```
conda env list
```

删除环境

```
conda remove -n new_env --all
```

克隆环境：

```
conda create -n new_new_env --clone new_env
```

# 卸载Miniconda

清理环境变量：

```
conda init --reverse --all
```

删除 Conda 的配置文件夹：

```
rm -rf ~/.condarc ~/.conda ~/.continuum
```

删除 Miniconda 文件夹：

```
rm -rf ~/miniconda3
```

手动清理 .bashrc：

1.使用编辑器或其他方式打开配置文件
```
vim ~/.bashrc
```

2.向下滚动到文件底部，找到类似下面被 >>> conda initialize >>> 包裹的代码块：
```
# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('/home/你的用户名/miniconda3/bin/conda' 'shell.bash' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/home/你的用户名/miniconda3/etc/profile.d/conda.sh" ]; then
        . "/home/你的用户名/miniconda3/etc/profile.d/conda.sh"
    else
        export PATH="/home/你的用户名/miniconda3/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<
```

3.删除这整个代码块。

刷新一下环境变量：

```
source ~/.bashrc
```
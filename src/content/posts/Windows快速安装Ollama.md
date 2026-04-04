---
title: Windows快速安装Ollama
published: 2026-4-5
pinned: false
description: Windows快速安装Ollama。
tags: [AI工具, LLM, Ollama]
category: 杂项
draft: false
date: 2026-4-5
pubDate: 2026-4-5
---

1.访问官网[https://ollama.com/download/OllamaSetup.exe](https://ollama.com/download/OllamaSetup.exe)下载安装包。

2.在安装包所在路径中启动Power Shell，输入如下命令，调整安装路径并启动安装。

```
.\OllamaSetup.exe /DIR="D:\Ollama"
```

3.继续输入如下命令，将模型存储路径写入系统变量。

```
[Environment]::SetEnvironmentVariable("OLLAMA_MODELS", "D:\Ollama\Models", "User")
```

安装完成，关闭Power Shell，重启Ollama。
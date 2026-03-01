---
title: Overleaf生成GB/T 7714国标格式参考文献的最小实现
published: 2026-03-01
pinned: false
description: Overleaf生成GB/T 7714国标格式参考文献的最小实现。
tags: [Overleaf, 协作]
category: 写作
draft: false
date: 2026-03-01
pubDate: 2026-03-01
---

编译器选择XeLaTeX，新建"ref.bib"文件填入参考文献bib信息，正文"main.tex"文件内容如下。


```
\documentclass{article}
\usepackage{graphicx}
\usepackage{ctex}

\usepackage{gbt7714}
\bibliographystyle{gbt7714-numerical}

\begin{document}

\section{Introduction}

引用参考文献\cite{[参考文献bib]}。

\bibliography{ref} % bib文件

\end{document}
```
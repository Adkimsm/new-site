---
title: "Markdown 能力综合演示"
date: "2026-08-30"
updated: "2026-08-30"
description: "用于验收标题、列表、表格、代码、引用、脚注和长文排版的演示文章。"
tags: ["Markdown", "Web", "演示"]
featured: true
canonical: "https://adk.bot.cd/posts/markdown-showcase"
---

# GFM 标准语法测试

普通段落，包含 **粗体**、*斜体*、***粗斜体***、~~删除线~~、`行内代码`、<kbd>Ctrl</kbd> + <kbd>C</kbd>、<mark>高亮</mark>、<sub>下标</sub>、<sup>上标</sup>、<abbr title="HyperText Markup Language">HTML</abbr>、&copy;、&amp;、&lt;、&gt;。

转义字符：\*不是斜体\*，\_不是斜体\_，\`不是代码\`，\# 不是标题，\[不是链接\]，\| 不是表格分隔。

硬换行（行尾两个空格）：  
这一行会换行。

反斜杠换行：\
这一行也会换行。

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

Setext 一级标题
===============

Setext 二级标题
---------------

---

***

___

## 引用

> 一级引用。
>
> > 嵌套引用。
> >
> > > 三级引用。
>
> 回到一级，引用中可以包含 **粗体**、`代码`、[链接](https://example.com)。
>
> - 引用中的列表
> - 第二项

## 列表

### 无序列表

- 项目一
- 项目二
  - 嵌套项目
  - 嵌套项目二
    - 第三层
- 项目三

+ 加号列表
+ 第二项

* 星号列表
* 第二项

### 有序列表

1. 第一项
2. 第二项
   1. 嵌套有序
   2. 嵌套有序二
3. 第三项

3. 从三开始
4. 下一项

### 任务列表

- [x] 已完成任务
- [ ] 未完成任务
- [x] 包含 **格式** 和 `代码` 的任务
  - [ ] 嵌套未完成
  - [x] 嵌套已完成

## 表格

| 左对齐 | 居中 | 右对齐 | 默认 |
| :--- | :---: | ---: | --- |
| A | B | C | D |
| **粗体** | *斜体* | `代码` | ~~删除~~ |
| 转义管道 \| | [链接](https://example.com) | 图片 ![小图](https://via.placeholder.com/20) | 文本 |

## 链接与图片

- 行内链接：[Example](https://example.com)
- 带标题链接：[Example](https://example.com "Example 标题")
- 引用式链接：[引用链接][ref-link]
- 自动链接：<https://example.com>
- 邮箱自动链接：<user@example.com>
- GFM 自动链接：https://github.com 和 www.github.com
- 图片：![替代文本](https://via.placeholder.com/150 "图片标题")
- 引用式图片：![引用图片][ref-image]
- 图片链接：[![可点击图片](https://via.placeholder.com/80)](https://example.com)

[ref-link]: https://example.com "引用式链接标题"
[ref-image]: https://via.placeholder.com/100 "引用式图片标题"

## 代码

行内代码：`const a = 1;`，包含反引号的代码：`` `反引号` ``。

缩进代码块：

    function hello() {
      console.log("Hello, world!");
    }

围栏代码块（反引号）：

```js
function add(a, b) {
  return a + b;
}
```

围栏代码块（波浪号）：

~~~python
def greet(name):
    return f"Hello, {name}!"
~~~

语法高亮：

```json
{
  "name": "gfm-test",
  "gfm": true
}
```

## HTML 块与行内 HTML

<div>
  <p>HTML 块中的段落</p>
</div>

行内 HTML：<span>span</span>、<kbd>Ctrl</kbd>、<mark>mark</mark>、<sub>sub</sub>、<sup>sup</sup>、<abbr title="World Health Organization">WHO</abbr>。

<details>
  <summary>点击展开</summary>

  折叠内容。

  - 列表项
  - 另一项
</details>

<!-- HTML 注释 -->

## 其他

- 分隔线：---、***、___
- 实体：&copy; &amp; &lt; &gt; &quot; &apos;
- 硬换行：行尾两个空格  
  或反斜杠\
  换行。

> **说明**：以上覆盖标准 GFM 解析语法（CommonMark + 表格、任务列表、删除线、自动链接等扩展），不包含 GitHub 站内信/平台功能。

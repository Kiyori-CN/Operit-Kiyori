# Operit AI 工具包开发指南 (SKILL)

> **版本**：v1.0  
> **适用**：Operit v1.9.x+  
> **定位**：作为 SKILL 文件注入 Agent System Prompt，指导 AI 自主开发符合规范的 Operit 工具包  
> **源码基础**：从 20+ 个生产级工具包源码中提炼（bilibili_search、csdn_search、various_search、web、code_runner、workflow、extended_memory_tools、extended_file_tools、extended_http_tools、extended_chat、super_admin、all_about_myself、operit_search、deepwiki_search、beeimg_upload、baidumap_navigation、recipe_search、zhipu_search、developer_search、anime_search、userscript_search、ikbs_pysearch、image_search、arxiv_assistant、weather_reporter 等）  
> **核心原则**：一切以最新生产代码实例为准；规范优先，安全不可妥协

---

## 目录

- [第一章 总览与核心概念](#第一章-总览与核心概念)
  - [1.1 工具包是什么](#11-工具包是什么)
  - [1.2 三种扩展机制](#12-三种扩展机制)
  - [1.3 工具调用协议（XML 核心协议）](#13-工具调用协议xml-核心协议)
  - [1.4 物理路径](#14-物理路径)
  - [1.5 文件命名规范](#15-文件命名规范)
  - [1.6 工具包生命周期](#16-工具包生命周期)
- [第二章 METADATA 声明协议](#第二章-metadata-声明协议)
  - [2.1 基本结构](#21-基本结构)
  - [2.2 顶层字段详解](#22-顶层字段详解)
  - [2.3 category 有效枚举](#23-category-有效枚举)
  - [2.4 env 环境变量声明](#24-env-环境变量声明)
  - [2.5 tools 工具函数声明](#25-tools-工具函数声明)
  - [2.6 参数类型枚举](#26-参数类型枚举)
  - [2.7 advice 特殊标记](#27-advice-特殊标记)
  - [2.8 宽松 JSON（HJSON）支持](#28-宽松-jsonhjson支持)
  - [2.9 description 编写最佳实践](#29-description-编写最佳实践)
  - [2.10 参数描述最佳实践](#210-参数描述最佳实践)
  - [2.11 METADATA 解析器源码逻辑](#211-metadata-解析器源码逻辑)
- [第三章 代码架构模式](#第三章-代码架构模式)
  - [3.1 IIFE 封装模式（推荐）](#31-iife-封装模式推荐)
  - [3.2 六层架构（复杂工具包推荐）](#32-六层架构复杂工具包推荐)
  - [3.3 简单工具包架构（三层）](#33-简单工具包架构三层)
  - [3.4 Intent 唤起架构](#34-intent-唤起架构)
  - [3.5 Web 自动化架构](#35-web-自动化架构)
  - [3.6 wrap 参数解构模式](#36-wrap-参数解构模式)
  - [3.7 导出规则（关键）](#37-导出规则关键)
  - [3.8 complete() 回调包装器模式](#38-complete-回调包装器模式)
- [第四章 返回值协议](#第四章-返回值协议)
  - [4.1 complete() 回调](#41-complete-回调)
  - [4.2 标准返回结构](#42-标准返回结构)
  - [4.3 data 字段最佳实践](#43-data-字段最佳实践)
  - [4.4 Markdown 输出格式规范](#44-markdown-输出格式规范)
  - [4.5 内容安全截断](#45-内容安全截断)
  - [4.6 sendIntermediateResult 中间进度](#46-sendintermediateresult-中间进度)
  - [4.7 提前返回模式](#47-提前返回模式)
- [第五章 运行时 API 全景](#第五章-运行时-api-全景)
  - [5.1 全局函数](#51-全局函数)
  - [5.2 OkHttp 网络请求](#52-okhttp-网络请求)
  - [5.3 Tools.Net 网络操作](#53-toolsnet-网络操作)
  - [5.4 Tools.Files 文件操作](#54-toolsfiles-文件操作)
  - [5.5 Tools.System 系统操作](#55-toolssystem-系统操作)
  - [5.6 Tools.SoftwareSettings 设置操作](#56-toolssoftwaresettings-设置操作)
  - [5.7 CryptoJS 加密库](#57-cryptojs-加密库)
  - [5.8 Tools.Net.Web 浏览器操作](#58-toolsnetweb-浏览器操作)
  - [5.9 Tools.visit_web 页面访问](#59-toolsvisit_web-页面访问)
  - [5.10 Tools.Memory 记忆操作](#510-toolsmemory-记忆操作)
  - [5.11 跨工具包调用](#511-跨工具包调用)
- [第六章 设计模式与最佳实践](#第六章-设计模式与最佳实践)
  - [6.1 环境变量读取模式](#61-环境变量读取模式)
  - [6.2 反向代理支持模式](#62-反向代理支持模式)
  - [6.3 多密钥负载均衡](#63-多密钥负载均衡)
  - [6.4 指数退避重试](#64-指数退避重试)
  - [6.5 参数沙盒化](#65-参数沙盒化)
  - [6.6 坐标与地理信息标准化](#66-坐标与地理信息标准化)
  - [6.7 URL 参数序列化](#67-url-参数序列化)
  - [6.8 鲁棒 JSON 解析](#68-鲁棒-json-解析)
  - [6.9 MIME 类型推断](#69-mime-类型推断)
  - [6.10 图片处理模式](#610-图片处理模式)
  - [6.11 并发执行模式](#611-并发执行模式)
  - [6.12 缓存系统模式](#612-缓存系统模式)
  - [6.13 文件指纹变更检测](#613-文件指纹变更检测)
  - [6.14 长输出持久化模式](#614-长输出持久化模式)
  - [6.15 降级处理逻辑](#615-降级处理逻辑)
  - [6.16 XML 标签提取模式](#616-xml-标签提取模式)
  - [6.17 HTML 实体解码与文本清洗](#617-html-实体解码与文本清洗)
  - [6.18 调试模式开关](#618-调试模式开关)
  - [6.19 城市/地理信息缓存模式](#619-城市地理信息缓存模式)
  - [6.20 初始化守卫模式](#620-初始化守卫模式)
- [第七章 test 工具规范](#第七章-test-工具规范)
  - [7.1 每个工具包应包含 test 工具](#71-每个工具包应包含-test-工具)
  - [7.2 test 实现模板（标准版）](#72-test-实现模板标准版)
  - [7.3 test 实现（带登录状态检测）](#73-test-实现带登录状态检测)
  - [7.4 test 实现（无独立验证端点）](#74-test-实现无独立验证端点)
  - [7.5 test 实现（多 API 联合测试）](#75-test-实现多-api-联合测试)
- [第八章 安全规范](#第八章-安全规范)
  - [8.1 禁止硬编码密钥](#81-禁止硬编码密钥)
  - [8.2 密钥展示脱敏](#82-密钥展示脱敏)
  - [8.3 输入验证](#83-输入验证)
  - [8.4 Shell 命令转义](#84-shell-命令转义)
  - [8.5 文件路径安全](#85-文件路径安全)
- [第九章 格式检查与验证](#第九章-格式检查与验证)
  - [9.1 验证引擎检查项](#91-验证引擎检查项)
  - [9.2 自检清单](#92-自检清单)
- [第十章 完整模板](#第十章-完整模板)
  - [10.1 网络 API 工具包模板（标准版）](#101-网络-api-工具包模板标准版)
  - [10.2 多 API 聚合工具包模板](#102-多-api-聚合工具包模板)
  - [10.3 系统操作工具包模板](#103-系统操作工具包模板)
  - [10.4 文件上传工具包模板](#104-文件上传工具包模板)
  - [10.5 Intent 唤起工具包模板](#105-intent-唤起工具包模板)
  - [10.6 Advice/配置指南工具包模板](#106-advice配置指南工具包模板)
- [第十一章 常见错误与排查](#第十一章-常见错误与排查)
  - [11.1 METADATA 解析失败](#111-metadata-解析失败)
  - [11.2 工具不可调用](#112-工具不可调用)
  - [11.3 complete() 未被调用](#113-complete-未被调用)
  - [11.4 环境变量读取为 null](#114-环境变量读取为-null)
  - [11.5 网络请求失败](#115-网络请求失败)
  - [11.6 文件操作失败](#116-文件操作失败)
- [第十二章 开发工作流](#第十二章-开发工作流)
  - [12.1 标准开发流程](#121-标准开发流程)
  - [12.2 文件部署](#122-文件部署)
  - [12.3 enabledByDefault 策略](#123-enabledbydefault-策略)
  - [12.4 main() 自测函数](#124-main-自测函数)
- [第十三章 TypeScript 开发支持](#第十三章-typescript-开发支持)
- [第十四章 高级模式](#第十四章-高级模式)
  - [14.1 嵌入向量索引](#141-嵌入向量索引)
  - [14.2 多平台聚合模式](#142-多平台聚合模式)
  - [14.3 三级接口容错切换](#143-三级接口容错切换)
  - [14.4 图片生成与保存模式](#144-图片生成与保存模式)
  - [14.5 格式化测试报告模式](#145-格式化测试报告模式)
  - [14.6 预报周期自适应匹配](#146-预报周期自适应匹配)
  - [14.7 搜索引擎链接工厂模式](#147-搜索引擎链接工厂模式)
  - [14.8 终端会话与 Python 脚本调用模式](#148-终端会话与-python-脚本调用模式)
  - [14.9 多平台公开 API 聚合模式（无 Key）](#149-多平台公开-api-聚合模式无-key)
- [第十五章 国际化（i18n）](#第十五章-国际化i18n)
  - [15.1 METADATA 中的多语言](#151-metadata-中的多语言)
  - [15.2 运行时语言检测](#152-运行时语言检测)
- [第十六章 ToolPkg 打包格式](#第十六章-toolpkg-打包格式)
  - [16.1 什么是 ToolPkg](#161-什么是-toolpkg)
  - [16.2 文件结构](#162-文件结构)
  - [16.3 manifest.json 核心字段](#163-manifestjson-核心字段)
  - [16.4 main.js 入口与注册](#164-mainjs-入口与注册)
  - [16.5 ToolPkg 注册 API 速查](#165-toolpkg-注册-api-速查)
  - [16.6 Compose DSL UI 模块](#166-compose-dsl-ui-模块)
  - [16.7 打包与部署](#167-打包与部署)
- [第十七章 案例索引](#第十七章-案例索引)
- [附录 A：全局常量/变量参考](#附录-a全局常量变量参考)
- [附录 B：JSONP 解析技巧](#附录-bjsonp-解析技巧)
- [附录 C：HTML 实体解码](#附录-chtml-实体解码)
- [附录 D：安全文件名生成](#附录-d安全文件名生成)
- [附录 E：注释文档模板](#附录-e注释文档模板)
- [附录 F：开发速查表](#附录-f开发速查表)
  - [必须做](#必须做)
  - [禁止做](#禁止做)
  - [API 速查](#api-速查)
- [附录 G：版本历史](#附录-g版本历史)

---

## 第一章 总览与核心概念

### 1.1 工具包是什么

Operit 工具包（ToolPackage）是运行在 JavaScript 沙箱中的功能扩展模块。AI 通过标准化 METADATA 声明理解工具能力，并在对话中自动调用。

核心特征：

- **AI 可理解**：通过 METADATA 中的中英双语 description，AI 能自动匹配用户意图到具体工具
- **能力可扩展**：任何外部 API、系统操作、文件处理均可封装为工具
- **环境隔离**：运行在 JS 沙箱中，通过 `getEnv()` 读取配置，通过桥接 API 访问系统能力
- **热部署**：将 `.js` 文件放入指定目录即可生效，无需重启应用
- **协议标准**：所有工具通过 `complete()` 回调返回结构化结果

### 1.2 三种扩展机制

| 机制            | 入口              | 语言                  | 调用方式                  | 典型用途                       |
| --------------- | ----------------- | --------------------- | ------------------------- | ------------------------------ |
| **ToolPackage** | `.js`/`.ts` 脚本  | JavaScript/TypeScript | AI 根据 METADATA 自动调用 | 功能扩展工具（本指南主要内容） |
| **ToolPkg**     | `.toolpkg` 压缩包 | JS + Compose DSL      | 同上，另含配置 UI         | 产品级分发（见第十六章）       |
| **Skill**       | `SKILL.md` 文件夹 | Markdown/提示词       | 注入 System Prompt        | 行为指导（如本文件）           |

### 1.3 工具调用协议（XML 核心协议）

项目内部工具调用统一以 **XML 形态** 表达与处理。这是贯穿整个项目的核心设计决策。

#### 调用格式（assistant 输出）

```xml
<tool name="tool_name">
<param name="param1">value1</param>
<param name="param2">value2</param>
</tool>
```

#### 结果格式（tool 角色写回历史）

```xml
<tool_result name="tool_name" status="success"><content>...</content></tool_result>
```

#### enableToolCall 开关的本质

`enableToolCall` 是**对外协议转换开关**，不是替换内部执行模型：

- `enableToolCall=true` 时：请求前把内部 XML 映射成 Provider 原生 `tool_calls` JSON；响应后再映射回 XML
- `enableToolCall=false` 时：请求体不注入 `tools/tool_choice`；模型直接输出 XML 标签
- 上层执行链（`ToolExecutionManager.extractToolInvocations`）始终解析 XML

**结论**：开发者只需关注 METADATA 声明和 `complete()` 回调，XML 协议由框架自动处理。

#### Tool Call 生效前提

不是"开关一开就必生效"，还要求：

- `availableTools != null`
- `availableTools.isNotEmpty()`
- 在 `OpenAIProvider` 中通过 `effectiveEnableToolCall` 决定最终是否进入 Tool Call 模式

#### Provider 适配现状

- **OpenAIProvider 及兼容派生**：已实现较完整的双向转换（XML ↔ Tool Call JSON）
- **LLAMA_CPP**：非 ToolCall 模式用提示词约束 XML；ToolCall 模式用 JNI 原生 grammar 约束后转换
- **MNN**：当前仍未接入等价的原生 ToolCall 能力

#### 系统提示词关系

`useToolCallApi` 影响提示词呈现策略：

- `true`：简化工具说明，不再内嵌完整工具列表（因 `tools` 已在请求体传入）
- `false`：保留 XML 工具说明和可用工具列表

### 1.4 物理路径

| 路径                                                   | 用途                                     |
| ------------------------------------------------------ | ---------------------------------------- |
| `/storage/emulated/0/Download/Operit/examples/`         | 工具包存放目录（可读写），系统自动扫描   |
| `Android/data/com.ai.assistance.operit/files/packages` | 沙盒包外部目录                           |
| `/sdcard/Download/Operit/skills/`                      | Skill 文件存放目录                       |
| `/sdcard/Download/Operit/mcp_plugins/`                 | MCP 插件目录                             |
| `OPERIT_CLEAN_ON_EXIT_DIR`                             | 退出时自动清理的临时目录路径（全局常量） |

### 1.5 文件命名规范

文件名**必须**为 `小写字母_下划线` 格式，与 METADATA 中的 `name` 字段保持一致：

```
正确：bilibili_search.js、code_runner.js、recipe_search.js、zhipu_search.js
错误：BilibiliSearch.js、code-runner.js、RecipeSearch.JS、Zhipu_Search.js
```

命名正则：`/^[a-z][a-z0-9_]*\.js$/`

### 1.6 工具包生命周期

```
放入目录 → 系统扫描 → METADATA 解析 → 注册工具清单
    → AI 匹配意图 → 调用工具函数 → complete() 返回 → 结果写入对话历史
```

若 `enabledByDefault: false`，还需用户或 AI 先调用 `use_package("包名")` 启用。

---

## 第二章 METADATA 声明协议

METADATA 是工具包的灵魂。它是 AI 理解工具能力的唯一入口，直接决定语义搜索匹配质量和工具调用的准确性。

### 2.1 基本结构

METADATA 必须以 `/* METADATA` 开头、`*/` 结尾，**置于文件最顶部**（前面不能有任何代码、注释或空行）。内容为 JSON 对象。

```javascript
/* METADATA
{
    "name": "my_toolkit",
    "version": "1.0",
    "display_name": {
        "zh": "我的工具包",
        "en": "My Toolkit"
    },
    "description": {
        "zh": "中文描述——详细说明核心功能、支持特性、适用场景。",
        "en": "English description — detail core capabilities, features, and use cases."
    },
    "enabledByDefault": false,
    "category": "Network",
    "author": "Your Name",
    "env": [...],
    "tools": [...]
}
*/
```

### 2.2 顶层字段详解

| 字段               | 类型       | 必填   | 说明                                                               |
| ------------------ | ---------- | ------ | ------------------------------------------------------------------ |
| `name`             | string     | **是** | 包名，正则 `/^[a-z][a-z0-9_]*$/`，**必须与文件名（去扩展名）一致** |
| `version`          | string     | 建议   | 版本号，如 `"1.0"`，推荐语义化版本                                 |
| `display_name`     | `{zh, en}` | 建议   | UI 中展示的友好名称                                                |
| `description`      | `{zh, en}` | **是** | 中英双语描述，**语义向量索引依赖此字段**（详见 2.9）               |
| `enabledByDefault` | boolean    | 否     | `true` 表示默认启用；默认 `false`                                  |
| `category`         | string     | 建议   | 分类枚举（见 2.3）                                                 |
| `author`           | string     | 建议   | 作者标识                                                           |
| `env`              | array      | 否     | 环境变量声明列表（见 2.4）                                         |
| `tools`            | array      | **是** | 工具函数声明列表（见 2.5）                                         |

### 2.3 category 有效枚举

**仅限以下 14 个分类**（Title Case 格式：首字母大写，其余小写，如 `"Admin"` 合法，`"admin"` 和 `"ADMIN"` 均不合法）：

```
Automatic    — 自动化流程、定时任务
Draw         — 绘图、图像生成
Chat         — 聊天增强、对话管理
Development  — 代码执行、开发辅助
File         — 文件处理、上传下载
Life         — 生活服务（天气、食谱、日历等）
Media        — 多媒体处理（音视频、图片）
Memory       — 记忆管理、知识库
Network      — 网络请求、API 调用
Search       — 搜索引擎、信息检索
System       — 系统管理、设备控制
Utility      — 通用工具（加解密、格式转换等）
Workflow     — 工作流编排
Admin        — 管理/综合类（生产级多数工具包使用此分类）
```

分类选择建议：由用户自行开发的工具包默认采用 `"Admin"` 作为通用分类。

生产实例分类参考：

| 工具包                | category    | 理由             |
| --------------------- | ----------- | ---------------- |
| various_search        | Search      | 核心功能为搜索   |
| bilibili_search       | Search      | 视频平台综合工具 |
| recipe_search         | Search      | 食谱聚合搜索工具 |
| code_runner           | Development | 代码执行         |
| web                   | Automatic   | 浏览器自动化     |
| extended_memory_tools | Memory      | 记忆管理         |
| workflow              | Workflow    | 工作流编排       |
| weather_reporter      | Life        | 天气服务         |
| developer_search      | Search      | 技术搜索聚合     |
| image_search          | Search      | 以图搜图聚合     |

### 2.4 env 环境变量声明

每个环境变量条目格式：

```json
{
  "name": "API_KEY_NAME",
  "description": {
    "zh": "中文说明，含获取地址",
    "en": "English description with URL"
  },
  "required": true
}
```

规范要求：

- `name` **必须**为 `UPPER_CASE` 格式（如 `BILIBILI_COOKIE`、`SPOONACULAR_API_KEY`、`ZHIPU_SEARCH_PROXY_URL`）
- `required` **必须**显式声明 `true` 或 `false`
- 描述中**应包含**密钥获取地址或配置说明
- 可选环境变量应在描述中标注"可选"
- 当支持反向代理时，添加独立的 `PROXY_URL` 环境变量并标为 `required: false`

运行时通过 `getEnv("KEY_NAME")` 读取，返回值为**字符串**或 **null**。

生产实例（多密钥负载均衡 — zhipu_search.js）：

```json
{
  "name": "ZHIPU_SEARCH_API_KEY",
  "description": {
    "zh": "智谱搜索 API 密钥列表，多个密钥用英文逗号分隔以实现负载均衡与配额轮换",
    "en": "Zhipu Search API key(s), comma-separated for load balancing and quota rotation"
  },
  "required": true
}
```

生产实例（可选增强密钥 — anime_search.js）：

```json
{
  "name": "TRACE_MOE_KEY",
  "description": {
    "zh": "trace.moe API Key（可选），配置后可显著提升每日搜索配额及并发限制。获取地址：https://trace.moe/",
    "en": "trace.moe API Key (Optional). Increases daily quota and concurrency limits."
  },
  "required": false
}
```

生产实例（多 API 独立密钥 — recipe_search.js）：

```json
[
  {
    "name": "SPOONACULAR_API_KEY",
    "required": false,
    "description": { "zh": "Spoonacular 国际食谱 API Key..." }
  },
  {
    "name": "SHOWAPI_APPKEY",
    "required": false,
    "description": { "zh": "ShowAPI 中餐食谱 API Key..." }
  },
  {
    "name": "JINA_READER_KEY",
    "required": false,
    "description": { "zh": "Jina Reader API Key（可选）..." }
  }
]
```

### 2.5 tools 工具函数声明

每个工具条目格式：

```json
{
  "name": "search",
  "description": {
    "zh": "详细的中文功能描述",
    "en": "Detailed English description"
  },
  "parameters": [
    {
      "name": "query",
      "type": "string",
      "required": true,
      "description": {
        "zh": "参数中文说明",
        "en": "Parameter description"
      }
    },
    {
      "name": "max_results",
      "type": "number",
      "required": false,
      "default": 5,
      "description": {
        "zh": "返回结果数量，默认 5",
        "en": "Number of results, default 5"
      }
    }
  ]
}
```

工具名规范：`/^[a-z][a-z0-9_]*$/`，同一工具包内**不得重复**。

### 2.6 参数类型枚举

合法的 `type` 值：

| type      | 说明      | 生产实例                                                 |
| --------- | --------- | -------------------------------------------------------- |
| `string`  | 字符串    | query, url, file_path, command, engine, sort             |
| `number`  | 数字      | count, page, max_results, timeout_ms, maxCalories        |
| `boolean` | 布尔值    | includeLinks, cut_borders, include_adult, expand_context |
| `object`  | JSON 对象 | headers（web.js 中的请求头对象）                         |
| `array`   | JSON 数组 | modifiers（web.js 中的修饰键数组）                       |

### 2.7 advice 特殊标记

当 `"advice": true` 时，该工具**不需要对应的 `exports` 导出执行逻辑**。此类工具仅用于向 AI 注入知识/指导手册，不执行实际代码。

```json
{
  "name": "usage_advice",
  "description": {
    "zh": "工作流工具使用建议（给 AI）：\n\n- 核心概念...",
    "en": "Workflow tool usage advice for AI..."
  },
  "parameters": [],
  "advice": true
}
```

生产实例：workflow.js 中的 `usage_advice` 工具包含了大量的工作流节点类型说明、参数引用规则、分支连线语义等指导信息，全部写在 description 中供 AI 参考。all_about_myself.js 中的 `all_about_myself` 工具则将整套 MCP/Skill/Package 排查手册和配置指南写入 description，长度可达数千字。

**advice 工具的 description 无长度限制**，可以包含完整的排查手册、配置指南、概念说明等结构化知识，AI 会在匹配到用户意图时自动参考这些内容。

### 2.8 宽松 JSON（HJSON）支持

METADATA 解析器支持以下宽松语法：

- **键名不加引号**：`name: "value"`
- **字符串不加引号**（作为键值时）：`name: code_runner`
- **单行注释**：`// comment`
- **尾逗号**：`{"a": 1,}`
- **多行字符串（三引号）**：`'''multi\nline'''`
- **省略逗号**（换行隔开）：HJSON 默认行为

**建议**：新工具包优先使用标准 JSON 格式以获得最大兼容性。宽松格式适合快速原型和大量文本内容的场景。

生产实例（code_runner.js — HJSON 格式完整示例）：

```javascript
/* METADATA
{
  name: code_runner
  display_name: {
    zh: "代码运行器"
    en: "Code Runner"
  }
  description: { zh: "提供多语言代码执行能力...", en: "Multi-language code execution..." }
  enabledByDefault: true
  category: "Development"
  // 注释：以下是工具声明
  tools: [
    {
      name: run_javascript_es5
      description: { zh: "运行自定义 JavaScript (ES5) 脚本。", en: "Run custom JavaScript (ES5)." }
      parameters: [
        {
          name: script
          description: { zh: "要执行的脚本内容", en: "Script content to execute." }
          type: string
          required: true
        }
      ]
    }
  ]
}
*/
```

注意上例中：键名无引号、字符串值无引号、省略逗号（换行隔开）、含单行注释。

生产实例（all_about_myself.js — 三引号多行字符串）：

```javascript
/* METADATA
{
  name: "all_about_myself"
  display_name: { zh: "Operit配置编辑器", en: "Operit Config Editor" }
  description: {
    zh: '''软件设置直改工具包：提供一组可直接读取
    与修改 Operit 设置的工具，覆盖 MCP、Skill、
    Sandbox Package 等配置。'''
    en: '''Direct software-settings toolkit...'''
  }
  enabledByDefault: true
  "category": "Chat",
  tools: [...]
}
*/
```

注意上例中：三引号 `'''` 包裹的多行字符串、混合使用有引号/无引号键名。

### 2.9 description 编写最佳实践

description 直接影响语义搜索匹配质量，是 AI 决定是否调用工具的关键依据。应遵循以下原则：

#### 原则 1：开头用一句话概括核心能力（"工具包名 + 句号 + 功能概述"格式）

```
"zh": "食谱搜索工具包。完整支持Spoonacular国际食谱API和ShowAPI中餐数据库..."
"zh": "智谱 AI 全能网络搜索工具包。基于智谱 Web Search API，提供多引擎网页搜索..."
"zh": "以图搜番工具包。集成 trace.moe 搜索引擎，专用于通过公网图片链接检索动漫番剧信息。"
"zh": "Arxiv学术论文检索工具包。提供按关键词、作者、分类及日期范围搜索最新科研预印本的功能。"
```

#### 原则 2：列出具体功能点和技术特性

AI 会根据这些功能点匹配用户意图：

```
"zh": "...提供全球食谱检索、详细营养分析、中国菜谱查询及第三方网页提取功能。"
"zh": "...支持多密钥轮询负载均衡、搜索意图智能识别、时效性区间筛选、内容详略可调，
以及结构化 Markdown 结果输出。"
"zh": "...支持分页、高级排序、自定义反向代理及指数退避抗风控检索。"
```

#### 原则 3：覆盖中英文关键词

```
"zh": "油猴脚本多平台搜索工具包。聚合 GreasyFork、OpenUserJS、Userscript.Zone、GitHub...",
"en": "Multi-platform userscript search toolkit. Aggregates GreasyFork, OpenUserJS..."
```

#### 原则 4：说明适用场景和前置条件

```
"zh": "...适用于知识问答、新闻追踪、网页摘要、资讯聚合等场景。"
"zh": "...需先使用 ikbs_search 构建知识库，再用本工具包的 rebuild_index 优化索引后即可极速搜索。"
```

#### 原则 5：工具级描述同样重要

每个工具的 description 也应详细描述其能力、适用场景和使用方法：

```json
{
  "name": "search_stackoverflow",
  "description": {
    "zh": "在 Stack Overflow 上搜索技术问答。返回按投票数或活跃度排序的问题列表，包含标题、投票数、回答数、标签和链接。适合搜索具体的报错信息、代码实现问题和最佳实践。支持按标签筛选（如 python, javascript）。",
    "en": "Search technical Q&A on Stack Overflow. Returns questions sorted by votes or activity..."
  }
}
```

```json
{
  "name": "search",
  "description": {
    "zh": "执行智能网页搜索。支持四大搜索引擎（标准/增强/搜狗增强/夸克增强）、搜索意图自动识别、时效性区间筛选（日/周/月/年/不限）、结果数量自定义（1-50）和内容详略控制（medium/high）。返回结构化 Markdown 格式报告...",
    "en": "Perform intelligent web search..."
  }
}
```

### 2.10 参数描述最佳实践

参数描述应包含格式说明、默认值、取值范围和示例：

```json
{
  "name": "engine",
  "type": "string",
  "required": false,
  "default": "search_std",
  "description": {
    "zh": "搜索引擎选择：search_std（标准，速度快、免费配额多）/ search_pro（增强，结果更精准）/ search_pro_sogou（搜狗增强，中文优势）/ search_pro_quark（夸克增强，移动端优势）。不填则使用环境变量默认值或 search_std",
    "en": "Engine: search_std / search_pro / search_pro_sogou / search_pro_quark. Default: env or search_std"
  }
}
```

```json
{
  "name": "count",
  "type": "number",
  "required": false,
  "default": 10,
  "description": {
    "zh": "返回结果数量（1-50），默认 10。建议普通查询 5-10 条，深度研究 15-30 条",
    "en": "Number of results (1-50), default 10. Recommended: 5-10 for general, 15-30 for deep research"
  }
}
```

```json
{
  "name": "sort_by",
  "type": "string",
  "required": false,
  "default": "relevance",
  "description": {
    "zh": "排序依据：relevance (相关性), lastUpdatedDate (更新日期), submittedDate (提交日期)。默认 relevance",
    "en": "Sort criterion: relevance, lastUpdatedDate, submittedDate. Default: relevance"
  }
}
```

### 2.11 METADATA 解析器源码逻辑

解析器按以下优先级尝试解析 METADATA：

1. 先尝试标准 `JSON.parse()`
2. 失败后尝试宽松 HJSON 解析：移除注释、补齐键名引号、去尾逗号

```javascript
function extractMetadata(content) {
  const metaRegex = /\/\*\s*METADATA\s*\n([\s\S]*?)\*\//;
  const match = content.match(metaRegex);
  if (!match || !match[1]) return null;

  let rawMeta = match[1].trim();

  // 第一步：尝试标准 JSON
  try {
    return JSON.parse(rawMeta);
  } catch (e) {}

  // 第二步：宽松解析
  try {
    let normalized = rawMeta;
    normalized = normalized.replace(/^\s*\/\/.*$/gm, ""); // 移除注释
    normalized = normalized.replace(/^\s*([a-zA-Z_]\w*)\s*:/gm, '"$1":'); // 补引号
    normalized = normalized.replace(/,\s*([\]}])/g, "$1"); // 去尾逗号
    return JSON.parse(normalized);
  } catch (e2) {
    return null;
  }
}
```

---

## 第三章 代码架构模式

### 3.1 IIFE 封装模式（推荐）

**所有生产级工具包均使用 IIFE（立即调用函数表达式）封装**，避免全局命名空间污染。这是经过生产验证的最佳实践。

```javascript
/* METADATA
{ ... }
*/

const myToolkit = (function () {
  // ===== 第一部分：配置常量 =====
  const CONFIG = {
    API_BASE: "https://api.example.com",
    TIMEOUT: 30000,
    MAX_RETRIES: 3,
  };

  // ===== 第二部分：基础工具函数 =====
  const httpClient = OkHttp.newClient();

  function getApiKey() {
    const key = getEnv("MY_API_KEY");
    if (!key || key.trim() === "") {
      throw new Error(
        "环境变量 MY_API_KEY 未配置。\n请在设置 → 环境变量中添加。",
      );
    }
    return key.trim();
  }

  // ===== 第三部分：核心业务逻辑 =====
  async function searchHandler(params) {
    // 实现逻辑...
  }

  // ===== 第四部分：统一错误包装 =====
  async function wrapExecution(fn, params, actionName) {
    try {
      const result = await fn(params || {});
      complete(result);
    } catch (error) {
      complete({
        success: false,
        message: actionName + " 失败: " + error.message,
      });
    }
  }

  // ===== 暴露公开接口 =====
  return {
    search: function (params) {
      return wrapExecution(searchHandler, params, "搜索");
    },
  };
})();

// ===== 模块导出 =====
exports.search = myToolkit.search;
```

### 3.2 六层架构（复杂工具包推荐）

从多个千行级生产工具包（tavily_search.js、zhipu_search.js、recipe_search.js 等）提炼的六层架构：

| 层级       | 职责               | 典型内容                                              |
| ---------- | ------------------ | ----------------------------------------------------- |
| **第一层** | 常量定义与配置中心 | API 端点、默认值、限制常量、枚举值、调试开关          |
| **第二层** | 基础设施与工具函数 | HTTP 客户端、环境变量读取、安全解析、截断器、HTML清洗 |
| **第三层** | 网络请求引擎       | 带重试/故障转移的请求调度器、统一 HTTP 封装           |
| **第四层** | 参数处理引擎       | 参数沙盒化、校验、默认值填充、URL 构建                |
| **第五层** | 结果格式化引擎     | Markdown 输出、截断保护、分节格式化                   |
| **第六层** | 业务逻辑与公开接口 | 工具入口函数、执行包装器、模块导出                    |

生产实例分层（recipe_search.js）：

```javascript
const recipe_master = (function () {
  // [第一部分：初始化配置] API_CONFIG, DEBUG_MODE
  // [第二部分：工具函数] safeGetEnv, makeRequest, cleanHtml, buildQueryString, truncateText
  // [第三部分：Spoonacular 功能] searchGlobalRecipe, getGlobalRecipeDetails
  // [第四部分：ShowAPI 功能] searchChineseRecipe, getChineseCategories
  // [第五部分：网页提取功能] extractRecipeFromUrl
  // [第六部分：连通性测试] formatTestReport, testRecipeAPIs
  // [第七部分：模块导出] return { ... }
})();
```

### 3.3 简单工具包架构（三层）

对于功能简单的工具包（如 image_search.js），可简化为三层：

```javascript
const simpleToolkit = (function () {
    // 配置 + 工具函数
    const Utils = { isValidUrl(url) { ... } };

    // 业务逻辑
    async function doSomething(params) { ... }

    // 统一包装 + 接口
    return {
        doSomething: async (params) => {
            try {
                const result = await doSomething(params);
                complete({ success: true, data: result });
            } catch (error) {
                complete({ success: false, message: error.message });
            }
        }
    };
})();

exports.doSomething = simpleToolkit.doSomething;
```

### 3.4 Intent 唤起架构

用于调用 Android 系统组件的工具包，如 baidumap_navigation.js：

```javascript
const MY_TOOLKIT = (function () {
    const CONFIG = {
        PKG_MAIN: 'com.target.app',
        ACTION: 'android.intent.action.VIEW',
        SCHEME: 'myscheme://'
    };

    const UrlBuilder = {
        action1: (params) => `${CONFIG.SCHEME}map/action?${buildQuery(params)}`
    };

    async function callSystemIntent(uri) {
        const sys = globalThis.Tools?.System;
        if (!sys || !sys.intent) {
            throw new Error("当前系统环境缺失 System.intent 调用能力。");
        }
        return await sys.intent({
            action: CONFIG.ACTION,
            category: 'android.intent.category.DEFAULT',
            uri: uri,
            package: CONFIG.PKG_MAIN
        });
    }

    return { action1: async (params) => { ... } };
})();
```

### 3.5 Web 自动化架构

用于封装浏览器操作的工具包，如 web.js：

```javascript
const myWebToolkit = (function () {
  return {
    start: async (params) => {
      try {
        const result = await Tools.Net.Web.start(params);
        complete({ success: true, data: result });
      } catch (e) {
        complete({ success: false, message: e.message });
      }
    },
  };
})();
```

### 3.6 wrap 参数解构模式

various_search.js 展示了一种特殊的 wrap 模式：

```javascript
function wrap(coreFunction) {
  return async (params) => {
    const args = Object.values(params);
    return coreFunction(...args);
  };
}
// AI 调用传入：{ query: "xxx", includeLinks: false }
// wrap 自动解构为位置参数
exports.search_bing = various_search.wrap(various_search.search_bing);
```

**注意**：此模式依赖对象属性的插入顺序与函数参数顺序一致，使用时需确保参数顺序匹配。

### 3.7 导出规则（关键）

**每个 METADATA tools 中声明的工具（非 advice），必须有对应的 `exports.工具名 = ...` 导出。**

导出名必须与 METADATA 中 `tools[].name` **严格一致**。

```javascript
// METADATA 声明了 tools: [{ name: "search" }, { name: "test" }]
// 则必须有：
exports.search = myToolkit.search;
exports.test = myToolkit.test;
```

验证引擎会检查：

```javascript
const exportPattern = new RegExp("exports\\s*\\.\\s*" + tool.name + "\\s*=");
```

生产实例（recipe_search.js — 6 个导出）：

```javascript
exports.search_global_recipe = recipe_master.search_global_recipe;
exports.get_global_recipe_details = recipe_master.get_global_recipe_details;
exports.search_chinese_recipe = recipe_master.search_chinese_recipe;
exports.get_chinese_categories = recipe_master.get_chinese_categories;
exports.extract_recipe_from_url = recipe_master.extract_recipe_from_url;
exports.test = recipe_master.test;
```

### 3.8 complete() 回调包装器模式

所有工具函数最终必须调用 `complete(resultObject)` 返回结果。三种常见包装模式：

**模式 A：wrapToolExecution（func 返回标准结构）**

```javascript
async function wrapExecution(func, params, actionName) {
  try {
    const result = await func(params || {});
    complete(result); // func 返回的结果直接传给 complete
  } catch (error) {
    complete({
      success: false,
      message: actionName + " 失败: " + error.message,
    });
  }
}
```

**模式 B：wrap（func 返回原始数据，自动包装）**

```javascript
function wrap(func) {
  return async (params) => {
    try {
      const result = await func(params);
      complete({ success: true, data: result });
    } catch (error) {
      complete({ success: false, message: error.message });
    }
  };
}
```

**模式 C：直接 try-catch（生产中最常见，适合逻辑复杂的工具）**

```javascript
search: async (params) => {
  try {
    // ... 复杂业务逻辑
    complete({ success: true, message: `搜索完成`, data: output });
  } catch (e) {
    complete({ success: false, message: `搜索失败: ${e.message}` });
  }
};
```

---

## 第四章 返回值协议

### 4.1 complete() 回调

每个工具函数最终**必须**调用 `complete(resultObject)` 返回结果。这是**唯一**的结果返回通道。

**关键规则**：所有代码路径（包括异常捕获、提前返回、条件分支）都必须最终调用 `complete()`。忘记调用会导致工具超时。

### 4.2 标准返回结构

```javascript
// 成功
complete({
  success: true,
  message: "操作成功", // 简短的结果描述
  data: "...", // 主要数据载荷（字符串/对象/数组）
  meta: { latency_ms: 120 }, // 可选元数据
});

// 失败
complete({
  success: false,
  message: "搜索失败: API Key 无效",
  error_stack: error.stack, // 可选，便于调试
});
```

### 4.3 data 字段最佳实践

- **字符串**：适合 Markdown 格式化的报告/结果（AI 直接展示给用户）— **生产中最常用**
- **对象/数组**：适合结构化数据（AI 可进一步处理）
- **混合**：data 为 Markdown 字符串 + meta 携带结构化元信息

生产实例（arxiv_assistant.js — 结构化数据）：

```javascript
complete({
  success: true,
  message: `Found ${papers.length} papers (from index ${startIndex}).`,
  data: {
    count: papers.length,
    start_index: startIndex,
    total_results: totalResults,
    papers: papers, // 数组，含 id, title, summary, authors, published, url, pdf_url
  },
});
```

生产实例（weather_reporter.js — Markdown 报告）：

```javascript
let out = `## [天气报告] ${city.name}\n---\n`;
out += `* 状态: ${now.now.text} | 温度: ${now.now.temp}摄氏度 (体感 ${now.now.feelsLike}摄氏度)\n`;
out += `* 空气: ${air.now.category} (AQI: ${air.now.aqi})\n`;
complete({ success: true, message: `${city.name} 数据更新完成`, data: out });
```

### 4.4 Markdown 输出格式规范

AI 友好的 Markdown 输出应结构清晰、信息密度高：

```javascript
const buffer = [];
buffer.push("## 🔍 搜索结果\n");
buffer.push("> **查询**: " + params.query);
buffer.push("> **深度**: " + params.search_depth + "\n");

if (data.answer) {
  buffer.push("### 📝 AI 总结\n");
  buffer.push(data.answer);
  buffer.push("\n---\n");
}

buffer.push("### 📋 结果列表 (共 " + results.length + " 项)\n");
results.forEach(function (item, index) {
  buffer.push("#### [" + (index + 1) + "] " + item.title);
  buffer.push("**来源**: " + item.url);
  buffer.push(item.content);
  buffer.push("");
});

return truncateContent(buffer.join("\n"), MAX_OUTPUT);
```

**表格格式**（适用于预报、对比等场景，如 weather_reporter.js）：

```javascript
let table = `### [多日预报] ${city.name}\n\n| 日期 | 天气状况 | 温度区间 | 风向 |\n| :--- | :--- | :--- | :--- |\n`;
table += res.daily
  .slice(0, days)
  .map(
    (d) =>
      `| ${d.fxDate} | ${d.textDay} | ${d.tempMin}至${d.tempMax}°C | ${d.windDirDay} |`,
  )
  .join("\n");
```

### 4.5 内容安全截断

防止输出过长导致 AI 上下文溢出：

```javascript
function truncateContent(content, maxLen) {
  if (!content) return "";
  if (content.length <= maxLen) return content;
  return (
    content.substring(0, maxLen) +
    "\n\n*(内容过长，已自动截断至 " +
    maxLen +
    " 字符)*"
  );
}
```

建议限制：单条结果 **15000** 字符，总输出 **80000** 字符。

### 4.6 sendIntermediateResult 中间进度

长时间任务可通过 `sendIntermediateResult()` 推送进度（需先检查函数可用性）：

```javascript
if (typeof sendIntermediateResult === "function") {
  sendIntermediateResult({
    success: true,
    message: "🔍 正在搜索：" + keyword + " [第 2/5 平台]",
  });
}
```

生产实例（image_search.js）：

```javascript
if (typeof sendIntermediateResult === "function") {
  sendIntermediateResult({
    success: true,
    message: `正在对图片进行 AI 识别，请稍候...`,
  });
}
```

### 4.7 提前返回模式

在参数校验或前置条件不满足时可提前 `return complete(...)`：

```javascript
// 参数校验
if (!params.type && !params.cpName) {
  return complete({
    success: false,
    message: "缺少必填参数: 至少提供type或cpName。",
  });
}

// 空结果
if (results.length === 0) {
  return complete({
    success: true,
    message: "未检索到匹配结果。建议调整过滤条件。",
    data: "",
  });
}
```

---

## 第五章 运行时 API 全景

### 5.1 全局函数

| 函数                             | 说明                                            |
| -------------------------------- | ----------------------------------------------- |
| `complete(result)`               | **必调** — 返回工具执行结果，唯一的结果返回通道 |
| `getEnv(key)`                    | 读取环境变量，返回 string 或 null               |
| `getLang()`                      | 获取当前语言环境（如 `"zh"`, `"en"`）           |
| `sendIntermediateResult(result)` | 推送中间进度（使用前检查 typeof）               |
| `toolCall(name, params)` 或 `toolCall({name, params})`     | 跨包调用其他工具，支持两种签名            |
| `console.log/warn/error(...)`    | 日志输出（调试用）                              |

### 5.2 OkHttp 网络请求

HTTP 客户端是最常用的基础设施。**所有生产级网络请求工具包均使用此 API**。

```javascript
const httpClient = OkHttp.newClient();

// GET 请求
async function httpGet(url, headers) {
  const builder = httpClient.newRequest().url(url).method("GET");
  if (headers) {
    for (const key in headers) builder.header(key, headers[key]);
  }
  return await builder.build().execute();
}

// POST 请求（JSON body）
async function httpPostJson(url, payload, headers) {
  return await httpClient
    .newRequest()
    .url(url)
    .method("POST")
    .headers({
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    })
    .body(JSON.stringify(payload), "json")
    .build()
    .execute();
}

// POST 请求（Form body — 如 recipe_search.js 中 ShowAPI 调用）
async function httpPostForm(url, formData, headers) {
  return await httpClient
    .newRequest()
    .url(url)
    .method("POST")
    .headers({
      "Content-Type": "application/x-www-form-urlencoded",
      ...headers,
    })
    .body(formData, "form")
    .build()
    .execute();
}
```

Response 对象属性：

| 属性/方法                 | 返回类型 | 说明                     |
| ------------------------- | -------- | ------------------------ |
| `response.isSuccessful()` | boolean  | HTTP 2xx 为 true         |
| `response.statusCode`     | number   | HTTP 状态码              |
| `response.statusMessage`  | string   | HTTP 状态消息            |
| `response.content`        | string   | 响应体字符串             |
| `response.headers`        | object   | 响应头对象               |
| `response.contentType`    | string   | Content-Type 头值        |
| `response.url`            | string   | 最终请求 URL（含重定向） |
| `response.size`           | number   | 响应体大小               |

### 5.3 Tools.Net 网络操作

```javascript
// 文件上传（Multipart）
const resp = await Tools.Net.uploadFile({
  url: apiEndpoint,
  method: "POST",
  headers: { "User-Agent": "...", Accept: "application/json" },
  form_data: { apikey: key },
  files: [
    { field_name: "file", file_path: filePath, content_type: "image/jpeg" },
  ],
});

// 网页访问（含链接提取）
const response = await Tools.Net.visit(url);
// response.visitKey / response.content / response.links

// 网页访问（含图片链接）
const response = await Tools.Net.visit({ url, include_image_links: true });
// response.imageLinks — 图片链接列表
```

### 5.4 Tools.Files 文件操作

```javascript
await Tools.Files.exists(filePath, "android"); // 检查文件存在
await Tools.Files.read(filePath, "android"); // 读取文本 → { content }
await Tools.Files.readBinary(filePath); // 读取二进制 → { contentBase64 }
await Tools.Files.write(filePath, content, false, "android"); // 写入文本
await Tools.Files.writeBinary(savePath, base64String); // 写入二进制
await Tools.Files.mkdir(dirPath, true, "android"); // 创建目录
await Tools.Files.list(dirPath, "android"); // 列出目录 → { entries }
await Tools.Files.download(url, savePath); // 下载文件
await Tools.Files.move(source, destination, env);    // 移动/重命名
await Tools.Files.copy(source, dest, recursive, srcEnv, dstEnv); // 复制（支持跨环境）
await Tools.Files.info(path, env);                   // 获取文件/目录信息
await Tools.Files.zip(source, destination, env);     // 压缩
await Tools.Files.unzip(source, destination, env);   // 解压
await Tools.Files.open(path, env);                   // 用系统默认应用打开
await Tools.Files.share(path, title, env);           // 分享文件给其他应用
```

**重要**：第二个参数 `'android'` 指定 Android 文件系统侧。路径不要混用两侧。

### 5.5 Tools.System 系统操作

```javascript
// 终端会话
const session = await Tools.System.terminal.create("session_name");
const result = await Tools.System.terminal.exec(
  session.sessionId,
  command,
  timeoutMs,
);
// result → { output, exitCode, timedOut, sessionId }

// 获取当前终端屏幕（仅可见内容，不含历史滚动）
const screenContent = await Tools.System.terminal.screen(session.sessionId);

// 向终端写入输入或发送控制键
await Tools.System.terminal.input(session.sessionId, { input: "text" });
await Tools.System.terminal.input(session.sessionId, { control: "enter" });
await Tools.System.terminal.input(session.sessionId, { input: "c", control: "ctrl" }); // Ctrl+C

// Shell 命令（Shizuku/Root）
const shellResult = await Tools.System.shell(command);

// Intent 调用
await Tools.System.intent({
  action: "android.intent.action.VIEW",
  uri: "scheme://path",
  package: "com.example.app",
  category: "android.intent.category.DEFAULT",
  flags: [0x10000000],
});

// 其他常用
await Tools.System.sleep(milliseconds);
await Tools.System.getDeviceInfo();
await Tools.System.getLocation(highAccuracy, timeout);
await Tools.System.getNotifications(limit, includeOngoing);
await Tools.System.installApp(apkPath);
await Tools.System.startApp(packageName, activity);
```

### 5.6 Tools.SoftwareSettings 设置操作

```javascript
await Tools.SoftwareSettings.listSandboxPackages();
await Tools.SoftwareSettings.setSandboxPackageEnabled(name, enabled);
await Tools.SoftwareSettings.readEnvironmentVariable(key);
await Tools.SoftwareSettings.writeEnvironmentVariable(key, value);
await Tools.SoftwareSettings.restartMcpWithLogs(timeoutMs);
await Tools.SoftwareSettings.listModelConfigs();
await Tools.SoftwareSettings.createModelConfig(options);
await Tools.SoftwareSettings.updateModelConfig(configId, updates);
await Tools.SoftwareSettings.deleteModelConfig(configId);
await Tools.SoftwareSettings.testModelConfigConnection(configId, modelIndex);
await Tools.SoftwareSettings.getFunctionModelConfig(functionType);
await Tools.SoftwareSettings.setFunctionModelConfig(
  functionType,
  configId,
  modelIndex,
);
```

### 5.7 CryptoJS 加密库

```javascript
const decoded = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(input));
```

### 5.8 Tools.Net.Web 浏览器操作

```javascript
await Tools.Net.Web.start({ url, headers, user_agent, session_name });
await Tools.Net.Web.goto({ url, session_id, headers });
await Tools.Net.Web.click({
  session_id,
  ref,
  element,
  button,
  modifiers,
  doubleClick,
});
await Tools.Net.Web.fill({ selector, value, session_id });
await Tools.Net.Web.evaluate({ script, session_id, timeout_ms });
await Tools.Net.Web.wait_for({ selector, session_id, timeout_ms });
await Tools.Net.Web.snapshot({ session_id, include_links, include_images });
await Tools.Net.Web.screenshot({ session_id, format, quality, full_page });
await Tools.Net.Web.scroll({ session_id, direction, amount });
await Tools.Net.Web.close({ session_id });
await Tools.Net.Web.download_file({
  session_id,
  visit_key,
  link_number,
  save_dir,
  file_name,
});
```

### 5.9 Tools.visit_web 页面访问

专用于简单页面内容抓取（如 image_search.js 中的 Google Lens 识别）：

```javascript
const res = await Tools.visit_web({
  url: lensUrl,
  user_agent_preset: "desktop", // 使用桌面端 UA
  timeout: 15000,
});
// res.title — 页面标题
// res.content — 页面文本内容
```

### 5.10 Tools.Memory 记忆操作

```javascript
// 创建记忆节点
await Tools.Memory.create(title, content, contentType, source, folderPath, tags);

// 更新记忆节点（按标题定位）
await Tools.Memory.update(oldTitle, {
  newTitle, content, contentType, source, credibility, importance, folderPath, tags
});

// 删除记忆节点
await Tools.Memory.deleteMemory(title);

// 批量移动记忆到新文件夹
await Tools.Memory.move(targetFolderPath, titlesArray, sourceFolderPath);

// 创建记忆链接
await Tools.Memory.link(sourceTitle, targetTitle, linkType, weight, description);

// 查询记忆链接
await Tools.Memory.queryLinks(linkId, sourceTitle, targetTitle, linkType, limit);

// 更新记忆链接
await Tools.Memory.updateLink(linkId, sourceTitle, targetTitle, linkType, newLinkType, weight, description);

// 删除记忆链接
await Tools.Memory.deleteLink(linkId, sourceTitle, targetTitle, linkType);
```

### 5.11 跨工具包调用

`toolCall` 用于调用当前包以外的工具，支持两种调用签名：

**签名 A：双参数形式（推荐）**

```javascript
const result = await toolCall("tool_name", { param1: "value1" });
```

生产实例（extended_chat.js）：

```javascript
const listResult = await toolCall('list_chats', { query: keyword, limit: 50 });
const findResult = await toolCall('find_chat', { query: title, match: 'contains' });
```

**签名 B：对象形式**

```javascript
const result = await toolCall({ name: "tool_name", params: { param1: "value1" } });
```

生产实例（extended_http_tools.js）：

```javascript
const result = await toolCall({ name: "http_request", params: toolParams });
```

**常用内置工具调用**：

```javascript
// 加载其他工具包（三兼容入口：MCP / Skill / Sandbox Package）
const result = await toolCall("use_package", { package_name: "some_package" });

// 调用聊天管理工具
await toolCall('create_new_chat', { title: "新对话" });
await toolCall('send_message_to_ai', { chat_id: id, message: "内容" });
await toolCall('get_chat_messages', { chat_id: id, limit: 20 });
```

---

## 第六章 设计模式与最佳实践

### 6.1 环境变量读取模式

**标准必填模式**：

```javascript
function getApiKey() {
  const key = getEnv("MY_API_KEY");
  if (!key || key.trim() === "") {
    throw new Error(
      "环境变量 MY_API_KEY 未配置。\n" +
        "请在 Operit 设置 → 环境变量中添加。\n" +
        "获取地址：https://example.com",
    );
  }
  return key.trim();
}
```

**灵活验证模式**（recipe_search.js — 支持可选/必填切换）：

```javascript
function safeGetEnv(key, required = true) {
  const value = getEnv(key);
  if (!value || value.trim().length === 0) {
    if (required) {
      throw new Error(`环境变量缺失: ${key}。请在系统设置中配置此项后重试。`);
    }
    return null;
  }
  return value.trim();
}
```

**可选环境变量的优雅处理**：

```javascript
const USER_COOKIE = getEnv("BILIBILI_COOKIE") || "";
if (USER_COOKIE) {
  BASE_HEADERS["Cookie"] = USER_COOKIE;
}
```

### 6.2 反向代理支持模式

几乎所有网络 API 工具包都应支持反向代理（中国大陆用户常需）：

```javascript
function resolveApiEndpoint() {
  const proxyUrl = getEnv("MY_PROXY_URL");
  if (proxyUrl && proxyUrl.trim()) {
    let base = proxyUrl.trim().replace(/\/+$/, "");
    if (!/^https?:\/\//i.test(base)) base = "https://" + base;
    return base + "/api/v1/endpoint";
  }
  return DEFAULT_API_ENDPOINT;
}
```

生产实例（arxiv_assistant.js — 带路径智能拼接）：

```javascript
const _proxyDomain = (function () {
  let d = getEnv("ARXIV_PROXY_DOMAIN") || "";
  if (!d) return "https://export.arxiv.org";
  if (!d.startsWith("http")) d = "https://" + d;
  return d.replace(/\/$/, "");
})();
const BASE_URL = _proxyDomain + "/api/query";
const IS_PROXY = _proxyDomain !== "https://export.arxiv.org";
```

生产实例（zhipu_search.js — 智能路径检测）：

```javascript
// 如果代理地址已含 /api/ 路径则直接使用，否则自动附加标准路径
```

### 6.3 多密钥负载均衡

```javascript
function loadApiKeys() {
  const rawKeys = getEnv("API_KEYS");
  if (!rawKeys || rawKeys.trim() === "") {
    throw new Error("环境变量 API_KEYS 未配置。");
  }
  const keys = rawKeys
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
  return [...new Set(keys)]; // 去重
}

// Fisher-Yates 洗牌实现随机调度
const shuffledKeys = [...apiKeys];
for (let i = shuffledKeys.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [shuffledKeys[i], shuffledKeys[j]] = [shuffledKeys[j], shuffledKeys[i]];
}
```

### 6.4 指数退避重试

生产实例（arxiv_assistant.js）：

```javascript
const MAX_RETRIES = 3;
let retryCount = 0;
while (
  retryCount < MAX_RETRIES &&
  (response.statusCode === 429 || response.statusCode >= 500)
) {
  const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);
  console.log(
    `[ArxivAssistant] HTTP ${response.statusCode}，第 ${retryCount + 1} 次重试，等待 ${delay}ms...`,
  );
  await Tools.System.sleep(delay);
  response = await buildRequest().execute();
  retryCount++;
}
```

带多密钥切换的完整重试：

```javascript
async function executeWithRetry(endpoint, payload, maxRetries) {
  let lastError;
  for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await httpPost(endpoint, payload);
        if (response.isSuccessful()) return JSON.parse(response.content);
        if (response.statusCode === 401 || response.statusCode === 403) break; // Key 无效
        if (response.statusCode === 429 || response.statusCode >= 500) {
          const waitTime = Math.min(500 * Math.pow(2, attempt), 8000);
          if (attempt < maxRetries) {
            await Tools.System.sleep(waitTime);
            continue;
          }
        }
        break;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          await Tools.System.sleep(500 * Math.pow(2, attempt));
          continue;
        }
        break;
      }
    }
  }
  throw lastError || new Error("所有密钥和重试均已耗尽");
}
```

### 6.5 参数沙盒化

不直接修改原始 params，创建独立副本处理：

```javascript
function safeNumber(value, defaultVal, min, max) {
  if (value === undefined || value === null || value === "") return defaultVal;
  const num = Number(value);
  if (isNaN(num)) return defaultVal;
  return Math.max(min, Math.min(max, Math.round(num)));
}

function safeBool(value, defaultVal) {
  if (value === undefined || value === null || value === "") return defaultVal;
  if (typeof value === "boolean") return value;
  const str = String(value).trim().toLowerCase();
  if (str === "true" || str === "1" || str === "yes") return true;
  if (str === "false" || str === "0" || str === "no") return false;
  return defaultVal;
}
```

### 6.6 坐标与地理信息标准化

```javascript
function normalizeLocation(input) {
  if (!input) return null;
  const match = input.trim().match(/^(-?\d+\.?\d*)[,，\s]+(-?\d+\.?\d*)$/);
  return match ? `${match[1]},${match[2]}` : null;
}
```

### 6.7 URL 参数序列化

```javascript
function buildQueryString(params) {
  return Object.keys(params)
    .filter(
      (k) => params[k] !== undefined && params[k] !== null && params[k] !== "",
    )
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join("&");
}
```

### 6.8 鲁棒 JSON 解析

```javascript
function robustJsonParse(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) throw new Error("服务器返回内容为空");
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(trimmed.substring(start, end + 1));
    }
    throw new Error(`无法解析 API 响应: ${trimmed.substring(0, 100)}`);
  }
}
```

### 6.9 MIME 类型推断

```javascript
function guessMimeType(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}
```

### 6.10 图片处理模式

```javascript
async function processInputImage(inputPath) {
  if (!inputPath) return null;
  const trimmed = inputPath.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
    return trimmed;
  let localPath = trimmed.replace(/^file:\/\//, "");
  const existsInfo = await Tools.Files.exists(localPath);
  if (!existsInfo.exists) throw new Error("找不到本地文件: " + localPath);
  const fileResult = await Tools.Files.readBinary(localPath);
  if (!fileResult || !fileResult.contentBase64)
    throw new Error("无法读取文件: " + localPath);
  return (
    "data:" + guessMimeType(localPath) + ";base64," + fileResult.contentBase64
  );
}
```

### 6.11 并发执行模式

生产实例（weather_reporter.js — Promise.all 并发调度）：

```javascript
const [now, air, warn, indices] = await Promise.all([
  fastFetch("/v7/weather/now", loc),
  fastFetch("/v7/air/now", loc),
  fastFetch("/v7/warning/now", loc),
  fastFetch("/v7/indices/1d", { ...loc, type: "1,3,5" }),
]);
```

带容错的并发（Promise.allSettled）：

```javascript
const settled = await Promise.allSettled(PLATFORMS.map((p) => p.fn()));
settled.forEach((r, i) => {
  if (r.status === "fulfilled" && r.value?.success) {
    results.push({ platform: PLATFORMS[i].id, data: r.value.data });
  }
});
```

### 6.12 缓存系统模式

```javascript
async function readJsonCache(fileName) {
  try {
    const exists = await Tools.Files.exists(CACHE_DIR + fileName, "android");
    if (!exists?.exists) return null;
    const content = await Tools.Files.read(CACHE_DIR + fileName, "android");
    return content?.content ? JSON.parse(content.content) : null;
  } catch (e) {
    return null;
  }
}
```

### 6.13 文件指纹变更检测

```javascript
async function generateFingerprints() {
  const listing = await Tools.Files.list(dir, "android");
  const fingerprints = {};
  listing.entries.forEach((entry) => {
    if (!entry.isDirectory && entry.name.endsWith(".js")) {
      fingerprints[entry.name] =
        entry.name + "|" + (entry.size || 0) + "|" + (entry.lastModified || "");
    }
  });
  return fingerprints;
}
```

### 6.14 长输出持久化模式

```javascript
async function persistIfTooLong(command, result) {
  const output = String(result?.output ?? "");
  if (output.length <= MAX_INLINE_CHARS) return null;
  await Tools.Files.mkdir(CLEAN_DIR, true);
  const filePath = CLEAN_DIR + "/output_" + Date.now() + ".log";
  await Tools.Files.write(filePath, output, false);
  return {
    output: "(saved_to_file)",
    output_saved_to: filePath,
    output_chars: output.length,
  };
}
```

### 6.15 降级处理逻辑

```javascript
// 导航模式降级
if ((mode === "riding" || mode === "walking") && isCoord) {
  const endpoint = mode === "riding" ? "bikenavi" : "walknavi";
  return `${CONFIG.SCHEME}map/${endpoint}?${buildQuery(params)}`;
}
console.warn(`[BaiduMap] ${mode} 导航需要坐标，已降级至路径规划。`);
return UrlBuilder.direction(dest, mode, origin);
```

### 6.16 XML 标签提取模式

生产实例（arxiv_assistant.js — 解析 Atom/XML 响应）：

```javascript
function extractTag(xml, tag) {
  const regex = new RegExp(
    "<(?:\\w+:)?\\b" +
      tag +
      "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:\\w+:)?\\b" +
      tag +
      ">",
    "i",
  );
  const match = xml.match(regex);
  return match ? cleanText(match[1]) : "";
}

function extractAuthors(entry) {
  const authors = [];
  const authorRegex =
    /<author[^>]*>\s*<name[^>]*>([\s\S]*?)<\/name>\s*<\/author>/gi;
  let match;
  while ((match = authorRegex.exec(entry)) !== null) {
    authors.push(cleanText(match[1]));
  }
  return authors.join(", ");
}
```

### 6.17 HTML 实体解码与文本清洗

```javascript
function decodeHtml(html) {
  if (!html) return "";
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function cleanText(text) {
  if (!text) return "";
  return decodeHtml(text)
    .replace(/\r\n/g, "\n")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanHtml(text) {
  if (!text) return "无内容描述";
  return text.replace(/<[^>]+>/g, "").trim();
}
```

### 6.18 调试模式开关

生产实例（recipe_search.js）：

```javascript
const DEBUG_MODE = getEnv("RECIPE_DEBUG") === "true";

function debugLog(message, data = null) {
  if (DEBUG_MODE) {
    console.log(`[RecipeMaster Debug] ${message}`);
    if (data) console.log(JSON.stringify(data, null, 2));
  }
}
```

### 6.19 城市/地理信息缓存模式

生产实例（weather_reporter.js — 内存级缓存池）：

```javascript
const ID_CACHE = new Map();

async function getCityId(name) {
  const target = name || DEFAULT_CITY;
  if (!target) throw new Error("未指定城市名称且默认城市环境变量不存在");
  if (ID_CACHE.has(target)) return ID_CACHE.get(target); // 缓存命中
  const res = await fastFetch("/geo/v2/city/lookup", { location: target });
  const cityInfo = res.location[0];
  ID_CACHE.set(target, cityInfo); // 写入缓存
  return cityInfo;
}
```

### 6.20 初始化守卫模式

确保某些一次性初始化操作只执行一次：

```javascript
let wbiKeys = null;
let initialized = false;

async function init() {
  if (initialized) return;
  const navData = await fetchNavData();
  wbiKeys = extractWbiKeys(navData);
  initialized = true;
}

// 每个公开接口在执行前都调用 init()
get_subtitles: async (params) => {
  await init();
  // ... 业务逻辑
};
```

---

## 第七章 test 工具规范

### 7.1 每个工具包应包含 test 工具

所有生产级工具包都包含一个 `test` 工具用于连通性诊断。这是**强烈推荐**的标准实践。

```json
{
  "name": "test",
  "description": {
    "zh": "测试 API 连通性。验证 API Key 有效性和网络可达性。",
    "en": "Test API connectivity and key validity."
  },
  "parameters": []
}
```

### 7.2 test 实现模板（标准版）

```javascript
async function testHandler() {
  const apiKey = getEnv("MY_API_KEY");
  const keyConfigured = !!(apiKey && apiKey.trim() !== "");

  const report = [];
  report.push("## 🔧 连通性诊断\n");
  report.push("| 配置项 | 状态 |");
  report.push("| :--- | :--- |");
  report.push(
    "| API 密钥 | " +
      (keyConfigured
        ? "✅ 已配置 (" + apiKey.trim().substring(0, 8) + "***)"
        : "❌ 未配置") +
      " |",
  );

  if (!keyConfigured) {
    return {
      success: false,
      message: "API Key 未配置",
      data: report.join("\n"),
    };
  }

  const startTime = Date.now();
  try {
    const response = await httpClient
      .newRequest()
      .url(API_BASE + "/test")
      .method("GET")
      .header("Authorization", "Bearer " + apiKey.trim())
      .build()
      .execute();
    const latency = Date.now() - startTime;

    report.push(
      "| 连通性 | " +
        (response.isSuccessful()
          ? "✅ 正常"
          : "❌ HTTP " + response.statusCode) +
        " |",
    );
    report.push("| 响应延迟 | " + latency + " ms |");
    return {
      success: response.isSuccessful(),
      message: response.isSuccessful() ? "测试通过" : "测试失败",
      data: report.join("\n"),
    };
  } catch (err) {
    report.push("| 连通性 | ❌ " + err.message + " |");
    return { success: false, message: "网络错误", data: report.join("\n") };
  }
}
```

### 7.3 test 实现（带登录状态检测）

生产实例（bilibili_search.js）— 在连通性测试基础上检测 Cookie 有效性和用户登录状态：

```javascript
async function testHandler() {
  const cookie = getEnv("BILIBILI_COOKIE");
  const cookieConfigured = !!(cookie && cookie.trim());

  const report = [];
  report.push("## 🔧 连通性诊断\n");
  report.push("| 配置项 | 状态 |");
  report.push("| :--- | :--- |");
  report.push(
    "| Cookie | " + (cookieConfigured ? "✅ 已配置" : "⚠️ 未配置（仅可访问公开内容）") + " |",
  );

  const startTime = Date.now();
  try {
    // 向 B 站 nav 接口发起请求，可同时验证网络和登录状态
    const response = await httpClient
      .newRequest()
      .url("https://api.bilibili.com/x/web-interface/nav")
      .method("GET")
      .headers({
        "User-Agent": CONFIG.DEFAULT_UA,
        Referer: "https://www.bilibili.com/",
        Cookie: cookieConfigured ? cookie.trim() : "",
      })
      .build()
      .execute();
    const latency = Date.now() - startTime;
    report.push(
      "| 连通性 | " +
        (response.isSuccessful() ? "✅ 正常" : "❌ HTTP " + response.statusCode) +
        " |",
    );
    report.push("| 响应延迟 | " + latency + " ms |");

    if (response.isSuccessful()) {
      const json = JSON.parse(response.content);
      const isLogin = json?.data?.isLogin;
      report.push(
        "| 登录状态 | " +
          (isLogin
            ? "✅ 已登录（" + (json.data.uname || "未知用户") + "）"
            : "⚠️ 未登录（Cookie 无效或未配置）") +
          " |",
      );
      return {
        success: true,
        message: isLogin ? "测试通过，已登录" : "测试通过，未登录",
        data: report.join("\n"),
      };
    }
    return { success: false, message: "网络请求失败", data: report.join("\n") };
  } catch (err) {
    report.push("| 连通性 | ❌ " + err.message + " |");
    return { success: false, message: "网络错误", data: report.join("\n") };
  }
}
```

### 7.4 test 实现（无独立验证端点）

当 API 没有专门的验证端点时，向主站发起轻量 GET 请求验证网络连通性，并在报告中注明该限制：

```javascript
async function testHandler() {
  const apiKey = getEnv("MY_API_KEY");
  const configured = !!(apiKey && apiKey.trim());

  const report = [];
  report.push("## 🔧 连通性诊断\n");
  report.push("| 配置项 | 状态 |");
  report.push("| :--- | :--- |");
  report.push(
    "| API 密钥 | " +
      (configured
        ? "✅ 已配置 (" + apiKey.trim().substring(0, 8) + "***)"
        : "❌ 未配置") +
      " |",
  );

  if (!configured) {
    return {
      success: false,
      message: "API Key 未配置",
      data: report.join("\n"),
    };
  }

  // 无专用验证端点：向主站根路径发起 HEAD/GET 验证网络连通性
  const startTime = Date.now();
  try {
    const response = await httpClient
      .newRequest()
      .url(CONFIG.API_BASE) // 仅验证主站可达，不代表 Key 有效
      .method("GET")
      .header("User-Agent", CONFIG.DEFAULT_UA)
      .build()
      .execute();
    const latency = Date.now() - startTime;

    report.push(
      "| 网络连通性 | " +
        (response.isSuccessful() ? "✅ 正常" : "⚠️ HTTP " + response.statusCode) +
        " |",
    );
    report.push("| 响应延迟 | " + latency + " ms |");
    report.push("| Key 有效性 | ⚠️ 无法自动验证（该 API 无独立鉴权端点） |");
    return {
      success: response.isSuccessful(),
      message: response.isSuccessful()
        ? "网络连通正常，请手动验证 API Key"
        : "网络异常，请检查代理或网络设置",
      data: report.join("\n"),
    };
  } catch (err) {
    report.push("| 网络连通性 | ❌ " + err.message + " |");
    return { success: false, message: "网络错误", data: report.join("\n") };
  }
}
```

### 7.5 test 实现（多 API 联合测试）

生产实例（recipe_search.js — 逐一检测三个 API 的配置状态）：

```javascript
async function testRecipeAPIs() {
  const results = [];
  results.push({
    name: "Spoonacular",
    configured: !!safeGetEnv("SPOONACULAR_API_KEY", false),
  });
  results.push({
    name: "ShowAPI",
    configured: !!safeGetEnv("SHOWAPI_APPKEY", false),
  });
  results.push({
    name: "Jina Reader",
    configured: !!safeGetEnv("JINA_READER_KEY", false),
  });

  const configuredCount = results.filter((r) => r.configured).length;
  complete({
    success: configuredCount > 0,
    message: `已配置 ${configuredCount}/3 个 API`,
    data: formatTestReport(results),
  });
}
```

---

## 第八章 安全规范

### 8.1 禁止硬编码密钥

绝对不要在代码中硬编码 API Key、Token、密码。所有敏感信息通过环境变量获取。

验证引擎会检测以下模式：

```javascript
const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/,
  /[Aa][Pp][Ii][_-]?[Kk][Ee][Yy]\s*[:=]\s*['"][a-zA-Z0-9\-_]{16,}/,
  /[Tt]oken\s*[:=]\s*['"][a-zA-Z0-9\-_\.]{20,}/,
  /Bearer\s+[a-zA-Z0-9\-_\.]{30,}/,
];
```

### 8.2 密钥展示脱敏

```javascript
const keyHint = apiKey.substring(0, 8) + "***";
// 绝对禁止: console.log('API Key: ' + apiKey);
```

### 8.3 输入验证

```javascript
// URL 校验
if (!url || !/^https?:\/\/.+/i.test(url)) {
  throw new Error("URL 无效，必须以 http:// 或 https:// 开头");
}

// 枚举校验
const VALID_ENGINES = [
  "search_std",
  "search_pro",
  "search_pro_sogou",
  "search_pro_quark",
];
if (!VALID_ENGINES.includes(engine)) engine = "search_std";

// 范围约束
const maxResults = Math.max(
  1,
  Math.min(100, Math.round(Number(params.max_results) || 10)),
);
```

### 8.4 Shell 命令转义

```javascript
function escapeForShell(str) {
  return str.replace(/'/g, "'\\''");
}
const safeArg = "'" + escapeForShell(userInput) + "'";
```

### 8.5 文件路径安全

```javascript
if (filePath.startsWith("file://")) filePath = filePath.substring(7);
const existsInfo = await Tools.Files.exists(filePath);
if (!existsInfo.exists) throw new Error(`找不到本地文件: ${filePath}`);
```

---

## 第九章 格式检查与验证

### 9.1 验证引擎检查项

**错误级别（必须修复）**：缺少 name/description/tools 字段、工具名重复、exports 导出缺失、疑似硬编码密钥

**警告级别（建议修复）**：name 不符合小写下划线格式、name 与文件名不一致、缺少双语描述、category 不在已知列表中、环境变量名不是 UPPER_CASE

**信息级别（可选优化）**：未声明 version/author/category、display_name 缺少双语

### 9.2 自检清单

```
□ METADATA 位于文件最顶部（前面无任何内容）
□ METADATA JSON 语法正确
□ name 字段与文件名一致且为小写下划线格式
□ description 包含 zh 和 en 双语，描述详细、关键词丰富
□ category 值在 14 个有效枚举内（Automatic/Draw/Chat/Development/File/Life/Media/Memory/Network/Search/System/Utility/Workflow/Admin）
□ 每个 tool 都有 name、description、parameters
□ 参数声明包含 name、type、required、description，含格式/默认值/范围说明
□ 每个非 advice 工具都有对应的 exports.工具名 导出
□ 导出名与 METADATA tools[].name 完全一致
□ 所有工具函数最终调用 complete() 返回结果
□ 所有代码路径（含 catch 块）都会调用 complete()
□ 环境变量通过 getEnv() 获取，无硬编码密钥
□ 密钥展示已脱敏
□ 错误处理完整，有友好的错误消息
□ 有 test 工具进行连通性诊断
□ 输出内容有截断保护
□ 使用 IIFE 封装避免全局污染
□ 支持反向代理（如需网络请求）
```

---

## 第十章 完整模板

### 10.1 网络 API 工具包模板（标准版）

```javascript
/* METADATA
{
    "name": "my_api_toolkit",
    "version": "1.0",
    "display_name": {
        "zh": "我的 API 工具包",
        "en": "My API Toolkit"
    },
    "description": {
        "zh": "基于 XXX API 提供 YYY 功能。支持 ZZZ 特性。适用于 AAA 场景。",
        "en": "XXX API toolkit providing YYY. Supports ZZZ. Ideal for AAA scenarios."
    },
    "env": [
        {
            "name": "MY_API_KEY",
            "description": { "zh": "API 密钥，获取地址：https://example.com/api-keys", "en": "API key. Get at: https://example.com/api-keys" },
            "required": true
        },
        {
            "name": "MY_PROXY_URL",
            "description": { "zh": "自定义反向代理域名（可选）", "en": "Custom reverse proxy URL (optional)" },
            "required": false
        }
    ],
    "author": "Author Name",
    "category": "Network",
    "enabledByDefault": false,
    "tools": [
        {
            "name": "search",
            "description": { "zh": "执行搜索查询。支持自定义结果数量。", "en": "Execute search query." },
            "parameters": [
                { "name": "query", "type": "string", "required": true, "description": { "zh": "搜索关键词", "en": "Search keywords" } },
                { "name": "max_results", "type": "number", "required": false, "default": 5, "description": { "zh": "最大结果数（1-20），默认 5", "en": "Max results (1-20), default 5" } }
            ]
        },
        {
            "name": "test",
            "description": { "zh": "测试 API 连通性与密钥有效性。", "en": "Test API connectivity." },
            "parameters": []
        }
    ]
}
*/

const myApiToolkit = (function () {
  // =========================================================================
  // 第一层：配置常量
  // =========================================================================
  const CONFIG = {
    DEFAULT_GATEWAY: "https://api.example.com",
    SEARCH_ENDPOINT: "/v1/search",
    DEFAULT_MAX_RESULTS: 5,
    MAX_RESULTS_CAP: 20,
    MAX_CONTENT_LENGTH: 15000,
    MAX_TOTAL_OUTPUT: 80000,
    DEFAULT_UA: "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
  };

  // =========================================================================
  // 第二层：基础设施
  // =========================================================================
  const httpClient = OkHttp.newClient();

  function getApiKey() {
    const key = getEnv("MY_API_KEY");
    if (!key || key.trim() === "") {
      throw new Error(
        "环境变量 MY_API_KEY 未配置。\n请在 Operit 设置 → 环境变量中添加。",
      );
    }
    return key.trim();
  }

  function resolveGateway() {
    const proxy = getEnv("MY_PROXY_URL");
    if (proxy && proxy.trim()) {
      let base = proxy.trim().replace(/\/+$/, "");
      if (!/^https?:\/\//i.test(base)) base = "https://" + base;
      return base;
    }
    return CONFIG.DEFAULT_GATEWAY;
  }

  function safeNumber(value, def, min, max) {
    if (value === undefined || value === null || value === "") return def;
    const n = Number(value);
    return isNaN(n) ? def : Math.max(min, Math.min(max, Math.round(n)));
  }

  function truncateContent(content, maxLen) {
    if (!content || content.length <= maxLen) return content || "";
    return (
      content.substring(0, maxLen) + "\n\n*(已自动截断至 " + maxLen + " 字符)*"
    );
  }

  // =========================================================================
  // 第三层：网络请求引擎
  // =========================================================================
  async function callApi(endpoint, payload) {
    const apiKey = getApiKey();
    const url = resolveGateway() + endpoint;
    const response = await httpClient
      .newRequest()
      .url(url)
      .method("POST")
      .headers({
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
        "User-Agent": CONFIG.DEFAULT_UA,
      })
      .body(JSON.stringify(payload), "json")
      .build()
      .execute();
    if (!response.isSuccessful()) {
      let detail = response.content;
      try {
        detail = JSON.parse(response.content).message || detail;
      } catch (e) {}
      throw new Error(
        "API 请求失败 [HTTP " + response.statusCode + "]: " + detail,
      );
    }
    return JSON.parse(response.content);
  }

  // =========================================================================
  // 第四层：参数处理 & 第五层：格式化 & 第六层：业务逻辑
  // =========================================================================
  async function searchHandler(params) {
    const query = String(params.query || "").trim();
    if (!query) throw new Error("搜索关键词 (query) 不能为空。");
    const payload = {
      query,
      max_results: safeNumber(
        params.max_results,
        CONFIG.DEFAULT_MAX_RESULTS,
        1,
        CONFIG.MAX_RESULTS_CAP,
      ),
    };
    const apiResponse = await callApi(CONFIG.SEARCH_ENDPOINT, payload);
    const results = apiResponse.results || [];
    // 格式化 Markdown 输出
    let output = `## 🔍 搜索结果\n\n> **查询**: ${query}\n\n`;
    results.forEach((item, idx) => {
      output += `#### [${idx + 1}] ${item.title || "无标题"}\n**来源**: ${item.url || ""}\n${truncateContent(item.content, CONFIG.MAX_CONTENT_LENGTH)}\n\n`;
    });
    return {
      success: true,
      message: "搜索完成，共 " + results.length + " 条结果",
      data: truncateContent(output, CONFIG.MAX_TOTAL_OUTPUT),
    };
  }

  async function testHandler() {
    const apiKey = getEnv("MY_API_KEY");
    const configured = !!(apiKey && apiKey.trim());
    const report = [
      "## 🔧 连通性诊断\n",
      "| 项目 | 状态 |",
      "| :--- | :--- |",
      "| API 密钥 | " +
        (configured
          ? "✅ (" + apiKey.trim().substring(0, 8) + "***)"
          : "❌ 未配置") +
        " |",
      "| API 地址 | " + resolveGateway() + " |",
    ];
    if (!configured)
      return {
        success: false,
        message: "API Key 未配置",
        data: report.join("\n"),
      };
    const start = Date.now();
    try {
      await callApi(CONFIG.SEARCH_ENDPOINT, { query: "test", max_results: 1 });
      report.push("| 连通性 | ✅ 正常 (" + (Date.now() - start) + "ms) |");
      return { success: true, message: "测试通过", data: report.join("\n") };
    } catch (err) {
      report.push("| 连通性 | ❌ " + err.message + " |");
      return { success: false, message: "测试失败", data: report.join("\n") };
    }
  }

  // =========================================================================
  // 统一包装与公开接口
  // =========================================================================
  async function wrap(fn, params, name) {
    try {
      complete(await fn(params || {}));
    } catch (e) {
      complete({ success: false, message: name + " 失败: " + e.message });
    }
  }

  return {
    search: (params) => wrap(searchHandler, params, "搜索"),
    test: () => wrap(testHandler, {}, "连通性测试"),
  };
})();

exports.search = myApiToolkit.search;
exports.test = myApiToolkit.test;
```

### 10.2 多 API 聚合工具包模板

适用于整合多个数据源的工具包（参考 recipe_search.js、developer_search.js）：

```javascript
/* METADATA
{
    "name": "multi_api_toolkit",
    "version": "1.0",
    "display_name": { "zh": "多源聚合工具包", "en": "Multi-Source Aggregation Toolkit" },
    "description": {
        "zh": "多源数据聚合工具包。整合 API-A 和 API-B 两大数据源，提供搜索、详情及连通性测试功能。",
        "en": "Multi-source data toolkit integrating API-A and API-B."
    },
    "env": [
        { "name": "API_A_KEY", "description": { "zh": "API-A 密钥（可选）", "en": "API-A key (optional)" }, "required": false },
        { "name": "API_B_KEY", "description": { "zh": "API-B 密钥（可选）", "en": "API-B key (optional)" }, "required": false }
    ],
    "category": "Search",
    "tools": [
        { "name": "search_a", "description": { "zh": "通过 API-A 搜索", "en": "Search via API-A" }, "parameters": [{ "name": "query", "type": "string", "required": true, "description": { "zh": "关键词", "en": "Keywords" } }] },
        { "name": "search_b", "description": { "zh": "通过 API-B 搜索", "en": "Search via API-B" }, "parameters": [{ "name": "query", "type": "string", "required": true, "description": { "zh": "关键词", "en": "Keywords" } }] },
        { "name": "test", "description": { "zh": "测试所有 API 连通性", "en": "Test all APIs" }, "parameters": [] }
    ]
}
*/

const multiApiToolkit = (function () {
  const client = OkHttp.newClient();

  function safeGetEnv(key, required = true) {
    const value = getEnv(key);
    if (!value || value.trim().length === 0) {
      if (required) throw new Error(`环境变量缺失: ${key}`);
      return null;
    }
    return value.trim();
  }

  async function searchA(params) {
    /* API-A 搜索逻辑 */
  }
  async function searchB(params) {
    /* API-B 搜索逻辑 */
  }

  async function testAll() {
    const results = [
      { name: "API-A", configured: !!safeGetEnv("API_A_KEY", false) },
      { name: "API-B", configured: !!safeGetEnv("API_B_KEY", false) },
    ];
    const count = results.filter((r) => r.configured).length;
    // 注意：testAll 直接调用 complete()，因此不使用 wrap 包装
    return complete({
      success: count > 0,
      message: `已配置 ${count}/${results.length} 个 API`,
      data: /* formatReport(results) */ "",
    });
  }

  // search_a / search_b 应在此处添加 try-catch 并调用 complete()
  // 为保持示例简洁，详见 10.1 的 wrapExecution 模式
  return {
    search_a: async (params) => { try { complete(await searchA(params)); } catch(e) { complete({ success: false, message: e.message }); } },
    search_b: async (params) => { try { complete(await searchB(params)); } catch(e) { complete({ success: false, message: e.message }); } },
    test: testAll,
  };
})();

exports.search_a = multiApiToolkit.search_a;
exports.search_b = multiApiToolkit.search_b;
exports.test = multiApiToolkit.test;
```

### 10.3 系统操作工具包模板

```javascript
/* METADATA
{
    "name": "my_system_toolkit",
    "version": "1.0",
    "display_name": { "zh": "系统工具", "en": "System Toolkit" },
    "description": { "zh": "系统管理工具，提供终端命令执行。", "en": "System toolkit with terminal execution." },
    "enabledByDefault": true,
    "category": "System",
    "tools": [
        { "name": "run_command", "description": { "zh": "执行终端命令", "en": "Execute terminal command" }, "parameters": [
            { "name": "command", "type": "string", "required": true, "description": { "zh": "要执行的命令", "en": "Command to execute" } }
        ] }
    ]
}
*/

const mySystemToolkit = (function () {
  return {
    run_command: async (params) => {
      try {
        if (!params.command?.trim()) throw new Error("命令不能为空");
        const session = await Tools.System.terminal.create("sys_session");
        const result = await Tools.System.terminal.exec(
          session.sessionId,
          params.command,
        );
        complete({ success: true, data: result.output.trim() });
      } catch (e) {
        complete({ success: false, message: e.message });
      }
    },
  };
})();

exports.run_command = mySystemToolkit.run_command;
```

### 10.4 文件上传工具包模板

```javascript
/* METADATA
{
    "name": "my_upload_toolkit",
    "version": "1.0",
    "display_name": { "zh": "文件上传工具", "en": "File Upload Toolkit" },
    "description": { "zh": "文件上传工具。支持将本地文件上传至云端。", "en": "Upload local files to cloud." },
    "env": [{ "name": "UPLOAD_API_KEY", "description": { "zh": "上传服务 API 密钥", "en": "Upload API key" }, "required": true }],
    "category": "File",
    "tools": [
        { "name": "upload_file", "description": { "zh": "上传本地文件", "en": "Upload a local file" }, "parameters": [
            { "name": "file_path", "type": "string", "required": true, "description": { "zh": "本地文件绝对路径", "en": "Local file path" } }
        ] },
        { "name": "test", "description": { "zh": "测试连通性", "en": "Test connectivity" }, "parameters": [] }
    ]
}
*/

const myUploadToolkit = (function () {
  const CONFIG = { API_ENDPOINT: "https://api.storage.example.com/upload" };

  function guessMimeType(p) {
    const l = p.toLowerCase();
    if (l.endsWith(".png")) return "image/png";
    if (l.endsWith(".jpg") || l.endsWith(".jpeg")) return "image/jpeg";
    return "application/octet-stream";
  }

  return {
    upload_file: async (params) => {
      try {
        let fp = (params.file_path || "").trim();
        if (!fp) throw new Error("file_path 不能为空");
        if (fp.startsWith("file://")) fp = fp.substring(7);
        const exists = await Tools.Files.exists(fp);
        if (!exists.exists) throw new Error(`找不到文件: ${fp}`);
        const key = getEnv("UPLOAD_API_KEY");
        if (!key) throw new Error("UPLOAD_API_KEY 未配置");
        const resp = await Tools.Net.uploadFile({
          url: CONFIG.API_ENDPOINT,
          method: "POST",
          form_data: { apikey: key.trim() },
          files: [
            {
              field_name: "file",
              file_path: fp,
              content_type: guessMimeType(fp),
            },
          ],
        });
        const json = JSON.parse(resp.content);
        complete({
          success: true,
          message: "上传成功",
          data: { url: json.url },
        });
      } catch (e) {
        complete({ success: false, message: `上传失败: ${e.message}` });
      }
    },
    test: async () => {
      /* 连通性测试 */
    },
  };
})();

exports.upload_file = myUploadToolkit.upload_file;
exports.test = myUploadToolkit.test;
```

### 10.5 Intent 唤起工具包模板

```javascript
/* METADATA
{
    "name": "my_app_launcher",
    "version": "1.0",
    "display_name": { "zh": "应用唤起工具", "en": "App Launcher" },
    "description": { "zh": "通过 Android Intent 唤起第三方应用功能。", "en": "Launch app features via Android Intent." },
    "category": "System",
    "tools": [
        { "name": "open_feature", "description": { "zh": "打开应用指定功能", "en": "Open app feature" }, "parameters": [
            { "name": "action", "type": "string", "required": true, "description": { "zh": "功能标识", "en": "Feature action" } }
        ] }
    ]
}
*/

const myAppLauncher = (function () {
  const CONFIG = {
    PKG: "com.target.app",
    ACTION: "android.intent.action.VIEW",
    SCHEME: "myapp://",
  };

  async function callIntent(uri) {
    const sys = globalThis.Tools?.System;
    if (!sys?.intent) throw new Error("系统缺失 Intent 能力");
    return !!(await sys.intent({
      action: CONFIG.ACTION,
      category: "android.intent.category.DEFAULT",
      uri,
      package: CONFIG.PKG,
    }));
  }

  return {
    open_feature: async (params) => {
      try {
        const ok = await callIntent(CONFIG.SCHEME + params.action);
        complete({ success: ok, message: ok ? "应用已唤起" : "唤起失败" });
      } catch (e) {
        complete({ success: false, message: e.message });
      }
    },
  };
})();

exports.open_feature = myAppLauncher.open_feature;
```

### 10.6 Advice/配置指南工具包模板

```javascript
/* METADATA
{
    "name": "my_config_guide",
    "version": "1.0",
    "display_name": { "zh": "配置指南", "en": "Config Guide" },
    "description": { "zh": "提供系统配置排查手册和配置操作。", "en": "Config guide and operational tools." },
    "enabledByDefault": true,
    "category": "System",
    "tools": [
        { "name": "troubleshooting_guide", "description": { "zh": "排查手册（给 AI 参考）", "en": "Troubleshooting guide" }, "parameters": [], "advice": true },
        { "name": "get_config", "description": { "zh": "获取当前配置", "en": "Get config" }, "parameters": [] }
    ]
}
*/

// 注意：troubleshooting_guide 标记为 advice: true，其功能内容全部写在 METADATA
// description 字段中，无需实际导出执行逻辑（此导出可省略，此处仅为示范）。
// 参见第 2.7 节"advice 特殊标记"。

async function get_config() {
  try {
    const result = await Tools.SoftwareSettings.listModelConfigs();
    complete({ success: true, data: result });
  } catch (e) {
    complete({ success: false, message: e.message });
  }
}

exports.troubleshooting_guide = function () {
  // 注意：advice 工具无需导出实际业务逻辑，此处仅为兼容性保留。
  // 根据 2.7 节规范，advice: true 的工具可省略此导出。
  complete({ success: true, message: "手册已加载" });
};
exports.get_config = get_config;
```

---

## 第十一章 常见错误与排查

### 11.1 METADATA 解析失败

**症状**：工具包不出现在可用列表中  
**排查**：确认 `/* METADATA` 位于最顶部（前面无任何内容）、JSON 语法正确（引号/逗号/括号配对）、以 `*/` 正确关闭、文件编码为 UTF-8

### 11.2 工具不可调用

**症状**：METADATA 解析成功但工具无法调用  
**排查**：检查 `exports.工具名` 与 METADATA `tools[].name` 完全一致（大小写敏感）、导出的是函数（非 undefined）、函数调用了 `complete()`

### 11.3 complete() 未被调用

**症状**：工具调用超时或无响应  
**排查**：确保所有代码路径（含 catch 块）都调用 `complete()`、异步操作的错误被捕获、使用 wrap 包装器统一处理

### 11.4 环境变量读取为 null

**排查**：确认变量名拼写正确（区分大小写）、已在设置中配置、MCP 环境变量与 `getEnv()` 不互通

### 11.5 网络请求失败

**排查**：URL 含协议头 `https://`、API Key 有效、考虑网络环境添加反向代理、添加重试机制、检查请求头（User-Agent, Referer 等反爬虫要求）

### 11.6 文件操作失败

**排查**：Android 侧路径使用 `'android'` 参数、先 `mkdir` 确保目录存在、检查文件权限、不要混用 Android 侧和 Linux 侧路径

---

## 第十二章 开发工作流

### 12.1 标准开发流程

1. **定义需求** → 确定工具包要解决什么问题
2. **设计 METADATA** → 先写好声明，定义工具名、参数、描述
3. **搭建骨架** → IIFE + 分层结构 + exports
4. **实现核心逻辑** → 从最简单的工具开始
5. **添加错误处理** → wrap 包装器 + 全路径 complete
6. **实现 test 工具** → 连通性诊断
7. **自检** → 按第九章清单逐项验证
8. **部署测试** → 放入 examples 目录，在 Operit 中实际调用

### 12.2 文件部署

将 `.js` 文件放入 `/storage/emulated/0/Download/Operit/examples/`，系统自动扫描并加载。

### 12.3 enabledByDefault 策略

- `true`：默认可用，适合核心基础设施工具（code_runner、web、workflow、super_admin、extended_chat）
- `false`（默认）：需 `use_package("包名")` 启用，适合专用功能工具

### 12.4 main() 自测函数

部分工具包（如 extended_file_tools.js、extended_http_tools.js）导出一个 `main()` 函数作为包加载时的自测入口。该函数由 `exports.main` 导出，用于验证工具包是否正确加载，但不执行破坏性操作：

```javascript
async function main() {
  const results = [];
  results.push({ tool: 'my_tool_1', result: { success: null, message: '未测试' } });
  results.push({ tool: 'my_tool_2', result: { success: null, message: '未测试（会修改数据）' } });
  complete({
    success: true,
    message: '工具包加载完成（未执行破坏性测试）',
    data: { results }
  });
}
exports.main = myToolkit.main;
```

注意：`main()` 不等同于 `test` 工具。`test` 工具执行真实的连通性诊断，而 `main()` 仅做加载确认。

---

## 第十三章 TypeScript 开发支持

工具包支持 TypeScript 开发，但最终部署的是编译后的 `.js` 文件。

```typescript
interface ToolResult {
  success: boolean;
  message: string;
  data?: any;
  meta?: Record<string, any>;
  error_stack?: string;
}

declare function complete(result: ToolResult): void;
declare function getEnv(key: string): string | null;
declare function getLang(): string;
declare function sendIntermediateResult(result: ToolResult): void;
declare function toolCall(
  toolName: string,
  params: Record<string, any>,
): Promise<any>;
declare function toolCall(
  options: { name: string; params: Record<string, any> },
): Promise<any>;

declare const OPERIT_CLEAN_ON_EXIT_DIR: string;

declare namespace OkHttp {
  function newClient(): HttpClient;
}
interface HttpClient {
  newRequest(): RequestBuilder;
}
interface RequestBuilder {
  url(url: string): RequestBuilder;
  method(method: string): RequestBuilder;
  header(key: string, value: string): RequestBuilder;
  headers(headers: Record<string, string>): RequestBuilder;
  body(body: string, type: 'json' | 'form' | 'text'): RequestBuilder;
  build(): BuiltRequest;
}
interface BuiltRequest {
  execute(): Promise<HttpResponse>;
}
interface HttpResponse {
  isSuccessful(): boolean;
  statusCode: number;
  content: string;
  statusMessage: string;
  headers?: Record<string, string>;
  contentType?: string;
  url?: string;
  size?: number;
}

declare namespace Tools {
  namespace Files {
    function exists(path: string, fs?: string): Promise<{ exists: boolean }>;
    function read(path: string, fs?: string): Promise<{ content: string }>;
    function readBinary(path: string): Promise<{ contentBase64: string }>;
    function write(
      path: string,
      content: string,
      append: boolean,
      fs?: string,
    ): Promise<void>;
    function writeBinary(path: string, base64: string): Promise<void>;
    function mkdir(
      path: string,
      recursive: boolean,
      fs?: string,
    ): Promise<void>;
    function list(
      path: string,
      fs?: string,
    ): Promise<{
      entries: Array<{
        name: string;
        isDirectory: boolean;
        size?: number;
        lastModified?: string;
      }>;
    }>;
    function download(
      url: string,
      savePath: string,
    ): Promise<{ success: boolean }>;
    function move(
      source: string,
      destination: string,
      env?: string,
    ): Promise<any>;
    function copy(
      source: string,
      destination: string,
      recursive?: boolean,
      sourceEnv?: string,
      destEnv?: string,
    ): Promise<any>;
    function info(path: string, env?: string): Promise<any>;
    function zip(
      source: string,
      destination: string,
      env?: string,
    ): Promise<any>;
    function unzip(
      source: string,
      destination: string,
      env?: string,
    ): Promise<any>;
    function open(path: string, env?: string): Promise<any>;
    function share(
      path: string,
      title?: string,
      env?: string,
    ): Promise<any>;
  }
  namespace Memory {
    function create(
      title: string,
      content: string,
      contentType?: string,
      source?: string,
      folderPath?: string,
      tags?: string,
    ): Promise<string>;
    function update(
      oldTitle: string,
      updates: {
        newTitle?: string;
        content?: string;
        contentType?: string;
        source?: string;
        credibility?: number;
        importance?: number;
        folderPath?: string;
        tags?: string;
      },
    ): Promise<string>;
    function deleteMemory(title: string): Promise<string>;
    function move(
      targetFolderPath: string,
      titles?: string[],
      sourceFolderPath?: string,
    ): Promise<string>;
    function link(
      sourceTitle: string,
      targetTitle: string,
      linkType?: string,
      weight?: number,
      description?: string,
    ): Promise<any>;
    function queryLinks(
      linkId?: number,
      sourceTitle?: string,
      targetTitle?: string,
      linkType?: string,
      limit?: number,
    ): Promise<any>;
    function updateLink(
      linkId?: number,
      sourceTitle?: string,
      targetTitle?: string,
      linkType?: string,
      newLinkType?: string,
      weight?: number,
      description?: string,
    ): Promise<any>;
    function deleteLink(
      linkId?: number,
      sourceTitle?: string,
      targetTitle?: string,
      linkType?: string,
    ): Promise<any>;
  }
  namespace Net {
    function uploadFile(params: {
      url: string;
      method: string;
      headers?: Record<string, string>;
      form_data?: Record<string, string>;
      files: Array<{
        field_name: string;
        file_path: string;
        content_type: string;
      }>;
    }): Promise<{ statusCode: number; content: string }>;
    function visit(
      urlOrParams: string | { url: string; include_image_links?: boolean },
    ): Promise<{
      visitKey?: string;
      content?: string;
      links?: Array<{ text: string; url: string }>;
      imageLinks?: string[];
    }>;
  }
  namespace System {
    function sleep(ms: number): Promise<void>;
    function shell(
      command: string,
    ): Promise<{ output: string; exitCode: number }>;
    function intent(params: any): Promise<any>;
    function getDeviceInfo(): Promise<any>;
    function getLocation(highAccuracy: boolean, timeout: number): Promise<any>;
    function getNotifications(
      limit?: number,
      includeOngoing?: boolean,
    ): Promise<any>;
    function installApp(apkPath: string): Promise<any>;
    function startApp(
      packageName: string,
      activity?: string,
    ): Promise<any>;
    namespace terminal {
      function create(name: string): Promise<{ sessionId: string }>;
      function exec(
        sessionId: string,
        command: string,
        timeout?: number,
      ): Promise<{ output: string; exitCode: number; timedOut?: boolean }>;
      function screen(sessionId: string): Promise<{ content: string }>;
      function input(
        sessionId: string,
        params: { input?: string; control?: string },
      ): Promise<any>;
    }
  }
  namespace SoftwareSettings {
    function listSandboxPackages(): Promise<any>;
    function setSandboxPackageEnabled(
      name: string,
      enabled: boolean,
    ): Promise<any>;
    function readEnvironmentVariable(key: string): Promise<any>;
    function writeEnvironmentVariable(key: string, value: string): Promise<any>;
    function restartMcpWithLogs(timeoutMs?: number): Promise<any>;
    function listModelConfigs(): Promise<any>;
    function createModelConfig(options: any): Promise<any>;
    function updateModelConfig(configId: string, updates: any): Promise<any>;
    function deleteModelConfig(configId: string): Promise<any>;
    function testModelConfigConnection(
      configId: string,
      modelIndex?: number,
    ): Promise<any>;
    function getFunctionModelConfig(functionType: string): Promise<any>;
    function setFunctionModelConfig(
      functionType: string,
      configId: string,
      modelIndex?: number,
    ): Promise<any>;
  }
  function visit_web(params: {
    url: string;
    user_agent_preset?: string;
    timeout?: number;
  }): Promise<{ title?: string; content?: string }>;
}
```

---

## 第十四章 高级模式

### 14.1 嵌入向量索引

```javascript
function buildEmbeddingText(toolkitEntry, tool) {
  const parts = [];
  parts.push("工具包:" + toolkitEntry.name);
  if (toolkitEntry.description)
    parts.push("包功能:" + toolkitEntry.description);
  if (toolkitEntry.category) parts.push("分类:" + toolkitEntry.category);
  parts.push("工具:" + tool.name);
  if (tool.description) parts.push("功能:" + tool.description);
  return parts.join(" | ");
}
```

### 14.2 多平台聚合模式

```javascript
async function fetchAggregate(keyword) {
  const PLATFORMS = [
    { id: "Platform1", fn: () => fetchPlatform1(keyword) },
    { id: "Platform2", fn: () => fetchPlatform2(keyword) },
  ];
  const settled = await Promise.allSettled(PLATFORMS.map((p) => p.fn()));
  const results = [];
  settled.forEach((r, i) => {
    if (r.status === "fulfilled" && r.value?.success) {
      results.push({
        platform: PLATFORMS[i].id,
        data: r.value.data,
        score: computeScore(r.value.data),
      });
    }
  });
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 2);
}
```

### 14.3 三级接口容错切换

```javascript
async function fetchWithFailover(keyword) {
  let result;
  result = await tryTier1(keyword);
  if (result) return result;
  result = await tryTier2(keyword);
  if (result) return result;
  result = await tryTier3(keyword);
  if (result) return result;
  return null;
}
```

### 14.4 图片生成与保存模式

```javascript
async function handleImageResponse(apiResponse, prompt) {
  const imageData = apiResponse.data?.[0];
  if (!imageData) throw new Error("API 返回无效");
  await Tools.Files.mkdir(SAVE_DIR, true);
  const fileName = generateSafeFileName(prompt);
  const savePath = SAVE_DIR + "/" + fileName;
  if (imageData.url) {
    await Tools.Files.download(imageData.url, savePath);
  } else if (imageData.b64_json) {
    await Tools.Files.writeBinary(
      savePath,
      imageData.b64_json.replace(/^data:image\/\w+;base64,/, ""),
    );
  }
  return {
    success: true,
    data: {
      file_path: savePath,
      markdown: "![生成的图片](file://" + savePath + ")",
    },
  };
}
```

### 14.5 格式化测试报告模式

```javascript
function formatTestReport(result) {
  let report = "## API 连通性测试\n\n| 项目 | 状态 |\n| :--- | :--- |\n";
  report += `| 连通性 | ${result.connected ? "✅ 正常" : "❌ 失败"} |\n`;
  report += `| 延迟 | ${result.latency} ms |\n`;
  report += `| 地址 | ${result.apiUrl} |\n`;
  report += `| 密钥 | ${result.keyPreview} |\n`;
  if (result.error) report += `| 错误 | ${result.error} |\n`;
  return report;
}
```

### 14.6 预报周期自适应匹配

生产实例（weather_reporter.js — 根据天数动态选择 API 路径）：

```javascript
const days = p.days || 7;
const endpoint = `/v7/weather/${days > 10 ? 15 : days > 7 ? 10 : days > 3 ? 7 : 3}d`;
const res = await fastFetch(endpoint, { location: city.id });
const table = res.daily
  .slice(0, days)
  .map((d) => `| ${d.fxDate} | ${d.textDay} | ... |`)
  .join("\n");
```

### 14.7 搜索引擎链接工厂模式

生产实例（image_search.js — 配置驱动的多引擎链接生成）：

```javascript
const SearchEngines = {
  general: [
    {
      name: "Google Lens",
      scene: "综合识别",
      url: (img) =>
        `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(img)}`,
      priority: 1,
    },
    {
      name: "Yandex",
      scene: "人脸识别",
      url: (img) =>
        `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(img)}`,
      priority: 2,
    },
    // ...
  ],
  professional: [
    {
      name: "SauceNAO",
      scene: "插画溯源",
      url: (img) =>
        `https://saucenao.com/search.php?db=999&url=${encodeURIComponent(img)}`,
      priority: 2,
    },
    // ...
  ],
};

// 遍历生成报告
for (const engine of SearchEngines.general) {
  output += `* **${engine.name}** (${engine.scene}): [点击搜索](${engine.url(imgUrl)})\n`;
}
```

### 14.8 终端会话与 Python 脚本调用模式

生产实例（ikbs_pysearch.js — 通过终端调用 Python 脚本）：

```javascript
const session = await Tools.System.terminal.create("ikbs_session");
const cmd = `python3 "${SCRIPT_PATH}" search --path "${params.path}" --query "${params.query}" --top_k ${topK}`;
const result = await Tools.System.terminal.exec(session.sessionId, cmd, 60000);
if (result.exitCode !== 0)
  throw new Error(`Python 脚本执行失败: ${result.output}`);
const parsed = JSON.parse(result.output);
```

### 14.9 多平台公开 API 聚合模式（无 Key）

生产实例（developer_search.js — 聚合 Stack Overflow、Dev.to、GitHub 三个免费公开 API）：

当 API 无需密钥时，无需 `env` 声明，直接发起请求。注意合理设置分页参数以节省上下文 token，并使用 `Promise.allSettled` 实现容错并发。

```javascript
const PLATFORMS = [
  {
    id: "stackoverflow",
    name: "Stack Overflow",
    fn: async (keyword, limit) => {
      const url =
        "https://api.stackexchange.com/2.3/search/advanced" +
        "?order=desc&sort=votes&site=stackoverflow&pagesize=" +
        limit + "&q=" + encodeURIComponent(keyword);
      const resp = await httpClient.newRequest().url(url).method("GET").build().execute();
      if (!resp.isSuccessful()) throw new Error("HTTP " + resp.statusCode);
      const data = JSON.parse(resp.content);
      return (data.items || []).map((item) => ({
        title: item.title,
        url: item.link,
        score: item.score,
        answers: item.answer_count,
        tags: (item.tags || []).slice(0, 4).join(", "),
      }));
    },
  },
  {
    id: "devto",
    name: "Dev.to",
    fn: async (keyword, limit) => {
      const url =
        "https://dev.to/api/articles?per_page=" + limit +
        "&q=" + encodeURIComponent(keyword);
      const resp = await httpClient.newRequest().url(url).method("GET")
        .header("Accept", "application/json").build().execute();
      if (!resp.isSuccessful()) throw new Error("HTTP " + resp.statusCode);
      return (JSON.parse(resp.content) || []).map((item) => ({
        title: item.title,
        url: item.url,
        score: item.positive_reactions_count,
        tags: (item.tag_list || []).slice(0, 4).join(", "),
      }));
    },
  },
  {
    id: "github",
    name: "GitHub",
    fn: async (keyword, limit) => {
      const url =
        "https://api.github.com/search/repositories?per_page=" + limit +
        "&sort=stars&q=" + encodeURIComponent(keyword);
      const resp = await httpClient.newRequest().url(url).method("GET")
        .header("Accept", "application/vnd.github+json")
        .header("User-Agent", "OperitToolkit/1.0")
        .build().execute();
      if (!resp.isSuccessful()) throw new Error("HTTP " + resp.statusCode);
      const data = JSON.parse(resp.content);
      return (data.items || []).map((item) => ({
        title: item.full_name,
        url: item.html_url,
        score: item.stargazers_count,
        description: item.description || "",
      }));
    },
  },
];

async function searchDeveloper(params) {
  const keyword = String(params.keyword || "").trim();
  if (!keyword) throw new Error("keyword 不能为空");
  const limit = Math.max(1, Math.min(10, Number(params.limit) || 5));

  if (typeof sendIntermediateResult === "function") {
    sendIntermediateResult({ success: true, message: "正在并发查询三大平台..." });
  }

  const settled = await Promise.allSettled(
    PLATFORMS.map((p) => p.fn(keyword, limit)),
  );

  let output = `## 🔍 开发者搜索结果\n\n> **关键词**: ${keyword}\n\n`;
  let totalCount = 0;

  settled.forEach((r, i) => {
    const platform = PLATFORMS[i];
    if (r.status === "fulfilled" && r.value.length > 0) {
      output += `### ${platform.name}\n\n`;
      r.value.forEach((item, idx) => {
        output += `**${idx + 1}. [${item.title}](${item.url})**\n`;
        if (item.description) output += `> ${item.description}\n`;
        if (item.tags) output += `标签: \`${item.tags}\`  `;
        if (item.score !== undefined) output += `评分/Star: ${item.score}\n`;
        output += "\n";
      });
      totalCount += r.value.length;
    } else {
      output += `### ${platform.name}\n\n> ⚠️ 查询失败: ${r.reason?.message || "无结果"}\n\n`;
    }
  });

  return {
    success: totalCount > 0,
    message: `聚合完成，共 ${totalCount} 条结果`,
    data: output,
  };
}
```

---

## 第十五章 国际化（i18n）

### 15.1 METADATA 中的多语言

所有面向用户的文本字段均支持 `{ "zh": "...", "en": "..." }` 对象格式。

### 15.2 运行时语言检测

```javascript
const locale = (getLang() ?? "").toLowerCase();
const lang = locale.startsWith("zh")
  ? "zh"
  : locale.startsWith("en")
    ? "en"
    : "both";
const message =
  lang === "zh"
    ? zhContent
    : lang === "en"
      ? enContent
      : zhContent + "\n\n---\n\n" + enContent;
```

---

## 第十六章 ToolPkg 打包格式

### 16.1 什么是 ToolPkg

ToolPkg 是将多个相关工具脚本、资源文件和 UI 模块打包成单一 `.toolpkg` 文件（本质是 ZIP 压缩包）的标准格式。相较于单个 `.js` 脚本，ToolPkg 支持多子包组织、资源文件打包、Compose DSL UI 模块、生命周期钩子和多语言内置支持。

### 16.2 文件结构

```
my_package.toolpkg (ZIP)
├── manifest.json                    # 清单文件（必需）
├── main.js                          # ToolPkg 主入口脚本（必需）
├── packages/                        # 子包脚本目录
│   └── my_tool.js                   # 子包脚本（含 METADATA）
├── ui/                              # UI 模块目录（可选）
│   └── setup/
│       └── index.ui.js
├── resources/                       # 资源文件目录（可选）
│   └── data/config.json
└── i18n/                            # 国际化文件（可选）
    ├── zh-CN.js
    └── en-US.js
```

### 16.3 manifest.json 核心字段

```json
{
  "schema_version": 1,
  "toolpkg_id": "com.operit.my_package",
  "version": "1.0.0",
  "main": "main.js",
  "display_name": { "zh": "工具包名", "en": "Package Name" },
  "description": { "zh": "描述", "en": "Description" },
  "subpackages": [
    {
      "id": "my_tool",
      "entry": "packages/my_tool.js",
      "enabled_by_default": false,
      "display_name": { "zh": "子包名", "en": "Sub Package" },
      "description": { "zh": "子包描述", "en": "Sub description" }
    }
  ],
  "resources": [
    {
      "key": "config_data",
      "path": "resources/data/config.json",
      "mime": "application/json"
    }
  ]
}
```

| 字段               | 类型           | 必需 | 说明                                                       |
| ------------------ | -------------- | ---- | ---------------------------------------------------------- |
| `schema_version`   | number         | 是   | 清单架构版本，当前为 `1`                                   |
| `toolpkg_id`       | string         | 是   | 唯一标识符，反向域名格式（如 `com.operit.my_package`）     |
| `version`          | string         | 建议 | 语义化版本号（如 `1.0.0`）                                 |
| `main`             | string         | 是   | 主入口脚本路径（相对于 ZIP 根目录）                        |
| `display_name`     | LocalizedText  | 建议 | 显示名称                                                   |
| `description`      | LocalizedText  | 建议 | 描述信息                                                   |
| `subpackages`      | array          | 否   | 子包列表                                                   |
| `resources`        | array          | 否   | 资源文件列表                                               |

子包脚本必须是标准 JavaScript 文件且包含 `METADATA` 注释块。子包中定义的工具注册为 `<subpackage_id>:<tool_name>` 格式。

### 16.4 main.js 入口与注册

ToolPkg 的 UI 模块和生命周期钩子通过 `main.js` 脚本中的 `registerToolPkg()` 函数注册：

```javascript
const toolboxUI = require("./ui/setup/index.ui.js").default;

function registerToolPkg() {
  // 注册工具箱 UI 模块
  ToolPkg.registerToolboxUiModule({
    id: "my_setup",
    runtime: "compose_dsl",
    screen: toolboxUI,
    params: {},
    title: { zh: "配置界面", en: "Setup" }
  });

  // 注册应用生命周期钩子
  ToolPkg.registerAppLifecycleHook({
    id: "my_app_create",
    event: "application_on_create",
    function: (event) => { return { ok: true }; }
  });

  // 注册消息处理插件
  ToolPkg.registerMessageProcessingPlugin({
    id: "my_message_plugin",
    function: (event) => {
      const msg = String(event.eventPayload?.messageContent ?? "").trim();
      if (!msg.startsWith("/my_cmd")) return { matched: false };
      return { matched: true, text: "已处理" };
    }
  });

  // 注册 XML 渲染插件
  ToolPkg.registerXmlRenderPlugin({
    id: "my_xml",
    tag: "my_tag",
    function: (event) => {
      if (!event.eventPayload?.xmlContent) return { handled: false };
      return { handled: true, text: "渲染完成" };
    }
  });

  // 注册输入菜单开关插件
  ToolPkg.registerInputMenuTogglePlugin({
    id: "my_toggle",
    function: (event) => {
      if (event.eventPayload?.action === "create") {
        return [{ id: "my_feature", title: "My Feature", isChecked: false }];
      }
      return [];
    }
  });

  return true;
}

exports.registerToolPkg = registerToolPkg;
```

### 16.5 ToolPkg 注册 API 速查

| 注册方法                                     | 核心字段                         | 用途               |
| -------------------------------------------- | -------------------------------- | ------------------ |
| `ToolPkg.registerToolboxUiModule(def)`       | id, screen, title                | 工具箱 UI 模块     |
| `ToolPkg.registerAppLifecycleHook(def)`      | id, event, function              | 应用生命周期钩子   |
| `ToolPkg.registerMessageProcessingPlugin(def)` | id, function                   | 消息处理插件       |
| `ToolPkg.registerXmlRenderPlugin(def)`       | id, tag, function                | XML 渲染插件       |
| `ToolPkg.registerInputMenuTogglePlugin(def)` | id, function                     | 输入菜单开关       |
| `ToolPkg.registerToolLifecycleHook(def)`     | id, function                     | 工具执行生命周期   |
| `ToolPkg.registerPromptInputHook(def)`       | id, function                     | Prompt 输入钩子    |
| `ToolPkg.registerPromptHistoryHook(def)`     | id, function                     | Prompt 历史钩子    |
| `ToolPkg.registerSystemPromptComposeHook(def)` | id, function                   | 系统提示词组合钩子 |
| `ToolPkg.registerToolPromptComposeHook(def)` | id, function                     | 工具提示词组合钩子 |
| `ToolPkg.registerPromptFinalizeHook(def)`    | id, function                     | Prompt 最终化钩子  |

生命周期事件枚举：`application_on_create`、`application_on_foreground`、`application_on_background`、`application_on_low_memory`、`application_on_trim_memory`、`application_on_terminate`、`activity_on_create`、`activity_on_start`、`activity_on_resume`、`activity_on_pause`、`activity_on_stop`、`activity_on_destroy`。

### 16.6 Compose DSL UI 模块

UI 模块使用基于 JavaScript 的声明式 UI 框架，灵感来自 Jetpack Compose。

```javascript
function Screen(ctx) {
  const [url, setUrl] = ctx.useState('url', '');

  async function handleConnect() {
    const result = await ctx.callTool('my_tool:test_connection', { url });
    await ctx.showToast(result.success ? '连接成功' : '连接失败: ' + result.error);
  }

  return ctx.UI.Column({ padding: 16 }, [
    ctx.UI.Text({ text: '配置面板', fontSize: 20, bold: true }),
    ctx.UI.Spacer({ height: 16 }),
    ctx.UI.TextField({ value: url, onValueChange: setUrl, label: '地址' }),
    ctx.UI.Spacer({ height: 16 }),
    ctx.UI.Button({ text: '测试连接', onClick: handleConnect })
  ]);
}

exports.default = Screen;
```

**可用布局组件**：Column、Row、Box、Spacer、LazyColumn

**可用基础组件**：Text、TextField、Button、IconButton、Switch、Checkbox、Card、Icon、LinearProgressIndicator、CircularProgressIndicator

**Context API**：

```javascript
// 状态管理
const [value, setValue] = ctx.useState('key', initialValue);
const memoValue = ctx.useMemo('key', () => computeValue(), [deps]);

// 工具调用
const result = await ctx.callTool('package:tool_name', { param: value });

// 环境变量
const apiKey = ctx.getEnv('API_KEY');
await ctx.setEnv('API_KEY', 'new_value');
await ctx.setEnvs({ API_KEY: 'v1', TOKEN: 'v2' });

// 资源访问
const filePath = await ctx.readResource('resource_key');

// 包管理
await ctx.importPackage('package_name');
await ctx.usePackage('package_name');
const packages = await ctx.listImportedPackages();

// UI 交互
await ctx.showToast('消息内容');
await ctx.navigate('/route', { param: value });
ctx.reportError(error);
```

### 16.7 打包与部署

```bash
cd my_package_dir && zip -r ../my_package.toolpkg *
```

部署位置：`Android/data/com.ai.assistance.operit/files/packages/`

---

## 第十七章 案例索引

### 17.1 按复杂度分级

| 复杂度 | 文件                 | 行数  | 特点                             |
| ------ | -------------------- | ----- | -------------------------------- |
| 入门   | image_search.js      | ~350  | 多引擎链接工厂，AI 预识别        |
| 入门   | weather_reporter.js  | ~320  | 并发请求，城市缓存，预报自适应   |
| 中级   | arxiv_assistant.js   | ~350  | XML 解析，指数退避，代理支持     |
| 中级   | anime_search.js      | ~630  | 配额监控，多维度匹配，时间轴解析 |
| 中级   | ikbs_pysearch.js     | ~640  | Python 脚本调用，终端会话        |
| 高级   | recipe_search.js     | ~1080 | 多 API 聚合，Form/JSON 双模式    |
| 高级   | developer_search.js  | ~1080 | 三平台聚合，公开 API             |
| 高级   | zhipu_search.js      | ~1400 | 多密钥轮询，意图识别，四引擎     |
| 高级   | userscript_search.js | ~1380 | 五平台聚合，代理支持             |

### 17.2 按功能类型

| 需求              | 参考文件                          | 关键模式                    |
| ----------------- | --------------------------------- | --------------------------- |
| 调用外部 REST API | recipe_search.js                  | 多 API 聚合，Form/JSON 请求 |
| 搜索引擎集成      | zhipu_search.js                   | 多密钥、多引擎、重试        |
| 学术论文检索      | arxiv_assistant.js                | XML 解析、指数退避          |
| 以图搜图/搜番     | image_search.js / anime_search.js | 链接工厂、AI 预识别         |
| 天气服务          | weather_reporter.js               | 并发请求、城市缓存          |
| 技术问答搜索      | developer_search.js               | 公开 API 聚合               |
| 油猴脚本搜索      | userscript_search.js              | 多平台聚合、代理            |
| 知识库极速搜索    | ikbs_pysearch.js                  | Python 脚本、终端           |
| 地图/导航         | baidumap_navigation.js            | Intent、URI 协议            |
| 浏览器自动化      | web.js                            | 会话管理、DOM 操作          |
| 代码执行          | code_runner.js                    | 终端、多语言、超时          |

---

## 附录 A：全局常量/变量参考

| 名称                       | 类型   | 说明                                                 |
| -------------------------- | ------ | ---------------------------------------------------- |
| `OPERIT_CLEAN_ON_EXIT_DIR` | string | 退出时自动清理的临时目录路径，适合存放中间文件和大输出 |

`OPERIT_CLEAN_ON_EXIT_DIR` 使用示例（长输出保存到临时文件，避免上下文溢出）：

```javascript
async function saveToTempFile(content, ext) {
  await Tools.Files.mkdir(OPERIT_CLEAN_ON_EXIT_DIR, true);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const rand = Math.floor(Math.random() * 1000000);
  const filePath = `${OPERIT_CLEAN_ON_EXIT_DIR}/output_${timestamp}_${rand}.${ext}`;
  await Tools.Files.write(filePath, content, false);
  return filePath;
}
```

## 附录 B：JSONP 解析技巧

```javascript
function parseJson(raw) {
  if (!raw) return null;
  try {
    let s = raw.trim();
    if (/^[a-zA-Z_$][\w$]*\s*\(/.test(s)) {
      s = s.substring(s.indexOf("(") + 1, s.lastIndexOf(")"));
    }
    return JSON.parse(s);
  } catch (_) {
    return null;
  }
}
```

## 附录 C：HTML 实体解码

```javascript
function unHtml(s) {
  if (!s) return "";
  return s
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/&#10;/g, "\n")
    .replace(/&#13;/g, "\r");
}
```

## 附录 D：安全文件名生成

```javascript
function generateSafeFileName(prefix) {
  const safe = (prefix || "file")
    .replace(/[\\/:*?"<>|\s]/g, "_")
    .substring(0, 15);
  return safe + "_" + Date.now() + ".ext";
}
```

## 附录 E：注释文档模板

```javascript
/**
 * ==============================================================================
 * 模块名称：工具包中文名 (English Name)
 * ------------------------------------------------------------------------------
 * 功能详述：
 * 1. 功能点一：详细说明
 * 2. 功能点二：详细说明
 *
 * 技术特性：
 * - 特性一（如：指数退避重试、多密钥轮询）
 * - 特性二（如：结构化 Markdown 输出）
 *
 * 版本：v1.0
 * 语言：JavaScript (ES8+)
 * ==============================================================================
 */
```

## 附录 F：开发速查表

### 必须做

- ✅ METADATA 放文件最顶部
- ✅ name 与文件名一致（小写下划线）
- ✅ 双语 description（zh + en），描述详细
- ✅ category 在 14 个有效枚举内
- ✅ 每个工具导出 `exports.工具名`
- ✅ 所有代码路径调用 `complete()`
- ✅ 环境变量用 `getEnv()` 获取
- ✅ 密钥展示脱敏
- ✅ 包含 test 工具
- ✅ IIFE 封装
- ✅ 输出内容截断保护
- ✅ 参数校验与默认值处理
- ✅ 支持反向代理（需网络时）
- ✅ 错误消息友好清晰

### 禁止做

- ❌ 硬编码 API Key / Token
- ❌ 直接修改传入的 params 对象
- ❌ 忘记调用 `complete()`
- ❌ 在 catch 块中不处理错误
- ❌ 输出未截断的超长内容
- ❌ 混用 Android 侧和 Linux 侧路径
- ❌ 在日志中打印完整密钥
- ❌ 使用全局变量污染命名空间
- ❌ 工具名使用非小写下划线格式
- ❌ category 使用 14 个枚举外的值或格式不正确（必须 Title Case）

### API 速查

```
complete(result)                      → 返回结果（必调）
getEnv(key)                           → 读环境变量
getLang()                             → 获取语言
sendIntermediateResult(result)        → 推送进度
toolCall(toolName, params)            → 跨包调用（双参数形式）
toolCall({ name, params })            → 跨包调用（对象形式）

OkHttp.newClient()                    → 创建 HTTP 客户端
  .newRequest().url(u).method(m)      → 构建请求
  .header(k,v) / .headers(obj)        → 设置头
  .body(str, type)                    → 设置体（type: 'json'/'form'）
  .build().execute()                  → 执行请求

Tools.Files.exists/read/readBinary/write/writeBinary/mkdir/list/download
Tools.Files.move/copy/info/zip/unzip/open/share
Tools.Net.uploadFile/visit
Tools.Net.Web.start/goto/click/fill/evaluate/wait_for/snapshot/screenshot/scroll/close/download_file
Tools.visit_web({ url, user_agent_preset, timeout })
Tools.Memory.create/update/deleteMemory/move/link/queryLinks/updateLink/deleteLink
Tools.System.terminal.create/exec/screen/input
Tools.System.shell/intent/sleep/getDeviceInfo/getLocation/getNotifications/installApp/startApp
Tools.SoftwareSettings.listSandboxPackages/readEnvironmentVariable/writeEnvironmentVariable
Tools.SoftwareSettings.listModelConfigs/createModelConfig/updateModelConfig/deleteModelConfig
Tools.SoftwareSettings.testModelConfigConnection/getFunctionModelConfig/setFunctionModelConfig
CryptoJS.enc.Utf8/Base64              → 加解密操作
```

---

## 附录 G：版本历史

### v1.0 (2025-07)

- 基于 20+ 个生产级工具包源码深度提炼的首版开发指南
- 覆盖 METADATA 协议、代码架构、运行时 API、设计模式、安全规范
- 包含 6 种完整工具包模板（网络 API、多 API 聚合、系统操作、文件上传、Intent 唤起、Advice）
- 完整 TypeScript 类型定义（含 `toolCall` 双签名、`Tools.Memory`、`Tools.Files` 扩展操作等）
- 详细的 ToolPkg 打包格式说明（含 main.js 注册模式、Compose DSL UI 模块、Context API）
- 生产案例索引（含行数统计）与排查指南

---

> **文档版本**：v1.0  
> **提炼源码**：bilibili_search、csdn_search、various_search、web、code_runner、workflow、extended_memory_tools、extended_file_tools、extended_http_tools、extended_chat、super_admin、all_about_myself、operit_search、operit_upgrade、deepwiki_search、beeimg_upload、baidumap_navigation、recipe_search、zhipu_search、developer_search、anime_search、userscript_search、ikbs_pysearch、image_search、arxiv_assistant、weather_reporter 等 20+ 个生产级工具包  
> **核心定位**：作为 SKILL 文件，本指南旨在为 AI Agent 提供完整的工具包开发知识，使其能够自主设计、编写和部署符合 Operit 规范的高质量工具包。

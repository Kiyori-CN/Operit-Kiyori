# 概述

**Operit AI** 是一款面向 Android(API 26+)的综合性 AI 助手应用，提供独立、功能完整的 AI 交互平台，具备深度系统集成能力。与典型的移动端 AI 聊天应用不同，Operit 将对话式 AI 与丰富的工具生态系统、本地模型支持、UI 自动化能力以及内置的 Ubuntu 24 环境相结合，使得在移动设备上即可实现复杂的工作流程。

本文档提供 Operit 架构、核心能力和主要子系统的高层次介绍。有关特定子系统的详细信息：

- 聊天系统实现：
- 工具系统与可扩展性：
- UI 自动化能力：
- 数据持久化策略：

---

## 应用目的与范围

Operit AI 作为一个**多功能 AI 平台**，其功能远超简单的聊天：
能力领域核心特性**AI 对话**多提供商支持(OpenAI、Claude、Gemini、本地模型)、流式响应、自动摘要、函数调用**工具生态系统**40+ 内置工具，涵盖文件操作、网络请求、系统控制、UI 自动化、媒体处理和终端访问**系统集成**Ubuntu 24 终端环境、Accessibility/ADB/Root 权限通道、Tasker 集成、MCP 插件支持**自定义**角色卡片、个性配置、自定义提示词、工具包、工作流自动化**数据管理**智能记忆库、带分支的对话历史、工作区绑定(SAF/SFTP/SSH)**语音交互**本地/云端 TTS、本地 STT、语音唤醒、连续对话模式
该应用程序**完全在设备上运行**，除了远程 API 调用外，确保用户对数据和功能的控制。

---

## 应用程序入口点

```
Background Services

Primary UI Routes

Application Start
Application Class

MainActivity
(app/src/main/java/.../MainActivity.kt)

OperitApp Composable
(Main UI Container)

Main Screen Destinations

FloatingChatService
(Foreground Service)

AIChatScreen
Chat Interface

Settings Screens
Configuration

Terminal Screen
Ubuntu Environment

Toolbox Screen
Tool Management

Package Management

Workflow Editor

Floating Chat Window
System Overlay

UIDebuggerService
UI Inspection

OperitAccessibilityService
UI Automation
```

应用程序可以通过以下方式启动：

- **MainActivity**：标准应用启动，导航到主屏幕
- **FloatingChatService**：持久前台服务，提供系统级悬浮窗访问
- **Intent 操作**：外部触发器(Tasker、工作流、语音唤醒)
- **分享目标**：文件/链接分享集成

---

## 高层架构

```
System Integration

Data Layer

Tool Execution

AI Integration

Service Orchestration

Presentation Layer

Jetpack Compose UI
AIChatScreen, FloatingWindow

ViewModels
ChatViewModel, UIDebuggerViewModel

ChatServiceCore
(Core chat logic)

MessageCoordinationDelegate
(Orchestration & auto-summary)

MessageProcessingDelegate
(Stream handling)

EnhancedAIService
(Provider abstraction)

MultiServiceManager
(Function-specific models)

AIServiceFactory
(Provider instantiation)

AI Providers
OpenAI, Claude, Gemini, MNN, Llama.cpp

AIToolHandler
(Tool execution engine)

ToolRegistration
(40+ tools)

PackageManager
(ToolPkg, MCP plugins)

V8 JavaScript Engine
(JS tool execution)

Room Database
AppDatabase

ChatHistoryManager
(Chat CRUD)

ModelConfigManager
(AI configs)

ApiPreferences
(DataStore)

CharacterCardManager
(Personas)

Terminal
(Ubuntu 24, SSH)

Permission Channels
Accessibility, ADB, Root

PhoneAgent
(UI automation)

Virtual Display Manager
(Multi-screen automation)
```

**架构模式：** Operit 使用**分层架构**和**委托模式**来实现关注点分离。`ChatViewModel` 协调多个委托(`MessageCoordinationDelegate`、`MessageProcessingDelegate`、`ChatHistoryDelegate`、`AttachmentDelegate`)，而不是直接实现所有逻辑。

---

## 核心系统组件

### 1. 聊天系统

聊天系统是主要的用户界面，使用 Jetpack Compose 构建并遵循 MVVM 架构。

**关键类：**

- `ChatViewModel`: 中心状态管理，协调各委托
- `AIChatScreen`: 主聊天界面可组合项
- `ChatScreenContent`: 消息列表容器
- `ChatArea`: 单条消息渲染
- `MessageCoordinationDelegate`: 编排消息流和自动摘要

**功能特性:**

- 实时流式响应与 Markdown 渲染
- 接近 token 限制时自动对话摘要
- 消息编辑、删除、分支和回滚
- 多聊天管理,支持分组和文件夹
- 每个对话绑定角色卡
- 回复功能,支持上下文注入

详细聊天架构请参见。

---

### 2. AI 服务层

AI 服务层抽象了多个 AI 提供商并管理模型配置。

```
Providers

Function Types

EnhancedAIService

MultiServiceManager

ModelConfigManager

CHAT

SUMMARY

TRANSLATION

UI_CONTROLLER

VOICE

OpenAIService

ClaudeService

GeminiService

MNNService

LlamaCppService
```

**核心类：**

- `EnhancedAIService`：主要 AI 服务抽象
- `MultiServiceManager`：将请求路由到特定功能的模型
- `AIServiceFactory`：创建提供商实例
- `ModelConfigManager`：持久化模型配置

**基于功能的模型选择：** Operit 不使用单一模型处理所有任务，而是允许为不同功能使用不同的 AI 模型(例如，聊天使用快速模型，摘要使用推理模型，UI 自动化使用视觉模型)。

详细的 AI 服务架构请参见。

---

### 3. 工具系统

工具系统提供 40 多个内置功能，并通过 JavaScript 包和 MCP 插件支持扩展。

**核心类：**

- `AIToolHandler`：带权限检查的工具执行引擎
- `ToolRegistration`：声明所有内置工具
- `PackageManager`：管理 ToolPkg 容器和 MCP 插件
- `JsToolManager`：通过 V8 执行基于 JavaScript 的工具
- `Terminal`：支持 SSH 的 Ubuntu 24 终端

**工具类别：**
类别示例权限级别文件系统read_file、write_file、list_directory、git 操作标准 → Root网络http_request、web_access、文件下载标准系统install_app、launch_intent、get_notifications标准 → ADB界面自动化tap、swipe、ui_tree、screenshot无障碍 → Root媒体video_convert、ocr、camera_capture标准终端execute_shell、ssh_connect、vim标准内存add_memory、search_memory、query_timeline标准工作流trigger_workflow、schedule_task标准
**可扩展性：**

- **ToolPkg**：包含 HJSON 清单和 JavaScript 代码的 ZIP 容器
- **MCP Plugins**：通过终端运行的 Model Context Protocol 服务器
- **Skill Marketplace**：社区贡献的软件包

详细的工具架构请参见。

---

### 4. 界面自动化系统

Operit 通过多种权限通道提供复杂的界面自动化功能。

```
Virtual Display

UI Information

Permission Channels

PhoneAgent
(Multi-step agent)

ActionHandler
(Action execution)

AccessibilityChannel
OperitAccessibilityService

ADBChannel
Shizuku commands

RootChannel
Root shell

UI Tree Extraction
(dump, uiautomator)

Screenshot Capture
(MediaProjection)

OCR Processing
(ML Kit)

Vision Model Analysis

ShowerServer
(Virtual display mgr)

VirtualOverlay
(Visual feedback)
```

**核心类：**

- `PhoneAgent`：编排多步骤自动化循环
- `StandardUITools`：基础界面工具(点击、滑动、输入)
- `OperitAccessibilityService`：基于无障碍服务的自动化
- `ShowerServer`：用于隔离自动化的虚拟显示管理器
- `UIOperationOverlay`：可视化反馈覆盖层

**功能特性：**

- 在坐标或元素上执行点击、滑动、长按操作
- 通过输入法或直接节点操作进行文本输入
- 提取界面树(无障碍节点或 uiautomator dump)
- 截图捕获，支持 OCR 和视觉模型分析
- 支持虚拟显示以实现并行自动化任务

详细的界面自动化架构请参见。

---

### 5. 数据管理

数据持久化采用混合方式，结合了 Room 数据库、DataStore 偏好设置和基于文件的存储。

**核心类：**

- `AppDatabase`：包含 ChatDao 和 MessageDao 的 Room 数据库
- `ChatHistoryManager`：聊天和消息的增删改查操作
- `ApiPreferences`：通过 DataStore 存储 AI 配置
- `UserPreferencesManager`：通过 DataStore 管理界面偏好设置
- `CharacterCardManager`：角色卡片管理

**存储层级：**
存储类型数据技术结构化数据聊天元数据、消息、令牌统计Room (SQLite)配置API 密钥、模型配置、用户偏好DataStore (Proto)基于文件角色卡片 (JSON)、工具包 (.toolpkg)、记忆库文件系统工作区代码项目、Git 仓库SAF/SFTP/SSH 绑定
**响应式模式：** 所有数据源暴露 `StateFlow` 流以实现响应式 UI 更新。

详见了解详细的数据架构。

---

### 6. 悬浮窗系统

悬浮窗通过 Android 覆盖层提供系统级 AI 访问。

**核心类：**

- `FloatingChatService`: 管理覆盖层生命周期的前台服务
- `FloatingWindowManager`: 窗口状态和模式转换
- `ChatServiceCore`: 主 UI 和悬浮窗共享的聊天逻辑
- `UIDebuggerService`: 可选的 UI 检查覆盖层

**悬浮模式：**

- **球形模式**: 紧凑的圆形按钮
- **语音球模式**: 用于语音交互的音频响应球体
- **窗口模式**: 可调整大小的聊天窗口
- **全屏模式**: 全屏语音聊天
- **屏幕 OCR 模式**: 选择识别工具
- **结果显示**: 临时结果覆盖层

详见了解详细的悬浮窗架构。

---

## 应用配置

```
Runtime State

User Configuration

System Configuration

Permission Grants
ToolPermissionSystem

Tool Packages
PackageManager

MCP Plugins
MCPRepository

Workflow Definitions
WorkflowManager

API Configuration
ApiPreferences

Model Configuration
ModelConfigManager

User Preferences
UserPreferencesManager

Character Cards
CharacterCardManager

Active Chat
ChatHistoryDelegate

Token Statistics
TokenStatisticsDelegate

Attachments
AttachmentDelegate

Workspace Binding
SAF/SFTP/SSH
```

**配置流程：**

1. **初始设置**：用户通过 `ApiPreferences` 配置 API 提供商和模型
2. **模型选择**：通过 `ModelConfigManager` 可将不同模型分配给不同功能
3. **角色定制**：可选角色卡片以定制个性
4. **工具设置**：安装工具包和 MCP 插件，授予权限
5. **工作区绑定**：可选工作区附加用于代码项目

---

## 核心差异化特性

Operit AI 通过以下方面区别于典型的移动 AI 助手：

1. **深度系统集成**：不仅是聊天界面，而是具有 Accessibility/ADB/Root 访问权限的平台，实现真正的系统自动化
2. **Ubuntu 24 环境**：完整的 Linux 终端，支持 apt 包、Python、Node.js 和 SSH
3. **本地模型支持**：通过 MNN 和 llama.cpp 实现完全离线运行
4. **功能专用模型**：不同任务使用不同的 AI 模型(聊天、摘要、UI 控制、语音)
5. **可扩展工具系统**：基于 JavaScript 的工具、MCP 插件和 ToolPkg 市场
6. **UI 自动化代理**：通过视觉模型和 UI 树分析实现多步骤自动化
7. **工作流自动化**：可视化工作流编辑器，支持定时和语音触发执行
8. **角色卡片**：完整的个性化定制，支持 Tavern 格式
9. **智能记忆**：AI 管理的记忆库，支持自动分类

---

## 技术栈

层级技术**UI 框架**Jetpack Compose、Material 3、Coil 图片加载**架构**MVVM、StateFlow、Kotlin 协程、委托模式**数据库**Room (SQLite)、DataStore (Protocol Buffers)、ObjectBox**AI 集成**OkHttp SSE、Gson/Moshi、Retrofit**JavaScript 引擎**V8(通过 J2V8 或类似库)**本地推理**MNN (Mobile Neural Network)、llama.cpp**终端**Termux 库、libsu (root)、Shizuku (ADB)**UI 自动化**AccessibilityService、MediaProjection、ML Kit OCR**Markdown 渲染**基于 Canvas 的自定义渲染器，支持 LaTeX**文件操作**Storage Access Framework (SAF)、Apache Commons**网络**OkHttp、Jsoup、WebView
**构建配置：**最低 SDK 26 (Android 8.0)，目标 SDK 34，Kotlin 1.9.22，Compose 1.5.8

---

## 项目结构概览

```
app/src/main/java/com/ai/assistance/operit/
├── api/                    # AI service implementations
│   ├── chat/              # EnhancedAIService, MultiServiceManager
│   └── voice/             # TTS/STT services
├── core/                   # Core business logic
│   ├── chat/              # ChatServiceCore, AIMessageManager
│   └── tools/             # AIToolHandler, ToolRegistration
├── data/                   # Data layer
│   ├── database/          # Room entities and DAOs
│   ├── model/             # Data models
│   └── preferences/       # DataStore preferences
├── services/              # Android services
│   ├── core/              # Delegate implementations
│   └── floating/          # Floating window management
├── ui/                     # User interface
│   ├── features/          # Feature-specific UI
│   │   ├── chat/          # Chat screens and components
│   │   ├── settings/      # Settings screens
│   │   ├── terminal/      # Terminal UI
│   │   └── toolbox/       # Tool management UI
│   ├── main/              # Main activity and navigation
│   └── permissions/       # Permission management UI
└── util/                   # Utility classes

app/src/main/assets/        # Bundled resources
├── packages/              # Built-in tool packages
└── termux/                # Ubuntu 24 bootstrap

app/src/main/res/           # Android resources
├── values/                # Strings, themes
└── drawable/              # Icons and images

```

---

## 导航与用户流程

应用支持多种入口模式：

**主应用流程：**

1. 启动 MainActivity
2. 导航至 AI 聊天(默认)或其他界面
3. 与 AI 交互、使用工具、管理历史记录
4. 配置设置、安装包、创建工作流

**悬浮窗流程：**

1. 从主应用或通知启用悬浮模式
2. FloatingChatService 启动，显示悬浮层
3. 通过悬浮窗从任何应用访问聊天
4. 使用屏幕 OCR、附件、语音交互

**语音唤醒流程：**

1. 在设置中启用"始终监听"
2. 说出唤醒词(例如"小欧")
3. 自动进入语音模式
4. 持续对话并自动朗读

**自动化流程：**

1. 通过工具请求 UI 自动化操作
2. AIToolHandler 检查权限
3. PhoneAgent 编排多步骤自动化
4. 通过 UIOperationOverlay 提供可视化反馈

---

本概述为理解 Operit AI 的架构和功能提供了基础。有关特定子系统的详细文档，请参阅目录中的链接部分。

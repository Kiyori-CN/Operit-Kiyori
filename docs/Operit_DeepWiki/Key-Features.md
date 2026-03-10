# 核心特性

本页面提供 Operit 主要功能系统及其实现的技术概述。重点介绍区分 Operit 的六大核心能力：Ubuntu 环境、内存系统、语音交互、本地模型推理、角色卡系统和工具生态系统。有关这些系统中使用的架构模式，请参阅 [架构概述](/AAswordman/Operit/1.1-architecture-overview)。有关各个工具实现的详细信息，请参阅 [工具系统](/AAswordman/Operit/5-tool-system)。

---

## Ubuntu 24 环境

Operit 包含一个完整的 Ubuntu 24.04 LTS 环境，可在 Android 设备上原生运行，直接在移动设备上实现复杂的自动化和开发工作流。

### 终端服务架构

```
Terminal
(Singleton)

TerminalProvider
(Interface)

TermuxTerminalProvider

ShellSession

SSHConnectionManager

Termux RPC API
(ContentProvider)

JSch Library
(SSH Client)

Terminal Tools

execute_shell

ssh_connect
```

**终端服务架构**
终端系统通过 Termux 提供本地 shell 执行和远程 SSH 功能。

终端基础设施通过提供者模式实现：
组件类型用途`Terminal`单例服务主终端编排器，会话生命周期管理`TerminalProvider`接口抽象终端后端(本地/远程)`TermuxTerminalProvider`Provider 实现通过 ContentProvider RPC 连接到 Termux`SSHConnectionManager`连接池使用 JSch 库管理 SSH 会话`ShellSession`会话对象表示活动的命令执行上下文

### 包管理

Ubuntu 环境通过 `apt` 支持完整的包管理：

```
AI Tool Request

execute_shell tool

Termux Shell Session

apt-get install

python3 script.py

node app.js

vim/nano editors

Ubuntu 24 Repository
(Configurable Mirror)
```

**包管理流程**
命令在持久化的 Termux 会话中执行，可完全访问 Ubuntu 软件包。

通过终端暴露的关键能力：

- **开发运行时**：预装 Python 3.x、Node.js、Ruby、Java
- **编辑器**：vim、nano，支持完整配置
- **网络工具**：curl、wget、ssh、git 用于远程操作
- **自定义仓库**：用户可通过 `/etc/apt/sources.list.d/` 添加额外的软件包源

终端与工作区系统集成，允许 AI 在通过 SAF/SFTP/SSH 绑定的项目目录中执行命令。

---

## 智能记忆系统

记忆系统提供 AI 管理的持久化知识存储，具备自动分类、基于时间的查询和语义搜索功能。

### 记忆管理器架构

```
MemoryManager
(Singleton)

Memory Database
(Room/ObjectBox)

Vector Index
(HNSWLIB)

Category System

Time Query Engine

Semantic Search

EnhancedAIService

Auto Summarization

Memory Tools

save_memory

query_memory

query_memory_by_time
```

**记忆系统架构**
AI 自主管理记忆，支持分类和多模态搜索。

### 存储实现

记忆系统采用混合存储方式：
层级技术用途结构化数据Room Database记忆元数据、时间戳、分类向量嵌入HNSWLIB Index快速语义相似度搜索全文检索Jieba Segmentation中文文本分词用于搜索附件File System与记忆关联的图片、文档
记忆条目按以下模式存储：

- **内容**：支持 Markdown 的原始文本
- **分类**：AI 分配的分类(例如"个人偏好"、"技术知识")
- **时间戳**：带时区的创建/修改时间
- **嵌入向量**：用于语义搜索的 768 维向量
- **附件**：相关文档/图片的文件路径
- **来源**：用于上下文追踪的原始聊天 ID

### 自动分类

当 AI 保存记忆时，系统会：

1. **分析内容**：使用当前激活的 AI 模型提取关键概念
2. **分配类别**：将记忆放入现有类别或创建新类别
3. **生成嵌入向量**：计算用于相似度搜索的向量表示
4. **建立索引**：更新 HNSWLIB 索引以实现快速最近邻查询

基于时间的查询支持自然语言，如"上周的记忆"或"一月到三月之间"，会被解析为时间戳范围。

---

## 语音交互

Operit 提供持续语音对话能力，支持唤醒检测、语音转文字(STT)和文字转语音(TTS)。

### 语音服务流程

```
VoiceService
(Interface)

VoiceServiceFactory

TTS Providers

OpenAITTSService

SiliconFlowTTSService

LocalTTSService
(Android TTS)

MNNTTSService
(Local Inference)

STT Providers

LocalSTTService
(Android Recognition)

MNNSTTService
(Local ASR)

Wake-up Detection

STT-based
(Regex Match)

Personal Template
(3 Samples)

SpeechServicesPreferences
(DataStore)

ChatViewModel

MessageProcessingDelegate
```

**语音交互流程**
工厂模式提供 TTS/STT，支持本地和云端选项，以及唤醒检测。

### TTS/STT 配置

语音系统支持多种提供商配置：
功能云端选项本地选项**TTS**OpenAI TTS、SiliconFlowAndroid TTS 引擎、MNN TTS 模型**STT**不适用(仅使用本地)Android 语音识别、MNN ASR**语音选择**提供商特定语音系统已安装语音**流式传输**分块播放实时生成
偏好设置通过 `SpeechServicesPreferences` 管理：

- **TTS 提供商**：选定的引擎(云端/本地)
- **语音 ID**：特定语音配置
- **速度/音调**：语音调制参数(仅限本地)
- **自动朗读**：是否自动朗读 AI 回复
- **中断**：用户语音是否停止播放

### 唤醒机制

唤醒系统以两种模式运行：

#### 基于 STT 的唤醒

持续监控语音识别输出并与正则表达式模式匹配：

- 通过 `SpeechServicesPreferences.wakePhrase` 配置
- 支持正则表达式模式(例如 `"小欧|hey operit"`)
- 在部分或最终 STT 结果时触发
- 电池影响最小(使用系统识别服务)

#### 个人模板唤醒

记录用户说出唤醒词的三个语音样本：

- 分析声学特征(音高、共振峰、时长)
- 创建用户特定的声纹
- 准确度更高但不产生 STT 文本事件
- 存储在 `SpeechServicesPreferences.personalWakeupTemplates` 中

两种模式都支持在偏好设置中启用时进行"始终监听"后台监控。唤醒后，系统可以选择在进入语音对话模式之前说出问候语。

### 与聊天系统的集成

语音交互与聊天处理集成：

```
"TTS Service"
"EnhancedAIService"
"ChatViewModel"
"STT Service"
"Wake-up Detection"
User
"TTS Service"
"EnhancedAIService"
"ChatViewModel"
"STT Service"
"Wake-up Detection"
User
alt
[User speaks during playback]
Voice input
Match wake phrase
Trigger voice mode
Speak greeting (optional)
Audio output
Continuous speech
Transcribed text
Send message
Streaming response
Speak response chunks
Audio output
Interrupt speech
New input detected
Stop playback
```

**语音对话流程**
唤醒触发支持中断的连续语音模式。

当 `ChatViewModel` 中的 `isAutoReadEnabled` 为 true 时，AI 响应会自动触发 TTS 播放。`ChatViewModel` 中的 `speakMessage()` 方法负责处理响应块流式传入时的排队和播放。

---

## 本地 AI 模型

Operit 支持使用 MNN 和 llama.cpp 推理引擎完全在设备上运行 AI 模型，实现离线操作和隐私保护。

### 本地模型架构

```
AIServiceFactory

Local Providers

MNNAIService

LlamaAIService

MNN Module
(Native Library)

Llama Module
(Native Library)

MNN Runtime
(ARM NEON)

llama.cpp
(GGUF Format)

Model Files

.mnn Models
(Quantized)

.gguf Models
(Q4/Q8)

ModelConfigManager

Local Model Scanner
```

**本地模型基础设施**
原生推理引擎，支持自动模型发现和加载。

### 支持的模型格式

引擎格式量化类型典型模型**MNN**`.mnn`INT8, FP16MobileNet、ChatGLM 变体**llama.cpp**`.gguf`Q4_0, Q4_K_M, Q5_K_M, Q8_0Llama、Qwen、Mistral 系列
两个引擎均编译为原生库：

- **MNN**：提供 ARM NEON 优化推理
- **llama.cpp**：支持 GGUF 量化模型

### 模型加载和配置

`ModelConfigManager` 处理本地模型发现：

1. **扫描**：`LocalModelScanner` 在以下位置搜索模型：

- 应用内部存储(`/data/data/com.ai.assistance.operit/models/`)
- 通过 SAF(存储访问框架)用户选择的目录
- 从外部应用导入的模型文件

2. **注册**：发现的模型在 `ApiPreferences` 中注册，包含元数据：

- 模型文件路径
- 推理引擎类型(MNN/llama.cpp)
- 显示名称(用户可编辑)
- 估计上下文长度
- 量化级别

3. **选择**：模型与云服务提供商一起显示在模型配置界面中

当选择本地模型时，相应的 `AIService` 实现：

- 将模型加载到内存中(使用延迟初始化)
- 配置推理参数(temperature、top_k、top_p)
- 处理分词(每个模型系列的内置分词器)
- 管理 KV 缓存以实现高效生成

### 性能特征

本地推理性能因设备和模型大小而异：

- **小型模型**(1-3B 参数，Q4)：中端手机上 5-15 tokens/sec
- **中型模型**(7-13B 参数，Q4)：1-5 tokens/sec，需要 6GB+ RAM
- **STT/TTS 模型**：在大多数设备上实时运行(针对移动设备优化)

内存管理至关重要：

- 模型按需加载并缓存在内存中
- 当内存压力较高时，`LRUCache` 会驱逐未使用的模型
- 用户可以配置最大上下文长度来控制内存使用

---

## 角色卡片和人设

角色卡片系统支持高度可定制的 AI 人格，具有持久化聊天历史和角色间对话功能。

### 角色卡片管理器

```
CharacterCardManager
(Singleton)

Character Card Storage
(JSON Files)

activeCharacterCardFlow
(StateFlow)

ChatHistoryDelegate

Chat-Character Binding

CharacterCard Data

Metadata
(Name, Avatar, isDefault)

System Prompt
(Personality Definition)

Chat Parameters
(temperature, etc)

Import/Export

Tavern Format
(.json)

PNG Embedded
(Character Card v2)

QR Code Sharing

ChatViewModel
```

**角色卡片系统**
管理具有聊天绑定和跨格式兼容性的 AI 人格。

### 角色卡片结构

每个角色卡片包含：
字段类型用途`name`String角色显示名称`description`String角色背景/性格摘要`systemPrompt`String定义行为的核心系统消息`firstMessage`String (可选)聊天开始时的问候语`avatar`URI (可选)角色图像/图标`isDefault`Boolean是否为默认助手`temperature`Float (可选)覆盖模型温度参数`chatHistory`List<ChatHistory>关联的聊天会话
`CharacterCardManager` 单例维护一个响应式的 `activeCharacterCardFlow`，供 UI 组件观察。当活动卡片变化时，系统会：

1. 为新消息更新系统提示词
2. 过滤聊天历史，仅显示关联的聊天(如果启用)
3. 可选地切换到绑定该角色的聊天

### 聊天历史绑定

聊天可以绑定到特定的角色卡片：

```
characterCardName

characterCardName

null (unbound)

BY_CHARACTER_CARD

BY_FOLDER

CURRENT_CHARACTER_ONLY

Chat History 1

Chat History 2

Chat History 3

Character A
(Assistant)

Character B
(Friend)

Default Card

History Display Mode

Show by Card > Folder > Chat

Show by Folder > Chat (all cards)

Show only current card's chats
```

**聊天-角色绑定**
多种显示模式支持不同的组织偏好。

绑定存储在 `ChatHistory.characterCardName` 字段中。用户可以：

- **重新绑定** 通过聊天管理 UI 将现有聊天绑定到不同角色
- **迁移** 在角色之间迁移聊天(保留消息历史)
- **自动切换**：启用打开聊天时自动切换角色

显示模式由 `ChatViewModel` 中的 `ChatHistoryDisplayMode` 枚举控制：

```
enum class ChatHistoryDisplayMode {
    BY_CHARACTER_CARD,      // Group by card, then folder, then chat
    BY_FOLDER,              // Group by folder only (shows all cards)
    CURRENT_CHARACTER_ONLY  // Show only active character's chats
}
```

### 导入/导出格式

角色卡支持多种交换格式：

#### Tavern 格式 (JSON)

与 TavernAI 和 SillyTavern 兼容的标准 JSON 结构：

```
{
  "name": "Character Name",
  "description": "Background",
  "personality": "Traits",
  "scenario": "Context",
  "first_mes": "Greeting",
  "mes_example": "Example dialogue"
}
```

#### PNG 嵌入 (Character Card v2)

将 JSON 数据嵌入 PNG 元数据块中，允许在分享图片的同时携带人格数据。

#### QR Code

将角色 JSON 编码为二维码，便于移动端快速分享。

所有导入/导出操作均保留：

- 系统提示词和人格设定
- 对话参数(temperature、top_p 等)
- 头像图片(在可移植格式中转换为 base64)

---

## 工具生态

Operit 提供 40+ 内置工具、通过 MCP 插件和工具包实现的可扩展性，以及用于自动化的可视化工作流系统。

### 工具注册与执行

```
ToolRegistration
(Static Registry)

AIToolHandler
(Singleton Executor)

Built-in Tools (40+)

StandardFileSystemTools

StandardNetworkTools

StandardSystemTools

StandardUITools

StandardMemoryTools

Terminal Tools

JavaScript Tools

PackageManager
(ToolPkg System)

V8 JavaScript Engine

MCP Plugins

MCPRepository

MCPStarter
(Server Lifecycle)

ToolPermissionSystem

EnhancedAIService
```

**工具系统架构**
三层工具注册机制：内置工具、基于包的工具和 MCP 插件。

### 内置工具分类

40+ 内置工具按功能类别组织：
类别示例工具实现类**文件系统**`read_file`, `write_file`, `list_files`, `grep_files``StandardFileSystemTools`**网络**`http_request`, `download_file`, `browse_web``StandardNetworkTools`**系统**`execute_shell`, `install_app`, `get_device_info``StandardSystemTools`**UI 自动化**`tap`, `swipe`, `get_ui_tree`, `screenshot``StandardUITools`**内存**`save_memory`, `query_memory`, `query_memory_by_time``StandardMemoryTools`**终端**`terminal_execute`, `ssh_connect`, `ssh_execute`终端相关工具**聊天管理**`create_chat`, `switch_chat`, `list_chats`聊天工具**工作流**`trigger_workflow`, `execute_workflow_node`工作流工具
每个工具在 `ToolRegistration` 中注册时包含：

- **名称**：唯一标识符(例如 `"execute_shell"`)
- **描述**：面向 AI 的自然语言解释
- **参数**：定义必需/可选参数的 JSON schema
- **执行器**：实现工具逻辑的 Lambda 或类方法
- **权限级别**：Standard、Accessibility、Debugger 或 Root

### 工具包系统(ToolPkg)

工具包支持用户创建和社区共享的工具：

```
ToolPkg Container
(.toolpkg ZIP)

manifest.hjson
(Package Metadata)

JavaScript Files
(Tool Implementation)

Resources
(Icons, Data Files)

UI Modules
(Compose DSL)

PackageManager

PackageLoader

Subpackage Manager

V8 Engine

Tools.* API
(Polyfill)

Tools.fs.readFile()

Tools.http.request()

Tools.system.execute()
```

**ToolPkg 包结构**
包将 JavaScript 工具与清单和资源打包在一起。

典型的 ToolPkg 清单(`manifest.hjson`)：

```
{
  name: "my_tool_package"
  version: "1.0.0"
  description: "Custom tools for specific tasks"
  tools: [
    {
      name: "custom_tool"
      description: "Does something useful"
      file: "tools/custom_tool.js"
      parameters: {
        input: { type: "string", required: true }
      }
    }
  ]
  subpackages: [
    {
      name: "advanced_features"
      condition: "has_root_access"
      tools: ["root_tool"]
    }
  ]
}
```

JavaScript 工具通过 `Tools` 全局对象访问系统功能：

```
// Example tool implementation
async function custom_tool(params) {
    const fileContent = await Tools.fs.readFile(params.path);
    const response = await Tools.http.request({
        url: "https://api.example.com",
        method: "POST",
        body: fileContent
    });
    return { result: response.data };
}
```

`PackageManager` 单例：

- 从应用资源和用户导入的文件加载包
- 管理子包的启用/禁用状态
- 通过 `EnvManager` 提供环境变量
- 处理包更新和版本控制

### MCP 插件集成

MCP(模型上下文协议)插件提供基于服务器的工具扩展能力：

```
MCPRepository
(Plugin Registry)

MCPStarter
(Lifecycle Manager)

MCPDeployer
(Installation)

Terminal Service

MCP Shared Session
(Dedicated Terminal)

Plugin Types

uvx Plugins
(Python)

npx Plugins
(Node.js)

Custom Binaries

Skill Marketplace

MCP Plugin Discovery

AIToolHandler

MCP-provided Tools
```

**MCP 插件架构**
插件在专用终端会话中作为服务器运行，具有生命周期管理。

MCP 插件通过标准化协议运行：

1. **发现**：`MCPRepository` 扫描已安装的插件
2. **部署**：`MCPDeployer` 在需要时安装依赖(例如 `npm install`)
3. **启动**：`MCPStarter` 在专用终端会话中启动插件服务器
4. **注册**：插件通过 MCP 协议公布可用工具
5. **执行**：`AIToolHandler` 将工具调用路由到相应的插件服务器
6. **生命周期**：插件在失败时自动重启，不使用时停止

系统支持：

- **uvx 插件**：基于 Python 的 MCP 服务器(终端中需要 `uv`)
- **npx 插件**：基于 Node.js 的 MCP 服务器(需要 `npm`/`pnpm`)
- **自定义二进制文件**：任何提供 MCP 接口的可执行文件
- **远程 MCP**：通过 HTTP/WebSocket 连接到 MCP 服务器

插件状态持久化管理：

- 启用/禁用状态存储在偏好设置中
- 应用启动时自动启动(可配置)
- 重启次数和故障跟踪以确保可靠性

### 工作流系统

可视化工作流实现无需编码的自动化：
节点类型用途示例用途**触发器**启动工作流手动、定时、Tasker、Intent、语音唤醒**执行**运行工具`execute_shell`、`send_message`、`http_request`**条件**分支逻辑检查输出是否包含文本**逻辑**AND/OR 门组合多个条件**提取**数据转换正则提取、子串、拼接、随机值
工作流以有向图形式存储，包含节点和边。每条边可以设置条件(正则匹配、布尔分支)来决定执行流程。工作流执行引擎支持：

- **定时执行**：Cron 表达式、固定间隔、特定时间
- **Tasker 集成**：从 Tasker 任务启动工作流
- **Intent 触发**：通过其他应用的 Android intent 启动
- **语音触发**：匹配正则模式的语音命令
- **并行执行**：无依赖关系的节点并发运行
- **状态传递**：节点可以读取前置节点的输出

---

## 总结

Operit 的核心功能通过架构良好的子系统实现：

1. **Ubuntu 环境**：`Terminal` 服务，集成 Termux 和 SSH 功能
2. **记忆系统**：`MemoryManager`，支持向量搜索和 AI 分类
3. **语音交互**：`VoiceService` 工厂，支持多种 TTS/STT 提供商和唤醒检测
4. **本地模型**：MNN 和 llama.cpp 原生推理，自动模型发现
5. **角色卡片**：`CharacterCardManager`，支持聊天绑定和跨格式导入/导出
6. **工具生态**：`ToolRegistration`、`PackageManager` 和 `MCPRepository` 提供 40+ 工具及扩展能力

这些系统通过 `ChatViewModel` 和 `EnhancedAIService` 集成，提供统一的 AI 助手体验。要深入了解各个组件，请参阅相关章节：[核心 AI 服务](/AAswordman/Operit/2-core-ai-services)、[工具系统](/AAswordman/Operit/5-tool-system)、[UI 自动化](/AAswordman/Operit/6-ui-automation) 和 [数据管理](/AAswordman/Operit/8-data-management)。

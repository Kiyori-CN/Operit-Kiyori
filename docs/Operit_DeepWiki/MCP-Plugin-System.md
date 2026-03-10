# MCP 插件系统

MCP(Model Context Protocol)插件系统通过允许通过基于服务器的插件添加外部工具和功能，为 Operit 提供了可扩展性。MCP 插件作为独立进程运行，通过标准化协议与主应用程序通信，无需修改核心应用程序即可集成第三方工具。

有关包含 JavaScript 包和 ToolPkg 容器的更广泛包管理系统的信息，请参阅 [5.7](/AAswordman/Operit/5.7-package-system)。有关工具执行和注册机制，请参阅 [5.1](/AAswordman/Operit/5.1-tool-architecture)。

---

## 架构概览

MCP 系统由三个主要层组成：插件管理(发现、安装、元数据)、服务器生命周期(部署、启动、监控)和工具集成(注册、执行、结果处理)。

### 组件关系图

```
Storage

Terminal Infrastructure

Package System Integration

Core MCP Layer

Repository Layer

UI Layer

MCPMarketScreen

MCPManageScreen

MCPPublishScreen

PackageManagerScreen

MCPRepository

SkillRepository

GitHub API Client

MCPManager
(Singleton)

MCPStarter

MCPDeployer

MCPToolExecutor

PackageManager

AIToolHandler

MCPPackage
(ToolPackage)

MCPSharedSession

Terminal

TerminalManager

MCP Preferences
(DataStore)

EnvPreferences

Plugin Files
(External Storage)
```

---

## MCP 包结构

MCP 插件表示为一种特殊类型的 `ToolPackage`，称为 `MCPPackage`。这种集成使 MCP 插件能够与 JavaScript 包和 ToolPkg 容器一起参与统一的包管理系统。

### MCPPackage 数据模型

```
MCPPackage

+String name

+String displayName

+String description

+String version

+List<MCPServerConfig> servers

+List<EnvVar> env

+Boolean isBuiltIn

+ToolPackageState? activeState

MCPServerConfig

+String command

+List<String> args

+Map<String,String> env

+String? workingDirectory

EnvVar

+String name

+LocalizedText description

+Boolean required

+String? defaultValue

«interface»

ToolPackage

+String name

+LocalizedText displayName

+LocalizedText description

+List<PackageTool> tools

+List<ToolPackageState> states
```

---

## 插件发现与安装

`MCPRepository` 管理插件元数据并与 GitHub 协调以实现 MCP 市场功能。它跟踪安装状态并为 UI 更新提供数据流。

### 仓库架构

```
File System

Local Storage

GitHub Integration

MCPRepository

loadPlugins()

fetchFromGitHub()

syncInstalledStatus()

installedPlugins: StateFlow

GitHub Issues API
(Marketplace Listings)

Issue Body
(JSON Metadata)

MCPPreferences
(DataStore)

Map

External Files Dir
/mcp_plugins/

Plugin Installation Files
```

**关键方法：**

- `loadPlugins()`：从 GitHub Issues 获取插件列表
- `syncInstalledStatus()`：扫描本地文件系统以更新安装状态
- `isPluginInstalled(pluginId)`：检查插件是否在本地可用
- `setPluginInstalled(pluginId, installed)`：在偏好设置中更新安装状态

---

## 插件生命周期管理

`MCPManager` 单例控制 MCP 插件的完整生命周期，从加载配置到启动服务器和注册工具。

### 生命周期状态机

```
Plugin metadata loaded

MCPDeployer.deploy()

Environment variables set

MCPStarter.start()

Server process active

MCPManager.registerMCPTools()

Tools available to AI

MCPStarter.stop()

Server terminated

Remove from filesystem

Server crash/timeout

Restart attempt

Give up after retries

Discovered

Installed

Configured

Starting

Running

ToolsRegistered

Stopping

Uninstalled

Error
```

### 管理器初始化流程

```
Terminal
MCPSharedSession
MCPStarter
MCPDeployer
MCPManager
PackageManager
Terminal
MCPSharedSession
MCPStarter
MCPDeployer
MCPManager
PackageManager
Lazy initialization
alt
[Env vars satisfied]
[Missing env vars]
loop
[For each plugin]
getInstance(context)
loadMCPPlugins()
scanDeployedPlugins()
List<MCPPackage>
Check environment variables
startServer(config)
getOrCreateSharedSession()
createSession("mcp-shared")
sessionId
sessionId
executeCommand(install_cmd)
executeCommand(start_cmd)
Server running
registerMCPTools()
Skip plugin
```

---

## 服务器管理

MCP 服务器作为独立进程运行，通过 Terminal 服务进行管理。`MCPStarter` 处理服务器部署和进程生命周期。

### Terminal 会话架构

`MCPSharedSession` 单例为所有 MCP 操作提供共享的终端会话，避免为每个插件创建单独会话的开销。

**主要特性：**

- **会话复用：** 所有 MCP 操作使用单一会话(`"mcp-shared"`)
- **线程安全：** 互斥锁保护的会话创建
- **延迟初始化：** 首次使用时创建会话
- **快速路径：** 无锁检查现有会话

```
Terminal Service

MCPSharedSession

MCPDeployer

MCPStarter

startServer()

stopServer()

deploy()

installDependencies()

getOrCreateSharedSession()

sharedSessionId: String?

Mutex (Thread Safety)

createSession(name)

executeCommand(sessionId, cmd)

sendInput(sessionId, input)
```

**实现细节：**

共享会话使用双重检查锁定与协程安全的 `Mutex`：

---

## 工具执行

MCP 工具通过 `MCPToolExecutor` 执行，它将 AI 工具调用转换为 MCP 协议消息，并处理与服务器的双向通信。

### 执行流程

```
Terminal Service
MCP Server Process
MCPToolExecutor
AIToolHandler
EnhancedAIService
Terminal Service
MCP Server Process
MCPToolExecutor
AIToolHandler
EnhancedAIService
Via stdin/stdout
alt
[Success]
[Error]
Tool call from AI model
executeTool(tool, arguments)
Validate arguments
Build MCP request JSON
Send request to server
Process request
Response JSON
Command output
Parse response JSON
Extract result/error
ToolResult(success)
Tool output
ToolResult(error)
Error message
```

---

## 环境变量

MCP 插件可以通过 `EnvVar` 结构声明所需的环境变量。`EnvPreferences` 系统全局管理这些变量。

### 环境变量规范

MCP 包清单中的每个 `EnvVar` 包括：
字段类型描述`name``String`变量名(例如 `GITHUB_TOKEN`)`description``LocalizedText`面向用户的说明`required``Boolean`插件是否可以在没有它的情况下运行`defaultValue``String?`可选的默认值

### 环境管理流程

```
Runtime

Package System

Preferences

UI Layer

MCPEnvironmentVariablesDialog

PackageDetailsDialog

EnvPreferences.getInstance()

DataStore

PackageManager

MCPPackage.env: List

MCPManager

MCPServerConfig.env

Server Process
(Environment Variables)
```

**关键操作：**

- `EnvPreferences.getEnv(key)`：检索环境变量值
- `EnvPreferences.setEnv(key, value)`：存储环境变量
- `PackageManager.requiredEnvKeys`：聚合所有导入包的必需变量

---

## UI 集成

MCP 插件系统通过多个界面和包管理器接口集成到主 UI 中。

### 界面层级

```
Package Details

MCP Market Flow

Main Navigation

MCP Tab

PackageManagerScreen
(Packages NavItem)

MCPMarketScreen
(Browse Plugins)

MCPPluginDetailScreen
(View Details)

MCPPublishScreen
(Share Plugins)

MCPManageScreen
(Manage Posted)

MCPEditPlugin
(Edit Listing)

PackageDetailsDialog
(Tool List, Env Vars)

MCPEnvironmentVariablesDialog
(Configure Variables)
```

**界面路由(来自 OperitScreens.kt)：**

- `Screen.MCPMarket`：从 GitHub 浏览可用的 MCP 插件
- `Screen.MCPPublish`：发布新的 MCP 插件列表
- `Screen.MCPManage`：管理用户已发布的插件
- `Screen.MCPPluginDetail(issue)`：查看插件详情并安装
- `Screen.MCPEditPlugin(issue)`：编辑现有插件列表

---

## 安装与部署

`MCPDeployer` 处理插件文件的物理安装和依赖管理。

### 部署流程

```
Yes

No

Yes

No

Error

User clicks Install

Already
Installed?

Show 'Already Installed'

Download plugin files

Extract to /mcp_plugins//

Parse package.json/manifest

Dependencies
Required?

Run npm install / pip install

Update installation state

Create MCPPackage object

Register tools with AIToolHandler

Installation Complete

End

Show error dialog
```

**关键组件：**
组件职责`MCPDeployer.deploy()`主要部署编排`MCPDeployer.installDependencies()`运行 npm/pip/pnpm 安装命令`MCPDeployer.scanDeployedPlugins()`发现已安装的插件`MCPRepository.setPluginInstalled()`更新安装状态
**文件位置：**

- 插件文件：`/data/data/com.ai.assistance.operit/files/mcp_plugins/<plugin-id>/`
- 清单文件：`<plugin-dir>/package.json` 或 `<plugin-dir>/manifest.json`
- 脚本文件：`<plugin-dir>/src/` 或 `<plugin-dir>/dist/`

---

## 与包系统的集成

MCP 插件完全集成到 `PackageManager` 系统中，允许它们与 JavaScript 包和 ToolPkg 容器一起管理。

### 包管理器集成点

```
Unified Package Map

MCP Integration

PackageManager Core

getAvailablePackages()

getImportedPackages()

loadPackageFromManifest()

MCPManager (lazy)

loadMCPPlugins()

MCP Plugin Packages

availablePackages: Map

JavaScript Packages

ToolPkg Containers

MCPPackage instances
```

**统一的包操作：**

所有包类型通过 `ToolPackage` 接口共享通用操作：

- **导入/移除：**`importPackage()`、`removePackage()` 适用于所有类型
- **工具注册：**`getPackageTools()` 返回工具，无论来源如何
- **环境变量：**`requiredEnvByPackage` 聚合所有包的环境变量
- **状态管理：**`activePackageStateIds` 跟踪所有包的活动状态

---

## 市场系统

MCP 市场使用 GitHub Issues 作为内容管理系统。每个插件由指定仓库中的特殊格式 issue 表示。

### 市场架构

```
User Actions

UI Display

MCPRepository

GitHub Repository

GitHub Issues
(Plugin Listings)

Issue Body
(JSON Metadata)

Labels
(Category Tags)

fetchDisplayablePlugins()

parseIssueToPlugin()

In-Memory Cache

MCPMarketScreen

Plugin Cards List

Filter & Sort Controls

View Details

Install Plugin

Publish New Plugin
```

**Issue 格式示例：**

```
{
  "name": "filesystem-mcp",
  "displayName": "Filesystem MCP",
  "description": "Provides file system operations",
  "version": "1.0.0",
  "repository": "https://github.com/owner/filesystem-mcp",
  "installCommand": "npm install",
  "startCommand": "node dist/index.js",
  "env": [
    {
      "name": "BASE_PATH",
      "description": "Base path for file operations",
      "required": true
    }
  ]
}
```

---

## 安全与权限

MCP 插件作为独立进程运行，系统访问受限，但仍可通过环境变量和终端命令访问敏感数据。

### 安全模型

层级保护机制**进程隔离**MCP 服务器通过 Terminal 在独立进程中运行**环境变量**用户显式配置敏感令牌/密钥**文件系统**插件隔离在 `/mcp_plugins/<id>/` 目录**网络访问**无特殊限制；继承应用权限**终端会话**与标准用户权限共享会话
**用户责任：**

- 安装前审查插件源代码
- 仅向可信插件提供环境变量
- 理解插件可使用应用权限访问终端

---

## 错误处理

MCP 系统包含针对服务器故障、通信问题和部署问题的全面错误处理。

### 错误类别

```
MCP Error

Server Errors

Deployment Errors

Communication Errors

Environment Errors

Server Crash

Startup Timeout

Unexpected Exit

Dependency Install Failed

File System Error

Manifest Parse Error

Stdin Write Failure

Stdout Read Failure

JSON Parse Error

Missing Required Var

Invalid Value
```

**错误处理策略：**

1. **服务器崩溃：** 带退避的自动重启(实现方式各异)
2. **缺少依赖：** 清晰的错误消息及安装说明
3. **通信失败：** 记录错误，标记工具为不可用
4. **环境错误：** 阻止服务器启动，显示配置对话框

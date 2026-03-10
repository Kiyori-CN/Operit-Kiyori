# 终端与 Shell 工具

本文档介绍 Operit 中的终端和 shell 执行系统，该系统提供持久化 shell 会话、命令执行、SSH 支持以及与文件系统工具的集成。

有关使用终端的文件系统操作信息，请参阅 [File System Tools](/AAswordman/Operit/5.2-file-system-tools)。有关 SSH 配置和远程连接管理，请参阅 [Package System](/AAswordman/Operit/5.7-package-system) 中的工作空间配置。

---

## 目的与架构

终端系统提供托管的 shell 环境，实现以下功能：

- 具有状态保持的持久化 shell 会话
- 支持流式输出的异步命令执行
- SSH 远程终端支持
- 跨环境文件操作(Android 和 Linux)
- 与 MCP 插件和工具包集成

该系统构建于三层之上：用于应用层访问的 `Terminal` 包装器、用于会话编排的 `TerminalManager`，以及用于环境抽象的 `FileSystemProvider`。

---

## 系统架构

### Terminal 组件层次结构

```
Consumers

Environment Providers

Session Management

Core Terminal Layer

Application Layer

Terminal
(Singleton Wrapper)

MCPSharedSession
(Shared Session Manager)

TerminalManager
(Session Orchestrator)

TerminalState
(StateFlow)

commandExecutionEvents
(SharedFlow)

directoryChangeEvents
(SharedFlow)

sessions
(Map of Session Objects)

currentSessionId
(StateFlow)

Session Data
(history, directory, state)

FileSystemProvider
(Interface)

Local Terminal Provider
(Termux Integration)

SSH Provider
(Remote Connection)

StandardFileSystemTools
(Linux operations)

MCP Plugins
(Tool execution)

AIToolHandler
(Tool integration)
```

---

## Terminal 类 API

`Terminal` 类是整个应用程序中终端操作的主要单例接口。

### 初始化和生命周期

方法说明返回类型`getInstance(context)`获取单例实例`Terminal``initialize()`初始化终端环境`suspend Boolean``destroy()`清理终端资源`Unit`
终端在使用前必须初始化。初始化会设置底层 shell 环境并准备会话管理：

```
val terminal = Terminal.getInstance(context)
val initialized = terminal.initialize()
if (!initialized) {
    // Handle initialization failure
}
```

### 会话管理方法

方法说明返回类型`createSession(title)`创建新会话并等待初始化`suspend String``switchToSession(sessionId)`切换活动会话`Unit``closeSession(sessionId)`终止会话`Unit`
会话通过唯一的字符串 ID 标识，并维护独立的状态，包括命令历史、工作目录和环境变量。

### 命令执行 API

终端提供两种执行模式：等待完成和流式输出。

#### 执行并等待

```
suspend fun executeCommand(sessionId: String, command: String): String?
```

在特定会话中执行命令，而不切换当前活动会话。命令完成后返回完整输出。出错时返回 `null`。

**实现细节：**

- 生成唯一的 `commandId` 用于跟踪
- 在发送命令前订阅 `commandEvents` 流
- 使用 `CompletableDeferred` 等待完成

#### 流式执行

```
fun executeCommandFlow(sessionId: String, command: String): Flow<CommandExecutionEvent>
```

返回一个 Flow，在命令执行时发出 `CommandExecutionEvent` 对象。当 `event.isCompleted` 为 true 时流完成。

**CommandExecutionEvent 结构：**

- `sessionId`：会话标识符
- `commandId`：唯一命令标识符
- `outputChunk`：增量输出文本
- `isCompleted`：完成标志

---

## 会话生命周期与状态

### 会话创建流程

```
"Shell Process"
"Session Instance"
"TerminalManager"
"Terminal"
"Application Code"
"Shell Process"
"Session Instance"
"TerminalManager"
"Terminal"
"Application Code"
Session now ready for commands
createSession(title)
createNewSession(title)
new Session()
spawn shell process
initialization complete
session ready
sessionId
sessionId
```

### 状态流

Terminal 暴露了多个 StateFlow 和 SharedFlow 属性用于响应式状态观察：
属性类型说明`commandEvents``SharedFlow<CommandExecutionEvent>`命令执行事件`directoryEvents``SharedFlow<SessionDirectoryEvent>`工作目录变更`terminalState``StateFlow<TerminalState>`终端整体状态`sessions``StateFlow<Map<String, Session>>`所有活动会话`currentSessionId``StateFlow<String?>`当前活动会话 ID`currentDirectory``StateFlow<String>`当前会话的工作目录`isInteractiveMode``StateFlow<Boolean>`交互模式标志`interactivePrompt``StateFlow<String>`当前提示符字符串`isFullscreen``StateFlow<Boolean>`全屏模式标志

### 输入与控制方法

方法说明`sendInput(sessionId, input)`向会话发送输入(用于交互式程序)`sendInterruptSignal(sessionId)`发送 Ctrl+C 中断信号`isConnected()`检查终端服务是否可用(始终为 true)

---

## 与文件系统操作的集成

终端系统与文件操作深度集成，特别是针对 Linux 环境和 SSH 远程访问。

### FileSystemProvider 架构

```
Providers

Provider Selection

Environment Detection

File System Tools

if SSH logged in

fallback

StandardFileSystemTools

LinuxFileSystemTools

SafFileSystemTools

isLinuxEnvironment()
isSafEnvironment()

getLinuxFileSystem()

SSHFileConnectionManager

TerminalManager

SSH FileSystemProvider
(Remote)

Local FileSystemProvider
(Termux)
```

### Environment 参数

文件系统工具接受 `environment` 参数来确定执行上下文：
Environment ValueBehavior`"linux"`使用 Linux FileSystemProvider(终端或 SSH)`"android"`使用 Android 原生文件 API`repo:*`使用 SAF(Storage Access Framework)
**系统提示词示例：**

AI 系统提示词指示模型在终端操作中使用 `environment="linux"`：

> "通过工具读写工作区文件时，传递 `environment="linux"` 并使用绝对路径如 `/...`。"

### Provider 选择逻辑

系统动态选择合适的文件系统 provider：

```
1. Check if SSH connection is active
   → If yes: Use SSH FileSystemProvider

2. Otherwise: Use local Terminal FileSystemProvider

```

**实现：**

选择结果会被缓存，并在 SSH 和本地模式之间切换时记录日志。

---

## SSH 和远程终端支持

### SSH 连接架构

```
Tool Integration

File Operations

Connection Management

SSHFileConnectionManager
(Singleton)

Connection State
(host, port, credentials)

FileSystemProvider

SSH Implementation
(SFTP/SCP)

StandardFileSystemTools

LinuxFileSystemTools
```

### SSH Provider 特性

当 SSH 连接建立时：

- 文件操作在远程系统上执行
- 工作目录按远程会话维护
- 支持标准 POSIX 文件操作
- 如果 SSH 断开连接，自动回退到本地终端

**连接生命周期：**

1. 用户在工作区设置中配置 SSH 凭据
2. `SSHFileConnectionManager.getInstance(context)` 创建/获取管理器
3. 管理器建立连接并创建 `FileSystemProvider`
4. Provider 被 `LinuxFileSystemTools` 用于所有操作
5. 断开连接时,系统回退到本地终端 provider

---

## MCP 共享会话管理

`MCPSharedSession` 对象管理单个共享终端会话,供 MCP (Model Context Protocol) 插件使用,以避免创建冗余会话。

### 共享会话模式

```
"Terminal"
"MCPSharedSession"
"MCP Plugin 2"
"MCP Plugin 1"
"Terminal"
"MCPSharedSession"
"MCP Plugin 2"
"MCP Plugin 1"
Session cached
Both plugins use same session
getOrCreateSharedSession()
createSession("mcp-shared")
sessionId
sessionId
getOrCreateSharedSession()
cached sessionId
```

### MCPSharedSession API

方法描述返回类型`getOrCreateSharedSession(context)`获取或创建共享会话`suspend String?``getCurrentSessionId()`返回当前会话 ID(如果存在)`String?``clearSession()`清除会话引用(不关闭)`suspend Unit``hasActiveSession()`检查共享会话是否存在`Boolean`

### 线程安全

共享会话使用 `Mutex` 确保线程安全访问:

- 快速路径检查现有会话,无需加锁
- Mutex 保护的创建过程,防止竞态条件
- 双重检查锁定模式以提高效率

---

## 终端挂载和路径映射

系统支持 Android 和 Linux 环境之间的自动路径挂载,特别是在工作区路径绑定时。

### 常见挂载点

如系统提示中所述:

```
/storage/emulated/0 → /sdcard
/storage/emulated/0 → /storage/emulated/0
/data/user/0/com.ai.assistance.operit/files → same path

```

### 工作区路径处理

当工作区在 Linux 环境中绑定时,文件可以直接执行而无需复制:

> "如果工作区位于挂载路径下，直接在 Linux 终端环境中执行工作区文件；执行前不要复制文件。"

**实现上下文：**

系统提示词引导 AI 识别挂载点，并在 `environment` 参数为 `"linux"` 时使用适当的路径：

---

## 命令执行模式

### 模式 1：触发即忘

对于不需要输出的命令：

```
val terminal = Terminal.getInstance(context)
val sessionId = terminal.createSession()
terminal.switchToSession(sessionId)
terminal.sendInput(sessionId, "cd /tmp\n")
```

### 模式 2：等待完整输出

对于需要完整结果的命令：

```
val terminal = Terminal.getInstance(context)
val sessionId = terminal.createSession()
val output = terminal.executeCommand(sessionId, "ls -la /tmp")
println(output ?: "Command failed")
```

### 模式 3：流式输出

对于长时间运行的命令或需要实时反馈的场景：

```
val terminal = Terminal.getInstance(context)
val sessionId = terminal.createSession()
 
terminal.executeCommandFlow(sessionId, "npm install")
    .collect { event ->
        print(event.outputChunk)
        if (event.isCompleted) {
            println("\nCommand completed")
        }
    }
```

---

## 与工具系统的集成

终端操作通过 `StandardFileSystemTools` 及相关类中注册的各种工具暴露给 AI。

### 依赖终端的工具

以下工具类别在 `environment="linux"` 时使用终端执行：
工具类别示例实现文件操作`read_file`、`write_file`、`list_files``LinuxFileSystemTools`文件搜索`find_files`、`grep_code`使用终端的并行文件处理Shell 执行通过工具直接执行 shell 命令`Terminal.executeCommand()`

### 工具执行流程

```
"File System"
"Terminal/SSH Provider"
"StandardFileSystemTools"
"AIToolHandler"
"AI Model"
"File System"
"Terminal/SSH Provider"
"StandardFileSystemTools"
"AIToolHandler"
"AI Model"
call read_file(path="/tmp/test.txt", environment="linux")
readFile(tool)
isLinuxEnvironment("linux") = true
getLinuxFileSystem()
FileSystemProvider
provider.readFile("/tmp/test.txt")
file content
ToolResult(success=true, content)
return content
```

---

## 错误处理和失败模式

### 会话初始化失败

会话可能因以下原因初始化失败：

- 终端环境未正确设置
- 权限不足
- 资源耗尽

`createSession()` 方法在失败时会抛出异常。已弃用的 `createSessionAndWait()` 返回 `null`：

### 命令执行失败

命令执行可能静默失败或返回 `null`：

- `executeCommand()` 在错误时返回 `null`
- `executeCommandFlow()` 可能发出包含错误信息的事件

### SSH 连接失败

当 SSH 连接断开时：

- `SSHFileConnectionManager.getFileSystemProvider()` 返回 `null`
- 系统自动回退到本地终端提供程序
- 切换会被记录用于调试：`"Using local terminal file system provider"`

---

## 性能考虑

### 会话复用

创建终端会话开销较大。对于重复操作：

- 尽可能复用现有会话
- 对 MCP 插件使用 `MCPSharedSession`
- 为并发操作池化会话

### 命令批处理

与其执行多个单独命令，不如批量操作：

```
// Inefficient
commands.forEach { terminal.executeCommand(sessionId, it) }
 
// Better
val batchScript = commands.joinToString("\n")
terminal.executeCommand(sessionId, batchScript)
```

### 异步与同步执行

`executeCommand()` 方法会阻塞直到完成。对于并行操作，使用多个会话或配合并发收集的 `executeCommandFlow()`。

---

## 配置和系统提示

系统提示根据工作区绑定动态配置终端行为：

### 工作区特定提示

当工作区路径绑定 `environment="linux"` 时：

```
WEB WORKSPACE GUIDELINES:
- Your working directory, `$workspacePath` (environment=linux), is automatically set up...
- When reading/writing workspace files via tools, pass `environment="linux"` and use absolute paths like `/...`.
- Terminal mount note: common mounts include `/storage/emulated/0 -> /sdcard`...

```

这会引导 AI：

1. 对工作区文件的所有工具调用使用 `environment="linux"`
2. 使用以 `/` 开头的绝对路径
3. 识别挂载点以避免不必要的文件复制
4. 在挂载目录中直接执行脚本

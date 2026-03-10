# 文件系统工具

## 目的与范围

文件系统工具为 AI 助手提供跨多种环境的全面文件和目录操作能力：Android 原生文件系统、Linux/Termux 文件系统(通过 SSH 或本地终端)以及用于受限访问场景的存储访问框架(SAF)。这些工具支持读取、写入、搜索和修补文件，并支持特殊文件类型，包括图像、PDF、文档、音频和视频。

有关工具执行和权限处理的信息，请参阅 [Tool Architecture](/AAswordman/Operit/5.1-tool-architecture)。有关工具权限级别和用户批准的详细信息，请参阅 [Tool Permissions](/AAswordman/Operit/5.9-tool-permissions)。有关基于终端的操作，请参阅 [Terminal and Shell Tools](/AAswordman/Operit/5.5-terminal-and-shell-tools)。

---

## 架构概览

### 类层次结构

```
Backend Providers

Supporting Services

File System Tool Classes

Tool Registration

AIToolHandler

ToolRegistration

StandardFileSystemTools
(Base Implementation)

AccessibilityFileSystemTools
(Accessibility Level)

DebuggerFileSystemTools
(Debugger/ADB Level)

LinuxFileSystemTools
(Linux Environment)

SafFileSystemTools
(SAF Environment)

FileBindingService
(File Patching)

PathValidator
(Path Validation)

FileSystemProvider
(Linux FS Abstraction)

SSHFileConnectionManager

TerminalManager

SAF Bookmarks
```

**图示：文件系统工具类层次结构**

---

## 环境支持

文件系统工具支持三种不同的环境，根据 `environment` 参数自动路由操作：
环境标识符后端用例**Android**默认或空Java `File` API、MediaStore在 `/sdcard`、应用目录上的标准 Android 文件操作**Linux**`"linux"``FileSystemProvider`(SSH 或终端)在 Termux、Ubuntu 或远程 SSH 服务器中的操作**SAF**`"repo:bookmarkName"`存储访问框架访问需要 SAF 权限的用户选择目录

### 环境检测与路由

`StandardFileSystemTools` 类决定使用哪个后端：

```
Yes

No

Yes

No

Tool Invocation
with 'environment' param

environment starts
with 'repo:'?

environment
== 'linux'?

SafFileSystemTools

LinuxFileSystemTools

Standard Android
File API
```

**图示：环境路由逻辑**

### Linux 环境详情

对于 Linux 操作，系统使用 `FileSystemProvider` 抽象，可以连接到：

1. **SSH 连接**(优先)：通过 `SSHFileConnectionManager` 访问远程文件系统
2. **本地终端**：通过 `TerminalManager` 访问 Termux 或本地 Linux 环境

提供者在运行时动态选择：

---

## 核心文件操作

### 基本操作

工具名称用途环境关键参数`list_files`列出目录内容全部`path`, `environment``read_file`读取文件（有大小限制）全部`path`, `environment``read_file_full`读取完整文件全部`path`, `text_only`, `environment``read_file_part`读取指定行范围全部`path`, `start_line`, `end_line`, `environment``read_file_binary`以 Base64 格式读取文件全部`path`, `environment``write_file`写入或追加到文件全部`path`, `content`, `append`, `environment``write_file_binary`从 Base64 写入二进制文件全部`path`, `base64Content`, `environment``file_exists`检查文件是否存在全部`path`, `environment``delete_file`删除文件或目录全部`path`, `environment``move_file`移动/重命名文件全部`source_path`, `dest_path`, `environment``copy_file`复制文件全部`source_path`, `dest_path`, `environment``create_directory`创建目录全部`path`, `environment``get_file_info`获取详细文件元数据全部`path`, `environment`

### 文件读取策略

文件读取操作实现了大小感知策略：

```
Yes

No

Yes

No

read_file request

Special file type?
(image, PDF, doc)

File size >
maxFileSizeBytes?

Handle special type:
- OCR for images
- Extract for PDF/docs
- Transcribe for audio/video

Read first N bytes
+ append truncation notice

Read full content
```

**图示：文件读取决策流程**

---

## 高级搜索操作

### grep_code：模式搜索

`grep_code` 工具执行基于正则表达式的跨文件内容搜索：

**参数：**

- `path`：搜索目录
- `query`：正则表达式模式
- `file_pattern`：文件名过滤器(例如 `*.kt`)
- `case_insensitive`：布尔标志
- `max_results`：结果限制
- `environment`：目标环境

**实现细节：**

- 使用协程进行并行文件处理，通过信号量控制并发
- 存在 `.gitignore` 时遵循其规则
- 返回行号和周围上下文
- 通过批处理优化大型代码库

### grep_context: 智能语义搜索

`grep_context` 工具使用 AI 模型根据语义意图智能搜索代码：

```
User provides
search intent

AI generates
optimized regex queries

Round 1:
Run grep_code batch
with initial queries

Collect candidates
(up to 30 per query)

AI analyzes results
& refines queries

Round 2:
Run grep_code batch
with refined queries

Merge candidates
from both rounds

AI selects most
relevant candidates

Read surrounding lines
for selected matches

Return enriched
search results
```

**图示：grep_context 多轮搜索流程**

**核心特性：**

- 3 轮迭代优化，结合 AI 模型
- 从自然语言意图自动生成查询
- 去重和相关性排序
- 通过读取周围行丰富上下文
- 每个阶段的进度报告

**AI 模型集成：**
使用 `FunctionType.GREP` 模型来：

1. 从意图生成优化的正则表达式查询
2. 根据中间结果优化查询
3. 从候选项中选择最相关的匹配
4. 确定哪些匹配需要上下文丰富

### find_files: 文件发现

`find_files` 工具通过名称或路径模式定位文件：

**参数：**

- `path`：搜索目录
- `pattern`：文件名模式(glob 或正则表达式)
- `use_path_pattern`：布尔值 - 匹配完整路径(true)或仅文件名(false)
- `case_insensitive`: 布尔标志
- `max_results`: 结果限制(默认 100)
- `environment`: 目标环境

**性能优化：**

- 使用协程并行遍历
- 达到 max_results 时提前终止
- 高效的路径模式匹配

---

## 文件补丁系统

### apply_file 工具

`apply_file` 工具使用结构化编辑操作智能地修改现有文件，由 `FileBindingService` 提供支持：

**参数：**

- `path`: 目标文件路径
- `content`: 新内容(完全替换)或结构化编辑块
- `environment`: 目标环境

### 编辑块格式

对于精确修改，使用结构化编辑块：

```
[START-REPLACE]
[OLD]
original content to find
[/OLD]
[NEW]
new content to insert
[/NEW]
[END-REPLACE]

[START-DELETE]
[OLD]
content to remove
[/OLD]
[END-DELETE]

```

### 模糊匹配引擎

```
Edit operation
with [OLD] content

Normalize:
- Remove whitespace
- Build n-grams

Parallel sliding
window search

Calculate similarity
for each window:
- N-gram overlap
- Size difference
- Length difference

Select best match:
highest score,
smallest differences

Apply operation:
- Remove old lines
- Insert new lines
- Preserve indentation

Check for
multiple perfect matches
(ambiguity detection)
```

**图示：模糊补丁匹配算法**

**算法详情：**

1. **预处理**：

- 将所有空白字符规范化为空字符串
- 构建 OLD 内容的 n-gram 索引
- 创建行起始索引以实现快速窗口化

2. **并行搜索**：

- 将文件分割成段以进行并行处理
- 每个线程使用滑动窗口搜索其段
- 测试窗口大小：`targetLines ± 20%`
- 计算每个窗口的 n-gram 相似度分数

3. **评分指标**:

```
Priority:
1. Highest n-gram similarity score
2. Smallest size difference (line count)
3. Smallest length difference (character count)
4. First occurrence (if all else equal)

```

4. **应用**:

- 自下而上移除匹配的行
- 插入新行并保留/继承缩进
- 生成统一差异格式以供验证

**回退行为：**

- 如果未找到结构化块且文件为空：完全替换
- 如果未找到结构化块且文件存在：错误(拒绝覆盖)
- 如果找到多个完全匹配：错误(存在歧义)

### 统一差异格式生成

应用补丁后，`FileBindingService` 生成可读的统一差异格式：

```
Changes: +15 -8 lines

@@ -45,4 +45,6 @@
-45  |    val oldLine = "old content"
+46  |    val newLine = "new content"
+47  |    val anotherNewLine = "more content"
 48  |    // Context line

```

---

## 特殊文件类型处理

### 支持的特殊类型

系统通过专门的处理方式支持以下文件类型：
类型扩展名处理方法**文档**`.doc`、`.docx`Apache POI 文本提取**PDF**`.pdf`PDFBox 文本提取**图像**`.jpg`、`.jpeg`、`.png`、`.gif`、`.bmp`通过后端图像识别服务进行 OCR**音频**`.mp3`、`.wav`、`.m4a`、`.aac`、`.flac`、`.ogg`、`.opus`通过后端音频识别进行转录**视频**`.mp4`、`.mkv`、`.mov`、`.webm`、`.avi`、`.m4v`通过后端视频识别进行转录

### 处理流程

```
No

Yes

Yes

No

read_file_full
with special file

Backend service
configured?

Return error:
Service not configured

File in media pool?

Return pooled URL

Add to ImagePoolManager
or MediaPoolManager

Call recognition service
with media URL

Return extracted text
as file content
```

**图示：特殊文件类型处理**

**实现细节：**

1. **媒体池管理**：

- `ImagePoolManager`：缓存图像文件以供重用
- `MediaPoolManager`：缓存音频/视频文件
- 为后端服务返回 HTTP URL

2. **后端服务集成**：

- 图像：使用 `EnhancedAIService.getAIServiceForFunction(FunctionType.IMAGE_RECOGNITION)`
- 音频：使用 `FunctionType.AUDIO_RECOGNITION`
- 视频：使用 `FunctionType.VIDEO_RECOGNITION`

3. **文档提取**：

- Word 文档：Apache POI `XWPFDocument`
- PDF：Apache PDFBox `PDDocument.getText()`

---

## 权限级别与实现

### 权限层级

文件系统工具在三个权限级别上实现：

```
extends

extends

StandardFileSystemTools
Standard Android API

AccessibilityFileSystemTools
+ Accessibility Service

DebuggerFileSystemTools
+ ADB/Shizuku
```

**图示：权限级别继承关系**

### 实现差异

操作标准可访问性调试器`/sdcard` 访问✓ Java File API✓ Java File API✓ Java File API应用内部目录✗ (仅自身应用)✗ (仅自身应用)✓ 通过 ADB shell`/data/data/*`✗✗✓ 通过 ADB shell系统目录✗✗✓ (只读) 通过 ADB
**调试器级别增强功能**：

1. **list_files**：对系统路径通过 `AndroidShellExecutor` 使用 `ls -la` 命令
2. **read_file_full**：对受保护文件使用 `cat` 命令
3. **write_file**：对受保护位置使用 `echo` 或 shell 重定向
4. **Operit 内部路径处理**：针对 `/data/data/com.ai.assistance.operit` 路径的特殊逻辑

---

## 路径验证与安全

### PathValidator

所有文件操作都通过 `PathValidator` 验证路径以防止安全问题：

**验证规则：**

1. **Android 路径**：

- 必须以 `/` 开头或为相对路径
- 阻止：明显的系统路径如 `/system`、`/proc`
- 允许：`/sdcard`、`/storage`、应用目录

2. **Linux 路径**：

- 必须以 `/` 或 `~` 开头
- 比 Android 限制更少

3. **SAF 路径**：

- 根据配置的书签进行验证

**错误处理：**
如果验证失败，返回 `success=false` 的 `ToolResult`，阻止操作执行。

---

## 工作区集成

文件系统工具与系统提示中提到的工作区系统集成：

```
Workspace Binding
(Web root directory)

File Operations
with workspace path

Built-in Web Server

index.html Preview
```

**图示：工作区与文件工具集成**

**工作区指南**：

当工作区绑定时：

- 工作区目录被设置为 web 服务器根目录
- AI 被指示使用 `apply_file` 创建 web 文件
- 主文件必须是 `index.html` 以便预览
- 建议：将代码拆分到多个文件，使用相对路径
- 对于 Linux 工作区：传递 `environment="linux"` 参数

---

## 与其他系统的集成

### 工具处理器注册

文件系统工具通过 `ToolRegistration` 在 `AIToolHandler` 中注册：

### 在 ConversationService 中的使用

`ConversationService` 通过增强的 AI 服务系统间接使用文件工具，特别用于：

- 读取配置文件
- 处理工作区文件
- 处理角色卡文件

### 系统提示词引用

文件工具在系统提示词中描述并附带使用示例：

**工具描述**(已引用但未提供)：

- 每个文件工具都有中英文描述
- 向 AI 模型提供参数模式
- 示例演示正确的使用模式

---

## 数据结构

### 关键结果类型

**DirectoryListingData：**

```
data class FileEntry(
    name: String,
    isDirectory: Boolean,
    size: Long,
    permissions: String,
    lastModified: String
)
```

**FileContentData：**

```
data class FileContentData(
    path: String,
    content: String,
    size: Long,
    env: String = ""
)
```

**FilePartContentData：**

```
data class FilePartContentData(
    path: String,
    content: String,
    partIndex: Int,
    totalParts: Int,
    startLine: Int,
    endLine: Int,
    totalLines: Int,
    env: String = ""
)
```

**GrepResultData：**

```
data class MatchLocation(
    file: String,
    line: Int,
    column: Int,
    matchedText: String,
    context: String
)
```

**FindFilesResultData：**

```
data class FindFilesResultData(
    files: List<String>,
    env: String = ""
)
```

---

## 性能考虑

### 并发与并行

**grep_code 优化**：

```
Cores: Runtime.getRuntime().availableProcessors()
Concurrency: min(6, max(1, cores))
Batch Size: concurrency * 4
Semaphore: limits parallel file reads

```

**find_files 优化**：

- 并行目录遍历
- 使用 `AtomicBoolean` 提前终止
- 结果数量限制强制执行

### 进度报告

两种搜索操作均通过 `ToolProgressBus` 报告进度：

```
ToolProgressBus.update(
    toolName,
    progress: Float,  // 0.0 to 1.0
    message: String
)
```

这使得 UI 能够在长时间运行的操作期间显示实时进度。

---

## 总结

File System Tools 提供了一个全面的跨环境文件操作系统，具有以下特性：

- **多环境支持**：在 Android、Linux 和 SAF 之间无缝操作
- **高级搜索**：使用 `grep_context` 进行 AI 驱动的语义搜索
- **智能补丁**：基于模糊匹配的文件修改
- **特殊文件处理**：OCR、转录和文档提取
- **权限层级**：三个实现级别以满足不同访问需求
- **性能优化**：并行处理和进度报告

该架构使 AI 助手能够在从简单读取到复杂代码修改的各种环境中可靠地执行复杂的文件操作。

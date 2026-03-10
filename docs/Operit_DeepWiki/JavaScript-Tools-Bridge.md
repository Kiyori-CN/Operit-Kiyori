# JavaScript 工具桥接

## 目的与范围

JavaScript 工具桥接提供了一个运行时 API,允许在 V8 中运行的 JavaScript 代码调用 Operit 的 40 多个内置工具。该桥接使工具包和 MCP 插件能够使用便捷的 `Tools.*` 命名空间接口执行系统操作。桥接负责处理参数序列化、通过 `AIToolHandler` 进行工具调用以及结果反序列化。

有关底层工具注册和执行架构的信息,请参阅 [Tool Architecture](/AAswordman/Operit/5.1-tool-architecture)。有关 JavaScript 包如何加载和管理的详细信息,请参阅 [Package System](/AAswordman/Operit/5.7-package-system)。

---

## 架构概览

JavaScript 工具桥接由三层组成:向用户代码公开的 JavaScript API 接口、将 API 调用转换为工具调用的桥接机制,以及原生工具执行层。

### 桥接架构图

```
Native Tool Layer

Bridge Layer

JavaScript Runtime Layer

ToolResult

Result JSON

JavaScript Object

Return Value

Return Value

User JavaScript Code
(Packages, Scripts)

Tools.* API
(Files, Net, System, UI, etc.)

toolCall(name, params)
Bridge Function

JsToolManager
Execution Coordinator

PackageToolExecutor
Lifecycle Manager

Parameter Serializer
JSON ↔ ToolParameter

AIToolHandler
Tool Registry & Executor

Registered Tools
(40+ tools)

Tool Executors
(FileTools, NetTools, etc.)
```

---

## Tools API 定义

`Tools` 对象作为全局对象注入到 JavaScript 运行时中，包含按不同工具类型分类的命名空间。每个命名空间提供便捷方法，内部调用桥接的 `toolCall()` 函数。

### Tools API 命名空间结构

```
Tools
Global Object

Files.*
File System Operations

Net.*
Network & HTTP

System.*
System Control

UI.*
UI Automation

Memory.*
Knowledge Graph

FFmpeg.*
Media Processing

Workflow.*
Visual Automation

Tasker.*
Event Triggers

calc()
Calculator

list(path, env)

read(path)

write(path, content)

find(path, pattern)

httpGet(url)

httpPost(url, body)

visit(params)

startWeb(options)

sleep(ms)

terminal.*

intent(options)

getPageInfo()

tap(x, y)

clickElement(params)

runSubAgent(intent, maxSteps)
```

---

## 工具调用流程

当 JavaScript 代码调用工具方法时，调用会流经多个层级，包括参数转换、工具执行和结果反序列化。

### 调用序列图

```
ToolResult
FileSystemTools
AIToolHandler
JsToolManager
toolCall(name, params)
Tools.Files.read()
JavaScript Code
ToolResult
FileSystemTools
AIToolHandler
JsToolManager
toolCall(name, params)
Tools.Files.read()
JavaScript Code
Construct params object
Parameter serialization
Lookup tool in registry
Perform file read
Result deserialization
read("/sdcard/test.txt")
toolCall("read_file_full", {path: "..."})
execute("read_file_full", params)
executeTool(AITool)
invoke(tool)
ToolResult(success, data)
ToolResult
JavaScript Object
Result data
{path, content, size}
```

---

## 核心桥接函数

`toolCall()` 函数是注入到 JavaScript 运行时的基础桥接机制。所有 `Tools.*` 方法最终都委托给此函数。

### toolCall 函数契约

参数类型说明`name``string`工具名称(例如 `"read_file_full"`、`"http_request"`)`params``object`参数对象，包含字符串键和字符串/对象值**返回值**`object`工具结果，包含 `success`、`result`、`error` 字段
**参数序列化规则：**

- 所有参数值在调用原生工具前都会转换为字符串
- 对象参数(例如 headers、表单数据)会进行 JSON 字符串化
- 数组参数(例如 paths、modifiers)被 JSON 字符串化
- 布尔参数被转换为 `"true"` 或 `"false"` 字符串
- 数值参数被转换为字符串表示

**示例：**

```
// JavaScript call
const result = toolCall("read_file_full", {
    path: "/sdcard/test.txt",
    environment: "android"
});
 
// Native AITool construction
AITool(
    name = "read_file_full",
    parameters = [
        ToolParameter(name = "path", value = "/sdcard/test.txt"),
        ToolParameter(name = "environment", value = "android")
    ]
)
```

---

## Files 命名空间

`Tools.Files` 命名空间提供文件系统操作，支持 Android 和 Linux 环境。

### Files API 方法

方法参数工具名称描述`list()``(path, environment?)``list_files`列出目录内容`read()``(pathOrOptions)``read_file_full`读取完整文件内容`readPart()``(path, startLine, endLine, env?)``read_file_part`读取文件行范围`readBinary()``(path, environment?)``read_file_binary`读取为 Base64`write()``(path, content, append?, env?)``write_file`写入文件内容`writeBinary()``(path, base64Content, env?)``write_file_binary`写入二进制文件`deleteFile()``(path, recursive?, env?)``delete_file`删除文件/目录`exists()``(path, environment?)``file_exists`检查是否存在`move()``(source, destination, env?)``move_file`移动/重命名文件`copy()``(source, dest, recursive?, srcEnv?, destEnv?)``copy_file`复制文件/目录`mkdir()``(path, create_parents?, env?)``make_directory`创建目录`find()``(path, pattern, options?, env?)``find_files`按模式查找文件`grep()``(path, pattern, options?)``grep_code`在文件中搜索`grepContext()``(path, intent, options?)``grep_context`语义代码搜索`info()``(path, environment?)``file_info`获取文件元数据`apply()``(path, type, oldContent, newContent, env?)``apply_file`应用文件补丁`zip()``(source, destination, env?)``zip_files`创建 ZIP 压缩包`unzip()``(source, destination, env?)``unzip_files`解压 ZIP 压缩包`open()``(path, environment?)``open_file`用系统应用打开`share()``(path, title?, env?)``share_file`通过 Android 分享`download()``(urlOrOptions, dest?, env?, headers?)``download_file`从 URL 下载
**跨环境支持：**

`environment` 参数允许在不同文件系统上操作：

- `"android"` (默认) - 通过 SAF/MediaStore 访问 Android 文件系统
- Linux 环境名称(例如 `"termux"`, `"ubuntu"`)- SSH/终端文件系统

**使用示例：**

```
// Read a file
const content = Tools.Files.read("/sdcard/notes.txt");
 
// Read from Linux environment
const linuxContent = Tools.Files.read({
    path: "/home/user/script.sh",
    environment: "ubuntu"
});
 
// Cross-environment copy
Tools.Files.copy(
    "/sdcard/backup.zip",
    "/home/user/backup.zip",
    false, // not recursive
    "android", // source
    "ubuntu"   // destination
);
 
// Semantic grep with intent
const matches = Tools.Files.grepContext(
    "/sdcard/projects/myapp",
    "find database connection initialization",
    { file_pattern: "*.java", environment: "android" }
);
```

---

## Net 命名空间

`Tools.Net` 命名空间提供 HTTP 操作和 Web 自动化功能。

### Net API 结构

```
Tools.Net

HTTP Operations

Web Automation

Cookie Management

httpGet(url)

httpPost(url, body)

http(options)

uploadFile(options)

visit(params)

startWeb(options)

stopWeb(sessionId)

webNavigate(sid, url)

webEval(sid, script)

webClick(options)

webFill(sid, selector, value)

webWaitFor(sid, selector)

webSnapshot(sid, options)

webFileUpload(sid, paths)

cookies.get(domain)

cookies.set(domain, cookies)

cookies.clear(domain)
```

### HTTP 方法

方法参数说明`httpGet()``(url)`简单的 GET 请求`httpPost()``(url, body)`带 JSON 主体的 POST 请求`http()``(options)`完全控制 HTTP，包括请求头、方法、主体类型`uploadFile()``(options)`带表单数据的 Multipart 文件上传
**HTTP 选项：**

```
Tools.Net.http({
    url: "https://api.example.com/data",
    method: "POST",
    headers: { "Authorization": "Bearer token" },
    body: { key: "value" },
    body_type: "json" // json|form|text|xml
});
```

### Web 自动化会话方法

Web 自动化使用带浮动浏览器窗口的持久会话：
方法工具名称描述`startWeb()``start_web`创建持久化 Web 会话`stopWeb()``stop_web`关闭会话`webNavigate()``web_navigate`导航到 URL`webEval()``web_eval`在页面中执行 JavaScript`webClick()``web_click`通过引用点击元素`webFill()``web_fill`通过选择器填充输入`webWaitFor()``web_wait_for`等待元素/页面加载`webSnapshot()``web_snapshot`捕获带引用的页面状态`webFileUpload()``web_file_upload`处理文件选择器
**Web 会话工作流：**

```
// 1. Start session
const session = Tools.Net.startWeb({
    url: "https://example.com",
    headers: { "Custom-Header": "value" },
    user_agent: "CustomBot/1.0",
    session_name: "My Session"
});
const sessionId = extractSessionId(session);
 
// 2. Navigate and interact
Tools.Net.webNavigate(sessionId, "https://example.com/login");
Tools.Net.webFill(sessionId, "#username", "user@example.com");
Tools.Net.webFill(sessionId, "#password", "secret");
 
// 3. Click by ref (from snapshot)
const snapshot = Tools.Net.webSnapshot(sessionId, {
    include_links: true,
    include_images: false
});
// snapshot contains refs like "ref-123"
Tools.Net.webClick({
    session_id: sessionId,
    ref: "ref-123",
    element: "Login Button"
});
 
// 4. Evaluate JavaScript
const pageData = Tools.Net.webEval(sessionId, `
    JSON.stringify({
        title: document.title,
        url: window.location.href
    })
`);
 
// 5. Clean up
Tools.Net.stopWeb(sessionId);
```

---

## System 命名空间

The `Tools.System` namespace provides system-level operations including process control, notifications, settings, and terminal access.

### 系统 API 分类

```
Tools.System

Utilities

Application Control

Device Information

Terminal Sessions

Android Intents

sleep(ms)

toast(message)

sendNotification(msg, title)

installApp(path)

uninstallApp(pkg)

startApp(pkg, activity)

stopApp(pkg)

listApps(includeSystem)

getDeviceInfo()

getNotifications(limit)

getLocation(highAccuracy)

getSetting(setting, namespace)

setSetting(setting, value, ns)

terminal.create(name)

terminal.exec(sid, cmd)

terminal.screen(sid)

terminal.close(sid)

terminal.input(sid, options)

intent(options)

sendBroadcast(options)

shell(command)
```

### 终端会话管理

The `Tools.System.terminal.*` methods provide full terminal session control with PTY support:
方法Tool Name描述`create()``create_terminal_session`按名称创建/获取会话`exec()``execute_in_terminal_session`执行命令并收集输出`screen()``get_terminal_session_screen`获取当前屏幕快照`close()``close_terminal_session`关闭会话`input()``input_in_terminal_session`发送输入或控制键
**终端使用模式：**

```
// Create session
const session = Tools.System.terminal.create("build-session");
const sessionId = session.data.sessionId;
 
// Execute commands
Tools.System.terminal.exec(sessionId, "cd /home/user/project");
const buildResult = Tools.System.terminal.exec(sessionId, "npm run build", 300000);
 
// Send interactive input
Tools.System.terminal.input(sessionId, {
    input: "yes",
    control: "enter"
});
 
// Get current screen state
const screen = Tools.System.terminal.screen(sessionId);
console.log(screen.data.content);
 
// Clean up
Tools.System.terminal.close(sessionId);
```

### Intent 执行

The `intent()` and `sendBroadcast()` methods provide Android Intent integration:

```
// Launch activity
Tools.System.intent({
    action: "android.intent.action.VIEW",
    uri: "https://example.com",
    package: "com.android.chrome"
});
 
// Start app component
Tools.System.intent({
    component: "com.example.app/.MainActivity",
    type: "activity",
    extras: JSON.stringify({
        "key1": "value1",
        "key2": 123
    })
});
 
// Send broadcast
Tools.System.sendBroadcast({
    action: "com.example.CUSTOM_ACTION",
    package: "com.example.receiver",
    extras: JSON.stringify({
        "data": "payload"
    })
});
```

---

## UI 命名空间

`Tools.UI` 命名空间通过多种权限通道(无障碍服务、ADB、Root)提供 UI 自动化功能。

### UI 自动化方法

方法工具名称描述`getPageInfo()``get_page_info`提取 UI 层级结构`tap()``tap`在坐标位置点击`longPress()``long_press`在坐标位置长按`clickElement()``click_element`通过 resourceId/bounds 点击`setText()``set_input_text`设置输入框文本`swipe()``swipe`滑动手势`pressKey()``press_key`按下系统按键`runSubAgent()``run_ui_subagent`执行多步骤 UI 代理
**clickElement 灵活参数：**

`clickElement()` 方法支持多种调用签名：

```
// By resourceId
Tools.UI.clickElement("com.example:id/button");
 
// By bounds
Tools.UI.clickElement("[100,200][300,400]");
 
// With index
Tools.UI.clickElement("com.example:id/item", 2);
 
// By type and value
Tools.UI.clickElement("resourceId", "com.example:id/button");
Tools.UI.clickElement("className", "android.widget.Button");
 
// Full options object
Tools.UI.clickElement({
    resourceId: "com.example:id/button",
    className: "Button",
    index: 0
});
```

### UI 子代理

`runSubAgent()` 方法执行具有视觉和规划能力的多步骤 UI 自动化代理：

```
const result = Tools.UI.runSubAgent(
    "Open Settings and enable WiFi",
    20,  // max steps
    null, // new agent session
    "com.android.settings" // target app
);
 
// Reuse same agent session (same virtual display)
const result2 = Tools.UI.runSubAgent(
    "Navigate to About Phone",
    10,
    result.data.agentId, // reuse session
    "com.android.settings"
);
```

---

## Memory 命名空间

`Tools.Memory` 命名空间提供对知识图谱记忆系统的访问，支持语义搜索和关系管理。

### Memory API 方法

```
Tools.Memory

Query Operations

CRUD Operations

Link Management

query(q, folder, threshold, limit)

getByTitle(title, chunkIndex)

create(title, content, type, source)

update(oldTitle, updates)

deleteMemory(title)

move(targetFolder, titles, srcFolder)

link(srcTitle, targetTitle, linkType)

queryLinks(linkId, src, target, type)

updateLink(linkId, ...)

deleteLink(linkId, src, target)
```

### Memory 操作

类别方法描述**查询**`query()`基于嵌入相似度的语义搜索`getByTitle()`通过标题检索特定记忆**增删改查**`create()`创建新记忆节点`update()`更新记忆内容/元数据`deleteMemory()`删除记忆节点`move()`在文件夹间移动记忆**链接**`link()`在记忆间创建关系`queryLinks()`查询记忆链接`updateLink()`更新链接元数据`deleteLink()`移除链接
**Memory 链接类型：**

知识图谱关系的常见链接类型：

- `"related"` - 一般关系
- `"causes"` - 因果关系
- `"explains"` - 解释关系
- `"part_of"` - 层级关系
- `"contradicts"` - 冲突信息
- `"similar_to"` - 相似关系

**使用示例：**

```
// Create memories
Tools.Memory.create(
    "Python List Comprehension",
    "[x*2 for x in range(10)]",
    "code/snippet",
    "programming_notes"
);
 
Tools.Memory.create(
    "Python Generator Expression",
    "(x*2 for x in range(10))",
    "code/snippet",
    "programming_notes"
);
 
// Link related concepts
Tools.Memory.link(
    "Python List Comprehension",
    "Python Generator Expression",
    "similar_to",
    0.9,
    "Both use comprehension syntax but generators are lazy"
);
 
// Query for similar concepts
const results = Tools.Memory.query(
    "list iteration techniques",
    "/programming_notes",
    0.7,  // similarity threshold
    5     // max results
);
 
// Query links
const links = Tools.Memory.queryLinks(
    null,
    "Python List Comprehension",
    null,
    "similar_to"
);
```

---

## 附加命名空间

### FFmpeg 命名空间

使用 FFmpeg 进行媒体处理操作：

```
// Execute custom command
Tools.FFmpeg.execute("-i input.mp4 -vcodec h264 output.mp4");
 
// Get system info
Tools.FFmpeg.info();
 
// Convert with options
Tools.FFmpeg.convert(
    "/sdcard/video.mp4",
    "/sdcard/output.webm",
    {
        video_codec: "libvpx",
        audio_codec: "libvorbis",
        bitrate: "1M"
    }
);
```

### Workflow 命名空间

可视化工作流自动化：

```
// Get all workflows
const workflows = Tools.Workflow.getAll();
 
// Create workflow
const workflow = Tools.Workflow.create(
    "Daily Backup",
    "Backup important files daily",
    nodesJSON,
    connectionsJSON
);
 
// Trigger execution
Tools.Workflow.trigger(workflow.data.id);
```

### Tasker 集成

```
Tools.Tasker.triggerEvent({
    task_type: "BACKUP",
    arg1: "/sdcard/data",
    arg2: "full"
});
```

---

## 结果数据结构

工具执行结果遵循一致的结构，包含类型化的数据字段。

### 基础结果结构

```
interface ToolResult {
    toolName: string;
    success: boolean;
    result: ToolResultData;  // Structured data
    error?: string;
}
```

### 常见结果数据类型

数据类使用者关键字段`StringResultData`简单操作`value: string``FileContentData`文件读取`path, content, size, env``DirectoryListingData`目录列表`path, entries: FileEntry[], env``HttpResponseData`HTTP 请求`url, statusCode, headers, content``UIPageResultData`UI 查询`packageName, activityName, uiElements``TerminalCommandResultData`终端执行`command, output, exitCode, sessionId``MemoryQueryResultData`内存查询`memories: MemoryInfo[]`

### 结果数据类型映射

```
read_file_full

list_files

http_request

get_page_info

execute_in_terminal_session

query_memory

ffmpeg_execute

Tool Name

Result Data Type

FileContentData

DirectoryListingData

HttpResponseData

UIPageResultData

TerminalCommandResultData

MemoryQueryResultData

FFmpegResultData

path, content, size, env

path, entries[], env

url, statusCode, headers, content

packageName, activityName, uiElements

command, output, exitCode, sessionId

memories[]

command, returnCode, output, duration
```

### 访问结果数据

```
// File read result
const fileResult = Tools.Files.read("/sdcard/test.txt");
if (fileResult.success) {
    console.log("Path:", fileResult.result.path);
    console.log("Size:", fileResult.result.size);
    console.log("Content:", fileResult.result.content);
    console.log("Env:", fileResult.result.env);
}
 
// HTTP result
const httpResult = Tools.Net.httpGet("https://api.example.com/data");
if (httpResult.success) {
    console.log("Status:", httpResult.result.statusCode);
    console.log("Headers:", JSON.stringify(httpResult.result.headers));
    console.log("Content:", httpResult.result.content);
}
 
// Terminal result
const termResult = Tools.System.terminal.exec(sessionId, "ls -la");
if (termResult.success) {
    console.log("Command:", termResult.result.command);
    console.log("Exit Code:", termResult.result.exitCode);
    console.log("Output:", termResult.result.output);
    console.log("Session:", termResult.result.sessionId);
}
```

---

## V8 引擎集成

JavaScript Tools Bridge 运行在 V8 JavaScript 引擎中，包含 polyfill 和注入的全局对象。

### 运行时初始化流程

```
Tools Bridge
Package Code
Polyfill Injection
V8 Engine
PackageManager
Tools Bridge
Package Code
Polyfill Injection
V8 Engine
PackageManager
getJsToolsDefinition()
Initialize V8 runtime
Inject Tools.* API
Define global Tools object
Define toolCall() function
Load package JavaScript
Execute package code
Tools.Files.read(...)
toolCall("read_file_full", {...})
Bridge to native
Execute via AIToolHandler
Return result
Result object
```

### Polyfill 定义过程

`getJsToolsDefinition()` 函数返回一个 JavaScript 字符串，定义了整个 `Tools` 对象和 `toolCall()` 桥接：

```
// Simplified structure of injected code
var Tools = {
    Files: {
        list: (path, environment) => {
            const params = { path };
            if (environment) params.environment = environment;
            return toolCall("list_files", params);
        },
        // ... other methods
    },
    Net: { /* ... */ },
    System: { /* ... */ },
    // ... other namespaces
};
```

### 参数转换逻辑

polyfill 处理自动参数类型转换：

**布尔值：**

```
// JavaScript boolean → string
if (append !== undefined) params.append = append ? "true" : "false";
```

**对象(headers、extras)：**

```
// JavaScript object → JSON string
if (headers !== undefined && typeof headers === 'object') {
    params.headers = JSON.stringify(headers);
}
```

**数组(paths、modifiers)：**

```
// JavaScript array → JSON string
if (paths !== undefined) {
    params.paths = JSON.stringify(paths.map(p => String(p)));
}
```

**数字：**

```
// JavaScript number → string
if (timeoutMs !== undefined) params.timeout_ms = String(timeoutMs);
```

---

## 类型定义

TypeScript 定义文件为 JavaScript 包提供类型安全：

### 结果类型定义

```
// File operation results
interface FileContentData {
    env: 'android' | 'linux';
    path: string;
    content: string;
    size: number;
}
 
// HTTP results
interface HttpResponseData {
    url: string;
    statusCode: number;
    statusMessage: string;
    headers: Record<string, string>;
    contentType: string;
    content: string;
    size: number;
    cookies: Record<string, string>;
}
 
// Terminal results
interface TerminalCommandResultData {
    command: string;
    output: string;
    exitCode: number;
    sessionId: string;
    timedOut?: boolean;
}
```

### 工具结果映射

```
interface ToolResultMap {
    'read_file_full': FileContentData;
    'list_files': DirectoryListingData;
    'http_request': HttpResponseData;
    'execute_in_terminal_session': TerminalCommandResultData;
    'get_page_info': UIPageResultData;
    'query_memory': MemoryQueryResultData;
    // ... all 40+ tools
}
```

---

## Error Handling

工具通过 `ToolResult.error` 字段返回结构化的错误信息：

```
const result = Tools.Files.read("/invalid/path");
 
if (!result.success) {
    console.error("Tool failed:", result.toolName);
    console.error("Error:", result.error);
    // result.error contains exception message
}
 
// Common error scenarios:
// - File not found
// - Permission denied
// - Network timeout
// - Invalid parameters
// - Tool not registered
```

**最佳实践：**

1. 在访问 `result.result` 之前始终检查 `result.success`
2. 记录 `result.error` 用于调试
3. 为网络操作实现重试逻辑
4. 在工具调用前验证参数
5. 优雅地处理缺失的可选参数

---

## 包集成

JavaScript 包使用 Tools Bridge 实现自定义功能：

```
// package.js
function backupUserData() {
    // Use Files API
    const files = Tools.Files.find("/sdcard/Documents", "*.txt");

    // Create archive
    Tools.Files.zip("/sdcard/Documents", "/sdcard/backup.zip");

    // Upload via HTTP
    const upload = Tools.Net.uploadFile({
        url: "https://backup.example.com/upload",
        files: [{
            field_name: "backup",
            file_path: "/sdcard/backup.zip",
            content_type: "application/zip"
        }]
    });

    // Store memory
    Tools.Memory.create(
        "Backup " + new Date().toISOString(),
        "Backed up " + files.result.files.length + " files",
        "system/backup",
        "automated"
    );

    return upload.success;
}
```

有关包结构和部署的详细信息，请参阅 [Package System](/AAswordman/Operit/5.7-package-system)。

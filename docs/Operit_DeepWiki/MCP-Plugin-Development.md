# MCP 插件开发

本文档为开发与 Operit 的 AI 助手和终端环境集成的 MCP(模型上下文协议)插件提供指导。涵盖插件生命周期、执行环境以及与 Operit 工具系统的集成点。

有关 MCP 插件系统整体架构和市场的信息，请参阅 [MCP Plugin System](/AAswordman/Operit/5.5-terminal-and-shell-tools)。有关创建原生 Android 工具的详细信息，请参阅 [Creating Custom Tools](/AAswordman/Operit/9.2-creating-custom-tools)。有关终端环境的具体信息，请参阅 [Terminal and SSH](/AAswordman/Operit/7.5-android-manifest)。

## 目的和范围

MCP 插件通过提供在 Ubuntu 24 终端环境中作为独立进程运行的外部工具实现来扩展 Operit 的功能。本文档涵盖：

- 理解 MCP 插件执行模型
- 在 Operit 中设置开发环境
- 插件生命周期和会话管理
- 与 Operit 工具调用系统的集成
- 插件开发和测试的最佳实践

本指南假定您熟悉 Python(用于基于 `uvx` 的插件)或 Node.js(用于基于 `npx` 的插件)，并对 MCP 协议有基本了解。

## MCP 插件执行模型

### 架构概述

Operit 中的 MCP 插件是在嵌入式 JavaScript 引擎中执行的 JavaScript/TypeScript 包。它们不是外部 MCP 服务器，而是通过 `Tools` API 访问原生 Android 功能的集成脚本。

**MCP 包架构**

```
Terminal Integration

Native Tool Execution

JavaScript Runtime

Package System

AI Service Layer

EnhancedAIService

AIToolHandler

SystemPromptConfig

PackageManager

MCPRepository

Package METADATA
(JSON in comment)

JavaScript Engine
(V8/Rhino)

Tools API
(Files, Net, System, UI)

Global Functions
(toolCall, complete, getEnv)

StandardFileSystemTools

HttpTools

Shell, Apps, Device

StandardUITools

MCPSharedSession

TerminalManager

Terminal Command
Execution
```

### 包结构

MCP 插件是嵌入了元数据的 JavaScript/TypeScript 文件。元数据在文件顶部的 JSON 注释块中定义：

```
/* METADATA
{
    "name": "package_name",
    "description": "Package description for AI",
    "enabledByDefault": true,
    "env": ["API_KEY_NAME"],  // Optional environment variables
    "tools": [
        {
            "name": "tool_name",
            "description": "Tool description for AI to understand when to use it",
            "parameters": [
                {
                    "name": "param_name",
                    "description": "Parameter description",
                    "type": "string",
                    "required": true
                }
            ]
        }
    ]
}
*/
```

包代码紧随此元数据块之后，并实现工具处理程序。

## 开发环境设置

### 插件开发的工作区结构

在 Operit 中开发 MCP 插件时,您将在一个可以访问完整 Ubuntu 24 环境的工作区中工作：

```
Tool Execution

Terminal Access

Workspace File System

/data/data/.../files/workspace/{chatId}

plugin-source/

node_modules/ or
venv/ or pycache/

package.json or
requirements.txt

.gitignore

ComputerScreen
Component

rememberTerminalEnv()

TerminalManager
.getInstance()

AIToolHandler
.executeTool()

File System Tools
(read/write/list)

Shell Execution
Tools
```

**MCP 插件开发的工作区组织**

### 项目类型选择

Operit 提供了预配置的项目模板,其中包含必要的运行时环境：

**Node.js/TypeScript 项目**(推荐用于 JavaScript/TypeScript MCP 服务器)

```
{
  "projectType": "typescript",
  "server": {
    "enabled": false,
    "autoStart": false
  },
  "commands": [
    {
      "id": "pnpm_install",
      "label": "pnpm install",
      "command": "pnpm install",
      "workingDir": ".",
      "shell": true
    },
    {
      "id": "pnpm_build",
      "label": "pnpm build",
      "command": "pnpm build",
      "workingDir": ".",
      "shell": true
    }
  ]
}
```

**Python 项目**(用于基于 Python 的 MCP 服务器)

```
{
  "projectType": "python",
  "commands": [
    {
      "id": "venv_create",
      "label": "创建虚拟环境",
      "command": "python -m venv venv",
      "workingDir": ".",
      "shell": true
    },
    {
      "id": "pip_install",
      "label": "安装依赖",
      "command": "pip install -r requirements.txt",
      "workingDir": ".",
      "shell": true
    }
  ]
}
```

### 文件系统访问

MCP 插件可以通过与 AI 相同的工具访问工作区文件系统：
工具用途权限级别`list_files`列出目录内容STANDARD`read_file_full`读取完整文件内容STANDARD`write_file`写入文件内容STANDARD`create_directory`创建新目录STANDARD`delete_file`删除文件/目录STANDARD
这些工具通过 `AIToolHandler` 暴露，可以通过编程方式调用，或由管理插件开发的 AI 代理调用。

## 插件开发工作流

### 步骤 1：初始化工作区

使用适当的项目类型创建工作区：

```
TemplateAssets
FileSystem
WorkspaceUtils
WorkspaceSetup
User
TemplateAssets
FileSystem
WorkspaceUtils
WorkspaceSetup
User
Select project type
(typescript/python/node)
createAndGetDefaultWorkspace()
(context, chatId, projectType)
Create workspace dir
/files/workspace/{chatId}
copyTemplateFiles()
(templates/{projectType})
Copy template files
Create .operit/config.json
Return workspace path
Workspace bound
```

**工作区初始化序列**

### 步骤 2：设置 TypeScript 开发环境

MCP 包使用 JavaScript 或 TypeScript 编写。对于 TypeScript 开发：

```
# Install TypeScript tooling in the workspace
pnpm add -D typescript @types/node
 
# Create tsconfig.json
pnpm exec tsc --init
 
# Install type definitions for Operit APIs
# (These are provided in the examples/types/ directory)
```

将类型定义文件从 `examples/types/` 复制到你的项目：

```
# Copy type definitions
cp -r /path/to/operit/examples/types ./types
```

这些命令可以通过 `ComputerScreen` 访问的终端执行，或通过 `.operit/config.json` 中定义的工作区命令按钮执行。

### 步骤 3：实现包工具

MCP 包是定义 AI 可访问工具的 JavaScript/TypeScript 模块。以下是完整的示例结构：

**基础包模板(TypeScript)：**

```
/* METADATA
{
    "name": "my_tools",
    "description": "A set of custom tools for specific tasks",
    "enabledByDefault": true,
    "env": ["MY_API_KEY"],  // Optional: required environment variables
    "tools": [
        {
            "name": "process_data",
            "description": "Process data and return results. Use when user needs data processing.",
            "parameters": [
                {
                    "name": "input_data",
                    "description": "The data to process",
                    "type": "string",
                    "required": true
                },
                {
                    "name": "format",
                    "description": "Output format (json, text, csv)",
                    "type": "string",
                    "required": false
                }
            ]
        }
    ]
}
*/
 
// Main package implementation
const myTools = (function() {

    /**
     * Tool handler for process_data
     */
    async function process_data(params: { input_data: string; format?: string }) {
        try {
            const { input_data, format = "text" } = params;

            // Validate input
            if (!input_data || input_data.trim().length === 0) {
                throw new Error("input_data is required");
            }

            // Process the data
            const result = await performProcessing(input_data, format);

            // Return success
            complete({
                success: true,
                message: "Data processed successfully",
                data: result
            });
        } catch (error: any) {
            // Return error
            complete({
                success: false,
                message: `Processing failed: ${error.message}`,
                error_stack: error.stack
            });
        }
    }

    /**
     * Helper function to perform actual processing
     */
    async function performProcessing(data: string, format: string): Promise<any> {
        // Example: Use Tools API to read/write files
        const tempFile = "/sdcard/Download/temp_data.txt";
        await Tools.Files.write(tempFile, data);

        // Example: Make HTTP request if needed
        const response = await Tools.Net.http({
            url: "https://api.example.com/process",
            method: "POST",
            body: { data }
        });

        // Process and format result
        return formatOutput(response.content, format);
    }

    function formatOutput(content: string, format: string): string {
        switch (format) {
            case "json":
                return JSON.stringify(JSON.parse(content), null, 2);
            case "csv":
                return convertToCsv(content);
            default:
                return content;
        }
    }

    // Export tool handlers
    return {
        process_data
    };
})();
 
// Make handlers available to the tool execution system
if (typeof exports !== 'undefined') {
    exports.process_data = myTools.process_data;
}
```

**关键组件：**

1. **METADATA 块**：为 AI 定义包元数据和工具签名
2. **工具处理器**：实现每个工具逻辑的异步函数
3. **complete() 函数**：向 AI 返回结果(成功或错误)
4. **Tools API 访问**：使用 `Tools.Files`、`Tools.Net`、`Tools.System` 等进行原生操作
5. **错误处理**：将操作包装在 try-catch 中并返回结构化错误

### 步骤 4：本地测试包

**将 TypeScript 编译为 JavaScript：**

```
# In your workspace directory
pnpm exec tsc my_package.ts
```

这将生成 `my_package.js`，可以被包系统加载。

**通过 AI 聊天测试：**

1. 将编译后的包文件放置在适当的目录中(或使用 `use_package` 指定本地路径)
2. 在聊天中，要求 AI 使用你的包：

```
Use the my_tools package to process this data: [your test data]

```

3. AI 将调用 `use_package` 工具，该工具会加载你的包并使其工具可用
4. 然后 AI 可以直接调用你的工具

**手动测试：**

你也可以在工作区终端或通过测试脚本直接测试工具函数：

```
// test_package.js
async function testProcessData() {
    const result = await myTools.process_data({
        input_data: "test data",
        format: "json"
    });
    console.log("Result:", result);
}
 
testProcessData();
```

## 与 Operit 工具系统集成

### 工具注册和执行流程

**包激活和工具注册**

```
Tool Execution

System Prompt Updates

Package System

AI Conversation

AI decides to use package

use_package tool invocation

Package tool invocation

PackageManager
.executeUsePackageTool()

PackageTools
(name, description,
parameters, handler)

JavaScript Engine

SystemPromptConfig
.getSystemPrompt()

Available Packages List

Active Package Tools

AIToolHandler
.executeTool()

Package Tool Handler
(async function)

complete() callback

ToolResult
```

**Operit 中的包生命周期**

1. **发现阶段**：`PackageManager` 扫描可用包并在系统提示中列出它们
2. **激活阶段**：AI 使用包名称调用 `use_package` 工具
3. **注册阶段**：`PackageManager.executeUsePackageTool()` 加载包并注册其工具
4. **执行阶段**：AI 现在可以通过 `AIToolHandler` 直接调用包工具
5. **结果阶段**：工具结果通过 `complete()` 函数返回并发送回 AI

## 可用于包开发的 API

### Tools 命名空间概述

包可以访问 `Tools` 命名空间，该命名空间提供原生 Android 功能：

**Tools API 结构**

```
Memory Operations

UI Operations

System Operations

Network Operations

File Operations

Tools API

Tools (Global Object)

Tools.Files

list(path, environment?)

read(path | options)

write(path, content, append?, environment?)

deleteFile(path, recursive?, environment?)

grep(path, pattern, options)

grepContext(path, intent, options)

Tools.Net

http(options)

visit(url | params)

uploadFile(options)

cookies.get/set/clear(domain)

Tools.System

getDeviceInfo()

usePackage(packageName)

terminal.create/exec/close()

shell(command)

intent(options)

Tools.UI

getPageInfo()

tap(x, y)

clickElement(params)

setText(text, resourceId?)

swipe(startX, startY, endX, endY)

Tools.Memory

query(query, options)

getByTitle(title, options)

create(title, content, options)

update(oldTitle, updates)
```

### 主要 API 类别

**1. File System API (`Tools.Files`)**

提供全面的文件操作，支持 Android 和 Linux 环境：

```
// Read file with multiple options
const content = await Tools.Files.read({
    path: "/sdcard/test.txt",
    environment: "android",  // or "linux"
    intent: "describe the image",  // for image files
    direct_image: false
});
 
// Search code patterns
const matches = await Tools.Files.grep("/sdcard/MyProject", "ViewModel", {
    file_pattern: "*.kt",
    case_insensitive: false,
    max_results: 50
});
 
// Context-aware search
const relevant = await Tools.Files.grepContext("/sdcard/project",
    "authentication logic", {
    file_pattern: "*.ts",
    max_results: 10
});
```

**2. Network API (`Tools.Net`)**

HTTP 请求、网页抓取和 cookie 管理：

```
// HTTP request
const response = await Tools.Net.http({
    url: "https://api.example.com/data",
    method: "POST",
    headers: { "Authorization": "Bearer token" },
    body: { key: "value" }
});
 
// File upload
const upload = await Tools.Net.uploadFile({
    url: "https://upload.example.com",
    files: [{ path: "/sdcard/file.jpg", field: "image" }],
    form_data: { description: "My image" }
});
 
// Cookie management
await Tools.Net.cookies.set("example.com", "session=xyz");
const cookies = await Tools.Net.cookies.get("example.com");
```

**3. System API (`Tools.System`)**

设备信息、shell 命令和终端会话：

```
// Get device info
const device = await Tools.System.getDeviceInfo();
 
// Terminal session (persistent)
const session = await Tools.System.terminal.create("my_session");
const result = await Tools.System.terminal.exec(
    session.sessionId,
    "ls -la /home"
);
 
// One-off shell command
const output = await Tools.System.shell("echo Hello");
```

**4. UI Automation API (`Tools.UI`)**

与 Android UI 元素交互：

```
// Get current screen info
const page = await Tools.UI.getPageInfo();
 
// Click element by resource ID
await Tools.UI.clickElement({
    resourceId: "com.example:id/button",
    index: 0
});
 
// Tap coordinates
await Tools.UI.tap(500, 1000);
 
// Input text
await Tools.UI.setText("Hello World", "com.example:id/input");
```

### 全局函数

**`toolCall(toolName: string, params: object): Promise<any>`**

直接调用任何已注册的工具(由 `Tools` API 内部使用)：

```
const result = await toolCall("read_file", { path: "/sdcard/file.txt" });
```

**`complete(result: object): void`**

从工具处理器返回结果：

```
complete({
    success: true,
    message: "Operation completed",
    data: resultData
});
 
// Or for errors
complete({
    success: false,
    message: "Operation failed: " + error.message,
    error_stack: error.stack
});
```

**`getEnv(key: string): string | null`**

访问包元数据中定义的环境变量：

```
const apiKey = getEnv("MY_API_KEY");
if (!apiKey) {
    throw new Error("MY_API_KEY not configured");
}
```

**`OkHttp.newClient()`**

用于复杂网络操作的高级 HTTP 客户端：

```
const client = OkHttp.newClient();
const request = client
    .newRequest()
    .url("https://api.example.com")
    .method("POST")
    .headers({ "Content-Type": "application/json" })
    .body(JSON.stringify(data), "json");
 
const response = await request.build().execute();
console.log(response.statusCode, response.content);
```

## 实践示例

### 示例 1：文件转换器包

此示例展示了一个使用终端命令在格式之间转换文件的完整包：

```
/* METADATA
{
    "name": "file_converter",
    "description": "Convert files between formats (audio/video/image/document)",
    "enabledByDefault": true,
    "tools": [
        {
            "name": "convert_file",
            "description": "Convert file format using ffmpeg, imagemagick, or pandoc",
            "parameters": [
                { "name": "input_path", "type": "string", "required": true },
                { "name": "output_path", "type": "string", "required": true },
                { "name": "options", "type": "string", "required": false }
            ]
        }
    ]
}
*/
 
const fileConverter = (function () {
    let terminalSessionId: string | null = null;

    async function getTerminalSessionId(): Promise<string> {
        if (terminalSessionId) {
            return terminalSessionId;
        }
        const session = await Tools.System.terminal.create("file_converter_session");
        terminalSessionId = session.sessionId;
        return terminalSessionId;
    }

    async function executeTerminalCommand(command: string) {
        const sessionId = await getTerminalSessionId();
        return await Tools.System.terminal.exec(sessionId, command);
    }

    async function checkAndInstall(toolName: string, packageName: string): Promise<boolean> {
        const checkCmd = `command -v ${toolName}`;
        const checkResult = await executeTerminalCommand(checkCmd);

        if (checkResult.exitCode === 0) {
            console.log(`${toolName} already installed`);
            return true;
        }

        // Install package
        console.log(`Installing ${packageName}...`);
        const installResult = await executeTerminalCommand(`apt-get install -y ${packageName}`);

        if (installResult.exitCode !== 0) {
            throw new Error(`Failed to install ${toolName}`);
        }

        return true;
    }

    async function convert_file(params: ConvertFileParams) {
        const { input_path, output_path, options } = params;

        // Check input file exists
        const fileExists = await Tools.Files.exists(input_path);
        if (!fileExists.exists) {
            throw new Error(`Input file not found: ${input_path}`);
        }

        // Determine converter based on file extensions
        const converter = getConverterInfo(input_path, output_path, options);

        // Ensure tool is installed
        await checkAndInstall(converter.tool, converter.pkg);

        // Execute conversion
        console.log(`Converting: ${converter.command}`);
        const result = await executeTerminalCommand(converter.command);

        if (result.exitCode !== 0) {
            throw new Error(`Conversion failed: ${result.output}`);
        }

        return {
            output_path: output_path,
            details: `File converted successfully`,
            terminal_output: result.output
        };
    }

    return { convert_file };
})();
 
// Export for tool system
if (typeof exports !== 'undefined') {
    exports.convert_file = fileConverter.convert_file;
}
```

**关键技术：**

- 用于持久化 shell 环境的终端会话管理
- 工具安装检查和自动安装
- 使用 `Tools.Files.exists()` 进行文件存在性验证
- 带有适当错误处理的命令执行

### 示例 2：图像生成包

此示例演示了带有进度轮询的 HTTP API 集成：

```
/* METADATA
{
  "name": "nanobanana_draw",
  "description": "Generate images from text prompts using AI",
  "env": ["NANOBANANA_API_KEY"],
  "tools": [
    {
      "name": "draw_image",
      "description": "Generate image from text prompt",
      "parameters": [
        { "name": "prompt", "type": "string", "required": true },
        { "name": "aspect_ratio", "type": "string", "required": false }
      ]
    }
  ]
}
*/
 
const nanobananaDraw = (function () {
    const client = OkHttp.newClient();
    const API_ENDPOINT = "https://grsai.dakka.com.cn/v1/draw/nano-banana";
    const RESULT_ENDPOINT = "https://grsai.dakka.com.cn/v1/draw/result";
    const DRAWS_DIR = "/sdcard/Download/Operit/draws";

    function getApiKey(): string {
        const apiKey = getEnv("NANOBANANA_API_KEY");
        if (!apiKey) {
            throw new Error("NANOBANANA_API_KEY not configured");
        }
        return apiKey;
    }

    async function callNanobananaApi(params: DrawParams): Promise<string> {
        const apiKey = getApiKey();
        const body = {
            model: params.model || "nano-banana-pro",
            prompt: params.prompt,
            webHook: "-1",  // Async mode: return task ID
            shutProgress: false
        };

        if (params.aspect_ratio) {
            body.aspectRatio = params.aspect_ratio;
        }

        const request = client
            .newRequest()
            .url(API_ENDPOINT)
            .method("POST")
            .headers({
                "Authorization": `Bearer ${apiKey}`,
                "content-type": "application/json"
            })
            .body(JSON.stringify(body), "json");

        const response = await request.build().execute();

        if (!response.isSuccessful()) {
            throw new Error(`API call failed: ${response.statusCode}`);
        }

        const parsed = JSON.parse(response.content);
        return parsed.data.id;  // Return task ID
    }

    async function pollForResult(taskId: string): Promise<string> {
        const apiKey = getApiKey();
        const startTime = Date.now();
        const MAX_WAIT = 300000;  // 5 minutes

        while (Date.now() - startTime < MAX_WAIT) {
            const request = client
                .newRequest()
                .url(RESULT_ENDPOINT)
                .method("POST")
                .headers({ "Authorization": `Bearer ${apiKey}` })
                .body(JSON.stringify({ id: taskId }), "json");

            const response = await request.build().execute();
            const parsed = JSON.parse(response.content);

            if (parsed.data.status === "succeeded") {
                return parsed.data.results[0].url;
            } else if (parsed.data.status === "failed") {
                throw new Error("Generation failed");
            }

            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        throw new Error("Task timeout");
    }

    async function draw_image(params: DrawParams) {
        try {
            // Ensure output directory exists
            await Tools.Files.mkdir(DRAWS_DIR, true);

            // Submit generation task
            console.log("Submitting generation task...");
            const taskId = await callNanobananaApi(params);

            // Poll for completion
            console.log("Waiting for generation...");
            const imageUrl = await pollForResult(taskId);

            // Download generated image
            const fileName = `${params.prompt.substring(0, 40)}_${Date.now()}.png`;
            const localPath = `${DRAWS_DIR}/${fileName}`;

            await Tools.Files.download(imageUrl, localPath);

            complete({
                success: true,
                message: `Image saved to ${localPath}`,
                data: { path: localPath, url: imageUrl }
            });
        } catch (error: any) {
            complete({
                success: false,
                message: `Failed: ${error.message}`,
                error_stack: error.stack
            });
        }
    }

    return { draw_image };
})();
 
if (typeof exports !== 'undefined') {
    exports.draw_image = nanobananaDraw.draw_image;
}
```

**关键技术：**

- 使用 `getEnv()` 访问环境变量
- 使用 `OkHttp` 的高级 HTTP 客户端
- 异步任务轮询模式
- 使用 `Tools.Files.download()` 下载文件
- 使用 `Tools.Files.mkdir()` 创建目录

## 本地 Web 服务器访问

对于基于 Web 的插件或开发服务器，Operit 提供了本地 Web 服务器基础设施：
服务器实例端口根路径用途`WORKSPACE`8093工作区目录提供工作区文件服务，预览 Web 项目`COMPUTER`8094Ubuntu 系统路径终端环境 Web 界面
MCP 插件可以利用这些服务器实现基于 Web 的 UI 或 API：

```
# MCP plugin can return web URLs
async def handle_start_dev_server(arguments: dict):
    port = 8093  # Workspace server port
    return {
        "content": [{
            "type": "text",
            "text": f"Development server available at http://localhost:{port}"
        }]
    }
```

## 终端会话管理

### 共享会话模型

MCP 插件在由 `TerminalManager` 管理的共享终端会话中运行：

```
Workspace Integration

Plugin Execution Context

Session Lifecycle

TerminalManager
getInstance()

Session State
(working directory,
environment vars)

proot-distro
Ubuntu 24 rootfs

MCP Shared Session

uvx process
(Python MCP server)

npx process
(Node.js MCP server)

/files/workspace/{chatId}

cwd in terminal

File System Access
```

**MCP 插件的终端会话架构**

共享会话的关键特性：

- **持久化状态**：工作目录和环境变量在插件调用之间保持持久化
- **工作区上下文**：绑定时终端自动切换到工作区目录
- **包缓存**：已安装的包(pip、pnpm)在 Ubuntu 环境中被缓存
- **进程隔离**：每个插件在自己的进程中运行，但共享终端环境

## 最佳实践

### 插件设计

**1. 保持插件专注且单一用途**

每个 MCP 插件应该暴露一小组相关工具，而不是成为一个单体服务。

**2. 使用适当的错误处理**

```
async def handle_call_tool(name: str, arguments: dict):
    try:
        # Tool implementation
        result = perform_operation(arguments)
        return {"content": [{"type": "text", "text": str(result)}]}
    except FileNotFoundError as e:
        return {
            "content": [{
                "type": "text",
                "text": f"Error: File not found - {str(e)}"
            }],
            "isError": True
        }
    except Exception as e:
        return {
            "content": [{
                "type": "text",
                "text": f"Unexpected error: {str(e)}"
            }],
            "isError": True
        }
```

**3. 提供清晰的工具描述**

工具描述应足够详细，以便 AI 理解何时以及如何使用它们：

```
{
  name: "search_code",
  description: "Search for code patterns in the workspace. Use when the user asks to find specific code constructs, function definitions, or usage patterns. Supports regex patterns.",
  inputSchema: {
    type: "object",
    properties: {
      pattern: {
        type: "string",
        description: "Regex pattern to search for"
      },
      file_extensions: {
        type: "array",
        items: { type: "string" },
        description: "File extensions to include (e.g., ['.ts', '.js'])"
      }
    },
    required: ["pattern"]
  }
}
```

### 安全注意事项

**1. 文件访问边界**

始终验证文件路径以确保它们保持在工作空间内：

```
import os
from pathlib import Path
 
def validate_workspace_path(workspace_root: str, requested_path: str) -> bool:
    """Ensure requested path is within workspace"""
    workspace = Path(workspace_root).resolve()
    target = Path(workspace_root, requested_path).resolve()
    return str(target).startswith(str(workspace))
```

**2. 依赖管理**

指定确切的依赖版本以确保可重现性：

```
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "1.0.0",
    "specific-library": "2.3.1"
  }
}
```

**3. 资源限制**

注意内存和 CPU 使用情况，特别是对于长时间运行的操作。考虑实现超时和进度报告。

### 性能优化

**1. 利用缓存**

存储频繁访问的数据以避免冗余操作：

```
// Cache directory in workspace
const CACHE_DIR = "/sdcard/Download/.cache";
 
async function getCachedData(key: string): Promise<string | null> {
    const cachePath = `${CACHE_DIR}/${key}.json`;
    const exists = await Tools.Files.exists(cachePath);

    if (exists.exists) {
        const cached = await Tools.Files.read(cachePath);
        return cached.content;
    }

    return null;
}
 
async function setCachedData(key: string, data: string): Promise<void> {
    await Tools.Files.mkdir(CACHE_DIR, true);
    const cachePath = `${CACHE_DIR}/${key}.json`;
    await Tools.Files.write(cachePath, data);
}
```

**2. 批量文件操作**

使用 `grep_code` 或 `find_files` 而不是单独的文件读取：

```
// Bad: Read files one by one
const files = await Tools.Files.list("/sdcard/project");
for (const file of files.entries) {
    if (file.name.endsWith('.ts')) {
        const content = await Tools.Files.read(`/sdcard/project/${file.name}`);
        // process content
    }
}
 
// Good: Use grep to search all at once
const matches = await Tools.Files.grep("/sdcard/project", "export class", {
    file_pattern: "*.ts",
    max_results: 100
});
```

**3. 重用终端会话**

为每个包创建一个终端会话并重用它：

```
let sessionId: string | null = null;
 
async function getSession(): Promise<string> {
    if (!sessionId) {
        const session = await Tools.System.terminal.create("my_package_session");
        sessionId = session.sessionId;
    }
    return sessionId;
}
 
async function runCommand(command: string) {
    const sid = await getSession();
    return await Tools.System.terminal.exec(sid, command);
}
```

### 测试策略

**1. 工具处理器的单元测试**

创建一个测试文件来导入和测试你的工具函数：

```
// test_my_package.ts
async function testProcessData() {
    try {
        const result = await myTools.process_data({
            input_data: "test data",
            format: "json"
        });

        console.log("Test passed:", result);
    } catch (error) {
        console.error("Test failed:", error);
    }
}
 
testProcessData();
```

在终端中运行测试：

```
pnpm exec ts-node test_my_package.ts
```

**2. 模拟 Tools API 进行测试**

```
// mock_tools.ts
const MockTools = {
    Files: {
        read: async (path: string) => ({
            content: "mock content",
            size: 12
        }),
        write: async (path: string, content: string) => ({
            successful: true,
            details: "Mock write"
        })
    },
    Net: {
        http: async (options: any) => ({
            statusCode: 200,
            content: JSON.stringify({ result: "mock" })
        })
    }
};
 
// Use in tests
global.Tools = MockTools;
```

**3. 在 Operit 中进行端到端测试**

1. 将编译后的 `.js` 文件放置在包目录中
2. 在聊天中，要求 AI 使用你的包：

```
Use the my_tools package

```

3. 测试每个工具：

```
Use process_data to convert this JSON to CSV: {"a":1,"b":2}

```

4. 通过文件浏览器验证结果并检查文件系统更改

**4. 使用 console.log 调试**

在整个包中添加日志记录：

```
console.log("Starting operation...");
console.log("Input:", JSON.stringify(params));
console.log("Result:", result);
```

当包执行时，日志会出现在终端输出中。

## 部署和分发

### 包文件结构

一个完整的包包含：

```
my_package/
├── my_package.ts          # Source TypeScript
├── my_package.js          # Compiled JavaScript (what gets loaded)
├── package.json           # Optional: npm metadata
├── README.md              # Package documentation
└── types/                 # Optional: local type definitions
    └── index.d.ts

```

### 编译

将 TypeScript 编译为 JavaScript：

```
# Single file
pnpm exec tsc my_package.ts
 
# With custom tsconfig
pnpm exec tsc --project tsconfig.json
 
# Watch mode for development
pnpm exec tsc --watch my_package.ts
```

**重要**：包系统仅加载 `.js` 文件。确保其中包含 METADATA 注释块。

### 本地安装

用于开发和测试：

**选项 1：直接放置文件**

```
# Copy to Operit's package directory
cp my_package.js /data/data/com.ai.assistance.operit/files/packages/
```

**选项 2：从工作区使用**

将包放置在工作区中并引用它：

```
// In chat
Use the my_package package from ./packages/my_package.js
```

### 发布到 MCP Marketplace

当你的包稳定后：

1. **准备包元数据**：确保 METADATA 块完整且准确
2. **全面测试**：在各种场景下测试所有工具
3. **编写使用文档**：创建包含示例的 README
4. **提交包**：遵循 MCP marketplace 提交流程(具体实现方式)

### 版本管理

在 METADATA 中包含版本：

```
/* METADATA
{
    "name": "my_package",
    "version": "1.2.0",
    "description": "Package description",
    ...
}
*/
```

维护变更日志：

```
# Changelog
 
## [1.2.0] - 2025-01-20
### Added
- New `analyze_project` tool
- Support for Python projects
 
### Fixed
- File path resolution for Linux environment
- Error handling in HTTP requests
 
### Changed
- Improved terminal session management
```

## 故障排除

### 常见问题

问题原因解决方案包未加载METADATA 中存在语法错误验证 METADATA 块中的 JSON包未加载缺少编译的 `.js` 文件运行 `tsc` 编译 TypeScript工具未显示包未激活使用 `use_package` 工具激活`complete()` 未定义不在包执行上下文中仅在工具处理程序中使用文件访问被拒绝路径无效检查路径权限，使用工作区路径`getEnv()` 返回 null环境变量未配置添加到 METADATA `env` 数组，在设置中配置终端命令失败会话未创建使用 `Tools.System.terminal.create()` 创建会话HTTP 请求失败网络/CORS 问题检查网络连接、API 端点

### 调试技巧

**1. 广泛使用 console.log**

```
async function my_tool(params: any) {
    console.log("=== Tool Execution Start ===");
    console.log("Parameters:", JSON.stringify(params, null, 2));

    try {
        const result = await performOperation(params);
        console.log("Operation result:", result);

        complete({ success: true, data: result });
    } catch (error: any) {
        console.error("Error occurred:", error.message);
        console.error("Stack:", error.stack);

        complete({
            success: false,
            message: error.message,
            error_stack: error.stack
        });
    }
}
```

日志会作为工具执行输出显示在 AI 聊天中。

**2. 单独测试 Tools API 调用**

在终端中创建测试脚本：

```
// test_tools.js
(async function() {
    console.log("Testing Files.read...");
    const result = await Tools.Files.read("/sdcard/test.txt");
    console.log("Result:", result);
})();
```

运行命令：`node test_tools.js`

**3. 检查包注册**

在聊天中询问："有哪些可用的包？"

AI 会列出可用的包。如果你的包未列出，请检查：

- 文件位于正确位置
- METADATA 块是有效的 JSON
- 文件具有 `.js` 扩展名

**4. 验证文件路径**

```
// Check if file exists before reading
const exists = await Tools.Files.exists(path);
if (!exists.exists) {
    throw new Error(`File not found: ${path}`);
}
```

**5. 监控终端输出**

使用 `ComputerScreen` 观察实时执行：

- 终端命令及其输出
- 包加载状态
- JavaScript 运行时错误

## 其他资源

- **MCP 协议规范**：
- **Python MCP SDK**：
- **TypeScript MCP SDK**：
- **Operit 工具系统**：参见了解原生工具开发
- **终端环境**：参见了解高级终端使用
- **工作区模板**：查看 `app/src/main/assets/templates/` 目录中的模板文件

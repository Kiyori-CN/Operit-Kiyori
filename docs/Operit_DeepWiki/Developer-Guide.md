# 开发者指南

本指南为扩展 Operit 或为核心代码库做贡献的开发者提供技术文档。涵盖项目设置、扩展机制(原生工具、JavaScript 工具、MCP 插件)以及系统中使用的架构模式。

**前置要求：** 建议熟悉 Kotlin、Android 开发和 Jetpack Compose。终端用户文档请参阅 [概述](/AAswordman/Operit/1-overview)。AI 服务内部机制请参阅 [核心 AI 服务](/AAswordman/Operit/2-core-ai-services)。

## 项目结构与设置

### 模块架构

Operit 组织为多模块 Android 项目：

**模块图：项目结构**

```
Operit Project Structure

main application

terminal subsystem

MNN AI runtime

animation engine

depends on

depends on

depends on

git submodule

git submodule

Operit (Root)

app module

terminal module

mnn module

dragonbones module

OperitTerminalCore

MNN C++ Library
```

模块用途核心组件`app`主应用逻辑UI、AI 服务、工具系统、聊天管理`terminal`Ubuntu 24 终端环境终端模拟、SSH、文件系统提供者`mnn`MNN 推理引擎本地 AI 模型执行`dragonbones`动画渲染桌面宠物动画

### 构建配置

Operit 使用 Gradle 8.0+ 和 Kotlin DSL。构建配置位于 `app/build.gradle.kts`。

**Gradle 构建配置结构**

```
applies

configures

declares

defines

com.android.application

org.jetbrains.kotlin.android

org.jetbrains.kotlin.plugin.serialization

org.jetbrains.kotlin.kapt

io.objectbox

namespace

compileSdk

defaultConfig {}

signingConfigs {}

buildTypes {}

compileOptions {}

packaging {}

applicationId

minSdk

targetSdk

versionCode

versionName

ndk.abiFilters

implementation

implementation

implementation

implementation

kapt

force

app/build.gradle.kts

Plugins Block

android {} Block

dependencies {} Block

configurations.all {}

AndroidPlugin

KotlinPlugin

SerializationPlugin

KaptPlugin

ObjectBoxPlugin

com.ai.assistance.operit

34

DefaultConfig

SigningConfigs

BuildTypes

CompileOptions

Packaging

com.ai.assistance.operit

26

34

33

1.7.0

arm64-v8a

Jetpack, Compose, Kotlin

ML Kit, MNN, ONNX

Room, ObjectBox, DataStore

OkHttp, Retrofit, MCP

Room Compiler, ObjectBox

kotlinx-serialization-json:1.5.1
ktor-client:2.3.5
bcprov-jdk18on:1.78
```

**核心构建配置：**
属性值位置应用 ID`com.ai.assistance.operit``defaultConfig.applicationId`命名空间`com.ai.assistance.operit``android.namespace`编译 SDK34`android.compileSdk`最低 SDK26 (Android 8.0)`defaultConfig.minSdk`目标 SDK34`defaultConfig.targetSdk`版本号33`defaultConfig.versionCode`版本名称`"1.7.0"``defaultConfig.versionName`JVM 目标17`compileOptions.sourceCompatibility`Compose 编译器1.5.8`composeOptions.kotlinCompilerExtensionVersion`支持的 ABIarm64-v8a`ndk.abiFilters`
**构建特性：**

- `buildFeatures.compose = true` - 启用 Jetpack Compose
- `buildFeatures.aidl = true` - 启用 AIDL 服务接口
- `buildFeatures.buildConfig = true` - 生成 BuildConfig 类
- `isCoreLibraryDesugaringEnabled = true` - 在旧版 Android 上启用 Java 8+ API

**签名配置：**
Debug 和 release 构建使用来自 `release.keystore` 的相同签名配置：

```
signingConfigs {
    create("release") {
        storeFile = file("release.keystore")
        storePassword = "operit"
        keyAlias = "key0"
        keyPassword = "operit"
    }
}
```

**构建变体：**

- `debug` - 使用 release 签名以便于测试
- `release` - 使用 release 签名的生产构建
- `nightly` - 自动化构建，输出 `app-nightly.apk`

**关键依赖：**

- Jetpack Compose BOM 用于 UI 组件
- Room + ObjectBox 用于数据持久化
- ML Kit 用于文本识别和 OCR
- OkHttp/Retrofit 用于网络请求
- Shizuku API 用于提升权限
- MCP SDK 用于 Model Context Protocol 支持

### 开发环境设置

**前置要求：**

- Android Studio Iguana (2023.2.1) 或更高版本
- JDK 17(在 `compileOptions` 中配置)
- 支持子模块的 Git
- Android SDK，包含 API level 26-34
- ADB (Android Debug Bridge)
- 运行 Android 8.0+ 的设备或模拟器(arm64-v8a 架构)

**设置步骤：**

1. **克隆仓库及子模块：**

```
git clone --recursive https://github.com/AAswordman/Operit.git
cd Operit
```

`--recursive` 标志会初始化子模块：

- `terminal/OperitTerminalCore` - 终端模拟子系统
- `mnn/MNN` - MNN 推理库

2. **下载原生依赖：**

根据 README，必须从 [Google Drive]下载额外依赖。这些包括预编译的原生库：

- MNN 推理引擎
- 终端子系统二进制文件
- 其他原生依赖

3. **配置 local.properties：**

在项目根目录创建 `local.properties`：

```
sdk.dir=/path/to/android/sdk
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

GitHub OAuth 凭据用于启用 GitHub 集成功能，通过以下方式注入到 `BuildConfig`：

```
buildConfigField("String", "GITHUB_CLIENT_ID", ...)
buildConfigField("String", "GITHUB_CLIENT_SECRET", ...)
```

4. **同步 Gradle 依赖：**

```
./gradlew clean
./gradlew --refresh-dependencies
```

这将解析依赖项，包括：

- Jetpack Compose BOM (2024.02.00)
- ML Kit 文本识别库
- Room 和 ObjectBox 数据库
- OkHttp、Retrofit、JSoup
- Shizuku API、libsu
- MCP SDK(带版本覆盖)
- 文档处理(Apache POI、iText、PDFBox)

5. **构建项目：**

```
# Debug build
./gradlew assembleDebug
 
# Release build (signed with release.keystore)
./gradlew assembleRelease
 
# Nightly variant
./gradlew assembleNightly
```

6. **安装到设备：**

```
adb devices
./gradlew installDebug
adb logcat -s Operit:* # View logs
```

**依赖解析策略：**

构建使用 `configurations.all { resolutionStrategy {} }` 来处理冲突：

```
// Force compatible versions for MCP SDK
force("org.jetbrains.kotlinx:kotlinx-serialization-json:1.5.1")
force("io.ktor:ktor-client-core:2.3.5")
force("io.ktor:ktor-client-cio:2.3.5")
 
// Avoid BouncyCastle duplicate class errors
force("org.bouncycastle:bcprov-jdk18on:1.78")
exclude(group = "org.bouncycastle", module = "bcprov-jdk15to18")
```

**打包配置：**

`packaging {}` 块处理资源冲突：

- 排除重复的 META-INF 文件
- 对 `.so` 库使用 `pickFirst`(传统 JNI 模式)
- 排除 Netty 属性以防止冲突

## 扩展机制

Operit 提供三种扩展机制，用于向 AI 系统添加自定义功能。

**工具注册与执行流程**

```
Tool Invocation Pipeline

calls AIToolHandler.executeTool()

looks up registered tool

native tools

JS tools

MCP tools

executes

executes in

communicates with

returns

returns

returns

flows back to

EnhancedAIService

AIToolHandler

ToolRegistration.registerAllTools()

Direct Kotlin execution

JsTools.toolCall()

PackageManager.executeMCPTool()

StandardFileSystemTools
DebuggerFileSystemTools
NetworkTools, etc.

JavaScript Engine (V8/Rhino)

MCPLocalServer instance

ToolResult
```

### 扩展机制对比

机制实现语言复杂度访问级别部署方式**原生工具**Kotlin高完全访问 Android API需要重新构建应用**JavaScript 工具**JavaScript/TypeScript低仅限暴露的 API热加载脚本**MCP 插件**任意语言(通过 MCP 协议)中基于网络的工具插件安装

### 工具注册系统

工具注册发生在 `ToolRegistration.kt` 中，通过 `registerAllTools()` 函数实现，该函数在 `AIToolHandler` 初始化时被调用。

**工具注册流程：从自然语言到代码实体**

```
calls handler.registerTool()

calls handler.registerTool()

calls handler.registerTool()

calls handler.registerTool()

calls handler.registerTool()

calls handler.registerTool()

name: read_file_full

name: write_file

name: list_files

name: apply_file

name: query_memory

name: create_memory

name: create_terminal_session

name: execute_in_terminal_session

name: execute_shell

name: device_info

name: execute_intent

name: visit_web

name: start_web

name: use_package

name: package_proxy

registerAllTools(handler: AIToolHandler, context: Context)

File System Tools

Memory Tools

Terminal Tools

System Tools

Network Tools

UI Automation Tools

ToolGetter.getFileSystemTools(context).readFileFull()

ToolGetter.getFileSystemTools(context).writeFile()

ToolGetter.getFileSystemTools(context).listFiles()

ToolGetter.getFileSystemTools(context).applyFile()

ToolGetter.getMemoryQueryToolExecutor(context).invoke()

ToolGetter.getMemoryQueryToolExecutor(context).invoke()

ToolGetter.getTerminalCommandExecutor(context).createOrGetSession()

ToolGetter.getTerminalCommandExecutor(context).executeCommandInSession()

ToolGetter.getShellToolExecutor(context).invoke()

ToolGetter.getDeviceInfoToolExecutor(context).invoke()

ToolGetter.getIntentToolExecutor(context).invoke()

ToolGetter.getWebVisitTool(context).invoke()

ToolGetter.getWebSessionTools(context).invoke()

handler.getOrCreatePackageManager().executeUsePackageTool()

handler.executeTool(proxiedTool)
```

**注册参数：**

每个 `handler.registerTool()` 调用需要：

- `name: String` - 唯一工具标识符(例如 `"read_file_full"`、`"create_memory"`)
- `dangerCheck: ((AITool) -> Boolean)?` - 如果操作需要用户确认则返回 `true`
- `descriptionGenerator: (AITool) -> String` - 生成人类可读的操作描述
- `executor: suspend (AITool) -> ToolResult` - 执行工具并返回结果

**来自 ToolRegistration.kt 的示例：**

```
// Line 180-191
handler.registerTool(
    name = "query_memory",
    dangerCheck = null,  // Not dangerous
    descriptionGenerator = { tool ->
        val query = tool.parameters.find { it.name == "query" }?.value ?: ""
        s(R.string.toolreg_query_memory_desc, query)
    },
    executor = { tool ->
        val problemLibraryTool = ToolGetter.getMemoryQueryToolExecutor(context)
        problemLibraryTool.invoke(tool)
    }
)
```

**已注册的工具类别：**
类别工具数量示例名称执行器来源文件系统~20`read_file_full`、`write_file`、`list_files`、`apply_file``ToolGetter.getFileSystemTools()`内存~10`query_memory`、`create_memory`、`link_memories``ToolGetter.getMemoryQueryToolExecutor()`终端6`create_terminal_session`、`execute_in_terminal_session``ToolGetter.getTerminalCommandExecutor()`系统~8`execute_shell`、`device_info`、`execute_intent`各种 `ToolGetter` 方法网络~10`visit_web`、`start_web`、`web_eval``ToolGetter.getWebVisitTool()`、`getWebSessionTools()`包2`use_package`、`package_proxy``PackageManager.executeUsePackageTool()`

## 创建自定义原生工具

原生工具使用 Kotlin 实现并直接集成到 Android 应用程序中。它们提供对 Android API 和设备系统的完全访问权限。

### 工具实现类层次结构

**文件系统工具类层次结构(代码实体映射)**

```
returns based on permission level

if ACCESSIBILITY+

if DEBUGGER+

implements

implements

implements

implements

protected

overrides with shell

overrides with shell

uses Shizuku

if .pdf

if .docx

if .jpg/.png

ToolGetter.getFileSystemTools(context)

StandardFileSystemTools
(context: Context)

AccessibilityFileSystemTools
extends StandardFileSystemTools

DebuggerFileSystemTools
extends AccessibilityFileSystemTools

readFile(tool: AITool): ToolResult

writeFile(tool: AITool): ToolResult

listFiles(tool: AITool): ToolResult

applyFile(tool: AITool): ToolResult

handleSpecialFileRead(path: String)

readFile() uses shell commands

writeFile() uses shell commands

ShizukuFileOperations

extractTextFromPDF()

extractTextFromWord()

handleImageFile()
```

### 工具实现步骤

**步骤 1：实现工具方法**

在适当的工具类中创建方法(或创建扩展现有类的新类)：

```
// In StandardFileSystemTools.kt or custom class
suspend fun myCustomTool(tool: AITool): ToolResult {
    // Extract parameters from tool.parameters
    val path = tool.parameters.find { it.name == "path" }?.value ?: ""
    val option = tool.parameters.find { it.name == "option" }?.value ?: "default"

    // Validate inputs
    if (path.isBlank()) {
        return ToolResult(
            toolName = tool.name,
            success = false,
            result = StringResultData(""),
            error = "path parameter is required"
        )
    }

    // Execute operation
    return try {
        val result = performOperation(path, option)
        ToolResult(
            toolName = tool.name,
            success = true,
            result = StringResultData(result)
        )
    } catch (e: Exception) {
        ToolResult(
            toolName = tool.name,
            success = false,
            result = StringResultData(""),
            error = "Operation failed: ${e.message}"
        )
    }
}
```

**步骤 2：在 ToolRegistration.kt 中注册**

在 `registerAllTools()` 函数中添加注册：

```
// In ToolRegistration.kt registerAllTools() function
handler.registerTool(
    name = "my_custom_tool",
    dangerCheck = { false }, // or { true } if dangerous
    descriptionGenerator = { tool ->
        val path = tool.parameters.find { it.name == "path" }?.value ?: ""
        "Perform custom operation on: $path"
    },
    executor = { tool ->
        val tools = ToolGetter.getFileSystemTools(context)
        tools.myCustomTool(tool)
    }
)
```

**步骤 3：添加到 SystemToolPrompts(可选)**

如果该工具应对 AI 可见，添加到 `SystemToolPromptsInternal.kt`：

```
// In SystemToolPromptsInternal.kt internalToolCategoriesEn list
ToolPrompt(
    name = "my_custom_tool",
    description = "Performs a custom operation on files",
    parametersStructured = listOf(
        ToolParameterSchema(
            name = "path",
            type = "string",
            description = "File path to operate on",
            required = true
        ),
        ToolParameterSchema(
            name = "option",
            type = "string",
            description = "Optional operation mode",
            required = false,
            default = "default"
        )
    )
)
```

### ToolResult Data Class Hierarchy(代码实体空间)

**ToolResultData Sealed Class Hierarchy**

```
basic

basic

basic

basic

file

file

file

file

file

file

file

file

network

network

system

system

system

system

terminal

terminal

UI

UI

wraps

ToolResultData
(sealed class in ToolResultDataClasses.kt)

StringResultData(value: String)

BooleanResultData(value: Boolean)

IntResultData(value: Int)

BinaryResultData(value: ByteArray)

FileContentData(path, content, size, env)

FilePartContentData(path, content, partIndex, totalParts, ...)

DirectoryListingData(path, entries: List, env)

FileOperationData(operation, env, path, successful, details)

FileApplyResultData(operation, aiDiffInstructions, syntaxCheckResult)

FileExistsData(path, exists, isDirectory, size, env)

FileInfoData(path, exists, fileType, size, permissions, ...)

FindFilesResultData(path, pattern, files, env)

HttpResponseData(url, statusCode, headers, content, ...)

VisitWebResultData(url, title, content, links, visitKey)

DeviceInfoResultData(deviceId, model, androidVersion, ...)

SystemSettingData(namespace, setting, value)

AppOperationData(operationType, packageName, success, details)

AppListData(includesSystemApps, packages)

TerminalCommandResultData(command, output, exitCode, sessionId, timedOut)

ADBResultData(command, output, exitCode)

UIPageResultData(packageName, activityName, uiElements)

UIActionResultData(actionType, actionDescription, coordinates, elementId)

ToolResult(toolName, success, result: ToolResultData, error)
```

**常见 ToolResultData 类型：**
类型构造函数参数用途`StringResultData``value: String`简单文本结果`FileContentData``path, content, size, env`文件读取结果`DirectoryListingData``path, entries, env`目录列表结果`FileOperationData``operation, env, path, successful, details`文件写入/删除/复制结果`HttpResponseData``url, statusCode, headers, content, ...`HTTP 请求结果`DeviceInfoResultData``deviceId, model, androidVersion, ...`设备信息结果
**ToolResult 结构：**

```
data class ToolResult(
    val toolName: String,      // Tool identifier
    val success: Boolean,       // Operation success flag
    val result: ToolResultData, // Typed result data
    val error: String = ""      // Error message if failed
)
```

## 创建 JavaScript 工具

JavaScript 工具允许在不重新构建 Android 应用的情况下扩展 Operit。它们在沙箱化的 JavaScript 环境(V8 或 Rhino)中执行，并通过 `Tools` API 访问原生工具。

### JavaScript Bridge 架构(代码实体映射)

**JsTools Bridge：自然语言到代码实体**

```
calls

calls

calls

calls

calls

invokes

invokes

invokes

invokes

invokes

marshaled by

calls

returns

unmarshaled to

User JavaScript Code

Tools.Files.read(path)
Tools.Files.write(path, content)

Tools.Net.httpGet(url)
Tools.Net.visitWeb(url)

Tools.System.sleep(ms)
Tools.System.deviceInfo()

Tools.UI.getPageInfo()
Tools.UI.tap(x, y)

Tools.Terminal.create(name)
Tools.Terminal.exec(sessionId, cmd)

toolCall(name, params)

JsToolManager.executeTool()

AIToolHandler.executeTool()

ToolResult

JavaScript Promise
```

**Tools API 命名空间(来自 JsTools.kt)：**

`JsTools.kt` 中的 `getJsToolsDefinition()` 函数生成一个包含以下命名空间的 JavaScript 对象：
命名空间方法(示例)实现`Tools.Files``read()`, `write()`, `list()`, `delete()`, `apply()`, `grep()`, `find()`映射到 `read_file_full`, `write_file`, `list_files` 等`Tools.Net``httpGet()`, `httpPost()`, `visit()`, `startWeb()`, `webEval()`, `webClick()`映射到 `http_request`, `visit_web`, `start_web` 等`Tools.System``sleep()`, `deviceInfo()`, `installApp()`, `shell()`, `terminal.*`映射到 `sleep`, `device_info`, `execute_shell` 等`Tools.UI``getPageInfo()`, `tap()`, `clickElement()`, `setText()`, `swipe()`, `runSubAgent()`映射到 `get_page_info`, `tap`, `click_element` 等`Tools.Tasker``triggerEvent()`映射到 `trigger_tasker_event`
**JavaScript 工具示例：**

```
// processWebContent.js - Example tool using Tools API
async function processWebContent(url) {
    try {
        // Visit web page using Tools.Net.visit()
        const webResult = await Tools.Net.visit(url);

        if (!webResult.success) {
            return { error: `Failed to visit: ${webResult.error}` };
        }

        // Extract content
        const content = webResult.data.content;
        const processed = content.substring(0, 1000);

        // Save using Tools.Files.write()
        const filePath = "/sdcard/Download/web_content.txt";
        const writeResult = await Tools.Files.write(filePath, processed);

        return {
            success: writeResult.success,
            message: `Saved to ${filePath}`,
            length: processed.length
        };
    } catch (error) {
        return { error: String(error) };
    }
}
```

**TypeScript 类型定义：**

`examples/types/` 目录提供了 TypeScript 定义以支持类型安全开发：

```
// Import type definitions from examples/types/
import { FileContentData, HttpResponseData } from './types/results';
import { ToolResultMap } from './types/tool-types';
 
// Type-safe tool invocation
async function readFileTyped(path: string): Promise<FileContentData> {
    const result = await Tools.Files.read(path);
    if (!result.success) {
        throw new Error(result.error);
    }
    return result.data as FileContentData;
}
 
// Using ToolResultMap for tool name -> result type mapping
type ReadFileResult = ToolResultMap['read_file'];  // FileContentData
```

**关键类型定义文件：**
文件内容`examples/types/index.d.ts`主类型定义入口点`examples/types/results.d.ts`所有 `ToolResultData` 接口`examples/types/tool-types.d.ts``ToolResultMap` 将工具名称映射到结果类型`examples/types/core.d.ts``BaseResult`, `ToolResult` 接口`examples/types/files.d.ts`文件系统相关类型

## MCP 插件开发

MCP(Model Context Protocol)插件提供了一种更强大的方式来扩展 Operit 的功能。

### MCP 插件架构

```
MCP Implementation Architecture

interacts with

manages

initiates install

shows progress via

displayed in

manages

creates/controls

loads

registers

available to

User

MCPScreen.kt

MCPViewModel

MCPRepository

InstallProgress

MCPInstallProgressDialog

MCPManager

MCPLocalServer

Your MCP Plugin

Custom Tools

AI Assistant
```

### MCP 插件开发步骤：

1. **为你的插件创建一个 TypeScript 项目**
2. **定义插件清单**，包含工具描述
3. **实现工具处理器**，处理请求并返回响应
4. **构建并打包**插件为 ZIP 文件
5. **导入到 Operit**，通过 MCP Plugin 界面

### 插件清单结构：

```
{
  "name": "my-mcp-plugin",
  "version": "1.0.0",
  "description": "An example MCP plugin",
  "tools": [
    {
      "name": "custom_function",
      "description": "Performs a custom operation",
      "parameters": {
        "input": {
          "type": "string",
          "description": "The input to process"
        }
      },
      "returnType": "string"
    }
  ]
}
```

### 插件实现：

```
// Plugin implementation
class MyMCPPlugin {
  // Handle tool requests
  async handleToolRequest(request) {
    if (request.name === "custom_function") {
      try {
        const result = processInput(request.parameters.input);
        return {
          status: "success",
          result: result
        };
      } catch (error) {
        return {
          status: "error",
          error: String(error)
        };
      }
    }

    return {
      status: "error",
      error: `Unknown tool: ${request.name}`
    };
  }
}
```

### 在 Operit 中导入 MCP 插件：

1. 打开 Operit 并导航到 Packages 部分
2. 选择"MCP Plugins"标签页
3. 点击"Import Plugin"并选择你的 ZIP 文件
4. 配置插件设置
5. 部署插件

## 测试工具和插件

Operit 包含一个测试框架，用于在部署前验证工具功能。

### 测试流程

```
Tool Testing Process

creates

loads

defines

execute

return

validated against

compiled into

reviewed by

Developer

Test Script

operit-tester.ts

Test Cases

Tool Functions

Results

Expected Output

Test Report
```

### 使用 Operit Tester：

1. **为你的工具编写测试函数**，保存在 TypeScript 文件中
2. **编译测试代码**：`tsc your-test-file.ts`
3. **运行测试**：

```
# Windows
.\tools\execute_js.bat your-test-file.js main '{}'
 
# Linux/macOS
./tools/execute_js.sh your-test-file.js main '{}'
```

### 测试函数示例：

```
async function testMyTool(results: TestResults): Promise<void> {
  try {
    console.log("Testing my custom tool...");

    // Execute the tool with test parameters
    const result = await toolCall("my_custom_tool", {
      input: "test data"
    });

    // Validate the result
    const success = result.success &&
                   typeof result.data === 'string' &&
                   result.data.includes("Expected output");

    // Record test results
    results["my_custom_tool"] = {
      success: success,
      data: result
    };
  } catch (err) {
    console.error("Error testing my_custom_tool:", err);
    results["my_custom_tool"] = {
      success: false,
      error: String(err)
    };
  }
}
```

## 构建和配置

### TypeScript 配置

对于工具和插件开发，建议使用以下 TypeScript 配置：

```
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 工具类型参考

所有工具接口定义在 `index.d.ts` 中。主要接口包括：
接口类型描述示例`ToolParams`工具调用参数`{ path: string, content: string }``BaseResult`基础结果接口`{ success: boolean, error?: string }``StringResult`字符串结果类型`{ success: true, data: "result" }``FileContentData`文件内容结果`{ path: string, content: string, size: number }``ToolResult`所有结果类型的联合任何有效的结果对象

### MCP 插件结构

一个正确打包的 MCP 插件应具有以下结构：

```
my-plugin.zip
├── manifest.json            # Plugin manifest with tool definitions
├── index.js                 # Main entry point (compiled JavaScript)
├── package.json             # Node.js package information (optional)
└── assets/                  # Static assets (optional)

```

## 架构模式

理解 Operit 的核心架构模式对于有效开发至关重要。

### 委托模式

Operit 广泛使用委托模式来分离复杂系统中的关注点：

**ChatServiceCore 委托模式**

```
ChatServiceCore Delegation

delegates message processing

delegates coordination

delegates attachments

delegates history

delegates streaming

processes

coordinates

handles

manages

emits

ChatServiceCore
(coordinator)

MessageProcessingDelegate

MessageCoordinationDelegate

AttachmentDelegate

ChatHistoryDelegate

StreamingDelegate

Message Content

EnhancedAIService

File Attachments

AppDatabase

StateFlow updates
```

### StateFlow 和响应式流

Operit 使用 Kotlin `StateFlow` 和 `SharedFlow` 进行响应式状态管理：

**StateFlow 模式**

```
Reactive State Management

exposes

messages

input

loading

updates

observed by

recomposes on change

ChatViewModel

StateFlow properties

messagesFlow

inputStateFlow

isLoadingFlow

ChatServiceCore

Compose UI

AIChatScreen
```

关键的 StateFlow 使用模式：

```
// ViewModel exposes StateFlow
val messagesFlow: StateFlow<List<Message>> = _messages.asStateFlow()
 
// Composable observes StateFlow
@Composable
fun ChatScreen(viewModel: ChatViewModel) {
    val messages by viewModel.messagesFlow.collectAsState()

    // UI automatically recomposes when messages change
    MessageList(messages)
}
```

### 服务架构

Operit 使用分层服务架构：

**服务层架构**

```
Service Layers

calls

uses

persists to

also directly accesses

UI Layer
(Screens, ViewModels)

Service Layer
(ChatServiceCore, EnhancedAIService)

Repository Layer
(ChatHistoryManager, ModelConfigManager)

Data Layer
(AppDatabase, ApiPreferences)
```

### 工具权限系统

工具按权限级别组织：

**权限级别层次结构**

```
AndroidPermissionLevel Hierarchy

escalates to

escalates to

escalates to

escalates to

can use

can use

can use

STANDARD
(Basic Android permissions)

ACCESSIBILITY
(Accessibility service)

ADMIN
(Device admin)

DEBUGGER
(Shizuku API)

ROOT
(Root access)

StandardFileSystemTools

AccessibilityFileSystemTools

DebuggerFileSystemTools
```

权限级别控制可以执行哪些工具。较高的权限级别继承较低级别的功能。

## Android Manifest 配置

理解 manifest 对于处理权限和组件的开发者至关重要。

**Manifest 组件结构**

```
AndroidManifest.xml Structure

declares

declares

dangerous

special

foreground service

defines

defines

defines

defines

main

crash

tasker

overlay

network

debug

voice

widget

workflow

script

Shizuku

files

SAF

AndroidManifest.xml

Permissions

Application Component

MANAGE_EXTERNAL_STORAGE
SYSTEM_ALERT_WINDOW
RECORD_AUDIO
CALL_PHONE, SEND_SMS
ACCESS_FINE_LOCATION

Shizuku API_V23
QUERY_ALL_PACKAGES
REQUEST_IGNORE_BATTERY_OPTIMIZATIONS

FOREGROUND_SERVICE_MICROPHONE
FOREGROUND_SERVICE_DATA_SYNC
FOREGROUND_SERVICE_SPECIAL_USE

Activities

Services

Broadcast Receivers

Content Providers

MainActivity
launchMode=singleTask

CrashReportActivity
process=:crash

WorkflowTaskerActivityConfig
ActivityConfigAIAgentAction

FloatingChatService
foregroundServiceType=dataSync|specialUse|microphone

AIForegroundService
foregroundServiceType=dataSync

UIDebuggerService
foregroundServiceType=specialUse

OperitVoiceInteractionService
permission=BIND_VOICE_INTERACTION

VoiceAssistantWidgetReceiver

WorkflowTaskerReceiver
WorkflowBootReceiver

ScriptExecutionReceiver

ShizukuProvider
multiprocess=false

FileProvider
fileprovider

WorkspaceDocumentsProvider
documents.workspace
```

**关键 Manifest 配置要点：**
组件配置目的`OperitApplication``android:name=".core.application.OperitApplication"`用于初始化的自定义 Application 类`MainActivity``android:launchMode="singleTask"`用于悬浮窗集成的单实例模式`FloatingChatService``foregroundServiceType="dataSync|specialUse|microphone"`多用途前台服务`WorkspaceDocumentsProvider``android:authorities="com.ai.assistance.operit.documents.workspace"`用于工作区访问的 SAF 集成`ShizukuProvider``android:permission="android.permission.INTERACT_ACROSS_USERS_FULL"`Shizuku API 集成
**Intent 过滤器：**

清单文件声明了多个用于外部集成的 intent 过滤器：

- GitHub OAuth 回调：`operit://github-oauth-callback`
- 文件打开/分享：处理 `VIEW` 和 `SEND` 操作，支持 `*/*` MIME 类型
- 小部件更新：`android.appwidget.action.APPWIDGET_UPDATE`
- Tasker 插件：`com.twofortyfouram.locale.intent.action.EDIT_SETTING`
- 开机启动：`android.intent.action.BOOT_COMPLETED`

**权限分类：**
分类权限**存储**`READ_EXTERNAL_STORAGE`、`WRITE_EXTERNAL_STORAGE`、`MANAGE_EXTERNAL_STORAGE`**系统悬浮窗**`SYSTEM_ALERT_WINDOW`、`WRITE_SETTINGS`**通信**`CALL_PHONE`、`SEND_SMS`、`READ_SMS`、`RECEIVE_SMS`**位置**`ACCESS_FINE_LOCATION`、`ACCESS_COARSE_LOCATION`**音频**`RECORD_AUDIO`、`FOREGROUND_SERVICE_MICROPHONE`**系统集成**`QUERY_ALL_PACKAGES`、Shizuku `API_V23`**电源管理**`REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`、`WAKE_LOCK`

## 依赖管理

理解依赖结构对于添加新库或解决冲突至关重要。

**主要依赖分类**

```
Dependency Categories in build.gradle.kts

AI/ML Libraries

Database Libraries

Network Libraries

UI Libraries

System Libraries

Document Processing

Test Libraries

ML Kit

Inference

Vector Search

Room

ObjectBox

DataStore

HTTP

Web

MCP

Compose

Media

Widgets

Permissions

Root

Crypto

Office

PDF

Archives

dependencies {}

AILibs

DBLibs

NetLibs

UILibs

SysLibs

DocLibs

TestLibs

mlkit-text-recognition
mlkit-text-chinese
mlkit-text-japanese

tensorflow-lite
onnxruntime-android
MNN (module)

hnswlib-core
jieba (Chinese segmentation)

room-runtime
room-ktx
room-compiler (kapt)

objectbox-kotlin
objectbox-processor (kapt)

datastore-preferences

okhttp
okhttp-sse
retrofit

jsoup
nanohttpd

mcp:0.7.0
(with version overrides)

compose-bom
compose.material3
navigation-compose

coil-compose
exoplayer
android-gif

glance-appwidget

shizuku-api
shizuku-provider

libsu-core
libsu-service

security-crypto
bcprov-jdk18on

poi
poi-ooxml
poi-scratchpad

itextg
pdfbox

commons-compress
zip4j
junrar
```

**依赖解析策略：**

构建脚本使用 `resolutionStrategy` 处理冲突：

```
configurations.all {
    resolutionStrategy {
        // Force compatible kotlinx-serialization version for MCP SDK
        force("org.jetbrains.kotlinx:kotlinx-serialization-json:1.5.1")
        force("io.ktor:ktor-client-core:2.3.5")
        force("io.ktor:ktor-client-cio:2.3.5")
        force("io.ktor:ktor-serialization-kotlinx-json:2.3.5")

        // Force BouncyCastle jdk18on to avoid duplicate classes
        force("org.bouncycastle:bcprov-jdk18on:1.78")
    }

    // Exclude old BouncyCastle version
    exclude(group = "org.bouncycastle", module = "bcprov-jdk15to18")
}
```

**打包配置：**

`packaging {}` 块处理资源冲突：

- 排除依赖项中的重复 META-INF 文件
- 对 `.so` 原生库使用 `pickFirsts`
- 排除 Netty 属性以避免冲突
- 启用传统 JNI 打包模式

## 最佳实践

### 工具开发

1. **错误处理**

- 始终返回带有适当 `success` 标志的 `ToolResult`
- 在 `error` 字段中提供描述性错误消息
- 捕获所有异常并转换为错误结果
- 在所有 I/O 操作周围使用 try-catch 块

2. **参数验证**

- 在工具执行开始时验证所有参数
- 对于无效输入提前返回错误
- 检查 null、空值或格式错误的参数值
- 在执行操作前验证文件路径

3. **资源管理**

- 在 `finally` 块中关闭流和资源或使用 `use {}`
- 通过正确清理引用避免内存泄漏
- 考虑移动设备的内存限制
- 显式释放原生资源(位图、游标)

4. **权限处理**

- 在执行操作前检查所需权限
- 当权限缺失时返回描述性错误
- 使用 `ToolGetter` 获取适合权限级别的工具实现
- 使用适当的危险检查函数注册工具

5. **日志记录**

- 使用 `android.util.Log` 并采用适当的级别(`Log.d()`、`Log.w()`、`Log.e()`)
- 在日志消息中包含上下文(工具名称、参数)
- 记录带有完整堆栈跟踪的异常
- 使用一致的日志标签(例如类名)

### 代码组织

1. **模块分离**

- UI 代码：`app/src/main/java/com/ai/assistance/operit/ui/`
- 业务逻辑：`app/src/main/java/com/ai/assistance/operit/core/`
- 数据访问：`app/src/main/java/com/ai/assistance/operit/data/`
- 服务：`app/src/main/java/com/ai/assistance/operit/services/`
- 工具：`app/src/main/java/com/ai/assistance/operit/core/tools/`

2. **命名约定**

- 类名：PascalCase 描述性名词(例如：`StandardFileSystemTools`、`ChatHistoryManager`)
- 函数名：camelCase 动词-名词对(例如：`readFile`、`listFiles`、`executeTool`)
- 变量：camelCase 描述性名称(例如：`fileContent`、`toolResult`)
- 常量：UPPER_SNAKE_CASE(例如：`MAX_FILE_SIZE`、`DEFAULT_TIMEOUT`)

3. **可组合函数**

- 保持可组合函数小而专注(单一职责)
- 将可复用的 UI 组件提取到独立的可组合函数中
- 对于开销较大的计算使用 `remember {}`
- 尽可能提升状态以提高可测试性
- 适当使用 `@Stable` 和 `@Immutable` 注解

4. **协程使用**

- 使用适当的调度器(`Dispatchers.IO` 用于 I/O，`Dispatchers.Default` 用于 CPU 密集型操作)
- 在 ViewModels 中优先使用 `viewModelScope` 以实现自动取消
- 对于独立的子操作使用 `supervisorScope`
- 适当处理 `CancellationException`

5. **测试**

- 为业务逻辑编写单元测试
- 使用 `MockK` 模拟 Kotlin 类
- 测试错误条件和边界情况
- 使用 `operit-tester.ts` 框架进行工具集成测试

## UI 反馈系统

Operit 通过 `UIOperationOverlay` 类为 UI 操作提供可视化反馈。这在调试 UI 自动化工具时特别有用。

### UIOperationOverlay 架构(代码实体映射)

**可视化反馈系统：自然语言到代码实体**

```
calls

showTap(x, y)

showSwipe(startX, startY, endX, endY)

showTextInput(x, y, text)

creates

displays

observes

observes

observes

renders each

renders each

renders each

manages via

WindowParams

UI Automation Tool
(tap, swipe, setText)

UIOperationOverlay.getInstance(context)

TapIndicator Composable
(ripple animation)

SwipeIndicator Composable
(comet trail animation)

TextInputIndicator Composable
(speech bubble display)

ComposeView
(overlay window)

OperationFeedbackContent Composable

mutableStateListOf

mutableStateListOf

mutableStateListOf

WindowManager
(TYPE_APPLICATION_OVERLAY)

FLAG_NOT_FOCUSABLE
FLAG_NOT_TOUCHABLE
FLAG_LAYOUT_NO_LIMITS
```

**UIOperationOverlay API：**
方法参数用途`getInstance(context)``context: Context`返回单例实例`showTap(x, y, autoHideDelayMs)``x: Int, y: Int, autoHideDelayMs: Long = 1500`在坐标位置显示点击指示器`showSwipe(startX, startY, endX, endY, autoHideDelayMs)`起始和结束坐标，延迟显示滑动轨迹动画`showTextInput(x, y, text, autoHideDelayMs)`位置、文本内容、延迟显示文本输入气泡`hide()`无移除所有覆盖层
**事件数据类：**

```
// From UIOperationOverlay.kt
data class TapEvent(val x: Int, val y: Int, val id: UUID = UUID.randomUUID())
data class SwipeEvent(val startX: Int, val startY: Int, val endX: Int, val endY: Int, val id: UUID = UUID.randomUUID())
data class TextInputEvent(val x: Int, val y: Int, val text: String, val id: UUID = UUID.randomUUID())
```

**使用示例：**

```
// In a UI tool implementation
val overlay = UIOperationOverlay.getInstance(context)
 
// Show tap feedback
overlay.showTap(x = 500, y = 800)
 
// Show swipe feedback
overlay.showSwipe(startX = 100, startY = 500, endX = 900, endY = 500)
 
// Show text input feedback
overlay.showTextInput(x = 400, y = 600, text = "Hello World")
 
// Hide all overlays when done
overlay.hide()
```

**窗口配置：**

覆盖层使用 `TYPE_APPLICATION_OVERLAY` 窗口类型，具有以下标志：

- `FLAG_NOT_FOCUSABLE` - 不从其他应用窃取焦点
- `FLAG_NOT_TOUCHABLE` - 触摸事件穿透到底层应用
- `FLAG_NOT_TOUCH_MODAL` - 不消费触摸事件
- `FLAG_LAYOUT_IN_SCREEN` - 在屏幕坐标中定位
- `FLAG_LAYOUT_NO_LIMITS` - 可以在屏幕边界外绘制

## 总结

本指南为通过自定义工具和插件扩展 Operit 提供了基础。遵循这些模式和最佳实践，您可以创建强大的扩展来增强 Operit 的 AI 能力。

更多信息请参考：

- [工具系统]了解核心工具基础设施的详细信息
- [MCP 插件系统]深入了解 MCP 插件信息
- [系统集成]了解 Operit 如何与 Android 集成的详细信息

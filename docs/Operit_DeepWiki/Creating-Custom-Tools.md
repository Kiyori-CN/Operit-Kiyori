# 创建自定义工具

## 目的与范围

本文档为希望通过创建自定义工具来扩展 Operit AI 的开发者提供全面指南。工具是 AI 与 Android 系统交互、执行操作和扩展功能的主要机制。

本页涵盖：

- 工具架构与生命周期
- 创建原生 Kotlin 工具
- 工具注册模式
- 结果数据结构与处理
- 参数验证与错误处理
- 权限系统集成

有关 MCP 插件和 JavaScript/TypeScript 工具的信息，请参阅 [MCP 插件开发](#10.3)。有关通用架构模式，请参阅 [架构模式](#10.4)。

---

## 工具系统架构

Operit 中的工具系统围绕中央注册表模式构建，具有强类型的参数和结果处理。

### 高层工具流程

```
Registration Phase (App Startup)

AITool object
(name + parameters)

Look up registered
executor

Perform operation

Format & display
to user

AI Model Response
(with tool invocation)

Tool Invocation Parser
XML/JSON parsing

AIToolHandler
Central Registry

Tool Executor Function
(suspend function)

ToolResult
success + ToolResultData

registerAllTools()

registerTool()
for each tool
```

---

## 核心组件

### AITool 数据类

`AITool` 数据类表示来自 AI 的工具调用请求：
字段类型用途`name`String工具的唯一标识符`parameters`List工具的输入参数

### ToolParameter 数据类

每个参数包含：
字段类型用途`name`String参数标识符`value`String参数值(始终为字符串，必须由工具解析)

### ToolResult 数据类

每个工具执行都会返回一个 `ToolResult`：
字段类型用途`toolName`String已执行工具的名称`success`Boolean执行是否成功`result`ToolResultData结构化结果数据`error`String错误消息(成功时为空)

---

## ToolResultData 层次结构

所有工具结果必须返回密封类 `ToolResultData` 的子类。这提供了结构化的类型化结果，可以正确格式化以供显示。

### 常见结果类型

```
ToolResultData
(sealed class)

Simple Types

File Operations

Network

System

UI Automation

StringResultData
Plain text

BooleanResultData
True/false

IntResultData
Integer value

DirectoryListingData
File listings

FileContentData
File contents

BinaryFileContentData
Base64 binary

FileOperationData
Operation results

FileInfoData
File metadata

HttpResponseData
HTTP responses

VisitWebResultData
Web scraping

DeviceInfoResultData
Device info

AppOperationData
App operations

UIPageResultData
UI hierarchy

UIActionResultData
Action results
```

### 创建自定义结果类型

创建自定义结果类型的步骤：

```
@Serializable
data class CustomResultData(
    val customField1: String,
    val customField2: Int,
    val additionalData: Map<String, String>
) : ToolResultData() {
    override fun toString(): String {
        val sb = StringBuilder()
        sb.appendLine("Custom Result:")
        sb.appendLine("Field 1: $customField1")
        sb.appendLine("Field 2: $customField2")
        sb.appendLine("Additional: ${additionalData.entries.joinToString()}")
        return sb.toString()
    }
}
```

**关键要求：**

1. 必须继承 `ToolResultData`
2. 必须使用 `@Serializable` 注解
3. 必须重写 `toString()` 方法以格式化显示
4. 应使用结构化数据，而非仅使用字符串

---

## 工具注册

工具在应用启动时通过 `registerAllTools()` 函数注册。`AIToolHandler` 提供了具有丰富配置选项的 `registerTool()` 方法。

### 注册方法签名

```
fun registerTool(
    name: String,
    dangerCheck: ((AITool) -> Boolean)? = null,
    descriptionGenerator: (AITool) -> String,
    executor: suspend (AITool) -> ToolResult
)
```

参数类型用途`name`String唯一工具标识符`dangerCheck`((AITool) -> Boolean)?可选函数，用于标记危险操作`descriptionGenerator`(AITool) -> String为 UI 生成人类可读的描述`executor`suspend (AITool) -> ToolResult实际的工具实现

### 注册示例

以下是代码库中展示文件读取工具注册的完整示例：

```
handler.registerTool(
    name = "read_file",
    dangerCheck = null, // Not a dangerous operation
    descriptionGenerator = { tool ->
        val path = tool.parameters.find { it.name == "path" }?.value ?: ""
        val environment = tool.parameters.find { it.name == "environment" }?.value
        val envInfo = if (!environment.isNullOrBlank() && environment != "android")
            " (ńÄ»Õóā: $environment)" else ""
        "Ķ»╗ÕÅ¢µ¢ćõ╗Č: $path$envInfo"
    },
    executor = { tool ->
        runBlocking(Dispatchers.IO) {
            fileSystemTools.readFile(tool)
        }
    }
)
```

### 危险检查模式

某些操作需要用户确认。`dangerCheck` 函数分析参数以判断操作是否危险：

```
handler.registerTool(
    name = "delete_file",
    dangerCheck = { true }, // Always dangerous
    descriptionGenerator = { tool ->
        val path = tool.parameters.find { it.name == "path" }?.value ?: ""
        val recursive = tool.parameters.find { it.name == "recursive" }?.value == "true"
        val operation = if (recursive) "ķĆÆÕĮÆÕłĀķÖż" else "ÕłĀķÖżµ¢ćõ╗Č"
        "$operation: $path"
    },
    executor = { tool ->
        runBlocking(Dispatchers.IO) { fileSystemTools.deleteFile(tool) }
    }
)
```

对于上下文敏感的危险检测：

```
dangerCheck = { tool ->
    val resourceId = tool.parameters.find { it.name == "resourceId" }?.value ?: ""
    val className = tool.parameters.find { it.name == "className" }?.value ?: ""
    val dangerousWords = listOf(
        "send", "submit", "confirm", "pay", "purchase", "buy",
        "delete", "remove", "ÕÅæķĆü", "µÅÉõ║ż", "ńĪ«Ķ«ż", "µö»õ╗ś", "Ķ┤Łõ╣░", "ÕłĀķÖż", "ń¦╗ķÖż"
    )

    dangerousWords.any { word ->
        resourceId.contains(word, ignoreCase = true) ||
        className.contains(word, ignoreCase = true)
    }
}
```

---

## 创建原生工具实现

让我们通过文件系统工具的实现来演示如何创建一个完整的自定义工具。

### 步骤 1：创建工具执行器类

创建一个包含工具实现的类：

```
open class StandardFileSystemTools(protected val context: Context) {
    companion object {
        protected const val TAG = "FileSystemTools"
    }

    // Helper functions
    protected fun addLineNumbers(content: String): String {
        val lines = content.lines()
        if (lines.isEmpty()) return ""
        val maxDigits = lines.size.toString().length
        return lines.mapIndexed { index, line ->
            "${(index + 1).toString().padStart(maxDigits, ' ')}| $line"
        }.joinToString("\n")
    }
}
```

### 步骤 2：实现工具函数

每个工具应该是一个挂起函数，接收 `AITool` 参数并返回 `ToolResult`：

```
open suspend fun readFile(tool: AITool): ToolResult {
    // 1. Extract parameters
    val path = tool.parameters.find { it.name == "path" }?.value ?: ""
    val environment = tool.parameters.find { it.name == "environment" }?.value

    // 2. Validate parameters
    if (path.isBlank()) {
        return ToolResult(
            toolName = tool.name,
            success = false,
            result = StringResultData(""),
            error = "Path parameter is required"
        )
    }

    // 3. Perform validation (using helper)
    PathValidator.validateAndroidPath(path, tool.name)?.let { return it }

    try {
        // 4. Execute the operation
        val file = File(path)

        if (!file.exists() || !file.isFile) {
            return ToolResult(
                toolName = tool.name,
                success = false,
                result = StringResultData(""),
                error = "Path is not a file: $path"
            )
        }

        // 5. Read and process content
        val content = file.bufferedReader().use {
            val buffer = CharArray(maxFileSizeBytes)
            val charsRead = it.read(buffer, 0, maxFileSizeBytes)
            if (charsRead > 0) String(buffer, 0, charsRead) else ""
        }

        val truncated = file.length() > maxFileSizeBytes
        var finalContent = addLineNumbers(content)
        if (truncated) {
            finalContent += "\n\n... (file content truncated) ..."
        }

        // 6. Return structured result
        return ToolResult(
            toolName = tool.name,
            success = true,
            result = FileContentData(
                path = path,
                content = finalContent,
                size = finalContent.length.toLong()
            ),
            error = ""
        )
    } catch (e: Exception) {
        AppLogger.e(TAG, "Error reading file", e)
        return ToolResult(
            toolName = tool.name,
            success = false,
            result = StringResultData(""),
            error = "Error reading file: ${e.message}"
        )
    }
}
```

### 工具实现模式

```
Invalid

Valid

Invalid path

Valid path

Exception

Success

Tool Function Called
suspend fun toolName(AITool)

Extract Parameters
tool.parameters.find()

Validate Input
Check required params

Path Validation
PathValidator

Execute Operation
IO/System calls

Success Path
Create ToolResult

Error Path
Create error ToolResult

Return ToolResult
```

---

## 参数处理与验证

### 提取参数

参数始终以字符串形式提供，必须进行解析：

```
// String parameter
val path = tool.parameters.find { it.name == "path" }?.value ?: ""
┬Ā
// Boolean parameter
val recursive = tool.parameters.find { it.name == "recursive" }?.value?.toBoolean() ?: false
┬Ā
// Integer parameter
val limit = tool.parameters.find { it.name == "limit" }?.value?.toIntOrNull() ?: 10
┬Ā
// Optional parameter
val environment = tool.parameters.find { it.name == "environment" }?.value
```

### 路径验证

`PathValidator` 工具类提供文件路径的安全验证：

```
// For Android paths
PathValidator.validateAndroidPath(path, tool.name)?.let { return it }
┬Ā
// For Linux paths
PathValidator.validateLinuxPath(path, tool.name)?.let { return it }
```

这会验证：

- 路径格式和安全性
- 无目录遍历攻击
- 适当的环境限制

---

## 使用不同的文件系统环境

工具可以在多个环境中运行(Android 与 Linux)。以下是模式：

```
open suspend fun listFiles(tool: AITool): ToolResult {
    val path = tool.parameters.find { it.name == "path" }?.value ?: ""
    val environment = tool.parameters.find { it.name == "environment" }?.value

    // Delegate to specialized implementation if Linux environment
    if (isLinuxEnvironment(environment)) {
        return linuxTools.listFiles(tool)
    }

    // Android implementation
    PathValidator.validateAndroidPath(path, tool.name)?.let { return it }

    // ... Android-specific implementation
}
┬Ā
protected fun isLinuxEnvironment(environment: String?): Boolean {
    return environment?.lowercase() == "linux"
}
```

---

## 特殊文件处理

对于需要处理特殊文件类型(图像、PDF、Word 文档)的工具，实现专门的处理器：

```
protected open suspend fun handleSpecialFileRead(
    tool: AITool,
    path: String,
    fileExt: String
): ToolResult? {
    return when (fileExt) {
        "pdf" -> {
            val tempFilePath = "${path}_converted_${System.currentTimeMillis()}.txt"
            try {
                val sourceFile = File(path)
                val tempFile = File(tempFilePath)
                val success = DocumentConversionUtil.extractTextFromPdf(
                    context, sourceFile, tempFile
                )

                if (success && tempFile.exists()) {
                    val content = tempFile.readText()
                    tempFile.delete() // Clean up
                    ToolResult(
                        toolName = tool.name,
                        success = true,
                        result = FileContentData(
                            path = path,
                            content = content,
                            size = content.length.toLong()
                        ),
                        error = ""
                    )
                } else {
                    ToolResult(
                        toolName = tool.name,
                        success = false,
                        result = StringResultData(""),
                        error = "Failed to extract text from PDF document"
                    )
                }
            } catch (e: Exception) {
                ToolResult(
                    toolName = tool.name,
                    success = false,
                    result = StringResultData(""),
                    error = "Error extracting text from PDF: ${e.message}"
                )
            }
        }

        "jpg", "jpeg", "png" -> {
            // Image OCR or recognition
            // ... implementation
        }

        else -> null // Not a special type
    }
}
```

---

## 工具注册模式

### 模式 1：简单工具

对于没有复杂逻辑的直接工具：

```
handler.registerTool(
    name = "sleep",
    descriptionGenerator = { tool ->
        val durationMs = tool.parameters.find { it.name == "duration_ms" }?.value?.toIntOrNull() ?: 1000
        "õ╝æń£Ā ${durationMs}µ»½ń¦Æ"
    },
    executor = { tool ->
        val durationMs = tool.parameters.find { it.name == "duration_ms" }?.value?.toIntOrNull() ?: 1000
        val limitedDuration = durationMs.coerceIn(0, 10000) // Max 10 seconds

        runBlocking(Dispatchers.IO) {
            delay(limitedDuration.toLong())
        }

        ToolResult(
            toolName = tool.name,
            success = true,
            result = StringResultData("Slept for ${limitedDuration}ms")
        )
    }
)
```

### 模式 2：委托给执行器类

对于具有共享逻辑的复杂工具：

```
// Create executor instance
val fileSystemTools = ToolGetter.getFileSystemTools(context)
┬Ā
// Register multiple related tools
handler.registerTool(
    name = "read_file",
    descriptionGenerator = { tool ->
        val path = tool.parameters.find { it.name == "path" }?.value ?: ""
        "Ķ»╗ÕÅ¢µ¢ćõ╗Č: $path"
    },
    executor = { tool ->
        runBlocking(Dispatchers.IO) { fileSystemTools.readFile(tool) }
    }
)
┬Ā
handler.registerTool(
    name = "write_file",
    dangerCheck = { true },
    descriptionGenerator = { tool ->
        val path = tool.parameters.find { it.name == "path" }?.value ?: ""
        "ÕåÖÕģźµ¢ćõ╗Č: $path"
    },
    executor = { tool ->
        runBlocking(Dispatchers.IO) { fileSystemTools.writeFile(tool) }
    }
)
```

### 模式 3：带可见性管理的 UI 工具

对于需要隐藏悬浮窗口的 UI 自动化工具：

```
// Helper function for UI tools
suspend fun executeUiToolWithVisibility(
    tool: AITool,
    action: suspend (AITool) -> ToolResult
): ToolResult {
    val floatingService = FloatingChatService.getInstance()
    return try {
        floatingService?.setFloatingWindowVisible(false)
        floatingService?.setStatusIndicatorVisible(true)
        delay(50) // Allow UI to update
        action(tool)
    } finally {
        floatingService?.setFloatingWindowVisible(true)
        floatingService?.setStatusIndicatorVisible(false)
    }
}
┬Ā
// Use in registration
handler.registerTool(
    name = "tap",
    descriptionGenerator = { tool ->
        val x = tool.parameters.find { it.name == "x" }?.value ?: "?"
        val y = tool.parameters.find { it.name == "y" }?.value ?: "?"
        "ńé╣Õć╗Õ▒ÅÕ╣ĢÕØÉµĀć ($x, $y)"
    },
    executor = { tool ->
        runBlocking(Dispatchers.IO) {
            executeUiToolWithVisibility(tool) { uiTools.tap(it) }
        }
    }
)
```

---

## 完整工具实现示例

以下是展示所有最佳实践的完整示例：

### 工具类实现

```
class CustomTools(private val context: Context) {
    companion object {
        private const val TAG = "CustomTools"
        private const val MAX_ITEMS = 100
    }

    /**
     * Lists all files matching a pattern with metadata
     */
    suspend fun findFilesWithMetadata(tool: AITool): ToolResult {
        // 1. Extract and validate parameters
        val basePath = tool.parameters.find { it.name == "base_path" }?.value ?: ""
        val pattern = tool.parameters.find { it.name == "pattern" }?.value ?: "*"
        val includeHidden = tool.parameters.find { it.name == "include_hidden" }?.value?.toBoolean() ?: false
        val maxResults = tool.parameters.find { it.name == "max_results" }?.value?.toIntOrNull()
            ?.coerceIn(1, MAX_ITEMS) ?: MAX_ITEMS

        if (basePath.isBlank()) {
            return ToolResult(
                toolName = tool.name,
                success = false,
                result = StringResultData(""),
                error = "base_path parameter is required"
            )
        }

        // 2. Validate path
        PathValidator.validateAndroidPath(basePath, tool.name)?.let { return it }

        return withContext(Dispatchers.IO) {
            try {
                val baseDir = File(basePath)

                // 3. Check directory existence
                if (!baseDir.exists() || !baseDir.isDirectory) {
                    return@withContext ToolResult(
                        toolName = tool.name,
                        success = false,
                        result = StringResultData(""),
                        error = "Directory does not exist: $basePath"
                    )
                }

                // 4. Perform the operation
                val matchingFiles = mutableListOf<FileInfoData>()
                val regex = pattern.replace("*", ".*").toRegex()

                baseDir.walkTopDown()
                    .filter { file ->
                        !file.isDirectory &&
                        (includeHidden || !file.name.startsWith(".")) &&
                        file.name.matches(regex)
                    }
                    .take(maxResults)
                    .forEach { file ->
                        matchingFiles.add(
                            FileInfoData(
                                path = file.absolutePath,
                                exists = true,
                                fileType = "file",
                                size = file.length(),
                                permissions = getFilePermissions(file),
                                owner = "user",
                                group = "user",
                                lastModified = Date(file.lastModified()).toString(),
                                rawStatOutput = ""
                            )
                        )
                    }

                AppLogger.d(TAG, "Found ${matchingFiles.size} files matching pattern '$pattern'")

                // 5. Return structured result
                ToolResult(
                    toolName = tool.name,
                    success = true,
                    result = FindFilesWithMetadataResultData(
                        basePath = basePath,
                        pattern = pattern,
                        filesFound = matchingFiles.size,
                        files = matchingFiles
                    ),
                    error = ""
                )
            } catch (e: Exception) {
                AppLogger.e(TAG, "Error finding files", e)
                ToolResult(
                    toolName = tool.name,
                    success = false,
                    result = StringResultData(""),
                    error = "Error finding files: ${e.message}"
                )
            }
        }
    }

    private fun getFilePermissions(file: File): String {
        val canRead = if (file.canRead()) 'r' else '-'
        val canWrite = if (file.canWrite()) 'w' else '-'
        val canExecute = if (file.canExecute()) 'x' else '-'
        return "$canRead$canWrite$canExecute$canRead-$canExecute$canRead-$canExecute"
    }
}
┬Ā
// Custom result type
@Serializable
data class FindFilesWithMetadataResultData(
    val basePath: String,
    val pattern: String,
    val filesFound: Int,
    val files: List<FileInfoData>
) : ToolResultData() {
    override fun toString(): String {
        val sb = StringBuilder()
        sb.appendLine("Found $filesFound file(s) matching '$pattern' in $basePath:")
        sb.appendLine()
        files.forEach { file ->
            sb.appendLine("${file.path}")
            sb.appendLine("  Size: ${file.size} bytes")
            sb.appendLine("  Modified: ${file.lastModified}")
            sb.appendLine("  Permissions: ${file.permissions}")
            sb.appendLine()
        }
        return sb.toString()
    }
}
```

### 注册

```
fun registerCustomTools(handler: AIToolHandler, context: Context) {
    val customTools = CustomTools(context)

    handler.registerTool(
        name = "find_files_with_metadata",
        dangerCheck = null, // Read-only operation
        descriptionGenerator = { tool ->
            val basePath = tool.parameters.find { it.name == "base_path" }?.value ?: ""
            val pattern = tool.parameters.find { it.name == "pattern" }?.value ?: "*"
            "µ¤źµēŠµ¢ćõ╗Č: $basePath (µ©ĪÕ╝Å: $pattern)"
        },
        executor = { tool ->
            customTools.findFilesWithMetadata(tool)
        }
    )
}
```

---

## 工具系统提示词集成

注册工具后，需要将它们包含在系统提示词中，以便 AI 知道如何使用它们。这由 `SystemPromptConfig` 自动处理。

### 工具描述生成

系统从已注册的工具生成工具描述：

```
private fun generateToolsPromptEn(
    hasBackendImageRecognition: Boolean,
    includeMemoryTools: Boolean,
    chatModelHasDirectImage: Boolean
): String {
    val sb = StringBuilder()
    sb.appendLine("AVAILABLE TOOLS:")
    sb.appendLine()

    // File operations section
    sb.appendLine("FILE OPERATIONS:")
    sb.appendLine("- list_files(path, environment?): List files in directory")
    sb.appendLine("  path: Directory path")
    sb.appendLine("  environment: 'android' or 'linux' (default: android)")

    sb.appendLine("- read_file(path, environment?): Read file content with size limit")
    // ... more tools

    return sb.toString()
}
```

系统会自动在发送给 AI 的提示词中包含工具描述，使其能够理解可用的功能。

---

## 测试自定义工具

### 使用 Toolbox 界面

Operit 包含一个用于手动工具测试的 Toolbox 界面：

1. 从主菜单导航到 Toolbox
2. 选择你的自定义工具
3. 填写参数值
4. 执行并查看结果

### 编程式测试

在你的工具执行器类中创建测试用例：

```
suspend fun testFindFiles(): ToolResult {
    val testTool = AITool(
        name = "find_files_with_metadata",
        parameters = listOf(
            ToolParameter("base_path", "/sdcard/Download"),
            ToolParameter("pattern", "*.pdf"),
            ToolParameter("max_results", "50")
        )
    )

    return findFilesWithMetadata(testTool)
}
```

---

## 最佳实践总结

### 参数处理

1. 始终为可选参数提供默认值
2. 在处理前验证所有输入
3. 使用类型安全的解析(`toIntOrNull()`、`toBoolean()`)
4. 将数值强制转换到安全范围

### 错误处理

1. 捕获所有异常并返回结构化的错误 `ToolResult`
2. 使用 `AppLogger` 记录错误以便调试
3. 提供清晰、可操作的错误消息
4. 永远不要从工具执行器中抛出异常

### 结果格式化

1. 为结构化输出创建自定义 `ToolResultData` 类型
2. 实现有意义的 `toString()` 方法
3. 使用适当的结果类型(不要过度使用 `StringResultData`)
4. 在结果中包含相关元数据

### 安全性

1. 始终使用 `PathValidator` 验证文件路径
2. 对破坏性操作使用危险检查
3. 限制资源消耗(文件大小、迭代次数)
4. 永远不要在未验证的情况下信任用户输入

### 性能

1. 对 I/O 操作使用 `withContext(Dispatchers.IO)`
2. 避免阻塞主线程
3. 为长时间运行的操作实现超时
4. 考虑对大型结果集进行分页

### 代码组织

1. 在执行器类中对相关工具进行分组
2. 将通用逻辑提取到辅助函数中
3. 使用伴生对象存放常量
4. 遵循已建立的命名约定

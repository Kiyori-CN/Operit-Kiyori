# 包系统

Package System 为 Operit 提供了可扩展性基础设施，通过管理工具包来为 AI 助手添加新功能。它处理包的发现、导入、激活和执行，支持多种包格式，包括传统 JavaScript 包、现代 ToolPkg 容器、MCP 插件和 Skills。

有关工具执行和注册的信息，请参阅 [Tool Architecture](/AAswordman/Operit/5.1-tool-architecture)。有关基于 JavaScript 的工具执行，请参阅 [JavaScript Tools Bridge](/AAswordman/Operit/5.6-javascript-tools-bridge)。有关 MCP 插件集成，请参阅 [MCP Plugin System](/AAswordman/Operit/5.8-mcp-plugin-system)。

---

## 概述与架构

包系统围绕 `PackageManager` 构建，这是一个协调所有包相关操作的单例。它支持多种包格式，并维护从包发现到激活和执行的清晰生命周期。

### Package Manager 架构

```
Registration

Execution Layer

Data Structures

Package Formats

Package Sources

Package Management Layer

PackageManager
(Singleton)

JsEngine
(V8 Runtime)

JsToolManager
(Script Executor)

Assets: packages/
(Built-in Packages)

External: getExternalFilesDir/packages/
(User Imports)

MCPManager
(MCP Servers)

SkillManager
(GitHub Skills)

Legacy Package
JS/HJSON Files

ToolPkg Container
.toolpkg Archives

MCPPackage
(MCP Server)

Skill
(GitHub Metadata)

ToolPackage
(name, tools, states, env)

PackageTool
(name, params, script)

ToolPkgContainerRuntime
(subpackages, resources, ui)

PackageToolExecutor
(Invokes JS Scripts)

MCPToolExecutor
(Server Communication)

AIToolHandler
(Tool Registry)

ToolRegistration
(AI Tool Definitions)
```

---

## 核心组件

### PackageManager 单例

`PackageManager` 是所有包操作的中央协调器。它维护线程安全的状态并延迟初始化依赖项。

**主要职责：**

- 从 assets 和外部存储中发现包
- 加载和解析包元数据
- 管理包导入/激活生命周期
- 向 `AIToolHandler` 注册工具
- 通过 `JsEngine` 或专用执行器执行包工具
- 处理 ToolPkg 容器操作(子包、资源、UI 模块)

**文件位置：**

**单例模式：**

```
@Volatile private var INSTANCE: PackageManager? = null
 
fun getInstance(context: Context, aiToolHandler: AIToolHandler): PackageManager {
    return INSTANCE ?: synchronized(this) {
        INSTANCE ?: PackageManager(context.applicationContext, aiToolHandler)
            .also { INSTANCE = it }
    }
}
```

**关键内部状态：**

- `availablePackages: Map<String, ToolPackage>` - 所有已发现的包
- `packageLoadErrors: ConcurrentHashMap<String, String>` - 加载失败跟踪
- `activePackageToolNames: Map<String, Set<String>>` - 每个包当前激活的工具
- `toolPkgContainers: Map<String, ToolPkgContainerRuntime>` - ToolPkg 容器运行时
- `toolPkgSubpackageByPackageName: Map<String, ToolPkgSubpackageRuntime>` - 子包查找

### ToolPackage 数据结构

`ToolPackage` 表示包元数据，包括工具、状态、环境变量和本地化。

```
@Serializable
data class ToolPackage(
    val name: String,
    val description: LocalizedText,
    val tools: List<PackageTool>,
    val states: List<ToolPackageState> = emptyList(),
    val env: List<EnvVar> = emptyList(),
    val isBuiltIn: Boolean = false,
    val enabledByDefault: Boolean = false,
    val displayName: LocalizedText = LocalizedText.of("")
)
```

**主要特性：**

- **本地化文本支持** - 通过 `LocalizedText` 类型支持多语言描述
- **条件状态** - 基于系统条件的多种工具配置
- **环境变量** - 必需/可选的环境变量声明及默认值
- **内置标志** - 区分资源包与用户导入

### PackageTool 结构

包内的单个工具由 `PackageTool` 定义：

```
@Serializable
data class PackageTool(
    val name: String,
    val description: LocalizedText,
    val parameters: List<PackageToolParameter>,
    val script: String, // JavaScript execution code
    val advice: Boolean = false
)
```

`script` 字段包含工具被调用时由 `JsEngine` 执行的 JavaScript 代码。

---

## 包生命周期

包系统实现了三阶段生命周期：可用 → 已导入 → 激活。

### 生命周期状态图

```
Package Discovered

User imports package
(saveImportedPackages)

Session starts
(initializeDefaultPackages,
registerImportedPackages)

Session ends
(unregisterPackageTools)

User removes package
(unimportPackage)

Package deleted
(deletePackage)

Available

Imported

Active

All packages in assets/
and external storage

User has enabled package
(stored in SharedPreferences)

Tools registered with
AIToolHandler, available
to AI in current session
```

### 阶段描述

阶段描述存储关键方法**可用**从资源或外部存储中发现的包`availablePackages: Map<String, ToolPackage>``loadAvailablePackages()`, `getAvailablePackages()`**已导入**用户已启用包以供使用`SharedPreferences` 键：`IMPORTED_PACKAGES_KEY``importPackage()`, `unimportPackage()`, `getImportedPackages()`**活跃**已在 AI 系统中注册的工具`activePackageToolNames: Map<String, Set<String>>``registerPackageTools()`, `unregisterPackageTools()`

### 包导入流程

```
AIToolHandler
SharedPrefs
PackageManager
PackageManagerScreen
User
AIToolHandler
SharedPrefs
PackageManager
PackageManagerScreen
User
Click import on package
importPackage(packageName)
normalizePackageName()
validateEnvVars()
Save to IMPORTED_PACKAGES_KEY
registerPackageTools()
registerTools(toolPrompts)
Tools registered
Import success
Update UI
```

---

## 包类型和格式

### 传统 JavaScript 包

传统包是包含包元数据和工具定义的简单 `.js` 或 `.hjson` 文件。

**文件格式：**

- `.js` - 包含 HJSON 格式元数据的 JavaScript 文件
- `.hjson` - 支持注释的 Human JSON

**示例结构：**

```
{
  name: "my_package",
  description: "Package description",
  tools: [
    {
      name: "my_tool",
      description: "Tool description",
      parameters: [
        { name: "param1", type: "string", required: true, description: "Parameter 1" }
      ],
      script: "return Tools.executeShellCommand('echo ' + param1);"
    }
  ]
}
```

**加载过程：**

1. 在资源或外部目录中发现文件
2. 内容解析为 HJSON(允许注释)
3. 反序列化为 `ToolPackage` 对象
4. 存储在 `availablePackages` 映射中

### ToolPkg 容器格式

ToolPkg 是现代化的包格式，提供包含子包、资源和 UI 模块的结构化组织方式。

**文件扩展名：**`.toolpkg`

**归档结构：**

```
package_name.toolpkg (ZIP archive)
├── manifest.hjson          # Package metadata
├── resources/              # Binary resources
│   ├── image.png
│   └── data.json
├── ui_modules/             # UI components
│   └── settings.dsl
└── subpackages/            # Conditional tool sets
    ├── default/
    │   └── tools.hjson
    └── advanced/
        └── tools.hjson

```

**清单架构：**

```
{
  package_name: "example_toolpkg",
  version: "1.0.0",
  display_name: { default: "Example Package", zh: "示例包" },
  description: { default: "Description", zh: "描述" },
  resources: [
    { key: "ICON", path: "resources/icon.png" }
  ],
  ui_modules: [
    {
      id: "settings",
      runtime: "compose_dsl",
      entry: "ui_modules/settings.dsl",
      title: { default: "Settings" },
      show_in_package_manager: true
    }
  ],
  subpackages: [
    {
      id: "basic",
      display_name: { default: "Basic Tools" },
      enabled_by_default: true,
      tools: [...]
    }
  ]
}
```

**运行时表示：**`ToolPkgContainerRuntime` 保存已解析的清单数据，并提供对子包、资源和 UI 模块的访问。

### 子包

子包是 ToolPkg 容器内的条件工具集，可以独立启用/禁用。

**主要特性：**

- 独立的启用/禁用状态
- 基于条件的激活(例如，需要虚拟显示支持)
- 独立的包命名：`container_package_name/subpackage_id`

**状态管理：**

```
fun setToolPkgSubpackageEnabled(
    subpackagePackageName: String,
    enabled: Boolean
): Boolean {
    val subpackageRuntime = toolPkgSubpackageByPackageName[normalizedPackageName]
    // Update SharedPreferences: TOOLPKG_SUBPACKAGE_STATES_KEY
    // Update imported packages list
    // Register/unregister tools accordingly
}
```

---

## 包存储与发现

### 存储位置

位置类型路径用途**资源**内置`assets/packages/`应用预装的包**外部存储**用户导入`getExternalFilesDir(null)/packages/`用户添加的包**MCP 插件**基于服务器`getExternalFilesDir(null)/mcp_servers/`模型上下文协议服务器**技能**远程GitHub Issues社区贡献的工具定义

### 包发现流程

```
ensureInitialized()

loadAvailablePackages()
Scan assets/packages/

Scan external storage
getExternalFilesDir/packages/

Parse .js, .hjson, .toolpkg files

Build availablePackages map

Record errors in
packageLoadErrors

initializeDefaultPackages()
Auto-import enabled_by_default
```

**发现算法：**

1. **扫描资源目录** - 列出 `assets/packages/` 中的所有文件
2. **扫描外部目录** - 列出外部包目录中的所有文件
3. **按扩展名过滤** - 接受 `.js`、`.hjson`、`.toolpkg` 文件
4. **解析每个文件** - 根据扩展名使用相应的解析器：

- JS/HJSON：解析为 HJSON → 反序列化为 `ToolPackage`
- ToolPkg：解压 → 解析清单 → 创建 `ToolPkgContainerRuntime`

5. **构建运行时映射** - 填充 `availablePackages`、`toolPkgContainers`、`toolPkgSubpackageByPackageName`
6. **跟踪错误** - 将解析失败存储在 `packageLoadErrors` 中

### 外部包导入

用户可以通过文件选择器从任意位置导入包：

```
ExternalDir
CacheDir
PackageManager
ContentResolver
PackageManagerScreen
FilePicker
User
ExternalDir
CacheDir
PackageManager
ContentResolver
PackageManagerScreen
FilePicker
User
Select .js/.toolpkg file
Return URI
openInputStream(uri)
InputStream
Copy to temp file
importPackageFromExternalStorage(tempPath)
Copy to packages directory
Reload available packages
File saved
Import complete
Delete temp file
Show success message
```

---

## 工具执行

### PackageToolExecutor

`PackageToolExecutor` 实现了 `ToolExecutor` 接口以处理包工具调用。

**执行流程：**

```
AIToolHandler
invoke()

PackageToolExecutor
invoke()

Parse 'package:tool' format

Locate PackageTool
in ToolPackage.tools

JsToolManager
executeScript()

V8 Engine
Execute JavaScript

Tools.* Polyfills
(file, network, etc)

ToolResult
(success, result, error)
```

**代码参考：**

```
class PackageToolExecutor(
    private val toolPackage: ToolPackage,
    private val context: Context,
    private val packageManager: PackageManager
) : ToolExecutor {

    override fun invoke(tool: AITool): ToolResult {
        val parts = tool.name.split(":")
        val packageName = parts[0]
        val toolName = parts[1]
        val packageTool = toolPackage.tools.find { it.name == toolName }

        return runBlocking {
            jsToolManager.executeScript(packageTool.script, tool).last()
        }
    }
}
```

### 流式支持

包工具通过 `invokeAndStream()` 支持流式结果：

```
override fun invokeAndStream(tool: AITool): Flow<ToolResult> {
    val packageTool = toolPackage.tools.find {
        it.name.endsWith(tool.name.split(":").last())
    }
    return jsToolManager.executeScript(packageTool.script, tool)
}
```

这允许工具在执行期间发出多个 `ToolResult` 对象，从而实现进度更新和增量输出。

---

## 环境变量

包可以声明必需的环境变量，这些变量必须在激活前配置。

### EnvVar 声明

```
@Serializable
data class EnvVar(
    val name: String,
    val description: LocalizedText,
    val required: Boolean = true,
    val defaultValue: String? = null
)
```

**包清单中的示例：**

```
{
  name: "github_tools",
  env: [
    {
      name: "GITHUB_TOKEN",
      description: { default: "GitHub API token", zh: "GitHub API 令牌" },
      required: true
    },
    {
      name: "GITHUB_API_BASE_URL",
      description: { default: "GitHub API base URL" },
      required: false,
      defaultValue: "https://api.github.com"
    }
  ]
}
```

### 环境变量管理

```
Runtime Access

Validation

Data Layer

UI Layer

PackageManagerScreen

MCPEnvironmentVariablesDialog

FloatingActionButton
(Settings Icon)

EnvPreferences
(DataStore)

PackageManager

requiredEnvByPackage:
Map>

Check missing required vars

JsEngine
(getEnv() polyfill)

Package Script Execution
```

**验证流程：**

1. **收集** - `PackageManager` 聚合所有导入包的 `env` 声明
2. **UI 显示** - `PackageManagerScreen` 计算 `requiredEnvByPackage` 并在对话框中显示
3. **用户输入** - 用户通过 `MCPEnvironmentVariablesDialog` 提供值
4. **存储** - 值保存到 `EnvPreferences`(基于 DataStore)
5. **运行时访问** - JavaScript 代码通过 `Tools.getEnv(key)` polyfill 访问

---

## 条件状态

包可以定义多个状态，以根据系统条件提供不同的工具配置。

### 状态结构

```
@Serializable
data class ToolPackageState(
    val id: String,
    val condition: String = "true",      // Boolean expression
    val inheritTools: Boolean = false,   // Include base tools
    val excludeTools: List<String> = emptyList(),
    val tools: List<PackageTool> = emptyList()
)
```

**示例：**

```
{
  name: "ui_automation",
  tools: [
    { name: "basic_tap", ... },
    { name: "basic_swipe", ... }
  ],
  states: [
    {
      id: "virtual_display",
      condition: "hasVirtualDisplaySupport()",
      inheritTools: true,
      tools: [
        { name: "create_virtual_screen", ... },
        { name: "automate_on_virtual", ... }
      ]
    },
    {
      id: "minimal",
      condition: "true",
      excludeTools: ["basic_swipe"]
    }
  ]
}
```

### 状态选择

```
Yes

No

Package Activation

Load package.states

Evaluate each state.condition

ConditionEvaluator.evaluate()

Choose first matching state

Use default tools

Apply state configuration

inheritTools?

Include base package.tools

Remove excludeTools

Add state.tools

Register with AIToolHandler
```

**条件评估：**

`ConditionEvaluator`评估条件表达式，例如：

- `hasVirtualDisplaySupport()` - 检查虚拟显示是否可用
- `hasAccessibilityPermission()` - 检查无障碍服务状态
- `hasRootAccess()` - 检查 root 权限可用性
- 布尔逻辑：`hasRoot() && hasShizuku()`

---

## 本地化支持

包系统通过 `LocalizedText` 类型提供全面的本地化支持。

### LocalizedText 结构

```
@Serializable(with = LocalizedTextSerializer::class)
data class LocalizedText(
    val values: Map<String, String>  // Language tag → Translation
) {
    fun resolve(context: Context): String {
        val locale = context.resources.configuration.locales.get(0)
        val languageTag = locale.toLanguageTag()  // e.g., "zh-CN"
        val language = locale.language            // e.g., "zh"

        // Priority: exact match → language match → "default" → first value
        return values[languageTag]
            ?: values[language]
            ?: values["default"]
            ?: values.values.firstOrNull().orEmpty()
    }
}
```

**JSON 表示：**

简短形式(单一语言)：

```
"description": "Tool description"
```

完整形式(多语言)：

```
"description": {
  "default": "Tool description",
  "zh": "工具描述",
  "zh-CN": "工具描述（简体）",
  "en": "Tool description"
}
```

### 本地化使用

包中所有面向用户的字符串都使用 `LocalizedText`：

- `ToolPackage.description`
- `ToolPackage.displayName`
- `PackageTool.description`
- `PackageToolParameter.description`
- `EnvVar.description`
- ToolPkg 容器元数据(显示名称、描述)

**解析示例：**

```
// In UI code
val packageDescription = toolPackage.description.resolve(context)
val toolDescription = packageTool.description.resolve(context)
 
// For specific language (e.g., in MCP server response)
val descriptionInEnglish = toolPackage.description.resolve("en")
```

---

## 资源管理

ToolPkg 容器可以打包任意二进制资源(图像、数据文件等)，供工具在运行时访问。

### 资源声明

**清单结构：**

```
{
  resources: [
    {
      key: "APP_ICON",
      path: "resources/icon.png"
    },
    {
      key: "CONFIG_TEMPLATE",
      path: "resources/config.json"
    }
  ]
}
```

**运行时表示：**

```
data class ToolPkgResource(
    val key: String,
    val path: String  // Path within .toolpkg archive
)
```

### 资源访问 API

```
// Export resource to file system
fun copyToolPkgResourceToFile(
    containerPackageName: String,
    resourceKey: String,
    destinationFile: File
): Boolean
 
// Access by subpackage ID (resolves container automatically)
fun copyToolPkgResourceToFileBySubpackageId(
    subpackageId: String,
    resourceKey: String,
    destinationFile: File,
    preferImportedContainer: Boolean = true
): Boolean
 
// Get original filename
fun getToolPkgResourceOutputFileName(
    packageNameOrSubpackageId: String,
    resourceKey: String,
    preferImportedContainer: Boolean = true
): String?
```

**JavaScript 工具中的使用示例：**

```
// Export resource to temp file
const iconPath = Tools.exportToolPkgResource("my_package", "APP_ICON");
// Use the exported file
Tools.sendNotification({ icon: iconPath });
```

---

## UI 模块

ToolPkg 容器可以包含集成到 Operit UI 中的 Compose DSL UI 模块。

### UI 模块声明

```
{
  ui_modules: [
    {
      id: "settings_screen",
      runtime: "compose_dsl",
      entry: "ui_modules/settings.dsl",
      title: { default: "Package Settings", zh: "包设置" },
      description: { default: "Configure package options" },
      show_in_package_manager: true
    }
  ]
}
```

**字段：**

- `id` - 包内唯一标识符
- `runtime` - UI 框架(目前仅支持 `"compose_dsl"`)
- `entry` - 归档文件中 UI 脚本的路径
- `title` - 本地化显示名称
- `description` - 本地化描述
- `show_in_package_manager` - 是否在工具箱屏幕中显示

### UI 模块集成

```
ToolboxScreen

PackageManager.
getToolPkgToolboxUiModules()

Dynamic Tool List
(ToolPkgToolboxUiModule)

ToolCard
(runtime=compose_dsl)

Navigate to
ToolPkgComposeDsl screen

Load and execute
Compose DSL script

V8 Engine

Render Jetpack Compose UI
```

**关键组件：**

1. **发现** - `PackageManager.getToolPkgToolboxUiModules()` 返回已导入包中的模块
2. **显示** - `ToolboxScreen` 将模块显示为动态工具卡片
3. **导航** - 点击后启动 `ToolPkgComposeDslToolScreen`
4. **执行** - 屏幕从归档文件加载 DSL 脚本并在 V8 中执行
5. **渲染** - DSL 生成 Compose UI 组件

---

## 包管理界面

### PackageManagerScreen

用于浏览、导入和管理包的主界面。

```
Details Dialog

Actions

Package List

Tab Navigation

Packages Tab
(Legacy + ToolPkg)

Skills Tab
(GitHub Skills)

MCP Tab
(MCP Servers)

Available Packages
(all discovered)

Imported Badge
(green checkmark)

Package Card
(name, description, tools count)

Import FAB
(file picker)

Environment FAB
(settings icon)

Error FAB
(if load errors)

Package Details Dialog

Tools List / Subpackages

Delete Button
(external packages)

Run Tool Button
```

**关键状态：**

- `availablePackages: Map<String, ToolPackage>` - 所有包
- `importedPackages: List<String>` - 用户启用的包名称
- `visibleImportedPackages: List<String>` - UI 状态(在乐观更新期间可能不同)
- `selectedPackage: String?` - 当前查看的详情
- `packageLoadErrors: Map<String, String>` - 加载失败消息

### 包卡片显示

```
@Composable
fun PackageCard(
    packageName: String,
    packageDescription: String,
    isImported: Boolean,
    toolsCount: Int,
    onToggleImport: () -> Unit,
    onClick: () -> Unit
)
```

**视觉元素：**

- 扩展图标(根据导入状态进行颜色编码)
- 包显示名称
- 简短描述(截断)
- 工具数量徽章
- 导入开关(导入时显示勾选标记)
- 点击打开详情对话框

### 包详情对话框

显示全面的包信息和管理选项。

**部分：**

1. **头部**

- 包名称和 ID
- 内置 vs 外部徽章
- 描述
- 版本(针对 ToolPkg 容器)

2. **内容区域**

- **标准包：** 带参数的工具列表
- **ToolPkg 容器：** 带启用/禁用开关的子包列表
- **有状态包：** 显示不同状态配置的选项卡视图

3. **操作**

- 运行工具(每个工具按钮)
- 删除包(仅限外部)
- 关闭对话框

---

## 与其他系统的集成

### AIToolHandler 集成

包通过 `AIToolHandler` 注册工具，使其可供 AI 使用。

```
EnhancedAIService
ToolRegistration
AIToolHandler
PackageToolExecutor
PackageManager
EnhancedAIService
ToolRegistration
AIToolHandler
PackageToolExecutor
PackageManager
loop
[For each tool in package]
AI invokes tool
registerPackageTools(packageName)
new PackageToolExecutor(package)
registerExecutor(packageName:*, executor)
Create ToolPrompt from PackageTool
registerTool(toolPrompt)
invokeTool("packageName:toolName", params)
invoke(AITool)
Execute JavaScript via JsToolManager
ToolResult
ToolResult
```

**工具命名约定：**

- 格式：`packageName:toolName`
- 示例：`github_tools:create_issue`
- 子包工具：`container_package/subpackage_id:toolName`

### MCP 插件集成

MCP(Model Context Protocol)插件被视为特殊的包类型。

**集成点：**

1. **包标签页** - MCP 插件显示在专用的"MCP"标签页中
2. **工具注册** - MCPManager 创建包装服务器工具的 `MCPPackage`
3. **执行** - `MCPToolExecutor` 与服务器进程通信
4. **生命周期** - 服务器启动/停止由 MCPStarter 管理

**包结构：**

```
data class MCPPackage(
    override val name: String,
    override val description: LocalizedText,
    override val tools: List<PackageTool>,
    val serverConfig: MCPServerConfig
) : ToolPackage
```

### 技能系统集成

技能是存储为 GitHub Issues 的轻量级工具定义。

**集成流程：**

1. **发现** - `SkillRepository` 从 GitHub 获取
2. **转换** - Issue 元数据转换为 `ToolPackage`
3. **可见性** - `SkillVisibilityPreferences` 跟踪已启用的技能
4. **执行** - 技能使用标准的 `PackageToolExecutor` 配合 JavaScript

**技能包结构：**

```
{
  "name": "skill_name",
  "description": "From GitHub issue body",
  "tools": [{
    "name": "tool_name",
    "description": "Tool description",
    "parameters": [...],
    "script": "// JavaScript from issue code block"
  }]
}
```

---

## 偏好设置与持久化

### SharedPreferences 存储

包状态通过 `SharedPreferences` 在应用重启后保持持久化。

**偏好设置键：**
键类型用途`IMPORTED_PACKAGES_KEY``Set<String>`用户已导入的包名`DISABLED_PACKAGES_KEY``Set<String>`临时禁用的已导入包`ACTIVE_PACKAGES_KEY``Set<String>`当前会话中活跃的包`TOOLPKG_SUBPACKAGE_STATES_KEY`JSON String子包启用/禁用状态映射

### 持久化方法

```
private fun saveImportedPackages(packages: List<String>) {
    val normalized = normalizeImportedPackageNames(packages)
    prefs.edit().putStringSet(IMPORTED_PACKAGES_KEY, normalized.toSet()).apply()
}
 
private fun getImportedPackages(): List<String> {
    val set = prefs.getStringSet(IMPORTED_PACKAGES_KEY, emptySet())
    return normalizeImportedPackageNames(set?.toList() ?: emptyList())
}
 
private fun saveToolPkgSubpackageStates(states: Map<String, Boolean>) {
    val normalized = normalizeToolPkgSubpackageStates(states)
    val json = Json.encodeToString(normalized)
    prefs.edit().putString(TOOLPKG_SUBPACKAGE_STATES_KEY, json).apply()
}
 
private fun getToolPkgSubpackageStatesInternal(): Map<String, Boolean> {
    val json = prefs.getString(TOOLPKG_SUBPACKAGE_STATES_KEY, "{}")
    val parsed = Json.decodeFromString<Map<String, Boolean>>(json)
    return normalizeToolPkgSubpackageStates(parsed)
}
```

### 包名规范化

包名经过规范化处理以处理子包和别名：

```
private fun normalizePackageName(packageName: String): String {
    val trimmed = packageName.trim()
    if (trimmed.isBlank()) return trimmed

    // Check if it's a subpackage reference
    val subpackage = resolveToolPkgSubpackageRuntime(trimmed)
    return subpackage?.packageName ?: trimmed
}
```

这确保了：

- 子包 ID 解析为完整包名
- 维护容器/子包关系
- 导入列表中无重复条目

---

## 错误处理和调试

### 包加载错误

失败的包加载记录在 `packageLoadErrors: ConcurrentHashMap<String, String>` 中。

**常见错误场景：**

- 格式错误的 HJSON/JSON 语法
- 无效的 ToolPkg 归档结构
- 缺少必需的清单字段
- 不支持的包版本
- 脚本编译错误
- 环境变量验证失败

**错误显示：**

当 `packageLoadErrors.isNotEmpty()` 时，UI 显示错误 FAB 按钮：

```
if (packageLoadErrors.value.isNotEmpty()) {
    SmallFloatingActionButton(
        onClick = { showPackageLoadErrorsDialog = true },
        containerColor = MaterialTheme.colorScheme.errorContainer
    ) {
        Icon(Icons.Default.Error, contentDescription = "Errors")
    }
}
```

**错误对话框：**
列出所有加载错误的包及其错误信息，帮助用户诊断问题。

### 脚本执行对话框

`ScriptExecutionDialog` 在测试工具时提供实时反馈：

**功能：**

- 执行期间的进度指示器
- 成功/错误状态显示
- 结果预览(文本、图片、媒体)
- 带堆栈跟踪的错误信息
- 复制结果到剪贴板

**用法：**

```
var showScriptExecution by remember { mutableStateOf(false) }
var scriptExecutionResult by remember { mutableStateOf<ToolResult?>(null) }
 
// When user clicks "Run" on a tool
onRunScript = { packageName, tool ->
    scope.launch {
        val result = packageManager.executePackageTool(packageName, tool, emptyMap())
        scriptExecutionResult = result
        showScriptExecution = true
    }
}
```

---

## 高级主题

### 子包解析

子包可以通过完整包名或子包 ID 引用：

```
// By full package name: "container/subpackage_id"
val subpackage1 = packageManager.getPackageTools("my_toolpkg/advanced_tools")
 
// By subpackage ID: "advanced_tools" (resolves to container automatically)
val subpackage2 = packageManager.getPackageTools("advanced_tools")
```

**解析优先级：**

1. 完整包名精确匹配
2. 不区分大小写的子包 ID 匹配
3. 当存在多个匹配时，优先选择已导入的容器

### 动态包重载

包可以在不重启应用的情况下重新加载：

```
// Force reload all packages
val refreshedPackages = packageManager.getAvailablePackages(forceRefresh = true)
 
// Re-register imported packages (updates AIToolHandler)
packageManager.registerImportedPackages()
```

**使用场景：**

- 通过文件选择器导入新包后
- 编辑外部包文件后
- 安装 MCP 插件后
- 包修改后的 UI 刷新

### 包删除

外部(非内置)包可以被删除：

```
fun deletePackage(packageName: String): Boolean {
    // 1. Unregister tools from AIToolHandler
    unregisterPackageTools(packageName)

    // 2. Remove from imported list
    unimportPackage(packageName)

    // 3. Delete physical file
    val file = File(externalPackagesDir, "${packageName}.js")
    if (file.exists()) file.delete()

    // 4. Refresh available packages
    loadAvailablePackages()

    return true
}
```

**限制：**

- 内置包(来自 assets)无法删除
- 仅移除导入状态和注册
- assets 中的物理文件保持不变

---

## 总结表格

### 包格式对比

特性Legacy JS/HJSONToolPkg ContainerMCP PluginSkill**文件扩展名**`.js`, `.hjson``.toolpkg`目录N/A (GitHub)**结构**单文件ZIP 归档配置 + 服务器JSON 元数据**子包**❌✅❌❌**资源**❌✅ (二进制文件)❌❌**UI 模块**❌✅ (Compose DSL)❌❌**本地化**✅✅✅✅**环境变量**✅✅✅✅**条件状态**✅✅❌❌**执行**V8 JavaScriptV8 JavaScriptIPC 到服务器V8 JavaScript**发现**文件扫描文件扫描配置扫描GitHub API

### 核心 API 方法

方法用途返回值`getAvailablePackages(forceRefresh)`获取所有已发现的包`Map<String, ToolPackage>``getImportedPackages()`获取用户启用的包`List<String>``importPackage(packageName)`启用包以供使用`Boolean``unimportPackage(packageName)`禁用包`Boolean``getPackageTools(packageName)`获取包的有效工具`ToolPackage?``registerPackageTools(packageName)`注册到 AIToolHandler`Unit``unregisterPackageTools(packageName)`从 AIToolHandler 移除`Unit``deletePackage(packageName)`删除外部包`Boolean``getToolPkgContainerDetails(name)`获取容器元数据`ToolPkgContainerDetails?``setToolPkgSubpackageEnabled(name, enabled)`切换子包状态`Boolean``copyToolPkgResourceToFile(name, key, file)`导出资源`Boolean``getToolPkgToolboxUiModules(runtime)`获取 Toolbox 的 UI 模块`List<ToolPkgToolboxUiModule>`

---

## 配置文件

### 包偏好设置位置

```
SharedPreferences: "com.ai.assistance.operit.core.tools.PackageManager"
├── imported_packages: Set<String>
├── disabled_packages: Set<String>
├── active_packages: Set<String>
└── toolpkg_subpackage_states: String (JSON)

```

### 环境变量存储

```
DataStore: "env_preferences"
├── GITHUB_TOKEN: String
├── OPENAI_API_KEY: String
├── CUSTOM_VAR: String
└── ...

```

---

包系统文档到此结束。该系统提供了灵活、可扩展的架构，支持多种包格式、本地化、条件配置，并与 Operit 的 AI 功能无缝集成。

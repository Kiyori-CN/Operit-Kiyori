# 创建工具包

本指南介绍如何为 Operit 创建可分发的工具包。工具包是一个容器，将一个或多个工具与元数据、脚本、资源和本地化数据打包在一起。有关在代码层面实现自定义工具的信息，请参阅[创建自定义工具](/AAswordman/Operit/9.2-creating-custom-tools)。有关整体包管理系统的信息，请参阅[包系统](/AAswordman/Operit/5.7-package-system)。

## 包概述

Operit 支持两种包格式：
格式文件扩展名描述使用场景传统包`.js` 或 `.hjson`嵌入 JavaScript 的简单 JSON/HJSON 清单快速原型开发、单文件工具ToolPkg 容器`.toolpkg`包含清单、资源和 UI 模块的 ZIP 归档复杂工具，包含资源、子包和 UI 组件
两种格式均由 `PackageManager` 管理，并通过 V8 JavaScript 引擎执行，可访问 `Tools.*` API 桥接。

---

## 包架构

```
Registration

Runtime Components

Package Types

Package Manager

Package Sources

assets/packages/
(Built-in)

External Files Dir
packages/
(User-imported)

File Picker
(.js, .toolpkg)

PackageManager
Singleton

loadAvailablePackages()

importPackageFromExternalStorage()

Parse HJSON/JSON
Manifest

Legacy Package
ToolPackage

ToolPkg Container
ToolPkgContainerRuntime

Subpackage
ToolPkgSubpackageRuntime

V8 JavaScript Engine

JsToolManager

PackageToolExecutor

Tools.* API Bridge

AIToolHandler

Registered AI Tools
(packageName:toolName)
```

---

## 旧版包格式

### 基本结构

旧版包是一个 JSON 或 HJSON 文件，具有以下结构：

```
{
  "name": "example_package",
  "description": "Example tool package",
  "display_name": "Example Package",
  "enabled_by_default": true,
  "tools": [
    {
      "name": "example_tool",
      "description": "Does something useful",
      "parameters": [
        {
          "name": "input",
          "description": "Input parameter",
          "type": "string",
          "required": true
        }
      ],
      "script": "// JavaScript implementation here"
    }
  ]
}
```

### ToolPackage 数据结构

包清单映射到 `ToolPackage` 可序列化类：
字段类型必需说明`name`String是唯一包标识符(小写，下划线分隔)`description`LocalizedText是包描述(可本地化)`display_name`LocalizedText否人类可读的显示名称`enabled_by_default`Boolean否首次运行时自动导入(仅限内置包)`tools`List是工具定义数组`states`List否条件工具状态(参见状态部分)`env`List否所需环境变量

### LocalizedText 格式

`LocalizedText` 类型支持多种语言变体：

```
{
  "description": {
    "en": "English description",
    "zh": "中文描述",
    "default": "Fallback description"
  }
}
```

或者对于单语言内容使用简单字符串：

```
{
  "description": "Single language description"
}
```

解析逻辑优先级为：用户区域设置 → 语言代码 → "default" → "en" → 第一个可用项。

---

## 工具定义

### PackageTool 结构

`tools` 数组中的每个工具具有以下结构：
字段类型必需说明`name`StringYes工具名称(在包内唯一)`description`LocalizedTextYes供 AI 使用的工具描述`parameters`ListYes工具参数(可以是空数组)`script`StringYes实现工具的 JavaScript 代码`advice`BooleanNo如果为 true，工具提供建议而非直接执行

### 参数定义

每个参数定义如下：
字段类型必需说明`name`StringYes参数名称`description`LocalizedTextYes供 AI 使用的参数描述`type`StringYesJSON Schema 类型："string"、"number"、"boolean"、"object"、"array"`required`BooleanNo参数是否必需(默认：true)

### 工具脚本实现

`script` 字段包含由 V8 引擎执行的 JavaScript 代码，可访问 `Tools` API：

```
// Access to global Tools API
const result = Tools.filesystem.readFile({
  path: input.file_path
});
 
// Can use modern JavaScript features
const data = JSON.parse(result.content);
 
// Return ToolResult
return {
  success: true,
  result: { type: "string", data: data.summary }
};
```

可用 API 包括：`Tools.filesystem`、`Tools.network`、`Tools.system`、`Tools.ui`、`Tools.terminal` 等。完整 API 参考请参见 [JavaScript Tools Bridge](/AAswordman/Operit/5.6-javascript-tools-bridge)。

---

## 环境变量

包可以声明必需的环境变量，这些变量在使用前必须配置：

```
{
  "name": "github_tools",
  "env": [
    {
      "name": "GITHUB_API_TOKEN",
      "description": {
        "en": "GitHub Personal Access Token",
        "zh": "GitHub 个人访问令牌"
      },
      "required": true
    },
    {
      "name": "GITHUB_API_BASE_URL",
      "description": "GitHub API base URL",
      "required": false,
      "defaultValue": "https://api.github.com"
    }
  ]
}
```

### EnvVar 结构

字段类型必需说明`name`StringYes环境变量名称`description`LocalizedTextYes面向用户的描述`required`BooleanNo变量是否必需(默认：true)`defaultValue`StringNo未设置时的默认值
环境变量存储在 `EnvPreferences` 中，通过 `PackageManager.getEnvValue()` 访问。

---

## 包状态与条件工具

### 状态概述

包状态允许根据运行时条件决定工具的可用性：

```
{
  "name": "adaptive_package",
  "tools": [
    {
      "name": "base_tool",
      "description": "Always available",
      "parameters": [],
      "script": "return { success: true };"
    }
  ],
  "states": [
    {
      "id": "with_virtual_display",
      "condition": "hasVirtualDisplay()",
      "inheritTools": true,
      "tools": [
        {
          "name": "virtual_display_tool",
          "description": "Only available with virtual display",
          "parameters": [],
          "script": "// Virtual display specific code"
        }
      ]
    }
  ]
}
```

### ToolPackageState 结构

字段类型必需说明`id`StringYes唯一状态标识符`condition`StringNo由 ConditionEvaluator 求值的 JavaScript 表达式(默认："true")`inheritTools`BooleanNo是否在此状态中包含基础工具(默认：false)`excludeTools`ListNo要从继承工具中排除的工具名称`tools`ListNo此状态的附加工具
活动状态通过在运行时求值条件来确定。可用的条件函数包括：

- `hasVirtualDisplay()` - 虚拟显示能力
- `hasShizuku()` - Shizuku 权限可用
- `hasRoot()` - Root 访问权限可用
- `hasAccessibility()` - 无障碍服务已启用

---

## ToolPkg 容器格式

### 容器结构

`.toolpkg` 文件是一个 ZIP 归档文件，具有以下结构：

```
example.toolpkg
├── manifest.hjson          # Package manifest
├── resources/              # Static resources
│   ├── icon.png
│   └── data.json
├── scripts/                # JavaScript modules
│   └── helper.js
└── ui_modules/            # Compose DSL UI modules
    └── settings.kts

```

### 清单格式

`manifest.hjson` 在旧版格式基础上扩展了额外字段：

```
{
  name: example_toolpkg
  version: "1.0.0"
  display_name: {
    en: "Example ToolPkg"
    zh: "示例工具包"
  }
  description: {
    en: "Advanced tool package"
  }

  // Resources that can be accessed by tools
  resources: [
    {
      key: "icon"
      path: "resources/icon.png"
    }
    {
      key: "config"
      path: "resources/data.json"
    }
  ]

  // UI modules for settings/configuration
  ui_modules: [
    {
      id: "settings"
      runtime: "compose_dsl"
      entry: "ui_modules/settings.kts"
      title: "Settings"
      show_in_package_manager: true
    }
  ]

  // Subpackages for modular tool organization
  subpackages: [
    {
      id: "basic"
      display_name: "Basic Tools"
      enabled_by_default: true
      condition: "true"
      tools: [
        // Tool definitions
      ]
    }
    {
      id: "advanced"
      display_name: "Advanced Tools"
      enabled_by_default: false
      condition: "hasShizuku()"
      tools: [
        // Tool definitions requiring Shizuku
      ]
    }
  ]
}
```

### 子包

子包允许有条件地启用工具组：

```
ToolPkg Container
example.toolpkg

manifest.hjson

Subpackage: basic
enabled_by_default: true

Subpackage: advanced
condition: hasShizuku()

Tools:
- read_file
- write_file

Tools:
- system_command
- app_manager
```

用户可以在包管理器 UI 中独立切换子包。子包的包名会自动生成为 `{containerName}${subpackageId}`。

### 资源访问

工具可以使用资源 API 访问打包的资源：

```
// In tool script
const iconPath = Tools.package.getResourcePath({
  package: "example_toolpkg",
  resourceKey: "icon"
});
 
const configData = Tools.package.readResource({
  package: "example_toolpkg",
  resourceKey: "config"
});
```

资源从 ZIP 归档中提取，并在运行时通过 `PackageManager.copyToolPkgResourceToFile()` 提供。

### UI 模块

UI 模块使用 Compose DSL 提供自定义设置界面：

```
// ui_modules/settings.kts
@Composable
fun SettingsUI() {
    Column {
        Text("Configuration")

        var apiKey by remember { mutableStateOf("") }
        TextField(
            value = apiKey,
            onValueChange = { apiKey = it },
            label = { Text("API Key") }
        )

        Button(onClick = {
            saveConfig(apiKey)
        }) {
            Text("Save")
        }
    }
}
```

UI 模块在工具箱屏幕中注册，可以通过导航访问。

---

## 包生命周期

```
Package file created

User imports package

enabled_by_default=true

Required env vars set

Required env vars set

Missing required env

Missing required env

User configures env

Package activated

Tools available to AI

User disables package

User re-enables

Package unimported

Package unimported

Package deleted

Available

Imported

AutoImported

EnvConfigured

EnvMissing

Registered

Active

Disabled

Unregistered
```

### 导入和注册流程

1. **发现**：PackageManager 扫描 `assets/packages/` 和外部存储
2. **解析**：HJSON/JSON 清单被解析为 `ToolPackage` 数据结构
3. **验证**：检查所需的环境变量和条件
4. **注册**：工具通过 `packageName:toolName` 格式注册到 AIToolHandler
5. **执行**：当 AI 调用工具时，PackageToolExecutor 通过 JsToolManager 调用脚本

---

## 包分发

### 内置包

将包文件放置在 `app/src/main/assets/packages/`：

```
app/src/main/assets/packages/
├── file_operations.hjson
├── network_tools.hjson
└── advanced_ui.toolpkg

```

设置 `enabled_by_default: true` 可在首次启动时自动导入。

### 外部分发

用户可以通过以下方式导入包：

1. **文件选择器**：PackageManagerScreen 提供文件选择器用于选择 `.js`、`.hjson` 或 `.toolpkg` 文件
2. **技能市场**：发布到基于 GitHub Issues 的市场(参见 [Skill Market](/AAswordman/Operit/5.7-package-system))
3. **直接文件传输**：复制到外部存储并通过文件管理器导入

导入流程：

- 验证文件格式和结构
- 复制到外部包目录
- 解析清单并注册工具
- 在 SharedPreferences 中存储导入状态

### 包管理器界面

包管理界面提供以下功能：
功能说明包列表显示已导入的包，包含名称、描述和状态详情对话框显示工具、参数、环境变量和子包环境配置用于设置必需环境变量的界面子包切换启用/禁用条件子包删除移除外部包(内置包无法删除)

---

## 最佳实践

### 包命名

- 使用小写字母和下划线：`github_tools`、`image_processor`
- 保持名称简洁但具有描述性
- 避免使用通用名称，如 `utilities` 或 `helpers`

### 工具命名

- 在包内使用清晰的动作动词：`fetch_repository`、`analyze_image`
- 完整的工具 ID 格式为 `packageName:toolName`
- 确保工具名称在包内唯一

### 描述编写

- 将描述写成给 AI 的指令，而非给用户的说明
- 包含参数格式和预期值
- 提及前置条件或限制
- 为国际用户提供本地化版本

### 错误处理

```
// Good: Structured error response
try {
  const result = Tools.filesystem.readFile({ path: input.path });
  return {
    success: true,
    result: { type: "string", data: result.content }
  };
} catch (error) {
  return {
    success: false,
    error: `Failed to read file: ${error.message}`,
    result: { type: "string", data: "" }
  };
}
```

### 环境变量

- 在脚本中验证必需的环境变量
- 当变量缺失时提供清晰的错误消息
- 对可选配置使用默认值

---

## 完整示例：文件搜索包

```
{
  "name": "file_search_tools",
  "display_name": {
    "en": "File Search Tools",
    "zh": "文件搜索工具"
  },
  "description": {
    "en": "Advanced file search and filtering tools",
    "zh": "高级文件搜索和过滤工具"
  },
  "enabled_by_default": false,
  "env": [
    {
      "name": "MAX_SEARCH_DEPTH",
      "description": {
        "en": "Maximum directory depth for searches"
      },
      "required": false,
      "defaultValue": "5"
    }
  ],
  "tools": [
    {
      "name": "search_by_content",
      "description": {
        "en": "Search for files containing specific text. Parameters: directory (string, required), pattern (string, required), case_sensitive (boolean, optional, default false)",
        "zh": "搜索包含特定文本的文件"
      },
      "parameters": [
        {
          "name": "directory",
          "description": { "en": "Directory to search in" },
          "type": "string",
          "required": true
        },
        {
          "name": "pattern",
          "description": { "en": "Text pattern to search for" },
          "type": "string",
          "required": true
        },
        {
          "name": "case_sensitive",
          "description": { "en": "Whether search is case sensitive" },
          "type": "boolean",
          "required": false
        }
      ],
      "script": "const maxDepth = parseInt(Env.get('MAX_SEARCH_DEPTH') || '5');\nconst files = Tools.filesystem.listFiles({ path: input.directory, recursive: true, maxDepth: maxDepth });\nconst caseSensitive = input.case_sensitive || false;\nconst pattern = caseSensitive ? input.pattern : input.pattern.toLowerCase();\n\nconst matches = [];\nfor (const file of files.files) {\n  try {\n    const content = Tools.filesystem.readFile({ path: file.path });\n    const text = caseSensitive ? content.content : content.content.toLowerCase();\n    if (text.includes(pattern)) {\n      matches.push({ path: file.path, size: file.size });\n    }\n  } catch (e) {\n    // Skip files that cannot be read\n  }\n}\n\nreturn {\n  success: true,\n  result: {\n    type: 'string',\n    data: JSON.stringify({\n      pattern: input.pattern,\n      directory: input.directory,\n      matches: matches,\n      count: matches.length\n    }, null, 2)\n  }\n};"
    }
  ]
}
```

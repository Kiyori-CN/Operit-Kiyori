# 本地化

本文档描述了 Operit 中的本地化系统，该系统通过 Android 的资源系统使应用程序能够支持多种语言。内容涵盖字符串资源的组织结构、支持的语言、代码中的字符串访问模式，以及添加新翻译的指南。

有关用户偏好和设置的信息，请参阅 [用户界面](/AAswordman/Operit/4-user-interface)。有关主题自定义，请参阅 [主题系统](/AAswordman/Operit/4.3-theme-system)。

---

## 架构概览

Operit 使用基于资源限定符的标准 Android 本地化系统。字符串资源组织在 `app/src/main/res/` 下的特定语言目录中，Android 框架会根据设备设置在运行时自动选择相应的语言。

### 资源目录结构

```
app/src/main/res/

values/
(Default: Chinese)

values-en/
(English)

values-es/
(Spanish)

strings.xml
(1000+ strings)

strings.xml
(English translations)

strings.xml
(Spanish translations)

Android System
Resource Loader

Device Locale
Settings
```

**目录结构图：用于本地化的 Android 资源系统**

Android 框架会根据设备的区域设置自动选择相应的 `strings.xml` 文件。如果特定语言缺少翻译，系统会回退到 `values/` 中的默认资源。

---

## 支持的语言

Operit 目前支持三种语言：
语言资源限定符目录字符串数量状态中文(简体)(默认)`values/`1000+完整English`en``values-en/`900+完整Spanish`es``values-es/`500+部分
中文版本作为主要语言，包含所有字符串资源。英文翻译已完成，而西班牙语翻译正在进行中。

---

## 字符串资源组织

字符串资源使用 XML 注释按逻辑类别进行组织。这种结构使得定位和维护翻译更加容易。

### 主要字符串类别

```
strings.xml

Navigation
nav_ai_chat, nav_settings, etc.

Chat Module
chat_*, floating_*, reply_*

Workflow
workflow_*, node_*, trigger_*

Color Picker
colorpicker_*

Terminal
termux_*, terminal_*

Plugin System
plugin_*, mcp_*

Theme Settings
theme_*

Voice & Speech
voice_*, speech_*

Assistant Config
assistant_*, function_*

Permissions
permission_*, requested_*

Error Messages
error_*, failed_*
```

**字符串资源类别图**

### 字符串定义示例

导航字符串：

```
<string name="nav_ai_chat">AI 对话</string>
<string name="nav_settings">设置</string>
<string name="nav_terminal">终端</string>
```

带格式化的聊天模块字符串：

```
<string name="chat_model_count">%d个模型</string>
<string name="current_chats">当前共有 %1$d 条聊天记录</string>
<string name="floating_using_tool">正在使用工具: %1$s</string>
```

工作流字符串：

```
<string name="workflow_list_title">工作流列表</string>
<string name="workflow_create">创建工作流</string>
<string name="workflow_confirm_delete_workflow_message">确定要删除工作流 "%1$s" 吗？此操作不可恢复。</string>
```

---

## 访问本地化字符串

Operit 根据上下文使用不同的方法访问字符串资源：Composable 函数使用 `stringResource()`，而 ViewModels 和服务使用 `context.getString()`。

### 字符串访问流程

```
Android Resources

Service Layer

ViewModel Layer

UI Layer - Compose

Composable Functions
AIChatScreen, ChatScreenContent

stringResource(R.string.xxx)

ChatViewModel

context.getString(R.string.xxx)

FloatingChatService

getString(R.string.xxx)

R.string constants
(Generated)

Android Resource Loader

strings.xml
(selected by locale)
```

**字符串访问流程图**

### 在 Composable 函数中

在 Compose UI 代码中使用 `stringResource()` 访问字符串：

```
// Simple string access
Text(stringResource(R.string.nav_ai_chat))
 
// With formatted parameters
Text(stringResource(R.string.selected_count, selectedMessageIndices.size))
 
// In button labels
Button(onClick = { ... }) {
    Text(stringResource(R.string.change_model))
}
```

### 在 ViewModels 和 Services 中

在 Composable 上下文之外访问字符串时使用 `context.getString()`：

```
// In ViewModel
val message = context.getString(R.string.chat_create_failed)
uiStateDelegate.showErrorMessage(message)
 
// With formatted parameters
val errorMsg = context.getString(R.string.error_occurred, exception.message ?: "")
showToast(errorMsg)
 
// In Service
Toast.makeText(
    context,
    context.getString(R.string.microphone_permission_denied),
    Toast.LENGTH_SHORT
).show()
```

### 在菜单项和对话框中

字符串资源在 UI 组件中被广泛使用：

```
// AlertDialog
AlertDialog(
    onDismissRequest = { showModelSuggestionDialog = false },
    title = { Text(stringResource(R.string.model_suggestion_title)) },
    text = { Text(stringResource(R.string.model_suggestion_message)) },
    confirmButton = {
        TextButton(onClick = { ... }) {
            Text(stringResource(R.string.change_model))
        }
    },
    dismissButton = {
        TextButton(onClick = { ... }) {
            Text(stringResource(R.string.ignore))
        }
    }
)
 
// DropdownMenuItem
DropdownMenuItem(
    text = {
        Text(
            stringResource(id = R.string.copy_message),
            style = MaterialTheme.typography.bodyMedium
        )
    },
    onClick = { ... }
)
```

---

## 字符串格式化

Operit 使用 Android 的字符串格式化系统处理动态内容。这使得同一个字符串模板可以在所有语言中使用，并进行正确的参数替换。

### 格式字符串类型

格式说明符类型示例字符串示例用法`%1$s`字符串(定位)`"正在使用工具: %1$s"``getString(R.string.floating_using_tool, toolName)``%1$d`整数(定位)`"当前共有 %1$d 条聊天记录"``getString(R.string.current_chats, count)``%d`整数(顺序)`"%d个模型"``getString(R.string.chat_model_count, modelCount)``%1$s`, `%2$s`多个字符串`"源节点: %1$s → %2$s"``getString(R.string.connection, source, target)`

### 格式化示例

单个参数：

```
<!-- In strings.xml -->
<string name="chat_model_count">%d个模型</string>
<string name="floating_using_tool">正在使用工具: %1$s</string>
 
<!-- In code -->
val message = context.getString(R.string.chat_model_count, modelCount)
val toolMessage = context.getString(R.string.floating_using_tool, "execute_shell")
```

多个参数：

```
<!-- In strings.xml -->
<string name="workflow_confirm_delete_workflow_message">确定要删除工作流 "%1$s" 吗？此操作不可恢复。</string>
<string name="workflow_source_node_format">源节点: %1$s</string>
 
<!-- In code -->
val deleteMsg = context.getString(
    R.string.workflow_confirm_delete_workflow_message,
    workflowName
)
```

在 Composables 中：

```
Text(stringResource(R.string.selected_count, selectedMessageIndices.size))
Text(stringResource(R.string.current_chats, chatCount))
```

---

## 添加新翻译

要添加新语言或更新现有翻译，请按照以下步骤操作：

### 步骤 1：创建语言目录

使用适当的语言限定符创建新的资源目录：

```
app/src/main/res/values-{language_code}/

```

常见语言代码：

- `values-en` - 英语
- `values-es` - 西班牙语
- `values-fr` - 法语
- `values-de` - 德语
- `values-ja` - 日语
- `values-zh-rCN` - 简体中文(显式)
- `values-zh-rTW` - 繁体中文

### 步骤 2：复制并翻译 strings.xml

将默认的 `strings.xml` 从 `values/` 复制到新目录并翻译每个字符串：

```
<!-- values/strings.xml (Chinese - default) -->
<string name="nav_ai_chat">AI 对话</string>
<string name="nav_settings">设置</string>
 
<!-- values-en/strings.xml (English) -->
<string name="nav_ai_chat">AI Chat</string>
<string name="nav_settings">Settings</string>
 
<!-- values-es/strings.xml (Spanish) -->
<string name="nav_ai_chat">Chat IA</string>
<string name="nav_settings">Ajustes</string>
```

### 步骤 3：保留格式说明符

翻译包含格式说明符的字符串时，确保它们保持不变：

```
<!-- Chinese -->
<string name="chat_model_count">%d个模型</string>
<string name="workflow_confirm_delete_workflow_message">确定要删除工作流 "%1$s" 吗？此操作不可恢复。</string>
 
<!-- English -->
<string name="chat_model_count">%d models</string>
<string name="workflow_confirm_delete_workflow_message">Are you sure you want to delete workflow "%1$s"? This action cannot be undone.</string>
```

注意格式说明符(`%d`、`%1$s`)的位置和类型在所有翻译中必须完全匹配。

### 步骤 4：处理 HTML 和特殊字符

某些字符串包含需要正确转义的 HTML 或特殊字符：

```
<!-- Strings with HTML -->
<string name="about_developer">Desarrollador: &lt;a href="https://github.com/AAswordman"&gt;AAswordman&lt;/a&gt;</string>
 
<!-- Strings with apostrophes -->
<string name="floating_didnt_hear_clearly">Didn\'t hear clearly</string>
 
<!-- Strings with CDATA for complex HTML -->
<string name="agreement_serious_content"><![CDATA[
    <p>Welcome to OperitAI...</p>
]]></string>
```

---

## 翻译完整性

### 覆盖率矩阵

```
Spanish Translation

Navigation: 100%

Chat Module: 70%

Workflow: 0%

Settings: 80%

Other: 60%

English Translation

Navigation: 100%

Chat Module: 100%

Workflow: 100%

Settings: 100%

Other: 95%

Default (Chinese)

Navigation: 100%

Chat Module: 100%

Workflow: 100%

Settings: 100%

Other: 100%
```

**按语言和类别的翻译覆盖率**

西班牙语翻译不完整，需要额外工作。缺失的翻译会回退到中文，这可能会造成混合语言的用户体验。

### 翻译优先级区域

用户最常见的高优先级字符串：
类别示例优先级导航`nav_*` 字符串关键聊天界面`floating_*`、`chat_*`关键错误消息`error_*`、`*_failed`高常见操作`save`、`cancel`、`confirm`、`delete`高设置标签`settings`、`theme_*`中工作流系统`workflow_*`中插件系统`plugin_*`、`mcp_*`低

---

## 最佳实践

### 字符串命名约定

遵循一致的字符串 ID 命名模式：
模式示例用法`{module}_{component}_{description}``chat_history_settings`复杂模块字符串`{action}_{object}``delete_message`操作字符串`{module}_{description}``workflow_create`简单模块字符串`{component}_description``accessibility_service_description`无障碍字符串

### 上下文特定字符串

避免在不同上下文中重用通用字符串。为每个用例创建特定的字符串：

```
<!-- Good: Context-specific -->
<string name="workflow_delete">删除工作流</string>
<string name="delete_message">删除消息</string>
<string name="chat_delete_history">删除聊天记录</string>
 
<!-- Avoid: Generic reuse -->
<string name="delete">删除</string>  <!-- Too generic, lacks context -->
```

### 字符串长度注意事项

请注意翻译可能比原文明显更长或更短：

```
<!-- Chinese (5 characters) -->
<string name="nav_ai_chat">AI 对话</string>
 
<!-- English (7 characters) -->
<string name="nav_ai_chat">AI Chat</string>
 
<!-- Spanish (7 characters) -->
<string name="nav_ai_chat">Chat IA</string>
```

设计 UI 布局时需考虑文本扩展(欧洲语言通常比中文长 30-40%)。

### 复数和数量字符串

对于根据数量变化的字符串，使用 Android 的复数资源：

```
<plurals name="chat_count">
    <item quantity="one">%d chat</item>
    <item quantity="other">%d chats</item>
</plurals>
```

在代码中访问：

```
val countString = resources.getQuantityString(R.plurals.chat_count, count, count)
```

注意：当前代码库主要使用简单的计数格式化，但为了所有语言的语法正确性，应考虑使用复数形式。

### 无障碍字符串

为无障碍服务提供描述性字符串：

```
<string name="accessibility_service_description">用于获取UI层次结构，为AI助手提供更快速的界面分析能力，不会收集或存储任何个人信息。</string>
<string name="floating_close_floating_window">关闭悬浮窗</string>
```

这些字符串会被屏幕阅读器读取，应具有描述性且完整。

---

## 测试翻译

### 手动测试

测试特定语言：

1. 在设置 → 系统 → 语言中更改设备语言
2. 强制停止 Operit 应用
3. 重新打开应用查看翻译后的 UI
4. 浏览所有屏幕以验证完整性

### 自动化验证

检查常见翻译问题：

1. **缺失翻译**：比较各语言文件中的字符串数量
2. **格式说明符不匹配**：确保 `%1$s`、`%d` 等在各翻译中匹配
3. **HTML 实体编码**：验证 `&lt;`、`&gt;`、`&amp;` 是否正确转义
4. **未翻译文本**：在非默认文件中搜索默认语言字符

### Build.gradle 配置

项目在构建配置中已配置支持本地化：

```
// app/build.gradle.kts
android {
    defaultConfig {
        // Resource configuration
        vectorDrawables {
            useSupportLibrary = true
        }
    }
}
```

---

## 总结

Operit 的本地化系统利用 Android 标准资源框架支持多语言。该系统组织良好，具有清晰的字符串分类、一致的命名约定以及对格式化字符串的支持。关键组件包括：

- **资源组织**：特定语言目录(`values/`、`values-en/`、`values-es/`)
- **字符串访问**：Composable 中使用 `stringResource()`，ViewModel 中使用 `context.getString()`
- **格式支持**：用于动态内容的位置参数(`%1$s`、`%1$d`)
- **当前语言**：中文(完整)、英文(完整)、西班牙语(部分)

添加新功能时，始终在所有支持的语言文件中添加相应的字符串资源，以保持翻译完整性。

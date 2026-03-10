# 系统提示词与上下文

## 目的与范围

本文档涵盖 Operit AI 服务层中的系统提示词生成和上下文管理子系统。系统提示词是配置 AI 行为、能力和环境感知的基础指令，包括静态行为准则、动态上下文注入(工作区路径、可用工具、活动包)以及自定义机制。

有关 AI 服务提供商配置的信息，请参阅 [AI Service Providers](/AAswordman/Operit/2.2-ai-service-providers)。有关工具执行的详细信息，请参阅 [Tool System](/AAswordman/Operit/5-tool-system)。

---

## 系统提示词架构

系统提示词架构从模板、配置设置和运行时上下文动态组装多段提示词。`SystemPromptConfig` 对象作为生成这些提示词的中央工厂。

### 高层提示词组装流程

```
Final Output

Prompt Sections

Context Sources

SystemPromptConfig

Prompt Request

ChatViewModel
initiates sendMessage

ConversationService
prepareConversationHistory

getSystemPromptWithCustomPrompts()

getSystemPrompt()

applyCustomPrompts()

PackageManager
available packages

ApiPreferences
settings & bookmarks

CharacterCardManager
persona prompts

Workspace Path
web server root

Tool Visibility Map
enabled/disabled tools

BEGIN_SELF_INTRODUCTION_SECTION

THINKING_GUIDANCE_SECTION

BEHAVIOR_GUIDELINES

WEB_WORKSPACE_GUIDELINES_SECTION

TOOL_USAGE_GUIDELINES_SECTION

PACKAGE_SYSTEM_GUIDELINES_SECTION

ACTIVE_PACKAGES_SECTION

AVAILABLE_TOOLS_SECTION

Prepared Conversation History
with system message
```

---

## 核心提示词模板

### 基础系统提示词模板

`SYSTEM_PROMPT_TEMPLATE` 常量定义了带有占位符段落的英文版基础模板：

```
val SYSTEM_PROMPT_TEMPLATE =
"""
BEGIN_SELF_INTRODUCTION_SECTION
 
THINKING_GUIDANCE_SECTION
 
$BEHAVIOR_GUIDELINES_EN
 
WEB_WORKSPACE_GUIDELINES_SECTION
 
FORMULA FORMATTING: For mathematical formulas, use $ $ for inline LaTeX and $$ $$ for block/display LaTeX equations.
 
TOOL_USAGE_GUIDELINES_SECTION
 
PACKAGE_SYSTEM_GUIDELINES_SECTION
 
ACTIVE_PACKAGES_SECTION
 
AVAILABLE_TOOLS_SECTION
""".trimIndent()
```

每个段落都是一个占位符字符串，在提示词组装期间被替换。存在具有等效结构的中文版本(`SYSTEM_PROMPT_TEMPLATE_CN`)。

### 行为准则

行为准则定义了关键的 AI 交互规则：
指南目的**并行工具调用**强制要求在单次回合中调用多个信息收集工具以提高效率**响应简洁性**保持响应清晰，避免不必要的解释**上下文维护**不要重复之前的步骤；保持自然流畅**诚实的局限性**在不确定或无法完成任务时坦诚承认**响应结束**每个响应必须以以下之一结束：工具调用、任务完成(`<status type="complete">`)或等待用户(`<status type="wait_for_user_need">`)**互斥性**工具调用和状态标签不能在同一响应中共存

### 思考指导

当启用 `thinkingGuidance` 时，AI 必须包含一个 `
/sdcard/projectA/config.json

/sdcard/projectB/config.xml

```

The `<think>` block contains internal reasoning and is **not** saved to chat history, ensuring the final answer remains self-contained.

### Tool Usage Guidelines

Two modes exist for tool usage instructions:

1. **XML Format Mode** (default): Instructs AI to use `<tool>` XML tags with `<param>` children
2. **Tool Call API Mode** (`useToolCallApi=true`): Brief format for native function calling, no XML explanation

The XML format example:

```

<tool name="tool_name">
<param name="parameter_name">parameter_value</param>
</tool>
```

Tool Call API mode only includes: "Before calling a tool, briefly describe what you are about to do."

---

## Dynamic Context Injection

### Workspace Guidelines

The `getWorkspaceGuidelines()` function generates context-aware instructions based on the bound workspace:

```
工作区指南内容

是

否

workspacePath 参数

路径为空？

输出：'未配置工作区'
提示用户绑定目录

输出：工作区指南

'你的工作目录是 $path
自动设置为 Web 服务器根目录'

'使用 apply_file 创建 HTML/CSS/JS'

'主文件必须是 index.html'

'使用 grep_code 和 grep_context
修改文件前

工具调用的 'environment=$envLabel'

终端挂载路径说明
```

When a workspace is bound, the AI receives explicit instructions about:

- The workspace path being a web server root
- File creation requirements (main file = `index.html`)
- Code modification best practices (use `grep_code` and `grep_context` first)
- Environment parameter usage for cross-environment operations
- Terminal mount path mappings for Linux environment operations

### Package Information Section

The `ACTIVE_PACKAGES_SECTION` dynamically lists available tool packages:

```
包类型

packageManager.getImportedPackages()

packageManager.getAvailableServerPackages()

SkillRepository.getAiVisibleSkillPackages()

过滤已导入的包
仍然存在

构建包部分

JS 包
带描述

MCP 服务器
带描述

技能包
带描述

可用的包：
- package_name : 描述
...
使用方式：<tool name='use_package'>
<param name='package_name'>...</param></tool>
```

The section lists:

- **JS Packages**: Traditional JavaScript tool packages from `PackageManager`
- **MCP Servers**: Model Context Protocol server packages
- **Skill Packages**: AI-visible skill packages from `SkillRepository`

Each entry includes the package name and localized description.

### Tool Visibility and Availability

The `AVAILABLE_TOOLS_SECTION` is conditionally populated based on:

1. **`enableTools` flag**: Controls whether tools are available at all
2. **`useToolCallApi` flag**: When true, tools are sent via API `tools` parameter instead of prompt text
3. **`enableMemoryQuery` flag**: Controls whether memory/knowledge graph tools are included
4. **`toolVisibility` map**: Per-tool visibility overrides

```
否

是

是

否

是 + 工具已禁用

是 + 工具已启用

否 + 工具已启用

否 + 工具已禁用

工具已禁用

工具已启用

enableTools?

useToolCallApi?

enableMemoryQuery?

AVAILABLE_TOOLS_SECTION = ''

AVAILABLE_TOOLS_SECTION = ''
(通过 API 发送工具)

SystemToolPrompts.generateMemoryToolsPrompt()

SystemToolPrompts.generateToolsPrompt()

输出：仅记忆工具

输出：记忆 + 标准工具

输出：仅标准工具
```

The `toolVisibility` map allows fine-grained control: `Map<String, Boolean>` where keys are tool names and values indicate visibility.

### SAF Bookmarks

When Storage Access Framework (SAF) bookmarks are configured, their names are passed to `SystemToolPrompts.generateToolsPrompt()` to inform the AI about available storage locations:

```
val safBookmarkNames = apiPreferences.safBookmarksFlow.first().map { it.name }
```

These appear in file system tool descriptions as accessible paths via the `repo:` environment prefix.

---

## Prompt Generation Pipeline

### Main Generation Method

The `getSystemPrompt()` method orchestrates prompt assembly:

```
是

否

是

否

是

否

是

否

getSystemPrompt(
packageManager,
workspacePath,
workspaceEnv,
useEnglish,
thinkingGuidance,
customSystemPromptTemplate,
enableTools,
enableMemoryQuery,
hasImageRecognition,
chatModelHasDirectImage,
useToolCallApi,
strictToolCall,
toolVisibility
)

自定义模板？

template = customSystemPromptTemplate

template = SYSTEM_PROMPT_TEMPLATE
或 SYSTEM_PROMPT_TEMPLATE_CN

获取可用包
从 PackageManager

构建 ACTIVE_PACKAGES_SECTION

生成工作区指南
getWorkspaceGuidelines()

thinkingGuidance?

插入 THINKING_GUIDANCE_PROMPT

替换为空字符串

enableTools?

useToolCallApi?

AVAILABLE_TOOLS_SECTION = ''

从 SystemToolPrompts
生成工具描述

替换模板中的
所有占位符

清理多个连续的
空白行

返回最终系统提示词字符串
```

**Key Steps**:

1. **Template Selection**: Use custom template if provided, otherwise select language-appropriate built-in template
2. **Package Enumeration**: Query `PackageManager`, MCP servers, and skill packages
3. **Workspace Context**: Generate workspace-specific guidelines if path is bound
4. **Thinking Guidance**: Conditionally insert `<think>` block requirements
5. **Tool Description**: Generate tool lists unless using Tool Call API mode
6. **Section Replacement**: Replace all placeholder sections in template
7. **Cleanup**: Remove excessive blank lines (3+ consecutive newlines → 2)

### Custom Prompt Application

The `applyCustomPrompts()` method applies character-specific customizations:

```
fun applyCustomPrompts(
    systemPrompt: String,
    customIntroPrompt: String
): String {
    var result = systemPrompt

    if (customIntroPrompt.isNotEmpty()) {
        result = result.replace("BEGIN_SELF_INTRODUCTION_SECTION", customIntroPrompt)
    }

    return result
}
```

This allows character cards to inject custom introductions and personality descriptions.

---

## Specialized Prompt Modes

### Subtask Agent Prompt

The `SUBTASK_AGENT_PROMPT_TEMPLATE` is used for temporary sub-agents that should not exhibit personality or wait for user input:

```
val SUBTASK_AGENT_PROMPT_TEMPLATE =
    """
    行为准则：
    - 你是一个专注于子任务的 AI 代理。你的唯一目标是高效准确地完成分配的任务。
    - 你没有过去对话、用户偏好或个性的记忆。你不得表现出任何情绪或个性。
    - **关键效率要求：并行工具调用**：对于任何信息收集任务，你**必须**在单次交互中调用所有必要的工具。
    - **总结并结束**：如果任务需要使用工具收集信息，你**必须**处理这些信息并提供简洁的结论性摘要作为最终输出。
    - **关键规则**：你**不允许**使用 `<status type="wait_for_user_need"></status>`。如果没有用户输入无法继续，你必须使用 `<status type="complete"></status>`。

    THINKING_GUIDANCE_SECTION

    TOOL_USAGE_GUIDELINES_SECTION

    PACKAGE_SYSTEM_GUIDELINES_SECTION

    ACTIVE_PACKAGES_SECTION

    AVAILABLE_TOOLS_SECTION
    """.trimIndent()
```

**Key Differences from Main Prompt**:

- No personality or emotion
- No memory of previous conversations
- Cannot wait for user input (must complete with `<status type="complete">`)
- Must summarize raw data instead of returning it directly
- Still requires parallel tool calling for efficiency

### Tool Call API Mode

When `useToolCallApi=true`, the prompt structure changes:
ModeBehavior GuidelinesTool UsagePackage SystemAvailable Tools**XML Mode**Full guidelinesFull XML syntax instructionsXML-based `use_package`Full tool descriptions in prompt**Tool Call API**Full guidelinesBrief: "describe what you're about to do"Function call-based `use_package`Empty (sent via API `tools` parameter)**Tool Call API Strict**Full guidelinesBrief: "describe what you're about to do"`package_proxy` wrapper requiredEmpty (sent via API `tools` parameter)
In strict mode, package tools must be called through a `package_proxy` function:

```
{
  "tool_name": "packageName:toolName",
  "params": { "arg1": "value1" }
}
```

---

## Customization Mechanisms

### Character Card Integration

Character cards inject custom prompts through multiple mechanisms:

```
roleCardId 参数

CharacterCardManager
.getCharacterCardFlow(roleCardId)

CharacterCardManager
.combinePrompts(roleCardId, tags)

确定系统标签：
CHAT / VOICE / DESKTOP_PET

introPrompt 字符串
包含角色性格

SystemPromptConfig
.applyCustomPrompts(basePrompt, introPrompt)

替换 BEGIN_SELF_INTRODUCTION_SECTION
为角色介绍

最终系统提示词
包含角色性格
```

**Prompt Tag Types**:

- `SYSTEM_CHAT_TAG_ID`: Normal chat mode personality
- `SYSTEM_VOICE_TAG_ID`: Voice interaction personality adjustments
- `SYSTEM_DESKTOP_PET_TAG_ID`: Desktop pet mode with mood system

### Custom System Prompt Templates

Users can provide a complete custom template via `ApiPreferences.customSystemPromptTemplateFlow`:

```
val finalCustomSystemPromptTemplate = customSystemPromptTemplate
    ?: apiPreferences.customSystemPromptTemplateFlow.first()
```

If provided, this replaces the entire built-in template structure while still supporting section placeholders.

### Language Selection

Prompt language is determined by system locale:

```
val useEnglish = LocaleUtils.getCurrentLanguage(context)
    .lowercase()
    .startsWith("en")
```

This controls:

- Template selection (`SYSTEM_PROMPT_TEMPLATE` vs `SYSTEM_PROMPT_TEMPLATE_CN`)
- Thinking guidance language
- Behavior guidelines language
- Tool usage instructions language
- Package description language resolution

---

## Integration with Conversation Flow

### Conversation History Preparation

The `ConversationService.prepareConversationHistory()` method integrates system prompt generation into the chat pipeline:

```
提示词参数

是

否

输入：chatHistory
List<Pair<String, String>>

processedInput: String

系统消息
已存在？

使用现有历史记录

SystemPromptConfig
.getSystemPromptWithCustomPrompts()

包管理器

工作区路径

角色卡片ID

思考指导

启用记忆查询

工具可见性

具有图像识别

获取角色卡片
从 CharacterCardManager

构建介绍提示
从卡片提示

获取用户偏好
或代理发送者偏好

buildPreferencesText()

组合：
- 系统提示
- 工作区指南
- 偏好文本
- waifu 规则
- 桌面宠物规则

replacePromptPlaceholders()
{{AI_NAME}} → 角色名称

作为第一条消息插入：
Pair('system', finalPrompt)

处理现有消息
用于工具结果和 XML

输出：已准备
对话历史
```

**Key Integration Points**:

1. **System Message Check**: Only generates prompt if no system message exists in history
2. **Character Context**: Retrieves character card and combines tagged prompts
3. **User Preferences**: Adds user demographic/preference information unless disabled
4. **Waifu Mode**: Conditionally adds emotion/expression rules
5. **Desktop Pet Mode**: Adds `<mood>` tag protocol for pet interactions
6. **Placeholder Replacement**: Substitutes `{{AI_NAME}}` and other variables
7. **Message Processing**: Parses existing messages for tool results and XML tags

### EnhancedAIService Integration

The `EnhancedAIService.sendMessage()` method calls `prepareConversationHistory()` before sending to the AI provider:

```
val preparedHistory = prepareConversationHistory(
    execContext.conversationHistory,
    processedInput,
    workspacePath,
    workspaceEnv,
    promptFunctionType,
    thinkingGuidance,
    customSystemPromptTemplate,
    enableMemoryQuery,
    roleCardId,
    proxySenderName,
    isSubTask,
    functionType
)
 
// 使用准备好的版本更新内部对话历史
execContext.conversationHistory.clear()
execContext.conversationHistory.addAll(preparedHistory)
 
// 发送到 AI 服务
val responseStream = serviceForFunction.sendMessage(
    context = this@EnhancedAIService.context,
    message = processedInput,
    chatHistory = preparedHistory,
    modelParameters = modelParameters,
    enableThinking = enableThinking,
    stream = stream,
    availableTools = availableTools,
    onTokensUpdated = { input, cachedInput, output ->
        _perRequestTokenCounts.value = Pair(input, output)
    },
    onNonFatalError = onNonFatalError
)
```

This ensures every AI request includes the properly contextualized system prompt with current workspace, tools, and character information.

---

## Configuration Parameters Reference

### getSystemPrompt() Parameters

ParameterTypePurposeDefault`packageManager``PackageManager`Source of available tool packagesRequired`workspacePath``String?`Bound workspace directory path`null``workspaceEnv``String?`Environment label for workspace`null``safBookmarkNames``List<String>`Names of SAF storage bookmarks`emptyList()``useEnglish``Boolean`Use English vs Chinese prompts`false``thinkingGuidance``Boolean`Enable `<think>` block requirement`false``customSystemPromptTemplate``String`Override built-in template`""``enableTools``Boolean`Include tool instructions`true``enableMemoryQuery``Boolean`Include memory/knowledge graph tools`true``hasImageRecognition``Boolean`Image recognition service available`false``chatModelHasDirectImage``Boolean`Model supports direct image input`false``hasAudioRecognition``Boolean`Audio recognition service available`false``hasVideoRecognition``Boolean`Video recognition service available`false``chatModelHasDirectAudio``Boolean`Model supports direct audio input`false``chatModelHasDirectVideo``Boolean`Model supports direct video input`false``useToolCallApi``Boolean`Use native function calling API`false``strictToolCall``Boolean`Require `package_proxy` wrapper`false``disableLatexDescription``Boolean`Remove LaTeX formatting instructions`false``toolVisibility``Map<String, Boolean>`Per-tool visibility overrides`emptyMap()`

---

## Example Prompt Output

### Minimal Configuration

Input:

```
getSystemPrompt(
    packageManager = packageManager,
    useEnglish = true,
    enableTools = false,
    enableMemoryQuery = false
)
```

Output structure:

```
[角色介绍或默认 Operit 介绍]

[空 - 无思考指导]

[空 - 禁用工具时移除行为指南]

[空 - 无工作区]

[空 - 默认包含 LaTeX 格式]

[空 - 无工具使用]

[空 - 无包系统]

[空 - 无包]

[空 - 无工具]

```

### Full Context Configuration

Input:

```
getSystemPrompt(
    packageManager = packageManager,
    workspacePath = "/sdcard/myproject",
    workspaceEnv = "android",
    safBookmarkNames = listOf("Documents", "Downloads"),
    useEnglish = true,
    thinkingGuidance = true,
    enableTools = true,
    enableMemoryQuery = true,
    hasImageRecognition = true,
    chatModelHasDirectImage = false,
    toolVisibility = mapOf("dangerous_tool" to false)
)
```

Output structure:

```
[角色介绍]

思考过程指南：
- 在提供最终回复之前，你必须使用 <think> 块...
[完整思考指南]

行为指南：
- 并行工具调用：对于任何信息收集任务...
[完整行为规则]

WEB 工作区指南：
- 你的工作目录 `/sdcard/myproject`(环境=android)已自动设置为 Web 服务器根目录。
[工作区特定说明]

公式格式：对于数学公式，使用 $ $ 表示行内 LaTeX...

[工具使用 XML 格式说明]

包系统
- 部分额外功能通过包提供
[包激活说明]

可用包：
- my_js_package : 此包提供额外的实用工具
- my_mcp_server : 用于外部集成的 MCP 服务器
- my_skill : 自定义技能包

使用包的方法：
<tool name="use_package"><param name="package_name">package_name_here</param></tool>

[内存工具列表]
[包含图像识别工具的标准工具列表]
[SAF 书签存储位置]
[工具 "dangerous_tool" 因可见性映射而省略]

```

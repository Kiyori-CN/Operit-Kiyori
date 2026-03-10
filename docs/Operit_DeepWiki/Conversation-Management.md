# 对话管理

## 目的与范围

本文档描述 Operit 如何为 AI 交互准备对话上下文并管理文件绑定操作。核心组件包括：

- **ConversationService**：准备包含系统提示词、角色卡片和工具定义的对话历史
- **FileBindingService**：使用模糊匹配算法应用 AI 生成的文件补丁
- **SystemPromptConfig**：根据可用工具、包和工作区状态生成动态系统提示词
- **Token 管理**：跟踪上下文窗口使用情况并触发自动摘要

本页重点介绍 `EnhancedAIService` 中将原始聊天消息转换为 AI 就绪对话上下文的服务。有关消息流编排，请参阅 [消息处理](/AAswordman/Operit/3.3-message-processing)。有关数据库持久化，请参阅 [聊天历史管理](/AAswordman/Operit/3.4-chat-history-management)。

---

## 概述

对话管理系统为 AI 交互准备完整的上下文包。`ConversationService` 将原始消息列表转换为包含系统提示词的结构化对话，而 `FileBindingService` 处理将 AI 生成的代码补丁应用到现有文件的复杂任务。

**关键设计原则：**

- **面向服务**：核心逻辑位于 `EnhancedAIService` 中的 `ConversationService` 和 `FileBindingService`
- **动态提示词生成**：系统提示词根据可用工具、工作区状态和活动包进行调整
- **模糊文件补丁**：文件绑定使用基于 LCS 的模糊匹配来处理空白字符变化
- **自动摘要**：长对话触发 AI 生成的摘要以压缩上下文

### 高层架构

```
File Operations

Context Building

Configuration

EnhancedAIService

ConversationService
prepareConversationHistory()

FileBindingService
processFileBinding()

MultiServiceManager

SystemPromptConfig
getSystemPrompt()

PackageManager
Tool packages

CharacterCardManager
Personas

ApiPreferences
Settings

Build System Prompt

Process Tool Results

Add Character Personality

Prepare Message Array

Parse Edit Operations

Fuzzy Match
findBestMatchRange()

Apply Patch
applyFuzzyOperations()

Generate Unified Diff
```

---

## 系统提示词生成

`SystemPromptConfig` 对象根据当前环境状态动态生成系统提示词。提示词会根据可用工具、已激活的包、工作区配置和用户偏好进行调整。

### 系统提示词组成部分

**系统提示词组装流程：**

```
getSystemPrompt()

Select Template
SYSTEM_PROMPT_TEMPLATE

Get Available Packages
PackageManager

Get Workspace Path

Get SAF Bookmarks

Build Introduction Section
BEGIN_SELF_INTRODUCTION_SECTION

Add Thinking Guidance
THINKING_GUIDANCE_SECTION

Add Behavior Guidelines
BEHAVIOR_GUIDELINES

Add Workspace Guidelines
WEB_WORKSPACE_GUIDELINES_SECTION

Add Tool Usage Guide
TOOL_USAGE_GUIDELINES_SECTION

List Available Packages
PACKAGE_SYSTEM_GUIDELINES_SECTION

Generate Tool Descriptions
AVAILABLE_TOOLS_SECTION

Replace Placeholders

Clean Multiple Newlines

Complete System Prompt
```

**模板结构：**

```
BEGIN_SELF_INTRODUCTION_SECTION
THINKING_GUIDANCE_SECTION
BEHAVIOR_GUIDELINES
WEB_WORKSPACE_GUIDELINES_SECTION
TOOL_USAGE_GUIDELINES_SECTION
PACKAGE_SYSTEM_GUIDELINES_SECTION
ACTIVE_PACKAGES_SECTION
AVAILABLE_TOOLS_SECTION

```

每个部分根据以下条件进行填充：

- `thinkingGuidance` - 是否包含 `<think>` 块指令
- `enableTools` - 是否包含工具定义
- `enableMemoryQuery` - 是否包含记忆系统工具
- `useToolCallApi` - 工具是通过 API 发送还是在提示词中发送
- `workspacePath` - 当前 web 工作区绑定

**关键方法签名：**

```
fun getSystemPrompt(
    packageManager: PackageManager,
    workspacePath: String? = null,
    workspaceEnv: String? = null,
    safBookmarkNames: List<String> = emptyList(),
    useEnglish: Boolean = false,
    thinkingGuidance: Boolean = false,
    customSystemPromptTemplate: String = "",
    enableTools: Boolean = true,
    enableMemoryQuery: Boolean = true,
    hasImageRecognition: Boolean = false,
    chatModelHasDirectImage: Boolean = false,
    hasAudioRecognition: Boolean = false,
    hasVideoRecognition: Boolean = false,
    chatModelHasDirectAudio: Boolean = false,
    chatModelHasDirectVideo: Boolean = false,
    useToolCallApi: Boolean = false,
    strictToolCall: Boolean = false,
    disableLatexDescription: Boolean = false,
    toolVisibility: Map<String, Boolean> = emptyMap()
): String
```

**包列表：**

提示中列出了可用的包，包括：

- **JS Packages**：从 `PackageManager` 导入
- **MCP Servers**：可用的 Model Context Protocol 服务器
- **Skills**：用户可安装的技能包

示例包部分：

```
Available packages:
- automatic_ui_subagent : Provides UI automation capabilities
- web_scraper : Tools for extracting content from websites
- code_analyzer : Static analysis tools for code review

To use a package:
<tool name="use_package"><param name="package_name">package_name_here</param></tool>

```

**Workspace Context：**

当绑定工作区时，提示包含文件系统挂载信息和最佳实践：

```
WEB WORKSPACE GUIDELINES:
- Your working directory, `/path/to/workspace` (environment=linux), is automatically set up as a web server root.
- Terminal mount note: common mounts include `/storage/emulated/0 -> /sdcard`,
  `/storage/emulated/0 -> /storage/emulated/0`, and app sandbox
  `/data/user/0/com.ai.assistance.operit/files -> same path`.
- If the workspace is under mounted paths, execute workspace files directly in
  the Linux terminal environment; do not copy files before execution.
- **Best Practice for Code Modifications**: Before modifying any file, use
  `grep_code` and `grep_context` to locate and understand relevant code with
  surrounding context.

```

---

## 对话历史准备

`ConversationService` 类为 AI 使用准备对话历史。这包括：

1. 构建包含所有上下文的完整系统提示
2. 处理聊天历史中的工具结果
3. 合并角色卡个性
4. 将消息格式化为特定提供商的结构

### 准备流程

**高层流程：**

```
PackageManager
CharacterCardManager
SystemPromptConfig
ConversationService
EnhancedAIService
PackageManager
CharacterCardManager
SystemPromptConfig
ConversationService
EnhancedAIService
alt
[No System Prompt]
alt
[Has Tool Results]
[No Tool Results]
loop
[For each assistant message]
prepareConversationHistory(chatHistory, processedInput, workspacePath, ...)
Check if system prompt exists
Get active character card
combinePrompts(characterCardId, systemTags)
Character introduction
getSystemPromptWithCustomPrompts(packageManager, workspacePath, ...)
getImportedPackages()
getAvailableServerPackages()
Build package list section
Generate workspace guidelines
Build tool descriptions
Complete system prompt
Build final prompt with character card + waifu rules + desktop pet rules
replacePromptPlaceholders(aiName)
Add system message to history
Process each message with tool results
splitXmlTag(content)
processChatMessageWithTools(content, xmlTags)
Separate text, tool_result, status tags
Merge consecutive same-role messages
Add message as-is
Prepared history List<Pair<String, String>>
```

**方法签名：**

```
suspend fun prepareConversationHistory(
    chatHistory: List<Pair<String, String>>,
    processedInput: String,
    workspacePath: String?,
    workspaceEnv: String? = null,
    packageManager: PackageManager,
    promptFunctionType: PromptFunctionType,
    thinkingGuidance: Boolean = false,
    customSystemPromptTemplate: String? = null,
    enableMemoryQuery: Boolean = true,
    roleCardId: String? = null,
    proxySenderName: String? = null,
    hasImageRecognition: Boolean = false,
    hasAudioRecognition: Boolean = false,
    hasVideoRecognition: Boolean = false,
    chatModelHasDirectAudio: Boolean = false,
    chatModelHasDirectVideo: Boolean = false,
    useToolCallApi: Boolean = false,
    strictToolCall: Boolean = false,
    chatModelHasDirectImage: Boolean = false
): List<Pair<String, String>>
```

### 工具结果处理

在处理包含工具调用和结果的助手消息时,服务使用 `splitXmlTag()` 解析 XML 结构化内容:

**XML 标签提取:**

```
Parsed Tags

Assistant Message Content

splitXmlTag(content)
NativeXmlSplitter

text tags
(plain text)

think tags
(reasoning)

tool tags
(invocations)

tool_result tags
(results)

status tags
(complete/wait)

Classify by Role

Assistant Messages:
text, think, tool,
status:complete,
status:wait_for_user_need

User Messages:
tool_result,
other status types

Merge Consecutive
Same-Role Messages

List of (role, content) pairs
```

位于的 `processChatMessageWithTools()` 方法处理此逻辑:

1. 使用原生分割器解析 XML 标签
2. 按角色(助手 vs 用户)对每个标签进行分类
3. 合并具有相同角色的连续消息
4. 将合并的片段添加到对话历史

这确保了对话数组中的消息正确交替,以满足需要严格用户/助手交替的 AI 提供商要求。

### 角色卡集成

当角色卡处于激活状态时(通过 `roleCardId` 参数),服务会:

1. 使用 `CharacterCardManager` 检索角色卡
2. 将角色提示词与系统标签(例如 `SYSTEM_CHAT_TAG_ID`、`SYSTEM_VOICE_TAG_ID`、`SYSTEM_DESKTOP_PET_TAG_ID`)组合
3. 将占位符 `{{AI_NAME}}` 替换为角色名称
4. 添加特殊模式规则(例如 waifu 模式、桌面宠物模式)

**桌面宠物情绪系统:**

对于 `PromptFunctionType.DESKTOP_PET`,服务添加情绪标签协议:

```
[Desktop Pet Mood]
你当前处于"桌宠环境"。请使用以下情绪系统与输出规范：

一、情绪触发与强度判定（从强到弱）
强触发（必出标签）：用户出现明显的情感信号或强语气词/标点
中触发（一般出标签）：用户带有清晰但不极端的情绪倾向
弱触发或平静（不出标签）：陈述事实、提问、日常闲聊、礼貌用语。

二、情绪类别映射（只用以下 5 个值）
侮辱/不公/责备 → <mood>angry</mood>
明确表扬/达成目标/收到礼物 → <mood>happy</mood>
被夸/被戳到可爱点/轻微暧昧 → <mood>shy</mood>
被调侃又不想服软/小争执里的可爱不服 → <mood>aojiao</mood>
受挫/失落/道歉+难过/讲伤心事 → <mood>cry</mood>
...

## 文件绑定服务

`FileBindingService` 使用模糊匹配将 AI 生成的代码补丁应用到现有文件。这对于 `apply_file` 工具至关重要,该工具允许 AI 在不需要精确行号的情况下修改代码。

### 文件补丁概述

**问题:** AI 模型无法可靠地预测未完整读取的文件中的精确行号。空格、注释和格式变化使基于行号的补丁变得脆弱。

**解决方案:** 使用模糊内容匹配。AI 提供 `[OLD]` 和 `[NEW]` 内容块,服务使用 LCS(最长公共子序列)相似度在目标文件中找到最佳匹配。

### 补丁格式

AI 使用结构化编辑块生成补丁:

```

[START-REPLACE]
[OLD]
function calculateTotal(items) {
return items.reduce((sum, item) => sum + item.price, 0);
}
[/OLD]
[NEW]
function calculateTotal(items) {
return items.reduce((sum, item) => sum + item.price, 0) \* 1.1; // Add tax
}
[/NEW]
[END-REPLACE]

[START-DELETE]
[OLD]
// This function is deprecated
function oldHelper() {
console.log("Don't use this");
}
[/OLD]
[END-DELETE]

```

**编辑操作:**
操作描述必需字段`REPLACE`用新内容替换匹配的内容`[OLD]` 和 `[NEW]``DELETE`删除匹配的内容仅 `[OLD]`

### 模糊匹配算法

**匹配策略：**

```

Yes

No

Yes

No

Parse Edit Operations

Normalize Content
Remove all whitespace

Build N-gram Set
from OLD content

Prepare Target File
Build line index

For Each Window Size
targetSize ± 20%

Slide Window
Across File

Calculate Similarity
ngramSimilarity()

Better Match?

Update Best Match
bestScore, bestStart, bestEnd

Perfect Match
100% similarity?

Continue Searching

Apply Patch

```

**关键算法步骤：**

1. **规范化**

- 从 OLD 内容和目标文件中移除所有空白字符
- 构建字符级索引映射行到位置

2. **N-gram 构建**

- 从规范化的 OLD 内容创建 3 字符 n-gram
- 用作相似度计算的指纹

3. **窗口滑动**

- 测试大小为 `numOldLines ± 20%` 的窗口
- 跨 CPU 核心并行处理以提升性能

4. **相似度评分**

- 计算 Jaccard 相似度：`|交集| / |并集|`
- 优先选择大小差异较小的匹配
- 平局时选择位置更靠前的匹配

5. **补丁应用**

- 从匹配范围中删除旧行
- 插入新行(用于 REPLACE 操作)
- 为单行替换保留缩进

### 歧义处理

**多个完全匹配：**

```

Yes

No

Find Best Match

hasMultiplePerfectMatches()

Multiple 100%
matches found?

Reject Patch
Error: Ambiguous

Apply Patch

```

如果 OLD 内容以 100% 相似度出现多次，补丁将被拒绝以防止意外修改错误的位置。AI 必须提供更多上下文来消除歧义。

### Diff 生成

成功打补丁后，服务会生成统一的 diff：

```

Changes: +5 -3 lines
@@ -10,7 +10,7 @@
8 | function processData(data) {
9 | const cleaned = data.filter(x => x !== null);
-10 | return cleaned;
+10 | return cleaned.sort();
11 | }
12 |
@@ -20,4 +20,7 @@
18 | export { processData };
19 |
+20 | // New helper function
+21 | function sortData(arr) {
+22 | return arr.sort((a, b) => a - b);
+23 | }

```

diff 格式使用：

- `-` 前缀表示删除的行
- `+` 前缀表示添加的行
- 左侧显示行号
- `|` 分隔符位于内容之前

---

## 对话摘要

当对话超过令牌限制时，系统会生成 AI 驱动的摘要来压缩历史记录。

### 摘要触发

**决策逻辑：**

```

No

Yes

Yes

No

Yes

No

Summary
Enabled?

Token Usage >
Threshold?

Message Count >
Threshold?

Generate Summary

Skip Summarization

```

摘要在以下情况触发：

1. `currentTokens / maxTokens >= tokenUsageThreshold`(通常为 0.7)
2. 或自上次摘要以来的用户消息数 >= `summaryMessageCountThreshold`

### 摘要生成

`ConversationService.generateSummary()` 方法使用 `SUMMARY` 函数类型，配合专用提示词：

**提示词结构：**

```

你是负责生成对话摘要的AI助手。你的任务是根据"上一次的摘要"（如果提供）和"最近的对话内容"，
生成一份全新的、独立的、全面的摘要。

**必须严格遵循以下固定格式输出：**

==========对话摘要==========

【核心任务状态】
[当前任务上下文、进度、依赖项]

【互动情节与设定】
[场景设定、角色扮演上下文]

【对话历程与概要】
[多段落总结，包含 行动→目的→结果]

【关键信息与上下文】

- 信息点 1: 用户需求、限制
- 信息点 2: 技术/结构元素
- 信息点 3: 问题探索路径
  ...

============================

```

**关键特性：**

- **自包含**：必须替换所有先前消息
- **增量式**：可以基于先前摘要构建
- **结构化**：固定格式以保持一致性
- **渐进式更新**：通过 `ToolProgressBus` 发出进度

---

## Token 管理

系统跟踪 token 使用情况以管理上下文窗口大小并触发摘要生成。

### Token 计数

`EnhancedAIService` 通过 AI 提供商的回调更新 token 计数：

```

// In sendMessage()
val responseStream = serviceForFunction.sendMessage(
context = this.context,
message = processedInput,
chatHistory = preparedHistory,
modelParameters = modelParameters,
onTokensUpdated = { input, cachedInput, output ->
\_perRequestTokenCounts.value = Pair(input, output)
}
)

```

**Token 持久化：**

每轮对话后，token 会持久化到 `ApiPreferences`：

```

apiPreferences.updateTokensForProviderModel(
serviceForFunction.providerModel,
inputTokens,
outputTokens,
cachedInputTokens
)

 
apiPreferences.incrementRequestCountForProviderModel(
serviceForFunction.providerModel
)

```

### 上下文窗口计算

当前上下文窗口大小为：

```

currentWindowSize = cumulativeInputTokens + cumulativeOutputTokens

```

当超过 `maxTokens * tokenUsageThreshold` 时，会触发摘要生成。

---

## 集成点

### 对话管理接触点

组件集成方法用途`EnhancedAIService`Token 更新回调实时 token 计数`ConversationService`消息历史访问上下文准备`WorkspaceManager`工作区绑定聊天-工作区关联`CharacterCardManager`活动卡片流开场白同步`ToolHandler`工具执行上下文聊天范围的工具权限`NotificationService`聊天元数据在通知中显示聊天标题
```

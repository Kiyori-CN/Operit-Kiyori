# Phone Agent

Phone Agent 是一个多步骤 AI 驱动的编排器，通过使用视觉语言模型理解屏幕内容并决定操作来自动化 Android UI 交互，以完成用户任务。它作为一个专门的子代理运行，可以通过截图分析、动作规划和执行的迭代循环来执行复杂的 UI 工作流。

有关 Phone Agent 用于动作执行的权限通道信息，请参阅 [Permission Channels](/AAswordman/Operit/6.2-permission-channels)。有关支持并行代理会话的虚拟显示系统的详细信息，请参阅 [Virtual Display System](/AAswordman/Operit/6.3-virtual-display-system)。有关底层 UI 工具和动作执行，请参阅 [UI Tools and Actions](/AAswordman/Operit/6.4-ui-tools-and-actions) 和 [Action Execution](/AAswordman/Operit/6.5-action-execution)。

---

## 概述

Phone Agent 实现了一个自主代理循环，其中 AI 模型分析截图、推理当前状态，并发出结构化动作(点击、滑动、输入等)以朝着用户指定的目标前进。每次代理运行都是独立且无状态的，需要在初始提示中提供完整的任务上下文。

**关键特性：**

- 多步骤迭代执行，可配置最大步数(默认：20)
- 通过截图进行基于视觉的屏幕理解
- 使用类 XML 标签(`<think>`、`<answer>`、`<action>`)进行结构化动作解析
- 支持主屏幕和隔离的虚拟显示会话
- 跨步骤的上下文历史累积
- 暂停/恢复功能以便用户干预

**主要用例：**

1. 自动化应用导航和交互
2. 多步骤工作流(例如：搜索 → 筛选 → 提取数据)
3. 通过虚拟显示在多个应用间并行自动化
4. UI 测试和验证

---

## 核心架构

### 组件概述

```
Screen Management

Action Execution

AI Decision Making

PhoneAgent Orchestration

PhoneAgent
(Multi-step Loop)

AgentConfig
(maxSteps, timeouts)

StepResult
(success, finished,
action, thinking)

_contextHistory
(List<role, content>)

AIService
(UI_CONTROLLER function)

System Prompt
(UI automation instructions)

Response Parsing
(<think>/<answer>/<action>)

ActionHandler
(Action parser & executor)

ParsedAgentAction
(actionName, fields)

ToolImplementations
(StandardUITools/
AccessibilityUITools/etc)

Screenshot Capture
(MediaProjection)

Virtual Display Check
(ShowerController)

UIAutomationProgressOverlay
or VirtualDisplayOverlay
```

**核心组件：**
组件文件/行数用途`PhoneAgent`包含元数据、名称和字段的已解析动作`ActionHandler`在 ActionHandler.kt 中引用解析并执行代理动作`ToolImplementations`StandardUITools/AccessibilityUITools平台特定动作执行的接口

---

## 代理配置

`AgentConfig` 数据类为代理执行提供配置参数：

```
data class AgentConfig(
    val maxSteps: Int = 20
)
```

**配置参数：**
参数类型默认值描述`maxSteps``Int`20代理在终止前将执行的最大步骤数
最大步骤数限制可防止无限循环，并确保即使任务无法完成，代理也会终止。当达到限制时，代理返回 `"Max steps reached"` 消息。

---

## 执行流程

### Agent 循环架构

```
Yes

No

Yes

No

Yes

No

run(task, systemPrompt, ...)

Initialize
- Reset state
- Setup UI overlays
- Check virtual display

Execute First Step
- Add user task to history
- Capture screenshot
- Send to AI model

Parse AI Response
- Extract <think>
- Extract <answer>
- Parse <action>

Action
metadata =
finish?

Execute Action via
ActionHandler

Update Progress Overlay
(step count, status)

Increment step count

stepCount ≥
maxSteps?

Execute Next Step
- Add screen info to history
- Send to AI model

Parse AI Response

Action
metadata =
finish?

Return final message

Return 'Max steps reached'

Cleanup
- Restore floating window
- Hide overlays
- Shutdown virtual display
(if cleanupOnFinish)
```

### 步骤执行详情

`_executeStep()` 方法实现了核心步骤逻辑：

1. **截图捕获**：通过 `ActionHandler.captureScreenshotForAgent()` 捕获当前屏幕状态
2. **消息构建**：构建包含截图链接和可选任务描述的用户消息(仅首步)
3. **AI 请求**：通过 `uiService.sendMessage()` 向 UI 控制器模型发送消息
4. **响应流式传输**：将流式响应块收集为完整响应文本
5. **响应解析**：提取 `<think>`(推理)和 `<answer>`(结构化响应)部分
6. **动作解析**：从 `<action>` XML 块解析动作
7. **动作执行**：如果动作元数据为 "do"，则通过 `ActionHandler.executeAgentAction()` 执行
8. **历史更新**：将助手响应追加到上下文历史
9. **结果返回**：返回包含成功状态、完成标志、动作和思考的 `StepResult`

---

## 动作系统

### 动作结构

动作通过类 XML 标签从 AI 模型的响应中解析：

```
<action>
Tap {"x": 500, "y": 800}
</action>
```

`ParsedAgentAction` 数据类封装了解析的动作：

```
data class ParsedAgentAction(
    val metadata: String,       // "do" or "finish"
    val actionName: String?,    // e.g., "Tap", "Swipe", "Launch"
    val fields: Map<String, String>  // Action parameters
)
```

**元数据值：**

- `"do"`：执行动作(点击、滑动、启动等)
- `"finish"`：任务完成，终止 agent 循环

### 支持的动作

`ActionHandler` 支持以下动作类型：
动作参数说明`Tap``x`, `y`在屏幕坐标处点击`LongPress``x`, `y`在坐标处长按`Swipe``x1`, `y1`, `x2`, `y2`, `duration`滑动手势`Type``text`通过输入法输入文本`PressKey``key`按下系统按键(BACK、HOME、RECENT、ENTER)`Launch``app`通过名称或包名启动应用`Finish``message`完成任务并返回消息
动作通过 `ToolImplementations` 接口执行，该接口根据用户的权限级别(标准/无障碍/调试器/Root)提供特定平台的实现。

---

## 屏幕模式

### 主屏幕 vs 虚拟显示

Phone Agent 根据 `agentId` 参数支持两种执行模式：

```
default/blank

non-default

agentId Parameter

Main Screen Mode
(agentId = 'default' or blank)

Virtual Display Mode
(agentId ≠ 'default')

Operates on
physical device screen

Uses UIAutomationProgressOverlay
(fullscreen indicator)

Optional: Shower main display
(for screenshot)

Operates on isolated
virtual display

Uses VirtualDisplayOverlay
(border + controls)

Uses Shower virtual display
(required)
```

### 模式特性

方面主屏幕模式虚拟显示模式**屏幕**物理设备显示(displayId=0)隔离的虚拟显示(displayId>0)**可见性**用户在物理屏幕上看到动作动作在后台虚拟显示中发生**并行性**一次只能一个代理多个代理可以并行运行**会话复用**不支持通过 agentId 支持**清理**无需清理完成时可选清理**UI 指示器**`UIAutomationProgressOverlay``VirtualDisplayOverlay`**要求**标准权限ADB/调试器权限 + Shower 服务器

### Agent ID 管理

代理使用 `agentId` 管理会话：

- **主屏幕代理**：`agentId == "default"` 或 `agentId.isBlank()`

- 物理屏幕上的单一全局会话
- 无需虚拟显示
- 无法跨调用复用(每次调用都是独立的)
- **虚拟显示代理**：`agentId != "default" && agentId.isNotBlank()`

- 由 agentId 标识的隔离虚拟显示会话
- 需要 Shower 服务器和虚拟显示创建
- 可以跨调用复用以保持应用上下文
- 多个代理可以使用不同的 agentId 并行运行

---

## 虚拟显示集成

### 虚拟显示设置

Phone Agent 与 Shower 虚拟显示系统集成，以实现隔离的自动化会话：

```
VirtualDisplayOverlay
ShowerController
ShowerServerManager
PhoneAgent
VirtualDisplayOverlay
ShowerController
ShowerServerManager
PhoneAgent
alt
[Server start
failed]
alt
[Display
creation failed]
ensureRequiredVirtualScreenOrError()
Check permission level
(must be ADB/Debugger/Root)
ensureServerStarted(context)
okServer (true/false)
Return error message
ensureDisplay(agentId, context,
width, height, dpi, bitrateKbps)
okDisplay (true/false)
getDisplayId(agentId)
displayId or null
Return error message
getInstance(context, agentId).show(displayId)
Overlay visible
Continue with agent loop
```

### 预热策略

该代理实现了两种预热策略以减少初始设置开销：

**1. 主屏幕 Shower 预热**(主屏幕模式)：

```
private suspend fun prewarmMainScreenShowerIfPossible(): Boolean
```

- 确保 Shower 服务器正在运行
- 准备主显示器(displayId=0)以进行屏幕截图捕获
- 不创建虚拟显示，仅通过 Shower 启用主屏幕捕获
- 当 `isMainScreenAgent == true` 时使用

**2. 虚拟显示预热**(虚拟显示模式)：

```
private suspend fun prewarmShowerIfNeeded(
    hasShowerDisplayAtStart: Boolean,
    targetApp: String?
): Pair<Boolean, String?>
```

- 如果提供了 `targetApp` 且虚拟显示尚不存在
- 为目标应用执行 `Launch` 操作
- 这会触发虚拟显示创建作为副作用
- 通过准备好显示来减少第一步的延迟

### 清理行为

`cleanupOnFinish` 参数控制资源清理：

```
class PhoneAgent(
    // ...
    val agentId: String = "default",
    private val cleanupOnFinish: Boolean = (agentId != "default"),
)
```

- **主屏幕代理**：`cleanupOnFinish = false`(无需清理)
- **虚拟显示代理**：`cleanupOnFinish = true`(默认)或 `false`(用于会话重用)

清理包括：

- 隐藏 `VirtualDisplayOverlay`
- 通过 `ShowerController.shutdown(agentId)` 关闭虚拟显示

---

## 状态管理

### 上下文历史

代理在 `_contextHistory` 中维护对话历史：

```
private val _contextHistory = mutableListOf<Pair<String, String>>()
val contextHistory: List<Pair<String, String>>
    get() = _contextHistory.toList()
```

**历史结构：**

- 每个条目是一个 `Pair<String, String>`，格式为 `(role, content)`
- 角色：`"system"`、`"user"`、`"assistant"`
- 历史记录在单次 `run()` 调用的所有步骤中累积
- 第一个条目始终是系统提示词
- 后续条目在用户(截图信息)和助手(AI 响应)之间交替

**历史生命周期：**

1. `reset()` 清除历史并重置步骤计数
2. 系统提示词在 `run()` 开始时添加
3. 每个步骤添加用户消息(截图)和助手响应
4. 历史记录在每个步骤传递给 AI 模型以提供上下文

### 步骤计数器

```
private var _stepCount = 0
val stepCount: Int
    get() = _stepCount
```

在每次 `_executeStep()` 调用开始时递增。用于：

- 跟踪 UI 更新的进度
- 强制执行 `maxSteps` 限制
- 在日志中显示步骤编号

### 暂停/恢复状态

代理通过 `StateFlow<Boolean>` 支持暂停：

```
private var pauseFlow: StateFlow<Boolean>? = null
 
private suspend fun awaitIfPaused() {
    val flow = pauseFlow ?: return
    if (!flow.value) return
    while (flow.value) {
        delay(200)
    }
}
```

暂停流程为：

- 在 `run()` 开始时从 `isPausedFlow` 参数设置
- 在每个步骤执行前通过 `awaitIfPaused()` 检查
- 当暂停时(flow 值为 `true`)，agent 在循环中休眠直到恢复
- 由用户通过 UI 覆盖层按钮控制(切换暂停/恢复)

---

## UI 集成

### 进度覆盖层

agent 使用两种覆盖层类型显示实时进度反馈：

**1. UIAutomationProgressOverlay**(主屏幕模式)：

```
val progressOverlay = UIAutomationProgressOverlay.getInstance(context)
progressOverlay.show(
    config.maxSteps,
    "Thinking...",
    onCancel = { /* ... */ },
    onToggleTakeOver = { isPaused -> pausedMutable?.value = isPaused }
)
progressOverlay.updateProgress(stepCount, config.maxSteps, statusText)
```

**2. VirtualDisplayOverlay**(虚拟显示模式)：

```
val showerOverlay = VirtualDisplayOverlay.getInstance(context, agentId)
showerOverlay?.showAutomationControls(
    totalSteps = config.maxSteps,
    initialStatus = "Thinking...",
    onTogglePauseResume = { isPaused -> pausedMutable?.value = isPaused },
    onExit = { /* ... */ }
)
showerOverlay?.updateAutomationProgress(stepCount, config.maxSteps, statusText)
```

### 动态覆盖层切换

agent 可以在执行过程中从全屏覆盖层切换到虚拟显示覆盖层：

```
Yes

No

Agent starts
(no virtual display yet)

Use UIAutomationProgressOverlay
(fullscreen indicator)

Execute first step
(may create virtual display)

Virtual display
now exists?

Hide fullscreen overlay

Switch to VirtualDisplayOverlay
(border + controls)

Continue with
fullscreen overlay

Continue agent loop
```

切换发生在以下情况：

- agent 启动时没有虚拟显示(例如，主屏幕预热未创建虚拟显示)
- 第一步执行触发虚拟显示创建的 `Launch` 操作
- agent 通过 `hasShowerDisplay()` 检测到虚拟显示存在
- agent 隐藏全屏覆盖层并切换到虚拟显示覆盖层

---

## 工具包集成

### StandardUITools.runUiSubAgent

`StandardUITools` 类提供了一个包装方法 `runUiSubAgent()`，工具包可以调用它来调用 Phone Agent：

```
open suspend fun runUiSubAgent(tool: AITool): ToolResult
```

**方法行为：**

1. 提取参数：`intent`、`max_steps`、`agent_id`、`target_app`
2. 验证 UI 控制器模型是否启用了视觉能力
3. 检索 `FunctionType.UI_CONTROLLER` 的专用 AI 服务
4. 构建 UI 自动化系统提示
5. 使用屏幕尺寸创建 `ActionHandler`
6. 使用配置实例化 `PhoneAgent`
7. 使用任务和系统提示执行 `agent.run()`
8. 返回包含 `AutomationExecutionResult` 数据的 `ToolResult`

**返回值：**

```
data class AutomationExecutionResult(
    val functionName: String,
    val providedParameters: Map<String, String>,
    val agentId: String,
    val displayId: Int?,
    val executionSuccess: Boolean,
    val executionMessage: String,
    val executionError: String?,
    val finalState: String?,
    val executionSteps: Int
)
```

### 自动 UI 子代理包

`automatic_ui_subagent` 工具包为主 AI 代理提供高级工具以调用 Phone Agent 子代理：

**工具函数：**
工具名称参数说明`run_subagent_main``intent`, `target_app`, `max_steps`在主屏幕上运行代理(强制)`run_subagent_virtual``intent`, `target_app`, `max_steps`, `agent_id`在虚拟显示器上运行代理(强制)`run_subagent_parallel_virtual``intent_1..4`, `target_app_1..4`, `max_steps_1..4`, `agent_id_1..4`在虚拟显示器上并行运行 1-4 个代理`close_all_virtual_displays`无关闭所有虚拟显示器会话
**核心设计原则**(来自包文档)：

1. **会话复用**：跨调用复用相同的 `agent_id` 以维护应用上下文
2. **首次启动**：首次使用某个 `agent_id` 时，intent 需以"Launch ..."开头
3. **每次调用无状态**：每次调用都是新对话，需在 intent 中包含完整上下文
4. **意图自包含**：不使用"那五个"、"继续"等引用表述。
5. **并行约束**：同一应用无法同时存在于多个虚拟显示中
6. **资源限制**：并行分支受可用独立应用数量限制

---

## Manual Testing Interface

### AutoGLM Tool Screen

The `AutoGlmToolScreen` provides a manual testing UI for the Phone Agent:

```
AutoGlmToolScreen

AutoGlmViewModel

AutoGlmUiState
(isLoading, log)

Task Input Field
(OutlinedTextField)

Virtual Screen Switch

Execute/Cancel Button

Execution Log Display
(Auto-scrolling)
```

**ViewModel Functions:**

```
class AutoGlmViewModel(private val context: Context) : ViewModel() {
    fun executeTask(task: String, useVirtualScreen: Boolean = false)
    fun cancelTask()
}
```

**Execution Flow:**

1. User enters task description and selects virtual screen mode
2. `executeTask()` creates `PhoneAgent` with `AgentConfig(maxSteps = 25)`
3. Agent runs with `onStep` callback that logs each step's thinking and action
4. Logs are formatted with timestamps and structured output
5. Final result displayed with emoji indicators (🎉 for completion, ✅ for success)

**Log Format:**

```
[HH:mm:ss] ==================================================
[HH:mm:ss] Task: <task description>
[HH:mm:ss] Max Steps: 25
[HH:mm:ss] ==================================================
[HH:mm:ss] 💭 思考过程:
[HH:mm:ss] <thinking content>
[HH:mm:ss] 🎯 执行动作:
[HH:mm:ss] { "action": "<action name>", ... }

```

---

## Job Registry and Cancellation

The agent supports cancellation via the `PhoneAgentJobRegistry`:

```
// Register agent job at start of run()
val job = currentCoroutineContext()[Job]
if (job != null) {
    PhoneAgentJobRegistry.register(agentId, job)
}
 
// User can cancel via UI overlay
onExit = {
    PhoneAgentJobRegistry.cancelAgent(agentId, "User cancelled UI automation")
    job?.cancel(CancellationException("User cancelled UI automation"))
}
```

The registry allows:

- External cancellation of running agents by `agentId`
- Graceful termination with cancellation reason
- Cleanup of registered jobs on completion

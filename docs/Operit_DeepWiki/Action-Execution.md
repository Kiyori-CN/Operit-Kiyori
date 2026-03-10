# 动作执行

本文档描述了 Operit UI 自动化系统中 UI 自动化操作的解析、验证和执行方式。操作执行是自动化流水线的最底层组件，将来自 PhoneAgent 的高级命令转换为设备上的实际 UI 交互。

有关调用这些操作的更高级别代理编排的信息，请参阅 [Phone Agent](/AAswordman/Operit/6.1-phone-agent)。有关不同权限级别如何启用不同执行能力的详细信息，请参阅 [Permission Channels](/AAswordman/Operit/6.2-permission-channels)。有关公开这些操作的工具接口，请参阅 [UI Tools and Actions](/AAswordman/Operit/6.4-ui-tools-and-actions)。

---

## 概述

操作执行系统处理 UI 自动化的最后一步：获取已解析的操作命令并通过适当的权限通道(Accessibility、ADB/Shizuku 或 Root)执行它们。该系统在执行期间提供可视化反馈，优雅地处理错误，并确保操作在正确的显示器(主屏幕或虚拟显示器)上执行。

**核心组件：**

- `ActionHandler`：解析操作字符串并将执行路由到适当的方法
- `ToolImplementations`：定义低级 UI 操作(点击、滑动等)的接口
- `UIOperationOverlay`：为已执行的操作提供可视化反馈
- 特定权限实现：Standard、Accessibility、Debugger 和 Root 变体

---

## 操作类型

该系统支持六种主要操作类型，每种都有特定的参数和执行要求。

### 支持的操作

操作目的关键参数视觉反馈`Tap`在坐标处单击`x`, `y`扩展圆圈动画`LongPress`在坐标处按住`x`, `y`, `duration`持续圆圈带计时器`Swipe`从起点到终点的手势`startX`, `startY`, `endX`, `endY`, `duration`动画路径线`SetInputText`在聚焦字段中输入文本`text`输入位置的文本覆盖层`PressKey`模拟硬件按键`keyCode`按键名称覆盖层`ClickElement`通过 ID/类点击 UI 元素`resourceId`, `className`, `text`高亮目标元素

### 操作参数格式

操作从结构化文本中解析，格式为：

```
<action>ACTION_NAME</action>
<parameter_name>value</parameter_name>

```

---

## 操作执行流程

```
Result

Visual Feedback

Execution Layer

Action Routing

Action Parsing

PhoneAgent Loop

PhoneAgent.run()

AI Model Response

ActionHandler.parseAgentResponse()

Extract and

ParsedAgentAction

Validate Parameters

ActionHandler.executeAgentAction()

Determine Display Target

Select ToolImplementations

StandardUITools (base)

AccessibilityUITools

DebuggerUITools

RootUITools

UIOperationOverlay.showTap()

UIOperationOverlay.showSwipe()

UIOperationOverlay.showTextInput()

StepResult

Update Context History

Continue or Finish
```

**图示：从 Agent 到设备的操作执行管道**

### 执行阶段

1. **解析阶段**：解析 Agent 响应文本以提取 `<think>` 推理和 `<action>` 命令
2. **验证阶段**：验证并转换参数(例如坐标归一化)
3. **路由阶段**：将操作路由到正确的显示和执行通道
4. **执行阶段**：底层实现执行实际的 UI 交互
5. **反馈阶段**：视觉覆盖层显示正在执行的操作
6. **结果阶段**：执行结果作为 `StepResult` 返回给 Agent

---

## ActionHandler 架构

`ActionHandler` 类是动作执行的中央协调器，负责解析代理响应、验证参数并将动作路由到适当的执行方法。

### ActionHandler 类结构

```
Utilities

Dependencies

ActionHandler

parseAgentResponse()

executeAgentAction()

executeLaunch()

executeTap()

executeSwipe()

executePressKey()

executeSetInputText()

executeBack/Home/Recent()

ToolImplementations

Context

Screen Dimensions

agentId

normalizeCoordinates()

resolvePackageName()

parseKeyCode()
```

**图示：ActionHandler 组件依赖关系**

### 关键方法

#### `parseAgentResponse(responseText: String): ParsedAgentAction?`

从 AI 模型响应文本中提取结构化动作数据。

- 解析 `<think>` 标签以获取推理过程(记录但不执行)
- 解析 `<action>` 标签以获取动作名称
- 提取所有 `<parameter_name>value</parameter_name>` 键值对
- 返回包含元数据、actionName 和 fields 映射的 `ParsedAgentAction`

#### `executeAgentAction(action: ParsedAgentAction): StepResult`

将解析后的动作路由到适当的执行方法。

- 验证每种动作类型的必需参数
- 根据屏幕尺寸归一化坐标
- 调用特定的执行方法(executeTap、executeSwipe 等)
- 将结果包装在带有成功/失败状态的 `StepResult` 中

---

## ToolImplementations 接口

`ToolImplementations` 接口定义了底层 UI 操作执行的契约。不同的权限级别提供此接口的不同实现。

### 接口定义

```
interface ToolImplementations {
    suspend fun tap(tool: AITool): ToolResult
    suspend fun longPress(tool: AITool): ToolResult
    suspend fun swipe(tool: AITool): ToolResult
    suspend fun setInputText(tool: AITool): ToolResult
    suspend fun pressKey(tool: AITool): ToolResult
    // Additional methods...
}
```

### 实现层次结构

```
implements

implements

implements

implements

selects

selects

selects

selects

ToolImplementations Interface

StandardUITools

AccessibilityUITools

DebuggerUITools

RootUITools

Returns 'not supported' errors

Uses AccessibilityService

Uses Shizuku ADB commands

Uses root shell commands

ToolGetter.getUITools()

AndroidPermissionLevel
```

**图示：ToolImplementations 类层次结构和选择**

### StandardUITools 基础实现

`StandardUITools` 类提供基础实现，对所有 UI 操作返回"不支持"错误。这是有意为之——当更高权限级别不可用时，它作为安全的默认实现。

**主要特征：**

- 所有操作方法返回 `ToolResult`，其中 `success = false`
- 错误消息："This operation is not supported in the standard version. Please use the accessibility or debugger version."
- 支持截屏捕获(使用 MediaProjection)
- 支持应用包名解析

---

## 按权限级别的执行方法

不同的 Android 权限级别启用不同的执行能力。系统根据用户配置自动选择最强大的实现。

### 权限级别能力

权限级别点击/滑动文本输入按键点击元素截屏UI 树**STANDARD**❌❌❌❌✅ (MediaProjection)❌**ACCESSIBILITY**✅ (手势)✅ (IME)✅ (全局操作)✅ (node.performAction)✅✅ (AccessibilityNodeInfo)**DEBUGGER** (Shizuku)✅ (input tap)✅ (input text)✅ (input keyevent)✅ (UI Automator)✅ (screencap)✅ (uiautomator dump)**ROOT**✅ (input tap)✅ (input text)✅ (input keyevent)✅ (UI Automator)✅ (screencap)✅ (uiautomator dump)

### 无障碍服务执行

**通过手势点击/滑动：**

```
// Accessibility gestures are built using GestureDescription
val path = Path().apply {
    moveTo(x.toFloat(), y.toFloat())
}
val gesture = GestureDescription.Builder()
    .addStroke(StrokeDescription(path, 0, duration))
    .build()
```

**通过 AccessibilityNodeInfo 点击元素：**

```
// Find node by resourceId, then perform click action
val node = findNodeByResourceId(resourceId)
node?.performAction(AccessibilityNodeInfo.ACTION_CLICK)
```

### 调试器/Root 执行

**通过 Shell 命令点击：**

```
input tap x y
```

**通过 Shell 命令输入文本：**

```
input text "escaped_text"
```

**通过 Shell 命令按键：**

```
input keyevent KEYCODE_BACK
```

### 虚拟显示目标

在虚拟显示(非默认 agentId)上执行操作时，系统自动向 shell 命令追加 `display` 参数：

```
input -d 2 tap x y  # Execute on display ID 2
```

---

## 视觉反馈系统

`UIOperationOverlay` 类为执行的操作提供实时视觉反馈，帮助用户理解自动化正在做什么。

### UIOperationOverlay 架构

```
Auto-Cleanup

Visual Rendering

Overlay Window

State Management

Event Types

TapEvent(x, y, id)

SwipeEvent(startX, startY, endX, endY, id)

TextInputEvent(x, y, text, id)

tapEvents: MutableStateList

swipeEvents: MutableStateList

textInputEvents: MutableStateList

ComposeView with WindowManager

FLAG_NOT_FOCUSABLE | FLAG_NOT_TOUCHABLE

TYPE_APPLICATION_OVERLAY

TapIndicator: Expanding Circle

SwipeIndicator: Animated Path

TextInputIndicator: Floating Text

AUTO_CLEANUP_DELAY_MS = 500ms

HIDE_DELAY_MS = 600ms

Handler.postDelayed()
```

**图示：UIOperationOverlay 视觉反馈系统**

### 反馈动画

#### 点击反馈

- **视觉效果**：从 0dp 扩展到 60dp 的扩展圆圈
- **颜色**：主题主色调，带透明度渐变
- **持续时间**：500ms 扩展 + 500ms 自动清理
- **实现方式**：使用 FastOutSlowInEasing 的可动画缩放因子

#### 滑动反馈

- **视觉效果**：从起点到终点绘制的线条，带动画进度
- **颜色**：主题主色调，完全不透明
- **持续时间**：800ms 动画 + 500ms 自动清理
- **实现方式**：从 0.0 到 1.0 的 LinearEasing，绘制部分路径

#### 文本输入反馈

- **视觉效果**：带有轻微弹跳动画的浮动文本标签
- **颜色**：表面变体背景，onSurface 文本
- **持续时间**：1500ms 显示 + 500ms 淡出
- **实现方式**：从 1.0 到 0.0 的透明度动画

### 覆盖窗口属性

覆盖层被配置为位于所有其他内容之上的非交互式透明窗口：

```
val params = WindowManager.LayoutParams().apply {
    width = MATCH_PARENT
    height = MATCH_PARENT
    type = TYPE_APPLICATION_OVERLAY
    flags = FLAG_NOT_FOCUSABLE or FLAG_NOT_TOUCHABLE or
            FLAG_NOT_TOUCH_MODAL or FLAG_LAYOUT_IN_SCREEN
    format = PixelFormat.TRANSLUCENT
}
```

**关键属性：**

- 不拦截触摸事件(传递到底层应用)
- 全屏透明画布
- 需要 `SYSTEM_ALERT_WINDOW` 权限
- 使用 Compose 进行渲染，带生命周期管理

---

## 错误处理与重试逻辑

动作执行包含全面的错误处理机制，以确保多步骤自动化过程的稳健性。

### 错误类别

```
Action Execution Attempt

Parse Error

Validation Error

Permission Error

Execution Error

Timeout Error

Invalid action format

Missing required parameters

Permission not granted

Target not found

Command timeout

Return StepResult(success=false)

Agent evaluates and decides

Retry with correction

Change approach

Abort task
```

**图示：错误处理流程**

### 常见错误场景

#### 1. 权限不足

**错误：**"标准版本不支持此操作。请使用无障碍服务版本或调试器版本。"

**原因：**动作所需的权限级别高于当前已启用的权限

**解决方案：**用户必须启用无障碍服务或 Shizuku

#### 2. 元素未找到

**错误：**"未找到 resourceId 为 'com.example:id/button' 的元素"

**原因：**UI 元素不存在或 ID 不正确

**解决方案：**Agent 通常会请求新的屏幕截图和 UI 树以重新分析

#### 3. 显示不可用

**错误：**"agentId 为 'agent_1' 的虚拟显示未启动"

**原因：**在尝试执行动作之前未创建虚拟显示

**解决方案：**Agent 首先调用 Launch 动作以初始化虚拟显示

#### 4. 坐标超出边界

**错误：**"点击坐标 (x=2000, y=5000) 超出屏幕边界 (1080x2340)"

**原因：**AI 模型生成了无效坐标

**解决方案：**ActionHandler 规范化坐标或返回错误供 agent 重试

### StepResult 结构

```
data class StepResult(
    val success: Boolean,
    val finished: Boolean,
    val action: ParsedAgentAction?,
    val thinking: String?,
    val message: String? = null
)
```

**字段含义：**

- `success`：动作是否无错误执行
- `finished`：agent 是否应停止(任务完成)
- `action`：尝试执行的已解析动作
- `thinking`：AI 的推理过程(来自 `<think>` 标签)
- `message`：人类可读的结果或错误消息

---

## 动作执行时机与延迟

系统包含策略性延迟以确保 UI 稳定性并为视觉反馈留出时间。

### 时机配置

延迟类型时长用途可配置点击后延迟100-200ms允许 UI 注册点击操作❌滑动后延迟200-300ms允许动画完成❌文本输入后延迟300-500ms允许键盘消失❌截图捕获延迟500-1000ms允许动作后 UI 稳定❌覆盖层自动隐藏600ms允许用户看到反馈✅ (AUTO_CLEANUP_DELAY_MS)步骤间延迟可变基于动作类型✅ (agent config)

### 延迟实现

**动作后延迟：**

```
suspend fun tap(tool: AITool): ToolResult {
    // Execute tap
    executeShellCommand("input tap $x $y")

    // Brief delay to allow UI to respond
    delay(150)

    // Show visual feedback
    operationOverlay.showTap(x, y)

    return ToolResult(success = true, ...)
}
```

**视觉反馈自动清理：**

```
handler.postDelayed({
    tapEvents.remove(tapEvent)
}, AUTO_CLEANUP_DELAY_MS)
```

---

## 与 PhoneAgent 的集成

动作执行系统与 PhoneAgent 编排循环紧密集成。代理调用动作执行并处理结果以确定下一步操作。

### 代理-动作集成流程

```
UIOperationOverlay
ToolImplementations
ActionHandler
AIService
PhoneAgent
UIOperationOverlay
ToolImplementations
ActionHandler
AIService
PhoneAgent
Generate next action
Response with <think> and <action>
parseAgentResponse(response)
ParsedAgentAction
executeAgentAction(action)
tap(tool) / swipe(tool) / etc.
showTap(x, y) / showSwipe(...) / etc.
ToolResult
StepResult
Evaluate success, update history
Capture screenshot for next step
Continue with updated context
```

**图示：PhoneAgent 与动作执行集成**

### 上下文累积

代理维护一个对话历史，包括：

1. 系统提示(启动时一次)
2. 用户任务(启动时一次)
3. 每个步骤：

- 截图(作为图像附件)
- UI 树结构(如果可用)
- 已执行的前一个动作
- 前一个动作的结果
- AI 思考和下一个动作

此上下文允许 AI：

- 查看 UI 的当前状态
- 记住已尝试过的动作
- 根据先前的失败调整策略
- 识别任务何时完成

---

## 测试与调试

系统包含用于手动测试和调试动作执行的工具。

### AutoGLM 工具界面

专用的 UI 界面(`AutoGlmToolScreen`)允许开发者和用户：

- 手动输入自然语言任务
- 切换虚拟显示模式
- 查看实时执行日志
- 取消正在运行的任务
- 查看逐步思考和动作日志

**功能：**

- 带时间戳的完整执行日志
- 逐步动作分解
- 思考过程可视化(来自 `<think>` 标签)
- 通过格式化实现步骤的视觉分隔

### 日志格式示例

```
[10:15:23] ==================================================
[10:15:23] Task: Open WeChat and send "Hello" to contact "Alice"
[10:15:23] Max Steps: 25
[10:15:23] ==================================================
[10:15:24]
[10:15:24] Step 1
[10:15:24] 💭 Thinking: I need to first launch WeChat app...
[10:15:24] 🎬 Action: Launch
[10:15:24]    app: WeChat
[10:15:25] ✅ Success
[10:15:25]
[10:15:26] Step 2
[10:15:26] 💭 Thinking: Now I should search for contact Alice...
[10:15:26] 🎬 Action: Tap
[10:15:26]    x: 540
[10:15:26]    y: 200
[10:15:27] ✅ Success

```

---

## 总结

动作执行是 Operit UI 自动化系统的基础层，将抽象的自动化意图转换为具体的设备交互。系统通过以下方式实现鲁棒性：

1. **多级权限支持**：根据可用权限优雅地降级功能
2. **视觉反馈**：用户始终能看到正在执行的操作
3. **全面的错误处理**：捕获、报告失败，并允许代理重试
4. **显示目标定位**：支持主屏幕和虚拟显示执行
5. **模块化架构**：解析、路由和执行之间清晰分离

动作执行系统与 PhoneAgent 编排层无缝集成，在保持可见性和控制的同时，实现复杂的多步骤自动化工作流。

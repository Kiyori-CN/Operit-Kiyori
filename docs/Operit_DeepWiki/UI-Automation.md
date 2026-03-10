# UI 自动化

## 目的与范围

本文档描述 Operit 的 UI 自动化系统，该系统通过多步骤代理循环实现 AI 驱动的 Android 应用控制。系统使用专用的视觉-语言模型(UI_CONTROLLER 函数类型)来观察屏幕截图、推理任务并执行点击、滑动和应用启动等操作。

自动化系统在两种上下文中运行：

- **主屏幕自动化**：直接操作设备的主显示屏
- **虚拟显示自动化**：在虚拟显示上通过 H.264 流进行隔离的自动化会话

有关 AI 服务配置的信息，请参阅

---

## 系统架构

UI 自动化系统由三个主要层组成：

```
Screenshot & Display

Action Execution

AI Model

Agent Orchestration

Entry Points

implements

StandardUITools
runUiSubAgent()

automatic_ui_subagent
Tool Package

PhoneAgent
run()

AgentConfig
maxSteps

ActionHandler
executeAgentAction()

UI_CONTROLLER
FunctionType

EnhancedAIService
getAIServiceForFunction()

ToolImplementations
interface

ToolGetter
getUITools()

AccessibilityUITools
DebuggerUITools
RootUITools

MediaProjectionHolder

MediaProjectionCaptureManager

ShowerController

VirtualDisplayOverlay
```

**图示：UI 自动化组件架构**

系统支持多种执行上下文：

- **主屏幕(agent_id="default")**：在设备主显示屏上操作
- **虚拟显示(agent_id=自定义)**：通过 Shower 服务器在虚拟屏幕上进行隔离自动化

---

## PhoneAgent：AI 驱动的自动化核心

### 概述

`PhoneAgent` 实现了一个观察-行动循环，其中视觉语言模型通过截图观察屏幕并决定执行什么操作。该代理在各个步骤之间维护对话上下文，使其能够推理复杂的多步骤任务。

```
Action Types

Response Parsing

Agent Loop

Agent Configuration

initialize

image link

full response

No

Yes

AgentConfig
maxSteps

Capture Screenshot

Send to AI Model

Parse Response

Execute Action

Finished?

Extract Thinking

Extract Answer

Parse do/finish

finish
message=text

do
action=name params

Return Message
```

**图示：PhoneAgent 观察-行动循环**

### 代理执行流程

`PhoneAgent.run()` 方法实现了一个多步骤循环：

```
VirtualDisplayOverlay
UI_CONTROLLER Model
ActionHandler
PhoneAgent
Caller
VirtualDisplayOverlay
UI_CONTROLLER Model
ActionHandler
PhoneAgent
Caller
alt
[finish]
[do]
loop
[Until finished or maxSteps]
run(task, systemPrompt)
ensureRequiredVirtualScreenOrError()
prewarmMainScreenShowerIfPossible()
show() / showAutomationControls()
captureScreenshotForAgent()
<link type='image' id='...'>
sendMessage(userMessage, chatHistory)
​
do(action=...) or finish(message=...)
parseThinkerActionPair()
updateAutomationProgress()
Return message
executeAgentAction(parsedAction)
StepResult
updateAutomationProgress()
hideAutomationControls()
Return final message
```

**图示：PhoneAgent 执行序列**
阶段描述关键代码**初始化**虚拟显示设置、UI 准备**截图**通过 Shower 或 MediaProjection 捕获当前屏幕**AI 推理**发送到 UI_CONTROLLER 模型并附带历史记录**响应解析**提取思考和动作**动作执行**通过 ActionHandler 执行**进度更新**更新覆盖层

### 响应格式和解析

Agent 期望 AI 响应采用 `FunctionalPrompts.buildUiAutomationAgentPrompt()` 定义的格式：

```

<answer>
do(action="ActionName", param1="value1", param2="value2")
</answer>

```

或

```

<answer>
finish(message="Task completed successfully")
</answer>

```

`parseThinkerActionPair()` 方法提取思考和动作：

1. **主要模式**：在 `<think>` 和 `<answer>` 标签处分割
2. **回退模式**：如果没有标签，则在 `do(action=` 或 `finish(message=` 标记处分割
3. **提取**：将 `do(...)` 或 `finish(...)` 解析为带有元数据的 `ParsedAgentAction`

`parseAgentActionFromText()` 方法处理 `do(...)` 语法：

- 从 `action="name"` 中提取动作名称
- 从逗号分隔的参数中解析键值对
- 规范化坐标值(去除 `px` 后缀，转换为浮点数)

### 上下文管理

代理将 `_contextHistory` 维护为 `(role, content)` 对的列表。关键行为：

- 系统提示词在开始时添加一次
- 每一步添加一条包含截图链接的用户消息
- AI 响应在添加到历史记录前被重新格式化为 `<answer>...</answer>`
- 从之前的用户消息中移除图片链接以防止上下文膨胀
- 历史记录在各步骤间保留以维持任务上下文

---

## 虚拟显示系统(Shower)

### 架构

Shower 系统在独立的特权进程中创建一个**受信任的**虚拟显示，将 H.264 视频流传输到主应用，并接受输入命令。该架构在提供安全隔离的同时，实现了完整的 UI 自动化能力。

```

```

**图示：Shower 虚拟显示架构**

### 服务器生命周期

服务器遵循以下启动顺序：

1. **资源提取**：`ShowerServerManager.copyJarToExternalDir()` 将 `assets/shower-server.jar` 复制到 `/sdcard/Download/Operit/shower-server.jar`
2. **复制到系统**：Shell 命令 `cp /sdcard/Download/Operit/shower-server.jar /data/local/tmp/shower-server.jar`
3. **进程启动**：`CLASSPATH=/data/local/tmp/shower-server.jar app_process / com.ai.assistance.shower.Main &`
4. **服务器启动**：服务器绑定到 `127.0.0.1:8986` 并等待 WebSocket 连接
5. **连接探测**：客户端轮询端口最多 10 秒以验证启动成功

### 显示创建

当客户端发送 `CREATE_DISPLAY width height dpi [bitrate]` 时，服务器：

1. 将尺寸对齐到 8 的倍数(H.264 编码器要求)
2. 创建 `MediaCodec` 编码器，使用 `video/avc` 格式
3. 获取编码器的输入 `Surface`
4. 通过反射创建 `VirtualDisplay`，使用以下标志：

- `VIRTUAL_DISPLAY_FLAG_PUBLIC`
- `VIRTUAL_DISPLAY_FLAG_PRESENTATION`
- `VIRTUAL_DISPLAY_FLAG_OWN_CONTENT_ONLY`
- `VIRTUAL_DISPLAY_FLAG_SUPPORTS_TOUCH`
- `VIRTUAL_DISPLAY_FLAG_TRUSTED` (API 33+)
- `VIRTUAL_DISPLAY_FLAG_ALWAYS_UNLOCKED` (API 33+)

5. 将显示 surface 链接到编码器
6. 启动编码器线程，读取输出缓冲区并作为二进制 WebSocket 帧发送

### 视频流

编码器生成 Annex-B 格式的 H.264 数据包(起始码 `0x00000001`)。前两个数据包是 SPS 和 PPS(csd-0、csd-1)，随后是常规帧：

```
Surface
ShowerVideoRenderer
ShowerController
WebSocket
ShowerServer
Surface
ShowerVideoRenderer
ShowerController
WebSocket
ShowerServer
loop
[Every frame]
Binary frame (SPS)
onMessage(bytes)
onFrame(bytes)
Detect NAL type 7 (SPS)
Store as csd0
Binary frame (PPS)
onMessage(bytes)
onFrame(bytes)
Detect NAL type 8 (PPS)
Store as csd1
Initialize MediaCodec decoder
with csd0, csd1
Binary frame (video)
onMessage(bytes)
onFrame(bytes)
queueInputBuffer
dequeueOutputBuffer
releaseOutputBuffer(render=true)
```

**图示：H.264 视频流传输流程**

渲染器在 `Surface` 重建过程中保留 `csd0` 和 `csd1`，允许无缝重新连接显示而无需服务器重新发送 SPS/PPS 数据包。

### 输入注入

服务器的 `InputController` 类通过 WebSocket 接收命令并注入事件：
命令格式操作`TAP``TAP x y`在坐标处单击`SWIPE``SWIPE x1 y1 x2 y2 duration`滑动手势`KEY``KEY keycode`按键(例如 BACK=4, HOME=3)`TOUCH_DOWN``TOUCH_DOWN x y`开始触摸序列`TOUCH_MOVE``TOUCH_MOVE x y`移动触摸指针`TOUCH_UP``TOUCH_UP x y`结束触摸序列`LAUNCH_APP``LAUNCH_APP package`在虚拟显示器上启动应用
所有输入事件都使用 `displayId` 设置为虚拟显示器进行注入，确保它们针对正确的屏幕。

---

## UI 工具和操作

### StandardUITools

`StandardUITools` 作为 UI 操作的基础实现。标准版本不支持直接的 UI 操作(返回"不支持"错误)，但提供了框架和应用包映射。

**核心组件：**

1. **应用包映射**：`APP_PACKAGES` 将友好的应用名称(中文和英文)映射到包名，涵盖 100 多个流行应用，包括微信、Chrome、Google Maps 等。
2. **截图捕获**：`captureScreenshotToFile()` 首先尝试 Shower 虚拟显示，然后回退到 `screencap` 命令
3. **UI 子代理**：`runUiSubAgent()` 方法，为特定意图编排 `PhoneAgent`

### ToolImplementations 接口

`ToolImplementations` 接口定义了 UI 操作的契约：

```
interface ToolImplementations {
    suspend fun tap(tool: AITool): ToolResult
    suspend fun longPress(tool: AITool): ToolResult
    suspend fun setInputText(tool: AITool): ToolResult
    suspend fun pressKey(tool: AITool): ToolResult
    suspend fun swipe(tool: AITool): ToolResult
    suspend fun captureScreenshot(tool: AITool): Pair<String?, Pair<Int, Int>?>
}
```

更高的权限级别(无障碍、调试器)会用功能实现覆盖这些方法。

### 动作类型

代理通过 `ActionHandler.executeAgentAction()` 支持以下动作类型：
动作参数说明`Launch``app`按名称启动应用(使用 `APP_PACKAGES` 映射)`Tap``x`, `y`在归一化坐标 [0-1] 处点击`Swipe``x1`, `y1`, `x2`, `y2`, `duration`滑动手势(持续时间以毫秒为单位)`Type``text`在聚焦的输入框中输入文本`Key``key`按键(HOME、BACK、ENTER 等)`Wait``seconds`等待指定时长
坐标已归一化(0.0 到 1.0)，并根据截图尺寸映射到设备像素。

---

## ActionHandler：动作执行

### 职责

`ActionHandler` 将 AI 模型的抽象动作桥接到具体的设备操作。它处理：

1. **截图捕获**：协调 Shower 与回退截图策略
2. **坐标映射**：将归一化 [0-1] 坐标转换为设备像素
3. **动作路由**：根据权限级别通过 Shower 或回退方法发送命令
4. **上下文更新**：从对话历史中移除图像链接以管理 token 使用量

### Shower 使用检测

处理器根据三个标准决定是否使用 Shower：

```
No

Yes

No

Yes

No

Yes

resolveShowerUsageContext

Permission Level
DEBUGGER/ADMIN/ROOT?

canUseShowerForInput = false

Experimental Virtual
Display Enabled?

ShowerController
getDisplayId != null?

canUseShowerForInput = true

Return Context
```

**图示：Shower 使用决策逻辑**

这种动态检测允许在 Shower 不可用时无缝回退到传统方法。

### 截图策略

该 `captureScreenshotForAgent()` 方法遵循以下优先级：

1. **Shower 路径**：如果 `canUseShowerForInput`，调用 `ShowerVideoRenderer.captureCurrentFramePng()` 提取当前解码帧
2. **回退路径**：隐藏 UI 覆盖层，等待 200ms，调用 `toolImplementations.captureScreenshot()` 使用 `screencap`
3. **压缩**：根据 `DisplayPreferencesManager` 设置(format、quality、scale)保存为 PNG 或 JPEG
4. **注册**：添加到 `ImagePoolManager` 并返回 `<link type="image" id="...">` 标签

### 启动应用解析

执行 `Launch` 动作时，处理器使用多步骤解析：

1. 检查 `app` 参数是否匹配 `StandardUITools.APP_PACKAGES` 中的键
2. 如果未找到，通过 `packageManager.getInstalledApplications()` 查询已安装应用
3. 与应用标签匹配(不区分大小写，处理中英文)
4. 返回包名，若无匹配则返回错误

---

## 可视化反馈与控制

### VirtualDisplayOverlay

`VirtualDisplayOverlay` 是一个系统悬浮窗口，用于显示 Shower 虚拟显示器视频并提供自动化控制：

```
Input Handling

VirtualDisplayOverlay

WindowManager
TYPE_APPLICATION_OVERLAY

ShowerSurfaceView
Video rendering

Automation Controls
Progress, Pause, Exit

Rainbow Border
Visual indicator

Touch Event
Capture

mapOffsetToRemote()

ShowerController
TOUCH_DOWN/MOVE/UP
```

**图示：VirtualDisplayOverlay 组件**

**显示模式**：

- **紧凑模式**：小型可拖动窗口(默认)
- **全屏模式**：覆盖整个屏幕并带有控制侧边栏
- **隐藏模式**：悬浮窗不可见

**自动化控制**(在代理执行期间显示)：

- 进度指示器：`{currentStep} / {maxSteps}`
- 状态文本：当前正在执行的操作
- 暂停/恢复按钮：切换 `isPausedFlow` 状态
- 退出按钮：通过 `PhoneAgentJobRegistry.cancelAgent()` 取消代理

### UIAutomationProgressOverlay

对于主屏幕自动化(无虚拟显示器)，`UIAutomationProgressOverlay` 提供一个更简单的全屏悬浮窗，包含进度条和取消按钮。如果在执行过程中虚拟显示器变为可用，代理会从此悬浮窗切换到 `VirtualDisplayOverlay`。

### 自动化控制

当调用 `showAutomationControls()` 时，覆盖层会显示：

- **进度指示器**：当前步骤 / 总步骤数
- **状态文本**：正在执行的当前操作
- **暂停/恢复按钮**：通过回调切换 `isPaused` 状态
- **退出按钮**：通过回调取消自动化

控制面板以固定宽度(`automationPanelWidthPx = 56dp`)的左侧边栏形式出现，使视频内容保持其原始宽高比。

### 触摸输入转发

覆盖层将触摸事件从本地表面转发到远程 Shower 显示：

1. `detectTapGestures` / `detectDragGestures` 捕获覆盖层上的原始触摸
2. `mapOffsetToRemote()` 将覆盖层像素坐标转换为虚拟显示坐标
3. 通过 `ShowerController` 发送命令：

- 单次点击 → `TOUCH_DOWN` + `TOUCH_UP`，间隔 50ms
- 拖动 → `TOUCH_DOWN` → 一系列 `TOUCH_MOVE` → `TOUCH_UP`

### 彩虹边框指示器

覆盖层可以通过 `setShowerBorderVisible(true)` 显示动画彩虹边框。这在自动化运行期间提供 Shower 系统处于活动状态的视觉反馈。边框使用粒子系统，在周边流动彩色圆点。

---

## 与工具系统的集成

### 工具包：automatic_ui_subagent

UI 自动化主要通过 `automatic_ui_subagent` 工具包暴露，该包提供高级封装工具：
工具参数说明`run_subagent_main``intent`, `target_app`, `max_steps`在主屏幕上运行 UI 代理(agent_id="default")`run_subagent_virtual``intent`, `target_app`, `max_steps`, `agent_id`在虚拟显示会话上运行 UI 代理`run_subagent_parallel_virtual``intent_1..4`, `target_app_1..4`, `max_steps_1..4`, `agent_id_1..4`在不同虚拟显示上并行运行最多 4 个 UI 代理`close_all_virtual_displays`(无)清理所有虚拟显示会话
该包基于 `ui.virtual_display` 能力标志包含条件状态支持，以暴露不同的工具集。

**核心设计原则(来自包元数据)**：

- **会话复用**：跨调用复用相同的 `agent_id` 以维护应用上下文
- **先启动**：对于新的 agent_id，始终以"Launch ..."开始 intent
- **每次调用无状态**：每次调用都是新对话；intent 必须包含完整上下文
- **自包含 intent**：不使用"那五个 / 继续"等引用；提供完整信息
- **并行资源约束**：无法在多个虚拟显示上同时操作同一应用

### 直接工具访问

可通过 `StandardUITools.runUiSubAgent()` 进行更底层的访问：

```
fun runUiSubAgent(tool: AITool): ToolResult
// Parameters:
//   - intent: Natural language task description
//   - max_steps: Maximum execution steps (default: 20)
//   - agent_id: Virtual display session identifier (optional)
//   - target_app: Target application name (optional)
```

此方法创建一个 `PhoneAgent` 实例，获取 UI_CONTROLLER 模型服务，并执行自动化循环。它返回一个 `AutomationExecutionResult`，包含：

- `agentId`：使用的会话标识符
- `displayId`：虚拟显示器 ID(如适用)
- `executionSuccess`：任务是否成功完成
- `executionMessage`：完整对话历史和步骤摘要
- `executionSteps`：执行的步骤数

### 权限要求

UI 自动化系统根据用户配置的权限级别进行适配：
权限级别截图方法操作执行虚拟显示器`STANDARD`不支持不支持不支持`ACCESSIBILITY``MediaProjection`无障碍服务不支持`DEBUGGER``MediaProjection` 或 ShowerADB/ShizukuShower(如启用实验性标志)`ADMIN`与 DEBUGGER 相同与 DEBUGGER 相同Shower`ROOT`与 DEBUGGER 相同Root shell 命令Shower
`ToolGetter.getUITools()` 方法根据 `androidPermissionPreferences.getPreferredPermissionLevel()` 选择适当的实现。

**虚拟显示器要求**：

- 权限级别必须为 DEBUGGER 或更高
- `DisplayPreferencesManager.isExperimentalVirtualDisplayEnabled()` 必须为 true
- Shizuku 服务必须正在运行并已授予权限(对于 DEBUGGER 级别)

### 系统提示词

UI 自动化代理使用 `FunctionalPrompts.UI_AUTOMATION_AGENT_PROMPT` 作为其系统提示词，指导模型：

- 可用操作(`Launch`、`Tap`、`Swipe`、`Type`、`Key`、`Wait`)
- 响应格式(`do(action=...)` 和 `finish(message=...)`)
- 坐标系统(归一化 0.0-1.0)
- 多步骤任务的最佳实践

提示词包含当前日期以支持时间感知任务。

---

## 配置与偏好设置

### 显示偏好设置

`DisplayPreferencesManager` 控制截图和视频质量：
设置默认值说明`screenshotFormat`PNGPNG 或 JPG/JPEG`screenshotQuality`85JPEG 质量 50-100`screenshotScalePercent`100缩放以减小尺寸(50-100%)`experimentalVirtualDisplayEnabled`true启用/禁用 Shower 系统
这些设置在 AI 视觉质量与 token/带宽成本之间取得平衡。

### 模型配置

UI 自动化使用 `FunctionType.UI_CONTROLLER` 模型配置，应满足：

- 需要 `enableDirectImageProcessing = true`(需要视觉能力)
- 使用擅长空间推理的模型(例如 GPT-4V、Claude 3.5 Sonnet)
- 具有足够的上下文窗口以支持包含图像的多步对话

如果配置的 UI_CONTROLLER 模型缺少视觉支持，代理会快速失败。

---

## 错误处理与容错

### 解码器容错

`ShowerVideoRenderer` 实现了健壮的错误处理：

1. **SPS/PPS 保留**：编解码器配置缓冲区单独存储，即使在解码器崩溃后也可重用
2. **优雅重新初始化**：如果解码失败，解码器会被释放，但 `csd0`/`csd1` 会被保留
3. **待处理帧队列**：在解码器初始化之前接收的帧会被缓冲，并在设置完成后处理

这可以防止解码器遇到损坏帧时出现永久黑屏。

### 服务器重连

`ShowerController.ensureConnected()` 在断开连接时自动重连 WebSocket。连接采用延迟初始化，并在多次自动化运行中重用。

### 应用关闭时的清理

`ActivityLifecycleManager` 跟踪 Activity 数量，并在最后一个 Activity 销毁时清理资源：

```
if (activityCount <= 0) {
    VirtualDisplayOverlay.getInstance(context).hide()
    ShowerController.shutdown()
}
```

这确保了当应用从最近任务列表中关闭时，Shower 系统不会泄漏资源。

---

## 性能特征

### 延迟

单个自动化步骤的典型延迟分解：
阶段时长说明截图捕获(Shower)10-50ms取决于帧可用性截图捕获(回退方案)200-500ms包含 `screencap` 命令图像压缩50-200ms取决于缩放和格式AI 推理2-10s视觉-语言模型处理动作执行10-100ms触摸/按键注入
Shower 模式相比 `screencap` 将截图延迟降低了 10 倍。

### 资源使用

- **内存**：解码器使用约 20MB 用于视频帧缓冲区
- **CPU**：H.264 编码/解码在可用时使用硬件编解码器
- **网络**：WebSocket 使用 localhost，无需外部网络
- **磁盘**：截图保存到 `/sdcard/Download/Operit/cleanOnExit/` 并定期清理

---

## 开发和测试工具

### Shower WebSocket 客户端

Python 测试客户端(`tools/shower_ws_client.py`)允许开发者：

- 连接到 Shower 服务器
- 创建自定义尺寸的虚拟显示
- 发送测试命令(tap、swipe、key、launch)
- 使用 PyAV + OpenCV 查看实时视频流
- 通过鼠标交互控制远程显示

这对于在不涉及完整 Android 应用的情况下调试 Shower 服务器非常有用。

### 构建脚本

- **`tools/build_server.bat`**：将 Shower 编译为发布版 APK 并复制到 `app/src/main/assets/shower-server.jar`
- **`tools/run_shower_server.bat`**：将 Shower 推送到设备并通过 `app_process` 启动以进行测试

---

这个 UI 自动化系统代表了 Operit 最复杂的子系统之一，结合了 AI 视觉语言模型、特权 Android API、视频流和低延迟输入注入，提供了一个强大的自动化框架，可与桌面自动化工具（如 Selenium）媲美，但适用于原生 Android 应用程序。

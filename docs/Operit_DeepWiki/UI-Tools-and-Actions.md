# UI 工具与操作

本页面记录了 UI 自动化工具系统的核心构建模块：`StandardUITools` 类及其用于提取 UI 信息、捕获屏幕截图和执行 UI 操作的方法。这涵盖了提供单个 UI 操作(点击、滑动、文本输入等)和信息提取能力的基础层。

关于使用这些工具执行多步骤 UI 自动化的编排层，请参阅 [Phone Agent](/AAswordman/Operit/6.1-phone-agent)。关于不同执行通道(Accessibility、ADB、Root)的详细信息，请参阅 [Permission Channels](/AAswordman/Operit/6.2-permission-channels)。关于从 AI 进行工具注册和调用的信息，请参阅 [Tool Architecture](/AAswordman/Operit/5.1-tool-architecture)。

## 工具架构

UI 工具系统构建在基类 `StandardUITools` 之上，该基类定义了所有 UI 操作的接口。此基础实现返回"不支持该操作"错误，作为子类必须根据可用系统权限来实现的契约。

```
Data Structures

Tool Consumers

Specialized Implementations

Tool Interface Layer

ToolImplementations
Interface

StandardUITools
Base Implementation

AccessibilityUITools
Accessibility Service

DebuggerUITools
ADB/Shizuku

RootUITools
Root Access

ActionHandler
Parses & Executes Actions

PhoneAgent
Multi-step Agent Loop

ToolGetter
Permission-based Factory

UINode
className, text, bounds, children

SimplifiedUINode
Serializable Version

FocusInfo
packageName, activityName

AppListData
Installed Apps
```

### 工具接口方法

`StandardUITools` 类定义了以下核心方法：
方法目的返回类型`getPageInfo()`提取当前 UI 页面信息，包括层级结构和焦点应用`ToolResult` 包含 `UIPageResultData``tap()`在指定坐标模拟点击`ToolResult``longPress()`在指定坐标模拟长按`ToolResult``clickElement()`通过资源 ID 或类名点击元素`ToolResult``setInputText()`在输入框中设置文本`ToolResult``pressKey()`模拟按键(返回、主页、最近任务、回车等)`ToolResult``swipe()`执行滑动手势，指定起始和结束坐标`ToolResult``captureScreenshot()`捕获当前屏幕到文件`Pair<String?, Pair<Int, Int>?>``runUiSubAgent()`执行多步骤 UI 自动化子代理`ToolResult` 包含 `AutomationExecutionResult`

## UI 数据结构

系统使用多个数据结构来表示 UI 信息：

```
toUINode()

contains

info included

UINode

+String? className

+String? text

+String? contentDesc

+String? resourceId

+String? bounds

+Boolean isClickable

+MutableList<UINode> children

SimplifiedUINode

+String? className

+String? text

+String? contentDesc

+String? resourceId

+String? bounds

+Boolean isClickable

+List<SimplifiedUINode> children

FocusInfo

+String? packageName

+String? activityName

UIPageResultData

+SimplifiedUINode rootNode

+String? packageName

+String? activityName

+String rawXml
```

- **UINode**：UI 层级节点的内部表示，具有完全可变性
- **SimplifiedUINode**：可序列化/不可变版本，用于工具结果和 AI 使用
- **FocusInfo**：捕获当前聚焦应用的包名和活动
- **UIPageResultData**：完整的页面快照，包括树结构、焦点信息和原始 XML 转储

## 截图捕获系统

截图捕获系统使用 Android 的 `MediaProjection` API 来捕获屏幕内容。这是标准应用在没有特殊权限的情况下唯一可用的截图方法。

### 截图捕获流程

```
"ImagePoolManager
(Registration)"
"MediaProjectionCaptureManager
(Image Capture)"
"ScreenCaptureActivity
(Permission UI)"
"MediaProjectionHolder
(Static Singleton)"
"StandardUITools
captureScreenshotToFile()"
"Caller
(PhoneAgent/Tool)"
"ImagePoolManager
(Registration)"
"MediaProjectionCaptureManager
(Image Capture)"
"ScreenCaptureActivity
(Permission UI)"
"MediaProjectionHolder
(Static Singleton)"
"StandardUITools
captureScreenshotToFile()"
"Caller
(PhoneAgent/Tool)"
delay(500) x 20 retries
alt
[No MediaProjection Permission]
opt
[Failure]
loop
[Up to 3 attempts]
captureScreenshotToFile()
Check mediaProjection
cleanStart(context)
Store MediaProjection token
Poll for 10s
Create/Reuse CaptureManager
setupDisplay()
delay(200)
captureToFile(file)
success/failure
delay(120)
Register image
Return (path, dimensions)
```

### 实现细节

`captureScreenshotToFile()` 方法位于，实现了以下逻辑：

1. **权限检查**：验证 `MediaProjectionHolder.mediaProjection` 不为空

- 如果为空，启动 `ScreenCaptureActivity.cleanStart()` 请求权限
- 以 500ms 延迟轮询，最多 10 秒(20 次重试)

2. **管理器创建**：创建或复用 `MediaProjectionCaptureManager`

- 缓存在 `cachedMediaProjectionCaptureManager` 字段中
- 如果是相同的 `MediaProjection` 实例则复用
- 如果投影发生变化则释放并重新创建

3. **显示设置**：调用 `manager.setupDisplay()`，延迟 200ms
4. **重试捕获**：最多尝试捕获 3 次

- 失败尝试之间延迟 120ms
- 将 PNG 写入 `OperitPaths.cleanOnExitDir()/{timestamp}.png`

5. **尺寸提取**：使用 `BitmapFactory.Options.inJustDecodeBounds` 获取图像尺寸，无需加载完整位图
6. **返回**：返回 `Pair<String?, Pair<Int, Int>?>` 包含文件路径和尺寸

### 文件管理

截图保存到临时目录，该目录会自动清理：

```
val screenshotDir = OperitPaths.cleanOnExitDir()
val shortName = System.currentTimeMillis().toString().takeLast(4)
val file = File(screenshotDir, "$shortName.png")
```

文件名使用时间戳的最后 4 位数字来创建唯一但紧凑的文件名。这些文件通常会注册到 `ImagePoolManager` 以实现高效的内存管理，并在之后由系统清理。

## UI 自动化子代理

`runUiSubAgent()` 方法提供了一个高级接口，用于使用自然语言意图执行多步骤 UI 自动化任务。该方法创建并运行一个带有专用 `UI_CONTROLLER` AI 模型的 `PhoneAgent` 实例。

### 子代理架构

```
Result

Execution

Agent Setup

Validation

Configuration

Entry Point

runUiSubAgent()
Natural Language Intent

intent: String
Task Description

max_steps: Int
Default: 20

agent_id: String?
Session Identifier

target_app: String?
App Name/Package

Check UI_CONTROLLER
enableDirectImageProcessing

EnhancedAIService
getAIServiceForFunction()

AgentConfig
maxSteps

ActionHandler
screenWidth, screenHeight

PhoneAgent
context, config, uiService

buildUiAutomationSystemPrompt()
Date + Locale-aware

agent.run()
task, systemPrompt, targetApp

Multi-step Loop
Screenshot + Action + AI

agent.contextHistory
Conversation Log

AutomationExecutionResult
success, message, steps, agentId, displayId
```

### 子代理执行流程

`runUiSubAgent()` 在的实现遵循以下顺序：

1. **参数提取**：

- `intent`：必需的自然语言任务描述
- `max_steps`：可选的步骤限制(默认：20)
- `agent_id`：可选的会话标识符，用于复用
- `target_app`：可选的目标应用名称/包名

2. **视觉模型验证**：

```
val uiConfig = EnhancedAIService.getModelConfigForFunction(context, FunctionType.UI_CONTROLLER)
if (!uiConfig.enableDirectImageProcessing) {
    return ToolResult(error = "当前 UI 控制器模型未启用识图能力...")
}
```

3. **AI 服务获取**：获取专用的 `UI_CONTROLLER` 功能服务实例
4. **系统提示词生成**：

- 构建包含当前日期的区域感知提示词
- 使用 `FunctionalPrompts.buildUiAutomationAgentPrompt()`

5. **代理构建**：

```
val agentConfig = AgentConfig(maxSteps = maxSteps)
val actionHandler = ActionHandler(
    context = context,
    screenWidth = screenWidth,
    screenHeight = screenHeight,
    toolImplementations = this
)
val agent = PhoneAgent(
    context = context,
    config = agentConfig,
    uiService = uiService,
    actionHandler = actionHandler,
    agentId = agentId,
    cleanupOnFinish = false
)
```

6. **执行**：

```
val finalMessage = agent.run(
    task = intent,
    systemPrompt = systemPrompt,
    isPausedFlow = pausedState,
    targetApp = targetApp
)
```

7. **结果组装**：

- 构建包含执行摘要的 `AutomationExecutionResult`
- 包含 `agentId`、`displayId`、`executionSteps` 和完整对话历史
- 成功与否由最终消息中是否存在 "Max steps reached" 或 "Error" 决定

### 系统提示词构建

位于的 `buildUiAutomationSystemPrompt()` 辅助方法创建区域感知的系统提示词：

```
private fun buildUiAutomationSystemPrompt(): String {
    val useEnglish = LocaleUtils.getCurrentLanguage(context).lowercase().startsWith("en")
    val formattedDate = if (useEnglish) {
        SimpleDateFormat("yyyy-MM-dd EEEE", Locale.ENGLISH).format(Date())
    } else {
        val calendar = Calendar.getInstance()
        val sdf = SimpleDateFormat("yyyy年MM月dd日", Locale.getDefault())
        val datePart = sdf.format(Date())
        val weekdayNames = arrayOf("星期日", "星期一", "星期二", ...)
        val weekday = weekdayNames[calendar.get(Calendar.DAY_OF_WEEK) - 1]
        "$datePart $weekday"
    }
    return FunctionalPrompts.buildUiAutomationAgentPrompt(formattedDate, useEnglish)
}
```

提示词中包含当前日期，以帮助智能体推理与时间相关的 UI 元素(日历、日程等)。

## 应用包名映射

`StandardUITools` 类维护了一个全面的应用名称到包标识符的映射，同时支持中文和英文应用名称。这使得 AI 可以通过常用名称而非技术性的包标识符来引用应用。

### 包名解析

```
Usage

Dynamic Discovery

Static Mappings

APP_PACKAGES
MutableMap<String, String>

微信 → com.tencent.mm
淘宝 → com.taobao.taobao
bilibili → tv.danmaku.bili

Chrome → com.android.chrome
Gmail → com.google.android.gm
Twitter → com.twitter.android

scanAndAddInstalledApps()
PackageManager.getInstalledApplications()

Scanned Apps
Added to APP_PACKAGES

ActionHandler
Launch Action

Resolve App Name
to Package ID
```

### 静态映射

位于的 `APP_PACKAGES` 伴生对象字段包含了常用应用的预定义映射：
类别映射示例社交与通讯微信→com.tencent.mm, QQ→com.tencent.mobileqq, WeChat→com.tencent.mm电商淘宝→com.taobao.taobao, 京东→com.jingdong.app.mall, Temu→com.einnovation.temu视频bilibili→tv.danmaku.bili, 抖音→com.ss.android.ugc.aweme, Tiktok→com.zhiliaoapp.musically系统Settings→com.android.settings, Chrome→com.android.chrome, Gmail→com.google.android.gm旅行携程→ctrip.android.view, 12306→com.MobileTicket, Booking→com.booking
该映射包含多个名称变体和别名(例如，"bilibili"、"哔哩哔哩"、"B站"、"b站" 都映射到同一个包)。

### 动态应用发现

`scanAndAddInstalledApps()` 方法位于，动态添加已安装的应用：

```
fun scanAndAddInstalledApps(context: Context) {
    if (appsScanned) return
    synchronized(this) {
        if (appsScanned) return
        val pm = context.packageManager
        val apps = pm.getInstalledApplications(PackageManager.GET_META_DATA)
        val newPackages = mutableMapOf<String, String>()
        for (app in apps) {
            val appName = try {
                pm.getApplicationLabel(app).toString()
            } catch (e: Exception) {
                app.packageName
            }
            if (appName.isNotBlank() && app.packageName.isNotBlank()) {
                if (!APP_PACKAGES.containsKey(appName)) {
                    newPackages[appName] = app.packageName
                }
            }
        }
        addAppPackages(newPackages)
        appsScanned = true
    }
}
```

该方法：

- 仅运行一次(由 `appsScanned` 标志保护)
- 查询 `PackageManager` 获取所有已安装应用
- 提取应用标签作为显示名称
- 仅在映射不存在时添加新映射
- 通过 `synchronized` 块保证线程安全

## 与动作执行的集成

`StandardUITools` 方法通过 `ActionHandler` 类调用，该类解析 AI 模型响应中的动作并将其分发到相应的工具实现。

### 动作处理器集成

```
"UIOperationOverlay
Visual Feedback"
"ToolImplementations
(StandardUITools)"
"ActionHandler
executeAgentAction()"
"PhoneAgent
run()"
"AI Model
(UI_CONTROLLER)"
"UIOperationOverlay
Visual Feedback"
"ToolImplementations
(StandardUITools)"
"ActionHandler
executeAgentAction()"
"PhoneAgent
run()"
"AI Model
(UI_CONTROLLER)"
alt
[Tap Action]
[Swipe Action]
[SetInputText Action]
[PressKey Action]
[Launch Action]
captureScreenshotForAgent()
sendMessage(screenshot + context)
Response with action
parseActionFromResponse()
executeAgentAction(parsedAction)
Parse action.actionName
tap(tool)
Show tap indicator
ToolResult
swipe(tool)
Show swipe path
ToolResult
setInputText(tool)
ToolResult
pressKey(tool)
ToolResult
Use APP_PACKAGES mapping
Launch via intent
ToolResult
ActionResult
Accumulate in contextHistory
```

### 工具结果结构

所有 UI 工具方法返回 `ToolResult` 对象，结构如下：

```
data class ToolResult(
    val toolName: String,
    val success: Boolean,
    val result: ResultData,
    val error: String = ""
)
```

其中 `ResultData` 可以是：

- `StringResultData`：简单字符串消息
- `UIPageResultData`：包含树结构和焦点信息的完整 UI 页面快照
- `AutomationExecutionResult`: 多步骤自动化摘要

标准实现在返回失败结果，其中 `error = "This operation is not supported in the standard version..."`

## 工具包暴露

UI 工具通过 `automatic_ui_subagent.ts` 和 `automatic_ui_subagent.js` 中定义的工具包暴露给 AI 系统。这些包根据系统能力提供不同的工具集。

### 工具包状态

这些包根据虚拟显示可用性定义条件工具状态：
状态条件可用工具`virtual_display``ui.virtual_display` 为 true`run_subagent_main`、`run_subagent_virtual`、`run_subagent_parallel_virtual`、`close_all_virtual_displays``main_screen``!ui.virtual_display`仅 `run_subagent_main`
每个工具使用不同的参数组合和约束包装 `runUiSubAgent()` 方法。

### 工具参数

`run_subagent_*` 工具接受以下参数：

```
{
    intent: string           // Required: Natural language task description
    target_app?: string      // Optional: Target app name/package
    max_steps?: number       // Optional: Maximum steps (default: 20)
    agent_id?: string        // Optional: Session ID for virtual display reuse
}
```

并行执行工具 `run_subagent_parallel_virtual` 接受 1-4 组这些参数(后缀为 `_1`、`_2`、`_3`、`_4`)，以在不同虚拟显示上并发运行多个代理。

## 测试界面

`AutoGlmToolScreen` 提供了一个用于 UI 自动化工具的手动测试界面：

```
Execution

ViewModel

UI Screen

OutlinedTextField
Task Description

Switch
Use Virtual Screen

Button
Execute/Cancel

Text + ScrollState
Execution Log

AutoGlmViewModel
executeTask(), cancelTask()

AutoGlmUiState
isLoading, log

EnhancedAIService
getAIServiceForFunction()

PhoneAgent
with ActionHandler

agent.run()
onStep callback

StringBuilder
Append timestamped logs
```

位于的界面提供了一个简单的接口来：

1. 输入自然语言任务描述
2. 切换虚拟屏幕使用
3. 执行任务并查看实时日志
4. 在执行过程中取消操作

日志包含时间戳、逐步的思考/行动对，以及类似于 AutoGLM CLI 输出格式的最终结果。

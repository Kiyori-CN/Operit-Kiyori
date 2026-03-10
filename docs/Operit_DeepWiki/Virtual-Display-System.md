# 虚拟显示系统

虚拟显示系统使 Operit 能够创建和管理隔离的虚拟显示，用于并行 UI 自动化。该系统允许多个独立的 UI 自动化会话同时在独立的虚拟屏幕上运行，每个屏幕都有自己的应用程序上下文和显示状态。这是实现并行工具执行和多应用工作流的关键组件。

有关 UI 自动化执行和 PhoneAgent 编排的信息，请参阅 [Phone Agent](/AAswordman/Operit/6.1-phone-agent)。有关虚拟显示所需权限通道的详细信息，请参阅 [Permission Channels](/AAswordman/Operit/6.2-permission-channels)。

---

## 概述与架构

虚拟显示系统基于客户端-服务器架构构建，其中特权服务器进程(通过 Shizuku 或 root 运行)创建和管理 Android `VirtualDisplay` 实例，而主 Operit 应用程序通过 WebSocket 通信控制这些显示。

### 核心架构

```

```

**关键组件：**
组件位置用途`ShowerController`虚拟显示管理的客户端控制器`ShowerServerManager`确保特权服务器正在运行`ShowerServer`外部特权进程创建和管理 VirtualDisplay 实例`VirtualDisplayOverlay`用于显示虚拟屏幕内容的 UI 覆盖层`DisplayPreferencesManager`虚拟显示设置的配置存储

---

## 显示创建和生命周期

当使用非默认 `agent_id` 初始化 `PhoneAgent` 时,虚拟显示器会按需创建。每个 `agent_id` 代表一个唯一的虚拟显示会话。

### 显示器生命周期流程

```
VirtualDisplayOverlay
Shower Server
ShowerServerManager
ShowerController
PhoneAgent
VirtualDisplayOverlay
Shower Server
ShowerServerManager
ShowerController
PhoneAgent
Agent executes automation...
Detect requiresVirtualScreen
(agentId != "default")
ensureDisplay(agentId, width, height, dpi)
ensureServerStarted(context)
Start server via Shizuku
(if not running)
Binder ready
Server available
CREATE_DISPLAY
{id, width, height, dpi, bitrate}
Create VirtualDisplay
Start H.264 encoder
WebSocket ready + displayId
Display created
show(displayId)
Initialize WebSocket client
Connect to video stream
Stream H.264 frames
Decode and render
shutdown(agentId)
DESTROY_DISPLAY{id}
Release VirtualDisplay
hide(agentId)
Close WebSocket
```

### Agent ID 到显示器的映射

虚拟显示系统使用 agent ID 来管理多个独立的显示会话:
Agent ID显示器类型使用场景`"default"` 或 `""`主物理屏幕单屏自动化,传统模式任何其他字符串专用虚拟显示器并行自动化,隔离会话
**PhoneAgent 代码示例:**

```
private val requiresVirtualScreen: Boolean = agentId.isNotBlank() && agentId != "default"
private val isMainScreenAgent: Boolean = agentId.isBlank() || agentId == "default"
```

---

## ShowerController API

`ShowerController` 提供了从应用层管理虚拟显示器的主要 API。

### 关键方法

方法描述返回类型`ensureDisplay(agentId, context, width, height, dpi, bitrateKbps)`为给定的 agent ID 创建或验证虚拟显示器`Boolean` (成功)`getDisplayId(agentId)`检索虚拟显示器的 Android 显示 ID`Int?``getVideoSize(agentId)`获取配置的视频尺寸`Pair<Int, Int>?``shutdown(agentId)`销毁虚拟显示器并释放资源`Unit``prepareMainDisplay(agentId, context)`为基于 Shower 的捕获准备主物理显示器`Boolean`

### 显示器创建逻辑

下图展示了 `PhoneAgent` 中显示器创建的决策树:

```
No

Yes

No

Yes

No

Yes

No

Yes

Failed

Success

Failed

Success

Agent.run called

agentId != 'default'?

Has ADB/Root
permission?

Experimental flag
enabled?

Shizuku running
& authorized?

ShowerServerManager.
ensureServerStarted

ShowerController.
ensureDisplay

VirtualDisplayOverlay.
show

Use main physical screen

Return error message

Continue with automation
```

---

## VirtualDisplayOverlay

`VirtualDisplayOverlay` 类提供了用于显示和控制虚拟显示器的 UI 层。它渲染来自 Shower 服务器的视频流，并提供自动化控制功能。

### 覆盖层实例管理

```
// Singleton per agent_id
companion object {
    private val instances = mutableMapOf<String, VirtualDisplayOverlay>()

    fun getInstance(context: Context, agentId: String): VirtualDisplayOverlay {
        return instances.getOrPut(agentId) {
            VirtualDisplayOverlay(context, agentId)
        }
    }

    fun hide(agentId: String) { /* ... */ }
    fun hideAll() { /* ... */ }
}
```

### 覆盖层功能

功能描述**视频渲染**解码来自 Shower 服务器的 H.264 流并渲染到 Surface**边框显示**在虚拟显示器周围显示彩色边框以提供视觉反馈**自动化控制**在代理执行期间显示进度条、暂停/恢复、取消按钮**显示 ID 指示器**显示正在使用的 Android 显示 ID**WebSocket 管理**维护与 Shower 服务器的连接以进行视频流传输

---

## 与 PhoneAgent 的集成

虚拟显示系统与 `PhoneAgent` 紧密集成，以实现隔离的自动化会话。

### PhoneAgent 虚拟显示集成

```
Cleanup

Execution Context

Pre-Run Setup

PhoneAgent Initialization

Yes

No

Virtual display active

Main screen only

Yes, non-default agent

No, default agent

PhoneAgent constructor

Set agentId in ActionHandler

Requires virtual
screen?

ensureRequiredVirtualScreenOrError

prewarmMainScreenShowerIfPossible

prewarmShowerIfNeeded

useShowerUi?

Show VirtualDisplayOverlay
with automation controls

Show UIAutomationProgressOverlay
fullscreen

Execute automation steps

Hide overlay/progress

cleanupOnFinish?

ShowerController.shutdown
+ VirtualDisplayOverlay.hide

Keep display alive
```

### ActionHandler 显示感知

`ActionHandler`(负责执行点击、滑动等 UI 操作)通过代理 ID 感知要定位的显示器：

```
class ActionHandler(
    private val context: Context,
    private val screenWidth: Int,
    private val screenHeight: Int,
    private val toolImplementations: ToolImplementations
) {
    private var agentId: String = "default"
    private var mainScreenShowerPrepared: Boolean = false

    fun setAgentId(id: String) {
        this.agentId = id
    }

    // When capturing screenshots or executing actions,
    // uses agentId to determine target display
}
```

---

## 并行自动化支持

虚拟显示系统的关键优势之一是支持跨多个独立应用实例的并行 UI 自动化。

### 并行执行架构

```
Virtual Display 3 (agent_3)

Virtual Display 2 (agent_2)

Virtual Display 1 (agent_1)

Main Agent

Main AI Agent

run_subagent_parallel_virtual tool

Virtual Display 1

PhoneAgent(agentId='agent_1')

App Instance 1
(e.g., DianPing)

VirtualDisplayOverlay
(agent_1)

Virtual Display 2

PhoneAgent(agentId='agent_2')

App Instance 2
(e.g., Meituan)

VirtualDisplayOverlay
(agent_2)

Virtual Display 3

PhoneAgent(agentId='agent_3')

App Instance 3
(e.g., Ctrip)

VirtualDisplayOverlay
(agent_3)
```

### 并行执行约束

工具包文档指定了并行执行的严格约束：
约束描述执行**唯一应用**每个并行分支必须针对不同的应用`target_app_i` 参数用于冲突检测**唯一 Agent ID**每个并行分支必须使用不同的 `agent_id`工具参数中明确要求**资源限制**并行数量 ≤ 可用独立应用数量工具建议文档**无同应用重叠**同一应用/包不能同时在多个虚拟显示中运行会导致应用状态损坏
**工具包示例：**

```
// From automatic_ui_subagent.ts
{
    name: "run_subagent_parallel_virtual"
    description: {
        zh: '''
并行运行 1-4 个 UI 子代理（强制虚拟屏）。
并行调用时，每个子代理使用不同的 agent_id（必须显式传入，且不能为 'default'）
同一个App/同一个包名，不能同时存在于两个虚拟屏/两个 agent_id 中并行操作
        '''
    }
    parameters: [
        {
            name: "intent_1"
            type: "string"
            required: true
        }
        {
            name: "agent_id_1"
            description: "第1个子代理 agent_id（必填，且不能为 'default'）"
            type: "string"
            required: true
        }
        {
            name: "target_app_1"
            description: "第1个子代理目标应用名（必填，用于并行冲突检测）"
            type: "string"
            required: true
        }
        // ... similar for intent_2/3/4
    ]
}
```

---

## 显示配置

虚拟显示行为由存储在 `DisplayPreferencesManager` 中的用户偏好设置控制。

### 可配置设置

偏好设置键类型默认值描述`experimental_virtual_display_enabled`Boolean依赖于实现虚拟显示功能的主开关`virtual_display_bitrate_kbps`Int3000视频流的 H.264 编码比特率

### 权限要求

虚拟显示需要提升权限才能创建 `VirtualDisplay` 实例：

```
STANDARD or
ACCESSIBILITY

DEBUGGER

ADMIN or ROOT

Not running or
not authorized

Running & authorized

Disabled

Enabled

Virtual Display Request

Permission Level

Shizuku Status

Experimental
Flag

Create Virtual Display

Fail with Error
```

**代码参考：**

```
private fun resolvePrivilegedExecutionState(
    context: Context,
    androidPermissionPreferences: AndroidPermissionPreferences,
    checkDebuggerShizuku: Boolean = true
): PrivilegedExecutionState {
    val preferredLevel = androidPermissionPreferences.getPreferredPermissionLevel()
        ?: AndroidPermissionLevel.STANDARD
 
    var isAdbOrHigher = when (preferredLevel) {
        AndroidPermissionLevel.DEBUGGER,
        AndroidPermissionLevel.ADMIN,
        AndroidPermissionLevel.ROOT -> true
        else -> false
    }
 
    if (isAdbOrHigher) {
        val experimentalEnabled = DisplayPreferencesManager
            .getInstance(context)
            .isExperimentalVirtualDisplayEnabled()
        if (!experimentalEnabled) {
            isAdbOrHigher = false
        }
    }
 
    // ... Shizuku check for DEBUGGER level ...
}
```

---

## 主屏幕展示模式

除了虚拟显示器外，Shower 系统还可以与主物理显示器(显示器 ID 0)配合使用，以提高截图捕获性能。

### 主屏幕准备

```
// From PhoneAgent
private suspend fun prewarmMainScreenShowerIfPossible(): Boolean {
    if (!isMainScreenAgent) return false

    val permissionState = resolvePrivilegedExecutionState(
        context = context,
        androidPermissionPreferences = androidPermissionPreferences
    )
    if (!permissionState.isAdbOrHigher) return false
    if (!permissionState.hasDebuggerShizukuAccess) return false
 
    val okServer = try {
        ShowerServerManager.ensureServerStarted(context)
    } catch (e: Exception) {
        false
    }
    if (!okServer) return false
 
    val okMainDisplay = try {
        ShowerController.prepareMainDisplay(agentId, context)
    } catch (e: Exception) {
        false
    }
    return okMainDisplay
}
```

当主屏幕 Shower 准备就绪时，`ActionHandler` 使用它通过 H.264 视频流进行更快的截图捕获，而不是请求 `MediaProjection` 权限。

---

## 清理和资源管理

正确清理虚拟显示器资源对于防止资源泄漏和孤立显示器至关重要。

### 清理位置

LocationTriggerCleanup 操作`PhoneAgent.run()` finally 块Agent 执行完成或失败隐藏覆盖层，可选调用 `shutdown()``MainActivity.onDestroy()`应用关闭`VirtualDisplayOverlay.hideAll()`每个 Agent 的清理`cleanupOnFinish=true``ShowerController.shutdown(agentId)` + `VirtualDisplayOverlay.hide(agentId)`

### 清理逻辑

```
// From PhoneAgent.run()
try {
    // ... agent execution ...
} finally {
    pauseFlow = null
    floatingService?.setFloatingWindowVisible(true)
    if (isMainScreenAgent) {
        floatingService?.setStatusIndicatorVisible(false)
    } else {
        clearAgentIndicators(context, agentId)
    }
    if (useShowerUi) {
        showerOverlay?.hideAutomationControls()
    } else {
        progressOverlay.hide()
    }
    if (cleanupOnFinish) {
        try {
            VirtualDisplayOverlay.hide(agentId)
        } catch (_: Exception) { }
        try {
            ShowerController.shutdown(agentId)
        } catch (_: Exception) { }
    }
}
```

### 默认 Agent 持久化

使用 `agentId="default"` 的 Agent **不会**自动清理显示(`cleanupOnFinish=false`)。这使得主屏幕 Shower 连接在多次自动化运行之间保持持久，以提升性能。

非默认 agent ID 默认使用 `cleanupOnFinish=true`，以确保虚拟显示在每次自动化会话后被释放。

---

## AutoGLM 工具集成

AutoGLM 工具界面提供了一个用于直接测试虚拟显示功能的 UI。

### AutoGLM 虚拟屏幕切换

```
// From AutoGlmViewModel
fun executeTask(task: String, useVirtualScreen: Boolean = false) {
    viewModelScope.launch {
        val agentIdForRun = if (useVirtualScreen) sessionAgentId else "default"

        if (useVirtualScreen) {
            // Ensure Shower server started
            val okServer = ShowerServerManager.ensureServerStarted(context)
            if (!okServer) {
                // Handle error
                return@launch
            }

            // Create virtual display
            val okDisplay = ShowerController.ensureDisplay(
                agentIdForRun, context, width, height, dpi
            )
            if (!okDisplay) {
                // Handle error
                return@launch
            }
        }

        val agent = PhoneAgent(
            context = context,
            config = agentConfig,
            uiService = uiService,
            actionHandler = actionHandler,
            agentId = agentIdForRun,
            cleanupOnFinish = false
        )

        agent.run(task = task, systemPrompt = systemPrompt)
    }
}
```

AutoGLM 界面包含一个开关，用于在主屏幕和虚拟屏幕执行之间切换，便于测试和调试虚拟显示功能。

---

## 系统要求与限制

### 要求

- **Android 版本：** API level 21+(Android 5.0+)以支持 VirtualDisplay API
- **权限级别：** DEBUGGER(Shizuku)或更高
- **实验性标志：** 必须在显示偏好设置中启用
- **Shizuku 服务：** 必须运行并已授权(对于 DEBUGGER 级别)

### 限制

1. **最大显示数量：** 受设备硬件和 Android 系统约束限制
2. **性能：** 每个虚拟显示都会消耗 CPU/GPU 资源用于渲染和 H.264 编码
3. **应用兼容性：** 某些应用会检测虚拟显示并可能拒绝运行或显示降级的 UI
4. **资源清理：** 不当的清理可能导致孤立的 VirtualDisplay 实例消耗资源
5. **同应用约束：** 由于 Android 进程模型，无法在多个虚拟显示中同时运行相同的应用包

---

## Manifest 配置

AndroidManifest 包含一个用于处理 Shower 服务器 binder 交接的广播接收器：

```
<!-- Receive Shower Binder handoff broadcast from the Shower server (Shizuku-style) -->
<receiver
    android:name=".core.tools.agent.ShowerBinderReceiver"
    android:exported="true">
    <intent-filter>
        <action android:name="com.ai.assistance.operit.action.SHOWER_BINDER_READY" />
    </intent-filter>
</receiver>
```

此接收器在 Shower 服务器启动过程中用于接收 IPC 通信的 Binder 接口。

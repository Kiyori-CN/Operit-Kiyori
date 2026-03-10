# 悬浮聊天服务

## 目的与范围

浮动聊天服务通过覆盖窗口提供系统级 AI 助手访问，无论前台运行哪个应用都可以访问。该服务管理具有多种显示模式的持久浮动窗口，处理聊天交互，并与核心 AI 服务协调，同时保持独立于主活动的生命周期。

有关应用内主聊天界面的信息，请参阅 [Chat UI Architecture](/AAswordman/Operit/3.1-chat-ui-architecture)。有关聊天历史持久化层的详细信息，请参阅 [Chat History Management](/AAswordman/Operit/3.3-message-processing)。

## 架构概览

悬浮聊天系统构建在多层架构之上，具有清晰的关注点分离：

```
Integration

UI Layer

Window Management

Service Layer

creates

creates

manages

binds to

creates

manages

shows/hides

renders

uses

switches between

switches between

switches between

switches between

binds to

provides

updates

updates

FloatingChatService
(Android Service)

ChatServiceCore
(Business Logic)

ServiceLifecycleOwner
(Lifecycle Management)

FloatingWindowManager
(View Creation & Layout)

FloatingWindowState
(State & Persistence)

ComposeView
(Compose UI)

StatusIndicator
(Visual Feedback)

FloatingChatWindow
(Main Composable)

FloatContext
(UI State)

FloatingChatBallMode

FloatingChatWindowMode

FloatingFullscreenMode

FloatingResultDisplay

FloatingWindowDelegate
(MainActivity Bridge)

ServiceConnection
(Binder Communication)
```

### 核心组件

组件类型职责`FloatingChatService`Android Service服务生命周期、前台通知、聊天核心初始化`ChatServiceCore`业务逻辑聊天消息处理、AI 交互、附件管理`FloatingWindowManager`视图管理器窗口创建、布局更新、位置管理`FloatingWindowState`状态容器窗口位置、大小、模式、持久化`FloatingChatWindow`Composable模式切换、UI 渲染编排`FloatContext`UI 状态Compose 状态、回调、动画管理`FloatingWindowDelegate`桥接MainActivity 到 Service 的通信

## 服务生命周期

### 服务创建与初始化

```
FloatingWindowManager
ChatServiceCore
FloatingChatService
FloatingWindowDelegate
MainActivity
FloatingWindowManager
ChatServiceCore
FloatingChatService
FloatingWindowDelegate
MainActivity
toggleFloatingMode()
startForegroundService(Intent)
onCreate()
initialize ChatServiceCore
setup message collectors
create FloatingWindowManager
createNotificationChannel()
startForeground(notification)
bindService(ServiceConnection)
onServiceConnected(Binder)
setCloseCallback()
show()
createLayoutParams()
windowManager.addView()
```

该服务遵循 Android 的前台服务模式，包含以下几个关键初始化步骤：

1. **服务创建**(`onCreate`)：

- 获取 `WakeLock` 以防止 AI 操作期间进入休眠
- 初始化 `ChatServiceCore` 用于消息处理
- 设置协程收集器以处理聊天历史、附件和输入状态
- 创建 `FloatingWindowManager` 并配置生命周期和 ViewModel 存储所有者
- 以前台服务方式启动并显示通知

2. **服务启动** (`onStartCommand`):

- 从 intent extras 处理初始模式
- 从 intent 反序列化配色方案和排版
- 通过窗口管理器显示悬浮窗

3. **服务绑定**:

- 返回 `LocalBinder` 用于双向通信
- 允许 MainActivity 设置关闭和重载回调

### 崩溃恢复

该服务实现了崩溃恢复机制以处理意外故障：

```
// Custom exception handler tracks crash frequency
private val customExceptionHandler =
    Thread.UncaughtExceptionHandler { thread, throwable ->
        handleServiceCrash(thread, throwable)
    }
```

如果在 60 秒内发生超过 3 次崩溃，服务会通过在 SharedPreferences 中设置标志来禁用自身，并停止

## 窗口模式

悬浮聊天系统支持五种不同的显示模式，每种模式针对不同的使用场景进行了优化：

```
minimize

expand

tap

voice input

tool result

finish recording

3s auto

minimize

minimize twice

close

WINDOW

BALL

FULLSCREEN

VOICE_BALL

RESULT_DISPLAY
```

### 模式特性

模式窗口大小可聚焦使用场景`BALL`60dp 圆形否最小化存在，快速访问`VOICE_BALL`60dp 圆形否带动画的语音输入`WINDOW`可调整大小否(初始)标准聊天界面`FULLSCREEN`MATCH_PARENT是沉浸式聊天体验`RESULT_DISPLAY`WRAP_CONTENT否工具执行结果

### 带动画的模式切换

模式切换系统使用 `AnimatedContent` 配合自定义过渡效果：

- **Ball ↔ 其他模式**：爆炸式缩放动画，持续时间 350-400ms
- **Window ↔ Fullscreen**：无动画(瞬间切换)以实现即时响应
- **Ball 模式**：快速交叉淡入淡出(250ms)

```
// Ball to other mode: window explodes from center
fadeIn(animationSpec = tween(400, delayMillis = 100)) +
scaleIn(initialScale = 0.0f, animationSpec = tween(400, delayMillis = 100))
 
// Other to ball: window shrinks, ball explodes
fadeIn(animationSpec = tween(350, delayMillis = 150)) +
scaleIn(initialScale = 0.0f, animationSpec = tween(350, delayMillis = 150))
```

### 球形模式

球形模式渲染一个类似 Siri 风格的动画球体，响应 AI 活动：

```
FloatingChatBallMode

SiriBall Component

Idle: Breathing animation

Processing: Wave animation

Result: Triggers RESULT_DISPLAY
```

点击时，球体展开为窗口模式。当工具完成执行时，它会短暂切换到 `RESULT_DISPLAY` 模式，然后在 3 秒后自动返回

### 窗口模式

标准可调整大小的聊天窗口，具有：

- 顶部栏拖动移动
- 边缘调整大小手柄(8 个方向)
- 缩放调整(0.5x 到 1.0x)
- 附件面板
- 消息输入框

窗口初始使用 `FLAG_NOT_FOCUSABLE`，在需要输入时切换为可聚焦

### 全屏模式

沉浸式全屏聊天，具有：

- AI 处理期间的波形可视化
- 大型消息显示区域
- 底部控制栏，带模式切换
- 用于消息编写的编辑面板
- 可直接聚焦以进行键盘输入

## 状态管理

### FloatingWindowState

`FloatingWindowState` 类管理所有窗口状态和持久化：

```
persists to

FloatingWindowState

+Int x

+Int y

+MutableState<Dp> windowWidth

+MutableState<Dp> windowHeight

+MutableState<Float> windowScale

+MutableState<FloatingMode> currentMode

+FloatingMode previousMode

+MutableState<Dp> ballSize

+MutableState<Boolean> isAtEdge

+MutableState<Boolean> isPetModeLocked

+saveState()

+restoreState()

SharedPreferences
```

### 状态持久化

状态在以下情况下保存到 SharedPreferences：

- 窗口位置变化
- 尺寸调整
- 模式切换
- 低内存警告
- 服务销毁

关键持久化值：

- `window_x`、`window_y`：位置坐标
- `window_width`、`window_height`：以 dp 为单位的尺寸
- `window_scale`：缩放因子(0.3-1.0)
- `current_mode`、`previous_mode`：模式状态

**恢复策略**：服务有意使用默认值而非保存的状态，以提供可预测的用户体验：

- 位置：固定在 (200, 200)
- 宽度：全屏宽度
- 高度：半屏高度
- 缩放：0.8x
- 模式：`WINDOW`

## 窗口管理器

### 布局参数和定位

`FloatingWindowManager` 创建和管理 Android `WindowManager.LayoutParams`：

```
FULLSCREEN

BALL/VOICE_BALL

WINDOW

RESULT_DISPLAY

createLayoutParams()

Current Mode?

MATCH_PARENT x MATCH_PARENT
x=0, y=0
Focusable

ballSize x ballSize
FLAG_NOT_FOCUSABLE
Coerce within bounds

widthscale x heightscale
FLAG_NOT_FOCUSABLE
2/3 min visible

WRAP_CONTENT
FLAG_NOT_FOCUSABLE
Near ball position

windowManager.addView()
```

### 位置约束

每种模式强制执行不同的边界约束：

**球形模式：**

```
val minVisible = ballSizeInPx / 2
state.x = state.x.coerceIn(
    -ballSizeInPx + minVisible + safeMargin,
    screenWidth - minVisible - safeMargin
)
```

**窗口模式：**

```
val minVisibleWidth = (params.width * 2 / 3)
state.x = state.x.coerceIn(
    -(params.width - minVisibleWidth) + safeMargin,
    screenWidth - minVisibleWidth - safeMargin
)
```

这确保窗口至少有一部分保持可访问以供用户交互

### 模式切换逻辑

模式转换涉及复杂的位置计算以保持视觉连续性：

```
WindowManager
State
FloatingWindowManager
User
WindowManager
State
FloatingWindowManager
User
alt
[To BALL from
FULLSCREEN]
[To WINDOW from
BALL]
[To FULLSCREEN]
switchMode(newMode)
Cancel existing animations
Save previous mode
Save position based on mode
Calculate target params
Position at screen right-center
Center on ball position
x=0, y=0, MATCH_PARENT
Coerce within bounds
Animate size & position
Update flags (focusable, etc)
```

### ComposeView 创建

窗口管理器创建一个具有适当 Compose 生命周期集成的 `ComposeView`：

```
composeView = ComposeView(context).apply {
    setViewTreeLifecycleOwner(lifecycleOwner)
    setViewTreeViewModelStoreOwner(viewModelStoreOwner)
    setViewTreeSavedStateRegistryOwner(savedStateRegistryOwner)

    setContent {
        FloatingWindowTheme(...) {
            FloatingChatUi()
        }
    }
}
```

这确保了服务托管的 Compose UI 的正确生命周期处理

## 聊天集成

### ChatServiceCore 集成

该服务创建并管理一个 `ChatServiceCore` 实例用于所有聊天操作：

```
creates

collects

collects

collects

updates

updates

updates

consumed by

consumed by

consumed by

onSendMessage

onAttachmentRequest

onCancelMessage

FloatingChatService

ChatServiceCore

chatHistory flow

attachments flow

inputProcessingState flow

chatMessages StateFlow

attachments StateFlow

inputProcessingState StateFlow

FloatingChatWindow

User Input
```

### 消息流程

当用户通过悬浮窗发送消息时：

1. **UI 回调**：调用 `onSendMessage(message, promptType)`
2. **聊天 ID 检查**：确保活动聊天存在，如需要则创建新聊天
3. **消息更新**：通过 `chatCore.updateUserMessage()` 设置用户消息
4. **发送**：调用 `chatCore.sendUserMessage(promptType)`
5. **流式收集**：核心向 `chatHistory` 流发出更新
6. **UI 更新**：`chatMessages` 状态更新触发重组

### 智能消息重载

该服务实现了智能消息同步：

```
fun updateChatMessages(messages: List<ChatMessage>) {
    // Merge by timestamp to preserve existing instances
    val currentMessageMap = chatMessages.value.associateBy { it.timestamp }

    val mergedMessages = messages.map { newMsg ->
        val existingMsg = currentMessageMap[newMsg.timestamp]
        if (existingMsg != null &&
            existingMsg.content == newMsg.content &&
            existingMsg.roleName == newMsg.roleName) {
            existingMsg  // Keep existing instance
        } else {
            newMsg  // Use new message
        }
    }

    chatMessages.value = mergedMessages
}
```

这通过保留对象标识来防止不必要的重组

## 服务通信

### Binder 接口

`LocalBinder` 提供了 MainActivity 与服务之间的通信通道：

```
provides

exposes

binds to

LocalBinder

-closeCallback:() : -> Unit

-reloadCallback:() : -> Unit

+getService() : : FloatingChatService

+getChatCore() : : ChatServiceCore

+setCloseCallback(callback)

+notifyClose()

+setReloadCallback(callback)

+notifyReload()

FloatingChatService

ChatServiceCore

FloatingWindowDelegate
```

### FloatingWindowDelegate 桥接

MainActivity 中的 `FloatingWindowDelegate` 建立绑定：

```
private val serviceConnection = object : ServiceConnection {
    override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
        val binder = service as FloatingChatService.LocalBinder
        floatingService = binder.getService()

        binder.setCloseCallback {
            closeFloatingWindow()  // Update MainActivity state
        }

        binder.setReloadCallback {
            chatHistoryDelegate?.reloadChatMessagesSmart(chatId)
        }

        setupChatHistoryCollection()  // Start syncing messages
    }
}
```

### 双向消息同步

聊天历史同步在两个方向上流动：

**MainActivity → 服务：**

```
// Collect from ChatHistoryDelegate
chatHistoryFlow?.collect { messages ->
    if (_isFloatingMode.value) {
        floatingService?.updateChatMessages(messages)
    }
}
```

**服务 → MainActivity：**

```
// Notify reload after stream completes
chatCore.setAdditionalOnTurnComplete {
    binder.notifyReload()
}
```

## 状态指示器系统

### 视觉反馈模式

浮动服务在窗口隐藏但处理继续时提供视觉反馈：

```
Yes

No

FULLSCREEN/WINDOW

BALL

FULLSCREEN_RAINBOW

TOP_BAR

Window Hidden?

Mode?

No Indicator

Indicator Style?

Rainbow Border
Animated gradient
Full screen overlay

Compact Card
Progress indicator
Top center
```

### 全屏彩虹指示器

默认指示器创建一个动画彩虹边框：

```
@Composable
private fun FullscreenRainbowStatusIndicator() {
    val infiniteTransition = rememberInfiniteTransition()
    val animatedProgress by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        )
    )

    val rainbowColors = listOf(
        Color(0xFFFF5F6D), Color(0xFFFFC371),
        Color(0xFF47CF73), Color(0xFF00C6FF),
        Color(0xFF845EF7), Color(0xFFFF5F6D)
    )

    // Draw animated border with inner fade effect
}
```

该指示器使用 Canvas 绘制，包含：

- 外层彩虹环(全屏)
- 内层圆角矩形镂空
- 向中心渐变淡化的渐变带
- 4 秒动画循环

### 顶部栏指示器

一种替代的紧凑样式，提供更低干扰的反馈：

```
@Composable
private fun TopBarStatusIndicator() {
    Card(
        shape = RoundedCornerShape(24.dp),
        elevation = 8.dp,
        colors = secondaryContainer
    ) {
        Row {
            CircularProgressIndicator(size = 20.dp)
            Text("UI automation in progress")
        }
    }
}
```

### 指示器控制 API

该服务提供了控制指示器可见性的方法：
方法用途`setStatusIndicatorVisible(Boolean)`启用/禁用显示逻辑`setStatusIndicatorPersistentVisible(Boolean)`强制始终可见`setStatusIndicatorStyle(StatusIndicatorStyle)`在 FULLSCREEN_RAINBOW 和 TOP_BAR 之间切换`setStatusIndicatorAlpha(Float)`控制透明度(0.0-1.0)
可见性逻辑结合了多个标志：

```
val indicatorShouldShow = when {
    !indicatorDisplayEnabled && !indicatorPersistentEnabled -> false
    indicatorPersistentEnabled -> true
    else -> !windowVisible &&
            (currentMode == FULLSCREEN || currentMode == WINDOW)
}
```

## FloatContext 和 UI 状态

### 上下文对象结构

`FloatContext` 作为浮动 UI 组件的主要状态容器：

```
references

references

uses

FloatContext

+List<ChatMessage> messages

+Dp windowWidthState

+Dp windowHeightState

+Float windowScale

+FloatingMode currentMode

+FloatingMode previousMode

+List<AttachmentInfo> attachments

+Density density

+CoroutineScope coroutineScope

+FloatingChatService? chatService

+FloatingWindowState? windowState

+State<InputProcessingState> inputProcessingState

+Boolean showInputDialog

+String userMessage

+Boolean contentVisible

+Boolean showAttachmentPanel

+Animatable animatedAlpha

+Animatable transitionFeedback

FloatingChatService

FloatingWindowState

FloatingChatWindow
```

### 上下文创建策略

`rememberFloatContext` 函数使用复杂的策略来最小化重组：

```
@Composable
fun rememberFloatContext(...): FloatContext {
    // Only rebuild context when infrastructure changes
    val floatContext = remember(
        chatService,    // Stable
        windowState,    // Stable
        density,        // Stable until config change
        scope           // Stable
    ) {
        FloatContext(...)
    }

    // Update callbacks via rememberUpdatedState
    val currentOnClose by rememberUpdatedState(onClose)
    // ... other callbacks

    // Apply updates via SideEffect (not in remember)
    SideEffect {
        floatContext.onClose = currentOnClose
        floatContext.messages = messages
        // ... other frequent updates
    }

    return floatContext
}
```

此模式确保：

1. **上下文稳定性**：仅在结构变化时重新创建
2. **回调新鲜度**：始终使用最新的 lambda 捕获
3. **数据同步**：频繁的数据更新不会触发上下文重建
4. **性能**：最小化下游重组

## 服务恢复和边缘情况

### 内存管理

服务响应系统内存压力事件：

```
override fun onLowMemory() {
    super.onLowMemory()
    AppLogger.d(TAG, "onLowMemory: 系统内存不足")
    saveState()
}
 
override fun onTrimMemory(level: Int) {
    super.onTrimMemory(level)
    if (level == TRIM_MEMORY_UI_HIDDEN ||
        level == TRIM_MEMORY_RUNNING_CRITICAL) {
        saveState()
    }
}
```

### 任务移除处理

当用户从最近任务中滑动移除应用时，服务会自动重启：

```
override fun onTaskRemoved(rootIntent: Intent) {
    super.onTaskRemoved(rootIntent)
    val restartServiceIntent = Intent(applicationContext, this.javaClass)
        .apply { setPackage(packageName) }
    startService(restartServiceIntent)
}
```

这确保即使主应用从内存中移除后，浮动窗口仍然可访问

### WakeLock 管理

该服务获取 `PARTIAL_WAKE_LOCK` 以防止 CPU 在 AI 处理期间休眠：

```
private fun acquireWakeLock() {
    if (wakeLock == null) {
        val powerManager = getSystemService(POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "OperitApp:FloatingChatServiceWakeLock"
        )
        wakeLock?.setReferenceCounted(false)
    }
    if (wakeLock?.isHeld == false) {
        wakeLock?.acquire(10 * 60 * 1000L)  // 10 minute timeout
    }
}
```

WakeLock 在服务销毁或获取时间到期时释放

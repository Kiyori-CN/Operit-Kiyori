# UI 反馈与覆盖层

## 目的与范围

本文档涵盖用于在 UI 自动化操作和调试期间提供实时视觉指示器的视觉反馈和覆盖层系统。该系统由两个主要组件组成：用于显示操作反馈(点击、滑动、文本输入)的 `UIOperationOverlay` 和用于管理 UI 调试器悬浮窗的 `UIDebuggerService`。

有关底层 UI 自动化执行的信息，请参阅 [Action Execution](/AAswordman/Operit/6.5-action-execution)。有关用于聊天的悬浮窗模式的详细信息，请参阅 [Floating Chat Service](/AAswordman/Operit/3.6-floating-chat-service)。有关工具权限管理，请参阅 [Tool Permissions](/AAswordman/Operit/5.9-tool-permissions)。

---

## 系统概述

反馈覆盖层系统提供显示在所有应用程序之上的视觉指示器，以显示 UI 自动化操作在何处以及如何执行。这有助于用户和开发人员实时了解 AI 代理正在执行的操作。

```
System Integration

Services

Debugging Tools

Visual Feedback Layer

UI Automation Layer

showTap(x, y)

showSwipe()

showTextInput()

initOverlay()

requires

renders

renders

renders

addView()

manages

binds to

uses

uses

addView()

PhoneAgent
Multi-step Agent

ActionHandler
Action Execution

UIOperationOverlay
Singleton

ComposeView Overlay
System Window

TapIndicator
Ripple Animation

SwipeIndicator
Comet Animation

TextInputIndicator
Bubble Animation

UIDebuggerService
Foreground Service

UIDebuggerWindowManager
Window Lifecycle

UIDebuggerViewModel
Shared State

FloatingChatService
Main Service

ServiceLifecycleOwner
Compose Support

WindowManager
Android System

Settings.canDrawOverlays()
Permission Check
```

---

## UIOperationOverlay 架构

### 单例设计模式

`UIOperationOverlay` 实现了线程安全的单例模式，以防止同时创建多个覆盖窗口，这会导致视觉冲突和资源泄漏。
方面实现**模式**双重检查锁定单例**线程安全**`@Volatile` 实例 + `synchronized` 代码块**上下文**使用 `applicationContext` 防止内存泄漏**目的**确保整个应用生命周期中只有单个覆盖窗口

```
No

Yes

ActionHandler Thread 1

ActionHandler Thread 2

Main Thread

UIOperationOverlay.getInstance()

instance != null?

synchronized(this)

new UIOperationOverlay()

@Volatile instance
```

---

### 事件数据结构

覆盖系统定义了三种事件类型，每种都有唯一的 ID 用于跟踪单个动画：

```
manages

manages

manages

TapEvent

+Int x

+Int y

+UUID id

SwipeEvent

+Int startX

+Int startY

+Int endX

+Int endY

+UUID id

TextInputEvent

+Int x

+Int y

+String text

+UUID id

UIOperationOverlay

-MutableStateList<TapEvent> tapEvents

-MutableStateList<SwipeEvent> swipeEvents

-MutableStateList<TextInputEvent> textInputEvents

+showTap(x, y, autoHideDelayMs)

+showSwipe(startX, startY, endX, endY, autoHideDelayMs)

+showTextInput(x, y, text, autoHideDelayMs)

+hide()
```

每个事件都存储在响应式 `mutableStateListOf` 集合中，当添加或移除事件时会触发 Compose 重组。UUID 确保每个动画实例可以被唯一标识并独立移除。

---

## 覆盖窗口管理

### 窗口初始化

覆盖窗口创建为系统级 TYPE_APPLICATION_OVERLAY，具有特定标志以确保不干扰用户交互：
窗口参数值用途**宽度/高度**`MATCH_PARENT`覆盖整个屏幕以实现定位灵活性**类型**`TYPE_APPLICATION_OVERLAY`(API 26+)系统覆盖层权限级别**格式**`TRANSLUCENT`允许透明以实现视觉效果**标志**`NOT_FOCUSABLE` | `NOT_TOUCHABLE` | `NOT_TOUCH_MODAL`将触摸事件传递给底层应用**重力**`TOP` | `START`从左上角进行绝对定位

```
ComposeView
WindowManager
MainThread
UIOperationOverlay
Caller
ComposeView
WindowManager
MainThread
UIOperationOverlay
Caller
alt
[First Initialization]
alt
[Permission Granted]
[Permission Denied]
showTap(x, y)
Check overlay permission
runOnMainThread { initOverlay() }
Check if overlayView exists
getSystemService()
Create with lifecycle owners
setContent { OperationFeedbackContent() }
addView(overlayView, params)
Add TapEvent to tapEvents list
Schedule auto-remove after delay
requestOverlayPermission()
```

---

### 生命周期管理

覆盖层使用 `ServiceLifecycleOwner` 为覆盖层视图提供适当的 Compose 生命周期支持：

```
initOverlay()

ON_START event

ON_RESUME event

Add/Remove Events

hide() called

All events cleared

After AUTO_CLEANUP_DELAY_MS

After HIDE_DELAY_MS

removeView()

Resources cleared

Idle

Creating

Active

Cleanup

AutoCleanup

Destroying
```

系统使用两个延迟常量：

- `AUTO_CLEANUP_DELAY_MS = 500L`：等待时间以检查所有动画是否已完成
- `HIDE_DELAY_MS = 600L`：移除窗口前的额外延迟以允许动画完成

---

## 视觉反馈动画

### 点击指示器动画

点击指示器显示为不透明度递减的扩展涟漪：

```
300ms

300ms

Radius: 10dp
Alpha: 1.0
Stroke: 6dp

Radius: 30dp
Alpha: 0.5
Stroke: 3dp

Radius: 50dp
Alpha: 0.0
Stroke: 0dp
```

**动画规格：**

- 持续时间：600ms
- 缓动：`FastOutSlowInEasing`
- 颜色：青色(#00BCD4)
- 效果：扩展的圆圈，笔触逐渐变细

---

### 滑动指示器动画

滑动指示器呈现为从起始位置移动到结束位置的"彗星"效果：
阶段进度范围视觉效果**移动**0.0 - 0.8彗星头部沿轨迹移动**淡出**0.6 - 1.0整个可视化效果淡出**尾部**持续从起始位置到当前位置绘制的线条**头部**持续当前位置的明亮圆圈**起始光晕**0.0 - 1.0原点处的渐隐圆圈

```
Connected by

Ends at

Start Halo
Orange Circle
Fades with progress

Comet Tail
Orange Line
Follows head

Comet Head
Bright Circle
Current position
```

**动画规格：**

- 持续时间：1000ms
- 缓动函数：`FastOutSlowInEasing`
- 颜色：橙色 (#FFA726) 尾部，浅橙色 (#FFE0B2) 头部，深橙色 (#EF6C00) 光晕
- 笔触宽度：10dp
- 头部半径：15dp

---

### 文本输入指示器动画

文本输入指示器显示为带有脉动动画的气泡：

```
Points to

Speech Bubble
220dp × 50dp
Rounded corners

Quoted Text
White, 18sp

Pointing Arrow
Downward triangle

Shadow Layer
Offset 4dp

Highlight Border
Semi-transparent white

Input Location
(x, y)
```

**动画规格：**

- 淡入：300ms 线性
- 脉动：无限循环 1000ms，透明度在 0.8 和 1.0 之间变化
- 背景：黑色，93% 不透明度 (#EE000000)
- 位置：输入位置上方 60dp
- 边框：白色，47% 不透明度

---

## 坐标系统和状态栏调整

覆盖层系统调整所有 Y 坐标以适应状态栏高度：

```
subtract

positions in

Screen Top (0, 0)
System Coordinates

Status Bar
Height: statusBarHeight

Content Area
Actual Display Start

Input Y Coordinate
From ActionHandler

Adjusted Y = y - statusBarHeight
Overlay Coordinates
```

状态栏高度通过 Android 资源延迟计算：

---

## UIDebuggerService 架构

### 服务组件

`UIDebuggerService` 是一个前台服务，用于管理浮动 UI 调试器窗口：

```
Integration

Shared State

Window Management

UIDebuggerService

bindService()

callback

provides

setFloatingWindowVisible()

uses

UIDebuggerService
ViewModelStoreOwner

ViewModelStore
ViewModel lifecycle

ServiceLifecycleOwner
Compose support

Foreground Notification
ID: 1337

UIDebuggerWindowManager
Manages overlay lifecycle

ComposeView
UI Debugger UI

UIDebuggerViewModel
Singleton instance

isServiceRunning StateFlow
Global state

FloatingChatService
LocalBinder connection

ServiceConnection
Bind lifecycle

Window Interaction Controller
Control chat window visibility
```

---

### 服务间通信

`UIDebuggerService` 绑定到 `FloatingChatService`，以便在 UI 调试操作期间控制浮动聊天窗口的可见性：
组件类型用途**LocalBinder**`IBinder`在同一进程内提供直接服务引用**ServiceConnection**回调处理连接生命周期事件**InteractionController**Lambda传递给 ViewModel 以控制聊天窗口的函数

```
UIDebuggerViewModel
FloatingChatService
Android System
UIDebuggerService
UIDebuggerViewModel
FloatingChatService
Android System
UIDebuggerService
User triggers UI inspection
User finishes inspection
bindService(FloatingChatService)
Create/Connect
onServiceConnected(LocalBinder)
binder.getService()
setWindowInteractionController(lambda)
Call interaction controller
setFloatingWindowVisible(false)
Hide window for inspection
Call interaction controller
setFloatingWindowVisible(true)
Restore window
unbindService()
onServiceDisconnected()
setWindowInteractionController(null)
```

---

### 通知与生命周期

该服务作为前台服务运行，带有持久通知：
属性值**通道 ID**`"UIDebuggerChannel"`**通知 ID**`1337`**重要性**`IMPORTANCE_LOW`(最小用户干扰)**标题**"UI Debugger Active"**内容**"Tap to manage the UI debugger overlay."
**生命周期流程：**

```
onCreate()

Bind to FloatingChatService

onStartCommand()

ON_START lifecycle event

Show window

Window interactions

onDestroy()

Unbind from FloatingChatService

Created

Started

Running

Destroying
```

---

## 权限管理

### 悬浮窗权限要求

Both `UIOperationOverlay` and `UIDebuggerService` require the `SYSTEM_ALERT_WINDOW` permission to display content over other applications:

```
Yes

No

Exception

Component needs to show overlay

Settings.canDrawOverlays()?

Permission Granted

Create intent:
ACTION_MANAGE_OVERLAY_PERMISSION

Add FLAG_ACTIVITY_NEW_TASK

startActivity(intent)

User grants permission
in system settings

Initialize and show overlay

Log error
Return without showing
```

**权限检查实现：**

权限检查使用 Android 的 `Settings.canDrawOverlays()` API，该 API 在 API 23+(Android 6.0 Marshmallow 及以上版本)中可用。

---

## 线程安全与主线程强制执行

覆盖层系统强制所有 UI 操作在主线程上执行：

```
Yes

No

Exception

Caller Thread
Any Thread

Looper.myLooper() ==
Looper.getMainLooper()?

Execute action directly

Handler.post to main thread

Main Thread Execution

try-catch block

AppLogger.e() on exception
```

此模式用于三个关键领域：

1. **覆盖层初始化** - 确保 WindowManager 操作在主线程上执行
2. **事件添加** - 确保状态列表变更在主线程上执行
3. **隐藏操作** - 确保视图移除在主线程上执行

---

## 自动清理机制

该覆盖层使用两阶段清理机制，在不再需要时自动移除窗口：

### 阶段 1：事件移除

每个事件使用 `Handler.postDelayed()` 调度自己的移除：

```
Handler
EventList
Overlay
Caller
Handler
EventList
Overlay
Caller
Wait 1500ms
Wait 500ms
Keep window visible
alt
[All events cleared]
[Events still present]
showTap(x, y, autoHideDelayMs=1500)
Add TapEvent
postDelayed(1500ms)
Remove TapEvent
scheduleAutoCleanup()
postDelayed(500ms)
Check if all lists empty
hide()
```

### 阶段 2：窗口移除

`hide()` 方法在移除窗口前添加额外延迟：
延迟目的`autoHideDelayMs`允许单个动画完成`AUTO_CLEANUP_DELAY_MS` (500ms)等待查看是否会添加更多事件`HIDE_DELAY_MS` (600ms)确保动画在窗口移除前完全渲染

---

## 与 UI 自动化的集成

反馈覆盖层系统在 UI 自动化操作期间由动作执行层调用：

```
Visual Output

Feedback Layer

Action Execution Layer

ActionHandler

executeTap()

executeSwipe()

executeTextInput()

UIOperationOverlay.getInstance(context)

showTap(x, y)

showSwipe(start, end)

showTextInput(x, y, text)

System Overlay Window

Compose Animations
```

集成通常通过如下调用完成：

```
// After executing a tap action
UIOperationOverlay.getInstance(context).showTap(x, y)
 
// After executing a swipe action
UIOperationOverlay.getInstance(context).showSwipe(startX, startY, endX, endY)
 
// After setting text input
UIOperationOverlay.getInstance(context).showTextInput(x, y, text)
```

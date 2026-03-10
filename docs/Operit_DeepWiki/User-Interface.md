# 用户界面

本文档描述了 Operit 的用户界面层，涵盖应用程序的屏幕架构、导航系统、聊天界面组件、主题自定义和响应式布局策略。有关底层聊天处理逻辑的信息，请参阅 [Chat System](/AAswordman/Operit/3-chat-system)。有关悬浮窗服务实现细节，请参阅 [Service Layer & Background Processing](/AAswordman/Operit/6-ui-automation)。

## 概述

Operit 的 UI 完全使用 Jetpack Compose 构建，并遵循基于屏幕的导航架构。该应用程序支持多种布局(手机和平板)、可自定义主题、悬浮窗模式以及各种聊天交互显示样式。

---

## 应用程序入口点和主要结构

### MainActivity 和应用程序初始化

应用程序入口点是 `MainActivity`，它继承自 `ComponentActivity` 并设置 Compose UI 根节点。主组合函数是 `OperitApp`，它编排整个 UI 层次结构。

```
setContent { }

screenWidthDp < 600

screenWidthDp >= 600

getScreenForNavItem()

getScreenForNavItem()

MainActivity
(ComponentActivity)

OperitApp
@Composable

NavController
(Compose Navigation)

Layout Selection Logic

PhoneLayout

TabletLayout

OperitRouter
(Screen Factory)
```

---

## 导航系统

### 屏幕层次结构和路由

Operit 使用基于密封类而非字符串路由的自定义导航系统。每个屏幕由一个 `Screen` 子类表示，该子类定义其父级、关联的 `NavItem` 和内容组合。

#### Screen 类结构

```
Screen

+parentScreen: Screen?

+navItem: NavItem?

+titleRes: Int?

+isSecondaryScreen: Boolean

+Content() : @Composable

AiChat

navItem = NavItem.AiChat

Settings

navItem = NavItem.Settings

ModelConfig

parentScreen = Settings

navItem = NavItem.Settings

titleRes = R.string.screen_title_model_config

Toolbox

navItem = NavItem.Toolbox

TerminalTool

parentScreen = Toolbox

navItem = NavItem.Toolbox
```

每个 `Screen` 对象定义：

- **parentScreen**：用于层次导航和返回按钮行为
- **navItem**：将屏幕与抽屉菜单项关联
- **titleRes**：应用栏的可选标题资源
- **Content()**：渲染屏幕的 Composable 函数

#### 导航状态管理

导航通过 `OperitApp` 中的状态变量进行管理：
状态变量类型用途`selectedItem``NavItem`当前选中的抽屉项`currentScreen``Screen`当前显示的屏幕`backStack``MutableList<Screen>`返回导航栈`isNavigatingBack``Boolean`跟踪前进与后退导航
导航函数为主屏幕和次屏幕实现了自定义逻辑：

- **主屏幕**(例如 `AiChat`、`Settings`)：从抽屉导航时清空返回栈
- **次屏幕**(例如 `ModelConfig`)：将当前屏幕添加到返回栈

---

## 主聊天界面架构

### 组件层次结构

聊天界面由多层组件组成：

```
inputStyle = AGENT

inputStyle = CLASSIC

chatStyle = CURSOR

chatStyle = BUBBLE

AIChatScreen
@Composable

ChatViewModel
(State Management)

ChatScreenContent

ChatScreenHeader

ChatArea

Input Section

AgentChatInputSection

ClassicChatInputSection

CursorStyleChatMessage

BubbleStyleChatMessage

StreamMarkdownRenderer
```

### ChatViewModel 状态管理

`ChatViewModel` 是聊天界面的核心状态持有者。它使用委托模式来分离关注点：

#### 委托架构

```
ChatViewModel

UiStateDelegate
(Error/Toast Messages)

ApiConfigDelegate
(API Settings)

ChatHistoryDelegate
(Message Persistence)

MessageProcessingDelegate
(Stream Handling)

TokenStatisticsDelegate
(Usage Tracking)

AttachmentDelegate
(File Attachments)

MessageCoordinationDelegate
(Orchestration)
```

ViewModel 通过 `StateFlow` 暴露响应式状态：
StateFlow委托用途`chatHistory``ChatHistoryDelegate`当前聊天中的消息列表`userMessage``MessageProcessingDelegate`当前输入文本框的值`isLoading``MessageProcessingDelegate`消息处理状态`apiKey`、`modelName``ApiConfigDelegate`API 配置`attachments``AttachmentDelegate`当前文件附件`currentWindowSize``TokenStatisticsDelegate`Token 使用统计

### 聊天显示样式

Operit 支持两种聊天显示样式，可通过用户偏好设置选择：

#### 样式对比

特性光标样式气泡样式组件`CursorStyleChatMessage``BubbleStyleChatMessage`布局全宽消息气泡容器头像可选可配置(用户和 AI)背景透明且容器最小化带尾巴的彩色气泡使用场景代码密集型交互对话式聊天
样式通过 `UserPreferencesManager.chatStyle` 偏好设置选择：

```
chatStyle = CHAT_STYLE_CURSOR  // Default
chatStyle = CHAT_STYLE_BUBBLE

```

### 输入区域样式

提供两种输入样式：

#### AgentChatInputSection

现代浮动输入栏，集成附件面板：

- 圆角浮动卡片设计
- 内联附件显示
- 语音输入按钮
- 处理状态指示器

#### ClassicChatInputSection

传统底部固定输入栏，带工具栏：

- 固定在屏幕底部
- 独立的设置和附件工具栏
- 模型选择下拉菜单
- 经典发送按钮

---

## 屏幕组件与布局

### ChatScreenContent 结构

`ChatScreenContent` 管理聊天显示区域，具有两种布局模式：

#### 覆盖模式

标题栏浮动在聊天区域上方，背景透明：

```
Box (fillMaxSize)

ChatArea
(fullscreen scroll)

ChatScreenHeader
(floating overlay)
```

#### 普通模式

标题栏和聊天区域垂直排列：

```
Column (fillMaxSize)

ChatScreenHeader

ChatArea
(scrollable)
```

该模式由 `UserPreferencesManager.chatHeaderOverlayMode` 偏好设置控制。

### ChatArea 消息渲染

`ChatArea` 实现消息分页和渲染：

#### 分页系统

消息分页以提升长聊天历史记录的性能：

```
increment depth

Full Chat History

calculatePaginationWindow()
depth, messagesPerPage

Visible Messages
(minVisibleIndex to end)

'Load More' Text
(clickable)
```

**算法**：从最后一条消息开始，每个深度级别向前计数 `messagesPerPage` 条用户/AI 消息。在 `summary` 消息处提前停止。

#### 消息上下文菜单

长按消息显示包含操作的上下文菜单：
操作图标功能编辑`Icons.Default.Edit`打开消息编辑器复制`Icons.Default.ContentCopy`将消息复制到剪贴板删除`Icons.Default.Delete`删除单条消息从此处删除`Icons.Default.DeleteSweep`删除此位置之后的所有消息朗读`Icons.AutoMirrored.Rounded.VolumeUp`文本转语音回复`Icons.Default.Reply`设置回复上下文分支`Icons.Default.AccountTree`创建对话分支插入摘要`Icons.Default.Summarize`添加摘要标记

---

## 设置和配置界面

### 设置屏幕组织

`SettingsScreen` 将配置选项组织为分类部分：

```
SettingsScreen

Account Section
GitHub Login

Personalization
Preferences, Language, Theme

Chat Configuration
History, Backup, Display

Model Settings
API Config, Prompts, Functions

Tools & Permissions
Tool Permissions, Custom Headers

Advanced Settings
Token Stats, Context Summary
```

每个部分使用 `SettingsSection` 可组合项与 `CompactSettingsItem` 条目进行渲染。

### 配置流程

设置修改遵循以下模式：

1. 用户与设置界面组件交互
2. 通过偏好管理器(例如 `ApiPreferences`、`UserPreferencesManager`)将值写入 `DataStore`
3. 偏好管理器将值暴露为 `Flow`
4. ViewModel 将流收集为 `StateFlow`
5. 界面组件观察状态并重组

**示例**：启用思考模式

```
User toggles switch
  → ApiPreferences.updateEnableThinkingMode(true)
    → DataStore.edit { preferences[ENABLE_THINKING_MODE] = true }
      → apiPreferences.enableThinkingModeFlow emits true
        → ChatViewModel.enableThinkingMode StateFlow updates
          → AIChatScreen recomposes with new state

```

---

## 悬浮窗界面

### 悬浮窗模式

悬浮聊天服务支持六种不同的视觉模式：

```
Voice activated

User expands

Maximize

Minimize

Voice ends

Restore

OCR selection

Complete

Show result

Dismiss

Ball

VoiceBall

Window

Fullscreen

ScreenOCR

ResultDisplay
```

模式类用途Ball`FloatingMode.Ball`紧凑圆形球体VoiceBall`FloatingMode.VoiceBall`语音输入时的音频响应球体Window`FloatingMode.Window`可调整大小的聊天窗口Fullscreen`FloatingMode.Fullscreen`全屏语音聊天界面ScreenOCR`FloatingMode.ScreenOCR`用于 OCR 的屏幕区域选择ResultDisplay`FloatingMode.ResultDisplay`显示工具结果的临时覆盖层

### FloatingChatService UI 生命周期

悬浮窗 UI 由 `FloatingChatService` 管理，这是一个使用 `WindowManager` 创建覆盖层的前台服务：

```
ComposeView
WindowManager
FloatingChatService
MainActivity
ComposeView
WindowManager
FloatingChatService
MainActivity
User interaction
startService()
onCreate()
addView(composeView)
setContent { FloatingWindowContent() }
Render current mode
Mode change requested
Recompose with new mode
stopService()
removeView(composeView)
onDestroy()
```

---

## 主题系统

### 主题架构

Operit 的主题系统通过 `UserPreferencesManager` 提供广泛的自定义功能：

```
UserPreferencesManager

Theme Settings Flow

Color Settings Flow

Background Settings Flow

Follow System Theme
(Boolean)

Custom Colors
(Primary/Secondary)

Background Media
(Image/Video URI)

MaterialTheme
(Compose)

ColorScheme
(Dynamic)
```

### 主题配置选项

设置偏好设置键默认值描述系统主题`followSystemTheme``true`自动深色/浅色模式主题模式`isDarkTheme`系统手动深色模式覆盖自定义颜色`useCustomColor``false`启用自定义配色方案主色调`customPrimaryColor`N/A主色调 RGB 值次要颜色`customSecondaryColor`N/A次要颜色 RGB 值背景图片`useBackgroundImage``false`启用自定义背景背景 URI`backgroundImageUri`N/A图片/视频文件 URI背景媒体类型`backgroundMediaType``IMAGE`图片或视频

### 自适应背景透明度

当启用背景图片时，UI 组件会自动调整其不透明度：

```
cardContainerColor = if (hasBackgroundImage) {
    MaterialTheme.colorScheme.surface
} else {
    MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
}

```

此模式在整个应用的 `SettingsScreen`、`ChatScreenContent` 和其他组件中使用。

---

## 专用 UI 组件

### Markdown 渲染系统

`StreamMarkdownRenderer` 提供基于 canvas 优化的实时 markdown 渲染：

#### 渲染管线

```
Raw Markdown Text

Markdown Parser
(CommonMark)

Canvas Renderer
(Custom Draw)

Cached Bitmap
(Performance)

Compose Canvas
```

特性：

- **流式支持**：在流式响应期间渲染不完整的 markdown
- **LaTeX 渲染**：通过 `RenderX` 库支持行内和块级 LaTeX 公式
- **代码高亮**：代码块语法高亮
- **Canvas 缓存**：提升长文档性能

### UI 反馈与覆盖层

#### UIOperationOverlay

工具操作的视觉反馈系统：

```
trigger

UIOperationOverlay

Tap Animation
(Circle + Ripple)

Swipe Animation
(Arrow + Trail)

Element Highlight
(Rectangle)

Tool Execution
(tap, swipe, etc.)
```

该覆盖层在屏幕顶部渲染动画以可视化自动化 UI 交互。

#### UIDebuggerService

开发者工具，显示带有 UI 元素信息的浮动覆盖层：

- **元素检查器**：显示无障碍节点层次结构
- **点击坐标**：显示触摸位置
- **性能指标**：帧率和内存使用情况

---

## 布局系统

### 响应式布局选择

Operit 根据屏幕尺寸调整其布局：

```
Yes

No

OperitApp

LocalConfiguration
screenWidthDp

Width < 600dp?

PhoneLayout
(Navigation Drawer)

TabletLayout
(Navigation Rail)
```

### PhoneLayout 特性

- **导航抽屉**：滑出式菜单用于屏幕选择
- **顶部应用栏**：显示当前屏幕标题和操作
- **单窗格**：一次显示一个屏幕
- **手势支持**：从边缘滑动打开抽屉

### TabletLayout 特性

- **导航栏**：持久化侧边导航栏
- **扩展内容区域**：利用水平空间
- **顶部应用栏**：与手机类似但具有更多水平空间
- **双窗格选项**：未来支持主从布局

两种布局使用相同的 `Screen` 定义和导航逻辑，确保跨设备形态的一致行为。

---

## 字符串资源与本地化

### 支持的语言

Operit 为多种语言提供本地化字符串资源：
语言文件字符串数量中文(简体)`values/strings.xml`1000+英语`values-en/strings.xml`1000+西班牙语`values-es/strings.xml`1000+
所有 UI 字符串通过 `stringResource(R.string.key)` 引用以支持运行时语言切换。

### 字符串分类

主要字符串资源类别包括：

- **导航**：屏幕标题、菜单项(`nav_*`)
- **聊天模块**：消息、输入提示(`chat_*`、`floating_*`)
- **设置**：配置标签(`settings_*`)
- **工作流**：工作流 UI 字符串(`workflow_*`)
- **工具**：工具名称和描述(`tool_*`)
- **错误**：错误消息和对话框(`error_*`)
- **权限**：权限请求说明(`permission_*`)

---

## 总结

Operit 的 UI 层实现了一个全面的基于 Jetpack Compose 的界面，包含：

1. **自定义基于屏幕的导航**，使用密封类和返回栈管理
2. **模块化聊天界面**，支持多种显示样式和输入模式
3. **广泛的自定义功能**，通过主题系统和偏好设置实现
4. **响应式布局**，适配手机和平板设备
5. **专用组件**，用于 Markdown 渲染、覆盖层和反馈
6. **悬浮窗模式**，支持后台运行
7. **多语言支持**，提供全面的本地化

该架构通过 ViewModels 和 delegates 强调关注点分离，使用 StateFlows 实现响应式状态管理，以及可组合、可复用的 UI 组件。

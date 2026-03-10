# Chat UI 架构

## 目的与范围

本文档描述了 Operit AI 中聊天用户界面层的架构,具体涵盖 MVVM 结构、委托模式实现、UI 组件层次结构和状态管理。重点介绍 `ChatViewModel`、委托类和可组合 UI 组件如何协调以提供聊天体验。

有关消息处理管道和 AI 服务集成的详细信息，请参阅 [Message Processing](/AAswordman/Operit/3.2-delegate-pattern-architecture)。有关聊天历史持久化和数据库操作，请参阅 [Chat History Management](/AAswordman/Operit/3.3-message-processing)。有关角色卡和人格系统，请参阅 [Character Cards and Personas](/AAswordman/Operit/3.4-chat-history-management)。

---

## 高层架构概览

聊天 UI 遵循严格的 MVVM(Model-View-ViewModel)架构，并额外增加了委托层以实现关注点分离。`ChatViewModel` 协调多个专门的委托对象，这些委托处理聊天功能的不同方面。

### 架构层次

```
Data Layer

Service Layer

Delegate Layer

ViewModel Layer

View Layer

AIChatScreen
ui/features/chat/screens/

ChatScreenContent
ui/features/chat/components/

ChatArea
ui/features/chat/components/

AgentChatInputSection
style/input/agent/

ClassicChatInputSection
style/input/classic/

ChatViewModel
ui/features/chat/viewmodel/

UiStateDelegate
(inner class)

FloatingWindowDelegate
(inner class)

MessageProcessingDelegate
services/core/

ChatHistoryDelegate
services/core/

ApiConfigDelegate
services/core/

TokenStatisticsDelegate
services/core/

AttachmentDelegate
services/core/

MessageCoordinationDelegate
services/core/

EnhancedAIService
api/chat/

ChatHistoryManager
data/repository/

AIToolHandler.getInstance()
core/tools/

CharacterCardManager.getInstance()
data/preferences/

AppDatabase
Room DB

ChatDao

MessageDao

ApiPreferences
DataStore
```

---

## ChatViewModel：中央协调器

`ChatViewModel` 类是管理所有聊天相关状态和操作的中央协调器。它初始化并协调多个委托对象，每个委托负责特定的关注点。

### ViewModel 结构与初始化

```
Additional Setup Methods

ChatViewModel init block

ChatViewModel(context)

initializeDelegates()

chatHistoryDelegate = ChatHistoryDelegate()

messageProcessingDelegate = MessageProcessingDelegate()

messageCoordinationDelegate = MessageCoordinationDelegate()

floatingWindowDelegate = FloatingWindowDelegate()

setupPermissionSystemCollection()

setupAttachmentDelegateToastCollection()

initializeVoiceService()
```

**核心职责：**

- **委托生命周期管理**：在构造函数中调用 `initializeDelegates()` 以正确顺序初始化委托，避免循环依赖
- **状态暴露**：使用延迟初始化暴露响应式 `StateFlow` 和 `SharedFlow` 属性(例如 `val chatHistory: StateFlow<List<ChatMessage>> by lazy { chatHistoryDelegate.chatHistory }`)
- **事件协调**：通过初始化期间传递的回调 lambda 在委托之间协调复杂操作
- **语音集成**：管理 `VoiceService` 实例用于 TTS/STT，在 `initializeVoiceService()` 中初始化
- **工具栏操作**：提供 `setTopBarActions` 可组合 lambda 以动态配置顶部栏按钮

### 委托初始化模式

委托按特定顺序初始化以解决依赖关系：
顺序委托构造函数参数关键依赖1`ChatHistoryDelegate``context`, `coroutineScope`, `onTokenStatisticsLoaded`, `getEnhancedAiService`, `ensureAiServiceAvailable`, `getChatStatistics`, `onScrollToBottom`无(首先创建)2`MessageProcessingDelegate``context`, `coroutineScope`, `getEnhancedAiService`, `getChatHistory`, `addMessageToChat`, `saveCurrentChat`, `showErrorMessage`, `updateChatTitle`, `onTurnComplete`需要 `chatHistoryDelegate.getChatHistory()` 和 `chatHistoryDelegate.addMessageToChat()`3`MessageCoordinationDelegate``context`, `coroutineScope`, `messageProcessingDelegate`, `chatHistoryDelegate`, `tokenStatsDelegate`, `apiConfigDelegate`, `showErrorMessage`协调 `messageProcessingDelegate` 和 `chatHistoryDelegate`4`FloatingWindowDelegate``context`, `chatHistoryDelegate`, `showFloatingServiceNotification`需要 `chatHistoryDelegate.currentChatId`

---

## 委托系统架构

每个委托处理不同的功能领域，促进关注点清晰分离和可测试性。

### 委托职责

```
FloatingWindowDelegate
(defined in ChatViewModel)

Floating Mode State

Service Management

Mode Switching

MessageCoordinationDelegate
(services/core)

Send Message Coordination

Summary Coordination

Token Limit Handling

AttachmentDelegate
(services/core)

Attachment Management

Screen Content Capture

Location Information

Notification Access

TokenStatisticsDelegate
(services/core)

Token Counting

Context Window Tracking

Cumulative Statistics

MessageProcessingDelegate
(services/core)

User Input Processing

Message Sending

Stream Response Handling

Loading State Management

InputProcessingState Management

ChatHistoryDelegate
(services/core)

Chat List Management

Current Chat Selection

Message Loading

Chat CRUD Operations

ApiConfigDelegate
(services/core)

API Configuration

Model Settings

Feature Toggles
(thinking, tools, max context)

EnhancedAIService Initialization

UiStateDelegate
(defined in ChatViewModel)

Error Messages

Popup Messages

Toast Events

Permission Level
```

### 委托通信模式

委托通过以下方式进行通信：

1. **直接方法调用**：父 ViewModel 调用委托方法
2. **回调 lambda**：委托通过初始化时传入的回调通知 ViewModel 事件
3. **StateFlow 观察**：UI 和其他组件观察委托暴露的 StateFlow

回调模式示例：

```
ChatHistoryDelegate initialization:
- onTokenStatisticsLoaded: (Int, Int, Int) -> Unit
  → Called when chat is loaded to restore token statistics

- getChatStatistics: () -> Triple<Int, Int, Int>
  → Lambda that retrieves current statistics from TokenStatisticsDelegate

- onScrollToBottom: () -> Unit
  → Lambda that triggers scroll in MessageProcessingDelegate

```

---

## UI 组件层次结构

聊天 UI 由多个嵌套的可组合项组成，每个都有特定的职责。

### 组件树

```
@Composable AIChatScreen()
ui/features/chat/screens/

CustomScaffold
bottomBar parameter

ChatScreenContent()
ui/features/chat/components/

ChatScreenHeader()
(Top Bar)

ChatHistorySelector()

Character Switcher Button

ChatArea()
(Message Display)

MessageItem()
@Composable private

CursorStyleChatMessage()

BubbleStyleChatMessage()

LoadingDotsIndicator()

AgentChatInputSection()
style/input/agent/

ClassicChatInputSection()
style/input/classic/

AttachmentPanel()

WorkspaceScreen()
webview/workspace/

ComputerScreen()
webview/computer/
```

### 关键 UI 组件

组件文件位置关键参数用途`AIChatScreen``padding`、`viewModel`、`isFloatingMode`、`hasBackgroundImage`、导航 lambda主屏幕可组合项，管理 ViewModel 生命周期，处理共享文件/链接，配置窗口软输入模式`ChatScreenContent``actualViewModel`、`chatHistory`、`chatStyle`、`isMultiSelectMode`、`selectedMessageIndices`布局容器，支持覆盖/普通标题模式、多选工具栏、导出对话框`ChatArea``chatHistory`、`scrollState`、`chatStyle`、`messagesPerPage`、`onSelectMessageToEdit`、回调函数消息列表，支持分页(默认每页 10 条)、自动滚动、上下文菜单、样式切换`MessageItem``index`、`message`、`chatStyle`、`isMultiSelectMode`、`isSelected`私有可组合项，用于渲染单条消息，处理长按上下文菜单、选择状态`ChatScreenHeader``actualViewModel`、`showChatHistorySelector`、`chatHeaderTransparent`顶部栏，包含模型选择器、聊天历史按钮、角色切换器、画中画按钮`AgentChatInputSection``userMessage`、`isLoading`、`onSendMessage`、`attachments`现代输入界面，带附件面板、语音按钮、全屏输入`ClassicChatInputSection`与 Agent 样式类似传统输入界面，带设置栏

---

## 状态管理

聊天 UI 使用 Kotlin 的 `StateFlow` 和 `SharedFlow` 进行响应式状态管理，遵循单向数据流原则。

### 状态流架构

```

```

**注意：** ViewModel 对暴露的 StateFlow 使用延迟初始化，以避免在委托属性初始化之前访问它们，防止循环依赖问题。

### 会话隔离模式

为了防止在聊天之间切换时消息流混淆，系统使用 `activeStreamingChatIds` 实现会话隔离：

```
UI Behavior

Derived States in ChatViewModel

Session State in MessageProcessingDelegate

activeStreamingChatIds: StateFlow>

currentChatId from ChatHistoryDelegate

currentChatIsLoading = combine(
  currentChatId,
  activeStreamingChatIds
) { id, activeIds ->
  id != null && activeIds.contains(id)
}

currentChatInputProcessingState = combine(
  currentChatId,
  inputProcessingStateByChatId
) { id, stateMap ->
  stateMap[id] ?: InputProcessingState.Idle
}

Show Stop Button
when currentChatIsLoading == true

Show Progress Bar
when inputProcessingState != Idle
```

**流程示例：** 当用户在聊天 A 中发送消息，然后在聊天 A 仍在流式传输时切换到聊天 B：

1. `activeStreamingChatIds` 包含 "Chat A"
2. `currentChatId` 变更为 "Chat B"
3. `currentChatIsLoading` 计算结果为 `false`(Chat B 不在活动集合中)
4. Chat B 的 UI 显示正常状态(无加载指示器)
5. Chat A 在后台继续处理
6. 返回 Chat A 时，`currentChatIsLoading` 变为 `true` 并显示流式 UI

---

## 消息流架构

从用户输入到显示响应的完整流程涉及跨委托的多个协调步骤。

### 发送消息流程

```
ChatHistoryManager
EnhancedAIService
TokenStatisticsDelegate
ChatHistoryDelegate
MessageProcessingDelegate
MessageCoordinationDelegate
ChatViewModel
AIChatScreen/InputSection
ChatHistoryManager
EnhancedAIService
TokenStatisticsDelegate
ChatHistoryDelegate
MessageProcessingDelegate
MessageCoordinationDelegate
ChatViewModel
AIChatScreen/InputSection
loop
[Streaming Response]
onSendMessage(content)
coordinateSendMessage(content, attachments)
Get current chat history
List<ChatMessage>
Check token limits
Within limits
processUserMessage(content, history)
addMessageToChat(userMessage)
addMessage(chatId, message)
sendMessage(messages, streaming=true)
Token chunk
updateMessage(aiMessage)
updateMessage(chatId, message)
Emit scrollToBottomEvent
Stream complete
updateCumulativeStatistics()
onTurnComplete callback
saveCurrentChat(tokens, windowSize)
updateChatTokenCounts(...)
```

### 加载聊天流程

```
TokenStatisticsDelegate
ChatHistoryManager
ChatHistoryDelegate
ChatViewModel
AIChatScreen
TokenStatisticsDelegate
ChatHistoryManager
ChatHistoryDelegate
ChatViewModel
AIChatScreen
switchChat(chatId)
switchChat(chatId)
setCurrentChatId(chatId)
loadChatMessages(chatId)
List<ChatMessage>
onTokenStatisticsLoaded(input, output, window)
setTokenCounts(...)
Update chatHistory StateFlow
UI recomposes with new messages
onScrollToBottom callback
Emit scrollToBottomEvent
Animate scroll to bottom
```

---

## 聊天样式

UI 支持两种不同的消息渲染样式，可通过用户偏好设置选择。

### 样式对比

特性Cursor 样式Bubble 样式组件`CursorStyleChatMessage``BubbleStyleChatMessage`布局左对齐列右/左气泡用户消息蓝色指示条右对齐气泡AI 消息无特殊样式左对齐气泡思考过程可展开区域隐藏工具标记在可折叠区域中可见从显示中剥离适用场景开发、调试日常对话

### 样式选择流程

```
CHAT_STYLE_CURSOR
or
CHAT_STYLE_BUBBLE

ChatStyle enum

when (chatStyle) {
CURSOR -> ...

BUBBLE -> ...

UserPreferencesManager
chatStyle: Flow

AIChatScreen
collectAsState()

ChatArea
(chatStyle parameter)

MessageItem

CursorStyleChatMessage

BubbleStyleChatMessage
```

---

## 多选模式

聊天界面支持多选消息以进行批量操作，如删除和分享。

### 多选模式状态管理

```
UI Changes

Callbacks Passed to ChatArea

User Actions

State Variables in ChatScreenContent

onToggleMultiSelectMode(index)

onToggleSelection(index)

toggle all/none

actualViewModel.shareMessages()

var isMultiSelectMode by remember { mutableStateOf(false) }

var selectedMessageIndices by remember { mutableStateOf(setOf()) }

val selectableMessageIndices = remember(chatHistory) {
  chatHistory.mapIndexedNotNull { index, msg ->
    if (msg.sender in ['user', 'ai']) index else null
  }.toSet()
}

var isGeneratingImage by remember { mutableStateOf(false) }

Long Press on MessageItem

Click when isMultiSelectMode == true

TextButton: Select All/Clear

FilledIconButton: Delete

FilledIconButton: Share as Image

onToggleMultiSelectMode: (Int?) -> Unit

onToggleMessageSelection: (Int) -> Unit

AnimatedVisibility Bottom Toolbar

Modifier.background(primary.copy(alpha=0.1f))

Context Menu Hidden
```

**流程：** 当用户长按索引为 5 的消息时：

1. 调用 `onToggleMultiSelectMode(5)`
2. `isMultiSelectMode` 变为 `true`
3. `selectedMessageIndices` 变为 `setOf(5)`
4. 显示带有操作按钮的底部工具栏
5. 后续点击消息会切换其选中状态
6. 多选模式期间禁用上下文菜单
7. 分享按钮调用 `ChatViewModel.shareMessages()`，使用 `MessageImageGenerator` 生成 PNG 图片

---

## 集成点

聊天 UI 与其他几个子系统集成。

### 外部依赖

```
Floating Window

Voice

Workspace

Tool System

Character System

AI Services

Chat UI Layer

EnhancedAIService
(Message Generation)

ConversationService
(Context Building)

CharacterCardManager
(Persona Selection)

WaifuMessageProcessor
(Emotion Extraction)

AIToolHandler
(Tool Execution)

ToolPermissionSystem
(Authorization)

WorkspaceUtils
(Project Management)

LocalWebServer
(Code Preview)

VoiceService
(TTS/STT)

FloatingChatService
(System Overlay)
```

---

## 性能优化

### 消息分页

`ChatArea` 实现增量加载以处理大型聊天历史记录：

```
Initial display: Last 10 messages (messagesPerPage)
User scrolls to top → Load 10 more
Repeat until all messages loaded

```

任何时候只渲染可见消息，防止过度重组。

### 延迟历史加载

`ChatHistoryDelegate` 加载聊天元数据(标题、时间戳、令牌计数)而不加载完整消息内容：

```
// ChatEntity -> ChatHistory conversion
messages = emptyList(), // Key optimization: don't load messages
```

仅当通过 `loadChatMessages(chatId)` 选择特定聊天时才加载消息。

### 滚动优化

自动滚动到底部仅在以下情况触发：

1. `autoScrollToBottom` 状态为 true
2. 添加或更新新消息
3. 未被用户手动滚动覆盖

---

## 错误处理

UI 层通过 `UiStateDelegate` 实现了集中式错误处理模式。

### 错误显示机制

```
showErrorMessage(msg)

errorMessage StateFlow

errorMessage != null

showToast(msg)

toastEvent StateFlow

toastEvent != null

Any Delegate

UiStateDelegate

ChatViewModel

AIChatScreen

ErrorDialog
(Modal Popup)

Toast Message
(Brief Notification)
```

**错误对话框**：需要用户确认的关键错误(API 失败、配置错误)

**Toast 消息**：信息性消息(操作成功、轻微警告)

---

## 总结

聊天 UI 架构展示了结构良好的 MVVM 实现，具有清晰的关注点分离：

- **ChatViewModel** 作为协调器，按正确顺序初始化委托并协调它们之间的交互
- **委托模式**将职责划分为专注、可测试的单元(消息处理、聊天历史、API 配置等)
- **响应式状态管理**使用 StateFlow/SharedFlow 确保单向数据流
- **会话隔离**防止在切换聊天时出现流混淆
- **性能优化**包括消息分页、延迟历史加载和滚动优化
- **灵活渲染**支持多种聊天样式(Cursor/Bubble)和多选模式以进行批量操作

该架构能够很好地扩展以支持高级功能，如工作区集成、语音交互和悬浮窗模式，同时保持代码清晰度和可维护性。

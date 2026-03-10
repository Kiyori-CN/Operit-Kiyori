# 状态管理模式

## 目的和范围

本文档描述了 Operit 代码库中使用的状态管理模式。它涵盖了基于响应式 StateFlow 的架构、用于状态分离的委托模式、每个聊天的状态隔离，以及跨 UI 和服务层的状态生命周期管理。

有关使用此状态的 UI 层信息，请参阅[用户界面](/AAswordman/Operit/4-user-interface)。有关状态数据持久化的详细信息,请参阅[数据管理](/AAswordman/Operit/8-data-management)。

---

## 架构概览

Operit 使用 Kotlin `StateFlow` 实现了**单向数据流**架构来进行响应式状态管理。状态被组织成专门的委托，每个委托管理一个独立的状态域，然后在更高级别的组件(`ChatViewModel` 和 `ChatServiceCore`)中进行组合。

### 核心状态管理组件

```
State Delegates

Service Layer

UI Layer

collectAsState

collectAsState

ChatViewModel

AIChatScreen
(Composable)

FloatingChatWindowScreen
(Composable)

ChatServiceCore

FloatingChatService

MessageProcessingDelegate
• userMessage: StateFlow
• isLoading: StateFlow
• activeStreamingChatIds: StateFlow
• inputProcessingStateByChatId: StateFlow

ChatHistoryDelegate
• chatHistory: StateFlow
• currentChatId: StateFlow
• chatHistories: StateFlow

ApiConfigDelegate
• apiKey: StateFlow
• modelName: StateFlow
• enableTools: StateFlow

TokenStatisticsDelegate
• currentWindowSizeFlow: StateFlow
• cumulativeInputTokensFlow: StateFlow
• cumulativeOutputTokensFlow: StateFlow

AttachmentDelegate
• attachments: StateFlow

UiStateDelegate
• errorMessage: StateFlow
• popupMessage: StateFlow
• toastEvent: StateFlow

MessageCoordinationDelegate
• isSummarizing: StateFlow
```

---

## 基于 StateFlow 的响应式架构

Operit 中的所有状态都通过 Kotlin `StateFlow` 暴露，通过 Compose 的 `collectAsState()` API 实现响应式 UI 更新。这确保了单向数据流，状态变化会自动传播到所有观察者。

### StateFlow 模式

```
asStateFlow

collect

value =

MutableStateFlow
(Internal)

StateFlow
(Public)

UI Collectors
(collectAsState)

State Update
```

**示例模式：**

```
// Internal mutable state
private val _userMessage = MutableStateFlow(TextFieldValue(""))
 
// Public read-only state
val userMessage: StateFlow<TextFieldValue> = _userMessage.asStateFlow()
```

### UI 层的状态收集

UI 层使用 Compose 的 `collectAsState()` 收集状态：

```
// In AIChatScreen composable
val userMessage by actualViewModel.userMessage.collectAsState()
val isLoading by actualViewModel.currentChatIsLoading.collectAsState()
val chatHistory by actualViewModel.chatHistory.collectAsState()
```

---

## 用于状态分离的委托模式

状态管理被分离到专门的委托类中，每个类负责特定的领域。这实现了**关注点分离**，使代码库更易于维护。

### 委托层次结构

```
Supporting Delegates

Core Delegates

Orchestration Layer

depends on

depends on

depends on

ChatViewModel

ChatServiceCore

MessageProcessingDelegate
Handles message I/O and streaming

ChatHistoryDelegate
Manages chat persistence and loading

ApiConfigDelegate
Manages API settings

TokenStatisticsDelegate
Tracks token usage

AttachmentDelegate
Manages file attachments

MessageCoordinationDelegate
Coordinates send and summarization

UiStateDelegate
UI-specific state (errors, toasts)

FloatingWindowDelegate
Floating window mode
```

### 委托初始化顺序

委托必须按特定顺序初始化以避免循环依赖：

1. **UiStateDelegate** - 无依赖
2. **ApiConfigDelegate** - 无依赖
3. **TokenStatisticsDelegate** - 依赖于 `EnhancedAIService`
4. **AttachmentDelegate** - 依赖于 `AIToolHandler`
5. **ChatHistoryDelegate** - 依赖于令牌统计回调
6. **MessageProcessingDelegate** - 依赖于聊天历史回调
7. **MessageCoordinationDelegate** - 依赖于所有其他委托

---

## 状态委托职责

### MessageProcessingDelegate

管理核心消息处理状态，包括用户输入、AI 响应流式传输和加载状态。
StateFlow类型用途`userMessage``TextFieldValue`当前文本输入`isLoading``Boolean`全局加载状态`activeStreamingChatIds``Set<String>`具有活动流式传输的聊天 ID`inputProcessingStateByChatId``Map<String, InputProcessingState>`每个聊天的处理状态`scrollToBottomEvent``SharedFlow<Unit>`自动滚动的事件流
**关键方法：**

- `sendUserMessage()` - 发起消息发送
- `cancelMessage()` - 停止聊天的流式传输
- `updateUserMessage()` - 更新输入框状态

### ChatHistoryDelegate

管理聊天历史加载、持久化和聊天列表状态。
StateFlow类型用途`chatHistory``List<ChatMessage>`当前聊天中的消息`currentChatId``String?`活动聊天标识符`chatHistories``List<ChatHistory>`所有可用聊天`showChatHistorySelector``Boolean`选择器的 UI 状态
**关键方法：**

- `createNewChat()` - 创建新聊天
- `switchChat()` - 切换活动聊天
- `loadChatMessages()` - 加载聊天的消息
- `addMessageToChat()` - 向聊天追加消息

### ApiConfigDelegate

管理 API 配置和模型设置。
StateFlow类型用途`apiKey``String`API 认证密钥`apiEndpoint``String`API 基础 URL`modelName``String`活动模型标识符`isConfigured``Boolean`配置有效性`enableTools``Boolean`工具执行已启用`enableThinkingMode``Boolean`思考输出已启用`contextLength``Float`上下文窗口大小(KB)`summaryTokenThreshold``Float`自动摘要触发阈值

### TokenStatisticsDelegate

跟踪每个聊天的 token 使用量和窗口大小。
状态流类型用途`currentWindowSizeFlow``Int`当前上下文令牌数`cumulativeInputTokensFlow``Int`累计输入令牌数`cumulativeOutputTokensFlow``Int`累计输出令牌数`perRequestTokenCountFlow``Pair<Int, Int>?`上次请求令牌数

### AttachmentDelegate

管理消息的文件附件。
状态流类型用途`attachments``List<AttachmentInfo>`当前附件列表

---

## 按会话隔离状态

系统通过按聊天 ID 隔离状态来支持**并发对话**。这允许多个聊天同时处于不同的处理状态，这对于后台聊天操作和悬浮窗模式至关重要。

### 状态隔离架构

```
Per-Chat State

Per-Instance State

Global State

aggregate

aggregate

updates

updates

sharedIsLoading
MutableStateFlow

sharedActiveStreamingChatIds
MutableStateFlow>

loadingByInstance
ConcurrentHashMap

activeChatIdsByInstance
ConcurrentHashMap>

chatRuntimes
ConcurrentHashMap

inputProcessingStateByChatId
Map

ChatRuntime (chat-1)
• responseStream
• streamCollectionJob
• isLoading

ChatRuntime (chat-2)
• responseStream
• streamCollectionJob
• isLoading
```

### ChatRuntime 数据结构

每个聊天都有一个隔离的 `ChatRuntime` 实例：

```
private data class ChatRuntime(
    var responseStream: SharedStream<String>? = null,
    var streamCollectionJob: Job? = null,
    var stateCollectionJob: Job? = null,
    val isLoading: MutableStateFlow<Boolean> = MutableStateFlow(false)
)
 
private val chatRuntimes = ConcurrentHashMap<String, ChatRuntime>()
```

### 按会话输入处理状态

`inputProcessingStateByChatId` 映射跟踪每个聊天的详细处理状态：

```
sealed class InputProcessingState {
    object Idle : InputProcessingState()
    data class Processing(val message: String) : InputProcessingState()
    data class Connecting(val message: String) : InputProcessingState()
    data class Receiving(val message: String) : InputProcessingState()
    data class ExecutingTool(val toolName: String) : InputProcessingState()
    data class ToolProgress(val toolName: String, val progress: Float, val message: String) : InputProcessingState()
    data class ProcessingToolResult(val toolName: String) : InputProcessingState()
    data class Summarizing(val message: String) : InputProcessingState()
    data class Completed(val message: String) : InputProcessingState()
}
```

### 按聊天 ID 过滤 UI 状态

UI 层过滤状态以仅显示相关聊天的状态：

```
val currentChatIsLoading: StateFlow<Boolean> by lazy {
    combine(
        chatHistoryDelegate.currentChatId,
        messageProcessingDelegate.activeStreamingChatIds
    ) { currentId, activeIds ->
        currentId != null && activeIds.contains(currentId)
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.Eagerly,
        initialValue = false
    )
}
```

---

## 共享状态与实例状态

某些状态在所有实例间**全局**共享(用于跨进程一致性)，而其他状态则是**每个实例独立**的(用于隔离操作)。

### 共享状态模式

```
Instance 2: FloatingChatService

Instance 1: ChatViewModel

Static Shared State

update

update

update

update

sharedIsLoading
(companion object)

sharedActiveStreamingChatIds
(companion object)

MessageProcessingDelegate

loadingByInstance
['MPD-123' -> true]

activeChatIdsByInstance
['MPD-123' -> {chat-1}]

ChatServiceCore

MessageProcessingDelegate

loadingByInstance
['MPD-456' -> false]

activeChatIdsByInstance
['MPD-456' -> {}]
```

### 全局状态聚合

每个 `MessageProcessingDelegate` 实例将其状态注册到共享映射中：

```
private fun updateGlobalLoadingState() {
    val anyLoading = chatRuntimes.values.any { it.isLoading.value }
    val activeChatIds = chatRuntimes
        .filter { (_, runtime) -> runtime.isLoading.value }
        .keys
        .filter { it != "__DEFAULT_CHAT__" }
        .toSet()
 
    loadingByInstance[instanceKey] = anyLoading
    activeChatIdsByInstance[instanceKey] = activeChatIds
 
    sharedActiveStreamingChatIds.value = activeChatIdsByInstance.values
        .flatten()
        .toSet()
    sharedIsLoading.value = loadingByInstance.values.any { it }
}
```

这确保了 `ChatViewModel` 和 `FloatingChatService` 都能看到一致的全局状态。

---

## 状态生命周期管理

**UI 层**(ViewModel)和**服务层**(ChatServiceCore)的状态生命周期有所不同。

### ViewModel 生命周期

```
Activity Created

ChatViewModel Created

Delegates Initialized

StateFlow Collection Starts

UI Reactive Updates

Activity Destroyed

ViewModel onCleared()

State Saved
Resources Released
```

`ChatViewModel` 具有生命周期感知能力，当 Activity 销毁时会自动清理：

```
override fun onCleared() {
    super.onCleared()
    // Save current state
    viewModelScope.launch {
        chatHistoryDelegate.saveCurrentChat(/* ... */)
    }
}
```

### 服务生命周期

```
Service Started

ChatServiceCore Created

Delegates Initialized

Independent CoroutineScope

Background Operations

Service Stopped

CoroutineScope Cancelled

State Persisted to DB
```

`ChatServiceCore` 使用独立的 `CoroutineScope`，不与 Activity 生命周期绑定：

```
class ChatServiceCore(
    private val context: Context,
    private val coroutineScope: CoroutineScope
) {
    // Delegates initialized with the provided scope
    // State persists until scope is cancelled
}
```

---

## 状态同步

状态通过多种模式在多个来源和层之间进行同步。

### 数据库到内存同步

```
loadChatMessages

Flow

emit

collect

user action

insert/update

persist

Room Database
ChatEntity, MessageEntity

ChatHistoryManager
(Repository)

ChatHistoryDelegate

chatHistory: StateFlow

UI (collectAsState)
```

### 智能重载模式

为了最小化 UI 重组，`ChatHistoryDelegate` 实现了"智能重载"，保留现有消息实例：

```
suspend fun reloadChatMessagesSmart(chatId: String) {
    historyUpdateMutex.withLock {
        val newMessages = chatHistoryManager.loadChatMessages(chatId)
        val currentMessages = _chatHistory.value

        // Create timestamp map for fast lookup
        val currentMessageMap = currentMessages.associateBy { it.timestamp }

        // Preserve existing instances where content hasn't changed
        val mergedMessages = newMessages.map { newMsg ->
            val existingMsg = currentMessageMap[newMsg.timestamp]
            if (existingMsg != null && existingMsg.content == newMsg.content) {
                existingMsg  // Reuse existing instance
            } else {
                newMsg
            }
        }

        _chatHistory.value = mergedMessages
    }
}
```

### 跨服务同步

当 `FloatingChatService` 修改状态时，它通过 `FloatingWindowDelegate` 通知主应用：

```
// After message completion in service
if (isFloatingMode.value) {
    viewModelScope.launch {
        floatingWindowDelegate.notifyFloatingServiceReload()
    }
}
```

---

## 派生状态模式

某些状态是使用 `combine` 和 `stateIn` 从其他状态流**派生**的。

### 派生状态示例

```
val currentChatInputProcessingState: StateFlow<InputProcessingState> by lazy {
    combine(
        chatHistoryDelegate.currentChatId,
        messageProcessingDelegate.inputProcessingStateByChatId
    ) { currentId, stateMap ->
        if (currentId == null) return@combine InputProcessingState.Idle
        stateMap[currentId] ?: InputProcessingState.Idle
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.Eagerly,
        initialValue = InputProcessingState.Idle
    )
}
```

此模式为当前聊天创建了每个聊天状态的过滤视图。

### 工作区状态派生

```
val isWorkspaceOpen: StateFlow<Boolean> by lazy {
    combine(currentChatId, chatHistories) { id, histories ->
        histories.find { it.id == id }?.workspace?.isNotBlank() == true
    }.stateIn(viewModelScope, SharingStarted.Eagerly, false)
}
```

---

## 线程安全与并发

状态管理使用多种机制来确保线程安全：

### 用于每个聊天状态的 ConcurrentHashMap

```
private val chatRuntimes = ConcurrentHashMap<String, ChatRuntime>()
private val lastScrollEmitMsByChatKey = ConcurrentHashMap<String, AtomicLong>()
private val suppressIdleCompletedStateByChatId = ConcurrentHashMap<String, Boolean>()
```

### 用于关键区域的 Mutex

```
private val historyUpdateMutex = Mutex()
 
suspend fun reloadChatMessagesSmart(chatId: String) {
    historyUpdateMutex.withLock {
        // Critical section - ensures atomic updates
    }
}
```

### 原子状态更新

```
private val allowAddMessage = AtomicBoolean(true)
 
// Prevents race conditions during chat switching
allowAddMessage.set(false)
// ... load chat ...
allowAddMessage.set(true)
```

---

## 状态流组合

更高层级的组件将来自多个委托的状态组合成统一接口。

### ChatViewModel 状态组合

```
Delegate Sources

ChatViewModel Exposed State

lazy val

lazy val

lazy val

lazy val

lazy val

apiKey: StateFlow

chatHistory: StateFlow>

userMessage: StateFlow

isLoading: StateFlow

attachments: StateFlow>

ApiConfigDelegate.apiKey

ChatHistoryDelegate.chatHistory

MessageProcessingDelegate.userMessage

MessageProcessingDelegate.isLoading

AttachmentDelegate.attachments
```

`ChatViewModel` 中的所有属性都暴露为 `lazy val` 以避免初始化顺序问题：

```
val apiKey: StateFlow<String> by lazy { apiConfigDelegate.apiKey }
val chatHistory: StateFlow<List<ChatMessage>> by lazy { chatHistoryDelegate.chatHistory }
val userMessage: StateFlow<TextFieldValue> by lazy { messageProcessingDelegate.userMessage }
```

---

## 状态事件模式

某些状态更适合表示为**事件**而非持久状态。这些使用带有 `extraBufferCapacity` 的 `SharedFlow`。

### 事件流

```
private val _scrollToBottomEvent = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
val scrollToBottomEvent = _scrollToBottomEvent.asSharedFlow()
 
private val _nonFatalErrorEvent = MutableSharedFlow<String>(extraBufferCapacity = 1)
val nonFatalErrorEvent = _nonFatalErrorEvent.asSharedFlow()
```

事件使用 `tryEmit()` 发出，该方法不会挂起：

```
_scrollToBottomEvent.tryEmit(Unit)
```

### UI 中的事件收集

```
// Collect scroll events
LaunchedEffect(Unit) {
    scrollToBottomEvent.collect {
        if (autoScrollToBottom) {
            scrollState.animateScrollTo(scrollState.maxValue)
        }
    }
}
```

---

## 状态汇总表

委托关键 StateFlows生命周期线程安全**MessageProcessingDelegate**`userMessage`、`isLoading`、`activeStreamingChatIds`、`inputProcessingStateByChatId`绑定到作用域ConcurrentHashMap，共享静态状态**ChatHistoryDelegate**`chatHistory`、`currentChatId`、`chatHistories`绑定到作用域Mutex 用于更新，AtomicBoolean 用于标志**ApiConfigDelegate**`apiKey`、`modelName`、`enableTools`、`contextLength`绑定到作用域DataStore(单写入器)**TokenStatisticsDelegate**`currentWindowSizeFlow`、`cumulativeInputTokensFlow`、`cumulativeOutputTokensFlow`绑定到作用域按聊天映射**AttachmentDelegate**`attachments`绑定到作用域Dispatchers.IO 用于文件操作**MessageCoordinationDelegate**`isSummarizing`绑定到作用域Job 取消
跨委托的多个文件

---

此状态管理架构提供了一个**响应式**、**可组合**且**线程安全**的基础，支持单屏 UI 交互和复杂的多聊天后台操作。

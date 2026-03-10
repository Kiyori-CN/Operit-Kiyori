# 架构模式

本页面记录了 Operit 代码库中使用的核心架构模式。理解这些模式对于扩展功能、调试问题或重构组件至关重要。

**范围**:本页面涵盖应用程序级别的设计模式和架构决策。有关特定子系统架构,请参阅 [Chat System](/AAswordman/Operit/3-chat-system)、[Tool System](/AAswordman/Operit/5-tool-system) 和 [UI Automation](/AAswordman/Operit/6-ui-automation)。有关数据持久化模式,请参阅 [State Management Patterns](/AAswordman/Operit/8.5-state-management-patterns)。

---

## 委托模式

**委托模式（Delegate Pattern）** 是用于将复杂组件分解为可管理、可测试单元的主要架构模式。与其将所有逻辑放在单体的 ViewModel 或 Service 中，不如将职责分配到专门的委托类中。

### 目的与优势

委托模式解决了以下几个问题：

- **关注点分离**：每个委托处理一个特定领域(消息处理、聊天历史、令牌统计等)
- **可测试性**：委托可以独立测试
- **可复用性**：委托可以在 `ChatViewModel` 和 `ChatServiceCore` 之间共享
- **生命周期管理**：委托绑定到 `CoroutineScope`，使生命周期管理显式化

### 核心委托类

以下委托构成了聊天系统的基础：
委托类职责关键方法`MessageProcessingDelegate`消息流式传输、工具执行、AI 响应处理`sendUserMessage()`、`cancelMessage()`、`getResponseStream()``ChatHistoryDelegate`聊天 CRUD 操作、消息持久化、开场白`createNewChat()`、`switchChat()`、`addMessageToChat()``MessageCoordinationDelegate`高层消息编排、自动摘要`sendUserMessage()`、`handleTokenLimitExceeded()``ApiConfigDelegate`AI 服务配置、提供商管理`updateApiKey()`、`saveApiSettings()``TokenStatisticsDelegate`令牌跟踪、使用统计`updateCumulativeStatistics()`、`setupCollectors()``AttachmentDelegate`文件附件管理`addAttachment()`、`clearAttachments()`

### 委托架构图

```
Data Layer

Delegate Layer

Service Layer

Presentation Layer

ChatViewModel

AIChatScreen
(Compose UI)

ChatServiceCore

FloatingChatService

MessageCoordinationDelegate
• sendUserMessage()
• handleTokenLimitExceeded()

MessageProcessingDelegate
• sendUserMessage()
• cancelMessage()
• getResponseStream()

ChatHistoryDelegate
• createNewChat()
• switchChat()
• loadChatMessages()

ApiConfigDelegate
• updateApiKey()
• saveApiSettings()

TokenStatisticsDelegate
• updateCumulativeStatistics()
• setupCollectors()

AttachmentDelegate
• addAttachment()
• clearAttachments()

UiStateDelegate
• showErrorMessage()
• showToast()

ChatHistoryManager

EnhancedAIService

ApiPreferences
```

### ChatViewModel 中的实现

`ChatViewModel` 通过组合多个委托来展示委托模式，而不是直接实现所有逻辑：

```
// ChatViewModel delegates initialization
private val attachmentDelegate = AttachmentDelegate(context, toolHandler)
private val tokenStatsDelegate = TokenStatisticsDelegate(...)
private val apiConfigDelegate = ApiConfigDelegate(...)
private lateinit var chatHistoryDelegate: ChatHistoryDelegate
private lateinit var messageProcessingDelegate: MessageProcessingDelegate
private lateinit var messageCoordinationDelegate: MessageCoordinationDelegate
```

每个委托通过以下方式初始化：

1. **依赖项**：对其所需的其他委托或服务的引用
2. **回调函数**：事件发生时要调用的函数
3. **CoroutineScope**：用于生命周期感知的协程执行

ViewModel 通过 `StateFlow` 属性暴露委托状态：

```
// Exposed from delegates
val chatHistory: StateFlow<List<ChatMessage>> by lazy { chatHistoryDelegate.chatHistory }
val isLoading: StateFlow<Boolean> by lazy { messageProcessingDelegate.isLoading }
val attachments: StateFlow<List<AttachmentInfo>> by lazy { attachmentDelegate.attachments }
```

### 委托初始化顺序

委托必须按依赖顺序初始化以避免循环引用。`ChatViewModel` 中的初始化顺序：

1. **独立委托优先**：`ApiConfigDelegate`、`TokenStatisticsDelegate`、`AttachmentDelegate`、`UiStateDelegate`
2. **ChatHistoryDelegate**：依赖于令牌统计和 AI 服务
3. **MessageProcessingDelegate**：依赖于聊天历史和令牌统计
4. **MessageCoordinationDelegate**：依赖于所有其他委托(最高级别的协调器)

此模式封装在 `initializeDelegates()` 方法中：

### 共享状态管理

委托通过共享的 `MutableStateFlow` 实例进行协调。例如，`MessageProcessingDelegate` 维护全局加载状态，多个实例可以更新：

```
companion object {
    private val sharedIsLoading = MutableStateFlow(false)
    private val sharedActiveStreamingChatIds = MutableStateFlow<Set<String>>(emptySet())
}
```

这允许悬浮窗服务和主应用共享状态而无需直接耦合。

---

## MVVM(Model-View-ViewModel)模式

Operit 遵循 **MVVM** 架构模式来构建 UI 组件，在表示逻辑和 UI 渲染之间提供清晰的分离。

### MVVM 层级结构

```
State Flows

Model / Data Layer

ViewModel Layer

View Layer (Compose)

AIChatScreen
@Composable

ChatScreenContent
Layout & Composition

ChatArea
Message List

AgentChatInput
Input Section

ClassicChatInput
Alternative Input

MessageItem
Individual Message

ChatViewModel
• State Management
• Business Logic
• Delegate Orchestration

FloatingChatWindowModeViewModel
Floating Window State

ChatHistoryManager
Repository

EnhancedAIService
API Integration

ApiPreferences
DataStore

ChatEntity
Room Entity

MessageEntity
Room Entity

ChatMessage
Data Class

chatHistory: StateFlow

isLoading: StateFlow

userMessage: StateFlow

errorMessage: StateFlow
```

### View 层：Compose UI

View 层完全使用 Jetpack Compose 实现，采用无状态可组合项：

**核心可组合项**：

- `AIChatScreen`：顶层屏幕可组合项，接收 `ChatViewModel` 和 `PaddingValues`
- `ChatScreenContent`：主布局管理器，处理标题、聊天区域和输入部分
- `ChatArea`：显示消息列表，支持分页和加载指示器
- `AgentChatInput` / `ClassicChatInput`：基于用户偏好的不同输入样式

所有 UI 状态从 ViewModel 的 `StateFlow` 属性中收集：

```
@Composable
fun AIChatScreen(...) {
    val actualViewModel: ChatViewModel = viewModel { ChatViewModel(context.applicationContext) }

    // Collect state
    val chatHistory by actualViewModel.chatHistory.collectAsState()
    val isLoading by actualViewModel.currentChatIsLoading.collectAsState()
    val userMessage by actualViewModel.userMessage.collectAsState()
    val errorMessage by actualViewModel.errorMessage.collectAsState()

    // UI updates automatically when state changes
}
```

### ViewModel 层：ChatViewModel

`ChatViewModel` 继承自 `androidx.lifecycle.ViewModel`，作为 UI 状态的唯一数据源：

**职责**：

- **状态管理**：通过 `StateFlow` 暴露响应式状态
- **用户操作**：提供 UI 事件方法(`sendUserMessage()`、`createNewChat()` 等)
- **业务逻辑编排**：将实际工作委托给委托类
- **生命周期管理**：绑定到 UI 生命周期，自动清理

```
class ChatViewModel(private val context: Context) : ViewModel() {
    private val coroutineScope = viewModelScope // Lifecycle-aware scope

    // State exposed to UI
    val chatHistory: StateFlow<List<ChatMessage>>
    val isLoading: StateFlow<Boolean>
    val userMessage: StateFlow<TextFieldValue>

    // User action methods
    fun sendUserMessage() { ... }
    fun createNewChat() { ... }
    fun switchChat(chatId: String) { ... }
}
```

### Model 层：数据和业务逻辑

Model 层包含：

1. **仓储**：`ChatHistoryManager`，抽象数据源
2. **服务**：`EnhancedAIService`、`AIToolHandler` 用于外部集成
3. **数据类**：`ChatMessage`、`ChatHistory`、`AttachmentInfo`
4. **持久化**：Room 实体(`ChatEntity`、`MessageEntity`)

### 单向数据流

MVVM 强制执行单向数据流：

```
User Action

View
(Compose)

ViewModel
Method Call

Delegate
Business Logic

Model
(Repository/Service)

StateFlow
State Update
```

1. 用户与 View 交互(按钮点击、文本输入)
2. View 调用 ViewModel 方法
3. ViewModel 委托给相应的委托
4. 委托更新 Model(数据库、API 调用)
5. Model 变化触发 `StateFlow` 发射
6. View 使用新状态重组

---

## 仓储模式

**仓储模式**提供了对数据源的清晰抽象，集中数据访问逻辑，便于测试或切换实现。

### ChatHistoryManager 作为仓储

`ChatHistoryManager` 是主要的仓储实现，管理所有聊天和消息数据：

**接口**：

- **CRUD 操作**：创建、读取、更新、删除聊天和消息
- **响应式查询**：暴露 `StateFlow` 以实现自动 UI 更新
- **数据源抽象**：对 ViewModel 隐藏 Room 数据库细节

```
class ChatHistoryManager private constructor(context: Context) {
    // Reactive data streams
    val chatHistoriesFlow: StateFlow<List<ChatHistory>>
    val currentChatIdFlow: StateFlow<String?>

    // CRUD operations
    suspend fun createNewChat(): String
    suspend fun loadChatMessages(chatId: String): List<ChatMessage>
    suspend fun addMessage(chatId: String, message: ChatMessage)
    suspend fun deleteChat(chatId: String)
    suspend fun updateChatTitle(chatId: String, title: String)
}
```

仓储模式使 `ChatHistoryDelegate` 能够处理聊天数据，而无需了解 Room、SQL 查询或文件存储的细节。

### 仓储模式的优势

优势在 Operit 中的实现**可测试性**可在委托测试中模拟 `ChatHistoryManager`**集中式缓存**聊天数据缓存逻辑的单一入口**多数据源**可透明地组合 Room DB + 文件系统**一致的 API**所有组件使用相同方法，无论存储方式如何

### 通过仓储的数据流

```
Data Source Layer

Repository Layer

ViewModel / Delegate Layer

ChatEntity

MessageEntity

StateFlow>

ChatHistoryDelegate
• createNewChat()
• loadChatMessages()

ChatHistoryManager
• Caching
• Coordination
• Flow Publishing

AppDatabase
(Room)

ChatDao
• insertChat()
• getChatById()

MessageDao
• insertMessage()
• getMessagesForChat()

DataStore
(Preferences)
```

---

## 使用 Kotlin Flow 的响应式编程

Operit 大量使用 **Kotlin Flow** 进行响应式异步编程。这种模式支持声明式状态管理和自动 UI 更新。

### 用于 UI 状态的 StateFlow

`StateFlow` 用于始终具有当前值的热状态流：

**特性**：

- 始终具有值(无"空"状态)
- 合并更新(仅最新值有效)
- 多个收集器共享相同值
- 热流(即使没有收集器也保持活跃)

```
// In ViewModel or Delegate
private val _chatHistory = MutableStateFlow<List<ChatMessage>>(emptyList())
val chatHistory: StateFlow<List<ChatMessage>> = _chatHistory.asStateFlow()
 
// In Compose UI
val chatHistory by viewModel.chatHistory.collectAsState()
```

**常见的 StateFlow 属性**：

- `chatHistory`：当前消息列表
- `isLoading`：用于显示进度指示器的加载状态
- `currentChatId`：活动聊天标识符
- `attachments`：当前文件附件
- `errorMessage`：要显示的最新错误

### 用于事件的 SharedFlow

`SharedFlow` 用于不应重放的一次性事件：

**特性**：

- 不需要初始值
- 可以有多次发射
- 支持重放和缓冲
- 根据配置可以是冷流或热流

```
// In Delegate
private val _scrollToBottomEvent = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
val scrollToBottomEvent = _scrollToBottomEvent.asSharedFlow()
 
// Emit event
_scrollToBottomEvent.tryEmit(Unit)
 
// Collect event (doesn't replay past events)
LaunchedEffect(Unit) {
    scrollToBottomEvent.collect {
        // Scroll to bottom
    }
}
```

**常见的 SharedFlow 事件**：

- `scrollToBottomEvent`：触发滚动到最新消息
- `nonFatalErrorEvent`：显示临时错误提示
- `toastEvent`：显示信息消息

### Flow 的组合与转换

Flow 可以声明式地组合和转换：

**组合 Flow**：

```
// Combine current chat ID with active streaming IDs to determine if current chat is loading
val currentChatIsLoading: StateFlow<Boolean> = combine(
    chatHistoryDelegate.currentChatId,
    messageProcessingDelegate.activeStreamingChatIds
) { currentId, activeIds ->
    currentId != null && activeIds.contains(currentId)
}.stateIn(
    scope = viewModelScope,
    started = SharingStarted.Eagerly,
    initialValue = false
)
```

### 基于协程的异步操作

所有异步操作都使用结构化并发与协程：

```
fun sendUserMessage(...) {
    coroutineScope.launch(Dispatchers.IO) {
        // Background work
        val result = performNetworkCall()

        withContext(Dispatchers.Main) {
            // Update UI state
            _chatHistory.value = updatedHistory
        }
    }
}
```

**使用的调度器**：

- `Dispatchers.IO`：数据库和网络操作
- `Dispatchers.Main`：UI 状态更新
- `Dispatchers.Default`：CPU 密集型工作(很少使用)

### 流式响应模式

AI 响应使用自定义的 `SharedStream<String>` 包装器实现多收集器流式传输：

```
Flow

EnhancedAIService
generateResponse()

SharedStream
• Shared replay buffer
• Multiple collectors

UI Renderer
(Markdown)

Message Builder
(Accumulator)

Token Counter
```

这允许同一个流在实时更新 UI 的同时，也构建完整的消息用于数据库存储。

---

## 面向服务的架构

Operit 使用 Android Services 进行后台操作和跨进程功能。

### ChatServiceCore：可复用的服务逻辑

`ChatServiceCore` 将所有聊天业务逻辑封装在一个独立于生命周期的组件中：

**设计目标**：

- **可复用性**：可被 `ChatViewModel` 或 `FloatingChatService` 使用
- **生命周期独立性**：绑定到注入的 `CoroutineScope`，而非 Activity 生命周期
- **可测试性**：核心逻辑中没有 Android 框架依赖

```
class ChatServiceCore(
    private val context: Context,
    private val coroutineScope: CoroutineScope
) {
    private var enhancedAiService: EnhancedAIService? = null

    // Same delegates as ChatViewModel
    private lateinit var messageProcessingDelegate: MessageProcessingDelegate
    private lateinit var chatHistoryDelegate: ChatHistoryDelegate
    // ... other delegates

    fun sendUserMessage(...) { /* Orchestrates delegates */ }
    fun createNewChat() { /* Delegates to chatHistoryDelegate */ }
}
```

### FloatingChatService：前台服务

`FloatingChatService` 是一个 Android 前台服务，提供持久化的聊天功能：

**职责**：

- 维护系统悬浮窗口(悬浮聊天气泡、窗口模式、全屏)
- 在主应用不可见时保持聊天状态
- 显示带有快捷操作的通知
- 带速率限制的崩溃恢复

```
class FloatingChatService : Service() {
    private lateinit var chatServiceCore: ChatServiceCore
    private lateinit var floatingWindowManager: FloatingWindowManager

    override fun onCreate() {
        super.onCreate()
        chatServiceCore = ChatServiceCore(this, serviceScope)
        floatingWindowManager = FloatingWindowManager(this)
    }

    // Expose ChatServiceCore to UI
    inner class LocalBinder : Binder() {
        fun getChatCore(): ChatServiceCore = chatServiceCore
    }
}
```

### 服务通信模式

```
Data Layer (Shared)

Shared State

Service Process (can be same process)

Main App Process

ChatViewModel

AIChatScreen

FloatingChatService
Foreground Service

ChatServiceCore
Instance 1

sharedIsLoading
MutableStateFlow

sharedActiveStreamingChatIds
MutableStateFlow

ChatHistoryManager
Singleton

AppDatabase
Room
```

主应用中的 `ChatViewModel` 和服务中的 `ChatServiceCore` 都更新共享的 `StateFlow` 实例，实现跨组件状态同步而无需直接耦合。

---

## 其他模式

### 单例模式

许多管理器类使用延迟初始化的线程安全单例：

```
class ChatHistoryManager private constructor(context: Context) {
    companion object {
        @Volatile
        private var instance: ChatHistoryManager? = null

        fun getInstance(context: Context): ChatHistoryManager {
            return instance ?: synchronized(this) {
                instance ?: ChatHistoryManager(context.applicationContext).also {
                    instance = it
                }
            }
        }
    }
}
```

**使用单例的类**：

- `ChatHistoryManager`
- `AIToolHandler`
- `CharacterCardManager`
- `ModelConfigManager`
- `ToolPermissionSystem`

**原理**: 这些类维护全局状态或昂贵的资源(数据库连接、工具注册表)，应在整个应用中共享。

### 工厂模式

`AIServiceFactory` 根据提供商类型创建相应的 AI 服务实现：

```
object AIServiceFactory {
    fun createService(
        providerType: ApiProviderType,
        apiKey: String,
        endpoint: String,
        modelName: String
    ): AIService {
        return when (providerType) {
            ApiProviderType.OPENAI -> OpenAIService(...)
            ApiProviderType.ANTHROPIC -> ClaudeService(...)
            ApiProviderType.GEMINI -> GeminiService(...)
            ApiProviderType.LOCAL_MNN -> MNNService(...)
            // ...
        }
    }
}
```

这种抽象允许添加新的 AI 提供商而无需修改现有代码。

**来源**: 在架构图中引用

### 状态管理：使用 Mutex 进行并发访问

关键代码段使用 `Mutex` 实现安全的并发访问：

```
class ChatHistoryDelegate(...) {
    private val historyUpdateMutex = Mutex()

    suspend fun addMessageToChat(message: ChatMessage, chatId: String?) {
        historyUpdateMutex.withLock {
            // Ensure thread-safe updates
            val updated = _chatHistory.value + message
            _chatHistory.value = updated
            chatHistoryManager.addMessage(chatId, message)
        }
    }
}
```

### 延迟初始化以解决循环依赖

ViewModel 使用 `lateinit` 和 `lazy` 在委托初始化期间打破循环依赖：

```
class ChatViewModel(...) {
    // lateinit for delegates that reference each other
    private lateinit var chatHistoryDelegate: ChatHistoryDelegate
    private lateinit var messageProcessingDelegate: MessageProcessingDelegate

    // lazy for exposed properties to avoid initialization order issues
    val chatHistory: StateFlow<List<ChatMessage>> by lazy {
        chatHistoryDelegate.chatHistory
    }
}
```

### 松耦合通信的回调模式

委托使用回调函数而非直接引用来保持松耦合：

```
class MessageProcessingDelegate(
    // ...
    private val showErrorMessage: (String) -> Unit,
    private val updateChatTitle: (chatId: String, title: String) -> Unit,
    private val onTurnComplete: (chatId: String?, service: EnhancedAIService) -> Unit
) {
    // Delegate calls callback instead of directly accessing ViewModel
    private fun handleError(error: String) {
        showErrorMessage(error)
    }
}
```

这使得同一个委托可以在不同上下文(ViewModel 与 Service)中使用不同的回调实现。

---

## 模式集成示例

以下图表展示了多个模式如何在典型用户操作(发送消息)中协同工作：

```
EnhancedAIService
(Service)
AppDatabase
(Room)
ChatHistoryManager
(Repository Pattern)
ChatHistoryDelegate
(Delegate Pattern)
MessageProcessingDelegate
(Delegate Pattern)
MessageCoordinationDelegate
(Delegate Pattern)
ChatViewModel
(MVVM ViewModel)
AIChatScreen
(View)
EnhancedAIService
(Service)
AppDatabase
(Room)
ChatHistoryManager
(Repository Pattern)
ChatHistoryDelegate
(Delegate Pattern)
MessageProcessingDelegate
(Delegate Pattern)
MessageCoordinationDelegate
(Delegate Pattern)
ChatViewModel
(MVVM ViewModel)
AIChatScreen
(View)
loop
[For each chunk]
onSendButtonClick()
sendUserMessage()
getChatHistory(chatId)
loadChatMessages(chatId)
SELECT * FROM messages
MessageEntity[]
List<ChatMessage>
messages
sendUserMessage(...)
generateResponse(messages)
Flow<String> (reactive stream)
_chatHistory.emit(updated)
StateFlow update
Recompose with new message
Complete
addMessageToChat(message)
addMessage(chatId, message)
INSERT INTO messages
Success
Success
Success
onTurnComplete callback
Complete
```

**所示模式**：

1. **MVVM**：UI 调用 ViewModel 方法，从不直接访问数据层
2. **委托**：ViewModel 委托给专门的组件
3. **仓储**：`ChatHistoryManager` 抽象数据库操作
4. **响应式**：StateFlow 更新触发自动 UI 重组
5. **回调**：`onTurnComplete` 回调用于松耦合通知

---

## 总结表格

模式主要目的关键类优势**委托**分解复杂组件`MessageProcessingDelegate`、`ChatHistoryDelegate`、`MessageCoordinationDelegate`可测试性、可复用性、关注点分离**MVVM**将UI与业务逻辑分离`ChatViewModel`、`AIChatScreen`、`ChatHistoryManager`响应式UI、生命周期管理、可测试的ViewModel**仓储**抽象数据源`ChatHistoryManager`集中式数据访问、易于测试、一致的API**响应式(Flows)**声明式状态管理`StateFlow`、`SharedFlow`、coroutines自动UI更新、背压处理、取消机制**面向服务**后台操作`ChatServiceCore`、`FloatingChatService`持久化状态、跨进程通信**单例**共享昂贵资源`ChatHistoryManager`、`AIToolHandler`内存效率、全局状态管理**工厂**抽象对象创建`AIServiceFactory`可扩展性、提供者抽象
这些模式结合在一起，创建了一个可维护、可测试且可扩展的架构，支持Operit在AI聊天、工具执行和UI自动化方面的复杂需求。

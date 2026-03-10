# ChatServiceCore

## 目的与范围

`ChatServiceCore` 是 Operit 中所有聊天相关功能的核心编排服务。它为消息处理、聊天历史管理和 AI 服务协调提供统一的 API。该类设计为生命周期独立，允许主 UI(通过 `ChatViewModel`)和后台服务(通过 `FloatingChatService`)同时使用。

有关 ChatServiceCore 使用的各个委托的信息，请参阅：

- 消息处理：[Message Processing](/AAswordman/Operit/3.3-message-processing)
- 聊天持久化：[Chat History Management](/AAswordman/Operit/3.4-chat-history-management)
- 委托架构模式：[Delegate Pattern Architecture](/AAswordman/Operit/3.2-delegate-pattern-architecture)

有关包装 ChatServiceCore 的悬浮窗服务的信息，请参阅 [Floating Chat Service](/AAswordman/Operit/3.6-floating-chat-service)。

## 架构概览

`ChatServiceCore` 实现了基于委托的架构，其中专门的委托类处理聊天功能的不同方面。核心充当协调器并公开统一的 API 接口。

```
Data & Services

Delegate Layer

ChatServiceCore

Consumers

ChatViewModel
(Main UI)

FloatingChatService
(Background Service)

StandardChatManagerTool
(Tool Execution)

ChatServiceCore
API Surface

EnhancedAIService
Reference

MessageCoordinationDelegate
Send & Summarize

MessageProcessingDelegate
Streaming & State

ChatHistoryDelegate
CRUD & Persistence

ApiConfigDelegate
Settings & Config

TokenStatisticsDelegate
Usage Tracking

AttachmentDelegate
File Handling

UiStateDelegate
UI Events

EnhancedAIService

ChatHistoryManager

CharacterCardManager

AIToolHandler
```

**关键架构原则：**
原则实现**关注点分离**每个委托处理一项职责(消息、历史、统计等)**生命周期独立性**绑定到 `CoroutineScope` 而非 ViewModel 生命周期**双重用途**单一实现同时服务于 UI 和服务上下文**响应式状态**为所有可观察状态公开 `StateFlow`**集中协调**所有聊天操作通过这个单一协调器流转

## 初始化与生命周期

### 构造

`ChatServiceCore` 使用两个参数构造，并立即按特定顺序初始化所有委托以满足依赖关系：

```
EnhancedAIService
MessageCoordinationDelegate
MessageProcessingDelegate
ChatHistoryDelegate
TokenStatisticsDelegate
ApiConfigDelegate
ChatServiceCore
Client
EnhancedAIService
MessageCoordinationDelegate
MessageProcessingDelegate
ChatHistoryDelegate
TokenStatisticsDelegate
ApiConfigDelegate
ChatServiceCore
Client
Loads user preferences
Starts monitoring
currentChatIdFlow
Sets up streaming
infrastructure
Wires all delegates
together
new ChatServiceCore(context, scope)
initializeDelegates()
create ApiConfigDelegate
onConfigChanged callback
Receive EnhancedAIService
create TokenStatisticsDelegate
setupCollectors()
create ChatHistoryDelegate
create MessageProcessingDelegate
create MessageCoordinationDelegate
initialized = true
```

初始化序列确保：

1. **ApiConfigDelegate** 首先初始化并提供 `EnhancedAIService` 实例
2. **TokenStatisticsDelegate** 可以在服务就绪后设置收集器
3. **ChatHistoryDelegate** 开始监控聊天 ID 变化
4. **MessageProcessingDelegate** 接收所有必要的回调
5. **MessageCoordinationDelegate** 将所有内容连接在一起

### 生命周期管理

生命周期方面实现**作用域绑定**绑定到注入的 `CoroutineScope`，而非 ViewModel**服务引用**通过 `ApiConfigDelegate` 的回调获取 `EnhancedAIService`**状态持久化**委托处理各自的状态；核心仅负责协调**清理**依赖 `CoroutineScope` 取消；无需显式清理

## 委托系统

`ChatServiceCore` 管理七个专门的委托，每个委托处理聊天功能的不同方面：

```
Delegate Responsibilities

MessageCoordinationDelegate
---
sendUserMessage()
handleTokenLimitExceeded()
summarizeHistory()
manuallyUpdateMemory()

MessageProcessingDelegate
---
sendUserMessage() (internal)
cancelMessage()
updateUserMessage()
getResponseStream()

ChatHistoryDelegate
---
createNewChat()
switchChat()
getChatHistory()
addMessageToChat()
deleteMessage()

ApiConfigDelegate
---
enableThinkingMode
enableMemoryQuery
contextLength
enableSummary

TokenStatisticsDelegate
---
cumulativeInputTokens
cumulativeOutputTokens
currentWindowSize
updateStatistics()

AttachmentDelegate
---
handleAttachment()
removeAttachment()
clearAttachments()
attachments: StateFlow

UiStateDelegate
---
showToast()
showErrorMessage()
UI event coordination
```

### 委托交互模式

委托通过回调和共享状态进行交互。关键交互模式：

**模式 1：消息发送流程**

```
TokenStatisticsDelegate
ChatHistoryDelegate
MessageProcessingDelegate
MessageCoordinationDelegate
Core
TokenStatisticsDelegate
ChatHistoryDelegate
MessageProcessingDelegate
MessageCoordinationDelegate
Core
alt
[Token limit exceeded]
sendUserMessage()
Check token limits
launchAsyncSummaryForSend()
sendUserMessage() [internal]
getChatHistory()
messages
Stream AI response
addMessageToChat()
onTurnComplete callback
updateCumulativeStatistics()
saveCurrentChat()
```

**模式 2：聊天切换流程**

```
MessageProcessingDelegate
TokenStatisticsDelegate
ChatHistoryDelegate
Core
MessageProcessingDelegate
TokenStatisticsDelegate
ChatHistoryDelegate
Core
switchChat(chatId)
getChatStatistics()
(input, output, window)
saveCurrentChat()
loadChatMessages(chatId)
onTokenStatisticsLoaded()
scrollToBottom()
```

### 委托配置表

委托依赖项关键回调主要状态`MessageCoordinationDelegate`所有其他委托`getEnhancedAiService`、`updateWebServerForCurrentChat``isSummarizing``MessageProcessingDelegate``EnhancedAIService`、`ChatHistoryDelegate``getChatHistory`、`addMessageToChat`、`onTurnComplete``isLoading`、`userMessage`、`inputProcessingStateByChatId``ChatHistoryDelegate``ChatHistoryManager`、`CharacterCardManager``onTokenStatisticsLoaded`、`getChatStatistics``chatHistory`、`currentChatId`、`chatHistories``ApiConfigDelegate``ApiPreferences``onConfigChanged``enableThinkingMode`、`contextLength`、`enableSummary``TokenStatisticsDelegate``EnhancedAIService`无`cumulativeInputTokensFlow`、`cumulativeOutputTokensFlow`、`currentWindowSizeFlow``AttachmentDelegate``AIToolHandler`无`attachments``UiStateDelegate`无无Toast/错误事件

## 核心操作 API

`ChatServiceCore` 暴露了一个公共 API，抽象了底层委托的复杂性。该 API 按功能组进行组织：

### 消息操作

```
Internal Flow

Message Operations API

Exceeded

OK

sendUserMessage()
promptFunctionType, roleCardId,
chatId, message, proxySenderName

cancelCurrentMessage()
cancelMessage(chatId)

updateUserMessage(message)

getResponseStream(chatId)
Returns SharedStream

MessageCoordinationDelegate

Check Token Limits

launchAsyncSummaryForSend()

MessageProcessingDelegate.sendUserMessage()

MessageProcessingDelegate.cancelMessage()

MessageProcessingDelegate.updateUserMessage()

MessageProcessingDelegate.getResponseStream()
```

**关键方法：**
方法参数返回值描述`sendUserMessage()``promptFunctionType`, `roleCardIdOverride`, `chatIdOverride`, `messageTextOverride`, `proxySenderNameOverride``Unit`通过协调委托发送消息并自动摘要`cancelCurrentMessage()`无`Unit`取消当前聊天中的消息`cancelMessage(chatId)``chatId: String``Unit`取消特定聊天中的消息`updateUserMessage(message)``message: String``Unit`更新输入文本字段`getResponseStream(chatId)``chatId: String``SharedStream<String>?`获取聊天的活动流式响应

### 聊天管理操作

```
Delegate Operations

Chat Management API

createNewChat()
characterCardName, group,
inheritGroupFromCurrent,
setAsCurrentChat, characterCardId

switchChat(chatId)
switchChatLocal(chatId)

deleteChatHistory(chatId)
deleteMessage(index)
clearCurrentChat()

updateChatTitle(chatId, title)

syncCurrentChatIdToGlobal()

ChatHistoryDelegate.createNewChat()

ChatHistoryDelegate.switchChat()

ChatHistoryDelegate.delete*()

ChatHistoryDelegate.updateChatTitle()

ChatHistoryDelegate.switchChat()
(syncToGlobal=true)
```

**本地与全局聊天切换：**
方法行为使用场景`switchChat(chatId)`更新本地状态并写入 `DataStore`主 UI 导航`switchChatLocal(chatId)`仅更新本地状态悬浮窗浏览而不影响主 UI`syncCurrentChatIdToGlobal()`将本地状态写回 `DataStore`将悬浮窗同步回主应用

### 附件操作

方法说明`getAttachmentDelegate()`返回 `AttachmentDelegate` 实例以供直接访问`handleAttachment(filePath)`将附件添加到当前消息(挂起函数)`removeAttachment(filePath)`从当前消息中移除附件`clearAttachments()`清除所有附件

### Token 统计操作

方法说明`resetTokenStatistics()`将累计 token 计数重置为零`updateCumulativeStatistics()`从当前服务状态手动触发统计更新

## 状态管理

`ChatServiceCore` 将所有可观察状态暴露为 `StateFlow` 或 `SharedFlow`，实现响应式 UI 更新。状态按功能区域组织：

### 状态流架构

```
ChatServiceCore StateFlows

Event Streams

scrollToBottomEvent: SharedFlow

nonFatalErrorEvent: SharedFlow

attachmentToastEvent: SharedFlow

Attachment State

attachments: StateFlow>

Token Statistics State

cumulativeInputTokensFlow: StateFlow

cumulativeOutputTokensFlow: StateFlow

currentWindowSizeFlow: StateFlow

perRequestTokenCountFlow: StateFlow?>

Configuration State

enableThinkingMode: StateFlow

enableThinkingGuidance: StateFlow

enableMemoryQuery: StateFlow

enableAutoRead: StateFlow

contextLength: StateFlow

summaryTokenThreshold: StateFlow

enableSummary: StateFlow

enableTools: StateFlow

Chat History State

chatHistory: StateFlow>

currentChatId: StateFlow

chatHistories: StateFlow>

showChatHistorySelector: StateFlow

Message State

userMessage: StateFlow

isLoading: StateFlow

activeStreamingChatIds: StateFlow>

inputProcessingStateByChatId: StateFlow>

isSummarizing: StateFlow
```

### 状态流映射表

状态流来源委托类型用途`userMessage``MessageProcessingDelegate``StateFlow<TextFieldValue>`当前用户输入文本`isLoading``MessageProcessingDelegate``StateFlow<Boolean>`全局加载状态(任何聊天处理中)`activeStreamingChatIds``MessageProcessingDelegate``StateFlow<Set<String>>`当前正在流式传输的聊天 ID 集合`inputProcessingStateByChatId``MessageProcessingDelegate``StateFlow<Map<String, InputProcessingState>>`每个聊天的处理状态(空闲/处理中/工具/错误)`isSummarizing``MessageCoordinationDelegate``StateFlow<Boolean>`是否正在进行摘要生成`chatHistory``ChatHistoryDelegate``StateFlow<List<ChatMessage>>`当前聊天中的消息`currentChatId``ChatHistoryDelegate``StateFlow<String?>`活动聊天 ID`chatHistories``ChatHistoryDelegate``StateFlow<List<ChatHistory>>`所有可用聊天`cumulativeInputTokensFlow``TokenStatisticsDelegate``StateFlow<Int>`当前聊天的累计输入 token 数`cumulativeOutputTokensFlow``TokenStatisticsDelegate``StateFlow<Int>`当前聊天的累计输出 token 数`currentWindowSizeFlow``TokenStatisticsDelegate``StateFlow<Int>`当前上下文窗口大小`attachments``AttachmentDelegate``StateFlow<List<AttachmentInfo>>`当前消息附件

### InputProcessingState 层次结构

`inputProcessingStateByChatId` 流使用密封类层次结构暴露每个聊天的处理状态：
状态含义UI 处理`Idle`无活动处理隐藏加载指示器`Completed`处理成功完成隐藏加载指示器`Processing(message)`通用处理中显示带消息的加载动画`Connecting(message)`正在连接 AI 服务显示"正在连接..."加载动画`Receiving(message)`正在接收 AI 响应显示"正在接收..."加载动画`ExecutingTool(toolName)`工具执行中在状态栏显示工具名称`ProcessingToolResult(toolName)`处理工具输出显示"正在处理结果..."`Summarizing(message)`历史记录摘要生成显示"正在压缩历史..."`ExecutingPlan(message)`多步骤计划执行显示计划状态`Error(message)`发生错误显示错误状态和消息

## 集成点

`ChatServiceCore` 设计用于集成到不同的上下文中。两种主要的集成模式是：

### 模式 1：ViewModel 集成(主界面)

```
ComposeUI
ChatServiceCore
ChatViewModel
Activity
ComposeUI
ChatServiceCore
ChatViewModel
Activity
Create ViewModel
chatServiceCore = ChatServiceCore(context, viewModelScope)
Observe StateFlows
State updates
User interaction
sendUserMessage()
Process via delegates
StateFlow emission
UI update
```

**ViewModel 通常：**

- 使用 `viewModelScope` 创建 `ChatServiceCore`
- 直接暴露或转换核心的 `StateFlow`
- 将用户操作委托给核心方法
- 处理 UI 特定的关注点(导航、对话框)

### 模式 2：Service 集成(悬浮窗口)

```
StandardChatManagerTool
FloatingWindow
ChatServiceCore
FloatingChatService
System
StandardChatManagerTool
FloatingWindow
ChatServiceCore
FloatingChatService
System
Start foreground service
chatServiceCore = ChatServiceCore(context, serviceScope)
setAdditionalOnTurnComplete()
User interaction
sendUserMessage()
Process message
onTurnComplete callback
Send notification
Bind to service
LocalBinder.getChatCore()
Direct API calls
```

**Service 集成特性：**

- Service 使用服务作用域的协程上下文创建核心
- 为通知/事件设置额外的回调
- 通过 `LocalBinder` 暴露核心以供工具访问
- 独立于核心管理悬浮窗口生命周期

### 工具系统集成

工具可以通过绑定到 `FloatingChatService` 与 `ChatServiceCore` 交互：

```
getChatCore()

StandardChatManagerTool

bindService(FloatingChatService)

LocalBinder

ChatServiceCore

sendUserMessage()

createNewChat()

switchChat()

getResponseStream()

Observe StateFlows
```

**工具交互模式：**

1. **服务连接**：工具调用 `ensureServiceConnected()`，可选传入启动 intent
2. **核心访问**：通过 `LocalBinder.getChatCore()` 获取 `ChatServiceCore`
3. **API 调用**：直接调用核心方法(发送消息、创建聊天等)
4. **状态观察**：监听 `StateFlow` 以获取操作状态
5. **清理**：完成后解绑服务

### 回调配置

`ChatServiceCore` 支持可选的回调注册以实现自定义行为：
回调方法用途**服务就绪**`setOnEnhancedAiServiceReady((service) -> Unit)``EnhancedAIService` 初始化时通知**轮次完成**`setAdditionalOnTurnComplete((chatId, input, output, window) -> Unit)`每次 AI 轮次完成后通知(用于通知等)

## 使用模式

### 基本消息发送

```
Internal Flow

Client Code

No chat

Has chat

Within limits

Exceeded

chatCore.sendUserMessage(
promptFunctionType = CHAT
)

MessageCoordinationDelegate:
Check current chat exists

Create new chat

Check token limits

MessageProcessingDelegate:
sendUserMessage()

launchAsyncSummaryForSend()

Stream AI response

onTurnComplete callback
```

**示例：启用所有功能发送消息**

客户端只需调用：

```
chatCore.sendUserMessage(
    promptFunctionType = PromptFunctionType.CHAT,
    roleCardIdOverride = null, // Use active card
    chatIdOverride = null, // Use current chat
    messageTextOverride = "Hello!", // Or null to use userMessage state
    proxySenderNameOverride = null // User is sender
)
```

核心会自动：

- 确保聊天存在(如需要则创建)
- 检查令牌限制，如需要则触发异步摘要
- 从 `AttachmentDelegate` 收集附件
- 根据 `ApiConfigDelegate` 设置启用思考/记忆功能
- 通过 `MessageProcessingDelegate` 流式传输响应
- 通过回调更新令牌统计
- 通过 `ChatHistoryDelegate` 持久化到数据库

### 后台聊天操作(工具使用)

工具可以向特定聊天发送消息而不影响 UI 状态：

```
ResponseStream
MessageProcessingDelegate
MessageCoordinationDelegate
ChatServiceCore
StandardChatManagerTool
ResponseStream
MessageProcessingDelegate
MessageCoordinationDelegate
ChatServiceCore
StandardChatManagerTool
isBackgroundSend = true
Skips attachment collection
sendUserMessage(
chatIdOverride="specific-chat",
messageTextOverride="tool message"
)
sendUserMessage(chatIdOverride)
sendUserMessage(
chatId=specific-chat,
enableSummary=false
)
Send to AI
Message sent
getResponseStream("specific-chat")
getResponseStream()
SharedStream<String>
SharedStream<String>
collect { chunk -> ... }
AI response chunks
```

**后台操作的主要区别：**

- 提供了 `chatIdOverride`(非 null)
- `enableSummary=false` 以避免自动摘要
- 无附件收集或 UI 状态更新
- 必须通过 `getResponseStream()` 手动收集响应

### 悬浮窗本地导航

悬浮窗可以浏览聊天记录而不影响主界面的当前聊天：

```
User clicks chat in
recent chat selector

chatCore.switchChatLocal(chatId)

ChatHistoryDelegate.switchChat(
chatId, syncToGlobal=false
)

Update local _currentChatId

loadChatMessages(chatId)

Do NOT write to DataStore
```

之后，当用户返回主应用时：

```
User taps 'Return to App'

chatCore.syncCurrentChatIdToGlobal()

ChatHistoryDelegate.switchChat(
currentChatId, syncToGlobal=true
)

Write to DataStore

Main UI observes update
```

### 智能消息重载

在外部修改(如工具编辑)后，核心支持智能重载以保留消息对象实例：

```
// Reload without triggering unnecessary recompositions
chatCore.reloadChatMessagesSmart(chatId)
```

智能重载：

1. 从数据库加载新消息
2. 通过时间戳匹配现有消息
3. 如果内容未更改则重用现有消息对象
4. 仅为已更改/新消息创建新对象
5. 防止不必要的 UI 重组

### Token 限制处理

`ChatServiceCore` 在接近 token 限制时实现自动历史记录摘要：

```
No

Yes

User sends message

MessageCoordinationDelegate:
shouldGenerateSummary()

Token limit
exceeded?

Send message directly

launchAsyncSummaryForSend()

Generate summary message

Insert at proper position

Update window size

Send original message
(with increased threshold)

Normal message flow
```

**摘要触发条件：**

- Token 使用量超过 `summaryTokenThreshold`(可配置，默认约 0.8)
- 或消息数量超过阈值(如果启用)

**摘要生成期间：**

- 原始消息仍立即发送
- 本次请求的阈值临时提高 0.5
- 摘要在后台异步生成
- 消息完成后 UI 显示"正在摘要..."状态
- 摘要准备就绪后插入到计算的位置

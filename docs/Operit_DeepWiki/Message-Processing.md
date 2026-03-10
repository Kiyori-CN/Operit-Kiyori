# 消息处理

## 目的与范围

本文档涵盖聊天系统中的**消息处理子系统**，重点介绍用户消息如何发送到 AI 提供商，以及响应如何实时流式传输回 UI。包括流式架构、状态管理、多聊天支持和特殊处理模式。

相关信息请参阅：

- 整体聊天系统架构和委托模式：参见 [Delegate Pattern Architecture](/AAswordman/Operit/3.2-delegate-pattern-architecture)
- 消息持久化和聊天历史管理：参见 [Chat History Management](/AAswordman/Operit/3.4-chat-history-management)
- 聊天编排和摘要：参见 [ChatServiceCore](/AAswordman/Operit/3.7-chatservicecore)

---

## 消息生命周期概览

消息处理流程涉及从用户输入到最终持久化的多个阶段：

```
Parallel Collection

User Input
(TextFieldValue)

Input Validation
& Preparation

EnhancedAIService
sendMessage()

Response Stream
Creation

SharedStream
(replay=MAX_VALUE)

UI Stream Collection
(Real-time Display)

Database Collection
(Persistence)

Auto-Read Collection
(TTS Processing)

Stream Completion

Final Message
Persistence

Runtime State
Cleanup
```

---

## MessageProcessingDelegate 架构

### 核心职责

`MessageProcessingDelegate` 处理消息处理和流式传输的所有方面：
职责实现**用户输入管理**管理消息编写的 `TextFieldValue` 状态**消息发送**与 `AIMessageManager` 协调，向 AI 提供商发送消息**流管理**创建并管理 `SharedStream` 实例以实现实时响应**多聊天支持**为每个活动聊天维护独立的运行时状态**状态广播**暴露 `StateFlow` 和 `SharedFlow` 供 UI 消费**自动朗读集成**处理流式文本以输出 TTS**Waifu 模式**将完成的消息拆分为独立的句子气泡

### 关键状态流

```
Event Flows

scrollToBottomEvent
SharedFlow<Unit>

nonFatalErrorEvent
SharedFlow<String>

Per-Chat State

inputProcessingStateByChatId
StateFlow<Map<String, State>>

responseStream
(per ChatRuntime)

Global State

isLoading
StateFlow<Boolean>

activeStreamingChatIds
StateFlow<Set<String>>
```

---

## 流式响应系统

### 具有完整重放的 SharedStream

系统使用 `SharedStream<String>` 并设置 `replay = Int.MAX_VALUE`，以确保 UI 重组不会丢失历史内容：

```
Multiple Collectors

.share()

Flow<String>
from AIMessageManager

SharedStream<String>
replay=Int.MAX_VALUE

UI Collector
(Markdown Rendering)

DB Collector
(Content Building)

Auto-Read Collector
(TTS Processing)

Note: replay=Int.MAX_VALUE
ensures late subscribers
receive all history
```

来自 的关键实现细节：

```
val sharedCharStream = responseStream.share(
    scope = coroutineScope,
    replay = Int.MAX_VALUE,  // Critical: full history buffering
    onComplete = {
        deferred.complete(Unit)
        chatRuntime.responseStream = null
    }
)
```

**原理：**文本数据占用内存较少，因此完整缓冲可以防止重组期间的 UI 丢失，且不会产生显著开销。

### 流收集与持久化

数据库收集任务(`streamCollectionJob`)在数据块到达时持续更新消息：

```
UI State
Database
contentBuilder
streamCollectionJob
SharedStream
UI State
Database
contentBuilder
streamCollectionJob
SharedStream
loop
[For each chunk]
emit(chunk)
append(chunk)
updateMessage(content)
tryEmitScrollToBottom()
complete()
final updateMessage()
```

---

## 单聊天运行时管理

### ChatRuntime 数据结构

每个活跃的聊天通过 `ChatRuntime` 数据类维护自己的运行时状态：

```
private data class ChatRuntime(
    var responseStream: SharedStream<String>? = null,
    var streamCollectionJob: Job? = null,
    var stateCollectionJob: Job? = null,
    val isLoading: MutableStateFlow<Boolean> = MutableStateFlow(false)
)
```

### 多聊天架构

该委托支持多个聊天的并行处理：

```
Runtime States

Chat Runtime Map

aggregate

aggregate

aggregate

MessageProcessingDelegate

chatKey('chat1')

chatKey('chat2')

chatKey(null)

ChatRuntime
responseStream
streamCollectionJob
isLoading

ChatRuntime
responseStream
streamCollectionJob
isLoading

ChatRuntime
responseStream
streamCollectionJob
isLoading

Global State
sharedIsLoading
sharedActiveStreamingChatIds
```

`chatRuntimes` 并发映射允许每个聊天独立处理消息，从而实现多聊天浮动窗口和后台代理操作等功能。

---

## 状态管理

### InputProcessingState 类型

系统使用密封接口来表示不同的处理状态：
状态类型含义UI 影响`Idle`无活跃处理正常输入状态`Processing(message)`发送/接收消息显示消息进度`ExecutingTool(toolName)`工具执行中显示工具名称`Summarizing(message)`生成摘要显示摘要 UI`Completed`消息成功处理清除进度 UI`Error(message)`处理失败显示错误对话框

### 状态流架构

```
UI Layer

MessageProcessingDelegate

EnhancedAIService

collect

setChatInputProcessingState

collectAsState

service.inputProcessingState
StateFlow<InputProcessingState>

_inputProcessingStateByChatId
MutableStateFlow<Map<String, State>>

stateCollectionJob
(per chat)

Chat Screen

Processing Banner
```

每个聊天的状态收集任务将服务状态映射到单聊天状态：

---

## 特殊处理模式

### Waifu 模式(句子拆分)

当 `enableWaifuMode` 激活时，系统会将完整的 AI 响应拆分为每个句子单独的消息气泡：

```
Chat History
Delay Calculator
WaifuMessageProcessor
Message Stream
Chat History
Delay Calculator
WaifuMessageProcessor
Message Stream
loop
[For each sentence]
finalContent
splitMessageBySentences()
calculateSentenceDelay(charCount)
delay_ms
delay(delay_ms)
addMessage(sentenceMessage)
speakMessage() [if auto-read]
```

配置参数：

- **字符延迟**：句子间隔的每字符毫秒数(`waifuCharDelayFlow`)
- **移除标点**：从显示的句子中去除标点符号(`waifuRemovePunctuationFlow`)

### 自动朗读(流式 TTS)

自动朗读系统处理流式文本并在自然断点触发 TTS 输出：

```
filter XML tags

found

length >= 50

SharedStream<String>

XmlTextProcessor
processStreamToText()

autoReadBuffer
StringBuilder

findFirstEndCharIndex()
.,!?;: etc.

flushAutoReadSegment()
speakMessage()

Interrupts on first segment
then queues subsequent
```

系统执行：

1. 从流中去除 XML 标记标签
2. 缓冲字符直到遇到结束字符(`.`、`!`、`?` 等)或超过 50 个字符
3. 将片段刷新到 TTS，首个片段带中断

### 节流滚动到底部

为防止流式传输期间过度的 UI 重组，滚动事件会被节流：

```
private const val STREAM_SCROLL_THROTTLE_MS = 200L
 
private fun tryEmitScrollToBottomThrottled(chatId: String?) {
    val now = System.currentTimeMillis()
    val last = lastScrollEmitMsByChatKey.getOrPut(key) { AtomicLong(0L) }
    val prev = last.get()
    if (now - prev >= STREAM_SCROLL_THROTTLE_MS && last.compareAndSet(prev, now)) {
        _scrollToBottomEvent.tryEmit(Unit)
    }
}
```

这确保在活跃流式传输期间，滚动到底部操作每 200 毫秒仅触发一次。

---

## 与核心服务的集成

### MessageCoordinationDelegate 集成

`MessageCoordinationDelegate` 封装了 `MessageProcessingDelegate` 以添加更高层次的编排：

```
Processing Layer

Coordination Layer

User Action

MessageCoordinationDelegate

MessageProcessingDelegate

Check Token Limits
& Trigger Async Summary

Attachment Management

Workspace Hook Setup

Memory Query Decision

Build Message Content
(AIMessageManager)

Setup Shared Stream

Monitor Processing State

Collect & Persist
```

### ChatServiceCore 编排

`ChatServiceCore` 为主应用和悬浮窗提供统一接口：

```
Backend

ChatServiceCore

UI Consumers

Delegates

MainActivity
(ChatViewModel)

FloatingChatService

ChatServiceCore
Singleton per Scope

MessageProcessingDelegate

MessageCoordinationDelegate

ChatHistoryDelegate

TokenStatisticsDelegate

EnhancedAIService

Room Database
```

服务核心暴露所有必要的 `StateFlow` 和 `SharedFlow` 流供 UI 使用。

---

## 消息取消

### 取消流程

```
Coroutine Jobs
AIMessageManager
ChatRuntime
MessageProcessingDelegate
User
Coroutine Jobs
AIMessageManager
ChatRuntime
MessageProcessingDelegate
User
cancelMessage(chatId)
setChatInputProcessingState(Idle)
streamCollectionJob?.cancel()
stateCollectionJob?.cancel()
isLoading.value = false
responseStream = null
AIMessageManager.cancelOperation(chatId)
saveCurrentChat()
updateGlobalLoadingState()
```

`cancelMessage()` 函数执行全面清理：

1. 将处理状态设置为 `Idle`
2. 取消所有活跃的协程任务
3. 清空响应流
4. 通知 `AIMessageManager` 取消网络操作
5. 将当前状态保存到数据库

---

## 错误处理

### 非致命错误传播

非致命错误(例如工作区同步失败)通过 `SharedFlow` 发出，以避免阻塞消息处理：

```
private val _nonFatalErrorEvent = MutableSharedFlow<String>(extraBufferCapacity = 1)
val nonFatalErrorEvent = _nonFatalErrorEvent.asSharedFlow()
```

错误会显示在 UI 上，但不会中断消息流。

### 致命错误处理

致命错误会将处理状态设置为 `InputProcessingState.Error`，并通过错误回调显示：

---

## 性能优化

### 并发哈希映射保证线程安全

所有运行时状态使用 `ConcurrentHashMap` 以支持多线程访问：

```
private val chatRuntimes = ConcurrentHashMap<String, ChatRuntime>()
private val lastScrollEmitMsByChatKey = ConcurrentHashMap<String, AtomicLong>()
private val suppressIdleCompletedStateByChatId = ConcurrentHashMap<String, Boolean>()
```

### 原子操作保证全局状态一致性

全局状态聚合使用原子操作以防止竞态条件：

```
private val loadingByInstance = ConcurrentHashMap<String, Boolean>()
private val activeChatIdsByInstance = ConcurrentHashMap<String, Set<String>>()
 
private fun updateGlobalLoadingState() {
    val anyLoading = chatRuntimes.values.any { it.isLoading.value }
    loadingByInstance[instanceKey] = anyLoading
    sharedIsLoading.value = loadingByInstance.values.any { it }
}
```

这使得多个 `MessageProcessingDelegate` 实例(例如主应用 + 悬浮窗)能够安全协调。

---

## 使用示例

### 在 UI 中访问响应流

从悬浮窗口或自定义 UI 组件中：

```
val responseStream = messageProcessingDelegate.getResponseStream(chatId)
responseStream?.collect { char ->
    // Real-time character-by-character rendering
}
```

### 监控处理状态

```
val inputState by messageProcessingDelegate
    .inputProcessingStateByChatId
    .collectAsState()
 
when (val state = inputState[chatId]) {
    is InputProcessingState.Processing -> ShowProgressBanner(state.message)
    is InputProcessingState.ExecutingTool -> ShowToolExecution(state.toolName)
    is InputProcessingState.Error -> ShowErrorDialog(state.message)
    else -> {}
}
```

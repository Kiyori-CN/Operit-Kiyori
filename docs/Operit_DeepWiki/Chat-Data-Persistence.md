# 聊天数据持久化

本页面记录了 Operit 中聊天数据的持久化层，涵盖数据库架构、存储机制和数据访问模式。聊天持久化使用 Room Database 实现，配合响应式 StateFlow 流，提供高效的聊天会话及其消息的存储和检索。

有关 Room 数据库架构和迁移策略的信息，请参阅 [数据库架构](/AAswordman/Operit/8.1-database-architecture)。有关基于 StateFlow 的响应式模式的详细信息，请参阅 [状态管理模式](/AAswordman/Operit/8.5-state-management-patterns)。有关 UI 层级的聊天管理，请参阅 [聊天历史管理](/AAswordman/Operit/3.4-chat-history-management)。

## 数据库架构

聊天数据存储在 Room 数据库中，包含两个主要表：`chats` 和 `messages`，维护一对多关系。

### 聊天数据模型

**实体结构**

```
contains

ChatEntity

String

id

PK

UUID primary key

String

title

Chat display title

Long

createdAt

Creation timestamp (millis)

Long

updatedAt

Last update timestamp (millis)

Int

inputTokens

Cumulative input tokens

Int

outputTokens

Cumulative output tokens

Int

currentWindowSize

Current context window size

String

group

Optional group name

Long

displayOrder

Sort order (negative createdAt)

String

workspace

Workspace path

String

workspaceEnv

Workspace environment

String

parentChatId

Parent chat for branches

String

characterCardName

Bound character card

Boolean

locked

Prevents deletion

MessageEntity

Long

messageId

PK

Auto-increment ID

String

chatId

FK

References chats.id

String

sender

USER or AI

String

content

Message text content

Long

timestamp

Message timestamp

Int

orderIndex

Legacy order field

String

roleName

Optional role name

String

provider

AI provider used

String

modelName

AI model name
```

### 数据库迁移历史

数据库已演进至 11 个架构版本，迁移处理增量变更：
版本迁移变更1→2MIGRATION_1_2创建 `chats` 和 `messages` 表及基本结构2→3MIGRATION_2_3为聊天分组添加 `group` 列3→4MIGRATION_3_4添加 `displayOrder` 列用于自定义排序4→5MIGRATION_4_5添加 `workspace` 列用于工作区绑定5→6MIGRATION_5_6添加 `currentWindowSize` 用于令牌跟踪6→7MIGRATION_6_7为消息添加 `roleName` 列7→8MIGRATION_7_8添加 `parentChatId` 和 `characterCardName` 用于分支和角色绑定8→9MIGRATION_8_9为消息添加 `provider` 和 `modelName`9→10MIGRATION_9_10添加 `locked` 列以防止聊天删除10→11MIGRATION_10_11添加 `workspaceEnv` 列用于环境变量

## ChatHistoryManager 架构

`ChatHistoryManager` 是协调所有聊天持久化操作的中央单例，实现了带并发控制的仓储模式。

**系统架构图**

```
DataStore Persistence

Reactive State Layer

Room Database Layer

Singleton Manager

ChatHistoryManager
(Singleton Instance)

globalMutex: Mutex
(Cross-chat operations)

chatMutexes: ConcurrentHashMap
(Per-chat locks)

AppDatabase
(Room Database)

ChatDao
(Chat CRUD)

MessageDao
(Message CRUD)

chatHistoriesFlow: StateFlow>
(All chats metadata)

currentChatIdFlow: StateFlow
(Active chat ID)

characterCardStatsFlow: Flow
(Stats by character card)

currentChatIdDataStore
(DataStore)
```

### 初始化与单例模式

管理器使用双重检查锁定实现线程安全的单例实例化：

```
companion object {
    @Volatile
    private var INSTANCE: ChatHistoryManager? = null

    fun getInstance(context: Context): ChatHistoryManager {
        return INSTANCE ?: synchronized(this) {
            val instance = ChatHistoryManager(context.applicationContext)
            INSTANCE = instance
            instance
        }
    }
}
```

初始化时，数据库在后台协程中预加载，以确保首次使用时快速访问。

### 响应式数据流

管理器暴露三个主要的 StateFlow 流：

**chatHistoriesFlow**

- 类型：`StateFlow<List<ChatHistory>>`
- 来源：`chatDao.getAllChats()` 映射为轻量级 `ChatHistory` 对象
- 关键优化：列表视图中不加载消息(空列表)，提升侧边栏性能
- 数据库变更时自动更新

**currentChatIdFlow**

- 类型：`StateFlow<String?>`
- 来源：DataStore 偏好设置
- 跨应用重启跟踪当前活动的聊天

**characterCardStatsFlow**

- 类型：`Flow<List<CharacterCardChatStats>>`
- 来源：连接聊天和消息的 SQL 聚合查询
- 提供每个角色卡的聊天/消息计数

## 消息存储与排序

消息存储在 `messages` 表中，与 `chats` 表通过外键关联。一个关键的设计决策是使用时间戳进行排序，而非顺序索引。

**消息存储流程图**

```
"ChatDao"
"MessageDao"
"chatMutex(chatId)"
"ChatHistoryManager"
"UI Layer"
"ChatDao"
"MessageDao"
"chatMutex(chatId)"
"ChatHistoryManager"
"UI Layer"
alt
[position specified]
addMessage(chatId, message, position?)
withLock { ... }
getMessagesForChat(chatId)
existing messages
Calculate newTimestamp
(insert between timestamps)
message.copy(timestamp = newTimestamp)
insertMessage(messageEntity)
getChatById(chatId)
chat metadata
updateChatMetadata(chatId, ...)
Complete
Success
```

### 基于时间戳的排序

消息按其 `timestamp` 字段(Long)而非 `orderIndex` 排序。这种设计允许：

- 在任意位置插入消息而无需重新索引
- 自然的时间顺序排列
- 通过计算中间时间戳实现基于位置的插入

在特定位置插入时：

```
val newTimestamp = when {
    validPosition == 0 -> messages.first().timestamp - 1
    validPosition >= messages.size -> messages.last().timestamp + 1
    else -> {
        val before = messages[validPosition - 1].timestamp
        val after = messages[validPosition].timestamp
        before + (after - before) / 2
    }
}
```

### 消息 CRUD 操作

操作方法描述**创建**`addMessage(chatId, message, position?)`插入消息，可选择指定位置**读取**`loadChatMessages(chatId, order?, limit?)`加载消息，支持可选排序和限制**更新**`updateMessage(chatId, message)`根据时间戳更新消息内容**删除**`deleteMessage(chatId, timestamp)`删除单条消息**范围删除**`deleteMessagesFrom(chatId, timestamp)`删除时间戳之后的所有消息**清空全部**`clearChatMessages(chatId)`移除所有消息，保留会话

## 会话元数据管理

会话实体存储元数据，包括标题、时间戳、令牌统计和组织信息。

**会话生命周期图**

```
createNewChat()

setCurrentChatId()

Message operations

updateChatMetadata()

updateChatGroup()

group = null

updateChatCharacterCardName()

characterCardName = null

updateChatLocked(true)

updateChatLocked(false)

createBranch()

New branch chat created

deleteChatHistory()
(if not locked)

deleteChatHistory()
(prevented)

Creating

Active

Updating

Grouped

CharacterBound

Locked

Branched
```

### Token 统计追踪

每个聊天维护累计的 token 计数：

```
suspend fun updateChatTokenCounts(
    chatId: String,
    inputTokens: Int,
    outputTokens: Int,
    currentWindowSize: Int
)
```

这些值在以下操作期间更新：

- 添加消息(通过 `addMessage` → `updateChatMetadata`)
- 更新消息(通过 `updateMessage` → `updateChatMetadata`)
- 删除消息(通过 `deleteMessage` → `updateChatMetadata`)

`currentWindowSize` 字段追踪活动上下文窗口大小，用于自动摘要决策。

### 聊天锁定机制

聊天可以被锁定以防止意外删除：

```
suspend fun updateChatLocked(chatId: String, locked: Boolean)
```

当 `locked = true` 时，聊天无法被删除：

```
suspend fun deleteChatHistory(chatId: String): Boolean {
    chatMutex(chatId).withLock {
        val chat = chatDao.getChatById(chatId)
        if (chat?.locked == true) {
            AppLogger.w(TAG, "Chat $chatId is locked; skip deletion")
            return false
        }
        // ... proceed with deletion
    }
}
```

锁定的聊天即使在删除分组或执行批量操作时也会被保留。

## 并发控制

管理器采用双层互斥锁策略来防止数据竞争，同时允许对不同聊天进行并发操作。

**并发控制架构**

```
Per-Chat Lock Operations

Global Lock Operations

Mutex Hierarchy

globalMutex: Mutex
(For cross-chat operations)

chatMutexes: ConcurrentHashMap
(Per-chat granular locks)

updateChatOrderAndGroup
(Batch reordering)

updateGroupName
(Rename across chats)

deleteGroup
(Multi-chat deletion)

createBranch
(Read parent + create)

saveChatHistory
(Write messages)

addMessage
(Insert single message)

updateMessage
(Update content)

deleteMessage
(Remove message)

deleteChatHistory
(Remove chat)
```

### 互斥锁使用模式

**单聊天互斥锁**

```
private fun chatMutex(chatId: String): Mutex {
    return chatMutexes.getOrPut(chatId) { Mutex() }
}
 
suspend fun addMessage(chatId: String, message: ChatMessage, position: Int? = null) {
    chatMutex(chatId).withLock {
        // Message operations
    }
}
```

允许对不同聊天进行并发操作，同时对同一聊天的操作进行串行化。

**全局互斥锁**

```
suspend fun updateChatOrderAndGroup(updatedHistories: List<ChatHistory>) {
    globalMutex.withLock {
        // Batch update affecting multiple chats
    }
}
```

用于跨多个聊天的操作，例如分组重命名或批量重新排序。

## 查询操作

`ChatHistoryManager` 提供了多种查询方法，用于检索具有不同过滤器和排序的聊天数据。

### 基础查询

方法返回类型描述`getTotalChatCount()``Int`聊天总数`getTotalMessageCount()``Int`所有聊天的消息总数`getMessageCountsByChatId()``Map<String, Int>`每个聊天的消息数量`getChatTitle(chatId)``String?`根据 ID 获取聊天标题`loadChatMessages(chatId)``List<ChatMessage>`加载聊天的所有消息

### 高级消息加载

消息可以通过排序和限制进行加载：

```
suspend fun loadChatMessages(
    chatId: String,
    order: String? = null,    // "asc" or "desc"
    limit: Int? = null        // Max messages to return
): List<ChatMessage>
```

这使得能够：

- 仅加载最近的消息：`loadChatMessages(chatId, "desc", limit = 50)`
- 按时间倒序排列：`loadChatMessages(chatId, "desc")`
- 为大型聊天提供高效分页

### 内容搜索

跨消息内容的全文搜索：

```
suspend fun searchChatIdsByContent(query: String): Set<String>
```

使用 SQL `LIKE` 并对特殊字符进行适当转义。返回包含查询字符串的聊天 ID 集合，从而实现：

- 基于内容的聊天过滤
- UI 中的搜索功能
- 跨对话的消息发现

## 分组和组织

聊天支持组织功能，包括分组、角色卡绑定和显示排序。

**聊天组织结构**

```
Display Ordering

Organizational Hierarchy

0..* chats

0..* chats

Special Relationships

spawns

Parent Chat
(parentChatId)

Branch Chat
(has parentChatId)

Character Card
(characterCardName)

Group
(group field)

Chat
(ChatEntity)

displayOrder: Long
(Sort key)
```

### 分组操作

分组是存储在 `group` 字段中的简单字符串标识符：

**批量分组操作**

```
// Rename all chats in a group
suspend fun updateGroupName(
    oldName: String,
    newName: String,
    characterCardName: String?  // If set, only update within character
)
 
// Delete group and optionally its chats
suspend fun deleteGroup(
    groupName: String,
    deleteChats: Boolean,       // If true, delete chats; if false, ungroup
    characterCardName: String?  // If set, only within character
)
```

当 `deleteChats = true` 时，锁定的聊天会被保留但从分组中移除。

### 角色卡绑定

聊天可以通过 `characterCardName` 字段绑定到角色卡：

```
suspend fun updateChatCharacterCardName(
    chatId: String,
    characterCardName: String?  // null = unbind
)
```

角色过滤查询：

```
fun getChatHistoriesByCharacterCard(
    characterCardName: String,
    isDefault: Boolean
): Flow<List<ChatHistory>>
```

对于默认角色卡，返回绑定的聊天和未绑定的聊天(其中 `characterCardName IS NULL`)。

### 显示顺序管理

聊天按 `displayOrder`(Long)排序，较小的值排在前面：

```
suspend fun updateChatOrderAndGroup(updatedHistories: List<ChatHistory>) {
    globalMutex.withLock {
        val timestamp = System.currentTimeMillis()
        val entitiesToUpdate = updatedHistories.map { history ->
            originalEntity?.copy(
                displayOrder = history.displayOrder,
                group = history.group,
                updatedAt = timestamp
            )
        }
        chatDao.updateChats(entitiesToUpdate)
    }
}
```

默认顺序为 `-createdAt`(负时间戳)，将较新的聊天放在前面。UI 可以通过拖放来自定义顺序。

## 分支聊天创建

聊天支持分支：通过在特定点从现有对话分叉来创建新聊天。

**分支创建流程**

```
"MessageDao"
"ChatDao"
"globalMutex"
"ChatHistoryManager"
"UI Layer"
"MessageDao"
"ChatDao"
"globalMutex"
"ChatHistoryManager"
"UI Layer"
alt
[timestamp specified]
createBranch(parentChatId, upToMessageTimestamp?)
withLock { ... }
getChatById(parentChatId)
parentChat
getMessagesForChat(parentChatId)
parentMessages
Filter messages <= timestamp
Create branchHistory
(copy title, tokens, group, workspace)
insertChat(branchEntity)
insertMessages(messageEntities)
setCurrentChatId(branchId)
Return branchHistory
Branch chat created
```

### 分支元数据

分支聊天：

- 继承：`title`、`inputTokens`、`outputTokens`、`currentWindowSize`、`group`、`workspace`、`characterCardName`
- 设置：`parentChatId` = 父级的 ID
- 获取：新的唯一 `id`

分支可以被查询：

```
suspend fun getBranches(parentChatId: String): List<ChatHistory>
fun getBranchesByParentIdFlow(parentChatId: String): Flow<List<ChatEntity>>
```

## 数据转换

持久化层使用独立的模型分别用于数据库存储和 UI 消费。

**模型转换层**

```
Transformation Functions

Domain Layer

Database Layer

Convert to UI

Convert to UI

Convert to DB

Convert to DB

ChatEntity
(Room @Entity)

MessageEntity
(Room @Entity)

ChatHistory
(UI Model)

ChatMessage
(UI Model)

ChatEntity.toChatHistory(messages)
+ toChatHistory() helper

MessageEntity.toChatMessage()

ChatEntity.fromChatHistory(history)

MessageEntity.fromChatMessage(chatId, message, index)
```

### 关键转换

**ChatEntity → ChatHistory**

- 将 `Long` 时间戳转换为 `LocalDateTime`
- 可选择性加载消息(或为性能考虑提供空列表)
- 直接映射所有元数据字段

**MessageEntity → ChatMessage**

- 将数据库类型转换为领域类型
- 提取提供商和模型信息
- 保留时间戳用于排序

### 性能优化

一个关键优化：`chatHistoriesFlow` 提供的 `ChatHistory` 对象带有**空消息列表**：

```
private val _chatHistoriesFlow: Flow<List<ChatHistory>> =
    chatDao.getAllChats().map { chatEntities ->
        withContext(Dispatchers.IO) {
            chatEntities.map { it.toChatHistory() }  // No messages loaded
        }
    }
```

这极大地提升了侧边栏性能，因为预先加载数千条消息是不必要的。消息通过 `loadChatMessages()` 按需加载。

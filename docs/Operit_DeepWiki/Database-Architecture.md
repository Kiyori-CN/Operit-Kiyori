# 数据库架构

## 目的与范围

本文档描述了 Operit AI 用于持久化聊天对话、消息及相关元数据的数据库架构。系统使用 Android 的 Room 持久化库在 SQLite 之上提供结构化、类型安全的抽象。本页涵盖数据库模式、实体、数据访问对象(DAO)以及通过 `ChatHistoryManager` 实现的仓储模式。

有关配置和偏好设置存储(使用 DataStore)的信息，请参阅 [Preferences System](/AAswordman/Operit/9.2-creating-custom-tools)。有关服务层如何管理聊天数据的详细信息，请参阅 [Chat Data Persistence](/AAswordman/Operit/9.3-creating-tool-packages)。

---

## 数据库技术栈

Operit 使用 **Room** 作为其主要的结构化数据持久化解决方案。Room 提供 SQL 查询的编译时验证，并在保持完整 SQLite 功能的同时减少样板代码。

**依赖项：**

```
implementation(libs.room.runtime)
implementation(libs.room.ktx)
kapt(libs.room.compiler)
```

**核心组件：**

- **Room Database**：`AppDatabase` - 单例数据库实例
- **类型安全 DAO**：`ChatDao`、`MessageDao` - 数据访问接口
- **仓储层**：`ChatHistoryManager` - UI/服务层的高级抽象

---

## 数据库模式

### 实体关系图

```
contains

ChatEntity

string

id

PK

UUID primary key

string

title

Chat title

long

createdAt

Creation timestamp (ms)

long

updatedAt

Last update timestamp (ms)

int

inputTokens

Cumulative input tokens

int

outputTokens

Cumulative output tokens

int

currentWindowSize

Current context window

string

group

Optional group/folder name

int

displayOrder

Sort order within group

string

workspace

Optional workspace path

string

parentChatId

Optional parent chat for branches

string

characterCardName

Bound character card

MessageEntity

long

messageId

PK

Auto-increment ID

string

chatId

FK

Foreign key to ChatEntity

string

sender

user, ai, or system

string

content

Message content

long

timestamp

Message timestamp (ms)

int

orderIndex

Legacy ordering field

string

roleName

Optional role/character name
```

**关键关系：**

- 一对多：`ChatEntity` → `MessageEntity`(一个聊天包含多条消息)
- 级联删除：删除聊天会移除所有关联消息
- 排序：消息按 `timestamp` 字段排序(升序)

**模式设计原则：**

- **时间戳排序**：消息使用 `timestamp` 字段进行确定性排序，而非 `orderIndex`
- **非规范化元数据**：令牌计数和窗口大小存储在 `ChatEntity` 中以便快速访问
- **可选分组**：`group` 字段支持类似文件夹的组织方式
- **角色卡绑定**：`characterCardName` 将聊天关联到角色配置
- **分支支持**：`parentChatId` 支持对话分支/派生

---

## 实体类

### ChatEntity

表示单个聊天会话及其元数据和统计信息。

**关键字段：**

- `id: String` - 唯一标识符(UUID)
- `title: String` - 显示名称(默认："New Chat HH:MM:SS")
- `createdAt/updatedAt: Long` - Unix 时间戳（毫秒）
- `inputTokens/outputTokens: Int` - 累计令牌使用量
- `currentWindowSize: Int` - 最后已知的上下文窗口大小
- `group: String?` - 可选的文件夹/类别
- `displayOrder: Int` - 组内自定义排序顺序
- `workspace: String?` - 开发聊天关联的工作区路径
- `parentChatId: String?` - 对话分支的父聊天 ID
- `characterCardName: String?` - 关联的角色人设

**转换：**

```
fun ChatEntity.toChatHistory(): ChatHistory {
    val createdAt = Instant.ofEpochMilli(this.createdAt)
        .atZone(ZoneId.systemDefault()).toLocalDateTime()
    // ... converts to UI-layer ChatHistory object
}
```

### MessageEntity

表示聊天会话中的单条消息。

**关键字段：**

- `messageId: Long` - 自增主键
- `chatId: String` - 指向 `ChatEntity` 的外键
- `sender: String` - "user"、"ai" 或 "system"
- `content: String` - 完整消息内容(可能包含 XML 标记)
- `timestamp: Long` - 用于排序的 Unix 时间戳(毫秒)
- `orderIndex: Int` - 遗留字段(不再用于排序)
- `roleName: String?` - 可选的角色/人物名称

**排序策略：**
消息按 `timestamp ASC` 排序，而非 `orderIndex`。在特定位置插入消息时，系统会计算相邻消息之间的适当时间戳。

---

## 数据访问对象(DAOs)

### MessageDao

消息 CRUD 操作的主要接口。

**核心查询：**
操作方法描述获取所有消息`getMessagesForChat(chatId)`返回按时间戳升序排列的消息插入消息`insertMessage(message)`插入/替换单条消息批量插入`insertMessages(messages)`使用替换策略批量插入更新内容`updateMessageContent(messageId, content)`修改消息文本按时间戳删除`deleteMessageByTimestamp(chatId, timestamp)`删除特定消息删除范围`deleteMessagesFrom(chatId, timestamp)`删除所有 >= 时间戳的消息搜索`searchChatIdsByContent(query)`查找包含查询文本的聊天
**查询示例：**

```
@Query("SELECT * FROM messages WHERE chatId = :chatId ORDER BY timestamp ASC")
suspend fun getMessagesForChat(chatId: String): List<MessageEntity>
```

### ChatDao

用于聊天元数据和组织操作的 DAO(在提供的文件中未完整显示，但被广泛引用)。

**关键操作：**

- `getAllChats()` - 返回 Flow<List> 以实现响应式更新
- `getChatById(id)` - 获取单个聊天
- `insertChat(chat)` - 创建或更新聊天
- `updateChatMetadata(...)` - 更新标题、时间戳、令牌计数
- `updateChatTitle(id, title)` - 重命名聊天
- `updateChatCharacterCardName(id, name)` - 更改绑定角色
- `deleteChat(id)` - 删除聊天(级联删除消息)
- 分组操作：`updateGroupName()`、`deleteChatsInGroup()` 等
- 角色卡查询：`getChatsByCharacterCard()`、`getCharacterCardChatStats()`

---

## 仓储模式：ChatHistoryManager

### 架构概览

```
Database

Data Access Layer

Repository Layer

UI/Service Layer

Exposes

Exposes

Exposes

ChatViewModel

FloatingChatService

ChatHistoryManager
(Singleton)

ChatDao
(Room DAO)

MessageDao
(Room DAO)

AppDatabase
(SQLite)

chatHistoriesFlow

currentChatIdFlow

characterCardStatsFlow
```

**单例模式：**

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

### 响应式数据流

**聊天历史流：**

```
private val _chatHistoriesFlow: Flow<List<ChatHistory>> =
    chatDao.getAllChats().map { chatEntities ->
        withContext(Dispatchers.IO) {
            chatEntities.map { it.toChatHistory() }
        }
    }
 
val chatHistoriesFlow = _chatHistoriesFlow.stateIn(
    CoroutineScope(Dispatchers.IO + SupervisorJob()),
    SharingStarted.Lazily,
    emptyList()
)
```

管理器暴露响应式 `StateFlow` 实例，当数据库发生变化时自动发出更新。这使得 UI 组件能够观察聊天列表而无需手动刷新逻辑。

**暴露的流：**

- `chatHistoriesFlow: StateFlow<List<ChatHistory>>` - 所有聊天会话
- `currentChatIdFlow: StateFlow<String?>` - 活动聊天 ID(存储在 DataStore 中)
- `characterCardStatsFlow: Flow<List<CharacterCardChatStats>>` - 按角色聚合统计

---

## 数据流与转换

### 写入路径：UI → 数据库

```
addMessage()

mutex.withLock

Room LiveData

ChatViewModel

ChatHistoryManager

Mutex Lock

Transform ChatMessage
to MessageEntity

messageDao.insertMessage()

Update chat metadata

SQLite Database

chatHistoriesFlow
```

**示例：添加消息**

```
suspend fun addMessage(chatId: String, message: ChatMessage, position: Int? = null) {
    mutex.withLock {
        val messageEntity = MessageEntity.fromChatMessage(
            chatId = chatId,
            message = message,
            orderIndex = 0
        )
        messageDao.insertMessage(messageEntity)

        // Update chat metadata (timestamp, token counts)
        chatDao.updateChatMetadata(...)
    }
}
```

**关键特性：**

- **互斥锁同步**：所有写操作由 `Mutex` 保护以防止竞态条件
- **原子更新**：消息插入 + 元数据更新在单个事务中完成
- **自动流**：Room 在数据库变化时自动通知观察者

### 读取路径：数据库 → UI

```
SELECT * FROM chats

Flow emission

SQLite Database

ChatDao

map { entities ->
entities.map {
it.toChatHistory() }
}

StateFlow
chatHistoriesFlow

ChatViewModel

AIChatScreen
```

**延迟消息加载：**
`toChatHistory()` 转换有意**不加载消息**以用于聊天列表：

```
fun ChatEntity.toChatHistory(): ChatHistory {
    return ChatHistory(
        id = this.id,
        title = this.title,
        messages = emptyList(), // Messages not loaded for sidebar performance
        // ... other fields
    )
}
```

仅在打开特定聊天时才加载消息，减少内存开销并提高侧边栏响应速度。

---

## 关键操作

### 聊天管理

**创建新聊天：**

```
suspend fun createNewChat(
    group: String? = null,
    inheritGroupFromChatId: String? = null,
    characterCardName: String? = null
): ChatHistory
```

创建新聊天，可选分组分配和角色卡绑定。默认标题格式："New Chat HH:MM:SS"。

**更新令牌统计：**

```
suspend fun updateChatTokenCounts(
    chatId: String,
    inputTokens: Int,
    outputTokens: Int,
    currentWindowSize: Int
)
```

更新累计令牌使用量和上下文窗口大小，用于成本跟踪和上下文管理。

**删除聊天：**

```
suspend fun deleteChatHistory(chatId: String)
```

移除聊天实体及所有关联消息(级联删除)。如果删除活动聊天则清除 `currentChatId`。

### 消息操作

**在指定位置添加消息：**
系统支持通过计算适当的时间戳在任意位置插入消息：

```
if (position != null) {
    val messages = messageDao.getMessagesForChat(chatId)
    val validPosition = position.coerceIn(0, messages.size)
    val newTimestamp = when {
        validPosition == 0 -> messages.first().timestamp - 1
        validPosition >= messages.size -> messages.last().timestamp + 1
        else -> {
            val before = messages[validPosition - 1].timestamp
            val after = messages[validPosition].timestamp
            before + (after - before) / 2
        }
    }
    message.copy(timestamp = newTimestamp)
}
```

**删除消息范围：**

```
suspend fun deleteMessagesFrom(chatId: String, timestamp: Long)
```

移除所有 `timestamp >= 指定时间戳` 的消息。用于回滚功能。

### 分组与组织

**批量更新顺序：**

```
suspend fun updateChatOrderAndGroup(updatedHistories: List<ChatHistory>)
```

原子性地更新多个聊天的 `displayOrder` 和 `group` 字段，支持拖放重新排序和文件夹分配。

**重命名分组：**

```
suspend fun updateGroupName(
    oldName: String,
    newName: String,
    characterCardName: String?
)
```

为该分组中的所有聊天重命名文件夹，可选择限定到特定角色卡片。

**删除分组：**

```
suspend fun deleteGroup(
    groupName: String,
    deleteChats: Boolean,
    characterCardName: String?
)
```

删除分组中的所有聊天或取消分组，可选择按角色卡片过滤。

---

## 性能考虑

### 优化措施

**1. 延迟加载消息**

- 聊天列表(侧边栏)不加载完整消息内容
- 仅在打开聊天时获取消息
- 减少内存使用并改善侧边栏滚动性能

**2. StateFlow 缓存**

```
val chatHistoriesFlow = _chatHistoriesFlow.stateIn(
    CoroutineScope(Dispatchers.IO + SupervisorJob()),
    SharingStarted.Lazily,
    emptyList()
)
```

- 共享 StateFlow 防止重复数据库查询
- 多个收集器接收相同数据流
- 延迟启动(首次收集前不激活)

**3. 数据库初始化预加载**

```
init {
    CoroutineScope(Dispatchers.IO).launch {
        val chats = chatDao.getAllChats().first()
        AppLogger.d(TAG, "Database preloaded, chat count: ${chats.size}")
    }
}
```

在管理器初始化时预热数据库连接，避免首次查询延迟。

**4. 批量操作**

- `insertMessages(List<MessageEntity>)` 用于批量插入
- `updateChats(List<ChatEntity>)` 用于批量元数据更新
- 减少事务开销

**5. 索引策略**

- 主键：`ChatEntity.id`、`MessageEntity.messageId`
- 外键索引：`MessageEntity.chatId`(隐式)
- 时间戳索引：`MessageEntity.timestamp` 用于快速排序

### 并发控制

**Mutex 保护的操作：**
所有写操作使用单个 `Mutex` 来防止竞态条件：

```
private val mutex = Mutex()
 
suspend fun saveChatHistory(history: ChatHistory) {
    mutex.withLock {
        // Database operations
    }
}
```

**优势：**

- 防止并发写入破坏数据
- 确保原子性复合操作(插入消息 + 更新元数据)
- 针对复杂逻辑的数据库事务的简单替代方案

**权衡：**

- 序列化所有写操作(对于聊天应用场景可接受)
- 在转换逻辑期间持有 Mutex(可以优化)

---

## Character Card 集成

### Character 范围的查询

数据库支持按关联的 character card 过滤聊天：

**默认 Character Card 逻辑：**

```
fun getChatHistoriesByCharacterCard(
    characterCardName: String,
    isDefault: Boolean
): Flow<List<ChatHistory>> {
    val sourceFlow = if (isDefault) {
        // Default card: include null characterCardName chats
        chatDao.getChatsByCharacterCardOrNull(characterCardName)
    } else {
        // Non-default: exact match only
        chatDao.getChatsByCharacterCard(characterCardName)
    }
    // ...
}
```

**Character 统计：**

```
val characterCardStatsFlow: Flow<List<CharacterCardChatStats>> =
    chatDao.getCharacterCardChatStats()
```

提供每个 character card 的聚合统计信息(聊天数量、总 token 数等)。

**更新 Character 绑定：**

```
suspend fun updateChatCharacterCardName(chatId: String, characterCardName: String?)
```

更改绑定到聊天的 character card，影响系统提示和行为。

---

## 导入/导出架构

数据库支持通过 JSON 导出/导入实现完整的聊天历史备份和恢复。

**导出流程：**

1. 从数据库获取所有聊天和消息
2. 转换为可移植的 JSON 格式
3. 压缩为包含元数据的 ZIP 归档文件
4. 存储在 `Downloads/Operit/` 目录中

**导入流程：**

1. 读取并验证 ZIP 归档文件
2. 解析 JSON 并进行版本兼容性检查
3. 转换为数据库实体
4. 批量插入并处理冲突

**文件格式：**

```
{
  "version": "1.0",
  "exportDate": "2024-01-15T10:30:00Z",
  "chats": [
    {
      "id": "uuid-...",
      "title": "Chat Title",
      "messages": [...],
      "metadata": {...}
    }
  ]
}
```

---

## 数据库初始化

### AppDatabase 单例

```
private val database = AppDatabase.getDatabase(context)
private val chatDao = database.chatDao()
private val messageDao = database.messageDao()
```

`AppDatabase` 类(未在提供的文件中显示)遵循 Room 的标准单例模式：

- 每个应用生命周期创建一次
- 提供 DAO 实例
- 管理迁移和架构版本
- 配置 SQLite 连接参数

**迁移策略：**
Room 要求为架构更改提供显式迁移定义。Operit 可能使用：

- 在调试构建中回退到破坏性迁移
- 在生产环境中使用显式迁移路径
- 导出架构以进行版本跟踪

---

## 总结

Operit AI 中的数据库架构基于以下核心原则构建：
组件技术用途**持久化**Room + SQLite类型安全的响应式数据访问**实体**`ChatEntity`、`MessageEntity`结构化的聊天和消息存储**DAOs**`ChatDao`、`MessageDao`数据库操作接口**仓库**`ChatHistoryManager`高层业务逻辑和同步**响应式**Flow/StateFlow数据变化时自动更新UI**并发**Mutex 锁线程安全的写操作**组织**分组、角色卡片灵活的聊天分类
系统通过懒加载、批量操作和响应式流来优先保证性能，同时通过互斥锁保护的事务和 Room 的编译时查询验证来维护数据完整性。

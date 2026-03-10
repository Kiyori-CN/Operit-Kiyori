# 聊天历史管理

## 目的与范围

本文档涵盖 Operit 中聊天对话的持久化和管理。它描述了聊天历史记录及其消息如何存储在 Room 数据库中，如何通过 `ChatHistoryManager` 仓库访问，以及如何通过 `ChatHistorySelector` 组件在 UI 中显示。

有关活动对话期间消息处理的信息，请参阅 [Message Processing](/AAswordman/Operit/3.3-message-processing)。有关整体聊天 UI 架构，请参阅 [Chat UI Architecture](/AAswordman/Operit/3.1-chat-ui-architecture)。有关角色卡系统集成，请参阅 [Character Cards and Personas](/AAswordman/Operit/3.5-character-cards-and-personas)。

---

## 架构概览

聊天历史管理系统遵循仓库模式，使用 Room 数据库持久化。聊天元数据和消息分别存储以实现高效查询,响应式 `Flow` 流为 UI 提供实时更新。

**图示：聊天历史管理架构**

```
Reactive Streams

Data Models

Database Layer

Repository Layer

UI Layer

ChatHistorySelector
Chat List UI

ChatViewModel
State Management

ChatScreenHeader
Token Statistics

ChatHistoryManager
Singleton Repository

currentChatIdDataStore
DataStore Preferences

AppDatabase
Room Database

ChatDao
Chat Access

MessageDao
Message Access

ChatHistory
Domain Model

ChatEntity
Database Entity

MessageEntity
Database Entity

chatHistoriesFlow
StateFlow<List<ChatHistory>>

currentChatIdFlow
StateFlow<String?>

characterCardStatsFlow
Flow<List<Stats>>
```

---

## 数据库架构

聊天历史系统使用双表架构，通过 Room 进行关系数据管理。`chats` 表存储元数据，而 `messages` 表保存单个消息内容。

**图示：数据库架构**

```
contains

chats

TEXT

id

PK

TEXT

title

INTEGER

createdAt

INTEGER

updatedAt

INTEGER

inputTokens

INTEGER

outputTokens

INTEGER

currentWindowSize

TEXT

group

INTEGER

displayOrder

TEXT

workspace

TEXT

workspaceEnv

TEXT

parentChatId

FK

TEXT

characterCardName

BOOLEAN

locked

messages

INTEGER

messageId

PK

TEXT

chatId

FK

TEXT

sender

TEXT

content

INTEGER

timestamp

INTEGER

orderIndex

TEXT

roleName

TEXT

provider

TEXT

modelName
```

### ChatEntity

`ChatEntity` 类表示聊天元数据的数据库表结构。关键字段包括：
字段类型用途`id`String主键(UUID)`title`String用户可见的聊天标题`createdAt`Long创建时间戳(毫秒)`updatedAt`Long最后修改时间戳`inputTokens`Int累计输入令牌数`outputTokens`Int累计输出令牌数`currentWindowSize`Int当前上下文窗口使用量`group`String?可选的分组名称用于组织`displayOrder`Long排序顺序(默认：-createdAt)`workspace`String?绑定的工作区路径`workspaceEnv`String?工作区环境(例如 "ssh"、"termux")`parentChatId`String?用于分支的父聊天`characterCardName`String?绑定的角色卡`locked`Boolean防止删除

### MessageEntity

`MessageEntity` 类存储单条消息及其元数据，用于跟踪使用的 AI 提供商和模型：
字段类型用途`messageId`Long自动生成的主键`chatId`String外键指向 `chats` 表`sender`String消息发送者("user" 或 "ai")`content`String消息文本内容`timestamp`Long消息时间戳(毫秒)`orderIndex`Int消息顺序(已弃用，使用 timestamp)`roleName`String自定义角色名称`provider`StringAI 提供商(例如 "openai")`modelName`String模型标识符(例如 "gpt-4")
消息按 `timestamp` 升序排列以维持对话流程。`orderIndex` 字段已弃用但保留以保持兼容性。

### 数据库迁移

架构通过 11 次迁移逐步演进，逐步添加功能：

- **v2**：初始聊天/消息表
- **v3**: 添加了 `group` 字段用于组织
- **v4**: 添加了 `displayOrder` 用于自定义排序
- **v5**: 添加了 `workspace` 用于文件绑定
- **v6**: 添加了 `currentWindowSize` 用于令牌跟踪
- **v7**: 添加了 `roleName` 用于自定义消息角色
- **v8**: 添加了 `parentChatId` 和 `characterCardName` 用于分支和角色绑定
- **v9**: 添加了 `provider` 和 `modelName` 用于消息跟踪
- **v10**: 添加了 `locked` 字段用于删除保护
- **v11**: 添加了 `workspaceEnv` 用于环境类型

---

## ChatHistoryManager 仓库

`ChatHistoryManager` 是一个单例仓库，为聊天持久化操作提供简洁的 API。它通过 DAO 管理数据库访问，并暴露响应式 `Flow` 流供 UI 观察。

### 初始化和单例模式

```
// Singleton access
val manager = ChatHistoryManager.getInstance(context)
```

管理器会提前初始化 Room 数据库以避免首次访问延迟：

### 响应式数据流

管理器暴露了三个主要的响应式流：

**1. 聊天历史流**

```
val chatHistoriesFlow: StateFlow<List<ChatHistory>>
```

该流提供完整的聊天列表，但不加载完整的消息内容。实现使用了映射转换：

`toChatHistory()` 转换出于性能考虑明确省略了消息加载：

**2. 当前 Chat ID 流程**

```
val currentChatIdFlow: StateFlow<String?>
```

这会跟踪活动的聊天 ID，持久化存储在 DataStore 偏好设置中：

**3. 角色卡片统计流程**

```
val characterCardStatsFlow: Flow<List<CharacterCardChatStats>>
```

使用 SQL 聚合提供每个角色卡片的汇总统计：

### 并发控制

管理器使用双层互斥锁策略来防止竞态条件：

- **全局互斥锁**：保护跨聊天操作(例如批量更新)
- **单聊天互斥锁**：保护单个聊天操作

---

## 聊天 CRUD 操作

### 创建新聊天

`createNewChat()` 方法创建一个聊天，支持可选的分组和角色卡绑定：

```
suspend fun createNewChat(
    group: String? = null,
    inheritGroupFromChatId: String? = null,
    characterCardName: String? = null,
    setAsCurrentChat: Boolean = true
): ChatHistory
```

该方法生成带时间戳的本地化标题，并通过继承逻辑确定最终分组：

### 加载聊天

**加载聊天列表**

聊天列表通过响应式的 `chatHistoriesFlow` 访问。对于同步访问：

```
val chats = chatHistoriesFlow.first()
```

**加载消息**

消息按需加载以避免内存开销：

```
suspend fun loadChatMessages(chatId: String): List<ChatMessage>
```

该方法直接查询数据库并将实体转换为领域模型：

重载版本支持排序和限制：

```
suspend fun loadChatMessages(
    chatId: String,
    order: String? = null,  // "asc" or "desc"
    limit: Int? = null
): List<ChatMessage>
```

### 更新聊天

**更新标题**

```
suspend fun updateChatTitle(chatId: String, title: String)
```

**更新角色卡绑定**

```
suspend fun updateChatCharacterCardName(chatId: String, characterCardName: String?)
```

**更新 Token 计数**

```
suspend fun updateChatTokenCounts(
    chatId: String,
    inputTokens: Int,
    outputTokens: Int,
    currentWindowSize: Int
)
```

**更新工作区绑定**

```
suspend fun updateChatWorkspace(chatId: String, workspace: String?, workspaceEnv: String?)
```

**更新锁定状态**

```
suspend fun updateChatLocked(chatId: String, locked: Boolean)
```

已锁定的聊天无法被删除：

### 删除聊天

```
suspend fun deleteChatHistory(chatId: String): Boolean
```

该方法在删除前检查锁定状态，如果聊天被锁定则返回 `false`：

如果删除的聊天是当前聊天，则清除当前聊天 ID 偏好设置：

---

## 消息操作

### 添加消息

**基本添加**

```
suspend fun addMessage(chatId: String, message: ChatMessage, position: Int? = null)
```

该方法支持通过计算中间时间戳在特定位置插入消息：

如果指定了位置，时间戳会被调整以保持顺序：

### 更新消息

```
suspend fun updateMessage(chatId: String, message: ChatMessage)
```

该方法通过时间戳查找现有消息并更新其内容。如果消息不存在，则插入新消息：

聊天元数据仅在消息从空内容转换为非空内容时更新(即流式传输完成)：

### 删除消息

**删除单条消息**

```
suspend fun deleteMessage(chatId: String, timestamp: Long)
```

**从时间戳删除消息**

```
suspend fun deleteMessagesFrom(chatId: String, timestamp: Long)
```

删除所有 `timestamp >= timestamp` 参数的消息：

**清空所有消息**

```
suspend fun clearChatMessages(chatId: String)
```

清空所有消息但保留聊天实体，将令牌计数重置为零：

---

## 组织功能

### 分组

聊天可以组织到命名分组中以便更好地管理。

**更新分组成员**

```
suspend fun updateChatGroup(chatId: String, group: String?)
```

**重命名分组**

```
suspend fun updateGroupName(oldName: String, newName: String, characterCardName: String?)
```

如果提供了 `characterCardName`，则仅重命名该角色卡下的分组。否则，重命名所有具有旧名称的分组：

**删除分组**

```
suspend fun deleteGroup(groupName: String, deleteChats: Boolean, characterCardName: String?)
```

如果 `deleteChats` 为 true，则删除分组中的所有聊天(除非已锁定)。否则，聊天将被移动到未分组类别：

已锁定的聊天永远不会被删除；仅清除其分组归属：

### 显示排序

聊天维护一个 `displayOrder` 字段用于自定义排序。默认顺序为 `-createdAt`(最新的在前)。

**批量重新排序**

```
suspend fun updateChatOrderAndGroup(updatedHistories: List<ChatHistory>)
```

此方法执行排序和分组的批量更新：

当聊天被拖动到新位置或新分组时，UI 会使用此方法。

### 角色卡绑定

聊天可以绑定到特定的角色卡，从而实现过滤视图和自动角色切换。

**按角色卡过滤**

```
fun getChatHistoriesByCharacterCard(
    characterCardName: String,
    isDefault: Boolean
): Flow<List<ChatHistory>>
```

对于默认角色卡，查询包括已绑定的聊天和未绑定的聊天。对于非默认卡，仅显示已绑定的聊天：

**批量操作**

DAO 提供了几个用于角色卡管理的批量操作：

- `clearCharacterCardBinding()`：解除所有聊天与角色卡的绑定
- `deleteUnlockedChatsByCharacterCardName()`：删除绑定到某个卡的所有未锁定聊天
- `renameCharacterCardBinding()`：重命名角色卡引用
- `assignCharacterCardToUnbound()`：将未绑定的聊天分配给某个卡

---

## 分支管理

系统支持从现有对话创建会话分支，使用户能够探索不同的对话路径。

### 创建分支

```
suspend fun createBranch(
    parentChatId: String,
    upToMessageTimestamp: Long? = null
): ChatHistory
```

该方法复制父对话的元数据，并可选择性地过滤到特定时间戳之前的消息：

分支创建工作流：

1. 检索父对话和消息
2. 如果指定了时间戳则过滤消息
3. 创建带有 `parentChatId` 引用的新对话
4. 将消息复制到新对话
5. 设置为当前对话

### 检索分支

```
suspend fun getBranches(parentChatId: String): List<ChatHistory>
```

返回所有 `parentChatId` 匹配的对话：

同时也提供了基于 Flow 的版本：

---

## 搜索与过滤

### 内容搜索

管理器提供基于内容的搜索功能，并使用防抖机制避免频繁访问数据库：

```
suspend fun searchChatIdsByContent(query: String): Set<String>
```

该方法使用 SQL LIKE 并转义特殊字符：

底层 DAO 查询使用不区分大小写的 COLLATE：

### UI 搜索实现

`ChatHistorySelector` 组件实现了带 400ms 延迟的防抖搜索：

搜索逻辑：

1. 检查查询是否匹配标题或分组
2. 如果没有匹配，搜索消息内容(查询长度 ≥ 2 个字符)
3. 在搜索期间显示加载指示器
4. 根据组合结果过滤历史记录

---

## UI 集成

### ChatHistorySelector 组件

`ChatHistorySelector` 是用于浏览和管理聊天历史记录的主要 UI。它支持多种显示模式和拖动重新排序功能。

**图示：ChatHistorySelector 数据流**

```
Callbacks

Local State

ChatHistorySelector Props

ChatViewModel

chatHistoriesFlow

currentChatId

activeStreamingChatIds

chatHistories: List<ChatHistory>

currentId: String?

activeStreamingChatIds: Set<String>

historyDisplayMode

activeCharacterCard

collapsedGroups: Set<String>

searchQuery: String

filteredHistories

flatItems: List<HistoryListItem>

onSelectChat(chatId)

onDeleteChat(chatId)

onUpdateChatTitle(chatId, title)

onUpdateChatOrderAndGroup(...)

ReorderableLazyList
```

### 显示模式

该组件通过 `ChatHistoryDisplayMode` 枚举支持三种显示模式：

**1. BY_CHARACTER_CARD**

先按角色卡分组聊天，然后在每个角色卡内按组分组：

结构：

```
Character A
  ├─ Group 1
  │   ├─ Chat 1
  │   └─ Chat 2
  └─ Ungrouped
      └─ Chat 3
Character B
  └─ Group 1
      └─ Chat 4

```

**2. ALL_CHATS**

仅按组对聊天进行分组，显示所有聊天，无论角色卡绑定如何：

**3. CURRENT_CHARACTER_ONLY**

类似于 ALL_CHATS，但过滤为仅显示绑定到当前活动角色卡的聊天。创建新组时，它们会绑定到当前活动角色卡。

### 拖动重新排序

该组件使用 `sh.calvin.reorderable` 库实现拖放重新排序：

重新排序逻辑：

1. 从扁平列表中提取移动的项
2. 基于新位置重建有序列表
3. 跟踪当前分组/角色卡上下文
4. 更新移动项的分组和角色卡
5. 重新计算所有项的 `displayOrder`
6. 调用 `onUpdateChatOrderAndGroup` 回调

### 聊天项操作

该组件为聊天操作提供对话框菜单：

- **编辑标题**：打开重命名对话框
- **上移/下移**：在当前分组内重新排序
- **锁定/解锁**：切换删除保护
- **删除**：移除聊天(如果未锁定)

### 分组管理

分组有自己的操作菜单，可通过长按访问：

- **重命名分组**：更新所有成员聊天的分组名称
- **删除分组**：删除所有聊天或取消分组

`deleteGroup` 操作遵循锁定状态：

---

## 统计与分析

### 对话数量和消息数量

管理器提供聚合统计信息：

```
suspend fun getTotalChatCount(): Int
suspend fun getTotalMessageCount(): Int
suspend fun getMessageCountsByChatId(): Map<String, Int>
```

### 角色卡片统计

系统为每个角色卡片提供实时统计信息：

```
data class CharacterCardChatStats(
    val characterCardName: String?,
    val chatCount: Int,
    val messageCount: Int
)
```

DAO 使用 SQL JOIN 进行聚合：

这为角色卡片管理界面提供支持，显示每个卡片存在多少对话和消息。

### Token 使用情况显示

`ChatScreenHeader` 显示当前聊天的实时 token 统计信息：

圆形进度指示器显示上下文窗口使用百分比：

下拉菜单提供详细分类：

---

## 总结

聊天历史管理系统提供：

- **持久化存储**：Room 数据库，包含独立的聊天和消息表
- **响应式流**：基于 StateFlow 的更新，实现 UI 响应性
- **并发安全**：全局和单聊天级别的互斥锁机制
- **组织功能**：分组、显示排序和角色卡绑定
- **高级功能**：分支、内容搜索和锁定保护
- **丰富的 UI**：拖拽排序、多种显示模式和内联操作

核心类：

- `ChatHistoryManager`：所有聊天操作的单例仓库
- `ChatDao` / `MessageDao`：用于数据库访问的 Room DAO
- `ChatEntity` / `MessageEntity`：数据库实体
- `ChatHistory` / `ChatMessage`：领域模型
- `ChatHistorySelector`：用于聊天浏览的主要 UI 组件

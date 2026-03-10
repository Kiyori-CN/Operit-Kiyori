# 数据管理

Operit AI 中的数据管理涵盖了用于存储用户数据、配置和应用程序状态的所有持久化机制。该系统通过三个主要后端提供可靠的响应式数据存储:用于结构化聊天数据的 Room 数据库、用于偏好设置和配置的 DataStore,以及用于工作区文件的文件系统。

有关工作区如何管理和存储的信息,请参阅 [工作区系统](/AAswordman/Operit/7-system-integration)。有关配置如何影响 AI 行为的详细信息,请参阅 [模型配置](/AAswordman/Operit/2.3-model-configuration) 和 [系统提示词与上下文](/AAswordman/Operit/2.4-system-prompts-and-context)。

---

## 持久化架构概述

Operit AI 采用多层持久化策略,每个存储后端针对特定数据类型进行了优化:

```
Room Entities

Storage Backends

Data Management Layer

Application Layer

ChatViewModel

Configuration Managers

ChatHistoryManager

ModelConfigManager

CharacterCardManager

UserPreferencesManager

ApiPreferences

Room Database
(AppDatabase)

DataStore
(Preferences)

File System
(Internal/External Storage)

ChatDao

MessageDao

ChatEntity

MessageEntity
```

**图示:数据管理架构概览**

该架构将关注点分离为三个不同的层次：

- **应用层（Application Layer）**：ViewModels 和业务逻辑
- **数据管理层（Data Management Layer）**：Repository 模式实现
- **存储后端（Storage Backends）**：物理持久化机制

---

## 数据库架构

### Room 数据库结构

Operit AI 使用 Room 进行结构化的关系型数据持久化。数据库架构围绕聊天会话及其消息展开：

```
contains

ChatEntity

string

id

PK

string

title

long

createdAt

long

updatedAt

int

inputTokens

int

outputTokens

int

currentWindowSize

string

group

int

displayOrder

string

workspace

string

parentChatId

string

characterCardName

MessageEntity

long

messageId

PK

string

chatId

FK

string

sender

string

content

long

timestamp

int

orderIndex

string

attachments

string

referencedMessageTimestamp

string

roleName
```

**图示：Room 数据库模式**

该模式实现了一对多关系，其中每个 `ChatEntity` 包含多个 `MessageEntity` 记录。关键设计决策包括：

- **主键（Primary Keys）**：`ChatEntity.id` 使用 UUID 字符串；`MessageEntity.messageId` 使用自动生成的长整型
- **排序（Ordering）**：消息按 `timestamp` 排序（而非 `orderIndex`），允许在任意位置插入
- **外键（Foreign Keys）**：级联删除确保在删除聊天时清理消息
- **元数据（Metadata）**：令牌计数和窗口大小存储在聊天级别以实现高效统计

### 数据访问对象(DAOs)

系统提供两个专用的 DAOs 用于数据库操作：

#### MessageDao

方法用途SQL 策略`getMessagesForChat()`检索聊天的所有消息`ORDER BY timestamp ASC``insertMessage()`添加单条消息`REPLACE` 冲突策略`insertMessages()`批量插入消息`REPLACE` 冲突策略`updateMessageContent()`修改现有消息通过 `messageId` 直接 `UPDATE``deleteMessageByTimestamp()`删除特定消息`DELETE WHERE timestamp = ?``deleteMessagesFrom()`从时间戳开始删除`DELETE WHERE timestamp >= ?``searchChatIdsByContent()`全文搜索`LIKE` 配合 `COLLATE NOCASE`
DAO 使用基于时间戳的操作来标识消息，因为时间戳一旦创建就不可变，并提供自然排序。

### 领域模型转换

持久化层在数据库实体和领域模型之间进行转换：

```
Database Entities

Domain Models

ChatEntity.fromChatHistory()

toChatHistory()

MessageEntity.fromChatMessage()

toChatMessage()

contains

contains

ChatHistory

ChatMessage

ChatEntity

MessageEntity
```

**图示：实体-模型转换流程**

`ChatHistoryManager` 在仓储边界执行转换：

- **加载**：将 `ChatEntity` 转换为 `ChatHistory`，并延迟加载消息
- **保存**：将 `ChatHistory` 转换为 `ChatEntity` 并持久化

这种分离使 UI 层可以使用丰富的领域模型，而数据库使用优化的扁平结构。

---

## 聊天数据持久化

### ChatHistoryManager

`ChatHistoryManager` 是聊天数据的中央仓库，实现了单例模式并具有线程安全操作：

```
Metadata Operations

CRUD Operations

Reactive Flows

ChatHistoryManager Core

locks

locks

locks

locks

locks

Singleton Instance

Mutex Lock

AppDatabase Reference

chatHistoriesFlow
(StateFlow)

currentChatIdFlow
(StateFlow)

characterCardStatsFlow
(Flow)

saveChatHistory

addMessage

updateMessage

deleteMessage

clearChatMessages

updateChatTitle

updateChatTokenCounts

updateChatGroup

updateChatWorkspace

updateChatCharacterCardName
```

**图示：ChatHistoryManager 结构**

关键实现细节：

- **线程安全**：所有修改操作使用 `mutex.withLock()`
- **响应式更新**：数据库变更自动通过 StateFlow/Flow 传播
- **延迟加载**：聊天列表加载时不包含完整消息内容以提升性能

### 消息操作

#### 添加消息

`addMessage()` 方法支持追加和插入两种操作：

```
addMessage(chatId, message, position?)
├─ If position specified:
│  ├─ Load existing messages
│  ├─ Calculate new timestamp between neighbors
│  └─ Create message with interpolated timestamp
└─ Insert MessageEntity to database

```

时间戳插值算法确保正确的排序，无需重新索引所有消息。

#### 删除消息

提供三种删除策略：
方法范围使用场景`deleteMessage()`通过时间戳删除单条消息用户删除特定消息`deleteMessagesFrom()`删除时间戳之后的所有消息回滚/创建分支`clearChatMessages()`删除聊天中的所有消息重置对话
所有删除方法都会通过触发聊天元数据更新

### 聊天分支

分支系统为备选对话路径创建会话分叉：

```
createBranch()
upTo: msg5

createBranch()
upTo: msg3

copies messages 1-5

copies messages 1-3

Parent Chat
(id: parent-123)

Branch Chat 1
(id: branch-abc)
(parentChatId: parent-123)

Branch Chat 2
(id: branch-xyz)
(parentChatId: parent-123)
```

**图示：聊天分支结构**

`createBranch()` 方法：

1. 加载父聊天和消息
2. 如果指定了 `upToMessageTimestamp`，则过滤到该时间戳之前的消息
3. 创建包含复制消息的新 `ChatHistory`
4. 设置 `parentChatId` 以建立关系
5. 将分支持久化为独立聊天

分支继承：

- 标题(在 UI 中显示时带有分支图标)
- 分组分配
- 工作区绑定
- 角色卡绑定
- Token 统计(截至分支点)

### 组织与分组

聊天可以使用分组和显示顺序进行组织：

#### 分组管理

- **`updateGroupName()`**：重命名分组，可选择限定在角色卡范围内
- **`deleteGroup()`**：删除分组，可选择删除其中包含的聊天
- **`updateChatOrderAndGroup()`**：批量更新以支持拖放重新排序

分组支持角色卡范围限定，允许不同角色拥有独立的组织结构。

#### 显示排序

`displayOrder` 字段控制聊天列表排序。较小的值排在前面。这支持在分组内进行自定义用户定义的排序。

### 角色卡集成

聊天可以通过 `characterCardName` 绑定到特定角色卡：

```
Character Card Filtering

If default card

If custom card

All Chats

Filter Logic

Default Card
(isDefault=true)

Custom Card
(isDefault=false)

Chats with card name
+ Chats with null card

Chats with card name
(exact match only)
```

**图示：角色卡过滤逻辑**

`getChatHistoriesByCharacterCard()` 方法实现了此过滤功能。默认卡片显示未绑定的聊天记录以提供向后兼容性，而自定义卡片需要显式绑定。

`characterCardStatsFlow`为 UI 显示提供每个角色卡片的聚合统计信息。

---

## 导入/导出系统

### 导出格式

`ChatHistoryManager` 通过 `ChatExporter` 抽象支持多种导出格式：

```
Supported Formats

Export Flow

JSON

Markdown

HTML

CSV

ChatHistoryManager

exportAllChats

Choose Format

ChatExporter Implementation

Output File

JsonChatExporter

MarkdownChatExporter

HtmlChatExporter

CsvChatExporter
```

**图示：导出格式选择**

每个导出器实现标准接口并在 Downloads/Operit 目录中生成文件。导出操作包括：

- **单个聊天导出**：`exportChatHistory(chatId, format)`
- **批量导出**：`exportAllChats(format)` 使用 ZIP 打包
- **进度跟踪**：带增量回调的挂起函数

### 导入系统

导入系统支持：

1. **ZIP Archive Import**：提取并处理多个聊天 JSON 文件
2. **Single File Import**：导入单个聊天导出文件
3. **Merge Strategy**：导入的聊天获得新 ID 以避免冲突
4. **Validation**：数据库插入前进行 JSON schema 验证

导入流程：

```
importChatHistory(uri)
├─ Detect file type (ZIP or JSON)
├─ Parse chat data
├─ Generate new UUIDs for chats
├─ Validate chat structure
└─ Insert to database

```

---

## 偏好设置系统

### DataStore 架构

配置和偏好设置通过 Jetpack DataStore 持久化，提供类型安全的响应式存储：

```
DataStore Files

Preference Managers

writes/reads

writes/reads

writes/reads

writes/reads

writes/reads

writes/reads

writes/reads

ModelConfigManager

CharacterCardManager

UserPreferencesManager

FunctionalConfigManager

ApiPreferences

WaifuPreferences

SpeechServicesPreferences

model_configs.preferences_pb

character_cards.preferences_pb

user_prefs.preferences_pb

functional_configs.preferences_pb

api_preferences.preferences_pb

waifu_preferences.preferences_pb

speech_services.preferences_pb
```

**图示：DataStore 偏好设置文件**

每个管理器在自己的 DataStore 实例上运行，防止冲突并支持并发访问。DataStore 提供：

- **Type Safety**：Kotlin 序列化与编译时检查
- **Atomic Updates**：`edit {}` 块确保一致性
- **Reactive Flows**：偏好设置以 `Flow<T>` 形式暴露，实现 UI 自动更新
- **Crash Resistance**：基于 Protobuf 的存储可抵御损坏

### 配置序列化

管理器使用 Gson 或 Kotlin Serialization 将复杂配置对象序列化到 DataStore。示例结构：

**ModelConfigManager** 存储：

```
{
  "configs": {
    "config-id-1": {
      "name": "GPT-4 Turbo",
      "provider": "OPENAI",
      "apiKey": "sk-...",
      "modelName": "gpt-4-turbo-preview",
      "temperature": 0.7,
      "maxTokens": 4096,
      // ... additional parameters
    }
  },
  "selectedConfigId": "config-id-1"
}
```

**CharacterCardManager** 存储：

```
{
  "cards": [
    {
      "name": "Assistant",
      "description": "Default AI assistant",
      "characterSetting": "You are a helpful AI...",
      "openingStatement": "Hello! How can I help?",
      "isDefault": true,
      // ... theme bindings, prompts
    }
  ],
  "activeCardIndex": 0
}
```

所有管理器遵循此模式：

1. 使用 `@Serializable` 或 Gson 兼容性定义数据类
2. 序列化为 JSON 字符串
3. 将 JSON 存储在 DataStore `stringPreferencesKey` 中
4. 为消费者暴露响应式 `Flow<ConfigData>`

---

## Token 统计持久化

Token 使用跟踪分为运行时状态和持久化存储两部分：

### 运行时跟踪

`TokenStatisticsDelegate`在活动对话期间维护内存中的计数器：

```
tokenUsage Flow

Updates

Updates

Updates

Per-request

EnhancedAIService

TokenStatisticsDelegate

cumulativeInputTokensFlow

cumulativeOutputTokensFlow

currentWindowSizeFlow

perRequestTokenCountFlow
```

**图示：运行时 Token 跟踪**

该委托订阅 AI 服务的 token 事件，并维护当前聊天会话的累计统计信息。

### 持久化存储

Token 统计信息在聊天级别持久化到 Room 数据库：
字段用途更新触发时机`inputTokens`累计输入 token每轮完成后`outputTokens`累计输出 token每轮完成后`currentWindowSize`保存时的上下文窗口大小每轮完成后
`ChatHistoryManager.updateChatTokenCounts()` 方法持久化这些值，由以下调用：

```
MessageProcessingDelegate.onTurnComplete()
  → TokenStatisticsDelegate.updateCumulativeStatistics()
  → ChatHistoryDelegate.saveCurrentChat()
  → ChatHistoryManager.updateChatTokenCounts()

```

**ApiPreferences** 单独跟踪每个提供商:模型组合的全局 token 使用情况，用于跨所有对话的成本分析。

---

## 搜索与查询

### 基于内容的搜索

`MessageDao` 提供跨所有消息的全文搜索：

```
SELECT DISTINCT chatId
FROM messages
WHERE content LIKE '%' || :query || '%' COLLATE NOCASE
```

`searchChatIdsByContent()` 方法返回包含搜索词的聊天 ID 列表，实现：

- 按关键词过滤聊天历史
- 快速访问相关对话
- 不区分大小写的匹配

通过 `ChatHistoryManager.searchChatIdsByContent()` 暴露

### 按元数据过滤

其他查询方法支持过滤：

- **按角色卡片**：`getChatHistoriesByCharacterCard()`
- **按父级对话**: `getBranches()` 用于查找所有分支
- **按分组**: 通过 `chatHistoriesFlow` 的内存过滤隐式实现

所有查询返回响应式 `Flow<List<ChatHistory>>`，以便在数据变化时自动更新 UI。

---

## 数据迁移与兼容性

### 模式版本控制

Room 数据库模式版本通过迁移策略进行管理。`AppDatabase` 类定义当前模式版本，并为破坏性更改提供迁移路径。

关键迁移场景：

- 添加新字段(例如 `workspace`、`parentChatId`、`characterCardName`)
- 更改列类型或约束
- 为新功能添加新表

迁移在更新模式的同时保留现有数据，确保向后兼容性。

### 旧版数据处理

对于以旧格式存储的偏好设置：

- 管理器检查现有键并在首次访问时进行迁移
- 当键不存在时提供默认值
- 如果迁移失败则回退到系统默认值

背景图片迁移示例: 系统检测基于 URI 的旧存储方式并迁移到内部文件存储，如果迁移失败则显示相应的错误消息。

---

## 性能考虑

### 懒加载策略

聊天历史系统实现了激进的懒加载：

1. **聊天列表加载**：`chatHistoriesFlow` 仅加载 `ChatEntity` 元数据而不加载消息
2. **按需消息加载**：仅当聊天变为活动状态时，通过 `loadChatMessages()` 加载消息
3. **分页**：`ChatArea` 组件实现基于视口的分页，分块加载消息

此策略使内存使用量保持恒定，无论聊天/消息总数如何。

### 批量操作

为提高效率，系统提供批量变体：
单个操作批量操作使用场景`insertMessage()``insertMessages()`初始聊天保存`updateChat()``updateChats()`拖放重新排序-`updateChatOrderAndGroup()`组织变更
批量操作在单个事务中执行，减少数据库开销。

### StateFlow 缓存

所有响应式流使用 `stateIn()` 配合 `SharingStarted.Lazily`以实现：

- 缓存最新值以便立即访问
- 在多个收集器之间共享单个上游订阅
- 仅在首个订阅者出现时开始收集
- 在任何订阅者存在期间保持订阅活跃

这可以防止冗余的数据库查询，并确保 UI 组件之间的一致性。

---

## 与 UI 层的集成

### ViewModel 数据流

`ChatViewModel` 通过委托集成数据管理：

```
Data Sources

Delegates

uses

chatHistoriesFlow

currentChatIdFlow

selectedConfig

tokenStats

ChatViewModel

ChatHistoryDelegate

MessageProcessingDelegate

ApiConfigDelegate

TokenStatisticsDelegate

ChatHistoryManager

ModelConfigManager

ApiPreferences
```

**图示：ViewModel 数据集成**

委托封装了特定的数据关注点：

- **ChatHistoryDelegate**: 管理聊天的增删改查和选择
- **ApiConfigDelegate**: 处理 AI 配置持久化
- **TokenStatisticsDelegate**: 跟踪 token 使用情况

这种委托模式使 ViewModel 代码保持模块化和可测试性。

### 响应式 UI 更新

UI 组件直接收集 StateFlows:

```
val chatHistory by actualViewModel.chatHistory.collectAsState()
val chatHistories by actualViewModel.chatHistories.collectAsState()
val currentChatId by actualViewModel.currentChatId.collectAsState()
```

StateFlow 的发射会自动触发重组,确保 UI 与数据层保持一致,无需手动刷新逻辑。

---

## 错误处理与数据完整性

### 事务安全

`ChatHistoryManager` 中的所有变更操作都受互斥锁保护：

```
mutex.withLock {
    try {
        // Database operations
    } catch (e: Exception) {
        AppLogger.e(TAG, "Operation failed", e)
        throw e
    }
}
```

这确保了：

- 线程安全的并发访问
- 原子性的多步操作
- 一致的错误处理
- 记录所有失败

### 级联操作

Room 外键约束配合 `onDelete = CASCADE` 确保引用完整性。删除 `ChatEntity` 会自动移除所有关联的 `MessageEntity` 记录，防止孤立数据。

### 备份与恢复

用户可以：

1. 在执行破坏性操作前将所有聊天导出为 ZIP
2. 导入备份以恢复数据
3. 在设置中查看导出位置: "Download/Operit" 文件夹

界面在不可逆操作前显示警告: "删除所有聊天记录是不可逆的。建议在继续之前导出备份。"

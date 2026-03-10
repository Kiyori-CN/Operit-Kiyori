# 角色卡片与人设

本页面记录了角色卡片和人格系统，该系统使用户能够定义具有自定义行为、提示词模板和视觉主题的不同 AI 人格。角色卡片控制 AI 如何介绍自己、响应查询，以及通过系统提示词和开场白展示其个性。

有关用户偏好配置文件(用户侧自定义)的信息，请参阅 [用户偏好设置](/AAswordman/Operit/3.3-message-processing)。有关系统级提示词配置，请参阅 [系统提示词和上下文](/AAswordman/Operit/2.4-system-prompts-and-context)。

---

## 目的和范围

角色卡片系统提供：

- **人格定义**：名称、描述、角色设定和行为规则
- **提示词组合**：可重用的提示词标签，组合形成系统提示词
- **主题绑定**：每张卡片的视觉自定义(颜色、背景、头像)
- **Tavern AI 兼容性**：从 Tavern AI 生态系统导入角色卡片
- **AI 辅助生成**：用于通过 AI 帮助创建卡片的交互式聊天界面
- **上下文注入**：在对话上下文中自动包含角色特征

角色卡片是人格自定义的主要机制，与描述用户的用户偏好以及提供功能指令的系统提示词不同。

---

## 数据模型

### CharacterCard 结构

CharacterCard 数据类定义了完整的人格配置：

```
attachedTagIds

CharacterCard

+String id

+String name

+String description

+String characterSetting

+String openingStatement

+String otherContent

+List<String> attachedTagIds

+String advancedCustomPrompt

+String marks

+Boolean isDefault

+Long createdAt

+Long updatedAt

PromptTag

+String id

+String name

+String description

+String promptContent

+TagType tagType

«enumeration»

TagType

SYSTEM

CUSTOM
```

**字段描述**：
字段用途`id`唯一标识符(UUID 或 `default_character`)`name`角色的显示名称`description`在卡片选择器中显示的简要描述`characterSetting`核心人格定义，注入到系统提示词中`openingStatement`开始对话时的初始问候消息`otherContent`额外的上下文或行为准则`attachedTagIds`对可复用 `PromptTag` 对象的引用`advancedCustomPrompt`专家用户的覆盖选项，替换默认组合`marks`用户备注或分类标签`isDefault`是否为内置系统默认值

---

## Character Card Manager

### 存储架构

角色卡片持久化到 Android DataStore，采用键值对结构：

```
CharacterCardManager

DataStore<Preferences>

CHARACTER_CARD_LIST
(StringSet)

ACTIVE_CHARACTER_CARD_ID
(String)

character_card_{id}_*
(Per-field keys)

name

description

character_setting

opening_statement

attached_tag_ids
```

每个角色卡片的字段使用以 `character_card_{id}_` 为前缀的独立偏好设置键存储。`CHARACTER_CARD_LIST` 集合维护所有卡片 ID 的注册表，`ACTIVE_CHARACTER_CARD_ID` 跟踪当前选中的角色。

### CRUD 操作

#### 创建角色卡片

```
suspend fun createCharacterCard(card: CharacterCard): String
```

创建流程：

1. 如果 `card.id` 为空则生成 UUID
2. 使用带前缀的键存储所有字段
3. 将 ID 添加到 `CHARACTER_CARD_LIST` 集合
4. 通过 `createDefaultThemeForCharacterCard()` 创建默认主题绑定
5. 通过 `createDefaultWaifuConfigForCharacterCard()` 创建默认 Waifu 配置
6. 返回分配的 ID

#### 更新角色卡片

更新是原子操作，会覆盖指定卡片 ID 的所有字段。`updatedAt` 时间戳会自动刷新。

#### 读取角色卡片

基于 Flow 的响应式访问：

```
val activeCharacterCardFlow: Flow<CharacterCard>
val characterCardListFlow: Flow<List<String>>
fun getCharacterCardFlow(id: String): Flow<CharacterCard>
```

快照访问：

```
suspend fun getCharacterCard(id: String): CharacterCard
suspend fun getAllCharacterCards(): List<CharacterCard>
```

#### 删除角色卡片

删除包括：

1. 移除卡片的所有偏好设置键
2. 从 `CHARACTER_CARD_LIST` 中移除 ID
3. 清理主题绑定
4. 清理 Waifu 配置
5. 如果删除的是活动卡片，则切换到默认卡片

---

## 提示标签系统

### 目的

提示标签是可重用的提示组件，可以附加到多个角色卡片上。这使得：

- **模块化组合**：从较小的片段构建复杂的提示
- **一致性**：在角色之间共享通用指令
- **可维护性**：在一个地方更新共享行为

### 系统标签

三个系统标签具有固定 ID 和特殊用途：
标签 ID常量用途`system_chat_tag``SYSTEM_CHAT_TAG_ID`默认聊天界面提示`system_voice_tag``SYSTEM_VOICE_TAG_ID`语音交互提示`system_desktop_pet_tag``SYSTEM_DESKTOP_PET_TAG_ID`桌面宠物模式提示
这些标签在初始化期间自动创建，并根据交互模式提供适合上下文的指令。

### 标签组合

```
suspend fun combinePrompts(
    characterCardId: String,
    additionalTagIds: List<String>
): String
```

组合算法：

1. 通过 ID 检索角色卡片
2. 从卡片中收集所有 `attachedTagIds`
3. 追加 `additionalTagIds`(例如，基于上下文的系统标签)
4. 从 `PromptTagManager` 加载所有引用的标签
5. 对标签排序：系统标签在前，然后是自定义标签
6. 使用换行符连接 `promptContent`
7. 返回组合后的字符串

在对话准备期间，此组合提示词会被注入到系统提示词中。

---

## Tavern AI 导入

### 格式支持

系统从 Tavern AI 生态系统导入角色卡，支持两种格式：

1. **嵌入 JSON 的 PNG**：角色数据编码在 PNG 元数据中
2. **纯 JSON**：直接的角色定义文件

### 导入流程图

```
DataStore
TavernCharacterCard
CharacterCardManager
FilePicker
User
DataStore
TavernCharacterCard
CharacterCardManager
FilePicker
User
alt
[PNG Format]
[JSON Format]
Select .png or .json file
Pass file InputStream
createCharacterCardFromTavernPng()
Extract PNG text chunks
Decode base64 JSON
Parse TavernCharacterCard
createCharacterCardFromTavernJson()
Parse JSON string
Deserialize TavernCharacterCard
Return TavernCharacterCard
Convert to CharacterCard
createCharacterCard()
Import success
```

### TavernCharacterCard Schema

Tavern AI 格式使用嵌套结构：

```
data class TavernCharacterCard(
    val spec: String,
    val spec_version: String,
    val data: TavernData
)
 
data class TavernData(
    val name: String,
    val description: String,
    val personality: String,
    val scenario: String,
    val first_mes: String,
    val mes_example: String,
    // ... additional fields
)
```

### 转换逻辑

从 Tavern 到 Operit 格式的映射：
Tavern 字段Operit 字段转换`data.name``name`直接复制`data.description``description`直接复制`data.personality``characterSetting`与 `scenario` 组合`data.first_mes``openingStatement`直接复制`data.mes_example``otherContent`直接复制`data.scenario``characterSetting`追加到性格
`characterSetting` 的组成为：`"{personality}\n场景设定: {scenario}"`

### PNG 元数据提取

PNG 导入流程：

1. 顺序读取 PNG 数据块
2. 定位 `tEXt` 数据块(文本元数据)
3. 解析数据块格式：`keyword\0text_content`
4. 查找包含 base64 编码 JSON 的 `chara` 关键字
5. 将 base64 解码为 UTF-8 JSON 字符串
6. 解析为 `TavernCharacterCard`

---

## 主题与偏好设置绑定

### 单卡片主题自定义

每个角色卡片可以拥有专属的主题设置，当该卡片处于活动状态时会覆盖全局偏好设置：

```
CharacterCard
id: 'alice'

UserPreferencesManager

WaifuPreferences

Theme Bindings
character_alice_*

Waifu Bindings
waifu_character_alice_*

background_image_uri

custom_primary_color

custom_ai_avatar_uri

custom_chat_title

waifu_char_delay

waifu_enable_emoticons

waifu_selfie_prompt
```

### 绑定创建

创建角色卡片时，会建立默认绑定：

```
private suspend fun createDefaultThemeForCharacterCard(cardId: String)
private suspend fun createDefaultWaifuConfigForCharacterCard(cardId: String)
```

这些函数：

1. 将当前全局设置复制到卡片专属键
2. 生成默认头像 URI 占位符
3. 将默认聊天标题设置为角色名称
4. 初始化 Waifu 模式参数

### 绑定应用

切换活动角色卡片时：

```
suspend fun setActiveCharacterCard(cardId: String)
```

系统会：

1. 在 DataStore 中更新 `ACTIVE_CHARACTER_CARD_ID`
2. UI 监听 `activeCharacterCardIdFlow` 并重新组合
3. 主题系统读取角色专属偏好设置键
4. `UserPreferencesManager` 方法检查 `_character_{id}_` 覆盖项

这样在切换角色时可以实现无缝的视觉过渡。

### 克隆绑定

复制角色卡时，主题和 Waifu 绑定会被克隆：

```
suspend fun cloneBindingsFromCharacterCard(
    sourceCardId: String,
    targetCardId: String
)
```

这为衍生角色保留了视觉一致性。

---

## AI 辅助生成

### PersonaCardGenerationScreen

生成界面提供了一个交互式聊天界面，用户可以与 AI 助手对话，迭代构建角色卡：

```
Message

sendMessage

Stream response

Tool invocation

save_character_info

Update complete

Display updated

User Input

Chat Interface
LazyColumn

AI Assistant
EnhancedAIService

LocalCharacterToolExecutor

CharacterCardManager
```

### 工具：save_character_info

一个专门用于生成界面的工具，直接修改角色卡片字段：

**参数**：

- `field`：目标字段名(`name`、`description`、`characterSetting`、`openingStatement` 等)
- `content`：字段的新值

**执行流程**：

1. 验证 `characterCardId` 是否存在
2. 获取当前 `CharacterCard`
3. 使用 `copy()` 创建带有新字段值的更新实例
4. 在 `CharacterCardManager` 上调用 `updateCharacterCard()`
5. 返回成功/错误结果

这使得 AI 能够在对话过程中多次调用该工具来逐步构建角色。

### 生成工作流

**用户交互流程**：

1. **卡片选择**：用户选择现有卡片或创建新卡片
2. **初始提示**：系统提供带有卡片创建建议的引导消息
3. **对话**：用户描述期望的角色特征、外观、性格
4. **AI 响应**：助手提出澄清问题并建议字段值
5. **工具执行**：AI 调用 `save_character_info` 更新特定字段
6. **增量构建**：重复该过程直到角色完成
7. **实时预览**：角色编辑器在字段修改时显示实时更新

**消息限制**：每次对话最多 40 条消息，以防止过度使用 API。

**历史持久化**：

对话按卡片保存，恢复生成时会还原。

---

## 与对话系统的集成

### 系统提示词组成

```
SystemPromptConfig
PromptTagManager
CharacterCardManager
ConversationService
EnhancedAIService
SystemPromptConfig
PromptTagManager
CharacterCardManager
ConversationService
EnhancedAIService
alt
[PromptFunctionType.VOICE]
[PromptFunctionType.DESKTOP_PET]
[Default]
prepareConversationHistory()
Get active character card
CharacterCard
Determine PromptFunctionType
(CHAT, VOICE, DESKTOP_PET)
Get SYSTEM_VOICE_TAG_ID
Get SYSTEM_DESKTOP_PET_TAG_ID
Get SYSTEM_CHAT_TAG_ID
combinePrompts(cardId, [systemTagId])
Load all attached tags
List<PromptTag>
Sort and concatenate
Combined intro prompt
getSystemPromptWithCustomPrompts()
System prompt template
Build final system prompt
+ intro + workspace + tools
Prepared history with system prompt
```

### 上下文注入点

角色卡在多个层级影响系统提示词：

**引导提示词组成**：

```
val introPrompt = characterCardManager.combinePrompts(
    activeCard.id,
    listOf(systemTagId)
)
```

**系统提示词组装**：

```
val systemPrompt = SystemPromptConfig.getSystemPromptWithCustomPrompts(
    packageManager = packageManager,
    workspacePath = workspacePath,
    introPrompt = introPrompt,  // <- Character card prompt
    thinkingGuidance = thinkingGuidance,
    customTemplate = customSystemPromptTemplate,
    enableTools = enableTools,
    enableMemoryQuery = enableMemoryQuery,
    hasImageRecognition = hasImageRecognition,
    useToolCallApi = useToolCallApi,
    chatModelHasDirectImage = chatModelHasDirectImage
)
```

**占位符替换**：

系统将提示词中的 `{character_name}` 占位符替换为实际角色名称，从而实现自我指代的指令。

### 开场白

启动新对话时，会检索角色的 `openingStatement` 并将其显示为第一条助手消息：

```
suspend fun getOpeningStatement(cardId: String): String {
    val card = getCharacterCard(cardId)
    return card.openingStatement.ifEmpty {
        "你好！有什么我可以帮助你的吗？"  // Default greeting
    }
}
```

这由聊天初始化逻辑调用，以建立角色的存在感。

---

## UI 组件

### ModelPromptsSettingsScreen

主要管理界面包含两个标签页：

**角色卡片标签页**：

- 显示所有角色卡片的列表，包含名称、描述和附加标签
- 快捷操作：编辑、删除、复制、设为活动
- 从 Tavern AI 导入(PNG/JSON 文件选择器)
- 创建新卡片对话框
- 重置默认卡片选项

**标签标签页**：

- 提示词标签列表(系统和自定义)
- 添加/编辑标签对话框
- 删除标签（需确认）
- 导航到标签市场

**关键状态管理**：

```
val characterCardList by characterCardManager.characterCardListFlow
    .collectAsState(initial = emptyList())
 
val activeCharacterCardId by characterCardManager.activeCharacterCardIdFlow
    .collectAsState(initial = "")
```

### CharacterCardDialog

综合编辑器对话框，包含以下字段：

- 名称
- 描述
- 角色设定(主要性格文本)
- 开场白
- 其他内容(附加上下文)
- 高级自定义提示词(专家覆盖)
- 标记(用户备注)
- 附加标签(从可用标签中多选)

该对话框支持创建和编辑两种模式，由 `characterCard.id` 是否为空决定。

### ThemeSettingsScreen 集成

主题设置界面显示当前激活的角色卡：

```
val activeCharacterCard = characterCardManager.activeCharacterCardFlow
    .collectAsState(initial = CharacterCard(...))
    .value
```

此处保存的设置应用于激活角色卡的绑定，实现每个卡片的视觉定制。

---

## 初始化与默认值

### 默认角色卡

系统提供内置默认卡片：

```
const val DEFAULT_CHARACTER_CARD_ID = "default_character"
const val DEFAULT_CHARACTER_NAME = "Operit"
const val DEFAULT_CHARACTER_DESCRIPTION = "系统默认的角色卡配置"
const val DEFAULT_CHARACTER_SETTING = "你是Operit，一个全能AI助手，旨在解决用户提出的任何任务。"
const val DEFAULT_CHARACTER_OTHER_CONTENT = "保持有帮助的语气，并清楚地传达限制。"
```

### 初始化流程

```
suspend fun initializeIfNeeded() {
    val cardList = characterCardListFlow.first()
    if (!cardList.contains(DEFAULT_CHARACTER_CARD_ID)) {
        createDefaultCharacterCard()
    }
}
```

在应用首次启动或默认卡片缺失时调用。确保始终存在备用角色。

### 重置为默认

```
suspend fun resetDefaultCharacterCard()
```

删除当前默认卡片并使用出厂设置重新创建。当默认卡片已被修改且用户希望恢复原始行为时使用。

---

## 总结

角色卡片和人设系统为 AI 个性化定制提供了灵活、可扩展的框架：

- **数据层**：`CharacterCard` 模型与 DataStore 持久化
- **管理层**：`CharacterCardManager` 用于 CRUD 和组合
- **标签系统**：通过 `PromptTagManager` 实现可复用的提示词组件
- **导入支持**：兼容 Tavern AI PNG/JSON 格式
- **主题绑定**：通过偏好设置覆盖实现每个卡片的视觉定制
- **AI 生成**：基于交互式聊天的卡片创建
- **对话集成**：根据上下文自动注入到系统提示词

该架构使用户能够维护多个不同的 AI 人设，每个人设具有自定义行为、视觉主题和提示词组合，同时保持与更广泛的 Tavern AI 生态系统的兼容性。

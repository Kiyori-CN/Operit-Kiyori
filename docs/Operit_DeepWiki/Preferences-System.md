# 偏好设置系统

偏好设置系统使用 Android 的 Jetpack DataStore 管理 Operit 中的持久化用户设置和应用程序状态。它提供类型安全、响应式的配置值访问，涵盖从 AI 模型参数到 UI 显示设置的各个方面。该系统采用单例模式，并基于 Flow 实现响应式更新，当偏好设置发生变化时自动更新 UI。

关于模型配置存储的具体内容，请参阅 [Configuration Storage](/AAswordman/Operit/8.4-configuration-storage)。关于聊天数据的数据库持久化，请参阅 [Database Architecture](/AAswordman/Operit/8.1-database-architecture)。

---

## 架构概览

偏好设置系统围绕多个专门的偏好管理器构建,每个管理器处理不同领域的设置。主要实现使用 DataStore Preferences API 进行类型安全的键值存储,并通过基于协程的异步操作实现。

```
Storage

Service Layer

UI Layer

Preference Managers

ApiPreferences
(api_settings datastore)

UserPreferencesManager

EnvPreferences

DisplayPreferencesManager

GitHubAuthPreferences

SkillVisibilityPreferences

RemoteAnnouncementPreferences

SettingsScreen

AIChatScreen

ToolboxScreen

PackageManagerScreen

ChatServiceCore

EnhancedAIService

PackageManager

MCPManager

Android DataStore
Preferences API
```

---

## 核心组件

### ApiPreferences

`ApiPreferences` 是核心偏好设置管理器，使用双重检查锁定实现为线程安全的单例。它通过名为 `"api_settings"` 的专用 DataStore 实例管理大部分应用程序设置。
组件类型用途`Context.apiDataStore``DataStore<Preferences>`用于偏好设置存储的 DataStore 扩展属性`getInstance(Context)`静态方法线程安全的单例访问器偏好设置键`Preferences.Key<T>`每个设置的类型安全键Flow 属性`Flow<T>`偏好设置值的响应式流挂起函数`suspend fun`异步写入操作
**单例实现：**

```
@Volatile
private var INSTANCE: ApiPreferences? = null
Â 
fun getInstance(context: Context): ApiPreferences {
    return INSTANCE ?: synchronized(this) {
        val instance = ApiPreferences(context.applicationContext)
        INSTANCE = instance
        instance
    }
}
```

### 偏好设置键定义模式

偏好设置使用类型化键常量定义，并配有相应的 Flow 访问器和写入方法：

```
// Key definition
val ENABLE_TOOLS = booleanPreferencesKey("enable_tools")
const val DEFAULT_ENABLE_TOOLS = true
Â 
// Flow accessor (reactive read)
val enableToolsFlow: Flow<Boolean> =
    context.apiDataStore.data.map { preferences ->
        preferences[ENABLE_TOOLS] ?: DEFAULT_ENABLE_TOOLS
    }
Â 
// Write method (suspend function)
suspend fun saveEnableTools(isEnabled: Boolean) {
    context.apiDataStore.edit { preferences ->
        preferences[ENABLE_TOOLS] = isEnabled
    }
}
```

---

## 偏好设置类别

### AI 行为配置

控制 AI 模型行为、规划能力和思考模式。
偏好设置键类型默认值描述`ENABLE_AI_PLANNING`Boolean`false`启用多步骤 AI 规划`ENABLE_THINKING_MODE`Boolean`false`激活思维链推理`ENABLE_THINKING_GUIDANCE`Boolean`false`向模型提供思考提示`THINKING_QUALITY_LEVEL`Int`2`思考深度(1-3)`ENABLE_MEMORY_QUERY`Boolean`true`启用记忆系统集成`ENABLE_AUTO_READ`Boolean`false`自动读取内容到 AI`ENABLE_TOOLS`Boolean`true`启用工具调用能力
**互斥性强制执行：**

思考模式和思考引导不能同时启用。这在 `updateThinkingSettings` 中强制执行：

```
suspend fun updateThinkingSettings(
    enableThinkingMode: Boolean? = null,
    enableThinkingGuidance: Boolean? = null,
    thinkingQualityLevel: Int? = null
) {
    context.apiDataStore.edit { preferences ->
        // Enforce mutual exclusivity
        if (enableThinkingMode == true) {
            newGuidance = false
        } else if (enableThinkingGuidance == true) {
            newMode = false
        }
        // ... save values
    }
}
```

### UI 和显示设置

控制用户界面行为和内容渲染的设置。
偏好设置键类型默认值描述`KEEP_SCREEN_ON`Boolean`true`防止聊天时屏幕休眠`DISABLE_STREAM_OUTPUT`Boolean`false`禁用流式响应`DISABLE_USER_PREFERENCE_DESCRIPTION`Boolean`false`隐藏用户偏好设置描述`DISABLE_LATEX_DESCRIPTION`Boolean`false`禁用 LaTeX 渲染提示`TOOL_PROMPT_VISIBILITY_JSON`String (JSON)`"{}"`每个工具的提示可见性映射

### 内容截断设置

控制文件读取和消息历史的限制，以管理上下文窗口大小。
偏好设置键类型默认值用途`MAX_FILE_SIZE_BYTES`Int`32000`从文件读取的最大字节数`PART_SIZE`Int`200`分段读取时每部分的行数`MAX_TEXT_RESULT_LENGTH`Int`5000`工具结果中的最大字符数`MAX_IMAGE_HISTORY_USER_TURNS`Int`2`对话中保留的图片数量`MAX_MEDIA_HISTORY_USER_TURNS`Int`1`媒体附件保留数量

### 系统提示词和模板

自定义 AI 系统提示词和指令。
偏好设置键类型描述`CUSTOM_SYSTEM_PROMPT_TEMPLATE`String用户自定义系统提示词覆盖`CUSTOM_HEADERS`String (JSON)API 请求的自定义 HTTP 头

### Storage Access Framework (SAF) 书签

管理文件系统访问的持久化 URI 权限。

```
@Serializable
data class SafBookmark(
    val uri: String,
    val name: String
)
Â 
val safBookmarksFlow: Flow<List<SafBookmark>> =
    context.apiDataStore.data.map { preferences ->
        val json = preferences[SAF_BOOKMARKS_JSON] ?: "[]"
        runCatching {
            Json.decodeFromString<List<SafBookmark>>(json)
        }.getOrElse { emptyList() }
    }
```

---

## Token 使用统计

Preferences System 实现了一个复杂的按模型跟踪 token 的机制，使用动态密钥生成。

### 动态密钥生成

Token 统计信息针对每个 provider:model 组合分别存储，使用动态生成的密钥：

```
fun getTokenInputKey(providerModel: String) =
    intPreferencesKey("token_input_${providerModel.replace(":", "_")}")
Â 
fun getTokenCachedInputKey(providerModel: String) =
    intPreferencesKey("token_cached_input_${providerModel.replace(":", "_")}")
Â 
fun getTokenOutputKey(providerModel: String) =
    intPreferencesKey("token_output_${providerModel.replace(":", "_")}")
```

**格式：**`"PROVIDER_NAME:model-name"` → 密钥：`"token_input_PROVIDER_NAME_model-name"`

### Token 统计架构

```
Pricing Keys

Dynamic Keys

Provider:Model Identification

Provider:Model
e.g., DEEPSEEK:deepseek-chat

token_input_DEEPSEEK_deepseek-chat

token_cached_input_DEEPSEEK_deepseek-chat

token_output_DEEPSEEK_deepseek-chat

request_count_DEEPSEEK_deepseek-chat

model_input_price_DEEPSEEK_deepseek-chat

model_cached_input_price_DEEPSEEK_deepseek-chat

model_output_price_DEEPSEEK_deepseek-chat

billing_mode_DEEPSEEK_deepseek-chat

price_per_request_DEEPSEEK_deepseek-chat
```

### Token 更新流程

```
suspend fun updateTokensForProviderModel(
    providerModel: String,
    inputTokens: Int,
    outputTokens: Int,
    cachedInputTokens: Int = 0
) {
    context.apiDataStore.edit { preferences ->
        val inputKey = getTokenInputKey(providerModel)
        val cachedInputKey = getTokenCachedInputKey(providerModel)
        val outputKey = getTokenOutputKey(providerModel)

        val currentInputTokens = preferences[inputKey] ?: 0
        val currentCachedInputTokens = preferences[cachedInputKey] ?: 0
        val currentOutputTokens = preferences[outputKey] ?: 0

        preferences[inputKey] = currentInputTokens + inputTokens
        preferences[cachedInputKey] = currentCachedInputTokens + cachedInputTokens
        preferences[outputKey] = currentOutputTokens + outputTokens
    }
}
```

### Token 统计信息检索

系统提供单个模型和聚合的 token 统计信息：

**单个模型统计信息：**

```
suspend fun getInputTokensForProviderModel(providerModel: String): Int
suspend fun getCachedInputTokensForProviderModel(providerModel: String): Int
suspend fun getOutputTokensForProviderModel(providerModel: String): Int
```

**聚合统计信息：**

```
suspend fun getAllProviderModelTokens(): Map<String, Triple<Int, Int, Int>>
Â 
val allProviderModelTokensFlow: Flow<Map<String, Triple<Int, Int, Int>>> =
    context.apiDataStore.data.map { preferences ->
        val result = mutableMapOf<String, Triple<Int, Int, Int>>()
        preferences.asMap().forEach { (key, value) ->
            if (key.name.startsWith("token_input_")) {
                val providerModel =
                    decodeProviderModelFromKeySuffix(
                        key.name.removePrefix("token_input_")
                    )
                val inputTokens = value as? Int ?: 0
                val outputTokens = preferences[getTokenOutputKey(providerModel)] ?: 0
                val cachedInputTokens = preferences[getTokenCachedInputKey(providerModel)] ?: 0
                result[providerModel] = Triple(inputTokens, outputTokens, cachedInputTokens)
            }
        }
        result
    }
```

---

## 模型定价与计费

### 计费模式

系统为每个提供商:模型支持两种计费模式：
计费模式存储说明`TOKEN`按 token 计价(输入、缓存输入、输出)基于 token 的定价，每百万 token(美元)`REQUEST`按请求计价每次请求固定费用(人民币)

```
enum class BillingMode {
    TOKEN,
    REQUEST;

    companion object {
        fun fromString(value: String?): BillingMode {
            return when (value?.uppercase()) {
                "REQUEST" -> REQUEST
                else -> TOKEN
            }
        }
    }
}
```

### 定价管理

**基于 Token 的定价(美元/百万 token)：**

```
suspend fun getModelInputPrice(providerModel: String): Double
suspend fun getModelCachedInputPrice(providerModel: String): Double
suspend fun getModelOutputPrice(providerModel: String): Double
Â 
suspend fun setModelInputPrice(providerModel: String, price: Double)
suspend fun setModelCachedInputPrice(providerModel: String, price: Double)
suspend fun setModelOutputPrice(providerModel: String, price: Double)
```

**基于请求的定价(人民币/请求)：**

```
suspend fun getPricePerRequestForProviderModel(providerModel: String): Double
suspend fun setPricePerRequestForProviderModel(providerModel: String, price: Double)
```

**汇率：**

```
val USD_TO_CNY_EXCHANGE_RATE = floatPreferencesKey("usd_to_cny_exchange_rate")
suspend fun getUsdToCnyExchangeRate(): Double // Default: 7.2
suspend fun setUsdToCnyExchangeRate(rate: Double)
```

---

## 数据流模式

### 响应式读取模式

Preferences 暴露 `Flow<T>` 属性，当值发生变化时自动发出更新：

```
"Persistent Storage"
"apiDataStore"
"enableToolsFlow"
"UI Component"
"Persistent Storage"
"apiDataStore"
"enableToolsFlow"
"UI Component"
User changes setting
collectAsState()
data.map { ... }
Read preference
Preference value
Boolean value
State update
edit { ... }
Write preference
Emit new value
Automatic recomposition
```

**UI 中的使用示例：**

```
@Composable
fun SettingsScreen() {
    val apiPreferences = remember { ApiPreferences.getInstance(context) }
    val enableTools = apiPreferences.enableToolsFlow
        .collectAsState(initial = ApiPreferences.DEFAULT_ENABLE_TOOLS).value

    Switch(
        checked = enableTools,
        onCheckedChange = { scope.launch {
            apiPreferences.saveEnableTools(it)
        }}
    )
}
```

### 写入模式

所有写入操作都是使用 `DataStore.edit` 的挂起函数：

```
suspend fun saveEnableTools(isEnabled: Boolean) {
    context.apiDataStore.edit { preferences ->
        preferences[ENABLE_TOOLS] = isEnabled
    }
}
```

此模式提供：

- **原子性：** 每个编辑操作都是事务性的
- **线程安全：** DataStore 处理并发访问
- **类型安全：** 通过 Preferences.Key 进行编译时类型检查

---

## 复杂数据序列化

### 基于 JSON 的首选项

复杂数据结构使用 kotlinx.serialization 以 JSON 字符串形式存储：

**工具提示可见性映射：**

```
val TOOL_PROMPT_VISIBILITY_JSON = stringPreferencesKey("tool_prompt_visibility_json")
Â 
val toolPromptVisibilityFlow: Flow<Map<String, Boolean>> =
    context.apiDataStore.data.map { preferences ->
        val json = preferences[TOOL_PROMPT_VISIBILITY_JSON]
            ?: DEFAULT_TOOL_PROMPT_VISIBILITY_JSON
        runCatching {
            Json.decodeFromString<Map<String, Boolean>>(json)
        }.getOrElse { emptyMap() }
    }
Â 
suspend fun saveToolPromptVisibilityMap(visibilityMap: Map<String, Boolean>) {
    context.apiDataStore.edit { preferences ->
        preferences[TOOL_PROMPT_VISIBILITY_JSON] = Json.encodeToString(visibilityMap)
    }
}
```

**SAF 书签：**

```
@Serializable
data class SafBookmark(
    val uri: String,
    val name: String
)
Â 
suspend fun addSafBookmark(uri: String, name: String) {
    context.apiDataStore.edit { preferences ->
        val existing = runCatching {
            val json = preferences[SAF_BOOKMARKS_JSON] ?: "[]"
            Json.decodeFromString<List<SafBookmark>>(json)
        }.getOrElse { emptyList() }

        val updated = (existing.filterNot { it.uri == uri } +
                       SafBookmark(uri = uri, name = name))
            .sortedBy { it.name.lowercase() }
        preferences[SAF_BOOKMARKS_JSON] = Json.encodeToString(updated)
    }
}
```

---

## 专用偏好设置管理器

### EnvPreferences

管理工具包的环境变量，支持外部工具和 MCP 插件的运行时配置。

**使用模式：**

```
val envPreferences = EnvPreferences.getInstance(context)
Â 
// Package declares: env: [{ name: "GITHUB_TOKEN", required: true }]
val token = envPreferences.getEnv("GITHUB_TOKEN")
envPreferences.setEnv("GITHUB_TOKEN", "ghp_xxxx")
```

### DisplayPreferencesManager

控制 UI 显示功能，如 FPS 计数器和视觉效果。

```
val displayPreferencesManager = DisplayPreferencesManager.getInstance(context)
val showFpsCounter = displayPreferencesManager.showFpsCounter
    .collectAsState(initial = false).value
```

### GitHubAuthPreferences

管理 GitHub 集成的 OAuth 认证状态。

**主要功能：**

- 安全存储访问令牌
- 跟踪用户信息
- 管理登录状态
- 生成 OAuth URL

```
val githubAuth = GitHubAuthPreferences.getInstance(context)
val isLoggedIn = githubAuth.isLoggedInFlow.collectAsState(initial = false).value
val userInfo = githubAuth.userInfoFlow.collectAsState(initial = null).value
Â 
if (!isLoggedIn) {
    val authUrl = githubAuth.getAuthorizationUrl()
    // Open browser for OAuth flow
}
```

### SkillVisibilityPreferences

管理工具系统中每个技能的可见性，允许用户在 AI 工具选择中隐藏特定技能。

---

## 设置界面集成

SettingsScreen 展示了全面的偏好设置使用：

```
Settings Sections

Preference Managers

SettingsScreen

ApiPreferences

UserPreferencesManager

GitHubAuthPreferences

Account Section
GitHub login state

Personalization
User preferences, Language, Theme

AI Model Config
Model params, Functional config

Prompt Config
System prompts, Character cards

Context & Summary
Truncation settings

Data & Permissions
Tool permissions, Backups, Token stats
```

**滚动状态持久化：**

SettingsScreen 使用模块级可变状态在重组过程中保持滚动位置：

```
private val SettingsScreenScrollPosition = mutableStateOf(0)
Â 
@Composable
fun SettingsScreen(...) {
    val scrollState = rememberScrollState(SettingsScreenScrollPosition.value)

    LaunchedEffect(scrollState) {
        snapshotFlow { scrollState.value }.collect { position ->
            SettingsScreenScrollPosition.value = position
        }
    }
}
```

---

## Provider:Model 键编码

系统使用健壮的编码/解码机制来处理 provider:model 标识符作为偏好设置键：

### 编码算法

1. 将冒号替换为下划线：`DEEPSEEK:deepseek-chat` → `DEEPSEEK_deepseek-chat`
2. 添加统计类型前缀：`token_input_DEEPSEEK_deepseek-chat`

### 解码算法

```
private fun decodeProviderModelFromKeySuffix(encoded: String): String {
    val matchedProvider = providerNameCandidates.firstOrNull {
        encoded == it || encoded.startsWith("${it}_")
    }

    return if (matchedProvider != null) {
        if (encoded.length == matchedProvider.length) {
            matchedProvider
        } else {
            "$matchedProvider:${encoded.substring(matchedProvider.length + 1)}"
        }
    } else {
        encoded.replace("_", ":")
    }
}
```

**Provider 匹配顺序：**
Provider 按长度降序排序以优先匹配最长的，防止歧义(例如 "GEMINI_PRO" 与 "GEMINI")：

```
private val providerNameCandidates =
    ApiProviderType.values().map { it.name }.sortedByDescending { it.length }
```

---

## 重置和管理操作

### Token 统计重置

```
// Reset all models
suspend fun resetAllProviderModelTokenCounts() {
    context.apiDataStore.edit { preferences ->
        val keysToRemove = mutableListOf<Preferences.Key<*>>()
        preferences.asMap().forEach { (key, _) ->
            val keyName = key.name
            if (keyName.startsWith("token_input_") ||
                keyName.startsWith("token_output_") ||
                keyName.startsWith("token_cached_input_") ||
                keyName.startsWith("request_count_")) {
                keysToRemove.add(key)
            }
        }
        keysToRemove.forEach { key -> preferences.remove(key) }
    }
}
Â 
// Reset specific model
suspend fun resetProviderModelTokenCounts(providerModel: String) {
    context.apiDataStore.edit { preferences ->
        preferences[getTokenInputKey(providerModel)] = 0
        preferences[getTokenCachedInputKey(providerModel)] = 0
        preferences[getTokenOutputKey(providerModel)] = 0
        preferences[getRequestCountKey(providerModel)] = 0
    }
}
```

### 截断设置重置

```
suspend fun resetTruncationSettings() {
    context.apiDataStore.edit { preferences ->
        preferences[MAX_FILE_SIZE_BYTES] = DEFAULT_MAX_FILE_SIZE_BYTES
        preferences[PART_SIZE] = DEFAULT_PART_SIZE
        preferences[MAX_TEXT_RESULT_LENGTH] = DEFAULT_MAX_TEXT_RESULT_LENGTH
        preferences[MAX_IMAGE_HISTORY_USER_TURNS] = DEFAULT_MAX_IMAGE_HISTORY_USER_TURNS
        preferences[MAX_MEDIA_HISTORY_USER_TURNS] = DEFAULT_MAX_MEDIA_HISTORY_USER_TURNS
    }
}
```

---

## 线程安全与并发

### DataStore 保证

- **单一写入者：** DataStore 确保同一时间只有一个写入操作
- **原子操作：** 每个 `edit` 块都是原子性和事务性的
- **线程安全读取：** 多个读取者可以并发访问数据
- **Flow 更新：** 订阅者以线程安全的方式接收更新

### 单例线程安全

双重检查锁定模式确保线程安全的单例初始化：

```
@Volatile
private var INSTANCE: ApiPreferences? = null
Â 
fun getInstance(context: Context): ApiPreferences {
    return INSTANCE ?: synchronized(this) {
        INSTANCE ?: ApiPreferences(context.applicationContext).also {
            INSTANCE = it
        }
    }
}
```

**`@Volatile` 确保：**

- 跨线程可见性
- 防止指令重排序

**`synchronized` 块确保：**

- 只有一个线程可以初始化
- 不会创建重复实例

---

## 默认值

所有偏好设置都定义了编译时常量作为默认值，确保在未设置偏好时具有可预测的行为：
类别默认常量AI 规划`DEFAULT_ENABLE_AI_PLANNING = false`屏幕`DEFAULT_KEEP_SCREEN_ON = true`思考模式`DEFAULT_ENABLE_THINKING_MODE = false`记忆`DEFAULT_ENABLE_MEMORY_QUERY = true`工具`DEFAULT_ENABLE_TOOLS = true`流式输出`DEFAULT_DISABLE_STREAM_OUTPUT = false`截断`DEFAULT_MAX_FILE_SIZE_BYTES = 32000`

---

## 与工具系统的集成

偏好设置系统通过 `TOOL_PROMPT_VISIBILITY_JSON` 与工具生态系统深度集成，该配置控制各个工具是否向用户显示其提示信息：

```
val toolPromptVisibilityFlow: Flow<Map<String, Boolean>>
Â 
suspend fun saveToolPromptVisibility(toolName: String, isVisible: Boolean) {
    context.apiDataStore.edit { preferences ->
        val currentMap = runCatching {
            val json = preferences[TOOL_PROMPT_VISIBILITY_JSON] ?: "{}"
            Json.decodeFromString<Map<String, Boolean>>(json)
        }.getOrElse { emptyMap() }
        preferences[TOOL_PROMPT_VISIBILITY_JSON] =
            Json.encodeToString(currentMap + (toolName to isVisible))
    }
}
Â 
suspend fun getToolPromptVisibilityMap(): Map<String, Boolean> {
    val preferences = context.apiDataStore.data.first()
    val json = preferences[TOOL_PROMPT_VISIBILITY_JSON] ?: "{}"
    return runCatching {
        Json.decodeFromString<Map<String, Boolean>>(json)
    }.getOrElse { emptyMap() }
}
```

---

## 总结

偏好设置系统提供了一个全面、类型安全且响应式的应用状态管理解决方案。关键架构原则包括：

1. **单例模式：** 跨应用的线程安全实例管理
2. **响应式设计：** 基于 Flow 的 API 实现自动 UI 更新
3. **类型安全：** 编译时检查的偏好设置键和值
4. **领域分离：** 针对不同偏好设置域的专用管理器
5. **结构化存储：** 为复杂数据关系动态生成键
6. **JSON 序列化：** 复杂对象以结构化字符串形式存储
7. **原子操作：** 通过 DataStore 实现事务性写入
8. **默认值：** 使用编译时常量实现可预测的行为

该系统支持从简单的布尔标志到复杂的按模型计费和定价的广泛用例，同时保持一致且易于使用的 API。

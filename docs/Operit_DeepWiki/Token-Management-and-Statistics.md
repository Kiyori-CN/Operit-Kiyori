# Token 管理与统计

本文档描述了 Operit 的令牌管理和统计系统，该系统跟踪 API 使用情况、计算成本，并在所有 AI 服务提供商之间持久化使用数据。该系统使用户能够监控每个提供商:模型组合的 API 消耗、了解成本并管理不同定价模型的计费。

有关模型配置和选择的信息，请参阅 [Model Configuration](/AAswordman/Operit/2.3-model-configuration)。有关 AI 服务如何编排的详细信息，请参阅 [Enhanced AI Service](/AAswordman/Operit/2.1-enhanced-ai-service)。

---

## 目的和范围

令牌管理系统提供：

- **按提供商:模型的令牌跟踪**：为每个提供商:模型组合单独统计(例如 "DEEPSEEK:deepseek-chat"、"OPENAI:gpt-4o")
- **细粒度令牌计数**：独立跟踪输入令牌、缓存输入令牌和输出令牌
- **成本计算**：支持按百万令牌定价和按请求定价模型
- **请求计数**：跟踪对每个提供商:模型发出的 API 调用次数
- **持久化统计**：所有使用数据通过 DataStore 在应用重启后持久保存
- **响应式数据访问**：基于 Flow 的 API 用于实时 UI 更新

---

## 架构概览

```
Auto-Summarization

Persistence Layer

Token Tracking

Delegate Layer

Service Layer

sendMessage()

generateSummary()

updates

per-request

accumulates

updates after response

updateTokensForProviderModel()

incrementRequestCountForProviderModel()

updateTokensForProviderModel()

incrementRequestCountForProviderModel()

observes

maintains cumulative

persists per chat

checks threshold

exceeded

triggers

stores global stats

saveCurrentChat()

integrates

integrates

integrates

integrates

EnhancedAIService

ConversationService

ChatServiceCore

AIService
(Provider Implementation)

TokenStatisticsDelegate

MessageCoordinationDelegate

MessageProcessingDelegate

ChatHistoryDelegate

_perRequestTokenCounts
StateFlow?>

Cumulative Counters
accumulatedInputTokenCount
accumulatedOutputTokenCount

AIService Counters
inputTokenCount
cachedInputTokenCount
outputTokenCount

ApiPreferences

DataStore
(api_settings)

AppDatabase
ChatEntity.inputTokens
ChatEntity.outputTokens
ChatEntity.currentWindowSize

Token Threshold Check
tokenUsageThreshold

onTokenLimitExceeded()
```

**图 1：令牌管理架构**

此图展示了完整的令牌管理流程，包括按请求跟踪、累积统计、持久化到 DataStore(全局)和 Room 数据库(按聊天)以及自动汇总触发器。

---

## Token 存储模型

### 提供商:模型标识符格式

Token 使用复合键格式进行跟踪：`"PROVIDER:modelName"`。示例：

- `"DEEPSEEK:deepseek-chat"`
- `"OPENAI:gpt-4o"`
- `"ANTHROPIC:claude-3-opus-20240229"`
- `"GOOGLE:gemini-2.0-flash"`

这种格式允许系统为提供商内的每个模型维护单独的统计信息，这一点至关重要，因为不同模型具有不同的定价层级。

### DataStore 键

对于每个提供商:模型组合，系统维护五个主要键：
键类型键格式数据类型用途输入令牌数`token_input_PROVIDER_MODEL`Int消耗的总输入令牌数缓存输入令牌数`token_cached_input_PROVIDER_MODEL`Int缓存的输入令牌数(提示词缓存)输出令牌数`token_output_PROVIDER_MODEL`Int生成的总输出令牌数请求次数`request_count_PROVIDER_MODEL`IntAPI 请求次数输入价格`model_input_price_PROVIDER_MODEL`Float每百万输入令牌价格(美元)缓存输入价格`model_cached_input_price_PROVIDER_MODEL`Float每百万缓存输入令牌价格(美元)输出价格`model_output_price_PROVIDER_MODEL`Float每百万输出令牌价格(美元)计费模式`billing_mode_PROVIDER_MODEL`String"TOKEN" 或 "REQUEST"单次请求价格`price_per_request_PROVIDER_MODEL`Float每次请求价格(人民币)
注意：键名中的下划线是通过将 provider:model 字符串中的冒号替换为下划线来创建的，以兼容 DataStore。

---

## 令牌追踪流程

### 双层令牌追踪

Operit 实现了双层令牌追踪系统：

1. **单次请求追踪**：通过 `_perRequestTokenCounts` StateFlow 追踪当前 API 请求的令牌
2. **累积追踪**：维护当前对话轮次的运行总计
3. **全局持久化**：在 DataStore 中存储每个 provider:model 的生命周期统计数据
4. **单次对话持久化**：在 Room 数据库中保存特定对话的总计

### 序列图：聊天请求中的令牌追踪

```
DataStore
AppDatabase
ApiPreferences
TokenStatisticsDelegate
AIService Provider
EnhancedAIService
MessageProcessingDelegate
User
DataStore
AppDatabase
ApiPreferences
TokenStatisticsDelegate
AIService Provider
EnhancedAIService
MessageProcessingDelegate
User
Executes API call
Streams response
Observes _perRequestTokenCounts via Flow
sendUserMessage()
sendMessage()
Clear _perRequestTokenCounts
sendMessage()
(with modelParameters)
Updates counters during stream:
inputTokenCount
cachedInputTokenCount
outputTokenCount
onTokensUpdated(input, cachedInput, output)
_perRequestTokenCounts.value = Pair(input, output)
Update cumulative counters
accumulatedInputTokenCount += input
accumulatedOutputTokenCount += output
Response stream complete
Read final token counts
Accumulate to conversation total
updateTokensForProviderModel(
providerModel,
inputTokens,
outputTokens,
cachedInputTokens)
Edit preferences
Increment token_input_*
Increment token_cached_input_*
Increment token_output_*
incrementRequestCountForProviderModel(providerModel)
Increment request_count_*
onTurnComplete()
Get cumulative totals
Update ChatEntity
(inputTokens, outputTokens,
currentWindowSize)
```

**图 2：令牌追踪序列**

此图展示了从 API 调用经过两层追踪到双重持久化(DataStore 用于全局统计，Room 数据库用于单次对话统计)的完整流程。

### 关键实现要点

#### 1. EnhancedAIService 中的单次请求令牌更新

在流式传输期间，`EnhancedAIService` 通过回调接收实时令牌更新：

```
[EnhancedAIService.kt:546-549]

```

`onTokensUpdated` 回调：

- 在 API 调用期间/之后由 AIService 提供者调用
- 使用当前请求的令牌使用情况更新 `_perRequestTokenCounts` StateFlow
- 支持实时 UI 更新(例如，显示当前消息消耗的令牌数)
- Flow 由 `TokenStatisticsDelegate` 观察以进行累积跟踪

#### 2. 响应后的令牌持久化

流完成后，令牌会持久化到全局和单个聊天存储中：

```
[EnhancedAIService.kt:604-612]

```

持久化过程：

1. 从 AIService 读取最终的 `inputTokenCount`、`cachedInputTokenCount`、`outputTokenCount`
2. 累加到对话轮次总计(`accumulatedInputTokenCount`、`accumulatedOutputTokenCount`)
3. 使用 `updateTokensForProviderModel()` 持久化到 ApiPreferences(全局生命周期统计)
4. 使用 `incrementRequestCountForProviderModel()` 增加请求计数
5. 委托给 `TokenStatisticsDelegate` 将单个聊天总计保存到 Room 数据库

#### 3. 摘要生成中的 Token 计数

对话摘要同样会消耗 token，追踪方式相同：

```
[ConversationService.kt:191-203]

```

摘要生成流程：

1. 使用 SUMMARY 函数类型选择合适的模型
2. 通过 `summaryService.sendMessage()` 生成摘要
3. 从摘要服务中提取 token 计数
4. 将 token 持久化到与常规对话相同的 provider:model 键
5. 增加请求计数以实现准确计费

---

## 自动摘要

### Token 阈值管理

Operit 在 token 使用量接近上下文窗口限制时实现自动对话摘要。这可以防止上下文溢出并保持对话连续性。

### 摘要触发逻辑

```
ratio >= threshold

ratio < threshold

User sends message

MessageCoordinationDelegate
checks shouldGenerateSummary()

Calculate: currentTokens / maxTokens

Compare ratio to tokenUsageThreshold

Trigger: onTokenLimitExceeded()

Generate summary via
ConversationService

Replace old messages
with summary message

Continue with user message
```

**图 3：自动摘要流程**

### 实现细节

摘要检查在 `MessageCoordinationDelegate` 中于发送每条消息前执行：

```
[MessageCoordinationDelegate.kt:186-199]

```

关键参数：

- **`currentTokens`**：当前对话窗口中的总 token 数(来自 `TokenStatisticsDelegate.currentWindowSizeFlow`)
- **`maxTokens`**：模型的上下文长度(来自 `contextLength` 偏好设置，乘以 1024)
- **`tokenUsageThreshold`**：比率阈值(默认：0.8，可通过 `summaryTokenThreshold` 偏好设置配置)
- **`enableSummary`**：自动摘要的全局开关

公式：

```
shouldSummarize = (currentTokens.toDouble() / maxTokens.toDouble()) >= tokenUsageThreshold
```

当超过阈值时，会调用 `onTokenLimitExceeded()`，进而触发 `MessageCoordinationDelegate.handleTokenLimitExceeded()`：

```
[MessageCoordinationDelegate.kt:250-300]

```

该方法：

1. 显示正在进行摘要的 UI 反馈
2. 调用 `AIMessageManager.generateAndReplaceSummary()`
3. 用单条摘要消息替换聊天历史中的旧消息
4. 重置 token 计数以反映压缩后的上下文
5. 允许原始用户消息使用压缩后的历史继续处理

### 摘要 Token 计费

摘要本身会消耗 token，这些 token 会单独跟踪：

```
[ConversationService.kt:191-203]

```

摘要的 token 成本：

- 添加到 DataStore 中的全局 provider:model 统计数据
- 计入计费用途的请求计数
- 记录日志用于调试和成本分析

---

## 费用计算

### 计费模式

Operit 支持两种计费模型，按提供商:模型配置：

```
REQUEST Billing

Request Count × Price Per Request

Total Cost

TOKEN Billing

Input Tokens × Input Price

Total Cost

Cached Input Tokens × Cached Price

Output Tokens × Output Price
```

**图表 3：计费模型**

#### 基于 TOKEN 的计费

大多数提供商基于 token 消耗收费。价格以每百万 token 的美元计价：

```
data class TokenPricing(
    val inputPricePerMillion: Double,     // e.g., 0.14 for DeepSeek
    val cachedInputPricePerMillion: Double, // e.g., 0.014 for cached tokens
    val outputPricePerMillion: Double     // e.g., 0.28 for DeepSeek
)
```

**费用公式：**

```
cost_usd = (inputTokens / 1_000_000 × inputPrice) +
           (cachedInputTokens / 1_000_000 × cachedInputPrice) +
           (outputTokens / 1_000_000 × outputPrice)

```

#### 基于 REQUEST 的计费

某些提供商或本地模型按 API 调用次数收费：

```
data class RequestPricing(
    val pricePerRequest: Double  // in CNY (¥)
)
```

**费用公式：**

```
cost_cny = requestCount × pricePerRequest

```

### 定价配置 API

```
[ApiPreferences.kt:459-496]

```

关键方法：

- `getModelInputPrice(providerModel: String): Double` - 获取输入 token 价格
- `getModelCachedInputPrice(providerModel: String): Double` - 获取缓存输入 token 价格
- `getModelOutputPrice(providerModel: String): Double` - 获取输出 token 价格
- `setModelInputPrice(providerModel: String, price: Double)` - 设置输入 token 价格
- `setModelCachedInputPrice(providerModel: String, price: Double)` - 设置缓存输入 token 价格
- `setModelOutputPrice(providerModel: String, price: Double)` - 设置输出 token 价格
- `getBillingModeForProviderModel(providerModel: String): BillingMode` - 获取计费模式
- `setBillingModeForProviderModel(providerModel: String, mode: BillingMode)` - 设置计费模式
- `getPricePerRequestForProviderModel(providerModel: String): Double` - 获取每次请求价格
- `setPricePerRequestForProviderModel(providerModel: String, price: Double)` - 设置每次请求价格(人民币)

---

## TokenStatisticsDelegate

### 目的

`TokenStatisticsDelegate` 管理每个聊天的 token 统计信息，并与更广泛的 token 管理系统集成。它在全局提供商:模型统计信息(位于 `ApiPreferences` 中)和每个聊天的统计信息(位于 Room 数据库中)之间架起桥梁。

### 架构

```
Data Consumers

Data Sources

TokenStatisticsDelegate

observes

accumulates

exposes via Flow

exposes via Flow

on chat switch

loads tokens

on turn complete

_activeChatId: StateFlow

Cumulative Counters
_cumulativeInputTokens
_cumulativeOutputTokens

_currentWindowSize
Estimated context tokens

Per-request tracking
via EnhancedAIService

EnhancedAIService
perRequestTokenCounts

AppDatabase
ChatEntity

UI Components
(displays token usage)

MessageCoordinationDelegate
(summarization checks)
```

**图 4：TokenStatisticsDelegate 架构**

### 核心职责

1. **每个聊天的 Token 跟踪**：维护当前聊天的累计输入/输出 token 计数
2. **上下文窗口估算**：跟踪 `currentWindowSize`，即对话上下文中 token 数量的估算值
3. **聊天切换**：在聊天之间切换时加载/保存 token 统计信息
4. **轮次完成**：在每次 AI 响应后将 token 统计信息持久化到数据库
5. **UI 更新**：暴露响应式 Flow 以实现实时 token 显示

### 状态流

Flow类型用途`cumulativeInputTokensFlow``StateFlow<Int>`当前聊天的总输入 token`cumulativeOutputTokensFlow``StateFlow<Int>`当前聊天的总输出 token`currentWindowSizeFlow``StateFlow<Int>`对话上下文中的估算 token 数`perRequestTokenCountsFlow``StateFlow<Pair<Int,Int>?>`当前请求的 token(输入、输出)

### 与 ChatServiceCore 的集成

`TokenStatisticsDelegate` 由 `ChatServiceCore` 实例化和管理：

```
[ChatServiceCore.kt:84-88]

```

该委托与其他委托集成：

- **ChatHistoryDelegate**：提供聊天切换通知和聊天元数据
- **MessageCoordinationDelegate**：使用 `currentWindowSizeFlow` 进行摘要检查
- **MessageProcessingDelegate**：接收轮次完成通知

---

## 数据访问模式

### 更新 Token 计数

更新 token 统计信息的主要方法是 `updateTokensForProviderModel()`：

```
[ApiPreferences.kt:310-329]

```

该方法：

1. 从 DataStore 检索当前 token 计数
2. 将新的 token 计数添加到现有值(累加)
3. 原子性地持久化更新后的总计

**重要**：这是一个**累加**操作。每次调用会增加现有计数，而不是替换它们。

### 读取 Token 统计

#### 单个 Provider:Model

```
// Get tokens for a specific provider:model
val inputTokens = apiPreferences.getInputTokensForProviderModel("DEEPSEEK:deepseek-chat")
val cachedTokens = apiPreferences.getCachedInputTokensForProviderModel("DEEPSEEK:deepseek-chat")
val outputTokens = apiPreferences.getOutputTokensForProviderModel("DEEPSEEK:deepseek-chat")
```

#### 所有 Provider:Models

```
// Get all token statistics as a map
val allTokens: Map<String, Triple<Int, Int, Int>> =
    apiPreferences.getAllProviderModelTokens()
// Map keys are "PROVIDER:model", values are Triple(inputTokens, outputTokens, cachedTokens)
```

#### 基于响应式 Flow 的访问

对于需要实时更新的 UI 组件：

```
// Collect token statistics as a Flow
apiPreferences.allProviderModelTokensFlow.collectAsState(initial = emptyMap())
```

此 Flow 会在 DataStore 中的 token 计数发生变化时自动发出新值，从而实现响应式 UI 更新。

---

## 请求统计

### 请求计数

除了令牌计数外，系统还跟踪 API 请求的数量：

```
[ApiPreferences.kt:504-520]

```

请求计数器在每次成功的 API 调用后递增，无论消耗了多少 token。这对于以下方面至关重要：

1. 基于请求的计费计算
2. 了解 API 使用模式
3. 速率限制监控

### 请求计数访问

```
// Get request count for a specific provider:model
val requestCount = apiPreferences.getRequestCountForProviderModel("OPENAI:gpt-4o")
 
// Get all request counts
val allRequestCounts: Map<String, Int> = apiPreferences.getAllProviderModelRequestCounts()
```

---

## 数据持久化架构

```
DataStore

ApiPreferences Singleton

Application Layer

Stored Keys

Flow API

Query Methods

Update Methods

EnhancedAIService

ConversationService

ApiPreferences
getInstance(context)

updateTokensForProviderModel()

incrementRequestCountForProviderModel()

setModelInputPrice()
setModelOutputPrice()

getInputTokensForProviderModel()
getOutputTokensForProviderModel()

getAllProviderModelTokens()

getRequestCountForProviderModel()

allProviderModelTokensFlow

Preferences DataStore
(api_settings)

token_input_*
token_cached_input_*
token_output_*

request_count_*

model_input_price_*
model_output_price_*
billing_mode_*
price_per_request_*
```

**图 4：数据持久化层**

### DataStore 配置

ApiPreferences 使用 Android Jetpack DataStore 进行持久化存储：

```
[ApiPreferences.kt:25-26]

```

DataStore 在模块级别创建，名称为 "api_settings"，确保：

- **类型安全访问**：偏好设置键是强类型的
- **异步 I/O**：所有操作都是挂起函数
- **事务性更新**：原子性读-修改-写操作
- **响应式流**：通过 Flow API 自动更新 UI

### 键生成

为确保 DataStore 兼容性，provider:model 字符串在键生成时会被转换：

```
// Example: "DEEPSEEK:deepseek-chat" becomes "token_input_DEEPSEEK_deepseek-chat"
fun getTokenInputKey(providerModel: String) =
    intPreferencesKey("token_input_${providerModel.replace(":", "_")}")
```

此转换将冒号替换为下划线，以创建有效的 DataStore 键名称。

---

## Token 统计管理

### 重置统计

系统提供对统计重置的精细控制：

#### 重置特定 Provider:Model

```
apiPreferences.resetProviderModelTokenCounts("DEEPSEEK:deepseek-chat")
```

这会将单个 provider:model 的所有 token 计数和请求计数重置为零。

#### 重置所有统计

```
apiPreferences.resetAllProviderModelTokenCounts()
```

这会遍历所有存储的键，并删除以 "token*input*"、"token*output*"、"token*cached_input*" 或 "request*count*" 开头的键，从而有效清除所有使用统计。

---

## UI 集成

### Token 使用统计屏幕

系统提供了一个专用屏幕用于查看 token 统计信息：

```
[OperitScreens.kt:57]

```

可以从以下位置导航到此屏幕：

1. 设置屏幕
2. 聊天设置菜单
3. 模型配置屏幕

该屏幕显示：

- **按提供商:模型分类**：列出所有提供商:模型组合及其使用情况
- **Token 计数**：分别显示输入、缓存输入和输出 token
- **请求计数**：已发起的 API 调用次数
- **成本估算**：基于配置的定价计算
- **计费模式指示器**：显示每个模型使用 TOKEN 还是 REQUEST 计费
- **重置控制**：能够重置单个或所有统计数据

### 设置集成

Token 统计信息也可在各种设置界面中查看：

```
[SettingsScreen.kt:249-254]

```

设置提供：

- 快速访问 token 使用统计
- 配置定价参数
- 按 provider:model 选择计费模式

---

## 汇总表：关键 API 方法

方法用途参数返回类型`updateTokensForProviderModel()`为 provider:model 添加 token 统计`providerModel`, `inputTokens`, `outputTokens`, `cachedInputTokens``suspend Unit``getInputTokensForProviderModel()`获取输入 token 数量`providerModel``suspend Int``getCachedInputTokensForProviderModel()`获取缓存输入 token 数量`providerModel``suspend Int``getOutputTokensForProviderModel()`获取输出 token 数量`providerModel``suspend Int``getAllProviderModelTokens()`获取所有 token 统计无`suspend Map<String, Triple<Int, Int, Int>>``allProviderModelTokensFlow`响应式 token 统计无`Flow<Map<String, Triple<Int, Int, Int>>>``incrementRequestCountForProviderModel()`增加请求计数`providerModel``suspend Unit``getRequestCountForProviderModel()`获取请求计数`providerModel``suspend Int``getAllProviderModelRequestCounts()`获取所有请求计数无`suspend Map<String, Int>``getModelInputPrice()`获取输入 token 价格`providerModel``suspend Double``setModelInputPrice()`设置输入 token 价格`providerModel`, `price``suspend Unit``getBillingModeForProviderModel()`获取计费模式`providerModel``suspend BillingMode``setBillingModeForProviderModel()`设置计费模式`providerModel`, `mode``suspend Unit``resetProviderModelTokenCounts()`重置特定统计`providerModel``suspend Unit``resetAllProviderModelTokenCounts()`重置所有统计无`suspend Unit`

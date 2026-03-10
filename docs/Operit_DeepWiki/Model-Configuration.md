# 模型配置

## 目的与范围

本文档描述了 Operit AI 中的模型配置系统，该系统管理 AI 模型设置、API 凭证和特定提供商的参数。该系统使用户能够创建多个模型配置并将其分配给不同的应用程序功能。

有关如何使用这些配置来实例化 AI 服务的信息，请参阅 [AI Service Providers](/AAswordman/Operit/2.2-ai-service-providers)。有关增强这些配置的功能特定系统提示的详细信息，请参阅 [System Prompts and Context](/AAswordman/Operit/2.4-system-prompts-and-context)。有关功能与配置之间的映射，请参阅 [Conversation Management](/AAswordman/Operit/2.5-conversation-management)。

---

## 模型配置数据结构

### ModelConfigData 概述

`ModelConfigData` 类表示一个完整的模型配置，包含 API 凭证、模型参数、上下文设置和特定提供商的选项。

**核心配置结构**

```
ModelConfigData

+String id

+String name

+String apiKey

+String apiEndpoint

+String modelName

+ApiProviderType apiProviderType

+Boolean hasCustomParameters

+Int maxTokens

+Float temperature

+Float topP

+Float contextLength

+Boolean enableToolCall

+Boolean enableDirectImageProcessing

«enumeration»

ApiProviderType

OPENAI

OPENAI_GENERIC

ANTHROPIC

GOOGLE

GEMINI_GENERIC

DEEPSEEK

ALIYUN

MNN

OTHER

ModelConfigManager

+Flow<List<String>> configListFlow

+getModelConfigFlow(configId)

+createConfig(name)

+updateModelConfig()

+deleteConfig(configId)

FunctionalConfigManager

+Flow<Map> functionConfigMappingFlow

+setConfigForFunction()

+getConfigIdForFunction()
```

### API 提供商类型

系统通过 `ApiProviderType` 枚举支持多个 AI 服务提供商：
提供商类型描述端点格式`OPENAI`官方 OpenAI API`https://api.openai.com/v1/chat/completions``OPENAI_GENERIC`OpenAI 兼容端点自定义端点`ANTHROPIC`Anthropic Claude API`https://api.anthropic.com/v1/messages``GOOGLE`Google Gemini 官方`https://generativelanguage.googleapis.com/v1beta/models``GEMINI_GENERIC`Gemini 兼容端点自定义端点`DEEPSEEK`DeepSeek API`https://api.deepseek.com/v1/chat/completions``ALIYUN`阿里巴巴通义千问`https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions``MNN`本地 MNN 推理不适用(本地)`BAIDU`、`XUNFEI`、`ZHIPU`中国提供商各种端点`OTHER`通用自定义提供商自定义端点
**默认配置值**

```
// Default values from ModelConfigDefaults
const val DEFAULT_CONTEXT_LENGTH = 48.0f  // 48K tokens
const val DEFAULT_MAX_CONTEXT_LENGTH = 128.0f  // 128K tokens
const val DEFAULT_ENABLE_MAX_CONTEXT_MODE = false
const val DEFAULT_SUMMARY_TOKEN_THRESHOLD = 0.70f  // 70% threshold
```

---

## 模型配置管理器

### ModelConfigManager 类

`ModelConfigManager` 类使用 Android DataStore 提供模型配置的持久化存储和检索。每个配置都以 JSON 序列化的 `ModelConfigData` 对象形式存储。

**配置管理流程**

```
ModelConfigScreen

ModelConfigManager

DataStore<Preferences>
model_configs

Json Serializer
ignoreUnknownKeys = true

CONFIG_LIST_KEY
List of config IDs

config_default
ModelConfigData JSON

config_{uuid}
ModelConfigData JSON

configListFlow
Flow<List<String>>

getModelConfigFlow(id)
Flow<ModelConfigData>

UI observes list

AI Service reads config
```

### 核心操作

**配置初始化**

管理器确保首次启动时至少存在一个默认配置：

```
suspend fun initializeIfNeeded() {
    val configList = configListFlow.first()
    if (configList.isEmpty()) {
        val defaultConfig = createFreshDefaultConfig()
        saveConfigToDataStore(defaultConfig)
        context.modelConfigDataStore.edit { preferences ->
            preferences[CONFIG_LIST_KEY] = json.encodeToString(listOf(DEFAULT_CONFIG_ID))
        }
    }
}
```

**创建新配置**

用户可以创建多个具有不同 API 提供商和设置的配置。每个配置都会获得一个唯一的 UUID 标识符。

**更新配置**

管理器为不同的配置方面提供了多种更新方法：
方法用途`updateModelConfig()`更新 API 凭证和模型名称`updateParameters()`更新模型参数(温度等)`updateContextSettings()`更新上下文长度设置`updateSummarySettings()`更新对话摘要设置`updateDirectImageProcessing()`切换视觉能力`updateToolCall()`切换原生工具调用支持

---

## 模型参数系统

### 标准参数

系统通过 `StandardModelParameters` 定义了七个标准模型参数：

**标准参数定义**

```
ModelParameter<T>

+String id

+String name

+String apiName

+String description

+T defaultValue

+T currentValue

+Boolean isEnabled

+ParameterValueType valueType

+T? minValue

+T? maxValue

+ParameterCategory category

+Boolean isCustom

«enumeration»

ParameterValueType

INT

FLOAT

STRING

BOOLEAN

OBJECT

«enumeration»

ParameterCategory

OUTPUT_LENGTH

CREATIVITY

SAMPLING

PENALTY

CUSTOM
```

**标准参数表**
参数 IDAPI 名称类型默认值范围类别`max_tokens``max_tokens`Int40961-128000OUTPUT_LENGTH`temperature``temperature`Float1.00.0-2.0CREATIVITY`top_p``top_p`Float1.00.0-1.0SAMPLING`top_k``top_k`Int00-100SAMPLING`presence_penalty``presence_penalty`Float0.0-2.0-2.0PENALTY`frequency_penalty``frequency_penalty`Float0.0-2.0-2.0PENALTY`repetition_penalty``repetition_penalty`Float1.00.0-2.0PENALTY

### 自定义参数

用户可以为特定提供商设置定义自定义参数。自定义参数会被序列化为 JSON 并存储在 `customParameters` 字段中：

自定义参数支持所有值类型(INT、FLOAT、STRING、BOOLEAN、OBJECT)，并在参数加载期间重新构建

---

## 多 API 密钥支持

### 密钥轮换架构

配置系统支持每个配置使用多个 API 密钥，并具有自动轮换策略。

**多密钥配置流程**

```
Yes

No

ModelConfigData

useMultipleApiKeys
= true?

apiKeyPool
List<ApiKeyInfo>

Single apiKey

keyRotationMode

ROUND_ROBIN
Sequential rotation

RANDOM
Random selection

currentKeyIndex
tracking position

MultiApiKeyProvider

SingleApiKeyProvider

AIService instance
```

**密钥轮换模式**

- **ROUND_ROBIN**：密钥按顺序依次使用，最后一个使用后循环回到第一个
- **RANDOM**：每次请求从密钥池中随机选择一个密钥

`MultiApiKeyProvider` 类处理密钥选择，并自动更新配置中的 `currentKeyIndex`

---

## 提供商特定功能

### MNN 本地推理

对于 MNN 提供商，配置存储本地推理设置：
字段用途默认值`mnnForwardType`计算类型(CPU/GPU)0(CPU)`mnnThreadCount`推理线程数4`modelName`模型文件名(自动构建路径)""
模型路径从模型名称自动构建：`/sdcard/Download/mnn_models/{modelName}`

### Google Gemini 特性

Gemini 配置支持 Google 搜索增强：

- `enableGoogleSearch`：在生成过程中启用网络搜索增强

### DeepSeek 推理模式

DeepSeek 配置支持特殊的推理模式：

- `enableDeepseekReasoning`：将 `<think>` 内容作为 `reasoning_content` 发送，而非常规内容

这使得模型能够使用链式思考推理能力

### 直接图像处理

非 MNN 提供商可以启用直接图像处理：

- `enableDirectImageProcessing`：允许直接将图像发送到模型，无需预处理

### 原生工具调用支持

现代模型支持原生工具调用 API：

- `enableToolCall`：使用提供商的原生工具调用接口，而非基于 XML 的工具调用

---

## 配置用户界面

### 模型配置屏幕

`ModelConfigScreen` 提供了用于管理配置的综合用户界面：

**配置屏幕架构**

```
ModelConfigScreen

Configuration Selector
Dropdown

Action Buttons

Add Config
UUID generation

Rename Config

Delete Config
Protect default

Test Connection

Configuration Sections

ModelApiSettingsSection

ModelParametersSection

AdvancedSettingsSection

API Provider Selection

API Endpoint

API Key

Model Name
Comma-separated list

Standard Parameters
7 predefined

Custom Parameters
User-defined

Context Settings

Summary Settings

Multi-Key Configuration
```

### API 设置部分

`ModelApiSettingsSection` 组件处理特定于 API 的配置：

**主要特性：**

1. **提供商选择**：包含所有支持的提供商的下拉菜单
2. **自动端点补全**：`EndpointCompleter` 类自动补全部分 URL：

- `/v1/chat/completions` → 带协议的完整 URL
- 仅域名 → 添加路径组件

3. **区域警告**：检测中国大陆位置并对海外提供商(OpenAI、Claude、Gemini)发出警告
4. **模型列表获取**：查询提供商 API 以获取可用模型
5. **多模型支持**：模型名称可以用逗号分隔以选择多个模型

### 模型参数部分

`ModelParametersSection` 管理模型参数，具有以下功能：

- **基于标签的组织**：按类别(输出长度、创造性、采样、惩罚)对参数进行分组
- **启用/禁用切换**：每个参数可以单独启用或禁用
- **值验证**：通过错误消息强制执行最小/最大约束
- **自定义参数对话框**：允许添加特定于提供商的参数

---

## 功能配置映射

### FunctionalConfigManager

FunctionalConfigManager 将功能类型映射到特定的模型配置，允许不同的应用功能使用不同的 AI 模型。

**功能到配置的映射**

```
ModelConfigData

FunctionConfigMapping

FunctionType Enum

CHAT
Regular conversation

SUMMARY
Conversation summarization

UI_CONTROLLER
UI automation

TRANSLATION
Language translation

IMAGE_RECOGNITION
Image analysis

PROBLEM_LIBRARY
Problem solving

configId: 'default'
modelIndex: 0

configId: 'gpt4-config'
modelIndex: 1

configId: 'ui-specialist'
modelIndex: 0

default
gpt-4o

gpt4-config
gpt-4,gpt-4-turbo

ui-specialist
autoglm
```

**FunctionConfigMapping 结构**

映射包含配置 ID 和模型索引，用于多模型配置：

```
data class FunctionConfigMapping(
    val configId: String = DEFAULT_CONFIG_ID,
    val modelIndex: Int = 0  // Selects model from comma-separated list
)
```

**多模型选择**

当配置的 modelName 包含多个逗号分隔的模型(例如 "gpt-4,gpt-4-turbo,gpt-3.5-turbo")时，modelIndex 字段选择该功能使用哪个具体模型：

- 索引 0 → "gpt-4"
- 索引 1 → "gpt-4-turbo"
- 索引 2 → "gpt-3.5-turbo"

辅助函数确保安全的索引处理：

- `getModelByIndex(modelName, index)`：返回指定索引处的模型
- `getValidModelIndex(modelName, requestedIndex)`：验证索引，如果越界则返回 0
- `getModelList(modelName)`：解析逗号分隔的列表

### 功能配置界面

FunctionalConfigScreen 允许用户为每个功能类型分配配置：

**界面组件：**

1. **功能卡片**：每个功能类型显示：

- 功能名称和描述
- 当前分配的配置
- 当前模型(如果适用，来自多模型列表)
- 测试连接按钮
- 模型选择器(如果配置有多个模型)

2. **配置管理链接**：快速访问模型配置界面
3. **重置按钮**：将所有功能重置为默认配置
4. **服务刷新**：当映射更改时自动刷新 AI 服务实例

---

## 配置持久化

### DataStore 架构

模型配置使用基于偏好设置的方式持久化到 Android DataStore：

**持久化结构**

```
Kotlinx Serialization

ModelConfigManager

DataStore: model_configs

CONFIG_LIST_KEY
['default', 'uuid-1', 'uuid-2']

config_default
JSON string

config_uuid-1
JSON string

config_uuid-2
JSON string

saveConfigToDataStore()
Serializes to JSON

loadConfigFromDataStore()
Deserializes from JSON

getModelConfigFlow(id)
Reactive Flow

Json.encodeToString()

Json.decodeFromString()

UI / Services
Collect changes
```

**响应式流**

所有配置访问使用 Kotlin Flows 进行响应式更新：

- `configListFlow`：发出所有配置 ID 的列表
- `getModelConfigFlow(configId)`：发出特定 ID 的完整配置数据

当配置更新时，所有观察者自动接收新数据

### JSON 序列化

管理器使用 `kotlinx.serialization` 的宽松解析来处理配置演进：

```
private val json = Json {
    ignoreUnknownKeys = true  // Forward compatibility
    isLenient = true           // Tolerate malformed JSON
}
```

这允许：

- **向前兼容**：向 `ModelConfigData` 添加新字段不会破坏现有配置
- **向后兼容**：缺失的字段使用默认值
- **错误恢复**：如果反序列化失败，创建一个全新的默认配置

### 迁移与默认值

**默认配置创建**

首次启动时，系统创建一个默认配置，包含：

- ID："default"
- 名称："默认配置"
- 提供商：DeepSeek
- API 密钥：`ApiPreferences.DEFAULT_API_KEY`
- 端点：`ApiPreferences.DEFAULT_API_ENDPOINT`
- 模型：`ApiPreferences.DEFAULT_MODEL_NAME`

**受保护的操作**

- 默认配置不能被删除
- 配置列表始终至少包含一个条目
- 反序列化失败时回退到创建全新配置

---

## 配置与 AI 服务的集成

### 服务创建流程

当 AI 系统需要处理请求时，遵循以下配置流程：

```
Yes

No

AI Request
FunctionType specified

FunctionalConfigManager

getConfigMappingForFunction()
Returns FunctionConfigMapping

configId: 'uuid'
modelIndex: 1

ModelConfigManager

getModelConfigFlow(configId)
Returns ModelConfigData

getModelByIndex(modelName, modelIndex)
Selects specific model

AIServiceFactory.createService()

useMultipleApiKeys?

MultiApiKeyProvider

SingleApiKeyProvider

Parse customHeaders JSON

Provider-specific
AIService instance

OpenAIProvider
ClaudeProvider
GeminiProvider
MNNProvider
etc.
```

**服务创建代码路径**

1. **功能查找**：`FunctionalConfigManager.getConfigMappingForFunction(functionType)`
2. **配置检索**：`ModelConfigManager.getModelConfig(configId)`
3. **模型选择**：`getModelByIndex(config.modelName, mapping.modelIndex)`
4. **服务工厂**：`AIServiceFactory.createService(config, customHeaders, modelConfigManager, context)`

**提供者选择**

工厂使用 `config.apiProviderType` 上的 when 表达式来实例化正确的提供者类：

- OpenAI 类型 → `OpenAIProvider`
- Anthropic → `ClaudeProvider`
- Google/Gemini → `GeminiProvider`
- DeepSeek → `DeepseekProvider`(支持推理)
- Aliyun → `QwenAIProvider`
- MNN → `MNNProvider`(本地推理)
- 其他 → `OpenAIProvider`(OpenAI 兼容回退)

### 服务刷新

当配置发生变化时，系统会刷新服务实例：

- `EnhancedAIService.refreshServiceForFunction(context, functionType)`：刷新特定功能的服务
- `EnhancedAIService.refreshAllServices(context)`：全局刷新所有服务

这确保配置更改立即生效，无需重启应用

---

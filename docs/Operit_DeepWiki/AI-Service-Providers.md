# AI 服务提供商

## 目的与范围

本文档涵盖 Operit 中的 AI 服务提供商实现，这些实现抽象了与各种 LLM API 和本地推理引擎的通信。每个提供商都实现了通用的 `AIService` 接口，同时处理不同 AI 服务(OpenAI、Claude、Gemini、MNN 等)的特定 API 格式和能力。

有关这些提供商如何在更高层级进行编排和管理的信息，请参阅 [Enhanced AI Service](/AAswordman/Operit/2.1-enhanced-ai-service)。有关模型配置和参数管理，请参阅 [Model Configuration](/AAswordman/Operit/2.3-model-configuration)。有关工具执行和注册，请参阅 [Tool Architecture](/AAswordman/Operit/5.1-tool-architecture)。

---

## 提供商架构

### AIService 接口

所有 AI 提供商都实现了通用的 `AIService` 接口，该接口定义了发送消息、管理令牌和处理流式响应的契约。这种抽象使应用程序的其余部分可以与任何提供商协作，而无需了解实现细节。

**核心 AIService 能力：**
能力描述`sendMessage()`发送带有聊天历史的消息并接收流式响应`calculateInputTokens()`估算输入文本和历史的令牌数量`testConnection()`验证 API 连接性和身份验证`cancelStreaming()`中断正在进行的流式响应`resetTokenCounts()`重置累积的令牌计数器令牌属性`inputTokenCount`、`cachedInputTokenCount`、`outputTokenCount`、`providerModel`

---

## 支持的提供商

Operit 支持多个 AI 服务提供商，每个提供商具有不同的功能和特性：

```
API Provider Types

Provider Types

maps t

maps t

maps t

maps t

maps t

maps t

maps t

OpenAI Provider
(OpenAI-compatible)

Claude Provider
(Anthropic)

Gemini Provider
(Google)

MNN Provider
(Local Inference)

Qwen Provider
(Aliyun)

Deepseek Provider
(DeepSeek)

Doubao Provider
(Volcano)

ApiProviderType.OPENAI

ApiProviderType.ANTHROPIC

ApiProviderType.GOOGLE

ApiProviderType.MNN

ApiProviderType.DEEPSEEK

ApiProviderType.ALIYUN

Other ApiProviderTypes

AIServiceFactory.createService()

AIService Interface
```

**提供商功能矩阵：**
提供商工具调用 API视觉支持流式传输本地推理特殊功能OpenAI✓ (原生)✓✓✗标准 OpenAI 格式Claude✓ (原生)✓✓✗扩展思考模式Gemini✓ (原生)✓✓✗Google 搜索增强MNN✗✗✓✓CPU/GPU 推理Qwen✓ (原生)✓✓✗阿里云特定处理DeepSeek✓ (原生)✓✓✗推理模式支持Doubao✓ (原生)✓✓✗火山引擎特定处理

---

## 提供商工厂与创建

### AIServiceFactory

`AIServiceFactory` 负责根据 `ModelConfigData` 和 `ApiProviderType` 实例化正确的提供商实现。它管理共享的 HTTP 客户端实例并解析自定义请求头。

```
OPENAI

ANTHROPIC

GOOGLE

MNN

ALIYUN

DEEPSEEK

Others

ModelConfigData
(config)

customHeadersJson

ModelConfigManager

Android Context

AIServiceFactory.createService()

apiProviderType?

new OpenAIProvider()

new ClaudeProvider()

new GeminiProvider()

new MNNProvider()

new QwenAIProvider()

new DeepseekProvider()

AIService instance
```

**工厂创建流程：**

1. **解析自定义请求头**：将 JSON 字符串转换为 `Map<String, String>`
2. **创建 ApiKeyProvider**：根据 `config.useMultipleApiKeys` 选择 `SingleApiKeyProvider` 或 `MultiApiKeyProvider`
3. **提取配置标志**：获取 `supportsVision`(来自 `enableDirectImageProcessing`)和 `enableToolCall`
4. **匹配提供商类型**：根据 `ApiProviderType` 枚举实例化对应的提供商

**共享 HTTP 客户端：**

所有提供商(MNN 除外)共享一个 `OkHttpClient` 实例，配置如下：

- 60 秒连接超时
- 1000 秒读写超时（用于长时间流式响应）
- 连接池包含 10 个空闲连接(5 分钟保活)
- 支持 HTTP/2，可回退至 HTTP/1.1

---

## OpenAI Provider

### 概述

`OpenAIProvider` 实现了 OpenAI 聊天补全 API 格式，该格式被许多 LLM 服务广泛采用。它作为大多数提供 OpenAI 兼容端点的提供商的基础实现。

```
Configuration

Core Components

OpenAIProvider

createRequestBodyInternal()

buildMessagesAndCountTokens()

processStreamingResponse()

XML ↔ OpenAI Tool Format

TokenCacheManager

apiEndpoint

ApiKeyProvider

modelName

customHeaders

enableToolCall

supportsVision
```

### 请求体构建

OpenAI provider 构建的请求体具有以下结构：

```
{
  "model": "model-name",
  "stream": true,
  "messages": [...],
  "temperature": 1.0,
  "tools": [...],
  "tool_choice": "auto"
}
```

**消息构建过程：**

1. **Token 计算**：使用 `TokenCacheManager.calculateInputTokens()` 估算 token 数量
2. **历史记录标准化**：将角色映射为标准格式(system/user/assistant)
3. **消息合并**：合并具有相同角色的连续消息
4. **内容字段构建**：通过 `buildContentField()` 处理文本和图像

### 工具调用支持

当 `enableToolCall` 为 true 时，OpenAI provider 执行双向 XML ↔ OpenAI 格式转换：

**XML 转 OpenAI 格式：**

```
<tool name="read_file">
  <param name="path">/path/to/file</param>
</tool>
```

↓

```
{
  "tool_calls": [{
    "id": "call_abc123",
    "type": "function",
    "function": {
      "name": "read_file",
      "arguments": "{\"path\":\"/path/to/file\"}"
    }
  }]
}
```

**OpenAI 格式转 XML：**
provider 将 API 响应转换回 XML 格式，以便上层使用一致的解析方式：

```
{
  "tool_calls": [{
    "function": {
      "name": "read_file",
      "arguments": "{\"path\":\"/path/to/file\"}"
    }
  }]
}
```

↓

```
<tool name="read_file">
  <param name="path">/path/to/file</param>
</tool>
```

**工具结果处理：**

XML `tool_result` 标签被转换为 OpenAI `role: "tool"` 消息，并进行适当的 `tool_call_id` 跟踪

### 视觉支持

当启用 `supportsVision` 时，提供者会从消息内容中解析图像链接并构建多部分内容数组：

```
{
  "content": [
    {
      "type": "image_url",
      "image_url": {
        "url": "data:image/png;base64,..."
      }
    },
    {
      "type": "text",
      "text": "What's in this image?"
    }
  ]
}
```

图像使用 `ImageLinkParser` 工具以 base64 数据 URI 的形式嵌入

### 流式响应处理

OpenAI 提供者使用服务器发送事件(SSE)格式进行流式传输：

```
data: {"choices":[{"delta":{"content":"Hello"}}]}
data: {"choices":[{"delta":{"content":" world"}}]}
data: [DONE]

```

**流处理步骤：**

1. 从响应体读取行
2. 从 `data:` 行解析 JSON 增量
3. 从增量中提取内容或 tool_calls
4. 如果存在 tool_calls，将其转换为 XML
5. 向收集器发送内容块
6. 增量更新令牌计数

---

## Claude 提供者

### 概述

`ClaudeProvider` 实现了 Anthropic 的 Claude API 格式，与 OpenAI 在以下几个关键方面有所不同：

- 所有消息使用 `content` 数组
- 使用独立的 `system` 参数而非系统消息
- 不同的工具调用格式(`tool_use` 块)
- 支持扩展思考模式

```
Message Format

Tool Handling

parseXmlToolCalls()

tool_use format:
{id, name, input}

tool_result format:
{tool_use_id, content}

ClaudeProvider

content: [
{type, text}
{type, image}
{type, tool_use}
{type, tool_result}
]

system: 'system prompt'

thinking: {type: 'enabled'}
```

### 消息结构

Claude 对所有消息部分使用结构化的 `content` 数组：

**文本内容：**

```
{
  "role": "user",
  "content": [
    {"type": "text", "text": "Hello"}
  ]
}
```

**图像内容：**

```
{
  "content": [
    {
      "type": "image",
      "source": {
        "type": "base64",
        "media_type": "image/png",
        "data": "..."
      }
    }
  ]
}
```

**工具使用：**

```
{
  "role": "assistant",
  "content": [
    {
      "type": "tool_use",
      "id": "toolu_abc123",
      "name": "read_file",
      "input": {"path": "/file.txt"}
    }
  ]
}
```

### 工具调用格式转换

Claude 使用与 OpenAI 不同的工具调用格式。该提供者将 XML 转换为 Claude 的格式：

**XML → Claude tool_use：**

```
<tool name="read_file">
  <param name="path">/file.txt</param>
</tool>
```

↓

```
{
  "type": "tool_use",
  "id": "toolu_read_file_abc_0",
  "name": "read_file",
  "input": {"path": "/file.txt"}
}
```

**ID 生成：** 工具 ID 生成格式为 `toolu_{name}_{hash}_{index}`

**工具结果匹配：** 工具结果按顺序匹配到之前的 tool_use ID

### 扩展思考模式

Claude 支持扩展思考功能，模型可以展示其推理过程：

```
{
  "thinking": {
    "type": "enabled"
  }
}
```

启用后，Claude 可能会在响应中包含思考块，这些块会被单独处理

---

## Gemini Provider

### 概述

`GeminiProvider` 实现了 Google 的 Gemini API 格式，具有以下独特特性：

- 在内容对象中使用 `parts` 数组
- 支持 `functionCall` 和 `functionResponse` 进行工具调用
- 具有 `systemInstruction` 参数用于系统提示
- 支持 Google Search grounding
- 使用不同的 API 版本(`v1beta`)

```
Special Features

Parts Types

API Format

GeminiProvider

contents: [
{role, parts: [...]}
]

systemInstruction:
{parts: [{text}]}

tools: [
{function_declarations},
{googleSearch}
]

{text: '...'}

{inline_data: {mime_type, data}}

{functionCall: {name, args}}

{functionResponse: {name, response}}

Google Search Grounding

thinkingConfig: {includeThoughts}
```

### Content Parts 结构

Gemini 使用 `parts` 数组，其中每个部分都有特定类型：

**文本部分：**

```
{"text": "Hello"}
```

**图像部分：**

```
{
  "inline_data": {
    "mime_type": "image/png",
    "data": "base64_data"
  }
}
```

**函数调用部分：**

```
{
  "functionCall": {
    "name": "read_file",
    "args": {"path": "/file.txt"}
  }
}
```

**函数响应部分：**

```
{
  "functionResponse": {
    "name": "read_file",
    "response": {"result": "file contents"}
  }
}
```

### 工具定义与 Google 搜索

Gemini 在 `tools` 数组中支持两种类型的工具：

**函数声明：**

```
{
  "tools": [
    {
      "function_declarations": [
        {
          "name": "read_file",
          "description": "Read a file",
          "parameters": {
            "type": "object",
            "properties": {...}
          }
        }
      ]
    }
  ]
}
```

**Google 搜索基础：**

```
{
  "tools": [
    {"googleSearch": {}}
  ]
}
```

当启用 `enableGoogleSearch` 时，Gemini 可以使用 Google 搜索为其响应提供实时信息支持

### API 端点构建

Gemini 使用不同的 URL 结构，模型名称在路径中，API 密钥作为查询参数：

```
{baseUrl}/v1beta/models/{modelName}:streamGenerateContent?key={apiKey}

```

或用于非流式传输：

```
{baseUrl}/v1beta/models/{modelName}:generateContent?key={apiKey}

```

### 思考模式

Gemini 通过 `thinkingConfig` 支持思考模式：

```
{
  "generationConfig": {
    "thinkingConfig": {
      "includeThoughts": true
    }
  }
}
```

---

## MNN Provider

### 概述

`MNNProvider` 使用 MNN(Mobile Neural Network)引擎实现本地设备端推理。与云服务提供商不同，它完全在本地执行推理，无需网络请求。

```
Inference

Configuration

Local Components

MNNProvider

MNNLlmSession
(Native C++ binding)

Model Directory:
/Download/Operit/models/mnn/{modelName}

Model Files:
llm.mnn
llm.mnn.weight
llm_config.json
tokenizer.txt

backendType:
cpu/opencl/vulkan/opengl

threadNum: 4

precision: 'low'

memory: 'low'/'normal'

session.tokenize(text)

session.generateStream(history, maxTokens, callback)

session.setThinkingMode(enabled)
```

### 模型目录结构

MNN 模型存储在特定的目录结构中：

```
/storage/emulated/0/Download/Operit/models/mnn/
  └── {modelName}/
      ├── llm.mnn              # Model architecture
      ├── llm.mnn.weight       # Model weights
      ├── llm_config.json      # Configuration
      └── tokenizer.txt        # Tokenizer vocabulary

```

**路径构建：**`getModelDir()` 构建路径：`/Download/Operit/models/mnn/{modelName}`

### 后端类型

MNN 支持多种计算后端：
forwardTypebackend_type描述0`"cpu"`CPU 推理(兼容性最好)3`"opencl"`OpenCL GPU 加速4`"auto"`自动后端选择6`"opengl"`OpenGL GPU 加速7`"vulkan"`Vulkan GPU 加速
**内存模式选择：**

- GPU 后端(vulkan、opencl、opengl)：使用 `"normal"` 内存模式以避免克隆错误
- CPU 后端：使用 `"low"` 内存模式以提高效率

### 会话创建与配置

MNN 会话通过配置参数创建：

```
MNNLlmSession.create(
    modelDir = "/path/to/model",
    backendType = "cpu",
    threadNum = 4,
    precision = "low",
    memory = "low",
    tmpPath = "/cache/dir"
)
```

**配置应用：**

模型参数(temperature、top_p、top_k 等)通过 JSON 配置应用：

```
{
  "temperature": 1.0,
  "topP": 0.9,
  "topK": 40,
  "penalty": 1.0
}
```

该提供者将常见参数名称映射到 MNN 的预期格式

### 流式生成

MNN 通过回调机制生成 token：

```
session.generateStream(chatHistory, maxTokens) { token ->
    if (isCancelled) {
        false  // Stop generation
    } else {
        emit(token)  // Send token to UI
        true  // Continue generation
    }
}
```

**Token 计数：** MNN 通过 `session.tokenize(text).size` 使用其内置分词器进行精确的 token 计数

**聊天历史：** 该提供者将聊天历史直接传递给 MNN，MNN 在内部应用模型的聊天模板

### 取消操作

MNN 支持通过 `session.cancel()` 立即取消，这会中断原生推理循环

---

## 提供者特定功能

### DeepSeek 推理模式

`DeepseekProvider` 扩展了 `OpenAIProvider`，支持推理模式，其中 `<think>` 内容会被转换为 `reasoning_content`：

**标准模式：**

```
{
  "messages": [
    {"role": "user", "content": "Question"}
  ]
}
```

**推理模式(当 `enableDeepseekReasoning` 为 true 时)：**

```
{
  "messages": [
    {
      "role": "user",
      "content": "Question",
      "reasoning_content": "thinking content extracted from <think> tags"
    }
  ]
}
```

这使得 DeepSeek 模型能够更有效地使用其推理能力

### Aliyun/Qwen 特定处理

`QwenAIProvider` 处理阿里云特定的 API 特性，在基础 OpenAI 提供者之上扩展了 Qwen 特定的消息格式化和参数处理。

### Doubao/Volcano 特定处理

`DoubaoAIProvider` 实现了 Doubao(豆包)服务的 Volcano 特定 API 要求。

---

## Token 管理

### TokenCacheManager

所有提供者(除了使用其原生分词器的 MNN)都使用 `TokenCacheManager` 进行高效的 token 计数：

```
Caching Strategy

Cache hit

Cache miss

User message +
Chat history +
Tool definitions

TokenCacheManager

Hash chat history

Check cache

Calculate new tokens

Store in cache

Token Counters:
- totalInputTokenCount
- cachedInputTokenCount
- outputTokenCount
```

**估算算法：**

`TokenCacheManager` 使用快速估算方法：

1. 统计消息中的字符数
2. 除以 4(近似平均值)
3. 为特殊 token 添加开销
4. 考虑工具定义(每个工具约 10 个 token)

**缓存行为：**

- 历史 token 通过内容哈希进行缓存
- 具有相同历史的重复查询会重用缓存的计数
- 输出 token 在流式传输期间进行估算(每个内容块 1 个 token)
- 通过 `onTokensUpdated()` 回调发送增量更新

---

## API 密钥管理

### ApiKeyProvider 接口

提供者使用 `ApiKeyProvider` 抽象来支持单个 API 密钥和多个密钥轮换：

```
ApiKeyProvider Interface

SingleApiKeyProvider

MultiApiKeyProvider

Returns fixed apiKey

configId

ModelConfigManager

API Key Pool

Rotation Mode:
ROUND_ROBIN/RANDOM

getNextKey()
```

**SingleApiKeyProvider：**

每次调用返回相同的 API 密钥：

```
class SingleApiKeyProvider(private val apiKey: String) : ApiKeyProvider {
    override suspend fun getApiKey(): String = apiKey
}
```

**MultiApiKeyProvider：**

根据配置在密钥池中轮换：

```
class MultiApiKeyProvider(
    private val configId: String,
    private val modelConfigManager: ModelConfigManager
) : ApiKeyProvider {
    override suspend fun getApiKey(): String {
        // Get current config
        val config = modelConfigManager.getModelConfig(configId)

        // Select key based on rotation mode
        val key = when (config.keyRotationMode) {
            "ROUND_ROBIN" -> getNextKeyRoundRobin(config)
            "RANDOM" -> getRandomKey(config)
            else -> config.apiKeyPool[0].key
        }

        // Update index for next call
        updateKeyIndex(config)

        return key
    }
}
```

**密钥池结构：**

```
data class ApiKeyInfo(
    val key: String,
    val label: String = "",
    val isActive: Boolean = true
)
 
data class ModelConfigData(
    // ...
    val useMultipleApiKeys: Boolean = false,
    val apiKeyPool: List<ApiKeyInfo> = emptyList(),
    val currentKeyIndex: Int = 0,
    val keyRotationMode: String = "ROUND_ROBIN"
)
```

---

## 重试和错误处理

### 重试机制

提供者对网络错误实现指数退避重试：

```
Yes

No

Yes

No

sendMessage()

Attempt request

Success?

Error Type?

NonRetriableException
(4xx errors)

SocketTimeoutException

UnknownHostException

Other IOException

retryCount < maxRetries?

retryCount++
delay = 2^retryCount seconds

Build resume request
with partial content

Return stream

Throw exception
```

**重试策略：**

1. **最大重试次数**：总共 3 次尝试
2. **指数退避**：重试之间等待 `2^(retryCount-1)` 秒
3. **部分恢复**：重试时，追加已接收内容并添加续写指令
4. **不可重试错误**：4xx HTTP 错误不会重试

**续写指令：**

网络中断后恢复时：

```
[SYSTEM NOTE] The previous response was cut off by a network error.
You MUST continue from the exact point of interruption.
Do not repeat any content.
If you were in the middle of a code block or XML tag, complete it.
Just output the text that would have come next.

```

---

## 连接测试

所有提供者都实现了 `testConnection()` 来验证 API 连接性：

```
OK

Error

OK

Error

testConnection()

Cloud Providers:
Send 'Hi' message
Verify response

MNN Provider:
Check model files
Initialize session

Result.success(message)

Result.failure(exception)
```

**云提供者测试：**

发送最小测试消息以验证：

- 网络连接性
- API 端点可访问性
- 身份验证有效性
- 模型可用性

**MNN Provider 测试：**

验证：

- 模型目录存在
- 必需文件存在(llm.mnn、llm.mnn.weight、llm_config.json、tokenizer.txt)
- 会话可以初始化
- 返回文件状态和模型信息

# 网络工具

## 概述

网络工具为 AI 助手提供 HTTP 通信能力,支持网页抓取、API 集成、文件上传和持久化 Cookie 管理。这些工具在 `AIToolHandler` 中注册,既可通过 XML 工具调用原生访问,也可通过 MCP 包中的 JavaScript API 使用。

有关包括本地文件下载在内的文件系统操作,请参阅[文件系统工具](/AAswordman/Operit/5.2-file-system-tools)。有关常规系统操作,请参阅[系统工具](/AAswordman/Operit/5.3-network-tools)。有关工具注册和执行的详细信息,请参阅[工具架构](/AAswordman/Operit/5.1-tool-architecture)。

**本系统中的网络工具:**
工具名称用途主要使用场景`http_request`通用 HTTP 操作REST API 调用、数据获取`visit_web`网页抓取内容提取、链接发现`multipart_request`通过 HTTP 上传文件带文件的表单提交`manage_cookies`Cookie 持久化跨请求的会话管理`download_file`网络文件下载将远程文件保存到本地`start_web`创建持久化 Web 会话交互式浏览器自动化`stop_web`关闭 Web 会话会话清理`web_navigate`在会话中导航到 URL页面导航`web_eval`在会话中执行 JavaScriptDOM 操作、数据提取`web_click`通过引用点击元素交互式元素操作`web_fill`填充表单输入表单自动化`web_wait_for`等待页面/元素同步`web_snapshot`捕获页面内容带引用的内容提取`web_file_upload`在会话中上传文件文件选择器处理

---

## 网络工具架构

网络工具基于 OkHttp 构建用于 HTTP 操作，并与更广泛的工具执行系统集成。每个工具都在 `ToolRegistration.kt` 中注册，并通过 `AIToolHandler` 执行。

```
Result Types

HTTP Client & Browser

Execution Layer

Persistent Web Session Tools

Basic HTTP Tools

Tool Registration

registerTool()

ToolRegistration.kt
registerAllTools()

AIToolHandler

visit_web

http_request

multipart_request

manage_cookies

download_file

start_web

stop_web

web_navigate

web_eval

web_click

web_fill

web_wait_for

web_snapshot

web_file_upload

ToolGetter

WebVisitTool
getWebVisitTool()

WebSessionTools
getWebSessionTools()

StandardNetworkTools

OkHttpClient

WebView
Playwright Integration

CookieManager
Persistent Storage

HttpResponseData

VisitWebResultData

StringResultData
```

**核心组件：**

- **ToolRegistration.kt**：所有网络工具的中央注册点，包含参数定义和执行 lambda，位于
- **AIToolHandler**：管理工具执行、权限检查和结果路由
- **ToolGetter**：用于获取工具执行器实例的工厂方法
- **WebVisitTool**：处理简单的 HTTP 抓取操作
- **WebSessionTools**：管理具有完整 JavaScript 执行能力的持久化浏览器会话
- **OkHttpClient**: 底层 HTTP 客户端，具有连接池和超时管理功能
- **WebView/Playwright**: 用于持久会话的浏览器自动化引擎
- **CookieManager**: 跨请求和会话的持久化 cookie 存储

---

## HTTP 请求工具

`http_request` 工具提供通用 HTTP 操作，支持所有标准方法(GET、POST、PUT、DELETE、PATCH 等)，并完全控制请求头和请求体。

### 工具定义

**工具名称：**`http_request`

**参数：**
参数类型必填说明`url`字符串是请求的目标 URL`method`字符串否HTTP 方法（默认：GET）`headers`字符串（JSON）否请求头，JSON 对象格式`body`字符串否请求体内容`timeout`字符串否请求超时时间（毫秒）
**返回值：**`HttpResponseData`，包含状态码、响应头、内容和 cookies

### HTTP 请求流程

```
"Remote Server"
"CookieManager"
"OkHttpClient"
"HTTP Tool
Executor"
"AIToolHandler"
"AI Assistant"
"Remote Server"
"CookieManager"
"OkHttpClient"
"HTTP Tool
Executor"
"AIToolHandler"
"AI Assistant"
"Execute http_request"
"executeTool(AITool)"
"Get cookies for domain"
"Stored cookies"
"Build request with
headers + cookies + body"
"HTTP Request"
"HTTP Response"
"Store Set-Cookie headers"
"Cookies saved"
"Response object"
"Parse response
Build HttpResponseData"
"ToolResult(HttpResponseData)"
"Formatted response"
```

### 使用示例(XML 格式)

```
<tool name="http_request">
<param name="url">https://api.example.com/data</param>
<param name="method">POST</param>
<param name="headers">{"Content-Type": "application/json", "Authorization": "Bearer token123"}</param>
<param name="body">{"query": "test data"}</param>
</tool>
```

### 使用示例(JavaScript API)

```
// Simple GET request
const response = await Tools.Net.httpGet("https://api.example.com/data");
 
// POST with JSON body
const result = await Tools.Net.httpPost(
    "https://api.example.com/submit",
    { key: "value", data: [1, 2, 3] }
);
 
// Advanced HTTP request with full control
const advancedResult = await Tools.Net.http({
    url: "https://api.example.com/endpoint",
    method: "PUT",
    headers: {
        "Content-Type": "application/json",
        "X-Custom-Header": "value"
    },
    body: { updated: "data" },
    timeout: 30000
});
```

---

## 网页抓取工具

`visit_web` 工具提供智能网页内容提取功能，将 HTML 解析为可读文本，包含元数据、链接和可选的搜索结果跟踪。

### 工具定义

**工具名称：**`visit_web`

**参数：**
参数类型必需说明`url`string条件直接访问的 URL`visit_key`string条件来自先前搜索结果的键`link_number`string条件来自先前结果的链接索引
**返回值：**`VisitWebResultData`，包含标题、内容、元数据、链接数组和访问键

### 网页内容提取流程

```
Output

Result Assembly

Content Parsing

HTTP Layer

Input Processing

Tool Parameters

Direct URL

visit_key +
link_number

Fetch HTML
via OkHttpClient

Load Domain
Cookies

Resolve Link
from Cache

HTML Parser
Jsoup

Extract Metadata
title, description

Clean & Convert
to Markdown-like

Extract Links
href + text

Generate visit_key
for link tracking

Cache links
for future reference

Build
VisitWebResultData

ToolResult with
VisitWebResultData
```

### 网页访问结果结构

该工具返回结构化数据，支持后续导航：

```
// From ToolResultDataClasses.kt:516-530
data class VisitWebResultData(
    val url: String,              // Final URL (after redirects)
    val title: String,            // Page title
    val content: String,          // Cleaned text content
    val metadata: Map<String, String> = emptyMap(),  // Meta tags
    val links: List<LinkData> = emptyList(),         // Extracted links
    val visitKey: String? = null  // Key for referencing this visit
) : ToolResultData()
 
data class LinkData(
    val url: String,              // Link href
    val text: String              // Link text/anchor
)
```

### 使用模式

**模式 1：直接 URL 访问**

```
<tool name="visit_web">
<param name="url">https://example.com/article</param>
</tool>
```

**模式 2：跟随先前访问的链接**

```
<!-- First visit returns visitKey "abc123" with 10 links -->
<tool name="visit_web">
<param name="visit_key">abc123</param>
<param name="link_number">3</param>
</tool>
<!-- Follows the 4th link (0-indexed) from the previous visit -->
```

**模式 3：JavaScript API**

```
// Simple visit
const page = await Tools.Net.visit("https://news.example.com");
console.log(page.title);
console.log(page.content);
 
// Follow link from previous visit
const nextPage = await Tools.Net.visit({
    visit_key: page.visitKey,
    link_number: 0  // First link
});
```

---

## 文件上传工具

`multipart_request` 工具通过 multipart/form-data 编码处理文件上传，支持在单个请求中上传多个文件和表单字段。

### 工具定义

**工具名称：**`multipart_request`

**参数：**
参数类型必填说明`url`字符串是目标上传 URL`files`字符串（JSON 数组）是包含路径和字段名的文件对象数组`form_data`字符串（JSON 对象）否额外的表单字段（键值对）`headers`字符串（JSON 对象）否自定义 HTTP 头`method`字符串否HTTP 方法（默认：POST）
**文件对象结构：**

```
{
    "path": "/sdcard/Documents/file.pdf",
    "field_name": "document",
    "mime_type": "application/pdf"  // Optional
}
```

### Multipart 上传流程

```
"Upload Server"
"OkHttpClient"
"MultipartBody
Builder"
"File System"
"multipart_request
Tool"
"Upload Server"
"OkHttpClient"
"MultipartBody
Builder"
"File System"
"multipart_request
Tool"
loop
[For each file]
loop
[For each form field]
"Read file(s) from paths"
"File byte arrays"
"Create multipart builder"
"Add file part
(field_name, bytes, mime)"
"Add form field
(key, value)"
"Build RequestBody"
"MultipartBody"
"Execute POST request"
"Upload multipart data"
"Upload response"
"HttpResponseData"
```

### 使用示例

**XML 格式：**

```
<tool name="multipart_request">
<param name="url">https://api.example.com/upload</param>
<param name="files">[
  {"path": "/sdcard/Documents/report.pdf", "field_name": "file1"},
  {"path": "/sdcard/Pictures/chart.png", "field_name": "image"}
]</param>
<param name="form_data">{
  "user_id": "12345",
  "description": "Monthly report with chart"
}</param>
<param name="headers">{"Authorization": "Bearer token"}</param>
</tool>
```

**JavaScript API：**

```
const uploadResult = await Tools.Net.uploadFile({
    url: "https://api.example.com/upload",
    files: [
        { path: "/sdcard/Documents/report.pdf", field_name: "document" },
        { path: "/sdcard/Pictures/photo.jpg", field_name: "image" }
    ],
    form_data: {
        user_id: "12345",
        category: "reports"
    },
    headers: {
        "Authorization": "Bearer your_token_here"
    }
});
 
if (uploadResult.statusCode === 200) {
    console.log("Upload successful:", uploadResult.content);
}
```

---

## Cookie 管理

`manage_cookies` 工具提供跨 HTTP 请求的持久化 Cookie 存储和检索功能，支持会话管理和身份验证工作流。

### 工具定义

**工具名称：**`manage_cookies`

**参数：**
参数类型必填说明`action`字符串是操作类型："get"、"set" 或 "clear"`domain`字符串是Cookie 操作的目标域名`cookies`字符串(JSON)条件Cookie 数据("set" 操作时必填)
**Cookie 数据格式：**

```
{
    "session_id": "abc123xyz",
    "auth_token": "Bearer token...",
    "preferences": "theme=dark"
}
```

### Cookie 管理架构

```
Auto Cookie Handling

HTTP Integration

Cookie Manager

Cookie Tool Interface

manage_cookies
action=get

manage_cookies
action=set

manage_cookies
action=clear

CookieManager
Implementation

Cookie Storage
Domain-keyed Map

Persistent Storage
DataStore/File

OkHttpClient

Cookie Interceptor

HTTP Request

HTTP Response

Set-Cookie
Header Processing

Cookie
Header Injection
```

### Cookie 持久化流程

1. **自动 Cookie 存储**：当 `http_request` 或 `visit_web` 接收到 `Set-Cookie` 头时，Cookie 会自动持久化到特定域名的存储中
2. **自动 Cookie 注入**：后续对同一域名的请求会自动包含已存储的 Cookie
3. **手动管理**：`manage_cookies` 工具允许显式检索、修改和清除 Cookie

### 使用示例

**获取域名 Cookie：**

```
// Get all cookies for a domain
const cookies = await Tools.Net.cookies.get("example.com");
console.log("Stored cookies:", cookies);
```

**设置 Cookie：**

```
// Set cookies for a domain
await Tools.Net.cookies.set("example.com", {
    "session_id": "xyz789",
    "user_pref": "lang=en"
});
```

**清除 Cookie：**

```
// Clear all cookies for a domain
await Tools.Net.cookies.clear("example.com");
```

**工作流示例：**

```
// 1. Initial request (gets session cookie automatically)
const loginResult = await Tools.Net.httpPost(
    "https://api.example.com/login",
    { username: "user", password: "pass" }
);
 
// 2. Session cookie is now stored automatically
// Subsequent requests include it automatically
const userData = await Tools.Net.httpGet("https://api.example.com/profile");
 
// 3. Manually check cookies if needed
const currentCookies = await Tools.Net.cookies.get("api.example.com");
 
// 4. Logout by clearing cookies
await Tools.Net.cookies.clear("api.example.com");
```

---

## 文件下载

文件下载作为文件系统工具的一部分实现，但底层使用网络操作。它结合了 HTTP 客户端功能和文件写入。

### 工具定义

**工具名称：**`download_file`

**参数：**
参数类型必需说明`url`string是下载源 URL`destination`string是保存的本地文件路径`environment`string否"android" 或 "linux"(默认：android)
**返回：**包含成功状态和详细信息的 `FileOperationData`

### 下载流程

```
"File System"
"Streaming
Download"
"HTTP Client"
"PathValidator"
"download_file
Tool"
"File System"
"Streaming
Download"
"HTTP Client"
"PathValidator"
"download_file
Tool"
loop
[Stream chunks]
"Validate destination path"
"Path OK"
"HEAD request (get size)"
"Content-Length header"
"GET request (stream)"
"Open input stream"
"Create output file"
"File handle"
"Read chunk (8KB)"
"Write chunk"
"EOF reached"
"Close file"
"File saved"
"Build FileOperationData"
"Return success result"
```

### 实现细节

下载实现使用 `OkHttpClient` 进行网络操作，并将数据直接流式传输到磁盘以高效处理大文件：

```
// Conceptual implementation flow (not actual code)
fun downloadFile(url: String, destination: String): FileOperationData {
    // 1. Validate path
    PathValidator.validateAndroidPath(destination, "download_file")

    // 2. Build HTTP request
    val request = Request.Builder().url(url).build()

    // 3. Execute and stream
    val response = httpClient.newCall(request).execute()
    val inputStream = response.body?.byteStream()
    val outputStream = FileOutputStream(File(destination))

    // 4. Stream in chunks (memory efficient)
    val buffer = ByteArray(8192)
    var bytesRead = 0
    while (inputStream.read(buffer).also { bytesRead = it } != -1) {
        outputStream.write(buffer, 0, bytesRead)
    }

    // 5. Cleanup and return result
    inputStream.close()
    outputStream.close()

    return FileOperationData(
        operation = "download",
        path = destination,
        successful = true,
        details = "Downloaded successfully"
    )
}
```

### 使用示例

**XML 格式：**

```
<tool name="download_file">
<param name="url">https://example.com/files/document.pdf</param>
<param name="destination">/sdcard/Download/document.pdf</param>
</tool>
```

**JavaScript API：**

```
// Download to Android storage
const result = await Tools.Files.download(
    "https://example.com/archive.zip",
    "/sdcard/Download/archive.zip"
);
 
// Download to Linux environment
const linuxResult = await Tools.Files.download(
    "https://example.com/script.sh",
    "/home/user/script.sh",
    "linux"
);
 
if (result.successful) {
    console.log("Download complete:", result.details);
    // Can now process the file
    await Tools.Files.unzip(
        "/sdcard/Download/archive.zip",
        "/sdcard/Download/extracted/"
    );
}
```

---

## 结果数据结构

所有网络工具返回在 `ToolResultDataClasses.kt` 中定义的结构化数据类型。这些提供了处理响应的一致接口。

### HttpResponseData 结构

```
@Serializable
data class HttpResponseData(
    val url: String,                           // Final URL (after redirects)
    val statusCode: Int,                       // HTTP status code (200, 404, etc.)
    val statusMessage: String,                 // Status text ("OK", "Not Found")
    val headers: Map<String, String>,          // Response headers
    val contentType: String,                   // Content-Type header value
    val content: String,                       // Response body as string
    val contentBase64: String? = null,         // Base64 for binary content
    val size: Int,                             // Content length in bytes
    val cookies: Map<String, String> = emptyMap()  // Set-Cookie values
) : ToolResultData()
```

**主要特性：**

- 从 `Set-Cookie` 头自动提取 cookie
- 对二进制响应进行 Base64 编码
- 通过 `url` 字段跟踪重定向链
- 完整的头访问用于自定义处理

### VisitWebResultData 结构

```
@Serializable
data class VisitWebResultData(
    val url: String,                          // Final URL
    val title: String,                        // Page <title>
    val content: String,                      // Cleaned main content
    val metadata: Map<String, String> = emptyMap(),  // Meta tags
    val links: List<LinkData> = emptyList(),  // All extracted links
    val visitKey: String? = null              // Key for link reference
) : ToolResultData() {

    @Serializable
    data class LinkData(
        val url: String,                      // Link href (absolute URL)
        val text: String                      // Anchor text
    )
}
```

**内容处理：**

- HTML 去除脚本、样式和导航元素
- 文本转换为可读格式(伪 markdown)
- 提取链接并完整解析 URL
- 保留元标签用于 SEO/描述数据

### 结果访问模式

**Kotlin/Native 访问：**

```
val result = aiToolHandler.executeTool(AITool("http_request", params))
if (result.success) {
    val httpData = result.result as HttpResponseData
    val statusCode = httpData.statusCode
    val content = httpData.content
    val cookies = httpData.cookies
}
```

**JavaScript API 访问：**

```
const result = await Tools.Net.httpGet("https://api.example.com/data");
console.log("Status:", result.statusCode);
console.log("Content:", result.content);
 
// Parse JSON response
const data = JSON.parse(result.content);
 
// Access headers
const contentType = result.headers["content-type"];
```

---

## 持久化网页会话

持久化网页会话工具提供了一个具有完整 JavaScript 执行能力的浮动浏览器窗口。与执行简单 HTTP 抓取的 `visit_web` 不同，这些工具维护一个有状态的浏览器会话，可以处理复杂的 Web 应用程序、JavaScript 渲染和交互式元素。

### 会话生命周期

```
"WebView/Browser"
"FloatingChatService"
"WebSessionTools
getWebSessionTools()"
"AIToolHandler"
"AI Assistant"
"WebView/Browser"
"FloatingChatService"
"WebSessionTools
getWebSessionTools()"
"AIToolHandler"
"AI Assistant"
Floating browser window visible
"start_web"
"invoke(tool)"
"createWebSession()"
"Initialize WebView"
"Session ready"
"session_id"
"StringResultData(session_id)"
"Session started"
"web_navigate"
"invoke(tool)"
"loadUrl(url)"
"Page loaded"
"Success"
"web_snapshot"
"invoke(tool)"
"executeJavaScript(extract)"
"Page content + refs"
"StringResultData(content)"
"web_click"
"invoke(tool)"
"click(ref)"
"Element clicked"
"Success"
"stop_web"
"invoke(tool)"
"closeWebSession()"
"Destroy WebView"
"Closed"
"Session closed"
```

### start_web 工具

创建一个带有浮动浏览器窗口的持久化网页会话。

**工具名称：**`start_web`

**参数：**
参数类型必需说明`url`stringNo要加载的初始 URL`headers`string (JSON)No自定义 HTTP 头`user_agent`stringNo自定义用户代理字符串`session_name`stringNo窗口的显示名称
**返回值：**包含会话 ID 的 `StringResultData`

**示例：**

```
// Start a session and open a URL
const result = await Tools.Net.startWeb({
    url: "https://example.com",
    session_name: "Example Session",
    headers: {
        "Accept-Language": "en-US"
    }
});
 
console.log("Session started:", result.value);
// Session ID is automatically tracked for subsequent operations
```

### web_navigate 工具

将活动会话导航到新的 URL。

**工具名称：**`web_navigate`

**参数：**
参数类型必需说明`session_id`string是目标会话 ID`url`string是要导航到的 URL`headers`string (JSON)否附加请求头
**示例：**

```
// Navigate to a different page
await Tools.Net.webNavigate("session_id_here", "https://example.com/page2");
```

### web_eval 工具

在浏览器上下文中执行 JavaScript 代码。

**工具名称：**`web_eval`

**参数：**
参数类型必需说明`session_id`string是目标会话 ID`script`string是要执行的 JavaScript 代码`timeout_ms`integer否执行超时时间(默认：10000)
**示例：**

```
// Execute JavaScript and get result
const result = await Tools.Net.webEval(
    "session_id_here",
    "document.querySelector('h1').textContent",
    5000
);
console.log("Page title:", result.value);
 
// Manipulate DOM
await Tools.Net.webEval(
    "session_id_here",
    "document.getElementById('button').click()"
);
```

### web_snapshot 工具

捕获当前页面内容及元素引用以便交互。

**工具名称：**`web_snapshot`

**参数：**
参数类型必填说明`session_id`string是目标会话 ID`include_links`boolean否包含链接列表(默认：true)`include_images`boolean否包含图片列表(默认：false)
**返回值：**`StringResultData`，包含文本内容和格式为 `[ref]element_text` 的元素引用

**示例：**

```
// Capture page content
const snapshot = await Tools.Net.webSnapshot("session_id_here", {
    include_links: true,
    include_images: true
});
 
console.log(snapshot.value);
// Output format:
// Page Title
//
// [1]Click here for details
// [2]Login
// [3]Sign up
// ...
```

### web_click 工具

使用 `web_snapshot` 返回的引用点击元素。

**工具名称：**`web_click`

**参数：**
参数类型必填说明`session_id`字符串否目标会话 ID(省略时使用活动会话)`ref`字符串是快照中的元素引用(例如 "1"、"2")`element`字符串否人类可读的元素描述`button`字符串否鼠标按钮："left"、"right"、"middle"(默认：left)`modifiers`字符串(JSON 数组)否修饰键：Alt、Control、Meta、Shift`doubleClick`布尔值否执行双击(默认：false)
**示例：**

```
// Simple click on element reference 2
await Tools.Net.webClick({
    ref: "2",
    element: "Login button"
});
 
// Right-click with modifiers
await Tools.Net.webClick({
    ref: "5",
    button: "right",
    modifiers: ["Shift"]
});
 
// Double-click
await Tools.Net.webClick({
    ref: "3",
    doubleClick: true
});
```

### web_fill 工具

使用 CSS 选择器向输入元素填充文本。

**工具名称：**`web_fill`

**参数：**
参数类型必填说明`session_id`字符串是目标会话 ID`selector`字符串是输入元素的 CSS 选择器`value`字符串是要填充的文本
**示例：**

```
// Fill a form field
await Tools.Net.webFill(
    "session_id_here",
    "#username",
    "user@example.com"
);
 
await Tools.Net.webFill(
    "session_id_here",
    "input[name='password']",
    "secure_password"
);
```

### web_wait_for 工具

等待页面加载或元素出现。

**工具名称：**`web_wait_for`

**参数：**
参数类型必需说明`session_id`string是目标会话 ID`selector`string否要等待的 CSS 选择器(如省略，则等待页面加载)`timeout_ms`integer否等待超时时间(默认：10000)
**示例：**

```
// Wait for page load
await Tools.Net.webWaitFor("session_id_here");
 
// Wait for specific element
await Tools.Net.webWaitFor(
    "session_id_here",
    "#content-loaded",
    15000
);
```

### web_file_upload 工具

通过上传文件或取消来处理文件选择器对话框。

**工具名称：**`web_file_upload`

**参数：**
参数类型必需说明`session_id`string否目标会话 ID`paths`string(JSON 数组)否要上传的文件路径(省略则取消)
**示例：**

```
// Upload files to file chooser
await Tools.Net.webFileUpload("session_id_here", [
    "/sdcard/Documents/file1.pdf",
    "/sdcard/Documents/file2.pdf"
]);
 
// Cancel file chooser
await Tools.Net.webFileUpload("session_id_here");
```

### stop_web 工具

关闭一个 web 会话或所有会话。

**工具名称：**`stop_web`

**参数：**
参数类型必需说明`session_id`string否要关闭的会话(当 close_all=false 时必需)`close_all`boolean否关闭所有会话(默认：false)
**示例：**

```
// Close specific session
await Tools.Net.stopWeb("session_id_here");
 
// Close all sessions
await Tools.Net.stopWeb({ close_all: true });
```

---

## JavaScript API 参考

JavaScript API 为 MCP 包提供了便捷的网络工具接口。所有方法都在 `Tools.Net` 命名空间下。

### 基础 HTTP API

```
namespace Tools.Net {
    // Simple HTTP methods
    function httpGet(url: string): Promise<HttpResponseData>;
    function httpPost(url: string, body: any): Promise<HttpResponseData>;

    // Advanced HTTP with full control
    function http(options: {
        url: string;
        method?: string;
        headers?: Record<string, string>;
        body?: any;
        timeout?: number;
    }): Promise<HttpResponseData>;

    // Web scraping
    function visit(url: string): Promise<VisitWebResultData>;
    function visit(options: {
        url?: string;
        visit_key?: string;
        link_number?: number;
    }): Promise<VisitWebResultData>;

    // File upload
    function uploadFile(options: {
        url: string;
        files: Array<{
            path: string;
            field_name: string;
            mime_type?: string;
        }>;
        form_data?: Record<string, string>;
        headers?: Record<string, string>;
    }): Promise<HttpResponseData>;

    // Cookie management
    namespace cookies {
        function get(domain: string): Promise<HttpResponseData>;
        function set(domain: string, cookies: Record<string, string>): Promise<HttpResponseData>;
        function clear(domain: string): Promise<HttpResponseData>;
    }
}
```

### 持久化 Web 会话 API

```
namespace Tools.Net {
    // Session lifecycle
    function startWeb(options?: {
        url?: string;
        headers?: Record<string, string>;
        user_agent?: string;
        session_name?: string;
    }): Promise<StringResultData>;

    function stopWeb(sessionIdOrOptions?: string | {
        session_id?: string;
        close_all?: boolean;
    }): Promise<StringResultData>;

    // Navigation
    function webNavigate(
        sessionId: string | undefined,
        url: string,
        headers?: Record<string, string>
    ): Promise<StringResultData>;

    // JavaScript execution
    function webEval(
        sessionId: string | undefined,
        script: string,
        timeoutMs?: number
    ): Promise<StringResultData>;

    // Page interaction
    function webClick(options: {
        session_id?: string;
        ref: string;
        element?: string;
        button?: "left" | "right" | "middle";
        modifiers?: ("Alt" | "Control" | "ControlOrMeta" | "Meta" | "Shift")[];
        doubleClick?: boolean;
    }): Promise<StringResultData>;

    function webFill(
        sessionId: string | undefined,
        selector: string,
        value: string
    ): Promise<StringResultData>;

    function webWaitFor(
        sessionId: string | undefined,
        selector?: string,
        timeoutMs?: number
    ): Promise<StringResultData>;

    function webSnapshot(
        sessionId: string | undefined,
        options?: {
            include_links?: boolean;
            include_images?: boolean;
        }
    ): Promise<StringResultData>;

    function webFileUpload(
        sessionId: string | undefined,
        paths?: string[]
    ): Promise<StringResultData>;
}
```

### 实现映射

JavaScript 函数映射到原生工具调用：

```
// Tools.Net.httpGet(url) implementation
function httpGet(url) {
    return toolCall("http_request", { url, method: "GET" });
}
 
// Tools.Net.http(options) implementation
function http(options) {
    const params = { ...options };
    if (params.body !== undefined && typeof params.body === 'object') {
        params.body = JSON.stringify(params.body);
    }
    if (params.headers !== undefined && typeof params.headers === 'object') {
        params.headers = JSON.stringify(params.headers);
    }
    return toolCall("http_request", params);
}
 
// Tools.Net.webClick(options) implementation
function webClick(options) {
    const params = { ...options };
    if (params.modifiers !== undefined) {
        params.modifiers = JSON.stringify(params.modifiers);
    }
    if (params.doubleClick !== undefined) {
        params.doubleClick = params.doubleClick ? "true" : "false";
    }
    return toolCall("web_click", params);
}
```

`toolCall()` 函数将 JavaScript 桥接到原生的 `AIToolHandler.executeTool()` 方法。

---

## 常见使用模式

### 模式 1：带身份验证的 API 集成

```
async function fetchUserData() {
    // 1. Login and get session cookie
    const loginResponse = await Tools.Net.httpPost(
        "https://api.example.com/auth/login",
        {
            username: "user@example.com",
            password: "secure_password"
        }
    );

    if (loginResponse.statusCode !== 200) {
        throw new Error("Login failed: " + loginResponse.content);
    }

    // Cookies automatically stored

    // 2. Subsequent requests include cookies automatically
    const userData = await Tools.Net.httpGet(
        "https://api.example.com/user/profile"
    );

    return JSON.parse(userData.content);
}
```

### 模式 2：带链接跟踪的网页抓取

```
async function scrapeArticles(startUrl) {
    const articles = [];

    // Visit main page
    const mainPage = await Tools.Net.visit(startUrl);
    console.log("Found page:", mainPage.title);

    // Follow first 5 article links
    for (let i = 0; i < Math.min(5, mainPage.links.length); i++) {
        const article = await Tools.Net.visit({
            visit_key: mainPage.visitKey,
            link_number: i
        });

        articles.push({
            title: article.title,
            content: article.content,
            url: article.url
        });
    }

    return articles;
}
```

### 模式 2b：带持久会话的交互式网页自动化

```
async function loginAndExtractData(loginUrl) {
    // Start a persistent browser session
    await Tools.Net.startWeb({
        url: loginUrl,
        session_name: "Login Session"
    });

    // Wait for page load
    await Tools.Net.webWaitFor(undefined);

    // Capture page to see form structure
    const loginPage = await Tools.Net.webSnapshot(undefined);
    console.log("Login page content:", loginPage.value);

    // Fill login form
    await Tools.Net.webFill(undefined, "#username", "user@example.com");
    await Tools.Net.webFill(undefined, "#password", "secure_password");

    // Click login button (assuming ref "3" from snapshot)
    await Tools.Net.webClick({ ref: "3", element: "Login button" });

    // Wait for dashboard to load
    await Tools.Net.webWaitFor(undefined, "#dashboard", 15000);

    // Extract data using JavaScript
    const dataResult = await Tools.Net.webEval(
        undefined,
        `JSON.stringify({
            username: document.querySelector('.user-info').textContent,
            balance: document.querySelector('.balance').textContent
        })`
    );

    const data = JSON.parse(dataResult.value);

    // Clean up - close session
    await Tools.Net.stopWeb();

    return data;
}
```

### 模式 3：带进度跟踪的文件上传

```
async function uploadDocuments(files) {
    const results = [];

    for (const file of files) {
        console.log(`Uploading ${file.path}...`);

        const result = await Tools.Net.uploadFile({
            url: "https://api.example.com/upload",
            files: [{
                path: file.path,
                field_name: "document",
                mime_type: file.mimeType
            }],
            form_data: {
                user_id: "12345",
                category: file.category
            },
            headers: {
                "Authorization": "Bearer " + file.token
            }
        });

        if (result.statusCode === 200) {
            const response = JSON.parse(result.content);
            results.push({
                file: file.path,
                upload_id: response.id,
                success: true
            });
        } else {
            results.push({
                file: file.path,
                error: result.content,
                success: false
            });
        }
    }

    return results;
}
```

### 模式 4：下载与处理

```
async function downloadAndExtract() {
    // Download archive
    const downloadResult = await Tools.Files.download(
        "https://example.com/data.zip",
        "/sdcard/Download/data.zip"
    );

    if (!downloadResult.successful) {
        throw new Error("Download failed: " + downloadResult.details);
    }

    // Extract archive
    await Tools.Files.unzip(
        "/sdcard/Download/data.zip",
        "/sdcard/Download/extracted/"
    );

    // Process extracted files
    const files = await Tools.Files.list("/sdcard/Download/extracted/");

    for (const entry of files.entries) {
        if (!entry.isDirectory && entry.name.endsWith(".txt")) {
            const content = await Tools.Files.read(
                "/sdcard/Download/extracted/" + entry.name
            );
            console.log("Processing:", entry.name);
            // ... process content
        }
    }
}
```

### 模式 5：错误处理与重试

```
async function robustHttpRequest(url, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await Tools.Net.httpGet(url);

            if (result.statusCode >= 200 && result.statusCode < 300) {
                return result;
            }

            // Server error - retry
            if (result.statusCode >= 500) {
                console.log(`Attempt ${attempt} failed with ${result.statusCode}, retrying...`);
                await Tools.System.sleep(1000 * attempt);  // Exponential backoff
                continue;
            }

            // Client error - don't retry
            throw new Error(`HTTP ${result.statusCode}: ${result.statusMessage}`);

        } catch (e) {
            if (attempt === maxRetries) {
                throw e;
            }
            console.log(`Attempt ${attempt} failed with error, retrying...`);
            await Tools.System.sleep(1000 * attempt);
        }
    }
}
```

---

## 与系统提示词的集成

当工具启用时，网络工具会在系统提示词中记录。AI 助手会接收所有网络操作的描述和参数架构。

### 系统提示词集成

```
private const val TOOL_USAGE_GUIDELINES_EN = """
When calling a tool, the user will see your response, and then will
automatically send the tool results back to you in a follow-up message.
 
Before calling a tool, briefly describe what you are about to do.
 
To use a tool, use this format in your response:
 
<tool name="tool_name">
<param name="parameter_name">parameter_value</param>
</tool>
"""
```

网络工具出现在 `AVAILABLE_TOOLS_SECTION` 中，附带完整的参数文档，使 AI 能够就何时以及如何使用它们做出明智的决策。

**AI 推理示例：**

```
User: "Check the weather API"

AI: I'll fetch the current weather data from the API.

<tool name="http_request">
<param name="url">https://api.weather.com/v1/current?city=London</param>
<param name="method">GET</param>
<param name="headers">{"Authorization": "Bearer API_KEY"}</param>
</tool>

```

---

## 权限要求

网络工具在 **STANDARD** 权限级别下运行，仅需要基本的 Android 权限：
权限用途`INTERNET`HTTP 操作的网络访问`ACCESS_NETWORK_STATE`请求前检查连接状态
网络操作不需要提升权限(无障碍、Root 或 Shizuku)。应用安装后即可使用所有工具。

有关权限系统的信息，请参阅 [Permission System](/AAswordman/Operit/8.1-database-architecture)。

---

## 高级主题

### 自定义 OkHttp 配置

HTTP 客户端可以配置自定义超时、拦截器和连接池：

```
// Conceptual customization (not directly exposed)
val client = OkHttpClient.Builder()
    .connectTimeout(30, TimeUnit.SECONDS)
    .readTimeout(30, TimeUnit.SECONDS)
    .writeTimeout(30, TimeUnit.SECONDS)
    .addInterceptor(LoggingInterceptor())
    .cookieJar(PersistentCookieJar())
    .build()
```

### Cookie 存储实现

Cookie 按域名持久化存储，应用重启后仍然保留。存储实现使用 Android 的 DataStore 或基于文件的持久化：

```
// Conceptual cookie storage structure
class CookieManager {
    private val cookies: MutableMap<String, Map<String, String>> = mutableMapOf()

    fun getCookies(domain: String): Map<String, String> {
        return cookies[domain] ?: emptyMap()
    }

    fun setCookies(domain: String, newCookies: Map<String, String>) {
        cookies[domain] = newCookies
        persistToDisk()
    }

    fun clearCookies(domain: String) {
        cookies.remove(domain)
        persistToDisk()
    }
}
```

### 内容类型检测

系统自动检测上传和下载的内容类型：

- 文件扩展名映射到 MIME 类型(`image/png`、`application/pdf` 等)
- 二进制内容在 `HttpResponseData.contentBase64` 中进行 Base64 编码
- 文本内容保留在 `HttpResponseData.content` 中

### 网页抓取中的链接解析

`visit_web` 工具将相对 URL 解析为绝对 URL：

```
Base URL: https://example.com/articles/page1.html
Relative link: ../images/photo.jpg
Resolved: https://example.com/images/photo.jpg

```

这确保 `VisitWebResultData.links` 中的所有链接可以直接用于后续请求。

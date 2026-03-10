# Markdown 渲染

本页面记录了 Operit 中的 markdown 渲染系统，该系统将 AI 生成的 markdown 内容转换为丰富的交互式 UI 组件。该系统支持流式渲染(随着 AI 逐字符生成内容)和静态渲染(用于完整消息)。

有关 markdown 内容如何在聊天系统中流转的信息，请参阅 [消息处理](/AAswordman/Operit/3.2-delegate-pattern-architecture)。有关支持渲染管道的 Stream 抽象的详细信息，请参阅代码库中的流式工具。

## 架构概览

markdown 渲染系统由四个主要层组成：**解析**、**节点构建**、**渲染**和**专用显示组件**。

```
Character Stream
(Stream<Char>)

Stream Plugin System
NestedMarkdownProcessor

Block-Level Parsing
Headers, Code, Tables, XML

Inline-Level Parsing
Bold, Italic, Links, LaTeX

Markdown Node Tree
MarkdownNode / MarkdownNodeStable

StreamMarkdownRenderer

CanvasMarkdownNodeRenderer

Specialized Components

EnhancedCodeBlock

EnhancedTableBlock

CustomXmlRenderer

PlanExecutionRenderer

MarkdownImageRenderer
```

## Markdown 节点类型

该系统定义了一套全面的节点类型，用于表示不同的 markdown 结构。所有类型都在 `MarkdownProcessorType` 枚举中定义。
TypeCategoryDescriptionPlugin`HEADER`BlockATX-style headers (# - ######)`StreamMarkdownHeaderPlugin``BLOCK_QUOTE`BlockBlockquotes (> text)`StreamMarkdownBlockQuotePlugin``CODE_BLOCK`BlockFenced code blocks (`language`)`StreamMarkdownFencedCodeBlockPlugin``ORDERED_LIST`BlockNumbered lists (1. item)`StreamMarkdownOrderedListPlugin``UNORDERED_LIST`BlockBullet lists (* item)`StreamMarkdownUnorderedListPlugin``HORIZONTAL_RULE`BlockHorizontal dividers (---)`StreamMarkdownHorizontalRulePlugin``TABLE`BlockMarkdown tables`StreamMarkdownTablePlugin``BLOCK_LATEX`BlockLaTeX math blocks ($$...$$)`StreamMarkdownBlockLaTeXPlugin``XML_BLOCK`BlockCustom XML tags`StreamXmlPlugin``PLAN_EXECUTION`BlockPlan execution graphs`StreamPlanExecutionPlugin``BOLD`InlineBold text (**text**)`StreamMarkdownBoldPlugin``ITALIC`InlineItalic text (*text\*)`StreamMarkdownItalicPlugin``INLINE_CODE`InlineInline code (`code`)`StreamMarkdownInlineCodePlugin``LINK`InlineHyperlinks`StreamMarkdownLinkPlugin``IMAGE`InlineImages (![alt])`StreamMarkdownImagePlugin``STRIKETHROUGH`InlineStrikethrough (text)`StreamMarkdownStrikethroughPlugin``UNDERLINE`InlineUnderline (**text**)`StreamMarkdownUnderlinePlugin``INLINE_LATEX`InlineInline LaTeX ($...$)`StreamMarkdownInlineLaTeXPlugin``PLAIN_TEXT`InlineUnformatted text(default)

## 流式处理管道

流式处理管道通过一系列处理阶段将字符流转换为渲染的 UI 组件。

```
100ms batches

Stream<Char>

StreamInterceptor
Batch Updates

streamSplitBy
Block Plugins

Block MarkdownNode

streamSplitBy
Inline Plugins

Inline MarkdownNode
Children

toStableNode()
MarkdownNodeStable

UI Rendering
```

### 字符流处理

渲染从字符流开始，该字符流被拦截并批量处理以提高性能：

1. **拦截**：`StreamInterceptor` 包装源流并每 100ms 批量更新一次
2. **块级解析**：`streamSplitBy()` 操作符使用块级插件识别主要的 markdown 结构
3. **内联解析**：对于容器块(段落、标题、列表)，第二遍应用内联插件
4. **节点构建**：每个解析的片段成为一个带有 `SmartString` 内容缓冲区的 `MarkdownNode`
5. **稳定化**：节点被转换为不可变的 `MarkdownNodeStable` 用于 UI 渲染

### BatchNodeUpdater

`BatchNodeUpdater` 类管理可变节点列表与渲染 UI 之间的同步：

```
Not Active

Already Active

New Character

startBatchUpdates()

Check if Job Active

Lock Stream

delay(100ms)

Unlock Stream

synchronizeRenderNodes()

Convert to MarkdownNodeStable

Trigger Fade-in Animation

Skip
```

更新器通过检查更新任务是否已在进行中来防止冗余更新。触发时，它会锁定流 100ms 以将多个字符更新批量处理在一起。

## 节点数据结构

### MarkdownNode

`MarkdownNode` 是流处理过程中使用的可变数据结构：

```
class MarkdownNode(
    val type: MarkdownProcessorType,
    initialContent: String = ""
) {
    val content: SmartString = SmartString(initialContent)
    val children: SnapshotStateList<MarkdownNode> = mutableStateListOf()
}
```

- **`content`**：使用 `SmartString`，它会缓存 `toString()` 结果以提升性能
- **`children`**：保存内联节点(对于块节点)或嵌套结构
- **可变**：内容可以随着字符流入而追加

### MarkdownNodeStable

`MarkdownNodeStable` 是用于渲染的不可变、`@Stable` 版本：

```
@Stable
data class MarkdownNodeStable(
    val type: MarkdownProcessorType,
    val content: String,
    val children: List<MarkdownNodeStable>
)
```

这种不可变结构使 Compose 能够在节点内容未改变时高效跳过重组。

## 渲染系统

### StreamMarkdownRenderer

`StreamMarkdownRenderer` 可组合函数有两个重载版本：一个用于流式处理，一个用于静态内容。

#### 流式变体

```
@Composable
fun StreamMarkdownRenderer(
    markdownStream: Stream<Char>,
    modifier: Modifier = Modifier,
    textColor: Color = LocalContentColor.current,
    backgroundColor: Color = MaterialTheme.colorScheme.surface,
    onLinkClick: ((String) -> Unit)? = null,
    xmlRenderer: XmlContentRenderer = remember { DefaultXmlRenderer() },
    state: StreamMarkdownRendererState? = null,
    fillMaxWidth: Boolean = true
)
```

- **流处理**：逐字符收集并增量构建节点
- **状态保持**：使用 `StreamMarkdownRendererState` 在重组过程中维护状态
- **批量渲染**：每 100ms 更新一次 UI，而非逐字符更新

#### 静态变体

```
@Composable
fun StreamMarkdownRenderer(
    content: String,
    modifier: Modifier = Modifier,
    // ... same parameters ...
)
```

- **缓存支持**：使用 `MarkdownNodeCache`(100 条目的 LRU 缓存)避免重复解析
- **快速路径**：如果内容与先前收集的流内容匹配，则跳过解析
- **后台解析**：在 `Dispatchers.IO` 上解析以避免阻塞 UI 线程

### 基于 Canvas 的渲染

对于简单的文本元素(标题、段落、列表)，系统使用基于 canvas 的渲染以提升性能。

```
MarkdownNodeStable

renderNodeContent()

Simple Text Node
HEADER, PLAIN_TEXT, LIST

Complex Component
CODE_BLOCK, TABLE, XML

UnifiedCanvasRenderer

calculateLayout()

DrawInstruction List

PaintCache.getPaint()

LayoutCache.getLayout()

Canvas.drawIntoCanvas()

Compose Component
```

#### DrawInstruction 系统

canvas 渲染器生成绘制指令而非可组合函数：
指令类型用途字段`DrawInstruction.Text`单行文本`text`, `x`, `y`, `paint``DrawInstruction.Line`水平/垂直线`startX`, `startY`, `endX`, `endY`, `paint``DrawInstruction.TextLayout`带换行的多行文本`layout: StaticLayout`, `x`, `y`, `text: CharSequence`

#### 性能优化

画布渲染系统采用了多种缓存策略：

1. **PaintCache**：基于颜色、大小和字体复用 `Paint` 和 `TextPaint` 对象
2. **LayoutCache**：缓存 `StaticLayout` 实例(LRU 缓存容量为 100)
3. **基于内容的键**：使用 `node.content.length` 作为键来检测变化
4. **视口裁剪**：仅绘制可见裁剪边界内的指令

## 自定义 XML 扩展

系统通过自定义 XML 标签扩展了标准 markdown，以支持 AI 特定功能。

### XmlContentRenderer 接口

```
interface XmlContentRenderer {
    @Composable
    fun RenderXmlContent(
        xmlContent: String,
        modifier: Modifier,
        textColor: Color
    )
}
```

两种实现：

- **`DefaultXmlRenderer`**：在带边框的容器中将 XML 显示为纯文本
- **`CustomXmlRenderer`**：处理用于 AI 交互的特殊标签

### CustomXmlRenderer 标签

`CustomXmlRenderer` 识别并特殊渲染以下 XML 标签：
标签用途显示行为`<think>`, `<thinking>`AI 推理过程带淡入效果的可折叠部分`<search>`搜索来源/基础信息带 markdown 渲染的可折叠部分`<tool>`工具调用请求根据长度显示紧凑或详细视图`<tool_result>`工具执行结果带图标的成功/错误显示`<status>`状态更新根据类型显示彩色卡片`<html>`HTML 内容WebView 渲染`<mood>`AI 情绪指示器表情符号显示`<plan>`计划执行图形可视化
**工具渲染的示例流程：**

```
Closed

Unclosed

< 200 chars

>= 200 chars

<tool name='read_file'>
<param name='path'>file.txt</param>
</tool>

extractTagName() = 'tool'

isXmlFullyClosed()

extractParamsFromTool()

Check content.length

CompactToolDisplay

DetailedToolDisplay

Wait for completion
```

### 思考过程渲染

思考块(`<think>` 或 `

- **流式传输期间**：根据保存在 `rememberLocal` 中的用户偏好展开/折叠
- **完成后**：默认始终折叠
- **动画**：箭头图标 300ms 旋转动画

## 专用渲染器

### EnhancedCodeBlock

代码块渲染器提供语法高亮、复制功能和 Mermaid 图表支持。

**主要特性：**
功能实现文件引用语法高亮`highlightCode()` 函数
Mermaid 渲染器创建了一个 HTML 模板，包含：

- 与应用匹配的深色主题
- 缩放控制(双指缩放、+/- 按钮)
- 大型图表的平移/拖动支持
- 触摸优化交互

### EnhancedTableBlock

渲染 Markdown 表格，支持正确对齐和水平滚动。

```
Table Markdown Content

parseTable()

TableData
rows + hasHeader

calculateTextWidth()

List<Int> column widths

Horizontal ScrollView

Render Rows with key()

Box with fixed width
```

**宽度计算**：`calculateTextWidth()` 函数根据字符类型估算宽度：

- CJK 表意字符：16 dp
- 字母/数字：8 dp
- 标点符号：6 dp
- 最小列宽：80 dp

### PlanExecutionRenderer

将 AI 任务规划显示为交互式图形可视化。

**XML 结构：**

```
<plan>
  <graph><![CDATA[{ "tasks": [...], "edges": [...] }]]></graph>
  <update id="task1" status="IN_PROGRESS"/>
  <log>Executing step 1...</log>
  <summary>Plan completed successfully</summary>
</plan>
```

渲染器解析此结构并使用 Canvas 绘制创建可视化工作流图，包括：

- 按状态着色的任务节点(TODO、IN_PROGRESS、COMPLETED、FAILED)
- 显示依赖关系的边
- 进度指示器和日志
- 用于导航的缩放/平移手势

### 工具显示组件

#### CompactToolDisplay

以单行格式渲染工具调用：

```
[Icon] tool_name   first_param_value...

```

- 通过 `getToolIcon()` 选择图标(File、Web、Terminal 等)
- 提取第一个参数作为摘要
- 可点击显示详情对话框(如果 `enableDialog=true`)

#### DetailedToolDisplay

以卡片格式渲染工具调用，包含：

- 标题中的工具图标和名称
- 参数数量指示器
- 带行号的代码风格参数显示
- 可滚动内容区域(最大高度 200dp)
- 流式传输期间自动滚动到底部

#### ToolResultDisplay

以缩进方式渲染工具执行结果：

```
    ↳ [✓/✗] result_text...

```

- 使用 `SubdirectoryArrowRight` 图标表示这是上述工具调用的结果
- 成功(✓)或错误(✗)图标，带颜色编码
- 内联显示最多 200 个字符
- 支持复制按钮和详情对话框

### MarkdownImageRenderer

处理图片渲染，支持预览和下载功能。

**解析函数：**

- `isCompleteImageMarkdown()`：验证 `!<FileRef file-url="https://github.com/AAswordman/Operit/blob/3e7f668e/alt" undefined  file-path="alt">Hii</FileRef>` 语法
- `extractMarkdownImageAlt()`：提取替代文本
- `extractMarkdownImageUrl()`：提取图片 URL

**显示特性：**

- 使用 Coil `SubcomposeAsyncImage` 实现高效加载
- 最大高度限制(默认 160dp)
- 加载过程中显示加载指示器
- 点击后显示全屏预览对话框
- 预览中支持缩放(0.5x - 3x)和平移手势
- 下载到相册功能

## 状态管理

### StreamMarkdownRendererState

在重组和模式切换(流式 ↔ 静态)过程中维护渲染状态：

```
@Stable
class StreamMarkdownRendererState {
    val nodes: SnapshotStateList<MarkdownNode>
    val renderNodes: SnapshotStateList<MarkdownNodeStable>
    val nodeAnimationStates: SnapshotStateMap<String, Boolean>
    val conversionCache: SnapshotStateMap<Int, Pair<Int, MarkdownNodeStable>>
    val collectedContent: SmartString
    var rendererId: String
}
```

**关键行为：**

- **转换缓存**：将节点索引映射到(内容长度，稳定节点)以避免冗余转换
- **动画状态**：跟踪哪些节点应显示淡入动画
- **内容跟踪**：保留收集的流式内容以检测静态内容何时匹配

### 动画系统

新节点通过 800ms 的淡入动画提供流式传输过程中的视觉反馈：

```
Add MarkdownNodeStable
to renderNodes

nodeAnimationStates[key] = false

delay(16ms)
(one frame)

nodeAnimationStates[key] = true

animateFloatAsState
0f → 1f (800ms)
```

`AnimatedNode` 组件隔离动画状态以防止触发父组件重组：

## 插件系统

插件系统使用 `StreamPlugin` 接口在字符流式传输时识别 markdown 结构。

### 插件状态机

每个插件维护一个状态：

```
enum class PluginState {
    IDLE,       // Not matching anything
    TRYING,     // Partial match in progress
    PROCESSING, // Full match confirmed, consuming content
    WAITFOR     // (Used by some plugins for multi-line patterns)
}
```

**示例：粗体插件状态转换**

```
First '*' char

Second '*' + non-asterisk

NoMatch

Content chars

Closing '**'

IDLE

TRYING

PROCESSING
```

### StreamKmpGraph

插件使用 KMP(Knuth-Morris-Pratt)模式匹配系统进行高效的逐字符解析：

```
kmpPattern {
    literal("**")        // Match exactly "**"
    noneOf('*', '\n')   // Next char must not be * or newline
}
```

基于图的匹配器返回：

- `StreamKmpMatchResult.Match`：模式完全匹配，包含捕获组
- `StreamKmpMatchResult.InProgress`：部分匹配，继续缓冲
- `StreamKmpMatchResult.NoMatch`：模式中断，重置

## 性能特性

### 流式性能

优化影响实现100ms Batching减少 10 倍重组次数`BatchNodeUpdater` 带延迟Content-Length Keys内容未改变时跳过转换`remember(node.content.length)`Paint/Layout Cache避免重新创建原生对象`PaintCache`、`LayoutCache` 中的 LRU 缓存Viewport Culling仅绘制可见指令canvas 中的 `getClipBounds()` 检查Stable AnnotationsCompose 跳过重组`MarkdownNodeStable` 上的 `@Stable`SmartString Cache避免冗余字符串创建`SmartString` 中缓存的 `toString()`

### 内存管理

- **Node Cache**：100 条已解析消息的 LRU 缓存可防止重新解析常见内容
- **Lazy Conversion**：仅在渲染需要时才将节点转换为稳定形式
- **Cleared References**：转换后旧的 `MarkdownNode` 实例可被垃圾回收

## 无障碍支持

渲染系统包含全面的无障碍支持：

### 内容描述

每种渲染块类型都有用于屏幕阅读器的语义描述：

```
Box(modifier = modifier.semantics {
    contentDescription = accessibleText
})
```

**文本提取**：`extractAccessibleText()` 函数从绘制指令构建可读文本，排除装饰性元素如线条。

### 本地化描述

描述使用字符串资源进行本地化：

- `R.string.code_block` → "代码块"
- `R.string.table_block` → "表格块"
- `R.string.tool_call_block` → "工具调用块"
- `R.string.thinking_process_block` → "思考过程块"

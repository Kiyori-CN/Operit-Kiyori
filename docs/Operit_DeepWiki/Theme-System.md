# 主题系统

## 目的与范围

本文档描述了 Operit 的主题和视觉定制系统,该系统为用户提供了对应用程序外观的广泛控制。主题系统管理配色方案、背景媒体、透明度效果和聊天特定样式选项。它实现了 Material Design 3 (Material You) 原则,同时允许超越标准系统主题的深度定制。

有关聊天消息显示样式(Cursor vs. Bubble)的信息，请参阅 [Markdown Rendering](/AAswordman/Operit/4.2-markdown-rendering) 中描述的 UI 渲染组件。有关设置 UI 实现细节，请参阅 [Settings Screens](/AAswordman/Operit/4.4-settings-screens)。

---

## 架构概览

主题系统在多个层面运行：基于 DataStore 的偏好设置用于持久化，响应式 StateFlow 流用于 UI 更新，以及 Jetpack Compose Material3 主题用于跨组件的一致样式。

### 主题系统架构

```
State Management

Chat Components

UI Layer

Preference Storage

UserPreferencesManager
(DataStore)

Theme Preferences:
- followSystemTheme
- isDarkMode
- useCustomColors
- primaryColor
- secondaryColor

Background Preferences:
- useBackgroundImage
- backgroundImageUri
- backgroundVideoUri
- mediaType

Transparency Preferences:
- chatHeaderTransparent
- chatInputTransparent
- chatHeaderOverlayMode

OperitApp
(Root Composable)

MaterialTheme
(Material3)

ColorScheme
(Dynamic/Custom)

Theme Settings Screen

Color Picker Dialog

AIChatScreen

ChatArea

Message Components:
- CursorStyleChatMessage
- BubbleStyleChatMessage

Background Media:
- Image Layer
- Video Layer

StateFlow Streams:
- useBackgroundImage
- backgroundImageUri
- chatHeaderTransparent
- primaryColor
etc.
```

---

## 主题模式管理

### 系统主题集成

Operit 默认遵循 Android 系统主题设置，但允许手动覆盖。主题模式决定应用程序使用浅色还是深色配色方案。
偏好设置键类型描述`followSystemTheme``Boolean`为 true 时，主题跟随系统深色模式`isDarkMode``Boolean`禁用系统主题时的手动主题选择
应用程序使用 Material3 的 `ColorScheme`，它提供语义化颜色标记(primary、secondary、surface、background 等)，可自动适应浅色/深色主题。

**配色方案解析流程：**

```
Yes

Yes

No

Dark

Light

Yes

No

System Dark Mode
Setting

followSystemTheme?

isDarkMode
Manual Setting

Light ColorScheme

Dark ColorScheme

useCustomColors?

Apply Custom
Primary/Secondary

Final ColorScheme
Applied to MaterialTheme
```

---

## 自定义颜色配置

### 颜色选择器集成

主题系统集成了 `com.github.skydoves:colorpicker` 库，提供高级颜色选择界面。用户可以独立自定义主色和辅助色。

**自定义颜色属性：**
属性类型描述`useCustomColors``Boolean`启用/禁用自定义配色方案`primaryColor``Int`主色(ARGB 整数)`secondaryColor``Int`辅助色(ARGB 整数)`chatHeaderHistoryIconColor``Int?`历史图标的自定义颜色`chatHeaderPipIconColor``Int?`画中画图标的自定义颜色

### 颜色应用

当启用自定义颜色时，系统会覆盖 Material3 的默认颜色生成：

1. 基础 ColorScheme 从系统主题生成
2. 主色替换 `primary`、`primaryContainer` 及相关标记
3. 辅助色替换 `secondary`、`secondaryContainer` 及相关标记
4. 对比色自动计算以确保可访问性

**颜色选择器功能：**

- HSV 色彩空间选择器
- RGB 手动输入
- 最近使用的颜色历史
- 推荐的颜色预设
- 高/低对比度验证
- 实时预览

---

## 背景媒体系统

### 背景自定义架构

主题系统支持聊天界面的静态图像和视频背景。通过透明度控制在保持文本可读性的同时创造沉浸式体验。

```
Transparency Controls

Rendering Layer

Media Selection

Background Configuration

Media Type Selection:
- IMAGE
- VIDEO

backgroundImageUri
(Content URI)

backgroundVideoUri
(Content URI)

useBackgroundImage
(Boolean)

Image Picker
(ActivityResultContracts)

Video Picker
(ActivityResultContracts)

Image Cropper
(com.vanniktech:cropper)

Box with background

AsyncImage
(Coil)

ExoPlayer
AndroidView

Chat Content
(with transparency)

chatHeaderTransparent

chatInputTransparent

chatHeaderOverlayMode

Surface alpha: 0.85f
Transparent: 0.0f
```

**背景媒体配置：**
偏好设置类型描述`useBackgroundImage``Boolean`启用/禁用背景媒体`backgroundImageUri``String?`静态图像的内容 URI`backgroundVideoUri``String?`视频文件的内容 URI`backgroundMediaType``MediaType`IMAGE 或 VIDEO 枚举

### 透明度系统

当启用背景媒体时，UI 组件应用透明度以保持视觉层次，同时允许背景显示：

**透明度值：**

```
// From AIChatScreen.kt
val inputSurfaceColor = when {
    chatInputTransparent -> colorScheme.surface.copy(alpha = 0f)
    hasBackgroundImage -> colorScheme.surface.copy(alpha = 0.85f)
    else -> colorScheme.surface
}
```

**叠加模式：**

- **标准模式**：标题和内容垂直堆叠，均为半透明
- **覆盖模式**：启用 `chatHeaderOverlayMode` 后标题浮动在内容上方
- **透明输入**：输入区域可以完全或部分透明

---

## 聊天特定样式

### 消息颜色系统

主题系统为不同消息类型定义语义化颜色，这些颜色派生自 Material3 ColorScheme：

**消息类型颜色：**

```
Message Colors

Material3 ColorScheme

primary

primaryContainer

surface

surfaceVariant

onPrimaryContainer

onSurface

onSurfaceVariant

userMessageColor

userTextColor

aiMessageColor

aiTextColor

systemMessageColor

systemTextColor

thinkingBackgroundColor

thinkingTextColor
```

### 聊天样式系统

支持两种不同的聊天样式，每种具有不同的视觉呈现：
样式描述使用场景`CURSOR`现代代码编辑器风格，内联消息默认，技术讨论`BUBBLE`传统消息应用风格，气泡对话框休闲对话，角色卡片
**样式特定渲染：**

`ChatStyle` 枚举决定使用哪个渲染组件：

```
// From ChatArea.kt:409-442
when (chatStyle) {
    ChatStyle.CURSOR -> {
        CursorStyleChatMessage(
            message = message,
            userMessageColor = userMessageColor,
            aiMessageColor = aiMessageColor,
            // ... color parameters
        )
    }
    ChatStyle.BUBBLE -> {
        BubbleStyleChatMessage(
            message = message,
            userMessageColor = userMessageColor,
            aiMessageColor = aiMessageColor,
            // ... color parameters
        )
    }
}
```

### 聊天区域内边距

系统支持自定义聊天区域的水平内边距：

- **偏好设置键**：`chatAreaHorizontalPadding`
- **类型**：`Float`
- **默认值**：16f (dp)
- **应用于**：消息容器、标题、输入区域

---

## 状态管理

### UserPreferencesManager

主题偏好设置的中央管理器使用 Jetpack DataStore 实现类型安全的异步存储：

**关键方法：**
方法返回类型用途`followSystemTheme``Flow<Boolean>`主题跟随系统设置`isDarkMode``Flow<Boolean>`手动深色模式选择`useCustomColors``Flow<Boolean>`启用自定义配色方案`primaryColor``Flow<Int?>`主色值`secondaryColor``Flow<Int?>`辅助色值`useBackgroundImage``Flow<Boolean>`启用背景媒体`backgroundImageUri``Flow<String?>`背景图片 URI`chatHeaderTransparent``Flow<Boolean>`标题栏透明度`chatInputTransparent``Flow<Boolean>`输入框透明度

### 响应式状态流

所有偏好设置都以 `StateFlow` 实例的形式暴露，Compose UI 会自动观察：

```
// From AIChatScreen.kt
val useBackgroundImage by preferencesManager.useBackgroundImage.collectAsState(initial = false)
val backgroundImageUri by preferencesManager.backgroundImageUri.collectAsState(initial = null)
val chatHeaderTransparent by preferencesManager.chatHeaderTransparent.collectAsState(initial = false)
```

这创建了单向数据流：DataStore → Flow → StateFlow → Compose 重组。

---

## 色彩方案传播

### Material Theme 集成

应用程序根节点建立 `MaterialTheme` 可组合项，将色彩方案传播到所有子组件：

```
OperitApp
(Root)

Theme Configuration:
- followSystemTheme
- isDarkMode
- useCustomColors

Generate ColorScheme:
- dynamicColorScheme()
- darkColorScheme()
- lightColorScheme()

Apply Custom Colors
if useCustomColors

MaterialTheme(colorScheme)

All Screens:
- AIChatScreen
- SettingsScreen
- AboutScreen
etc.

ColorScheme Usage:
MaterialTheme.colorScheme.primary
MaterialTheme.colorScheme.surface
etc.
```

### 组件级颜色派生

需要特定颜色的组件(如聊天消息)在组合时从 MaterialTheme 派生颜色：

```
// From AIChatScreen.kt:317-326
val backgroundColor = if (hasBackgroundImage) Color.Transparent else MaterialTheme.colorScheme.background
val userMessageColor = MaterialTheme.colorScheme.primaryContainer
val aiMessageColor = MaterialTheme.colorScheme.surface
val userTextColor = MaterialTheme.colorScheme.onPrimaryContainer
val aiTextColor = MaterialTheme.colorScheme.onSurface
val systemMessageColor = MaterialTheme.colorScheme.surfaceVariant
val systemTextColor = MaterialTheme.colorScheme.onSurfaceVariant
val thinkingBackgroundColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.7f)
val thinkingTextColor = MaterialTheme.colorScheme.onSurfaceVariant
```

这些颜色随后通过组件层次结构向下传递到消息渲染器。

---

## 主题设置界面

### 设置屏幕结构

主题设置屏幕(`ThemeSettingsScreen` 或在常规设置中)提供：

1. **主题模式部分**

- 系统主题切换
- 手动亮色/暗色选择

2. **颜色自定义部分**

- 启用自定义颜色切换
- 主色选择器按钮
- 辅助色选择器按钮
- 颜色预览样本

3. **背景媒体部分**

- 启用背景切换
- 媒体类型选择(图片/视频)
- 文件选择器按钮
- 清除背景选项

4. **聊天样式部分**

- 标题透明度切换
- 输入框透明度切换
- 覆盖模式切换
- 水平内边距滑块

### 字符串资源

所有 UI 文本通过字符串资源进行本地化，键名以 `theme_` 为前缀：
字符串键英文值用途`theme_title_mode`"Theme Mode"章节标题`theme_follow_system`"Follow system theme"切换标签`theme_use_custom_color`"Use custom colors"切换标签`theme_primary_color`"Primary color"按钮标签`theme_select_color`"Select color"对话框标题`theme_use_custom_bg`"Use custom background"切换标签

---

## 依赖项

### 主题相关库

库版本/别名用途`androidx.compose.material3`BOM 管理Material Design 3 组件和主题`com.github.skydoves:colorpicker``libs.colorpicker`高级颜色选择器 UI`io.coil-kt:coil-compose``libs.coil.compose`背景图片加载`androidx.media3:media3-exoplayer``libs.exoplayer`背景视频播放`com.vanniktech:android-image-cropper``libs.image.cropper`背景图片裁剪

---

## 实现细节

### ColorScheme 应用流程

```
Composables
MaterialTheme
OperitApp
DataStore
UserPrefsManager
ThemeSettings
User
Composables
MaterialTheme
OperitApp
DataStore
UserPrefsManager
ThemeSettings
User
On next recomposition
Change primary color
setPrimaryColor(newColor)
write preference
confirm
StateFlow updated
collect primaryColor Flow
newColor
Generate ColorScheme with newColor
Apply ColorScheme
Trigger recomposition
Use MaterialTheme.colorScheme.primary
```

### 背景媒体加载

**图片背景：**

1. 用户通过 `ActivityResultContracts.GetContent` 选择图片
2. 图片 URI 存储在 `backgroundImageUri` 中
3. 可选通过 `ImageCropper` 进行裁剪
4. 来自 Coil 的 `AsyncImage` 加载并显示 URI
5. 内容叠加层应用透明度

**视频背景：**

1. 用户通过文件选择器选择视频
2. 视频 URI 存储在 `backgroundVideoUri` 中
3. 使用 URI 初始化 `ExoPlayer`
4. 视频持续循环播放
5. 内容叠加层应用透明度

---

## 未来考虑

主题系统设计为可扩展，以支持潜在的未来功能：

- **动态 Material You**：从壁纸自动提取颜色(Android 12+)
- **主题预设**：预定义配色方案以便快速切换
- **单聊天主题**：为不同对话设置不同配色方案
- **渐变背景**：更复杂的背景渲染选项
- **动画主题**：可自定义的过渡和动画样式

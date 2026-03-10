# Android Manifest

## 目的与范围

本文档解释了 Operit 的 `AndroidManifest.xml` 文件的结构和内容，该文件声明了所有应用组件、所需权限以及系统集成点。清单文件作为应用程序与 Android 操作系统之间的契约，定义了应用需要哪些功能以及暴露哪些组件。

有关权限如何在运行时请求和管理的信息，请参阅 [权限系统](/AAswordman/Operit/8.1-database-architecture)。有关 Shizuku 和 Root 访问等特定集成机制的详细信息，请参阅 [Shizuku 集成](/AAswordman/Operit/8.2-preferences-system) 和 [Root 授权](/AAswordman/Operit/8.3-chat-data-persistence)。

## 应用配置

应用配置了几个影响系统级行为的关键设置：
配置项值用途`applicationId``com.ai.assistance.operit`唯一包标识符`minSdk`26 (Android 8.0)支持的最低 Android 版本`targetSdk`34 (Android 14)目标 API 级别`android:name``.core.application.OperitApplication`自定义 Application 类`android:largeHeap``true`为 AI 模型推理请求大堆内存`android:usesCleartextTraffic``true`允许本地 Web 服务器使用 HTTP`android:requestLegacyExternalStorage``true`启用传统存储访问模式
应用使用自定义的 `OperitApplication` 类进行初始化，并通过 meta-data 声明支持高刷新率显示。

## 声明的权限

Operit 请求了一组按功能类别组织的综合权限集：

### 权限架构

```
Scheduling

RECEIVE_BOOT_COMPLETED

SCHEDULE_EXACT_ALARM

SET_ALARM

Power Management

REQUEST_IGNORE_BATTERY_OPTIMIZATIONS

WAKE_LOCK

Privileged Access

moe.shizuku.manager.permission.API_V23

Voice & Audio

RECORD_AUDIO

BIND_VOICE_INTERACTION

Foreground Service Types

FOREGROUND_SERVICE

FOREGROUND_SERVICE_SHORT_SERVICE

FOREGROUND_SERVICE_DATA_SYNC

FOREGROUND_SERVICE_SPECIAL_USE

FOREGROUND_SERVICE_MICROPHONE

Telephony & Location

CALL_PHONE

SEND_SMS

READ_SMS / RECEIVE_SMS

ACCESS_FINE_LOCATION

ACCESS_COARSE_LOCATION

System Integration

SYSTEM_ALERT_WINDOW

WRITE_SETTINGS

REQUEST_INSTALL_PACKAGES

QUERY_ALL_PACKAGES

Storage Permissions

READ_EXTERNAL_STORAGE

WRITE_EXTERNAL_STORAGE

MANAGE_EXTERNAL_STORAGE

Standard Permissions

INTERNET

ACCESS_NETWORK_STATE

POST_NOTIFICATIONS
```

### 核心网络与存储权限

权限是否必需用途`INTERNET`是AI API 调用、网络工具、MCP 包`ACCESS_NETWORK_STATE`是网络连接检测`READ_EXTERNAL_STORAGE`是文件系统工具、工作区访问`WRITE_EXTERNAL_STORAGE`是文件创建、修改`MANAGE_EXTERNAL_STORAGE`是工具所需的无限制文件系统访问

### 系统悬浮窗与设置权限

这些权限用于启用悬浮聊天服务和系统级自动化：
权限用途`SYSTEM_ALERT_WINDOW`系统级 AI 访问的悬浮窗覆盖层`WRITE_SETTINGS`通过自动化工具修改系统设置`REQUEST_INSTALL_PACKAGES`通过包管理工具安装 APK`QUERY_ALL_PACKAGES`枚举已安装应用以实现 UI 自动化`KILL_BACKGROUND_PROCESSES`通过系统工具终止应用

### 前台服务类型配置

Operit 声明了多种前台服务类型以符合 Android 14+ 限制：
服务类型声明用于用途`dataSync``FloatingChatService`、`AIForegroundService`AI 交互的网络 API 调用`specialUse``FloatingChatService`、`UIDebuggerService`自定义 AI 自动化用例`microphone``FloatingChatService`语音输入处理`shortService`通用短时前台任务

### 电话、位置与调度

权限用途`CALL_PHONE`通过自动化拨打电话`SEND_SMS`、`READ_SMS`、`RECEIVE_SMS`短信自动化工具`ACCESS_FINE_LOCATION`、`ACCESS_COARSE_LOCATION`基于位置的工具`SET_ALARM`通过系统工具创建闹钟`SCHEDULE_EXACT_ALARM`精确的工作流调度`RECEIVE_BOOT_COMPLETED`重启后重新调度工作流

### 语音交互权限

权限用途`RECORD_AUDIO`助手的语音输入`BIND_VOICE_INTERACTION`注册为系统默认助手

### 电源管理与电池优化

权限用途`REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`防止后台终止`WAKE_LOCK`在长时间操作期间保持 CPU 唤醒`SUSTAINED_PERFORMANCE_MODE`在 AI 推理期间保持性能

### 特权访问集成

`moe.shizuku.manager.permission.API_V23` 权限在 Shizuku 激活时启用 ADB 级别的访问。此权限仅在 Shizuku 服务运行且已被用户授予时有效。详见 [Shizuku 集成](/AAswordman/Operit/8.2-preferences-system)。

## 声明的活动

Operit 声明了多个具有特定启动模式和 intent 过滤器的 activity：

### Activity 组件层次结构

```
MainActivity
(singleTask)

CrashReportActivity
(separate process)

ActivityConfigAIAgentAction
(Tasker Plugin)

WorkflowTaskerActivityConfig
(Workflow Plugin)

LAUNCHER Intent
(App Entry Point)

GitHub OAuth Callback
(operit://github-oauth-callback)

VIEW Intent
(File Open)

SEND Intent
(Share Target)

:crash process
(Isolated)

Tasker ACTION_EDIT_EVENT

Locale EDIT_SETTING
```

### MainActivity Intent 过滤器

`MainActivity` 作为主要入口点，具有四个不同的 intent 过滤器：

#### 1. Launcher Intent(应用启动)

```
<action android:name="android.intent.action.MAIN" />
<category android:name="android.intent.category.LAUNCHER" />
```

将 Operit 注册为系统启动器中可启动的应用程序。

#### 2. GitHub OAuth 回调

```
<action android:name="android.intent.action.VIEW" />
<category android:name="android.intent.category.DEFAULT" />
<category android:name="android.intent.category.BROWSABLE" />
<data android:scheme="operit" android:host="github-oauth-callback" />
```

处理 GitHub 身份验证后的 OAuth 重定向：`operit://github-oauth-callback`

#### 3. 文件打开意图

```
<action android:name="android.intent.action.VIEW" />
<category android:name="android.intent.category.DEFAULT" />
<category android:name="android.intent.category.BROWSABLE" />
<data android:mimeType="*/*" />
```

允许从其他应用打开文件时选择 Operit。

#### 4. 分享目标 Intent

```
<action android:name="android.intent.action.SEND" />
<category android:name="android.intent.category.DEFAULT" />
<data android:mimeType="*/*" />
```

在系统分享面板中为所有文件类型注册 Operit。

### MainActivity 配置

设置值用途`android:launchMode``singleTask`单实例，复用现有任务`android:configChanges``orientation|keyboardHidden|screenSize|screenLayout`处理配置变更而不重启`android:windowSoftInputMode``adjustPan`键盘出现时平移窗口`android:exported``true`可从外部应用访问

### CrashReportActivity

在独立的 `:crash` 进程中运行，即使主应用崩溃也能显示错误报告：

```
<activity
    android:name=".ui.error.CrashReportActivity"
    android:process=":crash"
    android:exported="false" />
```

### Tasker 插件 Activity

两个 Activity 提供 Tasker/Locale 插件集成：
Activity插件类型Intent Action`ActivityConfigAIAgentAction`AI Agent Action`net.dinglisch.android.tasker.ACTION_EDIT_EVENT``WorkflowTaskerActivityConfig`Workflow Trigger`com.twofortyfouram.locale.intent.action.EDIT_SETTING`

## 声明的服务

Operit 声明了四个具有特定类型配置的前台服务：

### 服务架构图

```
Voice Interaction Services

OperitVoiceInteractionService
BIND_VOICE_INTERACTION

System Default Assistant

OperitVoiceInteractionSessionService
BIND_VOICE_INTERACTION

UIDebuggerService

UIDebuggerService
specialUse

Accessibility Hierarchy Debug

AIForegroundService

AIForegroundService
dataSync

Network Connection Stability

Stream Keep-Alive

FloatingChatService

FloatingChatService
dataSync|specialUse|microphone

Ball Mode Overlay

Window Mode Chat

Fullscreen Chat

Voice Input Processing
```

### FloatingChatService

核心悬浮窗服务，具有多类型前台服务配置：

```
<service
    android:name=".services.FloatingChatService"
    android:foregroundServiceType="dataSync|specialUse|microphone" />
```

服务类型原因`dataSync`维护 AI API 调用的网络连接`specialUse`自定义用例：系统级 AI 覆盖层`microphone`语音输入处理

### AIForegroundService

为长时间运行的 AI 操作维护稳定的网络连接：

```
<service
    android:name=".api.chat.AIForegroundService"
    android:foregroundServiceType="dataSync" />
```

防止在 AI 提供商流式响应期间出现后台限流。

### UIDebuggerService

基于无障碍功能的 UI 调试服务：

```
<service
    android:name=".services.UIDebuggerService"
    android:foregroundServiceType="specialUse" />
```

使用 `specialUse` 类型实现其独特的 UI 检查功能。相关配置请参阅 [Accessibility Service](/AAswordman/Operit/8.4-configuration-storage)。

### Voice Interaction Services

两个服务实现了 Android Voice Interaction 框架：

```
<service
    android:name=".services.assistant.OperitVoiceInteractionService"
    android:permission="android.permission.BIND_VOICE_INTERACTION"
    android:exported="true">
    <intent-filter>
        <action android:name="android.service.voice.VoiceInteractionService" />
    </intent-filter>
</service>
┬Ā
<service
    android:name=".services.assistant.OperitVoiceInteractionSessionService"
    android:permission="android.permission.BIND_VOICE_INTERACTION"
    android:exported="true" />
```

这些服务允许将 Operit 设置为系统默认助手。`BIND_VOICE_INTERACTION` 权限仅授予系统签名应用或作为特权应用安装的应用。

## Broadcast Receivers

Operit 声明了多个广播接收器用于事件处理和插件集成：

### Receiver Component Map

```
Workflow System

Widget System

JavaScript Execution

ScriptExecutionReceiver
EXECUTE_JS

VoiceAssistantWidgetReceiver
APPWIDGET_UPDATE

WorkflowTaskerReceiver
TRIGGER_WORKFLOW|FIRE_SETTING

WorkflowBootReceiver
BOOT_COMPLETED

External Apps/Tasker

Home Screen

Tasker/Locale

System Boot

Reschedule Workflows
```

### ScriptExecutionReceiver

接收来自外部应用的 JavaScript 执行请求：

```
<receiver
    android:name=".core.tools.javascript.ScriptExecutionReceiver"
    android:exported="true">
    <intent-filter>
        <action android:name="com.ai.assistance.operit.EXECUTE_JS" />
    </intent-filter>
</receiver>
```

外部应用可以广播 intent 来触发 JavaScript 代码执行。此接收器已导出，任何应用均可访问。

### VoiceAssistantWidgetReceiver

处理主屏幕小部件更新：

```
<receiver
    android:name=".widget.VoiceAssistantWidgetReceiver"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/voice_assistant_widget_info" />
</receiver>
```

提供主屏幕小部件以快速访问 AI 助手。

### 工作流系统接收器

两个接收器处理工作流自动化：

#### WorkflowTaskerReceiver

```
<receiver
    android:name=".integrations.tasker.WorkflowTaskerReceiver"
    android:exported="true">
    <intent-filter>
        <action android:name="com.ai.assistance.operit.TRIGGER_WORKFLOW" />
        <action android:name="com.twofortyfouram.locale.intent.action.FIRE_SETTING" />
    </intent-filter>
</receiver>
```

接收来自 Tasker/Locale 插件和直接广播的工作流触发事件。

#### WorkflowBootReceiver

```
<receiver
    android:name=".integrations.tasker.WorkflowBootReceiver"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
    </intent-filter>
</receiver>
```

在设备重启后重新调度工作流，确保计划任务在重启后持续存在。

## 内容提供器

Operit 声明了三个内容提供器用于文件访问和框架集成：

### 提供器架构

```
Storage Access Framework

WorkspaceDocumentsProvider
com.ai.assistance.operit.documents.workspace

Storage Access Framework

Workspace Directories

External App Access

File Sharing

FileProvider
com.ai.assistance.operit.fileprovider

APK Installation

Temporary File Sharing

Shizuku Integration

ShizukuProvider
com.ai.assistance.operit.shizuku

Shizuku Framework
Binder IPC
```

### ShizukuProvider

启用 Shizuku 框架集成以实现 ADB 级别访问：

```
<provider
    android:name="rikka.shizuku.ShizukuProvider"
    android:authorities="${applicationId}.shizuku"
    android:exported="true"
    android:multiprocess="false"
    android:permission="android.permission.INTERACT_ACROSS_USERS_FULL" />
```

属性值用途`android:authorities``com.ai.assistance.operit.shizuku`Shizuku 的 IPC 端点`android:exported``true`可被 Shizuku 服务访问`android:permission``INTERACT_ACROSS_USERS_FULL`受系统权限保护
使用详情请参见 [Shizuku 集成](/AAswordman/Operit/8.2-preferences-system)。

### FileProvider

标准 Android FileProvider 用于安全文件共享：

```
<provider
    android:name="androidx.core.content.FileProvider"
    android:authorities="${applicationId}.fileprovider"
    android:exported="false"
    android:grantUriPermissions="true">
    <meta-data
        android:name="android.support.FILE_PROVIDER_PATHS"
        android:resource="@xml/file_paths" />
</provider>
```

用于通过包管理工具进行 APK 安装和临时文件共享。文件路径在 `@xml/file_paths` 中配置。

### WorkspaceDocumentsProvider

自定义存储访问框架(SAF)提供器用于工作区访问：

```
<provider
    android:name=".provider.WorkspaceDocumentsProvider"
    android:authorities="com.ai.assistance.operit.documents.workspace"
    android:exported="true"
    android:grantUriPermissions="true"
    android:permission="android.permission.MANAGE_DOCUMENTS">
    <intent-filter>
        <action android:name="android.content.action.DOCUMENTS_PROVIDER" />
    </intent-filter>
</provider>
```

通过 Android 的文档选择器向外部应用公开工作区目录。需要 `MANAGE_DOCUMENTS` 权限才能访问。实现细节请参阅 [Document Provider](/AAswordman/Operit/7.3-root-authorization)。

## 原生库声明

Operit 声明了用于 GPU 加速的原生库需求：

```
<!-- OpenCL Õ║ōµØāķÖÉÕŻ░µśÄ (Android 10+ ÕæĮÕÉŹń®║ķŚ┤ķÜöń”╗Ķ¦ŻÕå│µ¢╣µĪł) -->
<uses-native-library
    android:name="libOpenCL.so"
    android:required="false" />
┬Ā
<!-- Vulkan Õ║ōµØāķÖÉÕŻ░µśÄ -->
<uses-native-library
    android:name="libvulkan.so"
    android:required="false" />
```

库用途是否必需`libOpenCL.so`用于 AI 推理的 OpenCL GPU 加速否`libvulkan.so`用于渲染的 Vulkan 图形 API否
两者都标记为非必需，允许应用在没有 GPU 加速的设备上运行，同时在可用时启用优化。这解决了 Android 10+ 命名空间隔离问题，即应用无法直接访问系统库。

## WorkManager 初始化控制

清单文件明确禁用了 WorkManager 的自动初始化：

```
<provider
    android:name="androidx.startup.InitializationProvider"
    android:authorities="${applicationId}.androidx-startup"
    android:exported="false"
    tools:node="merge">
    <meta-data
        android:name="androidx.work.WorkManagerInitializer"
        android:value="androidx.startup"
        tools:node="remove" />
</provider>
```

这允许在 `OperitApplication` 中手动初始化，从而控制用于工作流调度的 WorkManager 配置。`tools:node="remove"` 指令从合并的清单中移除默认初始化器。

## Meta-Data 配置

应用级 meta-data 提供额外配置：

### 显示配置

```
<!-- Enable high refresh rate support -->
<meta-data
    android:name="android.max_aspect"
    android:value="2.4" />
┬Ā
<!-- Support high refresh rate displays -->
<meta-data
    android:name="android.allow_high_refresh_rate"
    android:value="true" />
```

启用对高宽比屏幕和高刷新率显示器(90Hz、120Hz 等)的支持。

### ML Kit 分析

```
<!-- Disable Firebase ML Kit analytics -->
<meta-data
    android:name="com.google.firebase.ml.kit.analytics.collection.enabled"
    android:value="false" />
┬Ā
<meta-data
    android:name="firebase_ml_collection_enabled"
    android:value="false" />
```

禁用 ML Kit 文本识别功能的遥测数据收集，确保用户隐私。

## 查询声明

清单声明了包可见性要求：

```
<queries>
    <!-- ÕģüĶ«Ėµ¤źĶ»óÕÆīń╗æÕ«ÜÕł░µŚĀķÜ£ńóŹµ£ŹÕŖĪµÅÉõŠøĶĆģÕ║öńö© -->
    <package android:name="com.ai.assistance.operit.provider" />
</queries>
```

这允许 Operit 检测并与托管无障碍服务的独立提供者应用(`com.ai.assistance.operit.provider`)进行交互。Android 11+ 需要显式的包可见性声明。有关提供者应用架构的详细信息，请参阅[无障碍服务](/AAswordman/Operit/8.4-configuration-storage)。

## 总结：清单组件概览

下表总结了所有声明的组件：
组件类型数量关键示例权限30+`INTERNET`、`MANAGE_EXTERNAL_STORAGE`、`SYSTEM_ALERT_WINDOW`、ShizukuActivities4`MainActivity`、`CrashReportActivity`、2 个 Tasker 配置Services6`FloatingChatService`、`AIForegroundService`、Voice Interaction (2)Receivers4`ScriptExecutionReceiver`、`VoiceAssistantWidgetReceiver`、Workflow (2)Providers3`ShizukuProvider`、`FileProvider`、`WorkspaceDocumentsProvider`原生库2`libOpenCL.so`、`libvulkan.so`
该清单反映了 Operit 作为系统集成 AI 助手的架构，需要广泛的权限来访问文件系统、UI 自动化和特权操作，同时通过前台服务类型和权限声明保持对 Android 框架的正确合规性。

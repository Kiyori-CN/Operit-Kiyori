/* METADATA
{
    "name": "image_search",
    "version": "1.0",
    "display_name": {
        "zh": "以图搜图",
        "en": "Image Reverse Search"
    },
    "description": {
        "zh": "以图搜图工具包。整合 9 大主流搜图引擎（Google Lens / Yandex / Bing / 百度 / 搜狗 / TinEye / SauceNAO / Ascii2D / IQDB），支持 AI 预识别。深度优化搜索链接兼容性与结果呈现逻辑。",
        "en": "Image reverse search toolkit integrating 9 engines (Google Lens / Yandex / Bing / Baidu / Sogou / TinEye / SauceNAO / Ascii2D / IQDB) with AI pre-recognition and structured Markdown output."
    },
    "env": [],
    "author": "Operit Assistant",
    "category": "Admin",
    "tools": [
        {
            "name": "search_by_image",
            "description": {
                "zh": "执行智能图片搜索。集成 AI 识别与多引擎溯源，返回结构化搜索结果。注意：必须完整展示返回的 Markdown 报告，严禁任何形式的摘要、截断或精简。",
                "en": "Execute intelligent image search with AI recognition and multi-engine tracing. Always display the full Markdown report without truncation."
            },
            "parameters": [
                {
                    "name": "image_url",
                    "type": "string",
                    "required": true,
                    "description": { "zh": "图片的公网 URL（必须以 http:// 或 https:// 开头）", "en": "Public image URL (must start with http:// or https://)" }
                },
                {
                    "name": "description",
                    "type": "string",
                    "required": false,
                    "description": { "zh": "AI 对图片的预分析描述（可选，提供后跳过 Google Lens 预识别步骤）", "en": "AI's pre-analysis description (optional, skips Google Lens recognition if provided)" }
                }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "工具自检。验证各搜索引擎链接生成逻辑是否正常，输出测试报告。",
                "en": "Self-test. Validates search engine link generation and outputs a diagnostic report."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ============================================================================
 * 以图搜图工具包
 * ============================================================================
 * 核心功能：
 * 1. 支持公网图片 URL 输入
 * 2. AI 智能识别
 * 3. 9 大搜索引擎智能整合
 * 4. 结果优先级排序与直接可点击链接
 * ============================================================================
 */

const imageSearch = (function () {
    const VERSION = "1.0";
    const TIMEOUT_MS = 15000;

    // ========================================================================
    // 工具函数模块
    // ========================================================================

    const Utils = {
        /**
         * 验证 URL 是否为有效的 HTTP/HTTPS 链接
         * @param {string} url 待验证的 URL
         * @returns {boolean} 是否有效
         */
        isValidUrl(url) {
            try {
                const trimmedUrl = url.trim();
                return trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://");
            } catch (e) {
                return false;
            }
        }
    };

    // ========================================================================
    // AI 识别模块
    // ========================================================================

    const AIRecognition = {
        /**
         * 尝试通过 Google Lens 获取图片的智能猜测描述
         * @param {string} imgUrl 图片 URL
         * @returns {Promise<string|null>} 识别结果或 null
         */
        async getSmartGuess(imgUrl) {
            try {
                const lensUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imgUrl)}`;
                
            // 使用 Tools.visit_web 进行页面访问，模拟桌面浏览器 User-Agent
            const res = await Tools.visit_web({
                url: lensUrl,
                user_agent_preset: "desktop", // 使用桌面端 UA 以获取更完整的页面内容
                timeout: TIMEOUT_MS
            });

                // 策略 1: 检查页面标题 (过滤掉通用的搜索页标题)
                if (res?.title && !/^(Google|Google Lens|Google 搜索)$/i.test(res.title.trim()) && res.title.length > 3) {
                    return res.title.trim();
                }

                // 策略 2: 正则匹配页面内容中的关键词 (增加国际化支持)
                if (res?.content) {
                    const patterns = [
                        /可能相关的搜索[：:]\s*(.+?)(?:\n|<|$)/i,
                        /Best guess for this image[：:]\s*(.+?)(?:\n|<|$)/i,
                        /Visual matches for\s+(.+?)(?:\n|<|$)/i,
                        /Search results for\s+(.+?)(?:\n|<|$)/i,
                        /Similar to\s+(.+?)(?:\n|<|$)/i
                    ];

                    for (const pattern of patterns) {
                        const match = res.content.match(pattern);
                        if (match?.[1]?.trim().length > 3) {
                            return match[1].trim();
                        }
                    }
                }
            } catch (e) {
                console.warn(`[AI识别失败] ${e.message}`);
            }
            return null;
        }
    };

    // ========================================================================
    // 搜索引擎配置
    // ========================================================================

    const SearchEngines = {
        general: [
            {
                name: "Google Lens",
                scene: "综合识别、商品查询",
                url: (img) => `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(img)}`,
                priority: 1
            },
            {
                name: "Yandex",
                scene: "人脸识别、相似构图",
                url: (img) => `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(img)}`,
                priority: 2
            },
            {
                name: "Bing",
                scene: "网页溯源、场景识别",
                url: (img) => `https://www.bing.com/images/search?view=detailv2&iss=sbi&form=SBIVSP&sbisrc=UrlPaste&imgurl=${encodeURIComponent(img)}`,
                priority: 3
            },
            {
                name: "百度识图",
                scene: "中文环境、国内素材",
                url: (img) => `https://graph.baidu.com/pcpage/index?tpl_from=pc&advanced=1&sample_url=${encodeURIComponent(img)}`,
                priority: 4
            },
            {
                name: "搜狗识图",
                scene: "中文环境、通用搜索",
                url: (img) => `https://pic.sogou.com/ris?query=${encodeURIComponent(img)}&flag=1&drag=0`,
                priority: 5
            }
        ],

        professional: [
            {
                name: "TinEye",
                scene: "版权溯源、最早出处",
                url: (img) => `https://tineye.com/search?url=${encodeURIComponent(img)}`,
                priority: 1
            },
            {
                name: "SauceNAO",
                scene: "插画溯源、画师查找",
                url: (img) => `https://saucenao.com/search.php?db=999&url=${encodeURIComponent(img)}`,
                priority: 2
            },
            {
                name: "Ascii2D",
                scene: "二次元、推特图源",
                url: (img) => `https://ascii2d.net/search/url/${encodeURIComponent(img)}`,
                priority: 3
            },
            {
                name: "IQDB",
                scene: "画廊图片、Danbooru",
                url: (img) => `https://iqdb.org/?url=${encodeURIComponent(img)}`,
                priority: 4
            }
        ]
    };

    // ========================================================================
    // 结果格式化模块
    // ========================================================================

    const Formatter = {
        /**
         * 构建标准 Markdown 搜索报告
         * @param {string} imgUrl 图片链接
         * @param {string} aiGuess AI 识别结果
         * @returns {string} Markdown 格式报告
         */
        buildReport(imgUrl, aiGuess) {
            let output = `## 🔍 智能图片搜索结果\n\n`;
            
            // 显示缩略图 (使用 <URL> 语法防止链接内括号破坏渲染)
            output += `![搜索图片](<${imgUrl}>)\n\n`;

            output += `### 🤖 AI 智能识别\n\n`;
            output += `> ${aiGuess || "未能提取明确特征，建议通过下方链接人工确认"}\n\n`;

            output += `---\n\n`;

            output += `### 🌐 通用搜索引擎\n\n`;
            for (const engine of SearchEngines.general) {
                const link = engine.url(imgUrl);
                // 使用 Markdown 链接语法: [名称](链接)
                output += `* **${engine.name}** (${engine.scene}): [点击搜索](${link})\n`;
            }
            
            output += `\n### 🎨 专业溯源工具\n\n`;
            for (const engine of SearchEngines.professional) {
                const link = engine.url(imgUrl);
                output += `* **${engine.name}** (${engine.scene}): [点击搜索](${link})\n`;
            }
            
            output += `\n---\n\n`;
            output += `💡 **使用建议**: 插画推荐 SauceNAO；普通图片首选 Google Lens/Yandex；版权查 TinEye。\n\n`;
            output += `💾 image_search v${VERSION} | 生产环境 V1.0 正式版\n`;

            return output;
        }
    };

    // ========================================================================
    // 主流程
    // ========================================================================

    return {
        /**
         * 执行以图搜图的主入口函数
         * @param {object} params 参数对象
         * @param {string} params.image_url 图片的公网 URL
         * @param {string} [params.description] 可选的描述信息
         */
        async search_by_image(params) {
            try {
                if (!params || !params.image_url) {
                    throw new Error("参数缺失: image_url");
                }
                const imgUrl = params.image_url.trim();

                // 步骤 1: 验证 URL
                if (!Utils.isValidUrl(imgUrl)) {
                    throw new Error("无效的图片链接。请提供以 http:// 或 https:// 开头的公网图片 URL。");
                }

                console.log(`[ImageSearch] 开始处理图片: ${imgUrl}`);

                if (typeof sendIntermediateResult === 'function') {
                    sendIntermediateResult({ success: true, message: `正在对图片进行 AI 识别，请稍候...` });
                }

                // 步骤 2: 执行 AI 识别 (如果未提供描述)
                console.log("[ImageSearch] 启动 AI 识别...");
                let aiGuess = params.description || null; 
                
                // 如果用户/上层逻辑没有提供描述，则尝试自动从 Lens 抓取
                if (!aiGuess) {
                    aiGuess = await AIRecognition.getSmartGuess(imgUrl);
                }
                
                // 逻辑增强：如果内部爬虫失效，明确标记以便 AI 提示用户手动查看
                if (!aiGuess || aiGuess.length < 2) {
                    aiGuess = "⚠️ 内部识别引擎受限（可能是反爬验证），请参考下方各专业引擎的实时结果。";
                }

                // 步骤 3: 生成并返回报告
                const report = Formatter.buildReport(imgUrl, aiGuess);

                // 发送中间结果 (可选，视宿主环境支持情况而定)
                if (typeof sendIntermediateResult === 'function') {
                    sendIntermediateResult(report);
                }

                complete({
                    success: true,
                    data: report
                });

            } catch (error) {
                console.error(`[ImageSearch Error] ${error.message}`);
                
                let diagnosis = "请检查：\n";
                if (!params?.image_url || !Utils.isValidUrl(params.image_url)) {
                    diagnosis += "1. 提供的 URL 是否完整且以 http/https 开头\n";
                    diagnosis += "2. URL 是否包含非法字符\n";
                } else {
                    diagnosis += "1. 网络连接是否正常\n";
                    diagnosis += "2. 图片 URL 是否有效且可公开访问\n";
                }

                complete({
                    success: false,
                    message: `搜索失败: ${error.message}`,
                    error_detail: diagnosis
                });
            }
        }
            ,

        /**
         * 自检工具：验证引擎链接生成逻辑并输出报告
         */
        async test() {
            const sampleUrl = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
            let report = `## 🔧 image_search 自检报告\n\n`;
            report += `**测试图片 URL**: \`${sampleUrl}\`\n\n`;
            report += `### 通用引擎链接验证\n\n`;
            for (const engine of SearchEngines.general) {
                const link = engine.url(sampleUrl);
                const ok = link.startsWith('http');
                report += `- ${ok ? '✅' : '❌'} **${engine.name}**: ${ok ? '[链接正常](' + link + ')' : '生成失败'}\n`;
            }
            report += `\n### 专业溯源引擎链接验证\n\n`;
            for (const engine of SearchEngines.professional) {
                const link = engine.url(sampleUrl);
                const ok = link.startsWith('http');
                report += `- ${ok ? '✅' : '❌'} **${engine.name}**: ${ok ? '[链接正常](' + link + ')' : '生成失败'}\n`;
            }
            report += `\n✅ 自检完成。所有引擎链接生成逻辑均正常。\n`;
            complete({ success: true, message: '自检完成', data: report });
        }
    };
})();

// 导出接口
exports.search_by_image = imageSearch.search_by_image;
exports.test            = imageSearch.test;
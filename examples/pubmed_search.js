/* METADATA
{
    "name": "pubmed_search",
    "version": "1.0",
    "display_name": {
        "zh": "PubMed 文献检索",
        "en": "PubMed Literature Search"
    },
    "description": {
        "zh": "PubMed文献检索工具包。基于 NCBI E-utilities 提供文献搜索、详情获取、全文提取及引用分析功能。官网：https://www.ncbi.nlm.nih.gov/",
        "en": "PubMed Search Toolkit. Provides article search, details retrieval, full-text extraction, and citation analysis via NCBI E-utilities. Official site: https://www.ncbi.nlm.nih.gov/"
    },
    "env": [
        {
            "name": "NCBI_API_KEY",
            "description": {
                "zh": "NCBI API Key（可选但强烈推荐）。配置后请求速率从 3次/秒 提升至 10次/秒。申请地址：https://www.ncbi.nlm.nih.gov/account/ → 登录后在账户设置中生成 API Key",
                "en": "NCBI API Key (optional but strongly recommended). Increases rate limit from 3/sec to 10/sec. Apply at: https://www.ncbi.nlm.nih.gov/account/ → login → account settings → generate API Key."
            },
            "required": false
        },
        {
            "name": "NCBI_EMAIL",
            "description": {
                "zh": "请求者邮箱（可选但推荐）。NCBI 用于在服务异常时联系开发者。填入你的邮箱地址即可，无需验证",
                "en": "Requester email (optional but recommended). Used by NCBI to contact you in case of issues. Just enter your email address, no verification needed."
            },
            "required": false
        }
    ],
    "author": "Operit Community",
    "category": "Admin",
    "enabledByDefault": false,
    "tools": [
        {
            "name": "search_articles",
            "description": {
                "zh": "综合文献检索。支持关键词、日期筛选及排序，返回 PMID 列表及简要信息。",
                "en": "Search articles by keywords, date range, and sort options."
            },
            "parameters": [
                { "name": "query", "type": "string", "required": true, "description": { "zh": "检索关键词 (如 'cancer immunotherapy')", "en": "Search query" } },
                { "name": "max_results", "type": "number", "required": false, "default": 20, "description": { "zh": "最大返回数量", "en": "Max results" } },
                { "name": "sort", "type": "string", "required": false, "description": { "zh": "排序：relevance, pub_date, author, journal", "en": "Sort order" } },
                { "name": "date_from", "type": "string", "required": false, "description": { "zh": "起始日期 (YYYY/MM/DD)", "en": "Start date" } },
                { "name": "date_to", "type": "string", "required": false, "description": { "zh": "结束日期 (YYYY/MM/DD)", "en": "End date" } }
            ]
        },
        {
            "name": "advanced_search",
            "description": {
                "zh": "高级字段检索。支持标题、摘要、作者、期刊及 MeSH 术语的组合查询。",
                "en": "Advanced search with specific fields like Title, Abstract, Author, etc."
            },
            "parameters": [
                { "name": "title", "type": "string", "required": false, "description": { "zh": "标题关键词", "en": "Title keywords" } },
                { "name": "abstract", "type": "string", "required": false, "description": { "zh": "摘要关键词", "en": "Abstract keywords" } },
                { "name": "author", "type": "string", "required": false, "description": { "zh": "作者姓名", "en": "Author name" } },
                { "name": "mesh_terms", "type": "string", "required": false, "description": { "zh": "MeSH 术语 (逗号分隔)", "en": "MeSH terms (comma separated)" } },
                { "name": "logic", "type": "string", "required": false, "default": "AND", "description": { "zh": "逻辑连接符 (AND/OR)", "en": "Boolean operator" } }
            ]
        },
        {
            "name": "get_article_details",
            "description": {
                "zh": "获取文献详情。包括标题、摘要、作者、期刊、DOI 及发表日期。",
                "en": "Get full article metadata including abstract and authors."
            },
            "parameters": [
                { "name": "pmid", "type": "string", "required": true, "description": { "zh": "PubMed ID", "en": "PMID" } }
            ]
        },
        {
            "name": "get_full_text",
            "description": {
                "zh": "获取 PMC 全文。仅适用于已在 PubMed Central 开放获取的文章。",
                "en": "Get full text from PMC (Open Access only)."
            },
            "parameters": [
                { "name": "pmcid", "type": "string", "required": true, "description": { "zh": "PMC ID (如 PMC1234567)", "en": "PMC ID" } }
            ]
        },
        {
            "name": "get_related",
            "description": {
                "zh": "获取相关文献。支持查询被引文献(cited_by)、参考文献(references)或相似文献(similar)。",
                "en": "Get related articles: cited_by, references, or similar."
            },
            "parameters": [
                { "name": "pmid", "type": "string", "required": true, "description": { "zh": "PubMed ID", "en": "PMID" } },
                { "name": "type", "type": "string", "required": true, "description": { "zh": "类型：cited_by (被引), references (引用), similar (相似)", "en": "Type: cited_by, references, similar" } }
            ]
        },
        {
            "name": "test",
            "description": {
                "zh": "测试 NCBI API 连通性。验证环境变量配置及网络可达性。",
                "en": "Test NCBI API connectivity."
            },
            "parameters": []
        }
    ]
}
*/

/**
 * ============================================================================
 * 模块名称：PubMed Search Toolkit
 * ----------------------------------------------------------------------------
 * 基于 NCBI E-utilities API 实现。
 * 包含 esearch (检索), esummary (摘要), efetch (详情/XML), elink (关联) 功能。
 * ============================================================================
 */
const PubMedToolkit = (function () {
    const client = OkHttp.newClient();
    
    // 配置
    const CONFIG = {
        BASE_URL: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils",
        PMC_URL: "https://www.ncbi.nlm.nih.gov/pmc/oai/oai.cgi",
        DB: "pubmed",
        TOOL_NAME: "operit_pubmed_toolkit"
    };

    // ------------------------------------------------------------------------
    // [工具类] XML 解析助手 (轻量级 Regex 实现)
    // ------------------------------------------------------------------------
    const XmlUtils = {
        extractTag: (xml, tag) => {
            const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
            const match = xml.match(regex);
            return match ? match[1].trim() : null;
        },
        extractAllTags: (xml, tag) => {
            const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
            const matches = xml.match(regex);
            if (!matches) return [];
            return matches.map(m => m.replace(new RegExp(`<\/?${tag}[^>]*>`, 'g'), '').trim());
        },
        cleanText: (text) => {
            if (!text) return "";
            return text.replace(/<[^>]+>/g, '') // 移除 HTML/XML 标签
                       .replace(/\s+/g, ' ')    // 压缩空白字符
                       .trim();
        }
    };

    // ------------------------------------------------------------------------
    // [工具类] 网络请求与鉴权
    // ------------------------------------------------------------------------
    function getApiParams() {
        const apiKey = getEnv("NCBI_API_KEY");
        const email = getEnv("NCBI_EMAIL");
        const params = { tool: CONFIG.TOOL_NAME };
        if (apiKey) params.api_key = apiKey;
        if (email) params.email = email;
        return params;
    }

    async function httpGet(endpoint, params) {
        const fullParams = { ...getApiParams(), ...params };
        const query = Object.keys(fullParams)
            .filter(k => fullParams[k] !== undefined && fullParams[k] !== null && fullParams[k] !== '')
            .map(k => `${k}=${encodeURIComponent(fullParams[k])}`)
            .join('&');
        
        const url = `${CONFIG.BASE_URL}/${endpoint}?${query}`;
        
        try {
            const resp = await client.newRequest().url(url).method('GET').build().execute();
            if (!resp.isSuccessful()) throw new Error(`HTTP ${resp.statusCode}`);
            return resp.content;
        } catch (e) {
            throw new Error(`NCBI API 请求失败: ${e.message}`);
        }
    }

    // ------------------------------------------------------------------------
    // [核心 API] E-utilities 封装
    // ------------------------------------------------------------------------
    
    // ESearch: 搜索并返回 PMID 列表
    async function esearch(term, maxResults = 20, sort = '', minDate = '', maxDate = '') {
        const params = {
            db: CONFIG.DB,
            term: term,
            retmax: maxResults,
            retmode: 'json',
            sort: sort === 'pub_date' ? 'pub+date' : sort,
            mindate: minDate,
            maxdate: maxDate,
            datetype: 'pdat'
        };
        const res = await httpGet('esearch.fcgi', params);
        const json = JSON.parse(res);
        return {
            count: json.esearchresult.count,
            pmids: json.esearchresult.idlist || []
        };
    }

    // ESummary: 获取文献简要信息 (JSON)
    async function esummary(pmids) {
        if (!pmids || pmids.length === 0) return [];
        const params = {
            db: CONFIG.DB,
            id: pmids.join(','),
            retmode: 'json'
        };
        const res = await httpGet('esummary.fcgi', params);
        const json = JSON.parse(res);
        const result = json.result || {};
        
        // 移除 'uids' 字段，只保留具体文章数据
        return (result.uids || []).map(uid => {
            const item = result[uid];
            return {
                pmid: uid,
                title: item.title,
                journal: item.source,
                pubDate: item.pubdate,
                authors: (item.authors || []).map(a => a.name).join(', '),
                doi: item.elocationid ? item.elocationid.replace('doi: ', '') : ''
            };
        });
    }

    // EFetch: 获取文献详情 (XML 解析)
    async function efetch(pmid) {
        const params = {
            db: CONFIG.DB,
            id: pmid,
            retmode: 'xml',
            rettype: 'abstract' // 获取带有摘要的 XML
        };
        const xml = await httpGet('efetch.fcgi', params);
        
        // XML 解析逻辑
        const article = XmlUtils.extractTag(xml, 'PubmedArticle');
        if (!article) throw new Error("未找到文章详情");

        // 提取摘要
        const abstractTexts = XmlUtils.extractAllTags(article, 'AbstractText');
        const abstract = abstractTexts.length > 0 ? abstractTexts.join('\n\n') : "无摘要";

        // 提取作者
        const authorList = XmlUtils.extractTag(article, 'AuthorList');
        let authors = [];
        if (authorList) {
            const authorTags = XmlUtils.extractAllTags(authorList, 'Author');
            authors = authorTags.map(a => {
                const last = XmlUtils.extractTag(a, 'LastName') || '';
                const fore = XmlUtils.extractTag(a, 'ForeName') || '';
                return `${last} ${fore}`.trim();
            });
        }

        // 提取基础信息
        const title = XmlUtils.extractTag(article, 'ArticleTitle');
        const journal = XmlUtils.extractTag(article, 'Title') || XmlUtils.extractTag(article, 'ISOAbbreviation');
        const pubDateXml = XmlUtils.extractTag(article, 'PubDate');
        const year = XmlUtils.extractTag(pubDateXml, 'Year') || '';
        const month = XmlUtils.extractTag(pubDateXml, 'Month') || '';
        
        // 提取 DOI
        const ids = XmlUtils.extractAllTags(article, 'ArticleId');
        let doi = '';
        ids.forEach(idStr => {
            // 这里是一个简化的查找，实际 XML 中 ArticleId 有 IdType 属性，Regex 较难精确匹配属性，
            // 但 DOI 通常有特定格式。更严谨的做法是结合属性匹配，但这里简化处理。
            if (idStr.includes('10.') && idStr.includes('/')) doi = idStr; 
        });

        return {
            pmid: pmid,
            title: XmlUtils.cleanText(title),
            abstract: XmlUtils.cleanText(abstract),
            authors: authors,
            journal: XmlUtils.cleanText(journal),
            publicationDate: `${year} ${month}`.trim(),
            doi: doi
        };
    }

    // ELink: 获取关联文献 (被引/引用/相似)
    async function elink(pmid, cmd) {
        const params = {
            dbfrom: CONFIG.DB,
            db: CONFIG.DB,
            id: pmid,
            cmd: cmd // neighbor (相似), neighbor_score, etc.
        };
        // 针对引用关系，elink 需要特定 linkname，这里简化使用 neighbor 机制
        // pubmed_pubmed_citedin (被引)
        // pubmed_pubmed_refs (引用)
        // neighbor_score (相似)
        
        let linkname = '';
        if (cmd === 'cited_by') {
            params.cmd = 'neighbor';
            params.linkname = 'pubmed_pubmed_citedin';
        } else if (cmd === 'references') {
            params.cmd = 'neighbor';
            params.linkname = 'pubmed_pubmed_refs';
        } else {
            params.cmd = 'neighbor_score'; // 默认相似
        }

        const xml = await httpGet('elink.fcgi', params);
        
        // 解析 LinkSetDb -> Link -> Id
        // 由于 XML 结构复杂，这里做简化匹配
        const linkSetDbRegex = /<LinkSetDb>([\s\S]*?)<\/LinkSetDb>/g;
        let match;
        const ids = [];
        
        while ((match = linkSetDbRegex.exec(xml)) !== null) {
            const block = match[1];
            // 简单判断是否是我们需要的 LinkName (如果指定了)
            if (params.linkname && !block.includes(`<LinkName>${params.linkname}</LinkName>`)) {
                continue;
            }
            const linkIds = XmlUtils.extractAllTags(block, 'Id');
            ids.push(...linkIds);
        }
        
        // 过滤掉输入的 pmid 本身（有时会包含）
        return [...new Set(ids.filter(id => id !== pmid))];
    }

// ------------------------------------------------------------------------
    // [功能实现] 导出工具方法
    // ------------------------------------------------------------------------

    function formatTestReport(result) {
        let report = '## NCBI PubMed API 连通性测试\n\n';
        report += '| 项目 | 状态 |\n';
        report += '| :--- | :--- |\n';
        report += `| API 连通性 | ${result.connected ? '✅ 正常' : '❌ 失败'} |\n`;
        report += `| 响应延迟 | ${result.latency} ms |\n`;
        report += `| API 地址 | ${result.apiUrl} |\n`;
        report += `| API Key | ${result.apiKey} |\n`;
        report += `| Email | ${result.email} |\n`;
        if (result.error) {
            report += `| 错误信息 | ${result.error} |\n`;
        }
        return report;
    }

    return {
        // 工具 1: 搜索文章
        search_articles: async (p) => {
            try {
                const searchRes = await esearch(p.query, p.max_results, p.sort, p.date_from, p.date_to);
                
                if (searchRes.pmids.length === 0) {
                    return complete({ success: true, data: "### 检索结果\n未找到匹配的文献。" });
                }

                const summaries = await esummary(searchRes.pmids);
                
                let output = `### PubMed 检索结果 (共 ${searchRes.count} 条, 展示前 ${summaries.length} 条)\n`;
                output += `> 关键词: ${p.query}\n\n`;
                
                output += summaries.map((item, index) => {
                    return `**${index + 1}. ${item.title}**\n` +
                           `- 期刊: ${item.journal} (${item.pubDate})\n` +
                           `- 作者: ${item.authors.substring(0, 50)}${item.authors.length > 50 ? '...' : ''}\n` +
                           `- PMID: ${item.pmid} ${item.doi ? `| DOI: ${item.doi}` : ''}`;
                }).join('\n\n---\n\n');

                complete({ success: true, data: output });
            } catch (e) {
                complete({ success: false, message: `检索失败: ${e.message}` });
            }
        },

        // 工具 2: 高级检索
        advanced_search: async (p) => {
            try {
                const parts = [];
                if (p.title) parts.push(`${p.title}[Title]`);
                if (p.abstract) parts.push(`${p.abstract}[Abstract]`);
                if (p.author) parts.push(`${p.author}[Author]`);
                if (p.mesh_terms) {
                    const terms = p.mesh_terms.split(',').map(t => `${t.trim()}[MeSH Terms]`).join(' OR ');
                    parts.push(`(${terms})`);
                }

                if (parts.length === 0) throw new Error("请至少提供一个检索字段");
                
                const logic = ` ${p.logic || 'AND'} `;
                const finalQuery = parts.join(logic);

                // 复用 search 逻辑
                const searchRes = await esearch(finalQuery, 20);
                const summaries = await esummary(searchRes.pmids);
                
                let output = `### 高级检索结果\n> 检索式: \`${finalQuery}\`\n\n`;
                output += summaries.map(s => `- [${s.pmid}] **${s.title}** (${s.pubDate})`).join('\n');
                
                complete({ success: true, data: output });
            } catch (e) {
                complete({ success: false, message: `高级检索失败: ${e.message}` });
            }
        },

        // 工具 3: 获取详情
        get_article_details: async (p) => {
            try {
                const details = await efetch(p.pmid);
                
                const output = `### 文献详情: ${details.title}\n\n` +
                               `**期刊**: ${details.journal} (${details.publicationDate})\n` +
                               `**PMID**: ${details.pmid}  **DOI**: ${details.doi}\n\n` +
                               `**作者**: \n${details.authors.join(', ')}\n\n` +
                               `**摘要**: \n${details.abstract}`;
                
                complete({ success: true, data: output });
            } catch (e) {
                complete({ success: false, message: `获取详情失败: ${e.message}` });
            }
        },

        // 工具 4: 获取 PMC 全文
        get_full_text: async (p) => {
            try {
                let pmcid = p.pmcid.toUpperCase();
                if (!pmcid.startsWith('PMC')) pmcid = 'PMC' + pmcid;
                const idNum = pmcid.replace('PMC', '');

                // 使用 OAI 服务获取 XML
                const url = `${CONFIG.PMC_URL}?verb=GetRecord&identifier=oai:pubmedcentral.nih.gov:${idNum}&metadataPrefix=pmc`;
                const resp = await client.newRequest().url(url).method('GET').build().execute();
                
                if (!resp.isSuccessful()) throw new Error("PMC 请求失败");
                const xml = resp.content;

                // 简单的全文提取逻辑
                const body = XmlUtils.extractTag(xml, 'body');
                if (!body) throw new Error("未找到全文内容，该文章可能不是 Open Access 或 ID 错误。");

                // 移除标签，保留纯文本，按段落分行
                let text = body.replace(/<sec[^>]*>/gi, '\n### ') // 将 section 标签转为 markdown 标题
                               .replace(/<title[^>]*>(.*?)<\/title>/gi, '$1\n') // 标题换行
                               .replace(/<p[^>]*>/gi, '\n') // 段落换行
                               .replace(/<[^>]+>/g, ''); // 移除其他标签
                
                // 截断过长内容
                if (text.length > 15000) text = text.substring(0, 15000) + "\n\n... (全文过长已截断)";

                complete({ 
                    success: true, 
                    data: `### PMC 全文: ${pmcid}\n${text}` 
                });
            } catch (e) {
                complete({ success: false, message: `全文获取失败: ${e.message}` });
            }
        },

// 工具 5: 获取相关文献
        get_related: async (p) => {
            try {
                const ids = await elink(p.pmid, p.type);
                const limitIds = ids.slice(0, 20); // 限制查询前 20 条
                
                if (limitIds.length === 0) {
                    return complete({ success: true, data: `未找到相关文献 (${p.type})` });
                }

                const summaries = await esummary(limitIds);
                
                let titleMap = {
                    'cited_by': '施引文献 (Cited By)',
                    'references': '参考文献 (References)',
                    'similar': '相似文献 (Similar Articles)'
                };

                let output = `### ${titleMap[p.type] || '相关文献'} (PMID: ${p.pmid})\n`;
                output += `共找到 ${ids.length} 条，展示前 ${limitIds.length} 条：\n\n`;
                output += summaries.map(s => `- [${s.pmid}] ${s.title} (${s.journal}, ${s.pubDate})`).join('\n');

                complete({ success: true, data: output });
            } catch (e) {
                complete({ success: false, message: `获取相关文献失败: ${e.message}` });
            }
        },

        // 工具 6: API 连通性测试
        test: async () => {
            const startTime = Date.now();
            const apiKey = getEnv("NCBI_API_KEY");
            const email = getEnv("NCBI_EMAIL");
            
            try {
                const searchRes = await esearch("test", 1);
                const latency = Date.now() - startTime;

                complete({
                    success: true,
                    message: `连接成功，响应延迟 ${latency} ms`,
                    data: formatTestReport({
                        connected: true,
                        latency: latency,
                        apiUrl: CONFIG.BASE_URL,
                        apiKey: apiKey ? '已配置' : '未配置（可选）',
                        email: email || '未配置（可选）',
                        error: null
                    }),
                    meta: { latency_ms: latency }
                });
            } catch (e) {
                const latency = Date.now() - startTime;
                complete({
                    success: false,
                    message: `连接测试失败: ${e.message}`,
                    data: formatTestReport({
                        connected: false,
                        latency: latency,
                        apiUrl: CONFIG.BASE_URL,
                        apiKey: apiKey ? '已配置' : '未配置（可选）',
                        email: email || '未配置（可选）',
                        error: e.message
                    })
                });
            }
        }
    };
})();

/**
 * 导出映射
 */
exports.search_articles     = PubMedToolkit.search_articles;
exports.advanced_search     = PubMedToolkit.advanced_search;
exports.get_article_details = PubMedToolkit.get_article_details;
exports.get_full_text       = PubMedToolkit.get_full_text;
exports.get_related         = PubMedToolkit.get_related;
exports.test                = PubMedToolkit.test;
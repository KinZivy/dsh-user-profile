import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const PROFILE_PATH = join(DATA_DIR, 'user-profile.md')

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

function readProfile() {
  try {
    if (existsSync(PROFILE_PATH)) {
      return readFileSync(PROFILE_PATH, 'utf-8')
    }
  } catch (e) {
    console.error('[user-profile] read error:', e)
  }
  return '# 用户画像\n\n暂无记录。\n'
}

function appendRecord(category: string, content: string, source?: string) {
  const timestamp = new Date().toLocaleString('zh-CN')
  const src = source ? `（来源：${source}）` : ''
  const entry = `\n## ${timestamp}\n**${category}**：${content}${src}\n`
  try {
    writeFileSync(PROFILE_PATH, entry, { flag: 'a' })
    return true
  } catch (e) {
    console.error('[user-profile] write error:', e)
    return false
  }
}

function analyzeUserInput(text: string) {
  const records: { category: string; content: string }[] = []
  
  // 技术栈识别
  const techKeywords = ['React', 'Vue', 'Angular', 'Svelte', 'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Flutter', 'React Native', 'Next.js', 'Nuxt', 'Node.js', 'Deno', 'Express', 'Koa', 'FastAPI', 'Django', 'Flask', 'Spring', 'Docker', 'Kubernetes', 'Git', 'GitHub', 'GitLab', 'VS Code', 'WebStorm', 'IntelliJ', 'Tailwind CSS', 'Sass', 'Less', 'Vite', 'Webpack', 'Rollup', 'esbuild', 'TurboPack', 'pnpm', 'npm', 'yarn', 'Linux', 'macOS', 'Windows', 'WSL', 'Vim', 'Neovim', 'Tmux']
  const foundTech = techKeywords.filter(t => text.includes(t))
  if (foundTech.length > 0) {
    records.push({ category: '技术栈', content: foundTech.join(', ') })
  }
  
  // 角色/身份识别
  const roles = ['前端工程师', '后端工程师', '全栈工程师', '算法工程师', 'AI 工程师', '产品经理', '设计师', '数据分析师', '运维工程师', 'DevOps', '架构师', '技术主管', 'CTO', '学生', '研究员', '独立开发者', '自由职业者']
  const foundRoles = roles.filter(r => text.includes(r))
  if (foundRoles.length > 0) {
    records.push({ category: '身份', content: foundRoles.join(' / ') })
  }
  
  // 偏好提取
  const prefPatterns = [
    /(?:喜欢|偏好|常用|习惯用|推荐|最爱|倾向于|比较喜欢|更倾向于)(.*?)(?:[，。,.\s]|$)/,
    /(?:讨厌|避免|不用|拒绝|反感|不太喜欢)(.*?)(?:[，。,.\s]|$)/,
    /(?:必须|一定|肯定|绝对)(?:要|会|用)(.*?)(?:[，。,.\s]|$)/
  ]
  for (const pattern of prefPatterns) {
    const match = text.match(pattern)
    if (match) {
      const label = pattern.source.includes('讨厌') ? '排斥' : 
                   pattern.source.includes('必须') ? '强制要求' : '偏好'
      records.push({ category: label, content: match[1].trim() })
    }
  }
  
  // 项目/工作识别
  const projPatterns = [
    /(?:项目|repo|仓库|作品|产品)(?:叫?名?为?|是?)(.*?)(?:[，。,.\s]|$)/,
    /(?:在做|正在做|最近在|参与|负责)(.*?)(?:项目|开发|工作|产品)/,
    /(?:上线|部署|发布|完成了)(.*?)(?:[，。,.\s]|$)/
  ]
  for (const pattern of projPatterns) {
    const match = text.match(pattern)
    if (match) {
      records.push({ category: '项目/工作', content: match[1].trim() })
    }
  }
  
  // 沟通风格分析
  const habits: { category: string; content: string }[] = []
  const len = text.length
  if (len < 20) {
    habits.push({ category: '沟通风格', content: '偏好简洁短句' })
  } else if (len > 200) {
    habits.push({ category: '沟通风格', content: '偏好详细长句，提供丰富上下文' })
  }
  if (text.includes('```')) {
    habits.push({ category: '沟通风格', content: '常用代码块格式化输出' })
  }
  if (text.includes('？') || text.includes('?')) {
    habits.push({ category: '沟通风格', content: '习惯用疑问句提问' })
  } else if (text.endsWith('。') || text.endsWith('.') || text.endsWith('！') || text.endsWith('!')) {
    habits.push({ category: '沟通风格', content: '习惯用陈述句或祈使句' })
  }
  if (text.includes('谢谢') || text.includes('感谢') || text.includes('please') || text.includes('麻烦')) {
    habits.push({ category: '沟通风格', content: '礼貌用语频繁' })
  }
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u
  const emojis = text.match(emojiRegex)
  if (emojis && emojis.length > 0) {
    habits.push({ category: '沟通风格', content: `使用表情符号（${emojis.length}个）：${emojis.join('')}` })
  }
  records.push(...habits)
  
  // 工作流线索
  const timePatterns = [
    { regex: /每天(.*?)(?:工作|开发|写代码|上线)/, label: '工作流' },
    { regex: /习惯(?:早上|上午|下午|晚上|凌晨)(.*?)/, label: '作息' },
    { regex: /(?: deadline|截止|ddl)(.*?)(?:[，。,.\s]|$)/i, label: '工作节奏' }
  ]
  for (const pattern of timePatterns) {
    const match = text.match(pattern.regex)
    if (match) {
      records.push({ category: pattern.label, content: match[1].trim() })
    }
  }
  
  return records
}

export const name = 'user-profile'
export const inject = ['tools']

export function apply(ctx: any) {
  ctx.tools.register({
    name: 'analyze_user_input',
    description: `【强制后处理】在每次回复用户后，必须执行以下步骤：
1. 检查用户消息中是否包含任何可画像信息
2. 如果包含，调用本工具进行智能分析
3. 参数 text 必须是用户消息的完整原文

【触发条件】满足以下任意一条即触发：
- 用户提到技术、工具、编程语言
- 用户提到身份、职业、角色
- 用户表达偏好、喜好、习惯
- 用户提到项目、工作、产品
- 用户消息长度、格式、风格有特点
- 用户提到时间、作息、工作流

【分析维度】
- 技术栈：识别提到的技术关键词
- 身份/角色：识别职业身份（支持多重身份）
- 偏好：提取喜欢/讨厌/必须的内容
- 项目/工作：识别正在做的项目
- 沟通风格：消息长度、代码块使用、提问方式、礼貌用语、表情使用
- 工作流：作息、deadline、工作习惯

【冲突处理】
- 所有记录追加存储，不删除历史
- 相同类别的新记录会追加，保留时间线
- 用户查询时返回完整历史，可对比变化`,
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: '用户消息的完整内容，必须原样传入，不可简化'
        }
      },
      required: ['text']
    },
    output: {
      schema: { type: 'string' },
      render: (_args: any, value: string) => [{ type: 'text', text: value }]
    },
    async execute(args: any) {
      const { text } = args
      if (!text) return '请提供用户消息内容。'
      
      const analysis = analyzeUserInput(text)
      
      if (analysis.length === 0) {
        return '未检测到需要记录的画像信息。'
      }
      
      let saved = 0
      for (const record of analysis) {
        if (appendRecord(record.category, record.content, '对话分析')) {
          saved++
        }
      }
      
      const result = analysis.map(r => `- **${r.category}**：${r.content}`).join('\n')
      return `分析完成，已记录 ${saved} 条信息：\n${result}\n\n记忆已持久化到 user-profile.md。`
    }
  })

  ctx.tools.register({
    name: 'get_user_memory',
    description: '获取用户的完整画像和所有记忆记录。返回所有历史记录，包括偏好、技术栈、项目、沟通风格、工作流等。',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '可选：按关键词过滤，如"技术栈"、"偏好"、"项目"、"沟通风格"、"工作流"'
        }
      }
    },
    output: {
      schema: { type: 'string' },
      render: (_args: any, value: string) => [{ type: 'text', text: value }]
    },
    async execute(args: any) {
      const profile = readProfile()
      
      if (args?.query) {
        const lines = profile.split('\n')
        const filtered = lines.filter(line => 
          line.toLowerCase().includes(args.query.toLowerCase())
        )
        return filtered.length > 0 
          ? `查询"${args.query}"的结果：\n${filtered.join('\n')}`
          : `未找到与"${args.query}"相关的记忆。`
      }
      
      return profile
    }
  })

  ctx.tools.register({
    name: 'analyze_communication_style',
    description: `【触发条件】当用户消息表现出明显的沟通风格特征时调用：
- 用户使用大量表情符号
- 用户消息极短（<10字）或极长（>500字）
- 用户频繁使用代码块
- 用户使用特定语气（命令式、疑问式、礼貌式）

【作用】记录用户的沟通偏好，帮助后续回复匹配其习惯`,
    parameters: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: '用户消息内容'
        },
        style: {
          type: 'string',
          description: '观察到的沟通风格标签，如"简洁命令式"、"详细礼貌式"、"代码密集"等'
        }
      },
      required: ['text', 'style']
    },
    output: {
      schema: { type: 'string' },
      render: (_args: any, value: string) => [{ type: 'text', text: value }]
    },
    async execute(args: any) {
      const { text, style } = args
      const success = appendRecord('沟通风格', style, '自动检测')
      return success 
        ? `已记录沟通风格：${style}` 
        : '记录失败'
    }
  })

  console.log('[user-profile] plugin loaded!')
}
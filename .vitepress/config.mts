import {defineConfig} from 'vitepress'
import {set_sidebar} from './utils/auto_sidebar'
import { getSidebar } from 'vitepress-plugin-auto-sidebar'
import  {  withMermaid  } from "vitepress-plugin-mermaid" ;

// https://vitepress.dev/reference/site-config
export default defineConfig({
    head: [["link", { rel: "icon", href: "/logo.svg" }]],
    title: "Rustsilk文档",
    description: "A VitePress Site",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: "/logo.svg",
        search: {
            provider: "local",
            "options": {
                translations: {
                    button: {
                        buttonText: "搜索文档",
                        buttonAriaLabel: "搜索文档"
                    },
                    modal: {
                        displayDetails: '显示详细列表',
                        resetButtonTitle: '重置搜索',
                        backButtonTitle: '关闭搜索',
                        noResultsText: '没有结果',
                        footer: {
                            selectText: '选择',
                            selectKeyAriaLabel: '输入',
                            navigateText: '导航',
                            navigateUpKeyAriaLabel: '上箭头',
                            navigateDownKeyAriaLabel: '下箭头',
                            closeText: '关闭',
                            closeKeyAriaLabel: 'Esc'
                        }
                    }
                }
            },
        },
        nav: [
            {text: 'Home', link: '/'},
            {
                text: '后端开发',
                items: [
                    {
                        text: 'Java',
                        link: '/md/back-end/java/'
                    },
                    {
                        text: 'Rust',
                        link: '/md/back-end/rust/'
                    },
                    {
                        text: 'Python',
                        link: '/md/back-end/python/'
                    }
                ]
            },
            {
                text: '前端开发',
                items: [
                    {text: "三剑客+TS", link: '/md/front-end/三剑客+TS'},
                    {text: "Vue3", link: '/md/front-end/vue3'},
                    {text: "React", link: '/md/front-end/react'},
                    {text: "uni-app", link: '/md/front-end/uni-app'},
                ]
            },
            {
                text: '数据库与中间件',
                items: [
                    {
                        text: '关系型数据库',
                        items: [
                            { text: 'PostgreSQL', link: '/md/database/postgresql' },
                            { text: 'MySQL', link: '/md/database/mysql' },
                            { text: 'SQLite', link: '/md/database/sqlite' },
                            { text: 'H2', link: '/md/database/h2' }
                        ]
                    },
                    {
                        text: 'NoSQL',
                        items: [
                            { text: 'Redis', link: '/md/database/redis' },
                            { text: 'Elasticsearch', link: '/md/database/elasticsearch' },
                            { text: 'MongoDB', link: '/md/database/mongodb' }
                        ]
                    },
                    {
                        text: 'MQ',
                        items: [
                            { text: 'RabbitMQ', link: '/md/mq/rabbitmq' },
                            { text: 'Kafka', link: '/md/mq/kafka' },
                            { text: 'RocketMQ', link: '/md/mq/rocketmq' }
                        ]
                    },
                    {
                        text: '分库分表',
                        items: [
                            { text: 'Mycat', link: '/md/middleware/mycat' },
                            { text: 'Apache ShardingSphere', link: '/md/middleware/shardingsphere' }
                        ]
                    },
                    {
                        text: '文件存储 / 对象存储',
                        items: [
                            { text: 'MinIO', link: '/md/storage/minio' },
                            { text: 'RustFS', link: '/md/storage/rustfs' },
                        ]
                    }
                ]
            },
            {
                text: '架构与工程',
                items: [
                    {
                        text: '核心内力',
                        items: [
                            { text: '数据结构与算法', link: '/md/core/dsa' },
                            { text: '设计模式', link: '/md/core/design-patterns' }
                        ]
                    },
                    {
                        text: '开发利器',
                        items: [
                            { text: 'Git', link: '/md/tools/git' },
                            { text: 'Linux', link: '/md/tools/linux' },
                            { text: 'Nginx', link: '/md/tools/nginx' },
                            { text: 'Docker', link: '/md/tools/docker' },
                            { text: 'Kubernetes', link: '/md/tools/k8s' },
                            { text: 'Gitea/GitLab', link: '/md/tools/git-platform' },
                            { text: 'Jpom', link: '/md/tools/jpom' }
                        ]
                    },
                    {
                        text: '软件工程',
                        items: [
                            { text: '开发流程', link: '/md/engineering/process' },
                            { text: '开源协议', link: '/md/engineering/open-source-license' },
                            { text: '开发理论（CAP等）', link: '/md/engineering/theory' }
                        ]
                    },
                    {
                        text: '系统设计',
                        items: [
                            { text: '基础架构模式', link: '/md/architecture/patterns' },
                            { text: '分布式与微服务', link: '/md/architecture/distributed-microservice' },
                            { text: '业务系统设计', link: '/md/architecture/business-design' }
                        ]
                    },
                    {
                        text: '团队管理',
                        link: '/md/manage'
                    }
                ]
            },
            {
                text: '生活',
                items: [
                    {text: "财经", link: '/md/life/finance'},
                    {text: "美食", link: '/md/life/gourmet-food'},
                    {text: "旅游", link: '/md/life/travel'},
                    {text: "摄影", link: '/md/life/photography'},
                    {text: "音乐", link: '/md/life/music'},
                    {text: "影视", link: '/md/life/movie'},
                    {text: "DIY", link: '/md/life/diy'},
                    {text: "养生", link: '/md/life/health-preservation'},
                    {text: "其它", link: '/md/life/other'},
                ]
            },
            {text: '关于', link: '/md/about'},
        ],
        sidebar: {
            // 后端开发
            "/md/back-end/java/": set_sidebar("/md/back-end/java"),
            "/md/back-end/rust/": set_sidebar("/md/back-end/rust"),
            "/md/back-end/python/": set_sidebar("/md/back-end/python"),
            // 前端开发
            "/md/front-end/三剑客+TS/": set_sidebar("/md/front-end/三剑客+TS"),
            "/md/front-end/vue3/": set_sidebar("/md/front-end/vue3"),
            "/md/front-end/react/": set_sidebar("/md/front-end/react"),
            "/md/front-end/uni-app/": set_sidebar("/md/front-end/uni-app"),
            // 数据库与中间件
            "/md/database/postgresql/": set_sidebar("/md/database/postgresql"),
            "/md/database/mysql/": set_sidebar("/md/database/mysql"),
            "/md/database/sqlite/": set_sidebar("/md/database/sqlite"),
            "/md/database/h2/": set_sidebar("/md/database/h2"),
            "/md/database/redis/": set_sidebar("/md/database/redis"),
            "/md/database/elasticsearch/": set_sidebar("/md/database/elasticsearch"),
            "/md/database/mongodb/": set_sidebar("/md/database/mongodb"),
            "/md/mq/rabbitmq/": set_sidebar("/md/mq/rabbitmq"),
            "/md/mq/kafka/": set_sidebar("/md/mq/kafka"),
            "/md/mq/rocketmq/": set_sidebar("/md/mq/rocketmq"),
            "/md/middleware/mycat/": set_sidebar("/md/middleware/mycat"),
            "/md/middleware/shardingsphere/": set_sidebar("/md/middleware/shardingsphere"),
            "/md/storage/minio/": set_sidebar("/md/storage/minio"),
            "/md/storage/rustfs/": set_sidebar("/md/storage/rustfs"),
            // 架构与工程
            "/md/core/dsa/": set_sidebar("/md/core/dsa"),
            "/md/core/design-patterns/": set_sidebar("/md/core/design-patterns"),
            "/md/tools/git/": set_sidebar("/md/tools/git"),
            "/md/tools/linux/": set_sidebar("/md/tools/linux"),
            "/md/tools/nginx/": set_sidebar("/md/tools/nginx"),
            "/md/tools/docker/": set_sidebar("/md/tools/docker"),
            "/md/tools/k8s/": set_sidebar("/md/tools/k8s"),
            "/md/tools/git-platform/": set_sidebar("/md/tools/git-platform"),
            "/md/tools/jpom/": set_sidebar("/md/tools/jpom"),
            "/md/engineering/process/": set_sidebar("/md/engineering/process"),
            "/md/engineering/open-source-license/": set_sidebar("/md/engineering/open-source-license"),
            "/md/engineering/theory/": set_sidebar("/md/engineering/theory"),
            "/md/architecture/patterns/": set_sidebar("/md/architecture/patterns"),
            "/md/architecture/distributed-microservice/": set_sidebar("/md/architecture/distributed-microservice"),
            "/md/architecture/business-design/": set_sidebar("/md/architecture/business-design"),
            "/md/manage/": set_sidebar("/md/manage"),
            // 生活
            "/md/life/finance/": set_sidebar("/md/life/finance"),
            "/md/life/gourmet-food/": set_sidebar("/md/life/gourmet-food"),
            "/md/life/travel": set_sidebar("/md/life/travel"),
            "/md/life/photography/": set_sidebar("/md/life/photography"),
            "/md/life/music/": set_sidebar("/md/life/music"),
            "/md/life/movie/": set_sidebar("/md/life/movie"),
            "/md/life/diy/": set_sidebar("/md/life/diy"),
            "/md/life/health-preservation/": set_sidebar("/md/life/health-preservation"),
            "/md/life/other/": set_sidebar("/md/life/other"),
        },
        socialLinks: [
            {icon: 'github', link: 'https://github.com/coderafeng/rustsilk-docs'},
            {
                icon: {svg: '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1781409267388" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6673" xmlns:xlink="http://www.w3.org/1999/xlink" width="256" height="256"><path d="M512 1024C229.222 1024 0 794.778 0 512S229.222 0 512 0s512 229.222 512 512-229.222 512-512 512z m259.149-568.883h-290.74a25.293 25.293 0 0 0-25.292 25.293l-0.026 63.206c0 13.952 11.315 25.293 25.267 25.293h177.024c13.978 0 25.293 11.315 25.293 25.267v12.646a75.853 75.853 0 0 1-75.853 75.853h-240.23a25.293 25.293 0 0 1-25.267-25.293V417.203a75.853 75.853 0 0 1 75.827-75.853h353.946a25.293 25.293 0 0 0 25.267-25.292l0.077-63.207a25.293 25.293 0 0 0-25.268-25.293H417.152a189.62 189.62 0 0 0-189.62 189.645V771.15c0 13.977 11.316 25.293 25.294 25.293h372.94a170.65 170.65 0 0 0 170.65-170.65V480.384a25.293 25.293 0 0 0-25.293-25.267z" fill="#C71D23" p-id="6674"></path></svg>'},
                link: 'https://gitee.com/coderafeng'
            },
            {
                icon: {svg: '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1781409125966" class="icon" viewBox="0 0 1129 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5698" xmlns:xlink="http://www.w3.org/1999/xlink" width="282.25" height="256"><path d="M234.909 9.656a80.468 80.468 0 0 1 68.398 0 167.374 167.374 0 0 1 41.843 30.578l160.937 140.82h115.07l160.936-140.82a168.983 168.983 0 0 1 41.843-30.578A80.468 80.468 0 0 1 930.96 76.445a80.468 80.468 0 0 1-17.703 53.914 449.818 449.818 0 0 1-35.406 32.187 232.553 232.553 0 0 1-22.531 18.508h100.585a170.593 170.593 0 0 1 118.289 53.109 171.397 171.397 0 0 1 53.914 118.288v462.693a325.897 325.897 0 0 1-4.024 70.007 178.64 178.64 0 0 1-80.468 112.656 173.007 173.007 0 0 1-92.539 25.75h-738.7a341.186 341.186 0 0 1-72.421-4.024A177.835 177.835 0 0 1 28.91 939.065a172.202 172.202 0 0 1-27.36-92.539V388.662a360.498 360.498 0 0 1 0-66.789A177.03 177.03 0 0 1 162.487 178.64h105.414c-16.899-12.07-31.383-26.555-46.672-39.43a80.468 80.468 0 0 1-25.75-65.984 80.468 80.468 0 0 1 39.43-63.57M216.4 321.873a80.468 80.468 0 0 0-63.57 57.937 108.632 108.632 0 0 0 0 30.578v380.615a80.468 80.468 0 0 0 55.523 80.469 106.218 106.218 0 0 0 34.601 5.632h654.208a80.468 80.468 0 0 0 76.444-47.476 112.656 112.656 0 0 0 8.047-53.109v-354.06a135.187 135.187 0 0 0 0-38.625 80.468 80.468 0 0 0-52.304-54.719 129.554 129.554 0 0 0-49.89-7.242H254.22a268.764 268.764 0 0 0-37.82 0z m0 0" fill="#20B0E3" p-id="5699"></path><path d="M348.369 447.404a80.468 80.468 0 0 1 55.523 18.507 80.468 80.468 0 0 1 28.164 59.547v80.468a80.468 80.468 0 0 1-16.094 51.5 80.468 80.468 0 0 1-131.968-9.656 104.609 104.609 0 0 1-10.46-54.719v-80.468a80.468 80.468 0 0 1 70.007-67.593z m416.02 0a80.468 80.468 0 0 1 86.102 75.64v80.468a94.148 94.148 0 0 1-12.07 53.11 80.468 80.468 0 0 1-132.773 0 95.757 95.757 0 0 1-12.875-57.133V519.02a80.468 80.468 0 0 1 70.007-70.812z m0 0" fill="#20B0E3" p-id="5700"></path></svg>'},
                link: 'https://space.bilibili.com/481342296'
            }
        ],
        
        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2026-present coderafeng'
        }
    }
})

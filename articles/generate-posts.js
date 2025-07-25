const fs = require('fs');
const path = require('path');

const articlesDir = path.join(__dirname, 'articles');
const postsJsonPath = path.join(__dirname, 'posts.json');
const sitemapPath = path.join(__dirname, 'sitemap.xml');

// GitHub PagesのURLに合わせて変更してください
const baseUrl = 'https://github.com/Toyblogger/blog/';

// --- Frontmatterをパースする関数 ---
function parseFrontmatter(markdown) {
    const frontmatterRegex = /^---\s*([\s\S]*?)\s*---/;
    const match = frontmatterRegex.exec(markdown);
    const attributes = {};
    if (match) {
        const frontmatter = match[1];
        frontmatter.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length) {
                let value = valueParts.join(':').trim();
                // タグのような配列の場合
                if (value.startsWith('[') && value.endsWith(']')) {
                    attributes[key.trim()] = value.slice(1, -1).split(',').map(tag => tag.trim().replace(/^"|"$/g, ''));
                } else {
                    attributes[key.trim()] = value.replace(/^['" ]|['" ]$/g, '');
                }
            }
        });
    }
    return attributes;
}

// 1. articlesディレクトリからマークダウンファイルの一覧を取得
const articleFiles = fs.readdirSync(articlesDir).filter(file => file.endsWith('.md'));

// 2. 各ファイルの情報を取得し、新しい順にソート
const posts = articleFiles.map(file => {
    const filePath = path.join(articlesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);
    const attributes = parseFrontmatter(content);
    
    return {
        file: `articles/${file}`,
        mtime: stats.mtime.getTime(),
        title: attributes.title || '無題の記事',
        date: attributes.date || new Date(stats.mtime).toISOString().split('T')[0],
        category: attributes.category || '未分類',
        categoryColor: attributes.categoryColor || 'gray',
        image: attributes.image || 'https://placehold.co/600x400/gray/FFFFFF?text=No+Image',
        description: attributes.description || '記事の説明がありません。',
        tags: attributes.tags || [],
    };
}).sort((a, b) => b.mtime - a.mtime); // 降順（新しいものが先頭）にソート

// 3. posts.jsonファイルに書き出す（mtimeは不要なので除外）
const finalPosts = posts.map(({ mtime, ...rest }) => rest);
fs.writeFileSync(postsJsonPath, JSON.stringify(finalPosts, null, 4));

console.log(`Successfully generated posts.json with ${finalPosts.length} articles.`);

// 4. サイトマップ(sitemap.xml)を生成
const sitemapContent = `
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}index.html</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
${posts.map(post => `
  <url>
    <loc>${baseUrl}article.html?post=${post.file}</loc>
    <lastmod>${new Date(post.mtime).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`).join('')}
</urlset>
`.trim();

fs.writeFileSync(sitemapPath, sitemapContent);

console.log('Successfully generated sitemap.xml');
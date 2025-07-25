const fs = require('fs');
const path = require('path');

const articlesDir = path.join(__dirname, 'articles');
const postsJsonPath = path.join(__dirname, 'posts.json');
const sitemapPath = path.join(__dirname, 'sitemap.xml');

// サイトのベースURL（GitHub PagesのURLに合わせて変更してください）
const baseUrl = 'https://github.com/Toyblogger/blog/';

// 1. articlesディレクトリからマークダウンファイルの一覧を取得
const articleFiles = fs.readdirSync(articlesDir).filter(file => file.endsWith('.md'));

// 2. 各ファイルの更新日時を取得し、新しい順にソート
const posts = articleFiles.map(file => {
    const filePath = path.join(articlesDir, file);
    const stats = fs.statSync(filePath);
    return {
        file: `articles/${file}`,
        mtime: stats.mtime.getTime() // 更新日時をミリ秒で取得
    };
}).sort((a, b) => b.mtime - a.mtime); // 降順（新しいものが先頭）にソート

// 3. mtimeプロパティを削除して、最終的なJSONオブジェクトを作成
const finalPosts = posts.map(post => ({
    file: post.file
}));

// 4. posts.jsonファイルに書き出す
fs.writeFileSync(postsJsonPath, JSON.stringify(finalPosts, null, 4));

console.log(`Successfully generated posts.json with ${finalPosts.length} articles.`);

// 5. サイトマップ(sitemap.xml)を生成
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

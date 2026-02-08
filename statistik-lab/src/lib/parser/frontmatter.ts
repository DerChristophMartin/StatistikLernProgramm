export function parseFrontmatter(content: string) {
    const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
    const match = content.match(frontmatterRegex);
    if (match) {
        const yaml = match[1];
        const data: Record<string, any> = {};
        yaml.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
                data[key.trim()] = valueParts.join(':').trim();
            }
        });
        return { data, content: content.replace(frontmatterRegex, '') };
    }
    return { data: {}, content };
}

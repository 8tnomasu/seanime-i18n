import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const query = `
query {
  MediaTagCollection {
    name
    description
    category
    rank
    isGeneralSpoiler
    isMediaSpoiler
    isAdult
  }
}
`

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "..")
const docsDir = path.join(repoRoot, "docs")
const rawOutputPath = path.join(docsDir, "anilist-tags.json")
const todoOutputPath = path.join(docsDir, "anilist-tags.zh-TW.todo.json")

async function fetchAniListTags() {
    const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({ query }),
    })

    if (!response.ok) {
        const body = await response.text()
        throw new Error(`AniList request failed (${response.status}): ${body}`)
    }

    const payload = await response.json()

    if (payload.errors?.length) {
        throw new Error(`AniList GraphQL returned errors: ${JSON.stringify(payload.errors)}`)
    }

    const tags = payload?.data?.MediaTagCollection

    if (!Array.isArray(tags)) {
        throw new Error("AniList response did not include MediaTagCollection.")
    }

    return tags
}

function buildTodoMap(tags) {
    return Object.fromEntries(tags.map((tag) => [
        tag.name,
        {
            "zh-TW": "",
            category: tag.category ?? "",
            rank: tag.rank ?? 0,
            description: tag.description ?? "",
            isGeneralSpoiler: Boolean(tag.isGeneralSpoiler),
            isMediaSpoiler: Boolean(tag.isMediaSpoiler),
            isAdult: Boolean(tag.isAdult),
        },
    ]))
}

async function main() {
    try {
        const tags = await fetchAniListTags()
        await mkdir(docsDir, { recursive: true })
        await writeFile(rawOutputPath, `${JSON.stringify(tags, null, 2)}\n`, "utf8")
        await writeFile(todoOutputPath, `${JSON.stringify(buildTodoMap(tags), null, 2)}\n`, "utf8")

        console.log(`Saved ${tags.length} AniList tags to:`)
        console.log(`- ${rawOutputPath}`)
        console.log(`- ${todoOutputPath}`)
    } catch (error) {
        console.error("Failed to fetch AniList tags.")
        console.error(error instanceof Error ? error.message : error)
        process.exit(1)
    }
}

await main()

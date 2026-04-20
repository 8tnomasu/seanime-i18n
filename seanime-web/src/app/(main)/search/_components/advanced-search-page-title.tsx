import { __advancedSearch_getValue, __advancedSearch_paramsAtom } from "@/app/(main)/search/_lib/advanced-search.atoms"
import { getGenreLabel, getMediaSeasonLabel } from "@/i18n/labels"
import { useAtomValue } from "jotai/react"
import startCase from "lodash/startCase"
import React from "react"
import { useTranslation } from "react-i18next"

export function AdvancedSearchPageTitle() {
    const { t, i18n } = useTranslation()

    const params = useAtomValue(__advancedSearch_paramsAtom)

    const title = React.useMemo(() => {
        if (params.title && params.title.length > 0) {
            return startCase(params.title)
        }

        const sortingValue = __advancedSearch_getValue(params.sorting)?.[0]
        const sortingLabel = sortingValue ? t(`search.pageTitle.sorting.${sortingValue}`) : t(`search.pageTitle.sorting.SCORE_DESC`)
        const translatedGenres = params.genre?.map(genre => getGenreLabel(t, genre)).filter(Boolean) ?? []
        const genreText = translatedGenres.join(i18n.language === "zh-TW" ? "、" : ", ")
        const seasonText = params.season ? getMediaSeasonLabel(t, params.season) : ""
        const timeText = i18n.language === "zh-TW"
            ? [params.year, seasonText].filter(Boolean).join(" ")
            : [seasonText, params.year].filter(Boolean).join(" ")

        if (i18n.language === "zh-TW") {
            return [
                timeText,
                genreText,
                sortingLabel,
                t(params.type === "anime" ? "search.pageTitle.types.anime" : "search.pageTitle.types.manga"),
            ].filter(Boolean).join(" ").trim()
        }

        let result = sortingLabel
        if (genreText) result += ` ${genreText}`
        result += ` ${t(params.type === "anime" ? "search.pageTitle.types.anime" : "search.pageTitle.types.manga")}`
        if (timeText) result += ` ${t("search.pageTitle.from")} ${timeText}`
        return result
    }, [i18n.language, params.genre, params.season, params.sorting, params.title, params.type, params.year, t])

    return (
        <div data-advanced-search-page-title-container>
            <h2 data-advanced-search-page-title className="line-clamp-2">{title}</h2>
            {/*{secondaryTitle && <p className="text-xl line-clamp-1">{secondaryTitle}</p>}*/}
        </div>
    )
}

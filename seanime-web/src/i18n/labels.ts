import { TFunction } from "i18next"
import capitalize from "lodash/capitalize"

export function getCollectionStatusLabel(
    t: TFunction,
    type?: string | null,
    context: "anime" | "manga" | "generic" = "generic",
) {
    switch (type) {
        case "CURRENT":
            if (context === "anime") return t("mediaList.status.currentlyWatching")
            if (context === "manga") return t("mediaList.status.currentlyReading")
            return t("mediaList.status.current")
        case "REPEATING":
            return t("mediaList.status.repeating")
        case "PLANNING":
            return t("mediaList.status.planning")
        case "PAUSED":
            return t("mediaList.status.paused")
        case "COMPLETED":
            return t("mediaList.status.completed")
        case "DROPPED":
            return t("mediaList.status.dropped")
        default:
            return capitalize((type ?? "").toLowerCase().replace(/_/g, " "))
    }
}

export function getAdvancedSearchSortingLabel(t: TFunction, value?: string | null) {
    switch (value) {
        case "TRENDING_DESC":
        case "START_DATE_DESC":
        case "SCORE_DESC":
        case "POPULARITY_DESC":
        case "EPISODES_DESC":
        case "CHAPTERS_DESC":
            return t(`mediaFilters.options.searchSorting.${value}`)
        default:
            return value ?? ""
    }
}

export function getCollectionSortingLabel(t: TFunction, value?: string | null) {
    switch (value) {
        case "AIRDATE_DESC":
        case "AIRDATE":
        case "UNWATCHED_EPISODES_DESC":
        case "UNWATCHED_EPISODES":
        case "LAST_WATCHED_DESC":
        case "LAST_WATCHED":
        case "SCORE_DESC":
        case "SCORE":
        case "TITLE":
        case "TITLE_DESC":
        case "AUDIENCE_SCORE_DESC":
        case "AUDIENCE_SCORE":
        case "PROGRESS_DESC":
        case "PROGRESS":
        case "START_DATE_DESC":
        case "START_DATE":
        case "END_DATE_DESC":
        case "END_DATE":
        case "RELEASE_DATE_DESC":
        case "RELEASE_DATE":
        case "UNREAD_CHAPTERS_DESC":
        case "UNREAD_CHAPTERS":
            return t(`mediaFilters.options.collectionSorting.${value}`)
        default:
            return value ?? ""
    }
}

export function getMediaTypeLabel(t: TFunction, value?: string | null) {
    switch (value) {
        case "anime":
            return t("mediaFilters.options.types.anime")
        case "manga":
            return t("mediaFilters.options.types.manga")
        default:
            return value ?? ""
    }
}

export function getMediaFormatLabel(t: TFunction, value?: string | null) {
    switch (value) {
        case "TV":
        case "MOVIE":
        case "ONA":
        case "OVA":
        case "TV_SHORT":
        case "SPECIAL":
        case "MANGA":
        case "ONE_SHOT":
            return t(`mediaFilters.options.formats.${value}`)
        default:
            return value ?? ""
    }
}

export function getMediaStatusLabel(t: TFunction, value?: string | null) {
    switch (value) {
        case "FINISHED":
        case "RELEASING":
        case "NOT_YET_RELEASED":
        case "HIATUS":
        case "CANCELLED":
            return t(`mediaFilters.options.status.${value}`)
        default:
            return value ?? ""
    }
}

export function getMediaSeasonLabel(t: TFunction, value?: string | null) {
    switch (value) {
        case "WINTER":
        case "SPRING":
        case "SUMMER":
        case "FALL":
            return t(`mediaFilters.options.seasons.${value}`)
        default:
            return value ?? ""
    }
}

export function getCountryLabel(t: TFunction, value?: string | null) {
    switch (value) {
        case "JP":
        case "KR":
        case "CN":
        case "TW":
            return t(`mediaFilters.options.countries.${value}`)
        default:
            return value ?? ""
    }
}

export function getGenreLabel(t: TFunction, value?: string | null) {
    switch (value) {
        case "Action":
            return t("mediaFilters.options.genres.action")
        case "Adventure":
            return t("mediaFilters.options.genres.adventure")
        case "Comedy":
            return t("mediaFilters.options.genres.comedy")
        case "Drama":
            return t("mediaFilters.options.genres.drama")
        case "Ecchi":
            return t("mediaFilters.options.genres.ecchi")
        case "Fantasy":
            return t("mediaFilters.options.genres.fantasy")
        case "Horror":
            return t("mediaFilters.options.genres.horror")
        case "Mahou Shoujo":
            return t("mediaFilters.options.genres.mahouShoujo")
        case "Mecha":
            return t("mediaFilters.options.genres.mecha")
        case "Music":
            return t("mediaFilters.options.genres.music")
        case "Mystery":
            return t("mediaFilters.options.genres.mystery")
        case "Psychological":
            return t("mediaFilters.options.genres.psychological")
        case "Romance":
            return t("mediaFilters.options.genres.romance")
        case "Sci-Fi":
            return t("mediaFilters.options.genres.sciFi")
        case "Slice of Life":
            return t("mediaFilters.options.genres.sliceOfLife")
        case "Sports":
            return t("mediaFilters.options.genres.sports")
        case "Supernatural":
            return t("mediaFilters.options.genres.supernatural")
        case "Thriller":
            return t("mediaFilters.options.genres.thriller")
        default:
            return value ?? ""
    }
}

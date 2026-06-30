export type SeoPage = {
  path: string
  title: string
  h1: string
  description: string
  robots: string
}

export const siteName: string
export const defaultOrigin: string
export const defaultSiteTitle: string
export const defaultSiteDescription: string
export const seoPageList: SeoPage[]
export const seoPageMap: Map<string, SeoPage>
export const indexableSitemapPaths: string[]

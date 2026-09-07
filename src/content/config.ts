// All page content (siteSettings, pupilsPage, lifePage) now lives in
// Keystatic singletons, not Astro Content Collections — read them with
// Keystatic's reader instead:
//
//   import { createReader } from '@keystatic/core/reader';
//   import keystaticConfig from '../../../keystatic.config';
//   const reader = createReader(process.cwd(), keystaticConfig);
//   const lifePage = await reader.singletons.lifePage.read();
//   const posts = (lifePage?.posts ?? []).filter((p) => p.title);
//
// This file is kept only in case a genuine multi-file Content Collection
// (e.g. rich Markdoc pages) gets added later. If nothing is ever added
// here, it's safe to delete this file entirely along with the
// @astrojs/markdoc integration, since the collection-based lifePosts
// model it supported no longer exists.

export const collections = {};

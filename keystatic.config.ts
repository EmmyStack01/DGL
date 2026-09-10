import { config, fields, collection, singleton } from '@keystatic/core';

// Shared class-level options — used by BOTH classPhotos and celebratedPupils
// so slugs can never drift apart. Confirmed directly against pupils.html's
// actual class-section ids, data-class attributes, and filter <option>
// values: creche, kg-1, kg-2, nursery-1, nursery-2, primary-1..primary-5.
// Exported so pupils.astro can import the exact same list rather than
// hard-coding it a second time.
export const CLASS_LEVEL_OPTIONS = [
  { label: 'Crèche', value: 'creche' },
  { label: 'KG 1', value: 'kg-1' },
  { label: 'KG 2', value: 'kg-2' },
  { label: 'Nursery 1', value: 'nursery-1' },
  { label: 'Nursery 2', value: 'nursery-2' },
  { label: 'Primary 1', value: 'primary-1' },
  { label: 'Primary 2', value: 'primary-2' },
  { label: 'Primary 3', value: 'primary-3' },
  { label: 'Primary 4', value: 'primary-4' },
  { label: 'Primary 5', value: 'primary-5' },
];

// Life at DGL category taxonomy — matches the data-category values the
// filter buttons on life.html actually use. Exported so life.astro can
// import this exact list for rendering the filter bar, instead of
// hard-coding the taxonomy a second time in the page template.
export const LIFE_CATEGORY_OPTIONS = [
  { label: 'Classroom', value: 'classroom' },
  { label: 'Activities', value: 'activities' },
  { label: 'Events', value: 'events' },
  { label: 'Sports', value: 'sports' },
  { label: 'Celebrations', value: 'celebrations' },
];

// Hard cap on Life at DGL posts. Raise or lower this single number if the
// desired maximum changes — the CMS only defines this many post slots, so
// there is no "Add" button that could ever exceed it, and life.astro
// imports this same constant to know how many slots to read.
export const MAX_LIFE_POSTS = 8;

export default config({
  storage: {
    kind: 'cloud',
  },
  cloud: {
    project: 'dgls/dgls',
  },

  singletons: {
    siteSettings: singleton({
      label: 'Site Settings & Footer',
      path: 'src/content/pages/siteSettings',
      schema: {
        phoneSupport: fields.text({
          label: 'Phone Support Number',
          defaultValue: '+2348000000000',
        }),
        whatsAppChannelLink: fields.url({
          label: 'WhatsApp Channel URL',
          validation: { isRequired: true },
        }),
      },
    }),

    pupilsPage: singleton({
      label: 'Pupils Page',
      path: 'src/content/pages/pupilsPage',
      schema: {
        currentSession: fields.text({
          label: 'Class Photos Academic Session',
          defaultValue: '2026/2027',
        }),
        awardsSession: fields.text({
          label: 'Celebrating Our Pupils Academic Session',
          defaultValue: '2025/2026',
        }),
        classPhotos: fields.array(
          fields.object({
            classLevel: fields.select({
              label: 'Class Level',
              options: CLASS_LEVEL_OPTIONS,
              defaultValue: 'creche',
            }),
            photo: fields.image({
              label: 'Class Photo',
              directory: 'public/assets/classes',
              publicPath: '/assets/classes/',
            }),
            caption: fields.text({ label: 'Caption / Note', validation: { isRequired: false } }),
          }),
          {
            label: 'Class Photos Roster',
            itemLabel: (props) => props.fields.classLevel.value,
          }
        ),
        celebratedPupils: fields.array(
          fields.object({
            pupilName: fields.text({ label: 'Pupil Full Name' }),
            // Was free text — now a controlled select using the exact same
            // options/values as classPhotos.classLevel, so filtering by
            // class on pupils.html can never break on a typo or formatting
            // mismatch (e.g. "Pri 4" vs "Primary 4").
            classLevel: fields.select({
              label: 'Class',
              options: CLASS_LEVEL_OPTIONS,
              defaultValue: 'creche',
            }),
            awardTitle: fields.select({
              label: 'Award Title',
              options: [
                { label: 'Overall Best', value: 'Overall Best' },
                { label: '1st Position', value: '1st Position' },
                { label: '2nd Position', value: '2nd Position' },
                { label: '3rd Position', value: '3rd Position' },
                { label: 'Best in Mathematics', value: 'Best in Mathematics' },
                { label: 'Best in English', value: 'Best in English' },
              ],
              defaultValue: 'Overall Best',
            }),
          }),
          {
            label: 'Celebrating Our Pupils List',
            itemLabel: (props) => `${props.fields.pupilName.value} - ${props.fields.classLevel.value} - ${props.fields.awardTitle.value}`,
          }
        ),
      },
    }),

    // Was an array field with a "max length" validation option — that
    // option doesn't actually exist on Keystatic's array field (confirmed
    // against the official docs), so it would never have enforced a cap.
    // Fixed, individually-named slots are the correct way to get a hard
    // limit: there is no "Add" button that could ever exceed this count,
    // because the schema only defines MAX_LIFE_POSTS slots. Editors just
    // open whichever numbered slot they want and overwrite it — exactly
    // the "edit an old post for a new one" behavior that was asked for.
    lifePage: singleton({
      label: 'Life at DGL Page',
      path: 'src/content/pages/lifePage',
      schema: Object.fromEntries(
        Array.from({ length: MAX_LIFE_POSTS }, (_, i) => [
          `post${i + 1}`,
          fields.object(
            {
              title: fields.text({
                label: 'Post Title',
                // Left optional so a slot can sit empty — the Astro
                // template should skip/hide any slot with no title.
                validation: { isRequired: false },
              }),
              publishedDate: fields.date({
                label: 'Publish Date',
                defaultValue: { kind: 'today' },
              }),
              category: fields.select({
                label: 'Category',
                options: LIFE_CATEGORY_OPTIONS,
                defaultValue: 'classroom',
              }),
              // Toggles which field is shown/required based on the chosen
              // media type, instead of always showing both an image field
              // and a video URL field regardless of relevance.
              media: fields.conditional(
                fields.select({
                  label: 'Media Type',
                  options: [
                    { label: 'Image', value: 'image' },
                    { label: 'Video (Embed/Iframe)', value: 'video' },
                  ],
                  defaultValue: 'image',
                }),
                {
                  image: fields.image({
                    label: 'Featured Image',
                    directory: 'public/assets/life',
                    publicPath: '/assets/life/',
                  }),
                  video: fields.object({
                    url: fields.url({
                      label: 'Video Embed URL',
                      description: 'Paste the YouTube/Vimeo link (a normal youtube.com/watch, youtu.be, or vimeo.com link works — you don\u2019t need the "Embed" code)',
                      validation: { isRequired: false },
                    }),
                    thumbnail: fields.image({
                      label: 'Video Thumbnail',
                      description: 'Shown on the card and featured preview before the video is opened',
                      directory: 'public/assets/life',
                      publicPath: '/assets/life/',
                      validation: { isRequired: false },
                    }),
                  }, { label: 'Video' }),
                }
              ),
              description: fields.text({
                label: 'Short Description (shown in the post popup)',
                multiline: true,
                validation: { isRequired: false },
              }),
            },
            { label: `Post ${i + 1}` }
          ),
        ])
      ),
    }),
  },

  collections: {},
});

# Rishika Banerjee — portfolio (studio version)

A one-page, playful portfolio built with Jekyll for GitHub Pages. GitHub builds it automatically, so there is nothing to install.

Scrolling the first screen opens the illustrated Rishika's mouth until it fills the screen. The black inside becomes the intro, which types itself in. After that come stacked service cards with stickers, an about section, a notes carousel, FAQs, a contact form and a sky-blue footer where she peeks up from the bottom. Her eyes follow the pointer and blink.

## Put it online
1. Create a public repository named exactly `USERNAME.github.io`, using your GitHub username.
2. Upload all of these files (drag the unzipped folder's contents onto the repository page).
3. In `_config.yml`, change `url` to `https://USERNAME.github.io`.
4. The site goes live at `https://USERNAME.github.io` within a couple of minutes.

## Edit the content (no coding needed)
| What | File |
| --- | --- |
| Name, tagline, email, LinkedIn | `_config.yml` |
| Brands, roles and results | `_data/cases.yml` |
| Services, deliverables, stats, notes, education, skills, languages | `_data/profile.yml` |
| Intro sentence, section titles, FAQ questions | `index.html` |
| Photo | replace `assets/img/rishika.jpg` (square image) |
| Colours and fonts | top of `assets/css/main.css` |
| The illustrated face | `_includes/face.html` (hair, skin and lip colours are the `fill` values) |
| Stickers on the service cards | `_includes/stickers.html` |

In `_data/cases.yml`, each brand's `discipline` must match one of the service names in `_data/profile.yml`; that is how each service card lists its brands.

The contact form opens the visitor's email app with the message filled in, because GitHub Pages cannot send email itself.

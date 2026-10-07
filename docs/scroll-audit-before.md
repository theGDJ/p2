# Scroll audit — before concision pass

Measured with headless Chrome against the local development server. Ratio is `document.documentElement.scrollHeight / window.innerHeight` after the page reached network idle.

| Route | 1440×900 height | 1440×900 screens | 390×844 height | 390×844 screens |
|---|---:|---:|---:|---:|
| `/` | 3,162 px | 3.51 | 5,914 px | 7.01 |
| `/assistant` | 960 px | 1.07 | 1,823 px | 2.16 |
| `/finder` | 1,339 px | 1.49 | 2,066 px | 2.45 |
| `/standards` | 36,316 px | 40.35 | 43,946 px | 52.07 |
| `/labs` | 4,764 px | 5.29 | 11,027 px | 13.07 |
| `/certification` | 5,954 px | 6.62 | 9,516 px | 11.27 |
| `/consumer` | 1,711 px | 1.90 | 3,426 px | 4.06 |
| `/dashboard` | 1,795 px | 1.99 | 3,361 px | 3.98 |

`/finder` was still a standalone page at this point, so its figures describe the legacy route before redirecting it into the assistant flow.

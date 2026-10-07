# Scroll audit — after concision pass

Measured with headless Chrome against the local development server using `document.documentElement.scrollHeight / window.innerHeight` after network idle.

| Route | 1440×900 before | 1440×900 after | 390×844 before | 390×844 after |
|---|---:|---:|---:|---:|
| `/` | 3.51 | **1.00** | 7.01 | **1.14** |
| `/assistant` | 1.07 | **1.07** | 2.16 | **2.16** |
| `/finder` → `/assistant?mode=identify` | 1.49 | **1.00** | 2.45 | **1.00** |
| `/standards` | 40.35 | **1.93** | 52.07 | **2.77** |
| `/labs` | 5.29 | **2.00** | 13.07 | **3.02** |
| `/certification` | 6.62 | **1.32** | 11.27 | **1.97** |
| `/consumer` | 1.90 | **1.49** | 4.06 | **3.04** |
| `/dashboard` | 1.99 | **1.58** | 3.98 | **2.96** |

Desktop targets are met: Home is one screen; Standards, Labs and each Certification tab are at or below two screens. Mobile Home is under 1.3 screens. Mobile directory pages remain longer than two screens because the requested 12 records and full filter controls are retained; they are nevertheless reduced from 52.07 to 2.77 screens for Standards and 13.07 to 3.02 for Labs.

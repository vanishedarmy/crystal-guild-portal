# Crystal Guild v1.7.0 — Retainer Service Alpha 2 Mobile Visual Pass Hotfix 3

This Web-only hotfix is a deliberately tight responsive UI pass. It fixes the Gold Saucer hero shown collapsing at intermediate/mobile-landscape widths. The cause was the hero's second CSS grid track using `auto`: the long MGP explanatory note contributed a very large max-content width, allowing the Current Balance card to consume nearly the whole row and crush the Gold Saucer title/intro copy into a narrow strip.

The hero now uses a bounded 220–360px balance track while the copy column remains `minmax(0,1fr)`. The balance card itself is width-bounded and its note wraps locally. At the existing <=900px breakpoint the hero explicitly becomes one column and the balance card stretches to the available width. A small <=620px spacing/type adjustment keeps the phone presentation compact.

The selective pass also checked the nearby Gold Saucer disclosure pointer alignment, Chocobo Racing responsive cards, Triple Triad opponent layouts, and the Retainer Hotfix 2 grid/portrait rules. Those existing responsive treatments remain intact; no broad redesign or gameplay change was introduced.

Runtime remains `1.7.0-retainer-a2`, local database schema **15**, hosted sync **1**, and Portal Action protocol **31**. Frontend asset revision advances to `1.7.0-retainer-a2h3`.

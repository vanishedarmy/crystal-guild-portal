from __future__ import annotations

from typing import Any

_BOSS_TIER_RANK = {
    "primal": 1,
    "primal_boss": 1,
    "world": 2,
    "world_boss": 2,
    "high": 3,
    "high_boss": 3,
    "superboss": 4,
    "ultimate": 5,
    "ultimate_superboss": 5,
}
_ACHIEVEMENT_TIER_RANK = {"bronze": 1, "silver": 2, "gold": 3, "crystal": 4}


def _tier_key(value: Any) -> str:
    return str(value or "").strip().lower().replace("-", "_").replace(" ", "_")


def build_trophy_hall(snapshot: dict[str, Any]) -> dict[str, Any]:
    """Build a compact showcase from modules already present in the public snapshot."""
    overview = snapshot.get("overview") or {}
    records = snapshot.get("records") or {}
    achievements = snapshot.get("achievements") or {}
    jobs = snapshot.get("jobs") or {}
    relics = snapshot.get("relics") or {}
    identity = overview.get("identity") or {}
    career = records.get("career") or {}
    progression = records.get("progression") or {}
    achievement_summary = achievements.get("summary") or {}

    bosses = [dict(item) for item in records.get("bosses", []) if int(item.get("clears") or 0) > 0]
    bosses.sort(
        key=lambda item: (
            -_BOSS_TIER_RANK.get(_tier_key(item.get("tier")), 0),
            -int(item.get("clears") or 0),
            -int(item.get("best_damage") or 0),
            str(item.get("name") or "").lower(),
        )
    )
    completed_relics = [dict(item) for item in relics.get("relics", []) if item.get("completed")]
    completed_relics.sort(key=lambda item: (str(item.get("job") or "").lower(), str(item.get("name") or "").lower()))
    mastered_jobs = [dict(item) for item in jobs.get("jobs", []) if item.get("mastered")]
    mastered_jobs.sort(key=lambda item: (not bool(item.get("current")), -int(item.get("level") or 0), str(item.get("name") or "").lower()))
    rare_achievements = [
        dict(item) for item in achievements.get("achievements", [])
        if item.get("unlocked") and _ACHIEVEMENT_TIER_RANK.get(_tier_key(item.get("tier")), 0) >= 2
    ]
    rare_achievements.sort(
        key=lambda item: (
            -_ACHIEVEMENT_TIER_RANK.get(_tier_key(item.get("tier")), 0),
            -int(item.get("points") or 0),
            str(item.get("name") or "").lower(),
        )
    )
    titles = achievements.get("titles", [])
    equipped_title = next((dict(item) for item in titles if item.get("equipped")), None)
    if equipped_title is None and identity.get("title"):
        equipped_title = {"name": identity.get("title"), "rarity": "common", "category": "Equipped"}

    level = int(identity.get("level") or 0)
    boss_clears = int(career.get("boss_clears") or 0)
    jobs_mastered = int(progression.get("jobs_mastered") or len(mastered_jobs))
    relics_completed = int(career.get("relics_completed") or len(completed_relics))
    achievement_points = int(achievement_summary.get("points") or 0)
    milestone_specs = (
        ("level", "Veteran Adventurer", level, 50, "Reach Character Lv.50"),
        ("level_cap", "Legend of the Guild", level, 99, "Reach Character Lv.99"),
        ("boss_hunter", "Boss Hunter", boss_clears, 10, "Record 10 boss victories"),
        ("boss_slayer", "Boss Slayer", boss_clears, 50, "Record 50 boss victories"),
        ("job_master", "Master of Arms", jobs_mastered, 5, "Master 5 Jobs"),
        ("relic_bearer", "Relic Bearer", relics_completed, 1, "Complete a Relic weapon"),
        ("relic_collector", "Relic Collector", relics_completed, 5, "Complete 5 Relic weapons"),
        ("achievement_hunter", "Crystal Chronicler", achievement_points, 500, "Earn 500 achievement points"),
    )
    milestones = [
        {
            "id": key,
            "name": name,
            "current": current,
            "target": target,
            "description": description,
            "completed": current >= target,
        }
        for key, name, current, target, description in milestone_specs
    ]

    featured: list[dict[str, Any]] = []
    if bosses:
        boss = bosses[0]
        featured.append({
            "type": "boss",
            "name": boss.get("name"),
            "eyebrow": str(boss.get("tier") or "Boss").replace("_", " ").title(),
            "meta": f"{int(boss.get('clears') or 0):,} clears · Best {int(boss.get('best_damage') or 0):,} damage",
            "rank": "legendary" if _BOSS_TIER_RANK.get(_tier_key(boss.get("tier")), 0) >= 4 else "epic",
            "boss": boss,
        })
    if completed_relics:
        relic = completed_relics[0]
        featured.append({
            "type": "relic", "name": relic.get("name"), "eyebrow": f"{relic.get('job')} Relic",
            "meta": "Zenith Complete", "rank": "legendary", "relic": relic,
        })
    if rare_achievements:
        achievement = rare_achievements[0]
        featured.append({
            "type": "achievement", "name": achievement.get("name"), "eyebrow": f"{achievement.get('tier', 'rare').title()} Achievement",
            "meta": f"{int(achievement.get('points') or 0):,} points", "rank": _tier_key(achievement.get("tier")),
            "achievement": achievement,
        })
    if mastered_jobs:
        job = mastered_jobs[0]
        featured.append({
            "type": "job", "name": job.get("name"), "eyebrow": "Job Mastery",
            "meta": str((job.get("mastery") or {}).get("name") or "JLv.50 Mastered"), "rank": "crystal", "job": job,
        })
    if equipped_title:
        featured.append({
            "type": "title", "name": equipped_title.get("name"), "eyebrow": "Equipped Title",
            "meta": str(equipped_title.get("description") or equipped_title.get("category") or "Guild distinction"),
            "rank": _tier_key(equipped_title.get("rarity") or "common"), "title": equipped_title,
        })
    achieved_milestones = [item for item in milestones if item["completed"]]
    if achieved_milestones:
        milestone = achieved_milestones[-1]
        featured.append({
            "type": "milestone", "name": milestone["name"], "eyebrow": "Career Milestone",
            "meta": milestone["description"], "rank": "gold", "milestone": milestone,
        })

    superbosses = [item for item in bosses if _BOSS_TIER_RANK.get(_tier_key(item.get("tier")), 0) >= 4]
    superboss_clears = sum(int(item.get("clears") or 0) for item in superbosses)
    return {
        "player": {
            "username": identity.get("username"),
            "display_name": identity.get("display_name"),
            "level": level,
            "title": identity.get("title"),
        },
        "summary": {
            "bosses_defeated": len(bosses),
            "boss_clears": boss_clears,
            "superbosses_defeated": len(superbosses),
            "superboss_clears": superboss_clears,
            "relics_completed": relics_completed,
            "jobs_mastered": jobs_mastered,
            "rare_achievements": len(rare_achievements),
            "achievement_points": achievement_points,
        },
        "equipped_title": equipped_title,
        "featured": featured[:6],
        "bosses": bosses,
        "relics": completed_relics,
        "mastered_jobs": mastered_jobs,
        "achievements": rare_achievements,
        "milestones": milestones,
    }

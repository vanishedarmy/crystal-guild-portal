"""Portal action retention query remains indexed as the host ledger grows."""
from contextlib import closing
import sqlite3
import tempfile
import unittest
from pathlib import Path
from crystal_guild.hosted_portal import HostedPortalStore


class HostedHardening191Tests(unittest.TestCase):
    def test_retention_uses_partial_index(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'hosted.db'
            HostedPortalStore(path)
            with closing(sqlite3.connect(path)) as db, db:
                plan = db.execute("EXPLAIN QUERY PLAN DELETE FROM portal_actions INDEXED BY idx_portal_actions_retention WHERE status IN ('completed','failed') AND updated_at<?", (12345,)).fetchall()
                self.assertTrue(any('idx_portal_actions_retention' in str(row) for row in plan), plan)


if __name__ == '__main__':
    unittest.main()

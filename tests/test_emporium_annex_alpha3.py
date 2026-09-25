from __future__ import annotations

import unittest

from crystal_guild.hosted_portal import ACTION_PROTOCOL_VERSION, FRONTEND_ASSET_REVISION, HOSTED_PORTAL_VERSION


class EmporiumAnnexHostedAlpha3Tests(unittest.TestCase):
    def test_alpha3_keeps_portal_protocol_stable(self):
        self.assertEqual(HOSTED_PORTAL_VERSION, "1.9.4-crafting-reforged")
        self.assertEqual(FRONTEND_ASSET_REVISION, "1.9.4.1-blacksmith-hardening")
        self.assertEqual(ACTION_PROTOCOL_VERSION, 39)


if __name__ == "__main__":
    unittest.main()

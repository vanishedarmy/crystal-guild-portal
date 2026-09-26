import unittest
from crystal_guild.hosted_portal import validate_overlay_payload

class RaidOverlay1944Validation(unittest.TestCase):
    def setUp(self):
        self.sample = {"schema_version": 1, "overlay": {
            "active": True, "status": "COMBAT", "boss": "Ifrit", "raiders": 1, "ready_actions": 1,
            "actionable_raiders": 1, "rounds_to_enrage": 3,
            "boss_statuses": [{"id":"vulnerable","turns":2}],
            "members": [{"name":"Van", "role":"Tank", "job":"Warrior", "hp":100, "max_hp":200,
                         "resource":"AP", "resource_value":20, "resource_max":30,"state":"READY",
                         "action":"Defend", "action_kind":"defend", "target":"",
                         "statuses":[{"id":"protect","turns":3}]}],
        }}

    def test_valid_public_payload(self):
        validate_overlay_payload(self.sample)

    def test_old_bot_payload_still_supported(self):
        validate_overlay_payload({"schema_version":1,"overlay":{"active":True,"boss":"Ifrit","raiders":2}})

    def test_private_member_identifiers_rejected(self):
        self.sample["overlay"]["members"][0]["twitch_id"] = "123456"
        with self.assertRaisesRegex(ValueError, "member"):
            validate_overlay_payload(self.sample)

    def test_private_root_field_rejected(self):
        self.sample["overlay"]["raid_run"] = "secret"
        with self.assertRaisesRegex(ValueError, "unsupported field"):
            validate_overlay_payload(self.sample)

    def test_excessive_party_rejected(self):
        self.sample["overlay"]["members"] *= 65
        with self.assertRaisesRegex(ValueError, "member"):
            validate_overlay_payload(self.sample)

    def test_bad_status_rejected(self):
        self.sample["overlay"]["members"][0]["statuses"] = [{"id": "stun", "turns":2,"payload":"private"}]
        with self.assertRaisesRegex(ValueError, "status"):
            validate_overlay_payload(self.sample)

if __name__ == '__main__': unittest.main()

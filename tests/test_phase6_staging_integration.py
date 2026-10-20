"""Phase 6 offline staging integration: real compiled frontend, HTTP APIs, fresh SQLite.

No Twitch network access, live credentials, production DB or Bot process required.
Run from Web/: PYTHONPATH=. python -m unittest tests/test_phase6_staging_integration.py -v
"""
from __future__ import annotations
import json
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path
from crystal_guild.hosted_portal import (
    ACTION_PROTOCOL_VERSION, HostedPortalHandler, HostedPortalHTTPServer, HostedPortalStore,
)
from crystal_guild.portal_auth import TwitchOAuthConfig

KEY = "local-test-only-sync-key"


def player_snapshot(username="stagealice", twitch_id="9000000001"):
    return {"schema_version":1, "username":username,"player_twitch_id":twitch_id,
            "snapshot":{"overview":{"identity":{"username":username,"display_name":username.title(),"level":12,"title":"Fresh Recruit","updated_at":"2026-10-19 20:00:00"},
            "job":{"name":"Dragoon"},"status":{"state":"ready","label":"Ready"}},
            "jobs":{"jobs":[]},"inventory":{"items":[]},"hunts":{"summary":{},"hunts":[]},
            "bestiary":{"summary":{"discovered":0,"total":0},"monsters":[]},
            "relics":{"relics":[]},"achievements":{"summary":{"unlocked":0,"total":0},"achievements":[]},
            "records":{"career":{},"bosses":[]}}}


class StagingIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp=tempfile.TemporaryDirectory(prefix="cg-phase6-")
        cls.database=Path(cls.tmp.name)/"staging.sqlite3"
        cls.dist=Path(__file__).resolve().parents[1]/"frontend"/"dist"
        if not (cls.dist/"index.html").exists():
            raise unittest.SkipTest("Compiled Web frontend/dist not available")
        cls.store=HostedPortalStore(cls.database)
        cls.oauth=TwitchOAuthConfig("staging-client", "staging-placeholder", "https://stage.invalid/auth/twitch/callback", cookie_secure=False)
        cls._start()
        cls.sessions={}
        for name,tid in (("stagealice","9000000001"),("stagebob","9000000002")):
            status,_,_=cls.req("/api/sync/player", "POST", player_snapshot(name,tid), key=KEY)
            assert status==200
            session,csrf=cls.store.create_session({"twitch_id":tid,"login":name,"display_name":name.title()},3600)
            cls.sessions[name]=(session,csrf)
        status,_,_=cls.req("/api/sync/manifest","POST", {"schema_version":1,"usernames":["stagealice","stagebob"],"owner_twitch_id":"9000000001"},key=KEY)
        assert status==200

    @classmethod
    def _start(cls):
        cls.server=HostedPortalHTTPServer(("127.0.0.1",0),HostedPortalHandler,cls.store,cls.dist,KEY,oauth_config=cls.oauth,actions_enabled=True)
        cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True)
        cls.thread.start()
        cls.base=f"http://127.0.0.1:{cls.server.server_address[1]}"

    @classmethod
    def _stop(cls):
        cls.server.shutdown();cls.server.server_close();cls.thread.join(timeout=5)

    @classmethod
    def tearDownClass(cls):
        cls._stop();cls.tmp.cleanup()

    @classmethod
    def req(cls,path,method="GET",payload=None,*,user=None,csrf=False,key=None,idem=None):
        headers={}
        if user:
            token,csrf_token=cls.sessions[user]
            headers['Cookie']='cg_session='+token
            if csrf:headers['X-Crystal-Guild-CSRF']=csrf_token
        if key:headers['X-Crystal-Guild-Key']=key
        if idem:headers['Idempotency-Key']=idem
        if payload is not None:headers['Content-Type']='application/json'
        request=urllib.request.Request(cls.base+path,data=json.dumps(payload).encode() if payload is not None else None,headers=headers,method=method)
        try:response=urllib.request.urlopen(request,timeout=12)
        except urllib.error.HTTPError as e:response=e
        with response as r:
            raw=r.read()
            if "application/json" in r.headers.get("Content-Type",""):
                result=json.loads(raw)
            else:result=raw
            return r.status,result,dict(r.headers)

    def test_01_actual_prebuilt_routes_and_card_artwork(self):
        for route in ("/","/players","/player/stagealice","/guide","/streamer"):
            status,html,headers=self.req(route)
            self.assertEqual(status,200,route)
            self.assertIn(b'<div id="root"',html,route)
            self.assertIn('text/html',headers['Content-Type'])
        for route in ("/card-hall/cards/QB001.webp","/card-hall/card-hall-snes.css","/guide-body.html"):
            status,blob,_=self.req(route)
            self.assertEqual(status,200,route)
            self.assertGreater(len(blob),50,route)
        status,health,_=self.req('/api/health')
        self.assertEqual(status,200)
        self.assertEqual(health['action_protocol_version'],ACTION_PROTOCOL_VERSION)
        self.assertTrue(health['portal_auth_configured'])

    def test_02_authenticated_routes_private_and_csrf_protected(self):
        self.assertEqual(self.req('/api/card-hall')[0],401)
        self.assertEqual(self.req('/api/card-hall/pvp')[0],401)
        status,auth,_=self.req('/api/auth/status',user='stagealice')
        self.assertEqual(status,200)
        self.assertTrue(auth['authenticated'])
        self.assertEqual(auth['player']['username'],'stagealice')
        self.assertEqual(auth['action_protocol_version'],ACTION_PROTOCOL_VERSION)
        self.assertNotIn('twitch_id',auth['twitch'])
        pending={'match_id':None,'revision':0,'action':{'kind':'start','mode':'tutorial'}}
        self.assertEqual(self.req('/api/card-hall','POST',pending,user='stagealice',idem='stage-start-0001')[0],403)
        self.assertEqual(self.req('/api/actions','POST',{'type':'PING','payload':{}},user='stagealice',idem='stage-ping-0001')[0],403)
        self.assertEqual(self.req('/api/sync/player','POST',player_snapshot())[0],401)

    def test_03_queens_blood_http_idempotency_and_player_isolation(self):
        status,first,_=self.req('/api/card-hall',user='stagealice')
        self.assertEqual(status,200)
        self.assertIsNone(first['match'])
        payload={'match_id':None,'revision':0,'action':{'kind':'start','mode':'tutorial','profile_revision':first['profile']['revision']}}
        status,started,_=self.req('/api/card-hall','POST',payload,user='stagealice',csrf=True,idem='stage-qb-start-0001')
        self.assertEqual(status,200)
        self.assertEqual(started['match']['mode'],'tutorial')
        status,replayed,_=self.req('/api/card-hall','POST',payload,user='stagealice',csrf=True,idem='stage-qb-start-0001')
        self.assertEqual(status,200)
        self.assertEqual(started['match']['id'],replayed['match']['id'])
        self.assertEqual(started['match']['revision'],replayed['match']['revision'])
        self.assertEqual(self.req('/api/card-hall',user='stagebob')[1]['match'],None)
        wrong={'match_id':None,'revision':0,'action':{'kind':'start','mode':'practice'}}
        self.assertEqual(self.req('/api/card-hall','POST',wrong,user='stagealice',csrf=True,idem='stage-qb-start-0001')[0],409)

    def test_04_bot_to_web_sync_action_relay(self):
        status,submit,_=self.req('/api/actions','POST',{'type':'PING','payload':{}},user='stagealice',csrf=True,idem='stage-relay-ping-0001')
        self.assertEqual(status,202)
        action_id=submit['action']['id']
        status,claim,_=self.req('/api/actions/claim','POST',{'protocol_version':ACTION_PROTOCOL_VERSION,'worker_id':'staging-worker-1','limit':4},key=KEY)
        self.assertEqual(status,200)
        matches=[a for a in claim['actions'] if a['id']==action_id]
        self.assertEqual(len(matches),1)
        action=matches[0]
        status,result,_=self.req('/api/actions/result','POST',{'protocol_version':ACTION_PROTOCOL_VERSION,'id':action_id,'lease_token':action['lease_token'],'ok':True,'message':'staging-ok','data':{'ping':True}},key=KEY)
        self.assertEqual(status,200)
        self.assertTrue(result['ok'])
        status,completed,_=self.req('/api/actions/'+action_id,user='stagealice')
        self.assertEqual(status,200)
        self.assertEqual(completed['action']['status'],'completed')
        self.assertEqual(completed['action']['result']['data']['ping'],True)
        self.assertEqual(self.req('/api/actions/'+action_id,user='stagebob')[0],404)

    def test_05_restart_keeps_login_card_hall_and_completed_action(self):
        # Create an independent second player's match and a completed queue item.
        initial=self.req('/api/card-hall',user='stagebob')[1]
        if initial['match'] is None:
            payload={'match_id':None,'revision':0,'action':{'kind':'start','mode':'practice','profile_revision':initial['profile']['revision']}}
            status,initial,_=self.req('/api/card-hall','POST',payload,user='stagebob',csrf=True,idem='stage-restart-match-0001')
            self.assertEqual(status,200)
        before_id=initial['match']['id']
        status,submit,_=self.req('/api/actions','POST',{'type':'PING','payload':{}},user='stagebob',csrf=True,idem='stage-restart-ping-0001')
        self.assertEqual(status,202)
        status,claim,_=self.req('/api/actions/claim','POST',{'protocol_version':ACTION_PROTOCOL_VERSION,'worker_id':'staging-restart-worker','limit':8},key=KEY)
        self.assertEqual(status,200)
        a=next(a for a in claim['actions'] if a['id']==submit['action']['id'])
        self.assertEqual(self.req('/api/actions/result','POST',{'protocol_version':ACTION_PROTOCOL_VERSION,'id':a['id'],'lease_token':a['lease_token'],'ok':True,'message':'done'},key=KEY)[0],200)
        self._stop()
        type(self).store=HostedPortalStore(self.database)
        self._start()
        status,auth,_=self.req('/api/auth/status',user='stagebob')
        self.assertEqual(status,200)
        self.assertTrue(auth['authenticated'])
        self.assertEqual(self.req('/api/card-hall',user='stagebob')[1]['match']['id'],before_id)
        status,actions,_=self.req('/api/actions',user='stagebob')
        self.assertEqual(status,200)
        self.assertTrue(any(a['status']=='completed' and a['id']==submit['action']['id'] for a in actions['actions']))

    def test_07_pvp_invitation_across_two_sessions(self):
        status,snapshot,_=self.req('/api/card-hall/pvp',user='stagealice')
        self.assertEqual(status,200)
        self.assertEqual(snapshot['matches'],[])
        invite={'match_id':None,'revision':0,'action':{'kind':'invite','username':'stagebob'}}
        status,_,_=self.req('/api/card-hall/pvp','POST',invite,user='stagealice',csrf=True,idem='stage-duel-invite-0001')
        self.assertEqual(status,200)
        bob=self.req('/api/card-hall/pvp',user='stagebob')[1]['matches']
        self.assertEqual(len(bob),1)
        self.assertEqual(bob[0]['phase'],'pending')
        accepted={'match_id':bob[0]['id'],'revision':bob[0]['revision'],'action':{'kind':'accept'}}
        status,_,_=self.req('/api/card-hall/pvp','POST',accepted,user='stagebob',csrf=True,idem='stage-duel-accept-0001')
        self.assertEqual(status,200)
        self.assertEqual(self.req('/api/card-hall/pvp',user='stagealice')[1]['matches'][0]['phase'],'mulligan')

    def test_06_browser_prebuilt_card_hall_and_first_turn(self):
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            self.skipTest('Playwright missing')
        with sync_playwright() as p:
            try:
                local_chromium=Path('/usr/bin/chromium')
                kwargs={'headless':True}
                if local_chromium.exists():
                    kwargs['executable_path']=str(local_chromium)
                    kwargs['args']=['--no-sandbox','--disable-dev-shm-usage']
                browser=p.chromium.launch(**kwargs)
            except Exception as e:self.skipTest(f'Chromium unavailable: {e}')
            errors=[]
            try:
                context=browser.new_context(viewport={'width':1365,'height':900})
                token,_=self.sessions['stagealice']
                context.add_cookies([{'name':'cg_session','value':token,'url':self.base,'httpOnly':True,'sameSite':'Lax'}])
                page=context.new_page()
                page.on('pageerror',lambda error: errors.append(str(error)))
                try:
                    response=page.goto(self.base+'/player/stagealice',wait_until='domcontentloaded',timeout=20000)
                except Exception as exc:
                    if 'ERR_BLOCKED_BY_ADMINISTRATOR' in str(exc):
                        self.skipTest('Local Chromium navigation is blocked by administrator policy')
                    raise
                self.assertEqual(response.status,200)
                page.get_by_role('tab',name='Card Hall').click(timeout=15000)
                hub=page.get_by_role('region',name='Card Hall')
                self.assertTrue(hub.is_visible(timeout=15000))
                blood=page.get_by_role('region',name='Queen’s Blood Card Hall')
                self.assertTrue(blood.is_visible(timeout=15000))
                self.assertTrue(blood.get_by_role('button',name='Play',exact=True).is_visible())
                if blood.get_by_role('button',name='Start guided tutorial').is_visible():
                    blood.get_by_role('button',name='Start guided tutorial').click(timeout=15000)
                self.assertTrue(blood.get_by_text('Guided opening',exact=False).is_visible(timeout=10000))
                blood.get_by_role('button',name='Keep hand and begin').click(timeout=15000)
                self.assertTrue(blood.get_by_role('heading',name='Your hand').is_visible(timeout=15000))
                # Verify app does not crash when the user navigates between games.
                hub.get_by_role('button',name='Triple Triad').click()
                self.assertTrue(page.get_by_role('region',name='Triple Triad').is_visible(timeout=15000))
                self.assertEqual(errors,[],f'Browser uncaught exceptions: {errors}')
            finally:browser.close()

if __name__=='__main__':unittest.main(verbosity=2)

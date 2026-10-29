import unittest,json,urllib.request,urllib.error
import test_portal_actions as fixtures
class PvPHTTPTests(unittest.TestCase):
 setUp=fixtures.PortalActionServerCase.setUp
 tearDown=fixtures.PortalActionServerCase.tearDown
 def request(self,body=None,cookie=True,csrf=True):
  headers={}
  if cookie: headers['Cookie']='cg_session='+self.session_token
  if body is not None:
   headers.update({'Content-Type':'application/json','Idempotency-Key':'http:invite000'})
   if csrf: headers['X-Crystal-Guild-CSRF']=self.csrf
  req=urllib.request.Request(self.base+'/api/card-hall/pvp',data=json.dumps(body).encode() if body is not None else None,headers=headers)
  try:
   with urllib.request.urlopen(req) as r:return r.status,json.load(r),r.headers
  except urllib.error.HTTPError as r:return r.code,json.load(r),r.headers
 def test_auth_csrf_offline_and_cache(self):
  self.assertEqual(self.request(cookie=False)[0],401)
  body={'match_id':None,'revision':0,'action':{'kind':'invite','username':'bob'}}
  self.assertEqual(self.request(body,csrf=False)[0],403)
  self.store.upsert_player(fixtures.snapshot_payload('bob','222'))
  status,payload,headers=self.request(body)
  self.assertEqual(status,200);self.assertIn('private',headers['Cache-Control']);self.assertIn('no-store',headers['Cache-Control'])
  self.assertEqual(payload['matches'][0]['opponent'],'bob');self.assertTrue(payload['play_enabled'])
  self.server.actions_enabled=False;self.assertEqual(self.request(body)[0],503)
  self.assertEqual(self.request()[0],200)

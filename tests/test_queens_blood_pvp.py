import tempfile, unittest, os
from crystal_guild.queens_blood_pvp import CorrespondenceStore, TURN_SECONDS, OPENING_SECONDS, INVITE_SECONDS
from crystal_guild.queens_blood import RuleError
from crystal_guild.queens_blood_store import MatchConflict
class PvPTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory(); self.path=os.path.join(self.tmp.name,'db'); self.now=1000; self.n=0; self.s=CorrespondenceStore(self.path,clock=lambda:self.now)
  with self.s._connect() as c:
   c.execute('CREATE TABLE portal_players(twitch_id TEXT,username TEXT)'); c.executemany('INSERT INTO portal_players VALUES (?,?)',[(str(i),x) for i,x in enumerate(['alice','bob','carol','dave','eve'])])
 def tearDown(self): self.tmp.cleanup()
 def item(self,p,id=None): return next(x for x in self.s.get(p)['matches'] if id is None or x['id']==id)
 def cmd(self,p,a,item=None,key=None):
  self.n+=1
  return self.s.submit(p,key or f'test:{self.n:08}',{'match_id':item['id'] if item else None,'revision':item['revision'] if item else 0,'action':a})
 def duel(self,opening=True):
  self.cmd('0',{'kind':'invite','username':'BOB'}); id=next(x['id'] for x in self.s.get('1')['matches'] if x['phase']=='pending'); self.cmd('1',{'kind':'accept'},self.item('1',id))
  if opening:
   for p in ('0','1'): self.cmd(p,{'kind':'mulligan','indices':[]},self.item(p,id))
  return id
 def test_privacy_restart_and_access(self):
  id=self.duel(); self.assertEqual(self.s.get('2')['matches'],[])
  self.assertEqual(CorrespondenceStore(self.path,clock=lambda:self.now).get('0'),self.s.get('0'))
  for p in ('0','1'):
   m=self.item(p,id)['match']; self.assertEqual(len(m['hand']),5)
   for k in ('hands','decks','mulligan_seed','players','card_snapshot'): self.assertNotIn(k,m)
  with self.assertRaises(RuleError): self.cmd('2',{'kind':'resign'},self.item('0',id))
 def test_mirrored_turns(self):
  id=self.duel()
  for _ in range(8):
   p='0' if self.item('0',id)['match']['your_turn'] else '1'; other='1' if p=='0' else '0'
   with self.assertRaises(RuleError): self.cmd(other,{'kind':'pass'},self.item(other,id))
   m=self.item(p,id); move=m['match']['legal'][0]; card=m['match']['hand'][move['hand']]
   self.cmd(p,{k:move[k] for k in ('kind','hand','row','col')},m)
   a=self.item(p,id)['match']; b=self.item(other,id)['match']
   self.assertEqual(a['board'][move['row']][move['col']]['card'],card); self.assertEqual(b['board'][move['row']][4-move['col']]['card'],card)
   self.assertEqual(a['scores']['totals'],list(reversed(b['scores']['totals'])))
 def test_openings_and_validation(self):
  id=self.duel(False); before=self.item('1',id)
  for indices in ([True],[0,0],[5],[-1],'bad'):
   with self.assertRaises(RuleError): self.cmd('1',{'kind':'mulligan','indices':indices},before)
  self.assertEqual(before,self.item('1',id)); self.cmd('1',{'kind':'mulligan','indices':[0,2]},before)
  self.assertEqual(self.item('0',id)['phase'],'mulligan')
  with self.assertRaises(RuleError): self.cmd('1',{'kind':'mulligan','indices':[]},self.item('1',id))
  self.cmd('0',{'kind':'mulligan','indices':[]},self.item('0',id)); self.assertEqual(self.item('0',id)['phase'],'play')
 def test_idempotency_conflicts(self):
  a={'kind':'invite','username':'bob'}; self.cmd('0',a,key='invite:00000'); self.cmd('0',a,key='invite:00000'); self.assertEqual(len(self.s.get('0')['matches']),1)
  with self.assertRaises(MatchConflict): self.cmd('0',{'kind':'invite','username':'carol'},key='invite:00000')
  old=self.item('1'); self.cmd('1',{'kind':'accept'},old)
  with self.assertRaises(MatchConflict): self.cmd('1',{'kind':'decline'},old)
 def test_deadlines(self):
  self.cmd('0',{'kind':'invite','username':'bob'}); self.now+=INVITE_SECONDS; self.assertEqual(self.item('0')['phase'],'expired')
  id=self.duel(False); self.now+=OPENING_SECONDS; self.assertEqual(self.item('1',id)['phase'],'expired')
  id=self.duel(); p='0' if self.item('0',id)['match']['your_turn'] else '1'; self.now+=TURN_SECONDS
  self.assertEqual(self.item(p,id)['match']['winner'],1); self.assertEqual(self.item(p,id)['match']['reason'],'timeout')
 def test_two_passes_no_rewards(self):
  id=self.duel()
  for _ in range(2):
   p='0' if self.item('0',id)['match']['your_turn'] else '1'; self.cmd(p,{'kind':'pass'},self.item(p,id))
  self.assertEqual(self.s.get('0')['stats']['draws'],1)
  with self.s._connect() as c:
   self.assertEqual(c.execute('SELECT count(*) FROM qb_profiles').fetchone()[0],0); self.assertEqual(c.execute('SELECT count(*) FROM qb_settlements').fetchone()[0],0)
 def test_invitation_rights_and_limits(self):
  for name in ('alice','missing','bob;'):
   with self.assertRaises(RuleError): self.cmd('0',{'kind':'invite','username':name})
  self.cmd('0',{'kind':'invite','username':'bob'})
  with self.assertRaises(RuleError): self.cmd('0',{'kind':'accept'},self.item('0'))
  with self.assertRaises(RuleError): self.cmd('1',{'kind':'invite','username':'alice'})
  self.cmd('1',{'kind':'decline'},self.item('1')); self.assertEqual(self.item('0')['phase'],'declined')
  for name in ('bob','carol','dave'): self.cmd('0',{'kind':'invite','username':name})
  with self.assertRaises(RuleError): self.cmd('0',{'kind':'invite','username':'eve'})
  pending=next(x for x in self.s.get('0')['matches'] if x['phase']=='pending'); self.cmd('0',{'kind':'cancel'},pending); self.assertEqual(self.item('0',pending['id'])['phase'],'cancelled')
 def test_resign_waiting(self):
  id=self.duel(); p='1' if self.item('0',id)['match']['your_turn'] else '0'; self.cmd(p,{'kind':'resign'},self.item(p,id)); self.assertEqual(self.item(p,id)['match']['winner'],1)

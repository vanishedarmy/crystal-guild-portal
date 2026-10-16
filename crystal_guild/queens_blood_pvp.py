"""Private, casual live and correspondence duels. No economy or collection rewards."""
import copy
import hashlib
import json
import random
import re
import time
import uuid
from .queens_blood import RuleError, new_match, apply_action, public_match, validate_deck
from .queens_blood_store import QueensBloodStore, MatchConflict

INVITE_SECONDS = 48 * 3600
TURN_SECONDS = 48 * 3600
OPENING_SECONDS = 24 * 3600
LIVE_INVITE_SECONDS = 10 * 60
LIVE_OPENING_SECONDS = 3 * 60
LIVE_TURN_SECONDS = 90


def clock_seconds(state, phase):
    if state.get('mode') == 'live':
        return {'pending': LIVE_INVITE_SECONDS, 'mulligan': LIVE_OPENING_SECONDS, 'play': LIVE_TURN_SECONDS}[phase]
    return {'pending': INVITE_SECONDS, 'mulligan': OPENING_SECONDS, 'play': TURN_SECONDS}[phase]


def perspective(state, side):
    result = copy.deepcopy(state)
    if side:
        result['hands'].reverse()
        result['decks'].reverse()
        result['board'] = [[dict(t, owner=None if t['owner'] is None else 1-t['owner']) for t in reversed(row)] for row in result['board']]
        result['events'] = [dict(e, col=4-e['col']) for e in result.get('events', [])]
        result['turn'] = 1-result['turn']
        if result['winner'] is not None: result['winner'] = 1-result['winner']
    result['opponent_name'] = state['players'][1-side]['username']
    result['deck_name'] = state['deck_names'][side]
    payload = public_match(result)
    payload.update(opening_confirmed=state['opening'][side], deadline=state['deadline'], your_turn=state['phase']=='play' and state['turn']==side)
    return payload


class CorrespondenceStore(QueensBloodStore):
    def __init__(self, database_path, clock=time.time):
        super().__init__(database_path)
        self.clock = clock
        with self._connect() as conn:
            conn.executescript('''CREATE TABLE IF NOT EXISTS qb_duels (id TEXT PRIMARY KEY, player0 TEXT NOT NULL, player1 TEXT NOT NULL, state_json TEXT NOT NULL, updated_at INTEGER NOT NULL);
            CREATE INDEX IF NOT EXISTS qb_duels_players ON qb_duels(player0,player1);
            CREATE TABLE IF NOT EXISTS qb_duel_requests (player_id TEXT NOT NULL, request_key TEXT NOT NULL, fingerprint TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY(player_id,request_key));''')

    def _rows(self, conn, player):
        return conn.execute('SELECT * FROM qb_duels WHERE player0=? OR player1=? ORDER BY updated_at DESC,rowid DESC', (player, player)).fetchall()

    def _save(self, conn, state):
        conn.execute('UPDATE qb_duels SET state_json=?,updated_at=? WHERE id=?', (json.dumps(state), int(self.clock()), state['id']))

    def _expire(self, conn, player):
        for row in self._rows(conn, player):
            s=json.loads(row['state_json'])
            if s['phase'] in ('pending','mulligan','play') and self.clock() >= s['deadline']:
                if s['phase']=='pending': s.update(phase='expired',reason='invite_expired')
                elif s['phase']=='mulligan': s.update(phase='expired',reason='opening_expired')
                else: s.update(phase='finished',reason='timeout',winner=1-s['turn'])
                s['revision']+=1
                self._save(conn,s)

    def _payload(self, conn, player):
        matches=[]
        stats={'wins':0,'losses':0,'draws':0}
        stats_by_mode={mode:dict(stats) for mode in ('live','correspondence')}
        for row in self._rows(conn,player):
            s=json.loads(row['state_json']); side=0 if row['player0']==player else 1
            mode=s.get('mode','correspondence')
            if s['phase']=='finished':
                outcome='draws' if s['winner'] is None else 'wins' if s['winner']==side else 'losses'
                stats[outcome]+=1
                stats_by_mode[mode][outcome]+=1
            if len(matches)<40 or s['phase'] in ('pending','mulligan','play'):
                matches.append({'id':s['id'],'revision':s['revision'],'phase':s['phase'],'mode':mode,'turn_seconds':clock_seconds(s,'play'),'opponent':s['players'][1-side]['username'],'incoming':side==1,'deadline':s['deadline'],'reason':s.get('reason'), 'match':perspective(s,side) if 'board' in s else None,'cards':list(s['card_snapshot'].values()) if 'card_snapshot' in s else []})
        return {'matches':matches,'stats':stats,'stats_by_mode':stats_by_mode,'server_now':int(self.clock())}

    def get(self, player):
        with self._connect() as conn:
            conn.execute('BEGIN IMMEDIATE'); self._expire(conn,player)
            return self._payload(conn,player)

    def submit(self, player, key, payload):
        if not isinstance(key,str) or not re.fullmatch(r'[A-Za-z0-9:_-]{8,128}',key): raise RuleError('A valid request key is required.')
        if not isinstance(payload,dict) or set(payload)!={'match_id','revision','action'} or type(payload['revision']) is not int or payload['revision']<0: raise RuleError('Invalid match request.')
        a=payload['action']
        if not isinstance(a,dict) or not isinstance(a.get('kind'),str): raise RuleError('Invalid action.')
        fingerprint=hashlib.sha256(json.dumps(payload,sort_keys=True).encode()).hexdigest()
        now=int(self.clock())
        with self._connect() as conn:
            conn.execute('BEGIN IMMEDIATE'); self._expire(conn,player)
            previous=conn.execute('SELECT fingerprint FROM qb_duel_requests WHERE player_id=? AND request_key=?',(player,key)).fetchone()
            if previous:
                if previous[0]!=fingerprint: raise MatchConflict('Request key was already used.')
                return self._payload(conn,player)
            kind=a['kind']
            if kind=='invite':
                if set(a) not in ({'kind','username'},{'kind','username','mode'}) or payload['match_id'] is not None or payload['revision']!=0 or not isinstance(a['username'],str) or not re.fullmatch(r'[A-Za-z0-9_]{1,25}',a['username']): raise RuleError('Enter an adventurer’s Twitch username.')
                mode=a.get('mode','correspondence')
                if not isinstance(mode,str) or mode not in ('live','correspondence'): raise RuleError('Choose live or correspondence play.')
                target=conn.execute('SELECT twitch_id,username FROM portal_players WHERE lower(username)=lower(?) AND twitch_id IS NOT NULL AND twitch_id<>?',(a['username'],'')).fetchone()
                me=conn.execute('SELECT username FROM portal_players WHERE twitch_id=?',(player,)).fetchone()
                if not target or not me: raise RuleError('That recruited adventurer is unavailable.')
                recipient=target['twitch_id']
                if recipient==player: raise RuleError('Choose another adventurer.')
                self._expire(conn,recipient)
                for pid in (player,recipient):
                    live=[json.loads(r['state_json']) for r in self._rows(conn,pid)]
                    if sum(s['phase']=='pending' for s in live)>=3: raise RuleError('A player already has three pending invitations.')
                    if sum(s['phase'] in ('mulligan','play') for s in live)>=3: raise RuleError('A player already has three active duels.')
                if any(r['player0'] in (player,recipient) and r['player1'] in (player,recipient) and json.loads(r['state_json'])['phase'] in ('pending','mulligan','play') for r in self._rows(conn,player)): raise RuleError('You already have an invitation or active duel with this player.')
                s={'id':uuid.uuid4().hex,'revision':0,'phase':'pending','mode':mode,'players':[{'id':player,'username':me[0]},{'id':recipient,'username':target['username']}],'reason':None}
                s['deadline']=now+clock_seconds(s,'pending')
                conn.execute('INSERT INTO qb_duels VALUES (?,?,?,?,?)',(s['id'],player,recipient,json.dumps(s),now))
            else:
                if not isinstance(payload['match_id'],str): raise RuleError('Choose a saved duel.')
                row=conn.execute('SELECT * FROM qb_duels WHERE id=? AND (player0=? OR player1=?)',(payload['match_id'],player,player)).fetchone()
                if not row: raise RuleError('Duel unavailable.')
                s=json.loads(row['state_json']); side=0 if row['player0']==player else 1
                if s['revision']!=payload['revision']: raise MatchConflict('This duel changed. Reload its latest saved turn.')
                if kind in ('accept','decline','cancel'):
                    if set(a)!={'kind'} or s['phase']!='pending' or side!=(0 if kind=='cancel' else 1): raise RuleError('This invitation action is unavailable.')
                    if kind=='accept':
                        for pid in (row['player0'],row['player1']):
                            if sum(json.loads(r['state_json'])['phase'] in ('mulligan','play') for r in self._rows(conn,pid))>=3: raise RuleError('A player already has three active duels.')
                        profiles=[self._profile(conn,p['id']) for p in s['players']]
                        decks=[p['decks'][p['active_deck']] for p in profiles]
                        for d,p in zip(decks,profiles): validate_deck(d['cards'],p['unlocked'])
                        fresh=new_match('practice',player_deck=decks[0]['cards'],opponent_deck=decks[1]['cards'])
                        fresh.update(id=s['id'],revision=s['revision']+1,mode=s.get('mode','correspondence'),players=s['players'],deck_names=[d['name'] for d in decks],opening=[False,False],turn=random.SystemRandom().randrange(2),deadline=now+clock_seconds(s,'mulligan'))
                        s=fresh
                    else: s.update(phase='declined' if kind=='decline' else 'cancelled',revision=s['revision']+1,reason=kind)
                elif s['phase'] in ('mulligan','play'):
                    if kind=='resign' and set(a)=={'kind'}:
                        s.update(phase='finished',winner=1-side,reason='resigned',revision=s['revision']+1)
                    elif s['phase']=='mulligan':
                        if s['opening'][side] or kind!='mulligan': raise RuleError('Wait for the other opening hand.')
                        trial=copy.deepcopy(s)
                        trial['hands'][0],trial['hands'][side]=trial['hands'][side],trial['hands'][0]
                        trial['decks'][0],trial['decks'][side]=trial['decks'][side],trial['decks'][0]
                        trial=apply_action(trial,0,a)
                        s['hands'][side]=trial['hands'][0]; s['decks'][side]=trial['decks'][0]
                        s['opening'][side]=True; s['revision']+=1
                        if all(s['opening']): s.update(phase='play',deadline=now+clock_seconds(s,'play'))
                    else:
                        move=dict(a)
                        if kind=='play' and side and type(move.get('col')) is int: move['col']=4-move['col']
                        s=apply_action(s,side,move)
                        s['log'][-1]=s['log'][-1].replace('You',s['players'][0]['username']).replace('Moogle Dealer',s['players'][1]['username'])
                        s['deadline']=now+clock_seconds(s,'play')
                else: raise RuleError('This duel is closed.')
                self._save(conn,s)
            conn.execute('INSERT INTO qb_duel_requests VALUES (?,?,?,?)',(player,key,fingerprint,now))
            conn.execute('DELETE FROM qb_duel_requests WHERE player_id=? AND request_key NOT IN (SELECT request_key FROM qb_duel_requests WHERE player_id=? ORDER BY created_at DESC,rowid DESC LIMIT 128)',(player,player))
            return self._payload(conn,player)

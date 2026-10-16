"""Hosted QB matches, collections, decks and atomic first-win unlocks."""
from contextlib import contextmanager
import copy, hashlib, json, re, sqlite3, time, zlib
from .queens_blood import RULES_VERSION, RuleError, ai_move, apply_action, catalog_for, new_match, public_match, validate_deck
from .queens_blood_catalog import CATALOG, COLLECTION, OPPONENTS, STARTER

class MatchConflict(RuleError):
    pass

def initial_profile():
    return {"revision": 0, "unlocked": sorted(set(STARTER)), "victories": {}, "active_deck": 0,
        "decks": [{"name": "Frontier" if i == 0 else f"Deck {i+1}", "cards": list(STARTER)} for i in range(3)],
        "history": [], "stats": {"played": 0, "wins": 0, "losses": 0, "draws": 0}}

class QueensBloodStore:
    def __init__(self, database_path):
        self.database_path = str(database_path)
        with self._connect() as conn:
            conn.executescript('''
                CREATE TABLE IF NOT EXISTS qb_matches (player_id TEXT PRIMARY KEY, state_json TEXT NOT NULL, updated_at INTEGER NOT NULL);
                CREATE TABLE IF NOT EXISTS qb_requests (player_id TEXT NOT NULL, request_key TEXT NOT NULL, fingerprint TEXT NOT NULL, response_json TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY(player_id,request_key));
                CREATE TABLE IF NOT EXISTS qb_profiles (player_id TEXT PRIMARY KEY, profile_json TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS qb_settlements (match_id TEXT PRIMARY KEY, player_id TEXT NOT NULL, outcome TEXT NOT NULL);
            ''')
    @contextmanager
    def _connect(self):
        conn = sqlite3.connect(self.database_path, timeout=10); conn.row_factory = sqlite3.Row
        try:
            with conn: yield conn
        finally: conn.close()
    @staticmethod
    def _state(conn, player_id):
        row = conn.execute('SELECT state_json FROM qb_matches WHERE player_id=?', (player_id,)).fetchone()
        return json.loads(row[0]) if row else None
    @staticmethod
    def _profile(conn, player_id):
        row = conn.execute('SELECT profile_json FROM qb_profiles WHERE player_id=?', (player_id,)).fetchone()
        return json.loads(row[0]) if row else initial_profile()
    @staticmethod
    def _payload(state, profile):
        opponents=[]; previous_cleared=True
        for o in OPPONENTS.values():
            defeated=profile['victories'].get(o['id'],0)>0
            opponents.append({k:copy.deepcopy(o[k]) for k in ('id','name','lesson','rewards')} | {'unlocked':previous_cleared,'defeated':defeated})
            previous_cleared=previous_cleared and defeated
        sources={id:o['name'] for o in OPPONENTS.values() for id in o['rewards']}
        cards=[{**copy.deepcopy(c),'owned':id in profile['unlocked'],'source':'Starter collection' if id in STARTER else sources.get(id,'Advanced rules batch')} for id,c in COLLECTION.items()]
        return json.loads(json.dumps({'available':True,'rules_version':RULES_VERSION,'prototype':False,'catalog_revision':CATALOG['revision'],'cards':cards,
            'match_cards':list(catalog_for(state).values()) if state else [],'match':public_match(state),'profile':profile,'opponents':opponents,'presets':CATALOG['presets']}))
    def get(self, player_id):
        with self._connect() as conn: return self._payload(self._state(conn,player_id),self._profile(conn,player_id))
    @staticmethod
    def _settle(conn, player_id, state, profile):
        if not state or state['phase']!='finished' or state['mode']!='circuit': return
        opponent=OPPONENTS[state['opponent_id']]
        outcome='draw' if state['winner'] is None else 'win' if state['winner']==0 else 'loss'
        inserted=conn.execute('INSERT OR IGNORE INTO qb_settlements VALUES (?,?,?)',(state['id'],player_id,outcome))
        if not inserted.rowcount: return
        rewards=[]
        if outcome=='win':
            previous=profile['victories'].get(opponent['id'],0); profile['victories'][opponent['id']]=previous+1
            if previous==0:
                rewards=list(state.get('opponent_rewards',opponent['rewards'])); profile['unlocked']=sorted(set(profile['unlocked'])|set(rewards))
        profile['stats']['played']+=1; profile['stats'][{'win':'wins','loss':'losses','draw':'draws'}[outcome]]+=1
        profile['history']=(profile['history']+[{'match_id':state['id'],'opponent':opponent['name'],'outcome':outcome,'rewards':rewards,'finished_at':int(time.time())}])[-20:]
        profile['revision']+=1; state['reward_cards']=rewards
    def submit(self, player_id, request_key, payload):
        if not isinstance(request_key,str) or not re.fullmatch(r'[A-Za-z0-9_.:-]{8,128}',request_key): raise RuleError('A valid request key is required.')
        if not isinstance(payload,dict) or set(payload)!={'match_id','revision','action'}: raise RuleError('Expected match_id, revision, and action.')
        if type(payload['revision']) is not int or payload['revision']<0: raise RuleError('Invalid match revision.')
        action=payload['action']
        if not isinstance(action,dict) or not isinstance(action.get('kind'),str): raise RuleError('Invalid action.')
        fingerprint=hashlib.sha256(json.dumps(payload,sort_keys=True).encode()).hexdigest()
        with self._connect() as conn:
            conn.execute('BEGIN IMMEDIATE')
            prior=conn.execute('SELECT * FROM qb_requests WHERE player_id=? AND request_key=?',(player_id,request_key)).fetchone()
            if prior:
                if prior['fingerprint']!=fingerprint: raise MatchConflict('This request key was already used for a different move.')
                encoded=prior['response_json']; return json.loads(zlib.decompress(encoded) if isinstance(encoded,bytes) else encoded)
            state=self._state(conn,player_id); profile=self._profile(conn,player_id)
            if payload['match_id']!=(state['id'] if state else None) or payload['revision']!=(state['revision'] if state else 0): raise MatchConflict('This match changed. Refresh it before moving.')
            kind=action['kind']
            if kind in {'save_deck','activate_deck'}:
                fields={'kind','slot','profile_revision'}|({'name','cards'} if kind=='save_deck' else set())
                if set(action)!=fields: raise RuleError('Invalid deck fields.')
                if type(action['profile_revision']) is not int or action['profile_revision']!=profile['revision']: raise MatchConflict('Your collection or decks changed. Reload before saving.')
                slot=action['slot']
                if type(slot) is not int or not 0<=slot<3: raise RuleError('Choose one of three deck slots.')
                if kind=='save_deck':
                    name=action['name']
                    if not isinstance(name,str) or not 1<=len(name.strip())<=32 or any(ord(c)<32 for c in name): raise RuleError('Deck names require 1–32 printable characters.')
                    validate_deck(action['cards'],profile['unlocked']); profile['decks'][slot]={'name':name.strip(),'cards':list(action['cards'])}
                else: profile['active_deck']=slot
                profile['revision']+=1
            elif kind=='start':
                mode=action.get('mode'); expected={'kind','mode','opponent'} if mode=='circuit' else {'kind','mode'}
                if 'profile_revision' in action:
                    expected.add('profile_revision')
                    if type(action['profile_revision']) is not int or action['profile_revision']!=profile['revision']: raise MatchConflict('Your active deck changed. Reload before starting a match.')
                if set(action)!=expected: raise RuleError('Choose a valid match mode and opponent.')
                if state and state['phase']!='finished': raise MatchConflict('Finish or resign your current match before starting another.')
                deck=profile['decks'][profile['active_deck']]; validate_deck(deck['cards'],profile['unlocked']); opponent=None
                if mode=='circuit':
                    id=action['opponent']
                    if not isinstance(id,str) or id not in OPPONENTS: raise RuleError('Unknown solo opponent.')
                    rows=self._payload(None,profile)['opponents']
                    if not next(o['unlocked'] for o in rows if o['id']==id): raise RuleError('Defeat the previous solo opponents first.')
                    opponent=OPPONENTS[id]
                state=new_match(mode,player_deck=None if mode=='tutorial' else deck['cards'],opponent_deck=opponent['deck'] if opponent else None,opponent=opponent,deck_name='Tutorial Frontier' if mode=='tutorial' else deck['name'])
            else:
                if not state: raise RuleError('Start a match first.')
                state=apply_action(state,0,action)
                if state['phase']=='play' and state['turn']==1: state=apply_action(state,1,ai_move(state))
                self._settle(conn,player_id,state,profile)
            response=self._payload(state,profile); now=int(time.time())
            if state: conn.execute('INSERT INTO qb_matches VALUES (?,?,?) ON CONFLICT(player_id) DO UPDATE SET state_json=excluded.state_json,updated_at=excluded.updated_at',(player_id,json.dumps(state),now))
            conn.execute('INSERT INTO qb_profiles VALUES (?,?) ON CONFLICT(player_id) DO UPDATE SET profile_json=excluded.profile_json',(player_id,json.dumps(profile)))
            conn.execute('INSERT INTO qb_requests VALUES (?,?,?,?,?)',(player_id,request_key,fingerprint,zlib.compress(json.dumps(response).encode()),now))
            conn.execute('DELETE FROM qb_requests WHERE player_id=? AND rowid NOT IN (SELECT rowid FROM qb_requests WHERE player_id=? ORDER BY rowid DESC LIMIT 64)',(player_id,player_id))
            return response

from flask import Flask
from flask import jsonify
from flask import request
from flask.ext.cors import CORS
import chess, minimax, evaluator

app = Flask(__name__)
CORS(app)

game = chess.Board()

@app.route('/legal_moves')
def legal_moves():
	moves = game.legal_moves
	l = list()
	if(len(moves) > 0):
		for m in moves:
			l.append(m.uci())
		d = dict(enumerate(l))
		d['kingside'] = game.has_kingside_castling_rights(game.turn)
		d['queenside'] = game.has_queenside_castling_rights(game.turn)
		d['len'] = len(l)
		return jsonify(d)
	else:	
		return 'NO LEGAL MOVES'

@app.route('/calculate_move/<d>')
def calculate_move(d):
	d = int(d)
	value, move = minimax.minimax_alpha_beta(game, 4, True, evaluator.evaluate_advanced)
	game.push(move)
	print(game)
	return move.uci()

@app.route('/move/<m>')
def move(m):
	m = str(m)
	move = chess.Move.from_uci(m)
	r = dict()
	r['ep'] = game.is_en_passant(move)
	r['epSquare'] = game.ep_square
	r['kingside'] = game.is_kingside_castling(move)
	r['queenside'] = game.is_queenside_castling(move)
		
	game.push(chess.Move.from_uci(m))

	r['checkmate'] = game.is_checkmate()
	r['stalemate'] = game.is_stalemate()
	r['insufficientMaterial'] = game.is_insufficient_material()
	r['threefoldRepitition'] = game.can_claim_threefold_repetition()
	print game
	return jsonify(r)

@app.route('/undo',methods=['POST'])
def undo():
	if request.method == 'POST':
		if len(game.move_stack) > 0:
			game.pop()
			print game
	return 'Ok'

@app.route('/init',methods=['POST'])
def init():
	if request.method == 'POST':
		game.reset()
		return 'ok'

if __name__ == "__main__":
    app.run('0.0.0.0',debug=True)

import chess
import minimax
import sys
import copy
import evaluator

def main():
    game = chess.Board()
    isWhiteTurn = True
    while not game.is_game_over():
        print
        print game
        print
        if isWhiteTurn:
            print_legal_moves(game)
            print
            
            uci = ''
            while len(uci) < 1:
                try:
                    uci = (str)(raw_input('Choose your move: '))
                    move = chess.Move.from_uci(uci)
                    if move not in game.legal_moves:
                        raise ValueError
                    game.push(move)
                except ValueError:
                    print 'Invalid Move!'
                    uci = ''
            isWhiteTurn = False
        else:
            print 'CPU is thinking!'
            move = minimax.alphabeta_stack_sorted(copy.deepcopy(game),4,-sys.maxsize,sys.maxsize,False,evaluator.evaluate_advanced)[0]
            game.push(move)
            isWhiteTurn = True
        
def print_legal_moves(game):
    moves = []
    for move in game.legal_moves:
        moves.append(chess.Move.uci(move))
    moves.sort()
    for move in moves:
        print move,

if __name__ == '__main__':
    main()
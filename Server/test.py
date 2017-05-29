import chess
import minimax
import evaluator
import utility
import sys
import copy

def main():
    board = chess.Board()
    mvs = []
    print minimax.alphabeta(mvs,5,-sys.maxsize,sys.maxsize,True,evaluator.evaluate_advanced)

if __name__ == '__main__':
    main()
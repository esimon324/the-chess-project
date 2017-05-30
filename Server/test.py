import chess
import minimax
import evaluator
import sys
import time

def main():
    mvs = []
    board = chess.Board()
    start = time.time()
    print minimax.alphabeta_stack(board,6,-sys.maxsize,sys.maxsize,True,evaluator.evaluate_advanced)
    end = time.time()
    print 'Time Elapsed:',(end-start)
    
    start = time.time()
    print minimax.alphabeta_stack_sorted(board,6,-sys.maxsize,sys.maxsize,True,evaluator.evaluate_advanced)
    end = time.time()
    print 'Time Elapsed:',(end-start)
    # for depth in range(1,5):
        # print 'Testing minimax implementations with depth',depth
        # '''
        # Stack Representation
        # '''
        # # minimax with stack representation
        # print 'minimax with stack'
        # start = time.time()
        # print minimax.minimax_stack(board,depth,True,evaluator.evaluate_advanced)
        # end = time.time()
        # print 'Time Elapsed:',(end-start)
        
        # # minimax with stack representation and children explored in evaluated sorted order
        # print 'minimax with stack representation and sorted children'
        # start = time.time()
        # print minimax.minimax_stack_sorted(board,depth,True,evaluator.evaluate_advanced)
        # end = time.time()    
        # print 'Time Elapsed:',(end-start)
        
        # # alphabeta with stack representation
        # print 'alphabeta with stack representation'
        # start = time.time()
        # print minimax.alphabeta_stack(board,depth,-sys.maxsize,sys.maxsize,True,evaluator.evaluate_advanced)
        # end = time.time()    
        # print 'Time Elapsed:',(end-start)
        
        # # alphabeta with stack representation and children explored in evaluated sorted order
        # print 'alphabeta with stack representation and sorted children'
        # start = time.time()
        # print minimax.alphabeta_stack_sorted(board,depth,-sys.maxsize,sys.maxsize,True,evaluator.evaluate_advanced)
        # end = time.time()    
        # print 'Time Elapsed:',(end-start)
        
        # '''
        # Moves List Representation
        # '''
        # # minimax with moves list representation
        # print 'minimax with moves list representation'
        # start = time.time()
        # print minimax.minimax_moves_list(mvs,depth,True,evaluator.evaluate_advanced)
        # end = time.time()    
        # print 'Time Elapsed:',(end-start)
        
        # # minimax with moves list representation and children explored in evaluated sorted order
        # print 'minimax with moves list representation and sorted children'
        # start = time.time()
        # print minimax.minimax_moves_list_sorted(mvs,depth,True,evaluator.evaluate_advanced)
        # end = time.time()
        # print 'Time Elapsed:',(end-start)
        
        # # alphabeta with moves list representation
        # print 'alphabeta with moves list representation'
        # start = time.time()
        # print minimax.alphabeta_moves_list(mvs,depth,-sys.maxsize,sys.maxsize,True,evaluator.evaluate_advanced)
        # end = time.time()    
        # print 'Time Elapsed:',(end-start)
        
        # # alphabeta with moves list representation and children explored in evaluated sorted order
        # print 'alphabeta with moves list representation and sorted children'
        # start = time.time()
        # print minimax.alphabeta_moves_list_sorted(mvs,depth,-sys.maxsize,sys.maxsize,True,evaluator.evaluate_advanced)
        # end = time.time()
        # print 'Time Elapsed:',(end-start)
        
        # print ''

if __name__ == '__main__':
    main()
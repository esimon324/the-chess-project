import chess, sys, copy, time
import utility as util
import evaluator

'''
Stack Representation
'''
# minimax algorithm with stack representation
def minimax_stack(board,depth,isMax,eval):
    if depth == 0 or len(board.legal_moves) == 0:
        return board.peek(),eval(board)      
    if isMax:
        val = -sys.maxsize
        move = {}
        for mv in board.legal_moves:
            board.push(mv)
            mv_val = minimax_stack(board,depth-1,False,eval)[1]
            board.pop()
            if mv_val > val:
                val = mv_val
                move = mv
        return move,val
    else:
        val = sys.maxsize
        move = {}
        for mv in board.legal_moves:
            board.push(mv)
            mv_val = minimax_stack(board,depth-1,True,eval)[1]
            board.pop()
            if mv_val < val:
                val = mv_val
                move = mv
        return move,val
        
# minimax with stack representation and children considered in evaluated sorted order                                        
def minimax_stack_sorted(board,depth,isMax,eval):    
    if depth == 0 or len(board.legal_moves) == 0:
        return board.peek(),eval(board)       
    # maximizing node
    if isMax:
        # create list of possible moves from best to worst based on eval function
        candidates = util.evaluate_sort(board,evaluator.evaluate_advanced,rev=True)   
        val = -sys.maxsize # initialize max value to -infinity
        move = candidates[0] # choose best move first based on lazy eval
        for mv in candidates:
            # make new move
            board.push(mv)
            # evaluate move
            mv_val = minimax_stack_sorted(board,depth-1,False,eval)[1]
            # pop move off stack
            board.pop()
            # determine new best move
            if mv_val > val:
                val = mv_val
                move = mv                
        return move,val
    # minimizing node
    else:
        # create list of possible moves sorted by simple eval
        candidates = util.evaluate_sort(board,evaluator.evaluate_advanced)      
        val = sys.maxsize # initialize max value to -infinity
        move = candidates[0] # choose best move first based on lazy eval
        for mv in candidates:
            # make move
            board.push(mv)          
            # evaluate move
            mv_val = minimax_stack_sorted(board,depth-1,True,eval)[1]           
            # pop move off stack
            board.pop()       
            # determine new best move
            if mv_val < val:
                val = mv_val
                move = mv                          
        return move,val
        
# storing one board and pushing/popping moves                                        
def alphabeta_stack(board,depth,alpha,beta,isMax,eval):    
    if depth == 0 or len(board.legal_moves) == 0:
        return board.peek(),eval(board)        
    # maximizing node
    if isMax:
        val = -sys.maxsize # initialize max value to -infinity
        move = {}
        for mv in board.legal_moves:
            # make new move
            board.push(mv)            
            # evaluate move
            mv_val = alphabeta_stack(board,depth-1,alpha,beta,False,eval)[1]            
            # pop move off stack
            board.pop()         
            # determine new best move
            if mv_val > val:
                val = mv_val
                move = mv          
            # set alpha value if new move is better
            alpha = max(alpha,val)            
            # check for pruning opportunity
            if beta < alpha:
                break             
        return move,val
    # minimizing node
    else:
        val = sys.maxsize # initialize max value to -infinity
        move = {}
        for mv in board.legal_moves:
            # make move
            board.push(mv)  
            # evaluate move
            mv_val = alphabeta_stack(board,depth-1,alpha,beta,True,eval)[1]
            # pop move off stack
            board.pop()
            # determine new best move
            if mv_val < val:
                val = mv_val
                move = mv
            # set alpha value if new move is better
            beta = min(beta,val)
            # check for pruning opportunity
            if beta < alpha:
                break
        return move,val

# storing one board and pushing/popping moves                                        
def alphabeta_stack_sorted(board,depth,alpha,beta,isMax,eval):    
    if depth == 0 or len(board.legal_moves) == 0:
        return board.peek(),eval(board)       
    # maximizing node
    if isMax:
        # create list of possible moves from best to worst based on eval function
        candidates = util.evaluate_sort(board,evaluator.evaluate_advanced,rev=True)        
        val = -sys.maxsize # initialize max value to -infinity
        move = candidates[0] # choose best move first based on lazy eval
        for mv in candidates:
            # make new move
            board.push(mv)            
            # evaluate move
            mv_val = alphabeta_stack_sorted(board,depth-1,alpha,beta,False,eval)[1]            
            # pop move off stack
            board.pop()            
            # determine new best move
            if mv_val > val:
                val = mv_val
                move = mv           
            # set alpha value if new move is better
            alpha = max(alpha,val)            
            # check for pruning opportunity
            if beta < alpha:
                break                
        return move,val
    # minimizing node
    else:
        # create list of possible moves sorted by simple eval
        candidates = util.evaluate_sort(board,evaluator.evaluate_advanced)
        val = sys.maxsize # initialize max value to -infinity
        move = candidates[0] # choose best move first based on lazy eval
        for mv in candidates:
            # make move
            board.push(mv)           
            # evaluate move
            mv_val = alphabeta_stack_sorted(board,depth-1,alpha,beta,True,eval)[1]
            # pop move off stack
            board.pop()
            # determine new best move
            if mv_val < val:
                val = mv_val
                move = mv
            # set alpha value if new move is better
            beta = min(beta,val)
            # check for pruning opportunity
            if beta < alpha:
                break
        return move,val

'''
Moves List Representation
''' 
# storing board as a list of moves                                        
def minimax_moves_list(moves,depth,isMax,eval):
    board = util.moves_to_board(moves)   
    if depth == 0 or len(board.legal_moves) == 0:
        return moves[-1],eval(util.moves_to_board(moves))       
    # maximizing node
    if isMax:
        val = -sys.maxsize # initialize max value to -infinity
        move = {}
        for mv in board.legal_moves:
            # add new move to list
            next_moves = list(moves)
            next_moves.append(mv)   
            # evaluate move
            mv_val = minimax_moves_list(next_moves,depth-1,False,eval)[1]            
            # determine new best move
            if mv_val > val:
                val = mv_val
                move = mv                           
        return move,val
    # minimizing node
    else:        
        val = sys.maxsize # initialize max value to -infinity
        move = {}
        for mv in board.legal_moves:
            # add new move to list
            next_moves = list(moves)
            next_moves.append(mv)            
            # evaluate move
            mv_val = minimax_moves_list(next_moves,depth-1,True,eval)[1]           
            # determine new best move
            if mv_val < val:
                val = mv_val
                move = mv                         
        return move,val

# minimax with list of moves representation and considering children in evaluated sorted order                                  
def minimax_moves_list_sorted(moves,depth,isMax,eval):
    board = util.moves_to_board(moves)   
    if depth == 0 or len(board.legal_moves) == 0:
        return moves[-1],eval(util.moves_to_board(moves))        
    # maximizing node
    if isMax:
        # create list of possible moves from best to worst based on eval function
        candidates = util.evaluate_sort(board,evaluator.evaluate_advanced,rev=True)       
        val = -sys.maxsize # initialize max value to -infinity
        move = candidates[0] # choose best move first based on lazy eval
        for mv in candidates:
            # add new move to list
            next_moves = (list(moves))
            next_moves.append(mv)            
            # evaluate move
            mv_val = minimax_moves_list_sorted(next_moves,depth-1,False,eval)[1]           
            # determine new best move
            if mv_val > val:
                val = mv_val
                move = mv           
        return move,val
    # minimizing node
    else:
        # create list of possible moves sorted by simple eval
        candidates = util.evaluate_sort(board,evaluator.evaluate_naive)        
        val = sys.maxsize # initialize max value to -infinity
        move = candidates[0] # choose best move first based on lazy eval
        for mv in candidates:
            # add new move to list
            next_moves = list(moves)
            next_moves.append(mv)          
            # evaluate move
            mv_val = minimax_moves_list_sorted(next_moves,depth-1,True,eval)[1]            
            # determine new best move
            if mv_val < val:
                val = mv_val
                move = mv
        return move,val

# storing board as a list of moves                                        
def alphabeta_moves_list(moves,depth,alpha,beta,isMax,eval):
    board = util.moves_to_board(moves)
    if depth == 0 or len(board.legal_moves) == 0:
        return moves[-1],eval(util.moves_to_board(moves))
    # maximizing node
    if isMax:
        val = -sys.maxsize # initialize max value to -infinity
        move = {}
        for mv in board.legal_moves:
            # add new move to list
            next_moves = list(moves)
            next_moves.append(mv)
            # evaluate move
            mv_val = alphabeta_moves_list(next_moves,depth-1,alpha,beta,False,eval)[1]
            # determine new best move
            if mv_val > val:
                val = mv_val
                move = mv
            # set alpha value if new move is better
            alpha = max(alpha,val)
            # check for pruning opportunity
            if beta < alpha:
                break
        return move,val
    # minimizing node
    else:        
        val = sys.maxsize # initialize max value to -infinity
        move = {}
        for mv in board.legal_moves:
            # add new move to list
            next_moves = list(moves)
            next_moves.append(mv)
            # evaluate move
            mv_val = alphabeta_moves_list(next_moves,depth-1,alpha,beta,True,eval)[1]
            # determine new best move
            if mv_val < val:
                val = mv_val
                move = mv     
            # set alpha value if new move is better
            beta = min(beta,val)
            # check for pruning opportunity
            if beta < alpha:
                break
        return move,val
                                            
# storing board as a list of moves and considering children in evaluated sorted order                                  
def alphabeta_moves_list_sorted(moves,depth,alpha,beta,isMax,eval):
    board = util.moves_to_board(moves)
    if depth == 0 or len(board.legal_moves) == 0:
        return moves[-1],eval(util.moves_to_board(moves))
    # maximizing node
    if isMax:
        # create list of possible moves from best to worst based on eval function
        candidates = util.evaluate_sort(board,evaluator.evaluate_advanced,rev=True)
        val = -sys.maxsize # initialize max value to -infinity
        move = candidates[0] # choose best move first based on lazy eval
        for mv in candidates:
            # add new move to list
            next_moves = (list(moves))
            next_moves.append(mv)
            # evaluate move
            mv_val = alphabeta_moves_list_sorted(next_moves,depth-1,alpha,beta,False,eval)[1]
            # determine new best move
            if mv_val > val:
                val = mv_val
                move = mv
            # set alpha value if new move is better
            alpha = max(alpha,val)
            # check for pruning opportunity
            if beta < alpha:
                break
        return move,val
    # minimizing node
    else:
        # create list of possible moves sorted by simple eval
        candidates = util.evaluate_sort(board,evaluator.evaluate_naive)
        val = sys.maxsize # initialize max value to -infinity
        move = candidates[0] # choose best move first based on lazy eval
        for mv in candidates:
            # add new move to list
            next_moves = list(moves)
            next_moves.append(mv)
            # evaluate move
            mv_val = alphabeta_moves_list_sorted(next_moves,depth-1,alpha,beta,True,eval)[1]
            # determine new best move
            if mv_val < val:
                val = mv_val
                move = mv
            # set alpha value if new move is better
            beta = min(beta,val)
            # check for pruning opportunity
            if beta < alpha:
                break
        return move,val

'''
Old Algorithms
'''        
def minimax_alpha_beta(board, depth, isMax, eval_function):
    alpha = -sys.maxsize
    beta = sys.maxsize
    return minimax_alpha_beta_internals(board, None, depth, isMax,
                                        eval_function, alpha, beta)
        
def minimax_alpha_beta_internals(board, move, depth, isMax, eval_function, alpha, beta):
    if depth > 0:
        if isMax:
            best_value, best_move = (sys.maxsize*-1,None)
        else:
            best_value, best_move = (sys.maxsize,None)
        for legal_move in board.legal_moves:
            if alpha < beta:
                board_cpy = copy.deepcopy(board)
                board_cpy.push(legal_move)
                next_value = minimax_alpha_beta_internals(board_cpy,legal_move,
                                                          depth-1,not isMax,
                                                          eval_function,alpha,beta)[0]
                if isMax:
                    if next_value > best_value:
                        best_value, best_move = next_value, legal_move
                    if next_value > alpha:
                        alpha = next_value
                else:
                    if next_value < best_value:
                        best_value, best_move = next_value, legal_move
                    if next_value < beta:
                        beta = next_value
        return best_value, best_move
    else:
        return eval_function(board), move
        
def minimax(board, move, depth, isMax, eval_function):
    if depth > 0:
        if isMax:
            best_value, best_move = (sys.maxsize*-1,None)
        else:
            best_value, best_move = (sys.maxsize,None)
        for legal_move in board.legal_moves:
            board_cpy = copy.deepcopy(board)
            board_cpy.push(legal_move)
            next_value = minimax(board_cpy,legal_move,depth-1,
                                 not isMax, eval_function)[0]
            if isMax:
                if next_value > best_value:
                    best_value, best_move = next_value, legal_move
            else:
                if next_value < best_value:
                    best_value, best_move = next_value, legal_move
        return best_value, best_move
    else:
        return eval_function(board), move

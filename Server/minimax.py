import chess, sys, copy, time
import utility as util
import evaluator


# def minimax_alpha_beta_2(board, depth, isMax):
#     alpha = -sys.maxsize
#     beta = sys.maxsize
#     return minimax_alpha_beta_internals_2(board, None, depth, isMax, alpha, beta)

# def minimax_alpha_beta_internals_2(board, move, depth, isMax, alpha, beta):
#     if depth > 0:
#         if isMax:
#             best_value, best_move = (sys.maxsize*-1,None)
#         else:
#             best_value, best_move = (sys.maxsize,None)
#         for legal_move in board.legal_moves:
#             if alpha < beta:
#                 board_cpy = copy.deepcopy(board)
#                 board_cpy.push(legal_move)
#                 next_value = minimax_alpha_beta_internals_2(board_cpy,legal_move,depth-1,not isMax,alpha,beta)[0]
#                 if isMax:
#                     if next_value > best_value:
#                         best_value, best_move = next_value, legal_move
#                     if next_value > alpha:
#                         alpha = next_value
#                 else:
#                     if next_value < best_value:
#                         best_value, best_move = next_value, legal_move
#                     if next_value < beta:
#                         beta = next_value
#         return best_value, best_move
#     else:
#         return evaluator.evaluate2(board), move


'''
Runner for Minimax algorithm with Alpha-Beta pruning
calls internal algorithm and simplifies parameters
'''
def minimax_alpha_beta(board, depth, isMax, eval_function):
    alpha = -sys.maxsize
    beta = sys.maxsize
    return minimax_alpha_beta_internals(board, None, depth, isMax,
                                        eval_function, alpha, beta)
                                            
# storing board as a list of moves                                        
def alphabeta(moves,depth,alpha,beta,isMax,eval):
    board = util.moves_to_board(moves)
    legal_moves = list(board.legal_moves)
    
    if depth == 0 or len(legal_moves) == 0:
        return moves[-1],eval(util.moves_to_board(moves))
        
    # maximizing node
    if isMax:
        # create list of possible moves from best to worst based on eval function
        candidates = util.evaluate_sort(board,legal_moves,evaluator.evaluate_advanced)
        
        val = -sys.maxsize # initialize max value to -infinity
        move = candidates[0] # choose best move first based on lazy eval
        for mv in candidates:
            # add new move to list
            next_moves = (list(moves))
            next_moves.append(mv)
            
            # evaluate move
            mv_val = alphabeta(next_moves,depth-1,alpha,beta,False,eval)[1]
            
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
        candidates = util.evaluate_sort(board,legal_moves,evaluator.evaluate_naive,rev=True)
        
        val = sys.maxsize # initialize max value to -infinity
        move = candidates[0] # choose best move first based on lazy eval
        for mv in candidates:
            # add new move to list
            next_moves = list(moves)
            next_moves.append(mv)
            
            # evaluate move
            mv_val = alphabeta(next_moves,depth-1,alpha,beta,True,eval)[1]
            
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
